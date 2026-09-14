import { useState } from 'react';
import { Search, TrendingDown, AlertTriangle } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

/**
 * Diagnostics tool to analyze why website scraping has low success rate
 */
export function WebsiteScraperDiagnostics() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();

      // 1. Get all VIC villages without websites
      const { data: villages, error } = await supabase
        .from('retirement_villages')
        .select('id, name, suburb, operator, website')
        .eq('state', 'VIC')
        .is('website', null)
        .order('name');

      if (error) throw error;

      // 2. Get URL patterns from KV store
      const patternsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/kv/get`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ key: 'vic_operator_url_patterns' })
        }
      );

      let patterns = [];
      if (patternsResponse.ok) {
        const text = await patternsResponse.text();
        try {
          const patternsData = text ? JSON.parse(text) : null;
          patterns = patternsData?.value || [];
        } catch (e) {
          console.error('Failed to parse patterns response:', text);
        }
      } else {
        console.warn('No URL patterns found in KV store');
      }

      // 3. Analyze operator distribution
      const operatorCounts: Record<string, number> = {};
      const operatorsWithPatterns = new Set(patterns.map((p: any) => p.operator.toLowerCase()));
      const operatorsWithoutPatterns: Record<string, number> = {};

      for (const village of villages) {
        const operator = village.operator || 'Unknown';
        operatorCounts[operator] = (operatorCounts[operator] || 0) + 1;

        if (!operatorsWithPatterns.has(operator.toLowerCase())) {
          operatorsWithoutPatterns[operator] = (operatorsWithoutPatterns[operator] || 0) + 1;
        }
      }

      // 4. Calculate statistics
      const totalVillages = villages.length;
      const unknownOperatorCount = operatorCounts['Unknown'] || 0;
      const villagesWithPatterns = villages.filter(v => 
        v.operator && operatorsWithPatterns.has(v.operator.toLowerCase())
      ).length;

      // 5. Top operators without patterns
      const topOperatorsNoPatterns = Object.entries(operatorsWithoutPatterns)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([operator, count]) => ({ operator, count }));

      // 6. Operators with patterns
      const operatorsWithPatternsData = patterns.map((p: any) => ({
        operator: p.operator,
        baseUrl: p.baseUrl,
        pattern: p.pattern,
        villageCount: operatorCounts[p.operator] || 0
      }));

      setAnalysis({
        totalVillages,
        unknownOperatorCount,
        villagesWithPatterns,
        villagesWithoutPatterns: totalVillages - villagesWithPatterns - unknownOperatorCount,
        patternsCount: patterns.length,
        operatorCounts,
        operatorsWithPatternsData,
        topOperatorsNoPatterns,
        coveragePercent: Math.round((villagesWithPatterns / totalVillages) * 100)
      });

    } catch (error: any) {
      console.error('Diagnostic error:', error);
      setError(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white border-2 border-yellow-300 p-6 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-6 h-6 text-yellow-600" />
        <h2 className="text-2xl font-bold text-yellow-900">🔍 Scraper Diagnostics</h2>
      </div>

      <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-900">
          <strong>Problem:</strong> Only 23% success rate (44/190 villages)
        </p>
        <p className="text-sm text-yellow-800 mt-2">
          This tool analyzes why the scraper is missing so many websites.
        </p>
      </div>

      {!analysis && (
        <button
          onClick={runDiagnostics}
          disabled={isAnalyzing}
          className="w-full px-6 py-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold disabled:opacity-50"
        >
          {isAnalyzing ? '🔍 Analyzing...' : '🔍 Run Diagnostics'}
        </button>
      )}

      {analysis && (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-700 mb-1">Total Villages Needing Websites</div>
              <div className="text-3xl font-bold text-blue-900">{analysis.totalVillages}</div>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm text-green-700 mb-1">URL Pattern Coverage</div>
              <div className="text-3xl font-bold text-green-900">{analysis.coveragePercent}%</div>
              <div className="text-xs text-green-600 mt-1">
                {analysis.villagesWithPatterns} villages have operators with URL patterns
              </div>
            </div>
          </div>

          {/* Problem Areas */}
          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-red-900">Problem Areas</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-red-800">Unknown Operators:</span>
                <span className="font-bold text-red-900">{analysis.unknownOperatorCount} villages</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-800">Operators Without URL Patterns:</span>
                <span className="font-bold text-red-900">{analysis.villagesWithoutPatterns} villages</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-800">Total URL Patterns:</span>
                <span className="font-bold text-red-900">{analysis.patternsCount} patterns</span>
              </div>
            </div>
          </div>

          {/* Top Operators WITHOUT Patterns */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-3">
              🎯 Top 15 Operators WITHOUT URL Patterns (High Priority)
            </h3>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Operator</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-700">Villages</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.topOperatorsNoPatterns.map((item: any, idx: number) => (
                    <tr key={idx} className="border-t border-gray-100">
                      <td className="px-3 py-2 text-gray-900">{item.operator}</td>
                      <td className="px-3 py-2 text-right font-semibold text-gray-900">{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Operators WITH Patterns */}
          <div className="border border-green-200 rounded-lg p-4 bg-green-50">
            <h3 className="font-bold text-green-900 mb-3">
              ✅ Operators WITH URL Patterns ({analysis.patternsCount})
            </h3>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-green-100 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-green-800">Operator</th>
                    <th className="px-3 py-2 text-left font-medium text-green-800">Base URL</th>
                    <th className="px-3 py-2 text-right font-medium text-green-800">Villages</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.operatorsWithPatternsData.map((item: any, idx: number) => (
                    <tr key={idx} className="border-t border-green-100">
                      <td className="px-3 py-2 text-green-900">{item.operator}</td>
                      <td className="px-3 py-2 text-green-700 truncate max-w-xs">{item.baseUrl}</td>
                      <td className="px-3 py-2 text-right font-semibold text-green-900">{item.villageCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-bold text-blue-900 mb-2">💡 Recommendations</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>
                <strong>Priority 1:</strong> Add URL patterns for top operators without patterns 
                (would improve coverage by ~{Math.round((analysis.villagesWithoutPatterns / analysis.totalVillages) * 100)}%)
              </li>
              <li>
                <strong>Priority 2:</strong> Fix {analysis.unknownOperatorCount} villages with "Unknown" operators
              </li>
              <li>
                <strong>Priority 3:</strong> Review validation logic - may be too strict
              </li>
              <li>
                <strong>Current Pattern Coverage:</strong> {analysis.coveragePercent}% (should aim for 60-70%)
              </li>
            </ul>
          </div>

          <button
            onClick={() => setAnalysis(null)}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Run Again
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-red-900">Error</h3>
          </div>
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}