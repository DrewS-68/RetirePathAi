import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Database, MapPin } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

interface ParsedRow {
  csvName: string;
  operator?: string;
  suburb: string;
  postcode: string;
  website?: string;
}

interface MatchResult extends ParsedRow {
  status: 'matched' | 'not_found' | 'multiple';
  dbVillageId?: string;
  dbVillageName?: string;
  dbOperator?: string;
  error?: string;
  matchCount?: number;
}

interface UpdateResult extends MatchResult {
  updated: boolean;
  updateError?: string;
}

export function VICSmartLocationUpdater() {
  const [csvText, setCsvText] = useState('');
  const [step, setStep] = useState<'input' | 'matching' | 'preview' | 'updating' | 'complete'>('input');
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [updateResults, setUpdateResults] = useState<UpdateResult[]>([]);
  const [stats, setStats] = useState({ 
    total: 0, 
    matched: 0, 
    notFound: 0, 
    multiple: 0,
    updated: 0,
    failed: 0 
  });

  const handleFindMatches = async () => {
    if (!csvText.trim()) {
      alert('Please paste CSV data first');
      return;
    }

    setStep('matching');
    setMatches([]);

    try {
      const lines = csvText.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
      
      console.log('📋 CSV Headers:', headers);

      // Find column indices (flexible)
      const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('village'));
      const suburbIndex = headers.findIndex(h => h.includes('suburb'));
      const postcodeIndex = headers.findIndex(h => h.includes('postcode') || h.includes('post'));
      const operatorIndex = headers.findIndex(h => h.includes('operator'));
      const websiteIndex = headers.findIndex(h => h.includes('website') || h.includes('url'));

      if (suburbIndex === -1 || postcodeIndex === -1) {
        alert(`❌ Missing required columns!\n\nFound: ${headers.join(', ')}\n\nNeed: Suburb AND Postcode columns`);
        setStep('input');
        return;
      }

      console.log('📋 Column mapping:', { nameIndex, suburbIndex, postcodeIndex, operatorIndex, websiteIndex });

      const matchResults: MatchResult[] = [];
      const supabase = getSupabaseClient();

      // Process each row (skip header)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parse CSV row (handle quoted values)
        const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map(v => v.trim().replace(/^"|"$/g, '')) || [];
        
        const csvName = nameIndex !== -1 ? values[nameIndex]?.trim() : 'Unknown';
        const suburb = values[suburbIndex]?.trim();
        const postcode = values[postcodeIndex]?.trim();
        const operator = operatorIndex !== -1 ? values[operatorIndex]?.trim() : undefined;
        const website = websiteIndex !== -1 ? values[websiteIndex]?.trim() : undefined;

        if (!suburb || !postcode) {
          console.log(`⏭️ Skipping row ${i}: missing suburb or postcode`);
          continue;
        }

        console.log(`🔍 Looking for village in ${suburb} ${postcode}...`);

        try {
          // Match by Suburb + Postcode in VIC
          const { data: villages, error: searchError } = await supabase
            .from('retirement_villages')
            .select('id, name, operator, suburb, postcode, website')
            .eq('state', 'VIC')
            .ilike('suburb', suburb)
            .eq('postcode', postcode);

          if (searchError) throw searchError;

          if (!villages || villages.length === 0) {
            console.log(`❌ Not found: ${suburb} ${postcode}`);
            matchResults.push({
              csvName,
              operator,
              suburb,
              postcode,
              website,
              status: 'not_found',
              error: `No VIC village found at ${suburb} ${postcode}`,
            });
          } else if (villages.length > 1) {
            console.log(`⚠️ Multiple matches: ${villages.length} villages at ${suburb} ${postcode}`);
            matchResults.push({
              csvName,
              operator,
              suburb,
              postcode,
              website,
              status: 'multiple',
              matchCount: villages.length,
              error: `${villages.length} villages found at this location: ${villages.map(v => v.name).join(', ')}`,
            });
          } else {
            // Perfect match!
            const village = villages[0];
            console.log(`✅ Matched: ${csvName} -> ${village.name}`);
            matchResults.push({
              csvName,
              operator,
              suburb,
              postcode,
              website,
              status: 'matched',
              dbVillageId: village.id,
              dbVillageName: village.name,
              dbOperator: village.operator,
            });
          }

        } catch (err) {
          console.error(`❌ Error matching row ${i}:`, err);
          matchResults.push({
            csvName,
            operator,
            suburb,
            postcode,
            website,
            status: 'not_found',
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Calculate stats
      const matched = matchResults.filter(r => r.status === 'matched').length;
      const notFound = matchResults.filter(r => r.status === 'not_found').length;
      const multiple = matchResults.filter(r => r.status === 'multiple').length;

      setStats({
        total: matchResults.length,
        matched,
        notFound,
        multiple,
        updated: 0,
        failed: 0,
      });
      setMatches(matchResults);
      setStep('preview');

      console.log('📊 Matching complete:', { matched, notFound, multiple });

    } catch (err) {
      console.error('Matching error:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to match villages'}`);
      setStep('input');
    }
  };

  const handleUpdateConfirmed = async () => {
    setStep('updating');
    
    const supabase = getSupabaseClient();
    const updateResults: UpdateResult[] = [];

    // Only update matched villages
    const matchedVillages = matches.filter(m => m.status === 'matched');

    for (const match of matchedVillages) {
      try {
        // Build update object (only update fields that are provided)
        const updateData: any = {};
        
        if (match.operator && match.operator !== 'N/A' && match.operator !== '') {
          updateData.operator = match.operator;
        }
        
        if (match.website && match.website !== 'N/A' && match.website !== '') {
          updateData.website = match.website;
        }

        // Always update suburb/postcode to ensure they're correct
        updateData.suburb = match.suburb;
        updateData.postcode = match.postcode;

        console.log(`💾 Updating ${match.dbVillageName} (${match.dbVillageId}):`, updateData);

        const { error: updateError } = await supabase
          .from('retirement_villages')
          .update(updateData)
          .eq('id', match.dbVillageId!);

        if (updateError) throw updateError;

        updateResults.push({
          ...match,
          updated: true,
        });

        console.log(`✅ Updated: ${match.dbVillageName}`);

      } catch (err) {
        console.error(`❌ Error updating ${match.dbVillageName}:`, err);
        updateResults.push({
          ...match,
          updated: false,
          updateError: err instanceof Error ? err.message : 'Unknown error',
        });
      }

      // Small delay
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Add non-matched results as-is
    const nonMatched = matches.filter(m => m.status !== 'matched');
    updateResults.push(...nonMatched.map(m => ({ ...m, updated: false })));

    const updated = updateResults.filter(r => r.updated).length;
    const failed = updateResults.filter(r => r.status === 'matched' && !r.updated).length;

    setStats(prev => ({
      ...prev,
      updated,
      failed,
    }));
    setUpdateResults(updateResults);
    setStep('complete');

    console.log('📊 Update complete:', { updated, failed });
  };

  const handleReset = () => {
    setCsvText('');
    setStep('input');
    setMatches([]);
    setUpdateResults([]);
    setStats({ total: 0, matched: 0, notFound: 0, multiple: 0, updated: 0, failed: 0 });
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-emerald-50 to-cyan-50 border-2 border-emerald-400">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-emerald-900 flex items-center gap-2">
          <MapPin className="size-6" />
          VIC Smart Location Updater
        </h2>
        <p className="text-sm text-emerald-700 mt-1">
          Matches villages by Suburb + Postcode (perfect for when names don't match!)
        </p>
      </div>

      {/* STEP 1: INPUT */}
      {step === 'input' && (
        <>
          <Alert className="mb-4 bg-blue-50 border-blue-400">
            <AlertTriangle className="size-4" />
            <AlertDescription>
              <strong>How this works:</strong>
              <ol className="list-decimal ml-4 mt-2 space-y-1">
                <li>Paste your CSV with: <strong>Suburb, Postcode</strong> (required), plus optional: Name, Operator, Website</li>
                <li>Click "Find Matches" - we'll search by location, not name</li>
                <li>Review matches and confirm</li>
                <li>Updates are saved to database</li>
              </ol>
              <p className="mt-2 text-xs">
                <strong>Why location-based?</strong> Your CSV names might be different from database names, but locations are unique!
              </p>
            </AlertDescription>
          </Alert>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Paste CSV Data Here:
            </label>
            <Textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Name,Suburb,Postcode,Operator,Website
Abbey Village,Burwood,3125,Lendlease,https://abbey.com.au
Acacia Lodge,Camberwell,3124,Regis,https://acacia.com.au
..."
              rows={12}
              className="font-mono text-xs"
            />
            <p className="text-xs text-gray-500 mt-1">
              {csvText ? `${csvText.split('\n').length} lines` : 'Waiting for data...'}
            </p>
          </div>

          <Button
            onClick={handleFindMatches}
            disabled={!csvText.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 w-full"
            size="lg"
          >
            <MapPin className="size-5 mr-2" />
            Find Matches by Location
          </Button>
        </>
      )}

      {/* STEP 2: MATCHING */}
      {step === 'matching' && (
        <Alert className="bg-yellow-50 border-yellow-400">
          <AlertDescription>
            <strong>⏳ Searching database...</strong> Matching villages by Suburb + Postcode. Please wait...
          </AlertDescription>
        </Alert>
      )}

      {/* STEP 3: PREVIEW */}
      {step === 'preview' && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4 bg-gray-50">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Rows</div>
            </Card>
            <Card className="p-4 bg-green-100">
              <div className="text-2xl font-bold text-green-700">{stats.matched}</div>
              <div className="text-sm text-green-600">✓ Matched</div>
            </Card>
            <Card className="p-4 bg-yellow-100">
              <div className="text-2xl font-bold text-yellow-700">{stats.notFound}</div>
              <div className="text-sm text-yellow-600">⚠ Not Found</div>
            </Card>
            <Card className="p-4 bg-orange-100">
              <div className="text-2xl font-bold text-orange-700">{stats.multiple}</div>
              <div className="text-sm text-orange-600">⚠ Multiple</div>
            </Card>
          </div>

          <Alert className={stats.matched > 0 ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}>
            <AlertDescription>
              {stats.matched > 0 ? (
                <>
                  <strong className="text-green-700">✅ Found {stats.matched} matches!</strong>
                  <p className="mt-1">Review the matches below and click "Update Database" to apply changes.</p>
                  {stats.notFound > 0 && (
                    <p className="mt-1 text-yellow-700">⚠ {stats.notFound} villages not found (check suburb/postcode)</p>
                  )}
                  {stats.multiple > 0 && (
                    <p className="mt-1 text-orange-700">⚠ {stats.multiple} have multiple matches (need manual review)</p>
                  )}
                </>
              ) : (
                <>
                  <strong className="text-red-700">❌ No matches found</strong>
                  <p className="mt-1">Check your CSV data - suburbs/postcodes may not match database.</p>
                </>
              )}
            </AlertDescription>
          </Alert>

          {/* Match Preview Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2">Status</th>
                    <th className="text-left px-3 py-2">Location</th>
                    <th className="text-left px-3 py-2">CSV Name</th>
                    <th className="text-left px-3 py-2">DB Name</th>
                    <th className="text-left px-3 py-2">Operator</th>
                    <th className="text-left px-3 py-2">Website</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {matches.map((match, idx) => (
                    <tr 
                      key={idx} 
                      className={
                        match.status === 'matched' ? 'bg-green-50' :
                        match.status === 'multiple' ? 'bg-orange-50' :
                        'bg-yellow-50'
                      }
                    >
                      <td className="px-3 py-2">
                        {match.status === 'matched' && (
                          <CheckCircle className="size-4 text-green-600" />
                        )}
                        {match.status === 'not_found' && (
                          <XCircle className="size-4 text-yellow-600" />
                        )}
                        {match.status === 'multiple' && (
                          <AlertTriangle className="size-4 text-orange-600" />
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-mono text-xs">
                          {match.suburb}<br/>
                          {match.postcode}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-xs">{match.csvName}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium text-xs">
                          {match.dbVillageName || (
                            <span className="text-red-600">{match.error}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-xs">
                          {match.operator && (
                            <div className="text-green-700 font-semibold">→ {match.operator}</div>
                          )}
                          {match.dbOperator && (
                            <div className="text-gray-500">was: {match.dbOperator}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {match.website && (
                          <div className="text-blue-600 truncate max-w-[150px]">{match.website}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleUpdateConfirmed}
              disabled={stats.matched === 0}
              className="bg-emerald-600 hover:bg-emerald-700 flex-1"
              size="lg"
            >
              <Database className="size-5 mr-2" />
              Update Database ({stats.matched} villages)
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              Cancel & Start Over
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: UPDATING */}
      {step === 'updating' && (
        <Alert className="bg-blue-50 border-blue-400">
          <AlertDescription>
            <strong>⏳ Updating database...</strong> Applying changes to {stats.matched} villages. Please wait...
          </AlertDescription>
        </Alert>
      )}

      {/* STEP 5: COMPLETE */}
      {step === 'complete' && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4 bg-gray-50">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Rows</div>
            </Card>
            <Card className="p-4 bg-green-100">
              <div className="text-2xl font-bold text-green-700">{stats.updated}</div>
              <div className="text-sm text-green-600">✓ Updated</div>
            </Card>
            <Card className="p-4 bg-red-100">
              <div className="text-2xl font-bold text-red-700">{stats.failed}</div>
              <div className="text-sm text-red-600">✗ Failed</div>
            </Card>
            <Card className="p-4 bg-yellow-100">
              <div className="text-2xl font-bold text-yellow-700">{stats.notFound + stats.multiple}</div>
              <div className="text-sm text-yellow-600">⚠ Skipped</div>
            </Card>
          </div>

          <Alert className={stats.updated > 0 ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}>
            <AlertDescription>
              {stats.updated > 0 ? (
                <>
                  <strong className="text-green-700">🎉 SUCCESS!</strong>
                  <p className="mt-1"><strong>{stats.updated}</strong> villages updated in database!</p>
                  {stats.failed > 0 && (
                    <p className="mt-1 text-red-700">❌ {stats.failed} updates failed with errors</p>
                  )}
                  {(stats.notFound + stats.multiple) > 0 && (
                    <p className="mt-1 text-yellow-700">⚠ {stats.notFound + stats.multiple} villages skipped (not found or multiple matches)</p>
                  )}
                </>
              ) : (
                <>
                  <strong className="text-red-700">❌ Update failed</strong>
                  <p className="mt-1">No villages were updated. Check the results below.</p>
                </>
              )}
            </AlertDescription>
          </Alert>

          {/* Detailed Results */}
          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2">Status</th>
                    <th className="text-left px-3 py-2">Village Name</th>
                    <th className="text-left px-3 py-2">Location</th>
                    <th className="text-left px-3 py-2">Operator</th>
                    <th className="text-left px-3 py-2">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {updateResults.map((result, idx) => (
                    <tr 
                      key={idx} 
                      className={
                        result.updated ? 'bg-green-50' :
                        result.status === 'matched' ? 'bg-red-50' :
                        'bg-yellow-50'
                      }
                    >
                      <td className="px-3 py-2">
                        {result.updated && (
                          <CheckCircle className="size-4 text-green-600" />
                        )}
                        {!result.updated && result.status === 'matched' && (
                          <XCircle className="size-4 text-red-600" />
                        )}
                        {result.status !== 'matched' && (
                          <AlertTriangle className="size-4 text-yellow-600" />
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium text-xs">{result.dbVillageName || result.csvName}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-mono text-xs">
                          {result.suburb} {result.postcode}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="font-semibold text-xs text-emerald-700">{result.operator || '—'}</span>
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {result.updated ? (
                          <span className="text-green-600">✓ Updated</span>
                        ) : result.updateError ? (
                          <span className="text-red-600">{result.updateError}</span>
                        ) : (
                          <span className="text-yellow-600">{result.error}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Button
            onClick={handleReset}
            className="bg-emerald-600 hover:bg-emerald-700 w-full"
            size="lg"
          >
            Import Another CSV
          </Button>
        </div>
      )}
    </Card>
  );
}
