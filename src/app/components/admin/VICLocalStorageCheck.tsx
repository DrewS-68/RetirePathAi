import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Search, Download, Trash2, Loader2 } from 'lucide-react';

export function VICLocalStorageCheck() {
  const [data, setData] = useState<any>(null);
  const [checked, setChecked] = useState(false);

  const checkLocalStorage = () => {
    const localResults = localStorage.getItem('vic_scrape_results');
    
    if (!localResults) {
      setData({ found: false });
      setChecked(true);
      return;
    }

    try {
      const parsed = JSON.parse(localResults);
      const results = parsed.results || [];
      
      // Analyze the data
      const validOperators = results.filter((item: any) => {
        const hasOperator = item.operator && item.operator !== 'NULL';
        const notAberlea = hasOperator && !item.operator.toLowerCase().includes('aberlea');
        return notAberlea;
      });

      const nullOperators = results.filter((item: any) => !item.operator || item.operator === 'NULL');
      const aberleaOperators = results.filter((item: any) => 
        item.operator && item.operator !== 'NULL' && item.operator.toLowerCase().includes('aberlea')
      );

      setData({
        found: true,
        total: results.length,
        valid: validOperators.length,
        nullOps: nullOperators.length,
        aberlea: aberleaOperators.length,
        validVillages: validOperators.map((v: any) => ({
          name: v.village,
          operator: v.operator,
          website: v.website
        })),
        aberleaVillages: aberleaOperators.map((v: any) => v.village),
        timestamp: parsed.timestamp
      });
      setChecked(true);

      console.log('📦 VIC Scrape Results:', {
        total: results.length,
        valid: validOperators.length,
        null: nullOperators.length,
        aberlea: aberleaOperators.length
      });

    } catch (err) {
      console.error('Error parsing localStorage:', err);
      setData({ found: false, error: 'Failed to parse data' });
      setChecked(true);
    }
  };

  const exportToJSON = () => {
    if (!data?.validVillages) return;
    
    const dataStr = JSON.stringify(data.validVillages, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vic_78_operators_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
  };

  const clearStorage = () => {
    if (confirm('⚠️ Clear VIC scrape results from localStorage?')) {
      localStorage.removeItem('vic_scrape_results');
      setData(null);
      setChecked(false);
      alert('✅ Cleared!');
    }
  };

  return (
    <Card className="border-2 border-cyan-400">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="size-6 text-cyan-600" />
          VIC LocalStorage Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-cyan-50 border-2 border-cyan-200 rounded-lg p-4">
          <p className="text-sm text-cyan-900 font-semibold mb-2">
            🔍 What this checks:
          </p>
          <ul className="text-sm text-cyan-800 space-y-1 list-disc list-inside">
            <li>Looks for <code className="bg-cyan-100 px-1 rounded">vic_scrape_results</code> in localStorage</li>
            <li>Shows how many valid operators are ready to merge</li>
            <li>Identifies any Aberlea contamination</li>
            <li>Lets you export the data as JSON</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={checkLocalStorage}
            className="flex-1 bg-cyan-600 hover:bg-cyan-700"
          >
            <Search className="mr-2 size-4" />
            Check LocalStorage
          </Button>

          {data?.found && (
            <>
              <Button onClick={exportToJSON} variant="outline">
                <Download className="size-4 mr-2" />
                Export
              </Button>
              <Button onClick={clearStorage} variant="destructive">
                <Trash2 className="size-4 mr-2" />
                Clear
              </Button>
            </>
          )}
        </div>

        {checked && !data?.found && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <p className="text-red-900 font-semibold">
              ❌ No scraping results found in localStorage!
            </p>
            <p className="text-sm text-red-700 mt-2">
              The key <code className="bg-red-100 px-1 rounded">vic_scrape_results</code> is empty.
              You need to run the Auto Scraper first.
            </p>
          </div>
        )}

        {data?.found && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-4 bg-blue-50 rounded border-2 border-blue-200">
                <div className="text-3xl font-bold text-blue-700">{data.total}</div>
                <div className="text-sm text-blue-600">Total Scraped</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded border-2 border-green-200">
                <div className="text-3xl font-bold text-green-700">{data.valid}</div>
                <div className="text-sm text-green-600">Valid Operators</div>
                <div className="text-xs text-green-700 mt-1">Ready to merge! ✅</div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded border-2 border-orange-200">
                <div className="text-3xl font-bold text-orange-700">{data.nullOps}</div>
                <div className="text-sm text-orange-600">NULL Results</div>
              </div>

              <div className={`text-center p-4 rounded border-2 ${
                data.aberlea > 0 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className={`text-3xl font-bold ${
                  data.aberlea > 0 ? 'text-red-700' : 'text-green-700'
                }`}>
                  {data.aberlea}
                </div>
                <div className={`text-sm ${
                  data.aberlea > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  Aberlea (blocked)
                </div>
              </div>
            </div>

            {data.timestamp && (
              <div className="text-xs text-gray-500 text-center">
                Scraped: {new Date(data.timestamp).toLocaleString()}
              </div>
            )}

            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
              <p className="text-purple-900 font-semibold mb-2">
                🎯 Ready to merge!
              </p>
              <p className="text-sm text-purple-800">
                You have <strong>{data.valid} valid operators</strong> ready to merge into the database.
                Click the <strong>"Merge 78 Scraped Operators"</strong> button below to update the database.
              </p>
            </div>

            {data.aberlea > 0 && data.aberleaVillages?.length > 0 && (
              <div className="bg-red-50 border border-red-300 rounded p-3">
                <p className="font-semibold text-red-900 mb-2">
                  ⚠️ Aberlea villages (will be skipped):
                </p>
                <div className="max-h-32 overflow-y-auto text-xs text-red-800 space-y-1">
                  {data.aberleaVillages.map((name: string, i: number) => (
                    <div key={i}>• {name}</div>
                  ))}
                </div>
              </div>
            )}

            {data.validVillages?.length > 0 && (
              <details className="bg-white border rounded p-3">
                <summary className="text-sm font-semibold text-gray-700 cursor-pointer">
                  View all {data.valid} valid operators
                </summary>
                <div className="mt-3 max-h-96 overflow-y-auto text-xs space-y-2">
                  {data.validVillages.map((v: any, i: number) => (
                    <div key={i} className="p-2 bg-gray-50 rounded">
                      <div className="font-semibold">{v.name}</div>
                      <div className="text-gray-600">Operator: {v.operator}</div>
                      {v.website && (
                        <div className="text-blue-600 truncate">🔗 {v.website}</div>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
