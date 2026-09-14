import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Search, CheckCircle, AlertCircle } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

interface AnalysisResult {
  totalVICVillages: number;
  villagesWithWebsites: number;
  recentlyUpdated: Array<{
    id: string;
    name: string;
    operator: string;
    website: string;
    updated_at: string;
  }>;
  recentlyCreated: Array<{
    id: string;
    name: string;
    operator: string;
    website: string;
    created_at: string;
  }>;
}

export function VICWebsiteImportAnalyzer() {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeImport = async () => {
    setAnalyzing(true);
    setError(null);
    setResults(null);

    try {
      const supabase = getSupabaseClient();

      // Get total VIC villages
      const { count: totalCount } = await supabase
        .from('retirement_villages')
        .select('*', { count: 'exact', head: true })
        .eq('state', 'VIC');

      // Get villages with websites
      const { data: withWebsites, count: websiteCount } = await supabase
        .from('retirement_villages')
        .select('*', { count: 'exact' })
        .eq('state', 'VIC')
        .not('website', 'is', null)
        .neq('website', '');

      console.log('📊 VIC villages with websites:', withWebsites);

      // Get recently updated villages (last 30 minutes)
      const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const { data: recentlyUpdated } = await supabase
        .from('retirement_villages')
        .select('id, name, operator, website, updated_at')
        .eq('state', 'VIC')
        .gte('updated_at', thirtyMinsAgo)
        .order('updated_at', { ascending: false })
        .limit(50);

      // Get recently created villages (last 30 minutes)
      const { data: recentlyCreated } = await supabase
        .from('retirement_villages')
        .select('id, name, operator, website, created_at')
        .eq('state', 'VIC')
        .gte('created_at', thirtyMinsAgo)
        .order('created_at', { ascending: false })
        .limit(50);

      console.log('🆕 Recently created:', recentlyCreated);
      console.log('🔄 Recently updated:', recentlyUpdated);

      setResults({
        totalVICVillages: totalCount || 0,
        villagesWithWebsites: websiteCount || 0,
        recentlyUpdated: recentlyUpdated || [],
        recentlyCreated: recentlyCreated || []
      });

    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-400">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">
          🔍 VIC Website Import Analyzer
        </h2>
        <p className="text-sm text-blue-700">
          Check what happened with the CSV import - shows recent updates and new villages
        </p>
      </div>

      <Button
        onClick={analyzeImport}
        disabled={analyzing}
        className="w-full bg-blue-600 hover:bg-blue-700 mb-6"
      >
        <Search className="size-4 mr-2" />
        {analyzing ? 'Analyzing...' : '🔍 Analyze Import Results'}
      </Button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-6">
          <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {results && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border-2 border-blue-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-700">{results.totalVICVillages}</div>
              <div className="text-sm text-gray-600">Total VIC Villages</div>
            </div>
            <div className="bg-white border-2 border-green-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-700">{results.villagesWithWebsites}</div>
              <div className="text-sm text-gray-600">Villages with Websites</div>
            </div>
          </div>

          {/* Recently Created */}
          {results.recentlyCreated.length > 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
              <h3 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                <AlertCircle className="size-5" />
                🆕 Recently Created Villages (Last 30 mins): {results.recentlyCreated.length}
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {results.recentlyCreated.map((village) => (
                  <div key={village.id} className="bg-white p-3 rounded border border-yellow-200 text-sm">
                    <div className="font-semibold text-gray-900">{village.name}</div>
                    <div className="text-gray-600">Operator: {village.operator || '(none)'}</div>
                    <div className="text-gray-600">Website: {village.website || '(none)'}</div>
                    <div className="text-xs text-gray-500">Created: {new Date(village.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recently Updated */}
          {results.recentlyUpdated.length > 0 && (
            <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4">
              <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                <CheckCircle className="size-5" />
                🔄 Recently Updated Villages (Last 30 mins): {results.recentlyUpdated.length}
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {results.recentlyUpdated.map((village) => (
                  <div key={village.id} className="bg-white p-3 rounded border border-green-200 text-sm">
                    <div className="font-semibold text-gray-900">{village.name}</div>
                    <div className="text-gray-600">Operator: {village.operator || '(none)'}</div>
                    <div className="text-green-700 font-medium">✅ Website: {village.website || '(none)'}</div>
                    <div className="text-xs text-gray-500">Updated: {new Date(village.updated_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-900 mb-2">📊 Analysis Summary</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ <strong>{results.recentlyUpdated.length}</strong> villages were updated in the last 30 minutes</li>
              <li>🆕 <strong>{results.recentlyCreated.length}</strong> new villages were created in the last 30 minutes</li>
              <li>🌐 <strong>{results.villagesWithWebsites}</strong> total villages now have websites</li>
              <li>📈 Expected: 28 villages from CSV should have websites</li>
              {results.villagesWithWebsites < 28 && (
                <li className="text-red-700 font-semibold">⚠️ Missing websites: {28 - results.villagesWithWebsites} villages</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}
