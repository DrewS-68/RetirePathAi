import React, { useState } from 'react';
import { AlertCircle, CheckCircle, RefreshCw, Bug } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export default function ScraperAPIDebugger() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testScraperAPI = async () => {
    setTesting(true);
    setResult(null);
    setError(null);

    try {
      console.log('🐛 Starting THREE-PHASE scraper test...');
      
      // Call the REAL scraper endpoint with Admillan test
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scraper/find-websites`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            villages: [{
              id: 'test-admillan',
              name: 'Admillan Retirement Living',
              suburb: 'Moonee Ponds',
              operator: 'RSL Victoria',  // ✅ Correct operator from database
              state: 'VIC'
            }]
          })
        }
      );

      console.log('🐛 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData, null, 2));
      }

      const data = await response.json();
      console.log('🐛 Response data:', data);
      
      setResult(data);
    } catch (err: any) {
      console.error('🐛 Error:', err);
      setError(err.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bug className="w-8 h-8 text-red-500" />
          <div>
            <h1 className="text-2xl font-bold">🐛 ScraperAPI Debugger</h1>
            <p className="text-gray-600 text-sm">
              Test ScraperAPI Google Search integration directly
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Test Details</h3>
          <p className="text-blue-800 text-sm">
            This will test searching for <strong>"Admillan Retirement Living"</strong> using ScraperAPI's Google Search structured JSON API.
          </p>
        </div>

        <button
          onClick={testScraperAPI}
          disabled={testing}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium shadow"
        >
          {testing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Testing ScraperAPI...
            </>
          ) : (
            <>
              <Bug className="w-5 h-5" />
              Run Debug Test
            </>
          )}
        </button>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-2">❌ Error</h3>
                <pre className="text-red-800 text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                  {error}
                </pre>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-4">
            {/* Show scraper results */}
            {result.results && result.results.length > 0 && (
              <div className="space-y-4">
                {result.results.map((villageResult: any, idx: number) => (
                  <div key={idx}>
                    {/* Success */}
                    {villageResult.status === 'found' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-green-900 mb-2">✅ Official Website Found!</h3>
                            <div className="space-y-2 text-sm text-green-800">
                              <p><strong>Village:</strong> {villageResult.villageName}</p>
                              <p><strong>Suburb:</strong> {villageResult.suburb}</p>
                              <p><strong>Website:</strong> <a href={villageResult.website} target="_blank" rel="noopener noreferrer" className="underline">{villageResult.website}</a></p>
                              <p><strong>Type:</strong> {villageResult.websiteType}</p>
                              <p><strong>Confidence:</strong> {villageResult.confidence}%</p>
                            </div>
                            {villageResult.debug && (
                              <details className="mt-3">
                                <summary className="cursor-pointer text-xs text-green-700 font-semibold">🔍 Debug Info</summary>
                                <pre className="text-xs mt-2 bg-white p-2 rounded border border-green-200 overflow-x-auto">
                                  {JSON.stringify(villageResult.debug, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Not Found */}
                    {villageResult.status === 'not_found' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-yellow-900 mb-2">⚠️ No Official Website Found</h3>
                            <div className="space-y-2 text-sm text-yellow-800">
                              <p><strong>Village:</strong> {villageResult.villageName}</p>
                              <p><strong>Suburb:</strong> {villageResult.suburb}</p>
                              <p className="text-yellow-700">Only aggregator sites found (rejected per user requirements)</p>
                            </div>
                            {villageResult.debug && (
                              <details className="mt-3">
                                <summary className="cursor-pointer text-xs text-yellow-700 font-semibold">🔍 Debug Info</summary>
                                <pre className="text-xs mt-2 bg-white p-2 rounded border border-yellow-200 overflow-x-auto">
                                  {JSON.stringify(villageResult.debug, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Validation Failed */}
                    {villageResult.status === 'validation_failed' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-red-900 mb-2">❌ Validation Failed</h3>
                            <div className="space-y-2 text-sm text-red-800">
                              <p><strong>Village:</strong> {villageResult.villageName}</p>
                              <p><strong>Rejected URL:</strong> {villageResult.rejectedUrl}</p>
                              {villageResult.validationWarnings && (
                                <div>
                                  <p className="font-semibold">Warnings:</p>
                                  <ul className="list-disc list-inside">
                                    {villageResult.validationWarnings.map((w: string, i: number) => (
                                      <li key={i}>{w}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Error */}
                    {villageResult.status === 'error' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-red-900 mb-2">❌ Error</h3>
                            <div className="space-y-2 text-sm text-red-800">
                              <p><strong>Village:</strong> {villageResult.villageName}</p>
                              <p><strong>Error:</strong> {villageResult.error}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Backend info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">📊 Backend Info:</h3>
              <div className="text-xs text-gray-700 space-y-1">
                <p><strong>Backend Version:</strong> {result.backendVersion || 'Unknown'}</p>
                <p><strong>Success:</strong> {result.success ? '✅' : '❌'}</p>
                {result.testMessage && <p><strong>Message:</strong> {result.testMessage}</p>}
              </div>
            </div>

            {/* Full response */}
            <details>
              <summary className="cursor-pointer text-sm font-semibold text-gray-700">📄 Full Response Data</summary>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
                <pre className="text-xs overflow-x-auto whitespace-pre-wrap font-mono text-gray-700 bg-white p-4 rounded border border-gray-200 max-h-96 overflow-y-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}