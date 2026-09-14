import React, { useState } from 'react';
import { Database, Download, Globe } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

/**
 * Analyze VIC villages that ALREADY HAVE websites
 * FOCUS ON DOMAINS - Operator data is unreliable!
 */
export const VICWebsiteAnalyzer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const analyzeWebsites = async () => {
    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      
      // Get ALL VIC villages WITH websites
      const { data: villages, error } = await supabase
        .from('retirement_villages')
        .select('id, name, suburb, state, operator, website')
        .eq('state', 'VIC')
        .not('website', 'is', null)
        .order('website');

      if (error) throw error;

      console.log(`Found ${villages?.length || 0} VIC villages WITH websites`);

      // Analyze by DOMAIN (not operator!)
      const domainGroups: Record<string, any[]> = {};
      const domainCounts: Record<string, number> = {};

      villages?.forEach(v => {
        try {
          const url = new URL(v.website);
          const domain = url.hostname.replace('www.', '');
          
          if (!domainGroups[domain]) {
            domainGroups[domain] = [];
          }
          domainGroups[domain].push(v);
          domainCounts[domain] = (domainCounts[domain] || 0) + 1;
        } catch (e) {
          console.error(`Invalid URL: ${v.website}`);
        }
      });

      // Sort domains by count
      const sortedDomains = Object.entries(domainCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number));

      setAnalysis({
        total: villages?.length || 0,
        domainCounts,
        domainGroups,
        sortedDomains,
        allVillages: villages
      });

    } catch (error: any) {
      console.error('Error analyzing websites:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToJSON = () => {
    if (!analysis) return;

    const blob = new Blob([JSON.stringify(analysis.allVillages, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vic-villages-with-websites-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-purple-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-purple-900">VIC Website Analyzer</h2>
        </div>
      </div>

      <div className="mb-4 p-4 bg-purple-50 rounded-lg">
        <h3 className="font-semibold text-purple-900 mb-2">🔍 What This Does</h3>
        <p className="text-sm text-purple-800">
          Analyzes VIC villages by DOMAIN (not operator - that data is unreliable).
          Shows which domains are most common and what URL patterns actually work.
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={analyzeWebsites}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? '🔍 Analyzing...' : '🔍 Analyze VIC Websites'}
        </button>

        {analysis && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">📊 Summary</h3>
              <p className="text-2xl font-bold text-green-600">{analysis.total} villages have websites</p>
              <p className="text-sm text-green-700 mt-1">Spread across {analysis.sortedDomains.length} different domains</p>
            </div>

            {/* Top Domains */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">🌐 Top Domains (What Actually Works)</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {analysis.sortedDomains.slice(0, 30).map(([domain, count]: [string, number]) => (
                  <div key={domain} className="flex justify-between items-center p-2 bg-white rounded border border-blue-100">
                    <span className="font-mono text-sm text-blue-900">{domain}</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm font-semibold">
                      {count} villages
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Domain Breakdown */}
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <h3 className="font-semibold text-indigo-900 mb-3">📝 Sample URLs by Domain</h3>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {analysis.sortedDomains.slice(0, 20).map(([domain, count]: [string, number]) => {
                  const samples = analysis.domainGroups[domain].slice(0, 5);
                  return (
                    <div key={domain} className="p-3 bg-white rounded border border-indigo-100">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-mono font-semibold text-indigo-900">{domain}</h4>
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-900 rounded text-xs font-semibold">
                          {count} total
                        </span>
                      </div>
                      <div className="space-y-2">
                        {samples.map((v: any) => (
                          <div key={v.id} className="text-xs border-l-2 border-indigo-200 pl-2">
                            <div className="font-medium text-indigo-800">
                              {v.name} {v.suburb && `(${v.suburb})`}
                            </div>
                            <div className="text-indigo-600 text-xs">{v.operator || 'No operator'}</div>
                            <a 
                              href={v.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-indigo-500 hover:underline break-all text-xs"
                            >
                              {v.website}
                            </a>
                          </div>
                        ))}
                        {count > 5 && (
                          <div className="text-xs text-indigo-600 italic pl-2">
                            ...and {count - 5} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* URL Pattern Analysis */}
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-3">🎯 URL Pattern Insights</h3>
              <div className="space-y-2 text-sm text-amber-800">
                {analysis.sortedDomains.slice(0, 5).map(([domain, count]: [string, number]) => {
                  const samples = analysis.domainGroups[domain];
                  const urls = samples.map((v: any) => v.website);
                  
                  // Try to detect pattern
                  const hasVicInPath = urls.some((u: string) => u.toLowerCase().includes('/vic'));
                  const hasRetirementInPath = urls.some((u: string) => u.toLowerCase().includes('/retirement'));
                  const hasVillageInPath = urls.some((u: string) => u.toLowerCase().includes('/village'));
                  
                  return (
                    <div key={domain} className="p-2 bg-white rounded border border-amber-100">
                      <div className="font-mono font-semibold text-amber-900">{domain}</div>
                      <div className="text-xs text-amber-700 mt-1">
                        {hasVicInPath && <span className="mr-2">✓ Uses /vic in path</span>}
                        {hasRetirementInPath && <span className="mr-2">✓ Uses /retirement in path</span>}
                        {hasVillageInPath && <span className="mr-2">✓ Uses /village in path</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={exportToJSON}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export All to JSON
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
