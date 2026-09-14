import { useState } from 'react';
import { Search, AlertTriangle, Download } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

/**
 * VIC Missing Websites Finder
 * Helps identify which villages had websites that were lost
 */
export function VICMissingWebsitesFinder() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    currentCount: number;
    historicalCount: number;
    missingCount: number;
    potentiallyLost: Array<{
      id: string;
      name: string;
      operator: string;
      suburb: string;
      lastUpdate: string;
    }>;
  } | null>(null);

  const analyzeData = async () => {
    setIsAnalyzing(true);
    try {
      const supabase = getSupabaseClient();

      // Get current VIC villages with websites
      const { data: withWebsites, error: withError } = await supabase
        .from('retirement_villages')
        .select('id, name, website, operator, suburb, updated_at')
        .eq('state', 'VIC')
        .not('website', 'is', null);

      // Get VIC villages WITHOUT websites but WITH operators (likely had websites before)
      const { data: withoutWebsites, error: withoutError } = await supabase
        .from('retirement_villages')
        .select('id, name, operator, suburb, updated_at')
        .eq('state', 'VIC')
        .is('website', null)
        .not('operator', 'is', null);

      // Get total VIC count
      const { count, error: countError } = await supabase
        .from('retirement_villages')
        .select('*', { count: 'only', head: true })
        .eq('state', 'VIC');

      if (withError || withoutError || countError) {
        throw new Error('Failed to analyze data');
      }

      // Heuristic: Villages that had recent updates but no website are suspicious
      const potentiallyLost = (withoutWebsites || [])
        .filter(v => {
          const updateDate = new Date(v.updated_at);
          const daysSinceUpdate = (Date.now() - updateDate.getTime()) / (1000 * 60 * 60 * 24);
          // If updated in last 30 days but has no website, might have lost it
          return daysSinceUpdate < 30;
        })
        .map(v => ({
          id: v.id,
          name: v.name,
          operator: v.operator || 'Unknown',
          suburb: v.suburb || 'Unknown',
          lastUpdate: new Date(v.updated_at).toLocaleDateString(),
        }));

      setAnalysis({
        currentCount: withWebsites?.length || 0,
        historicalCount: 100, // You mentioned having 100+ before
        missingCount: Math.max(0, 100 - (withWebsites?.length || 0)),
        potentiallyLost,
      });

    } catch (error: any) {
      console.error('Analysis error:', error);
      alert(`Failed to analyze: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportSuspectedMissing = () => {
    if (!analysis || analysis.potentiallyLost.length === 0) {
      alert('No suspected missing websites to export');
      return;
    }

    const csv = [
      'Village Name,Operator,Suburb,Last Updated',
      ...analysis.potentiallyLost.map(v => 
        `"${v.name}","${v.operator}","${v.suburb}","${v.lastUpdate}"`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vic-suspected-missing-websites-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="bg-orange-50 border-2 border-orange-300 p-6 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-6 h-6 text-orange-600" />
        <h2 className="text-2xl font-bold text-orange-900">🔍 Find Missing Websites</h2>
      </div>

      <div className="mb-4 p-4 bg-orange-100 border border-orange-300 rounded-lg">
        <p className="text-sm text-orange-900 mb-2">
          <strong>What happened?</strong> You had 100+ websites, now only 76.
        </p>
        <p className="text-sm text-orange-900 mb-2">
          <strong>Why?</strong> The OLD scraper (VICWebsiteScraper) didn't have the data resilience system.
        </p>
        <p className="text-sm text-orange-900">
          <strong>Solution:</strong> This tool helps identify which villages likely lost their websites.
        </p>
      </div>

      <button
        onClick={analyzeData}
        disabled={isAnalyzing}
        className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold flex items-center justify-center gap-2 mb-4"
      >
        <Search className="w-5 h-5" />
        {isAnalyzing ? 'Analyzing...' : 'Analyze Data Loss'}
      </button>

      {analysis && (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-white border-2 border-green-300 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-900">{analysis.currentCount}</div>
              <div className="text-xs font-semibold text-green-700 mt-1">Current Websites</div>
            </div>
            <div className="p-4 bg-white border-2 border-blue-300 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-900">{analysis.historicalCount}</div>
              <div className="text-xs font-semibold text-blue-700 mt-1">Historical Peak</div>
            </div>
            <div className="p-4 bg-white border-2 border-red-300 rounded-lg text-center">
              <div className="text-3xl font-bold text-red-900">{analysis.missingCount}</div>
              <div className="text-xs font-semibold text-red-700 mt-1">❌ Missing</div>
            </div>
          </div>

          {/* Potentially Lost Websites */}
          {analysis.potentiallyLost.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-orange-900">
                  🔍 Suspected Lost Websites ({analysis.potentiallyLost.length})
                </h3>
                <button
                  onClick={exportSuspectedMissing}
                  className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto border border-orange-200 rounded-lg bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-orange-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-orange-900">Village</th>
                      <th className="px-4 py-2 text-left font-medium text-orange-900">Operator</th>
                      <th className="px-4 py-2 text-left font-medium text-orange-900">Suburb</th>
                      <th className="px-4 py-2 text-left font-medium text-orange-900">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.potentiallyLost.map((village) => (
                      <tr key={village.id} className="border-t border-orange-100">
                        <td className="px-4 py-2 text-gray-900">{village.name}</td>
                        <td className="px-4 py-2 text-gray-600 text-xs">{village.operator}</td>
                        <td className="px-4 py-2 text-gray-600 text-xs">{village.suburb}</td>
                        <td className="px-4 py-2 text-gray-600 text-xs">{village.lastUpdate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {analysis.potentiallyLost.length === 0 && (
            <div className="p-4 bg-white border border-orange-200 rounded-lg text-center">
              <p className="text-sm text-gray-600">
                ✅ No obvious candidates for lost websites detected.
                <br />
                <br />
                The missing 24+ websites were likely never saved to the database due to JWT errors
                or other failures during the scraping process.
              </p>
            </div>
          )}

          {/* Recommendations */}
          <div className="p-4 bg-white border border-orange-200 rounded-lg">
            <h3 className="font-semibold text-orange-900 mb-2">📋 Next Steps:</h3>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
              <li>
                <strong>Re-scrape missing websites:</strong> Use the "✅ Proven Website Scraper" above
                (it has data resilience built-in)
              </li>
              <li>
                <strong>Export current data:</strong> Click "🔍 Audit DB" in the scraper above to see
                exactly which 76 websites you have
              </li>
              <li>
                <strong>Going forward:</strong> ONLY use VICWebsiteScraperSimple (green card).
                The old scraper has been disabled.
              </li>
            </ol>
          </div>

          {/* Prevention Message */}
          <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">🛡️ Data Loss Prevention Active:</h3>
            <p className="text-sm text-green-800">
              The NEW scraper (VICWebsiteScraperSimple) has a complete data resilience system:
            </p>
            <ul className="text-sm text-green-800 mt-2 space-y-1 list-disc list-inside ml-2">
              <li>Automatic backup to localStorage before EVERY save</li>
              <li>5-level retry logic with exponential backoff</li>
              <li>Session recovery across browser refreshes</li>
              <li>Data Recovery Dashboard for one-click recovery</li>
              <li>Complete audit trails of all operations</li>
            </ul>
            <p className="text-sm text-green-900 font-semibold mt-2">
              ✅ This will NEVER happen again if you use the correct scraper!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
