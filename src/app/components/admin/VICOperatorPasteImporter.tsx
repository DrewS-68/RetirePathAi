import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Database } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

interface ImportResult {
  villageName: string;
  operator: string;
  status: 'success' | 'failed' | 'not_found';
  matchedName?: string;
  error?: string;
}

export function VICOperatorPasteImporter() {
  const [csvText, setCsvText] = useState('');
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0, notFound: 0 });

  const handleImport = async () => {
    if (!csvText.trim()) {
      alert('Please paste CSV data first');
      return;
    }

    setImporting(true);
    setResults([]);

    try {
      const lines = csvText.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
      
      // Find column indices (flexible - look for name/village name/operator)
      const nameIndex = headers.findIndex(h => 
        h.includes('name') || h.includes('village')
      );
      const operatorIndex = headers.findIndex(h => h.includes('operator'));

      if (nameIndex === -1 || operatorIndex === -1) {
        alert(`❌ Could not find required columns!\n\nFound headers: ${headers.join(', ')}\n\nNeed: A name column and an operator column`);
        setImporting(false);
        return;
      }

      console.log('📋 Found columns:', { nameIndex, operatorIndex, headers });

      const importResults: ImportResult[] = [];
      const supabase = getSupabaseClient();

      // Process each row (skip header)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parse CSV row (handle quoted values)
        const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map(v => v.trim().replace(/^"|"$/g, '')) || [];
        
        const villageName = values[nameIndex]?.trim();
        const operator = values[operatorIndex]?.trim();

        if (!villageName || !operator || operator === 'N/A' || operator === '') {
          console.log(`⏭️ Skipping row ${i}: empty name or operator`);
          continue;
        }

        console.log(`🔍 Processing: ${villageName} -> ${operator}`);

        try {
          // Try exact match first (case-insensitive)
          let { data: villages, error: searchError } = await supabase
            .from('retirement_villages')
            .select('id, name, operator')
            .eq('state', 'VIC')
            .ilike('name', villageName);

          if (searchError) throw searchError;

          // If no exact match, try fuzzy match
          if (!villages || villages.length === 0) {
            // Remove common words and try again
            const cleanName = villageName
              .replace(/retirement village/gi, '')
              .replace(/village/gi, '')
              .replace(/the /gi, '')
              .trim();

            ({ data: villages, error: searchError } = await supabase
              .from('retirement_villages')
              .select('id, name, operator')
              .eq('state', 'VIC')
              .or(`name.ilike.%${cleanName}%,name.ilike.%${villageName}%`));

            if (searchError) throw searchError;
          }

          if (!villages || villages.length === 0) {
            console.log(`❌ Not found: ${villageName}`);
            importResults.push({
              villageName,
              operator,
              status: 'not_found',
              error: 'Village not found in database',
            });
            continue;
          }

          // Use first match
          const village = villages[0];
          console.log(`✅ Found match: ${villageName} -> ${village.name}`);

          // Update operator
          const { error: updateError } = await supabase
            .from('retirement_villages')
            .update({ operator })
            .eq('id', village.id);

          if (updateError) throw updateError;

          importResults.push({
            villageName,
            operator,
            status: 'success',
            matchedName: village.name !== villageName ? village.name : undefined,
          });

          console.log(`💾 Updated: ${village.name} with operator: ${operator}`);

        } catch (err) {
          console.error(`❌ Error importing ${villageName}:`, err);
          importResults.push({
            villageName,
            operator,
            status: 'failed',
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Calculate stats
      const success = importResults.filter(r => r.status === 'success').length;
      const failed = importResults.filter(r => r.status === 'failed').length;
      const notFound = importResults.filter(r => r.status === 'not_found').length;

      setStats({
        total: importResults.length,
        success,
        failed,
        notFound,
      });
      setResults(importResults);

      console.log('📊 Import complete:', { success, failed, notFound });

    } catch (err) {
      console.error('Import error:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to import CSV'}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-400">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-purple-900 flex items-center gap-2">
          📋 Paste & Import Operators (FASTEST METHOD)
        </h2>
        <p className="text-sm text-purple-700 mt-1">
          Just paste your CSV data below - no file upload needed!
        </p>
      </div>

      <Alert className="mb-4 bg-blue-50 border-blue-400">
        <AlertTriangle className="size-4" />
        <AlertDescription>
          <strong>How to use:</strong>
          <ol className="list-decimal ml-4 mt-2 space-y-1">
            <li>Open your CSV in Excel/Google Sheets/Notepad</li>
            <li>Select ALL data (including headers) and copy (Ctrl+C)</li>
            <li>Paste it in the box below</li>
            <li>Click "Import Now"</li>
          </ol>
          <p className="mt-2 text-xs">
            <strong>Required columns:</strong> Must have a "Name" column and an "Operator" column
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
          placeholder="Name,Operator,Suburb,etc...
Abbey Village,Lendlease,Burwood
Acacia Lodge,Regis,Camberwell
..."
          rows={10}
          className="font-mono text-xs"
          disabled={importing}
        />
        <p className="text-xs text-gray-500 mt-1">
          {csvText ? `${csvText.split('\n').length} lines` : 'Waiting for data...'}
        </p>
      </div>

      <Button
        onClick={handleImport}
        disabled={importing || !csvText.trim()}
        className="bg-purple-600 hover:bg-purple-700 w-full"
        size="lg"
      >
        <Database className="size-5 mr-2" />
        {importing ? 'Importing...' : 'Import Now & Update Database'}
      </Button>

      {importing && (
        <Alert className="mt-4 bg-yellow-50 border-yellow-400">
          <AlertDescription>
            <strong>⏳ Importing...</strong> Please wait while we update the database.
          </AlertDescription>
        </Alert>
      )}

      {results.length > 0 && (
        <div className="space-y-4 mt-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4 bg-gray-50">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Rows</div>
            </Card>
            <Card className="p-4 bg-green-100">
              <div className="text-2xl font-bold text-green-700">{stats.success}</div>
              <div className="text-sm text-green-600">✓ Imported</div>
            </Card>
            <Card className="p-4 bg-red-100">
              <div className="text-2xl font-bold text-red-700">{stats.failed}</div>
              <div className="text-sm text-red-600">✗ Failed</div>
            </Card>
            <Card className="p-4 bg-yellow-100">
              <div className="text-2xl font-bold text-yellow-700">{stats.notFound}</div>
              <div className="text-sm text-yellow-600">⚠ Not Found</div>
            </Card>
          </div>

          <Alert className={stats.success > 0 ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}>
            <AlertDescription>
              {stats.success > 0 ? (
                <>
                  <strong className="text-green-700">✅ SUCCESS!</strong>
                  <p className="mt-1"><strong>{stats.success}</strong> operators imported and saved to database!</p>
                  {stats.notFound > 0 && (
                    <p className="mt-1 text-yellow-700">⚠ {stats.notFound} villages not found (may be spelling differences)</p>
                  )}
                  {stats.failed > 0 && (
                    <p className="mt-1 text-red-700">❌ {stats.failed} failed with errors</p>
                  )}
                </>
              ) : (
                <>
                  <strong className="text-red-700">❌ Import failed</strong>
                  <p className="mt-1">No operators were imported. Check the results below.</p>
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
                    <th className="text-left px-3 py-2">Operator</th>
                    <th className="text-left px-3 py-2">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {results.map((result, idx) => (
                    <tr 
                      key={idx} 
                      className={
                        result.status === 'success' ? 'bg-green-50' :
                        result.status === 'not_found' ? 'bg-yellow-50' :
                        'bg-red-50'
                      }
                    >
                      <td className="px-3 py-2">
                        {result.status === 'success' && (
                          <CheckCircle className="size-4 text-green-600" />
                        )}
                        {result.status === 'failed' && (
                          <XCircle className="size-4 text-red-600" />
                        )}
                        {result.status === 'not_found' && (
                          <AlertTriangle className="size-4 text-yellow-600" />
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          <div className="font-medium">{result.villageName}</div>
                          {result.matchedName && (
                            <div className="text-xs text-gray-600">Matched: {result.matchedName}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="font-semibold text-purple-700">{result.operator}</span>
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {result.error ? (
                          <span className="text-red-600">{result.error}</span>
                        ) : result.status === 'success' ? (
                          <span className="text-green-600">✓ Updated</span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
