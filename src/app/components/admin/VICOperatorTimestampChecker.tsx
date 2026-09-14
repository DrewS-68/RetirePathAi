import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Clock, Loader2, AlertTriangle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface VillageTimestamp {
  id: string;
  name: string;
  operator: string | null;
  updated_at: string;
  minutesAgo: number;
}

export function VICOperatorTimestampChecker() {
  const [loading, setLoading] = useState(false);
  const [villages, setVillages] = useState<VillageTimestamp[]>([]);

  const checkTimestamps = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/vic-operators/check-timestamps`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      const data = await response.json();
      setVillages(data.villages);

    } catch (err: any) {
      console.error('❌ Error checking timestamps:', err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-400">
      <h2 className="text-2xl font-bold mb-2 text-yellow-900 flex items-center gap-2">
        <Clock className="size-6" />
        🕐 VIC Operator Update Timestamps
      </h2>
      <p className="text-sm text-yellow-700 mb-4">
        Check WHEN each VIC village was last updated (to diagnose the Clear tool)
      </p>

      <div className="space-y-4">
        <Button
          onClick={checkTimestamps}
          disabled={loading}
          className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Loading Timestamps...
            </>
          ) : (
            <>
              <Clock className="size-4 mr-2" />
              Check All VIC Village Timestamps
            </>
          )}
        </Button>

        {villages.length > 0 && (
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-400">
              <AlertDescription>
                <strong>Found {villages.length} VIC villages</strong>
                <div className="mt-2 space-y-1 text-sm">
                  <div>• Villages WITH operators: {villages.filter(v => v.operator && v.operator !== '').length}</div>
                  <div>• Villages MISSING operators: {villages.filter(v => !v.operator || v.operator === '').length}</div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Group by time ranges */}
            <div className="space-y-4">
              {/* Last 10 minutes */}
              {villages.filter(v => v.minutesAgo <= 10 && v.operator).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-green-700">
                    🟢 Updated in Last 10 Minutes ({villages.filter(v => v.minutesAgo <= 10 && v.operator).length} villages)
                  </h3>
                  <div className="max-h-40 overflow-y-auto border rounded bg-white p-2 space-y-1 text-xs">
                    {villages
                      .filter(v => v.minutesAgo <= 10 && v.operator)
                      .map(v => (
                        <div key={v.id} className="flex justify-between">
                          <span>{v.name}</span>
                          <span className="text-gray-600">→ {v.operator} ({v.minutesAgo}m ago)</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* 10-30 minutes */}
              {villages.filter(v => v.minutesAgo > 10 && v.minutesAgo <= 30 && v.operator).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-yellow-700">
                    🟡 Updated 10-30 Minutes Ago ({villages.filter(v => v.minutesAgo > 10 && v.minutesAgo <= 30 && v.operator).length} villages)
                  </h3>
                  <div className="max-h-40 overflow-y-auto border rounded bg-white p-2 space-y-1 text-xs">
                    {villages
                      .filter(v => v.minutesAgo > 10 && v.minutesAgo <= 30 && v.operator)
                      .map(v => (
                        <div key={v.id} className="flex justify-between">
                          <span>{v.name}</span>
                          <span className="text-gray-600">→ {v.operator} ({v.minutesAgo}m ago)</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* 30-60 minutes */}
              {villages.filter(v => v.minutesAgo > 30 && v.minutesAgo <= 60 && v.operator).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-orange-700">
                    🟠 Updated 30-60 Minutes Ago ({villages.filter(v => v.minutesAgo > 30 && v.minutesAgo <= 60 && v.operator).length} villages)
                  </h3>
                  <div className="max-h-40 overflow-y-auto border rounded bg-white p-2 space-y-1 text-xs">
                    {villages
                      .filter(v => v.minutesAgo > 30 && v.minutesAgo <= 60 && v.operator)
                      .map(v => (
                        <div key={v.id} className="flex justify-between">
                          <span>{v.name}</span>
                          <span className="text-gray-600">→ {v.operator} ({v.minutesAgo}m ago)</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* More than 60 minutes */}
              {villages.filter(v => v.minutesAgo > 60 && v.operator).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-red-700">
                    🔴 Updated More Than 60 Minutes Ago ({villages.filter(v => v.minutesAgo > 60 && v.operator).length} villages)
                  </h3>
                  <div className="max-h-40 overflow-y-auto border rounded bg-white p-2 space-y-1 text-xs">
                    {villages
                      .filter(v => v.minutesAgo > 60 && v.operator)
                      .map(v => (
                        <div key={v.id} className="flex justify-between">
                          <span>{v.name}</span>
                          <span className="text-gray-600">→ {v.operator} ({Math.round(v.minutesAgo / 60)}h ago)</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Missing operators */}
              {villages.filter(v => !v.operator || v.operator === '').length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-gray-700">
                    ⚪ Missing Operators ({villages.filter(v => !v.operator || v.operator === '').length} villages)
                  </h3>
                  <div className="max-h-40 overflow-y-auto border rounded bg-white p-2 space-y-1 text-xs">
                    {villages
                      .filter(v => !v.operator || v.operator === '')
                      .map(v => (
                        <div key={v.id} className="flex justify-between">
                          <span>{v.name}</span>
                          <span className="text-gray-600">(no operator)</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
