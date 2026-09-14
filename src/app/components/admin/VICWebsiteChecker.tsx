import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, Globe, AlertTriangle, CheckCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface VICStats {
  totalVIC: number;
  withWebsite: number;
  withoutWebsite: number;
  sampleWithWebsites: Array<{
    id: string;
    name: string;
    suburb: string;
    website: string;
  }>;
  sampleWithoutWebsites: Array<{
    id: string;
    name: string;
    suburb: string;
  }>;
}

export function VICWebsiteChecker() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<VICStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkVIC = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/check-vic-websites`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check VIC websites');
      }

      const data = await response.json();
      setStats(data);

    } catch (err) {
      console.error('VIC Website Check Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to check VIC websites');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Globe className="size-6 text-blue-600" />
            🔍 VIC Website Status Checker
          </h2>
          <p className="text-gray-600">
            Check how many Victorian villages have websites vs need websites
          </p>
        </div>
        <Button onClick={checkVIC} disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
          Check VIC Status
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <AlertTriangle className="size-5 inline mr-2" />
          {error}
        </div>
      )}

      {stats && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-6 bg-blue-50 rounded-lg border-2 border-blue-300">
              <div className="text-4xl font-bold text-blue-900 mb-2">
                {stats.totalVIC}
              </div>
              <div className="text-sm font-semibold text-blue-700 uppercase">
                Total VIC Villages
              </div>
            </div>

            <div className="p-6 bg-green-50 rounded-lg border-2 border-green-300">
              <div className="text-4xl font-bold text-green-900 mb-2">
                {stats.withWebsite}
              </div>
              <div className="text-sm font-semibold text-green-700 uppercase">
                ✅ Have Websites
              </div>
              <div className="text-xs text-green-600 mt-1">
                {stats.totalVIC > 0 ? Math.round((stats.withWebsite / stats.totalVIC) * 100) : 0}% complete
              </div>
            </div>

            <div className="p-6 bg-orange-50 rounded-lg border-2 border-orange-300">
              <div className="text-4xl font-bold text-orange-900 mb-2">
                {stats.withoutWebsite}
              </div>
              <div className="text-sm font-semibold text-orange-700 uppercase">
                ❌ Need Websites
              </div>
              <div className="text-xs text-orange-600 mt-1">
                Still to find
              </div>
            </div>
          </div>

          {/* Analysis */}
          <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              📊 Analysis
            </h3>
            <div className="space-y-2 text-gray-800">
              {stats.withWebsite === 510 && (
                <div className="p-4 bg-green-100 border-2 border-green-400 rounded-lg">
                  <p className="text-2xl font-bold text-green-800 mb-2">
                    🎉 100% COMPLETE!
                  </p>
                  <p className="text-lg text-green-700">
                    All 510 VIC villages now have websites! Ready for scraping amenities, pricing, and images.
                  </p>
                </div>
              )}
              {stats.withWebsite > 0 && stats.withWebsite < 510 && (
                <>
                  <p className="text-lg">
                    ✅ <strong>Auto-processor is WORKING!</strong> Found {stats.withWebsite} websites out of 510 VIC villages.
                  </p>
                  <p className="text-lg text-orange-600 font-semibold mt-4">
                    🔄 <strong>Keep Going:</strong> Run auto-processor {Math.ceil(stats.withoutWebsite / 46)} more times to find the remaining {stats.withoutWebsite} websites.
                  </p>
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-300 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-2">📍 How to continue:</p>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Go to <strong>Scraper</strong> tab at the top</li>
                      <li>Scroll to <strong>"Web Scraper Tool"</strong></li>
                      <li>Click <strong>"Start Auto-Processing"</strong> under the AUTO-PROCESSOR section</li>
                      <li>Wait 2-3 minutes for each batch to complete</li>
                      <li>Come back here and click <strong>"Check VIC Status"</strong> to see updated progress</li>
                      <li>Repeat until you see <strong>510/510 (100%)</strong></li>
                    </ol>
                  </div>
                </>
              )}
              {stats.withWebsite === 0 && (
                <p className="text-lg text-red-600">
                  ❌ <strong>Auto-processor FAILED!</strong> No websites found. The batch process may not have saved results.
                </p>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-300">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold">🎯 Overall Progress</h3>
              <span className="text-2xl font-bold text-blue-900">
                {stats.totalVIC > 0 ? Math.round((stats.withWebsite / stats.totalVIC) * 100) : 0}%
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-8 mb-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-600 h-8 rounded-full transition-all duration-500 flex items-center justify-center text-white text-sm font-bold"
                style={{ width: `${stats.totalVIC > 0 ? (stats.withWebsite / stats.totalVIC) * 100 : 0}%` }}
              >
                {stats.withWebsite} / {stats.totalVIC}
              </div>
            </div>

            {/* Batch Calculation */}
            {stats.withoutWebsite > 0 && (
              <div className="text-sm text-gray-700">
                <p className="mb-2">
                  <strong>Batches Remaining:</strong> ~{Math.ceil(stats.withoutWebsite / 46)} batches
                  <span className="text-gray-600 ml-2">(each batch processes ~46 villages)</span>
                </p>
                <p>
                  <strong>Estimated Time:</strong> ~{Math.ceil(stats.withoutWebsite / 46) * 2}-{Math.ceil(stats.withoutWebsite / 46) * 3} minutes
                  <span className="text-gray-600 ml-2">(if you run them back-to-back)</span>
                </p>
              </div>
            )}
          </div>

          {/* Sample Villages WITH Websites */}
          {stats.sampleWithWebsites.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <CheckCircle className="size-5 text-green-600" />
                Sample Villages WITH Websites (first 10)
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                {stats.sampleWithWebsites.map((village) => (
                  <div key={village.id} className="text-sm">
                    <strong>{village.name}</strong> ({village.suburb})
                    <br />
                    <a href={village.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                      {village.website}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sample Villages WITHOUT Websites */}
          {stats.sampleWithoutWebsites.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <AlertTriangle className="size-5 text-orange-600" />
                Sample Villages WITHOUT Websites (first 10)
              </h3>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-2">
                {stats.sampleWithoutWebsites.map((village) => (
                  <div key={village.id} className="text-sm">
                    <strong>{village.name}</strong> ({village.suburb})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}