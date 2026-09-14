import React, { useState } from 'react';
import { Database, Search, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export function ScrapedDataInspector() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInspect = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🔍 Inspecting scraped_data structure...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/database-health-check/inspect-scraped-data`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Scraped data structure:', data);
        setResult(data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Inspection failed');
      }
    } catch (err: any) {
      console.error('Inspection error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg shadow-md p-6 border-2 border-blue-400">
      <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
        <Database className="size-6" />
        🔍 Scraped Data Structure Inspector
      </h3>
      <p className="text-gray-700 mb-4">
        Inspect what's actually inside the <code className="bg-blue-200 px-2 py-1 rounded">scraped_data</code> JSONB field for VIC villages
      </p>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg flex items-start gap-2">
          <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      )}

      {result && (
        <div className="mb-4 p-4 bg-white border border-blue-300 rounded-lg max-h-[600px] overflow-y-auto">
          <h4 className="font-semibold mb-3 text-blue-900">Scraped Data Analysis:</h4>
          
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-blue-50 rounded">
              <div className="font-semibold text-blue-900 mb-2">Summary:</div>
              <div>Total villages: {result.summary.total}</div>
              <div>With scraped_data: {result.summary.withScrapedData}</div>
              <div>Empty scraped_data: {result.summary.emptyScrapedData}</div>
            </div>

            {result.commonKeys && result.commonKeys.length > 0 && (
              <div className="p-3 bg-green-50 rounded">
                <div className="font-semibold text-green-900 mb-2">🔑 Common Keys Found in scraped_data:</div>
                <ul className="list-disc list-inside space-y-1">
                  {result.commonKeys.map((key: string, i: number) => (
                    <li key={i} className="font-mono text-sm">{key}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-3 bg-gray-50 rounded">
              <div className="font-semibold text-gray-900 mb-2">📋 Sample Villages (first 10):</div>
              <div className="space-y-3">
                {result.samples?.map((sample: any, i: number) => (
                  <div key={i} className="p-2 bg-white border border-gray-300 rounded">
                    <div className="font-semibold text-gray-900 mb-1">{sample.name}</div>
                    <div className="text-xs text-gray-600 mb-1">Operator: {sample.operator || 'None'}</div>
                    <div className="text-xs text-gray-600 mb-1">Website field: {sample.website || 'None'}</div>
                    {sample.scrapedData ? (
                      <div className="mt-2">
                        <div className="font-semibold text-xs text-blue-700 mb-1">scraped_data contents:</div>
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(sample.scrapedData, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-xs text-red-600 italic">No scraped_data</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleInspect}
        disabled={loading}
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Search className="size-5 animate-spin" />
            Inspecting...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Search className="size-5" />
            🔍 Inspect scraped_data Structure
          </span>
        )}
      </button>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-sm text-yellow-800">
        <strong>💡 What this checks:</strong> Looks at the actual JSONB structure of scraped_data to see what keys exist and where website data might be hiding.
      </div>
    </div>
  );
}
