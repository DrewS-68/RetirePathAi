import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../utils/supabase/client';
import { Button } from './ui/button';
import { AlertCircle, CheckCircle, Play, RefreshCw } from 'lucide-react';

export function VICOperatorScraper() {
  const [scraping, setScraping] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [missingOperators, setMissingOperators] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMissingOperators();
  }, []);

  const loadMissingOperators = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://luwfbkxjbogfapgkznve.supabase.co/functions/v1/make-server-3bba8be8/vic-operator-scraper/missing-operators'
      );
      
      if (response.ok) {
        const data = await response.json();
        setMissingOperators(data.villages || []);
        console.log(`Found ${data.count} VIC villages missing operators`);
      }
    } catch (error) {
      console.error('Error loading missing operators:', error);
    } finally {
      setLoading(false);
    }
  };

  const startScraping = async () => {
    const confirmed = confirm(
      `🕷️ Start Operator Scraping?\n\n` +
      `This will scrape operator names for ${missingOperators.length} VIC villages.\n\n` +
      `⏱️ Estimated time: ${Math.ceil(missingOperators.length * 2 / 60)} minutes\n` +
      `(2 seconds per village + rate limiting)\n\n` +
      `Continue?`
    );
    
    if (!confirmed) return;
    
    setScraping(true);
    setResult(null);
    
    try {
      console.log('Starting operator scraping...');
      
      const response = await fetch(
        'https://luwfbkxjbogfapgkznve.supabase.co/functions/v1/make-server-3bba8be8/vic-operator-scraper/scrape-missing-operators',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Scraping failed');
      }
      
      const data = await response.json();
      
      console.log('Scraping complete:', data);
      
      setResult(data);
      
      // Reload missing operators list
      await loadMissingOperators();
      
      // Trigger refresh
      window.dispatchEvent(new Event('villageDataUpdated'));
      
    } catch (err: any) {
      console.error(err);
      setResult({ success: false, error: err.message });
    } finally {
      setScraping(false);
    }
  };

  const villagesWithWebsites = missingOperators.filter(v => v.website);
  const villagesWithoutWebsites = missingOperators.filter(v => !v.website);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg border-2 border-purple-300">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Play className="size-6 text-purple-600" />
        VIC Operator Scraper
      </h2>
      
      <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded">
        <p className="text-sm text-purple-900 mb-2">
          <strong>🕷️ What this does:</strong> Automatically scrapes operator names from village websites.
        </p>
        <p className="text-sm text-purple-700 mb-2">
          ✅ Uses ScraperAPI with premium proxies to bypass anti-bot protection
        </p>
        <p className="text-sm text-purple-700">
          ✅ Looks for operator names in HTML, meta tags, and common patterns
        </p>
      </div>
      
      {/* Status Overview */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <div className="text-2xl font-bold text-blue-900">
            {loading ? '...' : missingOperators.length}
          </div>
          <div className="text-sm text-blue-700">Villages Missing Operators</div>
        </div>
        
        <div className="p-4 bg-green-50 border border-green-200 rounded">
          <div className="text-2xl font-bold text-green-900">
            {loading ? '...' : villagesWithWebsites.length}
          </div>
          <div className="text-sm text-green-700">Have Website (Can Scrape)</div>
        </div>
        
        <div className="p-4 bg-orange-50 border border-orange-200 rounded">
          <div className="text-2xl font-bold text-orange-900">
            {loading ? '...' : villagesWithoutWebsites.length}
          </div>
          <div className="text-sm text-orange-700">No Website (Manual Entry)</div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="space-y-4 mb-6">
        <div className="flex gap-3">
          <Button 
            onClick={startScraping}
            disabled={scraping || villagesWithWebsites.length === 0}
            className="flex items-center gap-2"
          >
            {scraping ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                Scraping... ({Math.ceil((missingOperators.length * 2) / 60)} min)
              </>
            ) : (
              <>
                <Play className="size-4" />
                Scrape {villagesWithWebsites.length} Operators
              </>
            )}
          </Button>
          
          <Button 
            onClick={loadMissingOperators}
            disabled={loading || scraping}
            variant="outline"
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {villagesWithWebsites.length === 0 && !loading && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800">
            ✅ All VIC villages with websites have operators!
          </div>
        )}
      </div>
      
      {/* Results */}
      {result && (
        <div className={`p-4 rounded border mb-6 ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          {result.success ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="size-5 text-green-600" />
                <strong className="text-green-900">Scraping Complete!</strong>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-2xl font-bold text-green-900">{result.processed}</div>
                  <div className="text-sm text-green-700">Processed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-900">{result.updated}</div>
                  <div className="text-sm text-green-700">Updated</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-900">{result.failed}</div>
                  <div className="text-sm text-orange-700">Failed/Not Found</div>
                </div>
              </div>
              
              {result.results && result.results.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2 text-green-900">Details:</h3>
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-green-100">
                        <tr>
                          <th className="p-2 text-left">Village</th>
                          <th className="p-2 text-left">Suburb</th>
                          <th className="p-2 text-left">Operator</th>
                          <th className="p-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.results.map((r: any, idx: number) => (
                          <tr key={idx} className="border-t border-green-200">
                            <td className="p-2">{r.name}</td>
                            <td className="p-2">{r.suburb}</td>
                            <td className="p-2">{r.operator || r.error || '-'}</td>
                            <td className="p-2">
                              {r.status === 'success' && <span className="text-green-600">✅</span>}
                              {r.status === 'no_operator_found' && <span className="text-orange-600">⚠️</span>}
                              {r.status === 'error' && <span className="text-red-600">❌</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="size-5" />
              <div>
                <strong>Error:</strong> {result.error}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Village List */}
      {!scraping && villagesWithWebsites.length > 0 && (
        <div className="border rounded">
          <div className="p-3 bg-gray-50 border-b font-semibold">
            Villages Ready to Scrape ({villagesWithWebsites.length})
          </div>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="p-2 text-left">Village Name</th>
                  <th className="p-2 text-left">Suburb</th>
                  <th className="p-2 text-left">Website</th>
                </tr>
              </thead>
              <tbody>
                {villagesWithWebsites.map((village: any) => (
                  <tr key={village.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="p-2">{village.name}</td>
                    <td className="p-2">{village.suburb}</td>
                    <td className="p-2 text-xs text-blue-600 truncate max-w-xs">
                      {village.website}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {villagesWithoutWebsites.length > 0 && (
        <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded">
          <h3 className="font-semibold text-orange-900 mb-2">
            ⚠️ {villagesWithoutWebsites.length} Villages Without Websites
          </h3>
          <p className="text-sm text-orange-700 mb-2">
            These villages need manual operator entry or website URLs:
          </p>
          <ul className="text-sm text-orange-800 space-y-1 max-h-32 overflow-y-auto">
            {villagesWithoutWebsites.map((v: any) => (
              <li key={v.id}>• {v.name} ({v.suburb})</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
