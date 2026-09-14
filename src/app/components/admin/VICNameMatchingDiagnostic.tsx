import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { FileSearch, Upload, Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

interface MatchResult {
  csvName: string;
  csvOperator: string;
  csvWebsite: string;
  matched: boolean;
  dbName?: string;
  dbId?: number;
  matchType?: 'exact' | 'fuzzy' | 'none';
  similarNames?: string[];
}

export function VICNameMatchingDiagnostic() {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [stats, setStats] = useState<any>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      // Parse CSV (assuming: name,operator,website)
      const parsed = lines.slice(1).map(line => {
        const [name, operator, website] = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
        return { name, operator, website };
      }).filter(row => row.name && row.operator && row.operator !== 'NULL');

      console.log(`📄 Parsed ${parsed.length} valid villages from CSV`);
      setCsvData(parsed);
      setLoading(false);
    };

    reader.readAsText(file);
  };

  const analyzeMatching = async () => {
    if (csvData.length === 0) {
      alert('Please upload a CSV file first!');
      return;
    }

    setAnalyzing(true);
    setResults([]);
    setStats(null);

    try {
      const supabase = getSupabaseClient();

      // Get ALL VIC villages from database
      const { data: dbVillages, error } = await supabase
        .from('retirement_villages')
        .select('id, name, suburb, postcode')
        .eq('state', 'VIC')
        .order('name');

      if (error) throw new Error(error.message);

      console.log(`🏘️ Got ${dbVillages?.length} VIC villages from database`);

      const matchResults: MatchResult[] = [];
      let exactMatches = 0;
      let fuzzyMatches = 0;
      let noMatches = 0;

      // For each CSV village, try to find it in the database
      for (const csvRow of csvData) {
        const csvName = csvRow.name;
        const csvOperator = csvRow.operator;
        const csvWebsite = csvRow.website;

        // Try exact match first
        const exactMatch = dbVillages?.find(db => db.name === csvName);
        
        if (exactMatch) {
          matchResults.push({
            csvName,
            csvOperator,
            csvWebsite,
            matched: true,
            dbName: exactMatch.name,
            dbId: exactMatch.id,
            matchType: 'exact'
          });
          exactMatches++;
          continue;
        }

        // Try fuzzy matching (case insensitive, trim spaces)
        const normalizedCsvName = csvName.toLowerCase().trim();
        const fuzzyMatch = dbVillages?.find(db => 
          db.name.toLowerCase().trim() === normalizedCsvName
        );

        if (fuzzyMatch) {
          matchResults.push({
            csvName,
            csvOperator,
            csvWebsite,
            matched: true,
            dbName: fuzzyMatch.name,
            dbId: fuzzyMatch.id,
            matchType: 'fuzzy'
          });
          fuzzyMatches++;
          continue;
        }

        // No match - find similar names for debugging
        const similar = dbVillages
          ?.filter(db => {
            const dbLower = db.name.toLowerCase();
            const csvLower = csvName.toLowerCase();
            return dbLower.includes(csvLower.split(' ')[0]) || 
                   csvLower.includes(dbLower.split(' ')[0]);
          })
          .slice(0, 3)
          .map(db => db.name) || [];

        matchResults.push({
          csvName,
          csvOperator,
          csvWebsite,
          matched: false,
          matchType: 'none',
          similarNames: similar
        });
        noMatches++;
      }

      setResults(matchResults);
      setStats({
        total: csvData.length,
        exactMatches,
        fuzzyMatches,
        noMatches,
        matchRate: ((exactMatches + fuzzyMatches) / csvData.length * 100).toFixed(1)
      });

      console.log('📊 Matching Stats:', {
        total: csvData.length,
        exactMatches,
        fuzzyMatches,
        noMatches
      });

    } catch (err: any) {
      console.error('Error analyzing:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="border-2 border-indigo-400">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSearch className="size-6 text-indigo-600" />
          VIC Name Matching Diagnostic
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4">
          <p className="text-sm text-indigo-900 font-semibold mb-2">
            🔍 What this does:
          </p>
          <ul className="text-sm text-indigo-800 space-y-1 list-disc list-inside">
            <li>Compares CSV village names with database names</li>
            <li>Shows which names match and which don't</li>
            <li>Suggests similar names for non-matches</li>
            <li>Helps identify why the merge failed</li>
          </ul>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Upload your scraped CSV file (78 villages)
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100"
          />
          {csvData.length > 0 && (
            <p className="text-sm text-green-600 font-semibold">
              ✅ Loaded {csvData.length} villages from CSV
            </p>
          )}
        </div>

        <Button
          onClick={analyzeMatching}
          disabled={analyzing || csvData.length === 0}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          {analyzing ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <FileSearch className="mr-2 size-4" />
              Analyze Name Matching
            </>
          )}
        </Button>

        {stats && (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-3 bg-blue-50 rounded border-2 border-blue-200">
                <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
                <div className="text-xs text-blue-600">Total</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded border-2 border-green-200">
                <div className="text-2xl font-bold text-green-700">{stats.exactMatches}</div>
                <div className="text-xs text-green-600">Exact</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded border-2 border-yellow-200">
                <div className="text-2xl font-bold text-yellow-700">{stats.fuzzyMatches}</div>
                <div className="text-xs text-yellow-600">Fuzzy</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded border-2 border-red-200">
                <div className="text-2xl font-bold text-red-700">{stats.noMatches}</div>
                <div className="text-xs text-red-600">No Match</div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border-2 ${
              stats.matchRate >= 90 ? 'bg-green-50 border-green-200' :
              stats.matchRate >= 70 ? 'bg-yellow-50 border-yellow-200' :
              'bg-red-50 border-red-200'
            }`}>
              <p className="text-center text-lg font-bold">
                {stats.matchRate}% Match Rate
              </p>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <details className="bg-white border-2 border-gray-200 rounded p-3">
            <summary className="text-sm font-semibold text-gray-700 cursor-pointer">
              View Detailed Results ({results.length} villages)
            </summary>
            <div className="mt-3 max-h-96 overflow-y-auto space-y-2">
              {/* Show no-matches first */}
              {results.filter(r => !r.matched).map((result, idx) => (
                <div key={idx} className="p-3 bg-red-50 border-2 border-red-200 rounded">
                  <div className="flex items-start gap-2">
                    <XCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-red-900 break-words">
                        CSV: {result.csvName}
                      </div>
                      <div className="text-sm text-red-700">
                        Operator: {result.csvOperator}
                      </div>
                      {result.similarNames && result.similarNames.length > 0 && (
                        <div className="mt-2 text-xs text-red-600">
                          <div className="font-semibold">Similar names in DB:</div>
                          {result.similarNames.map((name, i) => (
                            <div key={i} className="ml-2">• {name}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Show fuzzy matches */}
              {results.filter(r => r.matched && r.matchType === 'fuzzy').map((result, idx) => (
                <div key={idx} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="size-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-yellow-900">
                        <div>CSV: <span className="font-semibold break-words">{result.csvName}</span></div>
                        <div>DB: <span className="font-semibold break-words">{result.dbName}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Show exact matches (collapsed) */}
              <details className="bg-green-50 border border-green-200 rounded p-2">
                <summary className="text-xs font-semibold text-green-700 cursor-pointer">
                  ✅ {stats.exactMatches} Exact Matches (click to expand)
                </summary>
                <div className="mt-2 space-y-1">
                  {results.filter(r => r.matched && r.matchType === 'exact').map((result, idx) => (
                    <div key={idx} className="text-xs text-green-800 p-1">
                      ✓ {result.csvName}
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
