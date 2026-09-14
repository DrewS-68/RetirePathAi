import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Download, Search } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

interface OperatorStats {
  operator: string;
  villageCount: number;
  villages: string[];
}

export function VICOperatorsExporter() {
  const [loading, setLoading] = useState(false);
  const [operators, setOperators] = useState<OperatorStats[]>([]);
  const [totalVillages, setTotalVillages] = useState(0);

  const fetchOperators = async () => {
    setLoading(true);

    try {
      const supabase = getSupabaseClient();

      // Get ALL Victorian villages with operator info
      const { data, error } = await supabase
        .from('retirement_villages')
        .select('id, name, operator, suburb')
        .eq('state', 'VIC')
        .order('operator');

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data || data.length === 0) {
        alert('No Victorian villages found in database!');
        return;
      }

      setTotalVillages(data.length);

      // DEBUG: Check what operator values we actually have
      const operatorValues = data.map(v => v.operator);
      const nullCount = operatorValues.filter(op => !op || op.trim() === '').length;
      
      console.log('🔍 OPERATOR DEBUG:', {
        total: data.length,
        nullOrEmpty: nullCount,
        sampleOperators: operatorValues.slice(0, 20)
      });

      // Group by operator (treat null/empty as "Unknown Operator")
      const operatorMap: { [key: string]: { count: number; villages: string[] } } = {};

      data.forEach(v => {
        // Normalize: treat null, undefined, empty string as "Unknown Operator"
        let operator = v.operator?.trim();
        if (!operator) {
          operator = '⚠️ Unknown Operator (Not Scraped)';
        }
        
        if (!operatorMap[operator]) {
          operatorMap[operator] = { count: 0, villages: [] };
        }
        operatorMap[operator].count++;
        operatorMap[operator].villages.push(`${v.name} (${v.suburb})`);
      });

      // Convert to array and sort by village count (descending)
      const operatorStats: OperatorStats[] = Object.entries(operatorMap)
        .map(([operator, stats]) => ({
          operator,
          villageCount: stats.count,
          villages: stats.villages
        }))
        .sort((a, b) => b.villageCount - a.villageCount);

      setOperators(operatorStats);

      console.log('📊 VIC Operators Analysis:', {
        totalVillages: data.length,
        uniqueOperators: operatorStats.length,
        unknownCount: operatorMap['⚠️ Unknown Operator (Not Scraped)']?.count || 0,
        topOperators: operatorStats.slice(0, 10).map(o => ({ operator: o.operator, count: o.villageCount }))
      });
      
      // Alert if most operators are unknown
      if (nullCount > data.length * 0.8) {
        alert(`⚠️ DATA QUALITY ISSUE!\n\n${nullCount} out of ${data.length} villages (${Math.round(nullCount/data.length*100)}%) have NO operator information!\n\nThe operator field was likely not scraped properly. You may need to:\n1. Re-scrape with operator extraction\n2. Manually populate operators\n3. Use a CSV import with operator data`);
      }

    } catch (err) {
      console.error('Error fetching operators:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to fetch operators'}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (operators.length === 0) {
      alert('No operator data to export. Click "Load Operators" first.');
      return;
    }

    // Create CSV content
    const csvRows = [
      // Header
      ['Operator', 'Village Count', 'Villages'].join(','),
      // Data rows
      ...operators.map(op => {
        const operator = `"${op.operator.replace(/"/g, '""')}"`;
        const count = op.villageCount;
        const villages = `"${op.villages.join('; ').replace(/"/g, '""')}"`;
        return [operator, count, villages].join(',');
      })
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vic_operators_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    console.log('✅ CSV downloaded successfully!');
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300">
      <h2 className="text-2xl font-bold mb-2 text-purple-900">📋 VIC Operators CSV Exporter</h2>
      <p className="text-sm text-purple-700 mb-4">
        Export all Victorian operators with village counts to CSV for manual research
      </p>

      <div className="flex gap-3 mb-6">
        <Button 
          onClick={fetchOperators} 
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Search className="size-4 mr-2" />
          {loading ? 'Loading...' : 'Load VIC Operators'}
        </Button>

        <Button 
          onClick={downloadCSV} 
          disabled={operators.length === 0}
          variant="outline"
          className="border-purple-600 text-purple-600 hover:bg-purple-50"
        >
          <Download className="size-4 mr-2" />
          Download CSV
        </Button>
      </div>

      {operators.length > 0 && (
        <div className="space-y-4">
          {/* Stats Summary */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="p-4 bg-purple-100 border-purple-200">
              <div className="text-2xl font-bold text-purple-900">{totalVillages}</div>
              <div className="text-sm text-purple-700">Total VIC Villages</div>
            </Card>
            <Card className="p-4 bg-pink-100 border-pink-200">
              <div className="text-2xl font-bold text-pink-900">{operators.length}</div>
              <div className="text-sm text-pink-700">Unique Operators</div>
            </Card>
          </div>

          {/* Top 20 Operators Preview */}
          <Card className="p-4 bg-white">
            <h3 className="font-semibold mb-3 text-gray-900">Top 20 Operators (Preview)</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {operators.slice(0, 20).map((op, idx) => (
                <div 
                  key={idx}
                  className="p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-gray-900">{op.operator}</span>
                    <span className="text-sm font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded">
                      {op.villageCount} {op.villageCount === 1 ? 'village' : 'villages'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    {op.villages.slice(0, 3).join(' • ')}
                    {op.villages.length > 3 && ` • +${op.villages.length - 3} more`}
                  </div>
                </div>
              ))}
            </div>
            {operators.length > 20 && (
              <p className="text-sm text-gray-600 mt-3 text-center">
                ...and {operators.length - 20} more operators (download CSV to see all)
              </p>
            )}
          </Card>
        </div>
      )}
    </Card>
  );
}