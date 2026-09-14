import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Search, Loader2 } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

export function VICOperatorCountCheck() {
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState<any>(null);

  const checkCounts = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();

      // Count total VIC villages
      const { count: totalCount } = await supabase
        .from('retirement_villages')
        .select('*', { count: 'exact', head: true })
        .eq('state', 'VIC');

      // Count VIC villages with operators (not null and not empty)
      const { data: withOpsData, count: withOpsCount } = await supabase
        .from('retirement_villages')
        .select('id, name, operator', { count: 'exact' })
        .eq('state', 'VIC')
        .not('operator', 'is', null);

      // Filter out empty strings
      const realOperators = withOpsData?.filter(v => v.operator && v.operator.trim() !== '') || [];

      // Count villages WITHOUT operators
      const { count: withoutOpsCount } = await supabase
        .from('retirement_villages')
        .select('*', { count: 'exact', head: true })
        .eq('state', 'VIC')
        .is('operator', null);

      // Count villages with Aberlea
      const aberleaVillages = withOpsData?.filter(v => 
        v.operator && v.operator.toLowerCase().includes('aberlea')
      ) || [];

      // Count villages with valid operators (not NULL, not Aberlea)
      const goodOperators = realOperators.filter(v => 
        !v.operator.toLowerCase().includes('aberlea')
      );

      setCounts({
        total: totalCount || 0,
        withOperators: realOperators.length,
        withoutOperators: withoutOpsCount || 0,
        withAberlea: aberleaVillages.length,
        goodOperators: goodOperators.length,
        aberleaNames: aberleaVillages.map(v => v.name)
      });

      console.log('📊 VIC Operator Counts:', {
        total: totalCount,
        withOperators: realOperators.length,
        withoutOperators: withoutOpsCount,
        withAberlea: aberleaVillages.length,
        goodOperators: goodOperators.length
      });

    } catch (err: any) {
      console.error('Error checking counts:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-blue-400">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="size-6 text-blue-600" />
          VIC Operator Count Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900 font-semibold mb-2">
            🔍 What this checks:
          </p>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Total VIC villages in database</li>
            <li>How many have operators (including Aberlea)</li>
            <li>How many have GOOD operators (excluding Aberlea)</li>
            <li>How many are missing operators</li>
          </ul>
        </div>

        <Button
          onClick={checkCounts}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Checking Database...
            </>
          ) : (
            <>
              <Search className="mr-2 size-4" />
              Check VIC Operator Counts
            </>
          )}
        </Button>

        {counts && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-4 bg-blue-50 rounded border-2 border-blue-200">
                <div className="text-3xl font-bold text-blue-700">{counts.total}</div>
                <div className="text-sm text-blue-600">Total VIC Villages</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded border-2 border-green-200">
                <div className="text-3xl font-bold text-green-700">{counts.withOperators}</div>
                <div className="text-sm text-green-600">With Operators</div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded border-2 border-orange-200">
                <div className="text-3xl font-bold text-orange-700">{counts.withoutOperators}</div>
                <div className="text-sm text-orange-600">Missing Operators</div>
              </div>

              <div className={`text-center p-4 rounded border-2 ${
                counts.withAberlea > 0 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className={`text-3xl font-bold ${
                  counts.withAberlea > 0 ? 'text-red-700' : 'text-green-700'
                }`}>
                  {counts.withAberlea}
                </div>
                <div className={`text-sm ${
                  counts.withAberlea > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  With Aberlea
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-700">{counts.goodOperators}</div>
                <div className="text-sm text-purple-600 font-semibold mt-1">
                  GOOD Operators (excluding NULL and Aberlea)
                </div>
              </div>
            </div>

            {counts.withAberlea > 0 && counts.aberleaNames.length > 0 && (
              <div className="bg-red-50 border border-red-300 rounded p-3">
                <p className="font-semibold text-red-900 mb-2">
                  ⚠️ Villages with Aberlea contamination:
                </p>
                <div className="max-h-40 overflow-y-auto text-xs">
                  <ul className="space-y-1 text-red-800">
                    {counts.aberleaNames.map((name: string, i: number) => (
                      <li key={i}>• {name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-300 rounded p-3">
              <p className="text-sm text-yellow-900">
                <strong>Expected after merge:</strong> If you scraped 78 good operators from villages that 
                previously had NO operators, you should see {counts.goodOperators} + 78 = {counts.goodOperators + 78} good operators.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
