import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Search, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface VillageStats {
  total: number;
  withOperator: number;
  withoutOperator: number;
  operatorBreakdown: { operator: string; count: number }[];
}

export function VICOperatorDiagnostic() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<VillageStats | null>(null);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/vic-operator-stats`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="size-6 text-purple-600" />
          VIC Operator Diagnostic
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Shows current operator status for all VIC villages - helps diagnose what's actually in the database
        </p>

        <Button
          onClick={fetchStats}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Search className="mr-2 size-4" />
              Check Current Status
            </>
          )}
        </Button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800 text-sm">
            {error}
          </div>
        )}

        {stats && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-100 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
                <div className="text-sm text-blue-600">Total VIC</div>
              </div>
              <div className="bg-green-100 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-700">{stats.withOperator}</div>
                <div className="text-sm text-green-600">Has Operator</div>
              </div>
              <div className="bg-orange-100 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-700">{stats.withoutOperator}</div>
                <div className="text-sm text-orange-600">No Operator</div>
              </div>
            </div>

            {stats.operatorBreakdown && stats.operatorBreakdown.length > 0 && (
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-semibold mb-3">Operator Breakdown (Top 20):</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {stats.operatorBreakdown.slice(0, 20).map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex justify-between items-center p-2 rounded text-sm ${
                        item.operator.toLowerCase().includes('aberlea') 
                          ? 'bg-red-50 border border-red-200' 
                          : 'bg-gray-50'
                      }`}
                    >
                      <span className="font-medium">{item.operator}</span>
                      <span className="bg-gray-200 px-2 py-0.5 rounded text-xs">
                        {item.count} villages
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
