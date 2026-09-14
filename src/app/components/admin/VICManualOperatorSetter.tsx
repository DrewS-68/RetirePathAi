import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Wrench, Loader2 } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

export function VICManualOperatorSetter() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testManualOperatorSet = async () => {
    setLoading(true);
    setResult('');

    try {
      const supabase = getSupabaseClient();

      console.log('🧪 TESTING: Manual operator set on first VIC village');

      // Get first VIC village
      const { data: villages, error: fetchError } = await supabase
        .from('retirement_villages')
        .select('id, name, operator')
        .eq('state', 'VIC')
        .limit(1);

      if (fetchError) {
        throw new Error(`Fetch error: ${fetchError.message}`);
      }

      if (!villages || villages.length === 0) {
        throw new Error('No VIC villages found');
      }

      const village = villages[0];
      console.log(`📋 Testing on: ${village.name}`);
      console.log(`   Current operator: "${village.operator}"`);

      // Try to update operator to "TEST OPERATOR"
      const { data: updateData, error: updateError } = await supabase
        .from('retirement_villages')
        .update({ operator: 'TEST OPERATOR' })
        .eq('id', village.id)
        .select();

      if (updateError) {
        console.error('❌ UPDATE ERROR:', updateError);
        setResult(`❌ UPDATE FAILED: ${updateError.message}\n\nCode: ${updateError.code}\nDetails: ${updateError.details}\nHint: ${updateError.hint}`);
        return;
      }

      console.log('✅ Update response:', updateData);

      // Verify the update
      const { data: verifyData, error: verifyError } = await supabase
        .from('retirement_villages')
        .select('id, name, operator')
        .eq('id', village.id)
        .single();

      if (verifyError) {
        throw new Error(`Verify error: ${verifyError.message}`);
      }

      console.log('🔍 After update:', verifyData);

      if (verifyData.operator === 'TEST OPERATOR') {
        setResult(`✅ SUCCESS!\n\nVillage: ${verifyData.name}\nOperator was set to: "${verifyData.operator}"\n\n✨ The operator field CAN be updated!`);
      } else {
        setResult(`⚠️ MYSTERY!\n\nUpdate succeeded but operator is: "${verifyData.operator}"\nExpected: "TEST OPERATOR"\n\n🤔 Something is overwriting the operator field!`);
      }

    } catch (err: any) {
      console.error('❌ Error:', err);
      setResult(`❌ ERROR: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-400">
      <h2 className="text-2xl font-bold mb-2 text-orange-900 flex items-center gap-2">
        <Wrench className="size-6" />
        🔧 Manual Operator Setter Test
      </h2>
      <p className="text-sm text-orange-700 mb-4">
        Test if we can manually set an operator field to diagnose the import issue
      </p>

      <Button
        onClick={testManualOperatorSet}
        disabled={loading}
        className="bg-orange-600 hover:bg-orange-700 text-white mb-4"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Testing...
          </>
        ) : (
          <>
            <Wrench className="size-4 mr-2" />
            Test Manual Operator Update
          </>
        )}
      </Button>

      {result && (
        <div className="bg-white p-4 rounded border font-mono text-xs whitespace-pre-wrap">
          {result}
        </div>
      )}
    </Card>
  );
}
