import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Search, Download, AlertTriangle } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

interface Village {
  id: string;
  name: string;
  operator: string;
  website: string;
  suburb: string;
  created_at: string;
  updated_at: string;
}

export function VICDatabaseInspector() {
  const [loading, setLoading] = useState(false);
  const [villages, setVillages] = useState<Village[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    withWebsites: 0,
    withoutWebsites: 0,
    withOperators: 0,
    withoutOperators: 0,
    oldestDate: '',
    newestDate: '',
  });

  const inspectDatabase = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      
      // Load ALL VIC villages with timestamps
      const { data, error } = await supabase
        .from('retirement_villages')
        .select('id, name, operator, website, suburb, created_at, updated_at')
        .eq('state', 'VIC')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const allVillages = data || [];
      
      // Calculate stats
      const withWebsites = allVillages.filter(v => v.website && v.website.trim() !== '').length;
      const withoutWebsites = allVillages.length - withWebsites;
      const withOperators = allVillages.filter(v => v.operator && v.operator.trim() !== '').length;
      const withoutOperators = allVillages.length - withOperators;
      
      const dates = allVillages.map(v => new Date(v.created_at).getTime());
      const oldestDate = dates.length > 0 ? new Date(Math.min(...dates)).toISOString() : '';
      const newestDate = dates.length > 0 ? new Date(Math.max(...dates)).toISOString() : '';

      setVillages(allVillages);
      setStats({
        total: allVillages.length,
        withWebsites,
        withoutWebsites,
        withOperators,
        withoutOperators,
        oldestDate,
        newestDate,
      });

      alert(
        `📊 VIC DATABASE INSPECTION COMPLETE!\n\n` +
        `Total VIC Villages: ${allVillages.length}\n\n` +
        `BREAKDOWN:\n` +
        `• ${withWebsites} have websites\n` +
        `• ${withoutWebsites} NO websites\n` +
        `• ${withOperators} have operators\n` +
        `• ${withoutOperators} NO operators\n\n` +
        `DATE RANGE:\n` +
        `• Oldest: ${new Date(oldestDate).toLocaleString()}\n` +
        `• Newest: ${new Date(newestDate).toLocaleString()}\n\n` +
        `Check the table below to see all villages sorted by creation date.`
      );
    } catch (err) {
      console.error('Error inspecting database:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to inspect database'}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (villages.length === 0) return;

    const csv = [
      ['ID', 'Name', 'Operator', 'Website', 'Suburb', 'Created At', 'Updated At'],
      ...villages.map(v => [
        v.id,
        v.name,
        v.operator || '(empty)',
        v.website || '(empty)',
        v.suburb || '(empty)',
        new Date(v.created_at).toLocaleString(),
        new Date(v.updated_at).toLocaleString(),
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vic-database-inspection-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const groupVillagesByDate = () => {
    if (villages.length === 0) return [];

    // Group by creation date (day)
    const groups: { [key: string]: Village[] } = {};
    
    villages.forEach(v => {
      const dateKey = new Date(v.created_at).toLocaleDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(v);
    });

    return Object.entries(groups).map(([date, vills]) => ({
      date,
      count: vills.length,
      withWebsites: vills.filter(v => v.website && v.website.trim() !== '').length,
      withOperators: vills.filter(v => v.operator && v.operator.trim() !== '').length,
      villages: vills,
    }));
  };

  const dateGroups = groupVillagesByDate();

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-400">
      <h2 className="text-2xl font-bold mb-2 text-blue-900 flex items-center gap-2">
        <Search className="size-6" />
        🔍 VIC Database Inspector
      </h2>
      <p className="text-sm text-blue-700 mb-4">
        See EXACTLY what's in the database with timestamps to identify old vs new villages
      </p>

      <Alert className="mb-4 bg-yellow-50 border-yellow-400">
        <AlertTriangle className="size-4" />
        <AlertDescription>
          <strong>This tool helps you understand:</strong>
          <ul className="list-disc ml-4 mt-2 space-y-1 text-sm">
            <li>How many VIC villages are actually in the database</li>
            <li>Which villages are OLD (created earlier) vs NEW (created recently)</li>
            <li>Which have websites vs which don't</li>
            <li>Which have operators vs which don't</li>
            <li>Grouped by creation date so you can see import batches</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <Button
          onClick={inspectDatabase}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <>
              <Search className="size-4 mr-2 animate-pulse" />
              Inspecting Database...
            </>
          ) : (
            <>
              <Search className="size-4 mr-2" />
              🔍 Inspect VIC Villages Database
            </>
          )}
        </Button>

        {/* Stats Summary */}
        {villages.length > 0 && (
          <>
            <Card className="p-4 bg-white border-2 border-blue-200">
              <h3 className="text-lg font-bold mb-3 text-blue-900">📊 Database Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
                  <div className="text-xs text-blue-600">Total Villages</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded border border-green-200">
                  <div className="text-2xl font-bold text-green-700">{stats.withWebsites}</div>
                  <div className="text-xs text-green-600">With Websites</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="text-2xl font-bold text-gray-700">{stats.withoutWebsites}</div>
                  <div className="text-xs text-gray-600">No Website</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded border border-purple-200">
                  <div className="text-2xl font-bold text-purple-700">{stats.withOperators}</div>
                  <div className="text-xs text-purple-600">With Operators</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded border border-orange-200">
                  <div className="text-2xl font-bold text-orange-700">{stats.withoutOperators}</div>
                  <div className="text-xs text-orange-600">No Operator</div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-indigo-50 rounded border border-indigo-200">
                <div className="text-sm space-y-1">
                  <div><strong>Oldest Village:</strong> {new Date(stats.oldestDate).toLocaleString()}</div>
                  <div><strong>Newest Village:</strong> {new Date(stats.newestDate).toLocaleString()}</div>
                </div>
              </div>

              <Button
                size="sm"
                onClick={downloadCSV}
                className="mt-4 bg-green-600 hover:bg-green-700"
              >
                <Download className="size-4 mr-2" />
                Download Full CSV Report
              </Button>
            </Card>

            {/* Grouped by Date */}
            <Card className="p-4 bg-white border-2 border-blue-200">
              <h3 className="text-lg font-bold mb-3 text-blue-900">📅 Villages Grouped by Creation Date</h3>
              <p className="text-sm text-gray-600 mb-3">
                This shows when villages were imported. Each date represents an import batch.
              </p>
              <div className="space-y-3">
                {dateGroups.map((group, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <Badge className="bg-blue-600 mb-1">{group.date}</Badge>
                        <div className="text-sm font-semibold">{group.count} villages imported</div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>🌐 {group.withWebsites} with websites</div>
                        <div>👥 {group.withOperators} with operators</div>
                      </div>
                    </div>
                    <details className="text-sm">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-700">
                        Show all {group.count} villages from this date
                      </summary>
                      <div className="mt-2 max-h-48 overflow-y-auto border rounded p-2 bg-white">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-100 sticky top-0">
                            <tr>
                              <th className="p-1 text-left">Name</th>
                              <th className="p-1 text-left">Operator</th>
                              <th className="p-1 text-left">Website</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.villages.map(v => (
                              <tr key={v.id} className="border-t">
                                <td className="p-1">{v.name}</td>
                                <td className="p-1">{v.operator || <span className="text-red-600">NO OPERATOR</span>}</td>
                                <td className="p-1 truncate max-w-xs">
                                  {v.website ? (
                                    <span className="text-green-600">✓ Has URL</span>
                                  ) : (
                                    <span className="text-red-600">✗ No URL</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </Card>
  );
}
