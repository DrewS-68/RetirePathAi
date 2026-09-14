import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { useAuth } from '../../contexts/AuthContext';

/**
 * VIC Operator Check
 * Shows which VIC villages are missing operators before website scraping
 */
export function VicOperatorCheck() {
  const { accessToken } = useAuth();
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<any>(null);

  const checkOperators = async () => {
    setChecking(true);
    setResults(null);

    try {
      // Get all VIC villages without websites
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scraper/debug-vic-websites`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const data = await response.json();
      
      // Count villages with and without operators (among those without websites)
      const withoutWebsite = data.sampleWithoutWebsite || [];
      const withOperator = withoutWebsite.filter((v: any) => v.operator && v.operator.trim() !== '');
      const withoutOperator = withoutWebsite.filter((v: any) => !v.operator || v.operator.trim() === '');

      setResults({
        total: data.total,
        withWebsite: data.withWebsite,
        withoutWebsite: data.withoutWebsite,
        approved: data.approved,
        approvedWithoutWebsite: data.approvedWithoutWebsite,
        readyToScrape: withOperator.length, // Has operator, ready for scraping
        needsOperator: withoutOperator.length, // Missing operator
        sampleReady: withOperator.slice(0, 10),
        sampleNeedsOperator: withoutOperator.slice(0, 10),
      });

    } catch (error) {
      console.error('Error checking operators:', error);
      alert('Failed to check operators');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="size-5 text-orange-600" />
        <h3 className="text-lg font-semibold">VIC Operator Readiness Check</h3>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-orange-800">
          <strong>⚠️ IMPORTANT:</strong> Villages without operators will likely get aggregator listing sites instead of official operator websites.
          Use this tool to check how many villages are ready for scraping vs need operator data first.
        </p>
      </div>

      <button
        onClick={checkOperators}
        disabled={checking}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 mb-4"
      >
        {checking ? (
          <>
            <AlertTriangle className="size-4 animate-spin" />
            Checking...
          </>
        ) : (
          <>
            <AlertTriangle className="size-4" />
            Check Operator Readiness
          </>
        )}
      </button>

      {results && (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-700 mb-1">Total VIC Villages</div>
              <div className="text-2xl font-bold text-blue-900">{results.total}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-700 mb-1">Already Have Websites</div>
              <div className="text-2xl font-bold text-gray-900">{results.withWebsite}</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm text-green-700 mb-1">✅ Ready to Scrape</div>
              <div className="text-xs text-green-600 mb-1">(Has operator, no website)</div>
              <div className="text-2xl font-bold text-green-900">{results.readyToScrape}</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-sm text-red-700 mb-1">❌ Needs Operator</div>
              <div className="text-xs text-red-600 mb-1">(No operator, no website)</div>
              <div className="text-2xl font-bold text-red-900">{results.needsOperator}</div>
            </div>
          </div>

          {/* Readiness Percentage */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-orange-50 rounded-lg border-2 border-orange-300">
            <h4 className="font-semibold mb-2">Scraping Readiness</h4>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                <div
                  className="bg-green-600 h-full flex items-center justify-center text-xs text-white font-semibold"
                  style={{
                    width: `${(results.readyToScrape / (results.readyToScrape + results.needsOperator)) * 100}%`
                  }}
                >
                  {Math.round((results.readyToScrape / (results.readyToScrape + results.needsOperator)) * 100)}%
                </div>
              </div>
              <span className="text-sm font-semibold">
                {results.readyToScrape} / {results.readyToScrape + results.needsOperator} ready
              </span>
            </div>
          </div>

          {/* Sample Villages Ready */}
          {results.sampleReady.length > 0 && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="size-4 text-green-600" />
                Sample Villages Ready to Scrape
              </h4>
              <div className="space-y-2">
                {results.sampleReady.map((v: any, i: number) => (
                  <div key={i} className="text-sm bg-white p-2 rounded border border-green-200">
                    <div className="font-medium">{v.name}</div>
                    <div className="text-xs text-green-700">Operator: {v.operator}</div>
                    <div className="text-xs text-gray-500">{v.suburb}, {v.state}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sample Villages Needing Operators */}
          {results.sampleNeedsOperator.length > 0 && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <XCircle className="size-4 text-red-600" />
                Sample Villages Needing Operators
              </h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                <p className="text-xs text-yellow-800">
                  ⚠️ <strong>Warning:</strong> These villages will likely get aggregator listing sites (agedcareonline.com.au, etc.) instead of official operator websites. 
                  Consider importing operator data first or manually updating these villages.
                </p>
              </div>
              <div className="space-y-2">
                {results.sampleNeedsOperator.map((v: any, i: number) => (
                  <div key={i} className="text-sm bg-white p-2 rounded border border-red-200">
                    <div className="font-medium">{v.name}</div>
                    <div className="text-xs text-red-700">Operator: <em>None</em></div>
                    <div className="text-xs text-gray-500">{v.suburb}, {v.state}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2">📋 Recommendations:</h4>
            {results.needsOperator > results.readyToScrape ? (
              <div className="space-y-2 text-sm text-blue-800">
                <p>⚠️ <strong>Warning:</strong> More villages are missing operators than have them.</p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Import operator data from your CSV files first</li>
                  <li>Then run the website scraper on villages WITH operators</li>
                  <li>Manually review/update villages without operators</li>
                </ol>
              </div>
            ) : (
              <div className="space-y-2 text-sm text-green-800">
                <p>✅ <strong>Good news:</strong> Most villages have operators!</p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Run the E2E test to verify scraping works correctly</li>
                  <li>Then run AUTO-PROCESSOR for villages with operators</li>
                  <li>Import operator data for remaining {results.needsOperator} villages</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
