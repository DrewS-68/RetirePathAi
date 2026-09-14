import React, { useState } from 'react';
import { RefreshCw, Database, Check, X } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

/**
 * VIC Website Diagnostic Tool
 * Quick diagnostic to check why VIC villages show 0 websites
 */
export function VicWebsiteDiagnostic() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runDiagnostic = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();

      console.log('🔍 Running VIC website diagnostic...');

      // Query 1: Get all VIC villages
      const { data: allVic, error: allError } = await supabase
        .from('retirement_villages')
        .select('id, name, state, status, website, updated_at')
        .eq('state', 'VIC');

      if (allError) {
        console.error('❌ Error fetching villages:', allError);
        alert('Error: ' + allError.message);
        return;
      }

      console.log(`✅ Fetched ${allVic.length} VIC villages`);

      // Calculate stats
      const stats = {
        total: allVic.length,
        byStatus: {} as Record<string, number>,
        withWebsite: 0,
        withoutWebsite: 0,
        approvedTotal: 0,
        approvedWithWebsite: 0,
        approvedWithoutWebsite: 0,
        recentlyUpdated: [] as any[],
        sampleWithWebsite: [] as any[],
        sampleWithoutWebsite: [] as any[],
        allStatuses: [] as string[]
      };

      const uniqueStatuses = new Set<string>();

      allVic.forEach(v => {
        // Track unique statuses
        uniqueStatuses.add(v.status || 'null');
        
        // Count by status
        const status = v.status || 'null';
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

        const hasWebsite = v.website && v.website.trim() !== '';
        const isApproved = v.status === 'approved';

        if (isApproved) {
          stats.approvedTotal++;
        }

        // Count website status
        if (hasWebsite) {
          stats.withWebsite++;
          if (isApproved) {
            stats.approvedWithWebsite++;
          }
          if (stats.sampleWithWebsite.length < 5) {
            stats.sampleWithWebsite.push({
              id: v.id,
              name: v.name,
              status: v.status,
              website: v.website,
              updated_at: v.updated_at
            });
          }
        } else {
          stats.withoutWebsite++;
          if (isApproved) {
            stats.approvedWithoutWebsite++;
          }
          if (stats.sampleWithoutWebsite.length < 5) {
            stats.sampleWithoutWebsite.push({
              id: v.id,
              name: v.name,
              status: v.status,
              updated_at: v.updated_at
            });
          }
        }
      });

      stats.allStatuses = Array.from(uniqueStatuses).sort();

      // Get recently updated (last 2 hours)
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      stats.recentlyUpdated = allVic
        .filter(v => v.updated_at > twoHoursAgo)
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
        .slice(0, 10)
        .map(v => ({
          id: v.id,
          name: v.name,
          status: v.status,
          website: v.website,
          updated_at: v.updated_at
        }));

      console.log('📊 DIAGNOSTIC RESULTS:', stats);
      setResults(stats);

    } catch (error) {
      console.error('❌ Diagnostic error:', error);
      alert('Error running diagnostic: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="size-5 text-blue-600" />
          <h3 className="text-lg font-semibold">VIC Website Diagnostic</h3>
        </div>
        <button
          onClick={runDiagnostic}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? (
            <>
              <RefreshCw className="size-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <RefreshCw className="size-4" />
              Run Diagnostic
            </>
          )}
        </button>
      </div>

      {results && (
        <div className="space-y-4">
          {/* Overall Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total VIC Villages</div>
              <div className="text-2xl font-bold text-blue-900">{results.total}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">With Website</div>
              <div className="text-2xl font-bold text-green-900">{results.withWebsite}</div>
              <div className="text-xs text-gray-500">
                {results.total > 0 ? Math.round((results.withWebsite / results.total) * 100) : 0}%
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Approved Total</div>
              <div className="text-2xl font-bold text-yellow-900">{results.approvedTotal}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Approved + Website</div>
              <div className="text-2xl font-bold text-purple-900">{results.approvedWithWebsite}</div>
              <div className="text-xs text-gray-500">
                {results.approvedTotal > 0 
                  ? Math.round((results.approvedWithWebsite / results.approvedTotal) * 100) 
                  : 0}%
              </div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">By Status:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(results.byStatus).map(([status, count]) => (
                <div key={status} className="bg-white p-2 rounded border">
                  <div className="text-xs text-gray-600">{status}</div>
                  <div className="font-bold">{count as number}</div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-600">
              All unique statuses found: {results.allStatuses.join(', ')}
            </div>
          </div>

          {/* Recently Updated */}
          {results.recentlyUpdated.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Check className="size-4 text-blue-600" />
                Recently Updated (Last 2 hours):
              </h4>
              <div className="space-y-1 text-sm">
                {results.recentlyUpdated.map((v: any) => (
                  <div key={v.id} className="flex justify-between items-center bg-white p-2 rounded">
                    <span className="font-medium">{v.name}</span>
                    <span className="text-xs">
                      {v.website ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <Check className="size-3" /> Has website
                        </span>
                      ) : (
                        <span className="text-gray-400">No website</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sample With Website */}
          {results.sampleWithWebsite.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Sample Villages WITH Websites:</h4>
              <div className="space-y-1 text-sm">
                {results.sampleWithWebsite.map((v: any) => (
                  <div key={v.id} className="bg-white p-2 rounded">
                    <div className="font-medium">{v.name}</div>
                    <div className="text-xs text-gray-600 truncate">{v.website}</div>
                    <div className="text-xs text-gray-400">Status: {v.status}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sample Without Website */}
          {results.sampleWithoutWebsite.length > 0 && (
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Sample Villages WITHOUT Websites:</h4>
              <div className="space-y-1 text-sm">
                {results.sampleWithoutWebsite.map((v: any) => (
                  <div key={v.id} className="bg-white p-2 rounded">
                    <div className="font-medium">{v.name}</div>
                    <div className="text-xs text-gray-400">ID: {v.id}</div>
                    <div className="text-xs text-gray-400">Status: {v.status}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Finding */}
          <div className={`p-4 rounded-lg border-2 ${
            results.approvedWithWebsite === 0 
              ? 'bg-red-50 border-red-300' 
              : 'bg-green-50 border-green-300'
          }`}>
            <h4 className="font-bold mb-2 text-lg">🔍 KEY FINDING:</h4>
            {results.approvedWithWebsite === 0 ? (
              <div className="space-y-2">
                <p className="font-semibold text-red-900">
                  ❌ PROBLEM CONFIRMED: Zero approved VIC villages have websites!
                </p>
                <p className="text-sm">This explains why the batch scraper shows "0 / 505".</p>
                <p className="text-sm font-semibold mt-2">Next Steps:</p>
                <ol className="list-decimal list-inside text-sm space-y-1">
                  <li>Check if AUTO-PROCESSOR is actually saving websites</li>
                  <li>Check backend logs for save-websites endpoint</li>
                  <li>Verify villages being updated have status='approved'</li>
                </ol>
              </div>
            ) : (
              <p className="text-green-900">
                ✅ Found {results.approvedWithWebsite} approved villages with websites!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
