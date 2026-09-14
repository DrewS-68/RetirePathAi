import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, CheckCircle, Database, PieChart } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { VicUrlChecker } from '../VicUrlChecker';
import { BulkUrlImporter } from '../BulkUrlImporter';

interface Stats {
  total: number;
  classified: number;
  unclassified: number;
  breakdown: Record<string, number>;
  percentageClassified: string;
}

export function DatabaseStats() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/cleanup/stats`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data);

    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Database className="size-6" />
              Database Statistics
            </h2>
            <p className="text-gray-600">
              Overview of your village database quality and classification status.
            </p>
          </div>
          <Button onClick={fetchStats} disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
            Refresh Stats
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {stats && (
          <>
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Villages */}
              <div className="p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="text-4xl font-bold text-blue-900 mb-2">{stats.total}</div>
                <div className="text-sm font-semibold text-blue-700 uppercase">Total Villages</div>
                <div className="text-xs text-blue-600 mt-1">All villages in database</div>
              </div>

              {/* Classified Villages (100% Correct) */}
              <div className="p-6 bg-green-50 rounded-lg border-2 border-green-200">
                <div className="text-4xl font-bold text-green-900 mb-2">
                  {stats.classified}
                  <span className="text-xl text-green-600 ml-2">({stats.percentageClassified}%)</span>
                </div>
                <div className="text-sm font-semibold text-green-700 uppercase flex items-center gap-1">
                  <CheckCircle className="size-4" />
                  Classified Villages
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Villages with verified facility type (100% correct data)
                </div>
              </div>

              {/* Unclassified Villages (Need Review) */}
              <div className="p-6 bg-orange-50 rounded-lg border-2 border-orange-200">
                <div className="text-4xl font-bold text-orange-900 mb-2">
                  {stats.unclassified}
                  <span className="text-xl text-orange-600 ml-2">
                    ({(100 - parseFloat(stats.percentageClassified)).toFixed(1)}%)
                  </span>
                </div>
                <div className="text-sm font-semibold text-orange-700 uppercase">Unclassified Villages</div>
                <div className="text-xs text-orange-600 mt-1">
                  Need review (may include fakes/duplicates)
                </div>
              </div>
            </div>

            {/* Quality Score */}
            <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-purple-900 mb-1">Database Quality Score</h3>
                  <p className="text-sm text-purple-700">
                    Higher is better! Aim for 100% to ensure all villages are verified.
                  </p>
                </div>
                <div className="text-5xl font-bold text-purple-900">
                  {stats.percentageClassified}%
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4 h-4 bg-purple-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${stats.percentageClassified}%` }}
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-purple-900">Verified:</span>
                  <span className="ml-2 text-purple-700">{stats.classified} villages</span>
                </div>
                <div>
                  <span className="font-semibold text-orange-900">To Review:</span>
                  <span className="ml-2 text-orange-700">{stats.unclassified} villages</span>
                </div>
              </div>
            </div>

            {/* Facility Type Breakdown */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <PieChart className="size-5" />
                Facility Type Breakdown (Classified Only)
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(stats.breakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <div key={type} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-2xl font-bold text-gray-900">{count}</div>
                      <div className="text-sm text-gray-600 mt-1 capitalize">
                        {type.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {((count / stats.classified) * 100).toFixed(1)}% of classified
                      </div>
                    </div>
                  ))}
              </div>

              {Object.keys(stats.breakdown).length === 0 && (
                <div className="p-8 text-center text-gray-400">
                  No classified villages yet. Use the Manual Village Classifier to get started!
                </div>
              )}
            </div>

            {/* Action Items */}
            <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-3">📋 Next Steps:</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>
                  ✅ <strong>You have {stats.classified} verified villages</strong> - These are 100% correct and ready to use!
                </li>
                {stats.unclassified > 0 && (
                  <>
                    <li>
                      🧹 <strong>Clean up {stats.unclassified} unclassified villages:</strong>
                      <ul className="ml-6 mt-1 space-y-1">
                        <li>1. Use "Auto-Delete Exact Duplicates" to remove duplicates</li>
                        <li>2. Use "Fake Detection Tool" to remove obvious fakes</li>
                        <li>3. Use "Manual Village Classifier" to classify the rest</li>
                      </ul>
                    </li>
                    <li>
                      🎯 <strong>Focus on Quality:</strong> It's better to have {stats.classified} verified villages than {stats.total} with {stats.unclassified} questionable ones!
                    </li>
                  </>
                )}
                {stats.unclassified === 0 && (
                  <li>
                    🎉 <strong>Perfect!</strong> All villages are classified. Your database is 100% clean!
                  </li>
                )}
              </ul>
            </div>
          </>
        )}

        {!stats && !loading && !error && (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Database className="size-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Stats Loaded</h3>
            <p className="text-gray-600 mb-4">
              Click "Refresh Stats" to load database statistics.
            </p>
          </div>
        )}
      </Card>

      {/* VIC Village URL Checker */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">🔍 VIC Village URL Analysis</h2>
        <p className="text-gray-600 mb-6">
          Check which VIC villages have listing/operator URLs instead of official village websites. Export to CSV, manually correct, then bulk import.
        </p>
        <VicUrlChecker />
      </Card>

      {/* Bulk URL Importer */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">📥 Bulk URL Importer</h2>
        <p className="text-gray-600 mb-6">
          After manually correcting URLs in the exported CSV, use this tool to bulk import them back into the database.
        </p>
        <BulkUrlImporter />
      </Card>
    </div>
  );
}