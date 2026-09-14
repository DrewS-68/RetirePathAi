import React, { useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Debug tool to test Google search and see actual results
 */
export function GoogleSearchDebugger() {
  const { accessToken } = useAuth();
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testSearch = async () => {
    setSearching(true);
    setResult(null);

    try {
      // Test with Aberle (Keyton operator) - changed to Abervale (correct name)
      const testVillage = {
        id: 'test-id',
        name: 'Abervale',  // ✅ Fixed name
        suburb: 'Keilor',
        state: 'VIC',
        operator: 'Keyton'
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scraper/find-websites`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            villages: [testVillage]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);

    } catch (error) {
      console.error('Error testing search:', error);
      setResult({ error: String(error) });
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-200">
      <div className="flex items-center gap-2 mb-4">
        <Search className="size-5 text-purple-600" />
        <h3 className="text-lg font-semibold">🔍 Google Search Debugger</h3>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-purple-800">
          <strong>Test Google search</strong> with Aberle (Keyton) to see what URLs are being found.
        </p>
      </div>

      <button
        onClick={testSearch}
        disabled={searching}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 mb-4"
      >
        {searching ? (
          <>
            <Search className="size-4 animate-spin" />
            Searching Google...
          </>
        ) : (
          <>
            <Search className="size-4" />
            Test Google Search
          </>
        )}
      </button>

      {result && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg border bg-gray-50">
            <h4 className="font-semibold mb-2">Raw Result:</h4>
            <pre className="text-xs font-mono overflow-auto max-h-96 bg-white p-3 rounded border">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>

          {result.results?.[0] && (
            <div className={`p-4 rounded-lg border ${result.results[0].status === 'found' ? 'bg-green-50 border-green-200' : result.results[0].status === 'error' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <h4 className="font-semibold mb-2">Result Summary:</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Status:</strong> {result.results[0].status}</div>
                {result.results[0].website && <div><strong>Website:</strong> <a href={result.results[0].website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{result.results[0].website}</a></div>}
                {result.results[0].websiteType && <div><strong>Type:</strong> {result.results[0].websiteType}</div>}
                {result.results[0].error && <div className="text-red-600"><strong>Error:</strong> {result.results[0].error}</div>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}