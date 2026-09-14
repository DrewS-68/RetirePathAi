import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Search, Loader2 } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

export function VICMergeDebugger() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const checkMergeStatus = async () => {
    setLoading(true);
    setResult(null);

    try {
      const supabase = getSupabaseClient();

      // Get the 87 villages we tried to scrape
      // These are the ones that had NULL or missing operators
      const { data: allVillages, error: allError } = await supabase
        .from('retirement_villages')
        .select('id, name, suburb, postcode, operator')
        .eq('state', 'VIC')
        .order('name');

      if (allError) throw new Error(allError.message);

      // Categorize them
      const withOperators = allVillages?.filter(v => v.operator && v.operator !== 'NULL') || [];
      const withoutOperators = allVillages?.filter(v => !v.operator || v.operator === 'NULL') || [];
      const withGoodOperators = withOperators.filter(v => !v.operator.toLowerCase().includes('aberlea'));

      console.log('📊 VIC Village Status:', {
        total: allVillages?.length,
        withOperators: withOperators.length,
        withGoodOperators: withGoodOperators.length,
        withoutOperators: withoutOperators.length
      });

      setResult({
        total: allVillages?.length || 0,
        withOperators: withOperators.length,
        withGoodOperators: withGoodOperators.length,
        withoutOperators: withoutOperators.length,
        villagesWithoutOps: withoutOperators.slice(0, 20) // Show first 20
      });

    } catch (err: any) {
      console.error('Error:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-pink-400">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="size-6 text-pink-600" />
          VIC Merge Debugger
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-pink-50 border-2 border-pink-200 rounded-lg p-4">
          <p className="text-sm text-pink-900 font-semibold mb-2">
            🔍 What this checks:
          </p>
          <ul className="text-sm text-pink-800 space-y-1 list-disc list-inside">
            <li>Counts all VIC villages by operator status</li>
            <li>Shows which villages still need operators</li>
            <li>Helps identify if the merge actually worked</li>
          </ul>
        </div>

        <Button
          onClick={checkMergeStatus}
          disabled={loading}
          className="w-full bg-pink-600 hover:bg-pink-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Search className="mr-2 size-4" />
              Check Merge Status
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-4 bg-blue-50 rounded border-2 border-blue-200">
                <div className="text-3xl font-bold text-blue-700">{result.total}</div>
                <div className="text-sm text-blue-600">Total VIC Villages</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded border-2 border-green-200">
                <div className="text-3xl font-bold text-green-700">{result.withGoodOperators}</div>
                <div className="text-sm text-green-600">With Good Operators</div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded border-2 border-orange-200">
                <div className="text-3xl font-bold text-orange-700">{result.withOperators}</div>
                <div className="text-sm text-orange-600">With Any Operator</div>
              </div>

              <div className="text-center p-4 bg-red-50 rounded border-2 border-red-200">
                <div className="text-3xl font-bold text-red-700">{result.withoutOperators}</div>
                <div className="text-sm text-red-600">Still Missing Operators</div>
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-900 font-semibold mb-2">
                📊 Analysis:
              </p>
              {result.withGoodOperators === 402 ? (
                <div className="space-y-2 text-sm text-yellow-800">
                  <p>❌ <strong>Still showing 402 good operators</strong> - the merge didn't work!</p>
                  <p>This means the 78 operators from your CSV didn't get added to the database.</p>
                  <p><strong>Possible reasons:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Village names in CSV don't exactly match database names</li>
                    <li>Those 78 villages already had operators (unlikely)</li>
                    <li>The update query failed silently</li>
                  </ul>
                </div>
              ) : result.withGoodOperators > 402 && result.withGoodOperators <= 480 ? (
                <p className="text-green-800 font-semibold">
                  ✅ Success! The merge added {result.withGoodOperators - 402} operators!
                </p>
              ) : (
                <p className="text-yellow-800">
                  Current count: {result.withGoodOperators} good operators
                </p>
              )}
            </div>

            {result.villagesWithoutOps && result.villagesWithoutOps.length > 0 && (
              <details className="bg-white border rounded p-3">
                <summary className="text-sm font-semibold text-gray-700 cursor-pointer">
                  View villages still missing operators (first 20)
                </summary>
                <div className="mt-3 max-h-64 overflow-y-auto text-xs space-y-2">
                  {result.villagesWithoutOps.map((v: any) => (
                    <div key={v.id} className="p-2 bg-gray-50 rounded">
                      <div className="font-semibold">{v.name}</div>
                      <div className="text-gray-600">{v.suburb}, {v.postcode}</div>
                      <div className="text-red-600">Operator: {v.operator || 'NULL'}</div>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
