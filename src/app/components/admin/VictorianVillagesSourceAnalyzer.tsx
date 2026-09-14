import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Search, Database, Calendar, FileText } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

interface VillageAnalysis {
  id: string;
  name: string;
  operator: string;
  suburb: string;
  postcode: string;
  facility_type: string;
  village_type: string;
  source: string;
  created_at: string;
  description: string;
}

export function VictorianVillagesSourceAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [villages, setVillages] = useState<VillageAnalysis[]>([]);
  const [analysis, setAnalysis] = useState<{
    total: number;
    bySource: { [key: string]: number };
    byFacilityType: { [key: string]: number };
    byVillageType: { [key: string]: number };
    byDate: { [key: string]: number };
    duplicateOperators: { operator: string; count: number }[];
  } | null>(null);

  const analyzeVicVillages = async () => {
    setLoading(true);

    try {
      const supabase = getSupabaseClient();

      // Get ALL Victorian villages with full details
      const { data, error } = await supabase
        .from('retirement_villages')
        .select('id, name, operator, suburb, postcode, facility_type, village_type, source, created_at, description')
        .eq('state', 'VIC')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      setVillages(data || []);

      // Analyze the data
      const bySource: { [key: string]: number } = {};
      const byFacilityType: { [key: string]: number } = {};
      const byVillageType: { [key: string]: number } = {};
      const byDate: { [key: string]: number } = {};
      const operatorCounts: { [key: string]: number } = {};

      data?.forEach(v => {
        // By source
        const source = v.source || 'unknown';
        bySource[source] = (bySource[source] || 0) + 1;

        // By facility type
        const facilityType = v.facility_type || 'none';
        byFacilityType[facilityType] = (byFacilityType[facilityType] || 0) + 1;

        // By village type
        const villageType = v.village_type || 'none';
        byVillageType[villageType] = (byVillageType[villageType] || 0) + 1;

        // By date (group by month)
        const date = new Date(v.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        byDate[monthKey] = (byDate[monthKey] || 0) + 1;

        // Count duplicate operators
        if (v.operator) {
          operatorCounts[v.operator] = (operatorCounts[v.operator] || 0) + 1;
        }
      });

      // Find duplicates (operators with more than 1 entry)
      const duplicateOperators = Object.entries(operatorCounts)
        .filter(([_, count]) => count > 1)
        .map(([operator, count]) => ({ operator, count }))
        .sort((a, b) => b.count - a.count);

      setAnalysis({
        total: data?.length || 0,
        bySource,
        byFacilityType,
        byVillageType,
        byDate,
        duplicateOperators
      });

      console.log('📊 Victorian Villages Analysis:', {
        total: data?.length || 0,
        bySource,
        byFacilityType,
        byVillageType,
        byDate,
        duplicates: duplicateOperators.length
      });

    } catch (err) {
      console.error('Error analyzing VIC villages:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to analyze villages'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 border-2 border-blue-300 bg-blue-50">
      <div className="flex items-start gap-4 mb-6">
        <Database className="size-8 text-blue-600 flex-shrink-0" />
        <div>
          <h2 className="text-2xl text-blue-900 mb-2">Victorian Villages Source Analyzer</h2>
          <p className="text-blue-800 mb-2">
            Deep dive into where your 1000 VIC villages came from and identify duplicates
          </p>
        </div>
      </div>

      <Button
        onClick={analyzeVicVillages}
        disabled={loading}
        size="lg"
        className="mb-6"
      >
        <Search className="size-5 mr-2" />
        {loading ? 'Analyzing...' : 'Analyze All Victorian Villages'}
      </Button>

      {analysis && (
        <div className="space-y-6">
          {/* Total */}
          <Card className="p-4 bg-white">
            <h3 className="font-semibold text-2xl text-blue-900 mb-2">
              Total: {analysis.total} Victorian Villages
            </h3>
            <p className="text-sm text-gray-600">
              Expected: ~512 from VIC Government data
            </p>
            {analysis.total > 600 && (
              <p className="text-sm text-red-600 font-semibold mt-1">
                ⚠️ {analysis.total - 512} extra villages - likely duplicates!
              </p>
            )}
          </Card>

          {/* By Source */}
          <Card className="p-4 bg-white">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="size-5" />
              By Source
            </h3>
            <div className="space-y-2">
              {Object.entries(analysis.bySource)
                .sort((a, b) => b[1] - a[1])
                .map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">{source}</span>
                    <span className="text-lg font-bold text-blue-600">{count}</span>
                  </div>
                ))}
            </div>
          </Card>

          {/* By Facility Type */}
          <Card className="p-4 bg-white">
            <h3 className="font-semibold mb-3">By Facility Type</h3>
            <div className="space-y-2">
              {Object.entries(analysis.byFacilityType)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">{type}</span>
                    <span className="text-lg font-bold text-purple-600">{count}</span>
                  </div>
                ))}
            </div>
          </Card>

          {/* By Village Type */}
          <Card className="p-4 bg-white">
            <h3 className="font-semibold mb-3">By Village Type</h3>
            <div className="space-y-2">
              {Object.entries(analysis.byVillageType)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">{type}</span>
                    <span className="text-lg font-bold text-green-600">{count}</span>
                  </div>
                ))}
            </div>
          </Card>

          {/* By Creation Date */}
          <Card className="p-4 bg-white">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="size-5" />
              By Creation Date (Month)
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Object.entries(analysis.byDate)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .map(([month, count]) => (
                  <div key={month} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">{month}</span>
                    <span className="text-lg font-bold text-amber-600">{count}</span>
                  </div>
                ))}
            </div>
          </Card>

          {/* Duplicate Operators */}
          {analysis.duplicateOperators.length > 0 && (
            <Card className="p-4 bg-red-50 border-2 border-red-300">
              <h3 className="font-semibold text-red-900 mb-3">
                🚨 Duplicate Operators ({analysis.duplicateOperators.length})
              </h3>
              <p className="text-sm text-red-800 mb-3">
                These operators appear multiple times - likely from multiple imports!
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {analysis.duplicateOperators.slice(0, 20).map(({ operator, count }) => (
                  <div key={operator} className="flex items-center justify-between p-2 bg-white rounded">
                    <span className="font-medium text-sm">{operator}</span>
                    <span className="text-lg font-bold text-red-600">{count}x</span>
                  </div>
                ))}
              </div>
              {analysis.duplicateOperators.length > 20 && (
                <p className="text-sm text-red-700 mt-2">
                  ...and {analysis.duplicateOperators.length - 20} more duplicates
                </p>
              )}
            </Card>
          )}

          {/* Sample Villages */}
          <Card className="p-4 bg-white">
            <h3 className="font-semibold mb-3">Sample Villages (First 10)</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {villages.slice(0, 10).map(v => (
                <div key={v.id} className="p-3 bg-gray-50 rounded text-sm">
                  <div className="font-medium">{v.name}</div>
                  <div className="text-gray-600">
                    Operator: {v.operator || 'None'} • {v.suburb} {v.postcode || 'NO POSTCODE'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Source: {v.source} • Type: {v.facility_type} / {v.village_type} • Created: {new Date(v.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
}