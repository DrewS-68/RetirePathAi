import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { RefreshCw, AlertCircle, Database } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface CountResult {
  totalVIC: number;
  sampleVillages: Array<{
    id: string;
    name: string;
    operator: string;
    suburb: string;
    created_at: string;
  }>;
}

export function VICVillageRealTimeCounter() {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<CountResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkDatabase = async () => {
    setChecking(true);
    setError(null);
    setResult(null);

    try {
      console.log('🔍 Checking VIC villages in database RIGHT NOW...');

      // Count ALL VIC villages
      const countResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/vic-villages/count`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!countResponse.ok) {
        const errorText = await countResponse.text();
        throw new Error(`Count failed: ${countResponse.status} - ${errorText}`);
      }

      const countData = await countResponse.json();

      // Get sample of latest 20 villages
      const sampleResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/vic-villages/sample`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!sampleResponse.ok) {
        const errorText = await sampleResponse.text();
        throw new Error(`Sample fetch failed: ${sampleResponse.status} - ${errorText}`);
      }

      const sampleData = await sampleResponse.json();

      setResult({
        totalVIC: countData.count,
        sampleVillages: sampleData.villages,
      });

      console.log('✅ Database check complete:', {
        total: countData.count,
        sample: sampleData.villages.length,
      });

    } catch (err) {
      console.error('❌ Database check error:', err);
      setError(err instanceof Error ? err.message : 'Failed to check database');
    } finally {
      setChecking(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-400">
      <h2 className="text-2xl font-bold mb-2 text-blue-900 flex items-center gap-2">
        <Database className="size-6" />
        🔍 Real-Time VIC Village Counter
      </h2>
      <p className="text-sm text-blue-700 mb-4">
        Check EXACTLY how many VIC villages exist in the database RIGHT NOW
      </p>

      <div className="space-y-4">
        <Button
          onClick={checkDatabase}
          disabled={checking}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw className={`size-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
          {checking ? 'Checking Database...' : 'Check Database NOW'}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-4">
            <Alert className={result.totalVIC === 0 ? 'bg-green-50 border-green-400' : 'bg-yellow-50 border-yellow-400'}>
              <AlertDescription>
                <div className="space-y-3">
                  <div className="text-4xl font-bold text-center py-4">
                    {result.totalVIC === 0 ? '✅' : '⚠️'} {result.totalVIC} VIC Villages
                  </div>

                  {result.totalVIC === 0 ? (
                    <div className="text-center text-green-700">
                      <strong>DATABASE IS CLEAN!</strong>
                      <p className="text-sm mt-2">No VIC villages found. Ready for fresh import.</p>
                    </div>
                  ) : (
                    <div className="text-center text-yellow-700">
                      <strong>VILLAGES FOUND IN DATABASE!</strong>
                      <p className="text-sm mt-2">
                        These villages already exist - this is why your import is finding duplicates!
                      </p>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            {result.totalVIC > 0 && result.sampleVillages.length > 0 && (
              <Alert className="bg-white border-blue-400">
                <AlertDescription>
                  <h3 className="font-bold mb-2">📋 Sample of Latest 20 Villages:</h3>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {result.sampleVillages.map((village, i) => (
                      <div key={village.id} className="text-sm p-2 bg-gray-50 rounded border">
                        <div className="flex items-center justify-between">
                          <div>
                            <strong>{i + 1}. {village.name}</strong>
                            <div className="text-xs text-gray-600 mt-1">
                              {village.suburb} • {village.operator || 'No operator'}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(village.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Alert className="bg-purple-50 border-purple-400">
              <AlertCircle className="size-4" />
              <AlertDescription>
                <strong>💡 What This Means:</strong>
                <div className="mt-2 text-sm space-y-2">
                  {result.totalVIC === 0 ? (
                    <>
                      <p>✅ Database deletion worked perfectly!</p>
                      <p>✅ Your import should work without "already exists" errors</p>
                      <p>⚠️ If you're STILL seeing "already exists", your CSV has internal duplicates!</p>
                    </>
                  ) : (
                    <>
                      <p>⚠️ These {result.totalVIC} villages are causing the "already exists" errors!</p>
                      <p>🤔 This means EITHER:</p>
                      <ul className="list-disc ml-5 space-y-1">
                        <li>The deletion didn't work properly</li>
                        <li>These are villages you JUST imported (if import is running now)</li>
                        <li>There are villages from other states being miscounted</li>
                      </ul>
                    </>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </Card>
  );
}
