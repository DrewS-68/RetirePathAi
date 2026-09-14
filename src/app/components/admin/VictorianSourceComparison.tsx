import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { GitCompare, FileText } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

interface SourceStats {
  source: string;
  total: number;
  uniqueNames: Set<string>;
  sampleVillages: {
    name: string;
    suburb: string;
    postcode: string;
    operator: string;
  }[];
}

export function VictorianSourceComparison() {
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState<{
    sources: SourceStats[];
    onlyInManual: string[];
    onlyInSeedData: string[];
    onlyInAdmin: string[];
    inBothManualAndSeed: string[];
    inBothManualAndAdmin: string[];
    inBothSeedAndAdmin: string[];
    inAllThree: string[];
  } | null>(null);

  const compareSources = async () => {
    setLoading(true);

    try {
      const supabase = getSupabaseClient();

      // Get ALL Victorian villages
      const { data, error } = await supabase
        .from('retirement_villages')
        .select('id, name, operator, suburb, postcode, source, created_at')
        .eq('state', 'VIC')
        .order('name');

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Group by source
      const bySource: { [key: string]: typeof data } = {};
      data?.forEach(v => {
        const source = v.source || 'unknown';
        if (!bySource[source]) {
          bySource[source] = [];
        }
        bySource[source].push(v);
      });

      // Build source stats
      const sourceStats: SourceStats[] = Object.entries(bySource).map(([source, villages]) => {
        const uniqueNames = new Set(villages.map(v => v.name.trim().toLowerCase()));
        return {
          source,
          total: villages.length,
          uniqueNames,
          sampleVillages: villages.slice(0, 10).map(v => ({
            name: v.name,
            suburb: v.suburb,
            postcode: v.postcode,
            operator: v.operator || 'None'
          }))
        };
      });

      // Find village names in each source
      const manualNames = sourceStats.find(s => s.source === 'manual')?.uniqueNames || new Set();
      const seedNames = sourceStats.find(s => s.source === 'seed_data')?.uniqueNames || new Set();
      const adminNames = sourceStats.find(s => s.source === 'admin')?.uniqueNames || new Set();

      // Find overlaps and unique villages
      const onlyInManual = Array.from(manualNames).filter(n => !seedNames.has(n) && !adminNames.has(n));
      const onlyInSeedData = Array.from(seedNames).filter(n => !manualNames.has(n) && !adminNames.has(n));
      const onlyInAdmin = Array.from(adminNames).filter(n => !manualNames.has(n) && !seedNames.has(n));
      
      const inBothManualAndSeed = Array.from(manualNames).filter(n => seedNames.has(n) && !adminNames.has(n));
      const inBothManualAndAdmin = Array.from(manualNames).filter(n => adminNames.has(n) && !seedNames.has(n));
      const inBothSeedAndAdmin = Array.from(seedNames).filter(n => adminNames.has(n) && !manualNames.has(n));
      
      const inAllThree = Array.from(manualNames).filter(n => seedNames.has(n) && adminNames.has(n));

      setComparison({
        sources: sourceStats,
        onlyInManual,
        onlyInSeedData,
        onlyInAdmin,
        inBothManualAndSeed,
        inBothManualAndAdmin,
        inBothSeedAndAdmin,
        inAllThree
      });

      console.log('📊 Source Comparison:', {
        sources: sourceStats.map(s => ({ source: s.source, total: s.total, unique: s.uniqueNames.size })),
        onlyInManual: onlyInManual.length,
        onlyInSeedData: onlyInSeedData.length,
        onlyInAdmin: onlyInAdmin.length,
        inBothManualAndSeed: inBothManualAndSeed.length,
        inBothManualAndAdmin: inBothManualAndAdmin.length,
        inBothSeedAndAdmin: inBothSeedAndAdmin.length,
        inAllThree: inAllThree.length
      });

    } catch (err) {
      console.error('Error comparing sources:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to compare sources'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 border-2 border-cyan-300 bg-cyan-50">
      <div className="flex items-start gap-4 mb-6">
        <GitCompare className="size-8 text-cyan-600 flex-shrink-0" />
        <div>
          <h2 className="text-2xl text-cyan-900 mb-2">Victorian Source Comparison</h2>
          <p className="text-cyan-800 mb-2">
            Compare villages from different sources (manual, seed_data, admin) to find overlaps and unique entries
          </p>
        </div>
      </div>

      <Button
        onClick={compareSources}
        disabled={loading}
        size="lg"
        className="mb-6"
      >
        <GitCompare className="size-5 mr-2" />
        {loading ? 'Analyzing...' : 'Compare Data Sources'}
      </Button>

      {comparison && (
        <div className="space-y-6">
          {/* Source Stats */}
          <Card className="p-4 bg-white">
            <h3 className="font-semibold text-xl mb-4">Sources Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {comparison.sources.map(stat => (
                <div key={stat.source} className="p-4 bg-gray-50 rounded border">
                  <h4 className="font-semibold text-lg mb-2">{stat.source}</h4>
                  <p className="text-sm text-gray-600">Total: {stat.total}</p>
                  <p className="text-sm text-gray-600">Unique names: {stat.uniqueNames.size}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Venn Diagram Data */}
          <Card className="p-4 bg-white">
            <h3 className="font-semibold text-xl mb-4">Village Name Overlaps</h3>
            <div className="space-y-4">
              {/* Only in one source */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded border-2 border-blue-300">
                  <h4 className="font-semibold text-blue-900">Only in Manual</h4>
                  <p className="text-3xl font-bold text-blue-600">{comparison.onlyInManual.length}</p>
                  <p className="text-xs text-blue-700 mt-1">Villages unique to manual source</p>
                </div>
                <div className="p-4 bg-green-50 rounded border-2 border-green-300">
                  <h4 className="font-semibold text-green-900">Only in Seed Data</h4>
                  <p className="text-3xl font-bold text-green-600">{comparison.onlyInSeedData.length}</p>
                  <p className="text-xs text-green-700 mt-1">Villages unique to VIC Gov data</p>
                </div>
                <div className="p-4 bg-purple-50 rounded border-2 border-purple-300">
                  <h4 className="font-semibold text-purple-900">Only in Admin</h4>
                  <p className="text-3xl font-bold text-purple-600">{comparison.onlyInAdmin.length}</p>
                  <p className="text-xs text-purple-700 mt-1">Villages unique to admin source</p>
                </div>
              </div>

              {/* In two sources */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-amber-50 rounded border-2 border-amber-300">
                  <h4 className="font-semibold text-amber-900">Manual + Seed</h4>
                  <p className="text-3xl font-bold text-amber-600">{comparison.inBothManualAndSeed.length}</p>
                  <p className="text-xs text-amber-700 mt-1">In both manual and seed_data</p>
                </div>
                <div className="p-4 bg-pink-50 rounded border-2 border-pink-300">
                  <h4 className="font-semibold text-pink-900">Manual + Admin</h4>
                  <p className="text-3xl font-bold text-pink-600">{comparison.inBothManualAndAdmin.length}</p>
                  <p className="text-xs text-pink-700 mt-1">In both manual and admin</p>
                </div>
                <div className="p-4 bg-teal-50 rounded border-2 border-teal-300">
                  <h4 className="font-semibold text-teal-900">Seed + Admin</h4>
                  <p className="text-3xl font-bold text-teal-600">{comparison.inBothSeedAndAdmin.length}</p>
                  <p className="text-xs text-teal-700 mt-1">In both seed_data and admin</p>
                </div>
              </div>

              {/* In all three */}
              <div className="p-4 bg-red-50 rounded border-2 border-red-300">
                <h4 className="font-semibold text-red-900 text-xl">In All Three Sources</h4>
                <p className="text-4xl font-bold text-red-600">{comparison.inAllThree.length}</p>
                <p className="text-sm text-red-700 mt-1">Villages that appear in manual, seed_data, AND admin (triple duplicates!)</p>
              </div>
            </div>
          </Card>

          {/* Sample Villages from Each Source */}
          <Card className="p-4 bg-white">
            <h3 className="font-semibold text-xl mb-4">Sample Villages (First 10 from each source)</h3>
            {comparison.sources.map(stat => (
              <div key={stat.source} className="mb-6">
                <h4 className="font-semibold mb-2 text-lg">{stat.source} ({stat.total} total)</h4>
                <div className="space-y-2">
                  {stat.sampleVillages.map((v, idx) => (
                    <div key={idx} className="p-2 bg-gray-50 rounded text-sm">
                      <span className="font-medium">{v.name}</span>
                      <span className="text-gray-600 ml-2">• {v.suburb} {v.postcode || 'NO POSTCODE'}</span>
                      <span className="text-gray-500 ml-2">• {v.operator}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Card>

          {/* Analysis Summary */}
          <Card className="p-4 bg-yellow-50 border-2 border-yellow-300">
            <h3 className="font-semibold text-yellow-900 mb-3">📊 Analysis Summary</h3>
            <div className="space-y-2 text-sm text-yellow-800">
              <p>
                <strong>Total unique village names:</strong>{' '}
                {comparison.onlyInManual.length + 
                 comparison.onlyInSeedData.length + 
                 comparison.onlyInAdmin.length + 
                 comparison.inBothManualAndSeed.length + 
                 comparison.inBothManualAndAdmin.length + 
                 comparison.inBothSeedAndAdmin.length + 
                 comparison.inAllThree.length}
              </p>
              <p>
                <strong>Villages to keep (after removing duplicates):</strong>{' '}
                {comparison.onlyInManual.length + 
                 comparison.onlyInSeedData.length + 
                 comparison.onlyInAdmin.length + 
                 comparison.inBothManualAndSeed.length + 
                 comparison.inBothManualAndAdmin.length + 
                 comparison.inBothSeedAndAdmin.length + 
                 comparison.inAllThree.length}
              </p>
              <p>
                <strong>Duplicates to remove:</strong>{' '}
                {comparison.inBothManualAndSeed.length + 
                 comparison.inBothManualAndAdmin.length + 
                 comparison.inBothSeedAndAdmin.length + 
                 (comparison.inAllThree.length * 2)}
              </p>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
}
