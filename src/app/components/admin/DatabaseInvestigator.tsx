import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, Database, AlertTriangle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface StateBreakdown {
  state: string;
  count: number;
}

interface InvestigationResults {
  totalVillages: number;
  stateBreakdown: StateBreakdown[];
  vicVillages: number;
  nswVillages: number;
  qldVillages: number;
  waVillages: number;
  saVillages: number;
  tasVillages: number;
  actVillages: number;
  ntVillages: number;
}

export function DatabaseInvestigator() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<InvestigationResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const investigate = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/investigate-database`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to investigate database');
      }

      const data = await response.json();
      setResults(data);

    } catch (err) {
      console.error('Database Investigation Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to investigate database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Database className="size-6" />
            🔍 Database Investigation
          </h2>
          <p className="text-gray-600">
            Find out exactly what's in the database and where the missing villages went
          </p>
        </div>
        <Button onClick={investigate} disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
          Investigate Now
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <AlertTriangle className="size-5 inline mr-2" />
          {error}
        </div>
      )}

      {results && (
        <div className="space-y-6">
          {/* Total Count */}
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300">
            <div className="text-5xl font-bold text-blue-900 mb-2">
              {results.totalVillages.toLocaleString()}
            </div>
            <div className="text-lg font-semibold text-blue-700">
              TOTAL VILLAGES IN DATABASE
            </div>
          </div>

          {/* State Breakdown */}
          <div>
            <h3 className="text-xl font-bold mb-4">Breakdown by State:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {results.stateBreakdown.map(state => (
                <div key={state.state} className="p-4 bg-gray-50 rounded-lg border border-gray-300">
                  <div className="text-3xl font-bold text-gray-900">
                    {state.count}
                  </div>
                  <div className="text-sm font-semibold text-gray-700 uppercase">
                    {state.state || 'UNKNOWN'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analysis */}
          <div className="p-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="size-6 text-yellow-600" />
              Analysis
            </h3>
            <div className="space-y-2 text-gray-800">
              <p>
                <strong>Expected:</strong> ~1,900 villages (before VIC deletion)
              </p>
              <p>
                <strong>Actual:</strong> {results.totalVillages.toLocaleString()} villages
              </p>
              <p>
                <strong>Difference:</strong> {(1900 - results.totalVillages).toLocaleString()} villages missing
              </p>
              <p className="mt-4 text-sm">
                {results.totalVillages < 1900 
                  ? '⚠️ You appear to have lost villages during the VIC deletion process. The "Delete Victorian Villages" tool may have deleted more than intended.'
                  : '✅ Village count looks correct.'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
