import { useState, useRef, useEffect } from 'react';
import { Globe, Play, Pause, RotateCcw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface ScrapeResult {
  villageId: string;
  villageName: string;
  operator: string;
  website: string | null;
  status: 'success' | 'not_found' | 'error';
  error?: string;
}

export function VICWebsiteScraper() {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [summary, setSummary] = useState({ success: 0, notFound: 0, errors: 0 });
  const [results, setResults] = useState<Array<ScrapeResult>>([]);
  const [batchSize, setBatchSize] = useState(10);
  const [useExistingScraper, setUseExistingScraper] = useState(false);

  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentOffset = useRef(0);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const startScraping = async () => {
    if (!isMountedRef.current) return;
    
    setIsRunning(true);
    setIsPaused(false);
    setResults([]);
    setSummary({ success: 0, notFound: 0, errors: 0 });
    currentOffset.current = 0;
    
    await runBatch();
  };

  const resumeScraping = async () => {
    if (!isMountedRef.current) return;
    
    setIsPaused(false);
    await runBatch();
  };

  const pauseScraping = () => {
    if (!isMountedRef.current) return;
    
    setIsPaused(true);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const resetScraper = () => {
    if (!isMountedRef.current) return;
    
    setIsRunning(false);
    setIsPaused(false);
    setResults([]);
    setSummary({ success: 0, notFound: 0, errors: 0 });
    setProgress({ current: 0, total: 0 });
    currentOffset.current = 0;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const runBatch = async () => {
    if (!isMountedRef.current) return;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      console.log('🚀 VIC Scraper: Starting batch request...', {
        offset: currentOffset.current,
        batchSize
      });
      
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/scrape-vic-websites`;
      console.log('🌐 VIC Scraper: Request URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          batchSize: batchSize,
          offset: currentOffset.current
        }),
        signal: abortControllerRef.current.signal
      });

      console.log('📡 VIC Scraper: Response received', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ VIC Scraper: HTTP error', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('📦 VIC Scraper: Data received', data);

      if (data.error) {
        console.error('❌ VIC Scraper: API error', data.error);
        throw new Error(data.error);
      }

      // Only update state if component is still mounted
      if (!isMountedRef.current) return;

      // Update results
      setResults(prev => [...prev, ...data.results]);
      
      // Update summary
      setSummary(prev => ({
        success: prev.success + data.summary.success,
        notFound: prev.notFound + data.summary.notFound,
        errors: prev.errors + data.summary.errors
      }));

      // Update progress
      currentOffset.current = data.nextOffset;
      setProgress({
        current: data.nextOffset,
        total: data.nextOffset + data.totalRemaining
      });

      console.log('✅ VIC Scraper: Batch complete', {
        processed: data.results.length,
        hasMore: data.hasMore,
        totalRemaining: data.totalRemaining
      });

      // If there are more villages and not paused, continue
      if (data.hasMore && !isPaused && isMountedRef.current) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause between batches
        if (isMountedRef.current) {
          await runBatch();
        }
      } else if (!data.hasMore && isMountedRef.current) {
        setIsRunning(false);
        alert(`🎉 Scraping complete! Found ${summary.success + data.summary.success} websites.`);
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('⏸️ VIC Scraper: Request was aborted');
        return;
      }
      
      if (!isMountedRef.current) return;
      
      console.error('❌ VIC Scraper: Fatal error', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      alert(`Error: ${error.message}`);
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-white border-2 border-blue-300 p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-blue-900">VIC Website Scraper</h2>
        </div>
        {isRunning && (
          <div className="px-3 py-1 bg-blue-100 border border-blue-400 rounded-full text-sm font-semibold text-blue-900 animate-pulse">
            🔄 Scraping...
          </div>
        )}
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li><strong>Phase 1:</strong> Finds the operator's official website domain</li>
          <li><strong>Phase 2:</strong> Searches for the specific village page on that domain</li>
          <li><strong>Smart filtering:</strong> Excludes aggregator sites (agedcareonline, etc.)</li>
          <li><strong>Auto-saves:</strong> Updates database as it finds websites</li>
          <li><strong>Rate limited:</strong> 2 second delay between requests</li>
          <li><strong>Batch processing:</strong> {batchSize} villages per batch</li>
        </ul>
      </div>

      {/* Progress */}
      {isRunning && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>
              {progress.total > 0 
                ? `Progress: ${progress.current} / ${progress.total}` 
                : 'Starting scraper...'}
            </span>
            <span>
              {progress.total > 0 
                ? `${Math.round((progress.current / progress.total) * 100)}%` 
                : '0%'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ 
                width: progress.total > 0 
                  ? `${(progress.current / progress.total) * 100}%` 
                  : '0%' 
              }}
            />
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {isRunning && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-900">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Found</span>
            </div>
            <div className="text-2xl font-bold text-green-900 mt-1">{summary.success}</div>
          </div>
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-900">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Not Found</span>
            </div>
            <div className="text-2xl font-bold text-yellow-900 mt-1">{summary.notFound}</div>
          </div>
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-900">
              <XCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Errors</span>
            </div>
            <div className="text-2xl font-bold text-red-900 mt-1">{summary.errors}</div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3 mb-4">
        {!isRunning && (
          <button
            onClick={startScraping}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            Start Scraping
          </button>
        )}

        {isRunning && !isPaused && (
          <button
            onClick={pauseScraping}
            className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold flex items-center justify-center gap-2"
          >
            <Pause className="w-4 h-4" />
            Pause
          </button>
        )}

        {isPaused && (
          <button
            onClick={resumeScraping}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            Resume
          </button>
        )}

        {(isRunning || isPaused) && (
          <button
            onClick={resetScraper}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        )}
      </div>

      {/* Recent Results */}
      {results.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Recent Results (last {Math.min(20, results.length)}):</h3>
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Village</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Website</th>
                </tr>
              </thead>
              <tbody>
                {results.slice(-20).reverse().map((result, idx) => (
                  <tr key={`${result.villageId}-${idx}`} className="border-t border-gray-100">
                    <td className="px-4 py-2 text-gray-900">{result.villageName}</td>
                    <td className="px-4 py-2">
                      {result.status === 'success' && (
                        <span className="inline-flex items-center gap-1 text-green-700">
                          <CheckCircle className="w-3 h-3" /> Found
                        </span>
                      )}
                      {result.status === 'not_found' && (
                        <span className="inline-flex items-center gap-1 text-yellow-700">
                          <AlertCircle className="w-3 h-3" /> Not Found
                        </span>
                      )}
                      {result.status === 'error' && (
                        <span className="inline-flex items-center gap-1 text-red-700">
                          <XCircle className="w-3 h-3" /> Error
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-600 text-xs">
                      {result.website ? (
                        <a 
                          href={result.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate block max-w-md"
                        >
                          {result.website}
                        </a>
                      ) : (
                        <span className="text-gray-400">{result.error || '-'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Box */}
      {!isRunning && results.length === 0 && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
          <p className="mb-2">
            <strong>ℹ️ Before you start:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Make sure you've deleted the bad aggregator URLs first</li>
            <li>This will only scrape villages that have operators assigned</li>
            <li>You can pause and resume at any time</li>
            <li>Results are saved to the database immediately</li>
            <li>Estimated time: ~2-3 minutes per 10 villages</li>
          </ol>
        </div>
      )}
    </div>
  );
}