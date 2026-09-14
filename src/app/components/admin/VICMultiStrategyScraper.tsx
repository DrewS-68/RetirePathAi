import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export function VICMultiStrategyScraper() {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [batchSize, setBatchSize] = useState(100);
  const [processAll, setProcessAll] = useState(false);
  const [progress, setProgress] = useState<any>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [nullCount, setNullCount] = useState<number | null>(null);

  // Get count of villages with NULL URLs
  const fetchNullCount = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-multi-strategy-scraper/count`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setNullCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching NULL count:', error);
    }
  };

  // Fetch count on mount and after scraping
  useEffect(() => {
    fetchNullCount();
  }, [results]);

  const runScraper = async () => {
    setIsRunning(true);
    setIsPaused(false);
    setResults(null);
    setProgress(null);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-multi-strategy-scraper/run`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            batchSize: processAll ? 1000 : batchSize 
          }),
          signal: controller.signal
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setResults(data);
      setProgress(null);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Scraper stopped by user');
        setResults({
          success: true,
          stopped: true,
          message: 'Scraper stopped by user',
          summary: progress?.summary || { total: 0, success: 0, failed: 0 },
          results: progress?.results || []
        });
      } else {
        console.error('Scraper error:', error);
        setResults({
          success: false,
          error: error.message
        });
      }
    } finally {
      setIsRunning(false);
      setIsPaused(false);
      setAbortController(null);
    }
  };

  const stopScraper = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  const pauseScraper = () => {
    setIsPaused(true);
    if (abortController) {
      abortController.abort();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold">🎯 VIC Multi-Strategy Scraper</h2>
        
        {nullCount !== null && (
          <div className="bg-purple-100 border border-purple-300 rounded px-4 py-2">
            <div className="text-sm text-purple-700 font-medium">Villages Needing URLs:</div>
            <div className="text-3xl font-bold text-purple-900">{nullCount}</div>
          </div>
        )}
      </div>
      
      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
        <h3 className="font-semibold text-green-900 mb-2">✅ Smart NULL-Only Scraping</h3>
        <p className="text-sm text-green-800">
          This scraper <strong>ONLY processes villages with NULL URLs</strong>. It automatically skips 
          the ~252 villages that already have clean URLs. You can safely run batches of 100 
          without worrying about re-scraping villages that already have URLs!
        </p>
      </div>
      
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-900 mb-2">Multi-Strategy Approach:</h3>
        <ol className="text-sm text-blue-800 space-y-1 ml-4 list-decimal">
          <li><strong>Domain Search:</strong> Search operator's website specifically (from CSV)</li>
          <li><strong>Simplified Search:</strong> "Village Name" + retirement village + Victoria</li>
          <li><strong>Operator Search:</strong> Include operator name in query</li>
          <li><strong>Location Search:</strong> Use suburb/address if available</li>
          <li><strong>Aged Care Search:</strong> Try "aged care" instead of "retirement village"</li>
        </ol>
        <p className="text-xs text-blue-700 mt-3">
          ✅ Tries each strategy in order until a valid URL is found<br/>
          ✅ Skips blacklisted domains, PDFs, and generic pages<br/>
          ✅ Much higher success rate than single-strategy scraping
        </p>
      </div>

      <div className="mb-4">
        <label className="flex items-center space-x-3 mb-3">
          <input
            type="checkbox"
            checked={processAll}
            onChange={(e) => setProcessAll(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300"
            disabled={isRunning}
          />
          <span className="font-semibold text-lg">
            🚀 Process ALL villages (ignore batch size)
          </span>
        </label>
        
        {!processAll && (
          <>
            <label className="block text-sm font-medium mb-2">
              Batch Size (villages per run):
            </label>
            <input
              type="number"
              value={batchSize}
              onChange={(e) => setBatchSize(parseInt(e.target.value))}
              min={1}
              max={200}
              className="border rounded px-3 py-2 w-32"
              disabled={isRunning}
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended: 20 for testing, 100 for batched production runs
            </p>
          </>
        )}
        
        {processAll && (
          <div className="p-3 bg-yellow-50 border border-yellow-300 rounded text-sm">
            <strong>⚠️ Warning:</strong> This will process ALL villages without URLs (~300). 
            This may take 5-10 minutes and use significant ScraperAPI credits.
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        <button
          onClick={runScraper}
          disabled={isRunning}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 hover:from-blue-600 hover:to-purple-600 transition"
        >
          {isRunning 
            ? '🔄 Scraping... (Please wait, this cannot be stopped)' 
            : processAll 
              ? '🚀 Run Multi-Strategy Scraper (ALL VILLAGES)' 
              : `🚀 Run Multi-Strategy Scraper (${batchSize} villages)`
          }
        </button>
      </div>

      {isRunning && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-300 rounded animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-semibold text-blue-900">
              Processing villages... This may take several minutes. Please wait for results.
            </span>
          </div>
          <div className="mt-3 text-sm text-blue-800">
            ℹ️ Note: Progress bar and pause/stop controls are not yet implemented. 
            The scraper will complete the full batch and return all results at once.
          </div>
        </div>
      )}

      {results && (
        <div className="mt-6 border rounded p-4">
          {results.stopped && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded">
              <h3 className="font-semibold text-yellow-900">⏸️ Scraper Stopped</h3>
              <p className="text-sm text-yellow-800 mt-1">
                The scraper was stopped by the user. Partial results are shown below.
                Run again to continue processing remaining villages.
              </p>
            </div>
          )}
          
          {results.success ? (
            <>
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
                <h3 className="font-semibold text-green-900 mb-2">📊 Summary</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Total Processed</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {results.summary?.total || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">✅ Success</div>
                    <div className="text-2xl font-bold text-green-600">
                      {results.summary?.success || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">❌ Failed</div>
                    <div className="text-2xl font-bold text-red-600">
                      {results.summary?.failed || 0}
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="font-semibold mb-2">Detailed Results:</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {results.results?.map((result: any, index: number) => (
                  <div
                    key={index}
                    className={`p-3 rounded border ${
                      result.status === 'success'
                        ? 'bg-green-50 border-green-200'
                        : result.status === 'not_found'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="font-medium mb-1">
                      {result.status === 'success' ? '✅' : 
                       result.status === 'not_found' ? '⚠️' : '❌'} {result.village}
                    </div>
                    
                    {result.status === 'success' && (
                      <>
                        <div className="text-sm text-gray-600 mb-1">
                          <strong>Strategy:</strong> {result.strategy}
                        </div>
                        <div className="text-sm text-blue-600 break-all">
                          {result.url}
                        </div>
                      </>
                    )}
                    
                    {result.status === 'not_found' && (
                      <div className="text-sm text-yellow-700">
                        {result.message}
                      </div>
                    )}
                    
                    {result.status === 'error' && (
                      <div className="text-sm text-red-600">
                        Error: {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
              <strong>❌ Error:</strong> {results.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}