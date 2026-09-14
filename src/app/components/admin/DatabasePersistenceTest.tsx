import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

export function DatabasePersistenceTest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const runTest = async () => {
    setTesting(true);
    setResult(null);

    try {
      const supabase = getSupabaseClient();
      const testWebsite = `https://test-${Date.now()}.com`;

      console.log('🧪 PERSISTENCE TEST STARTING...');

      // Step 1: Get the FIRST VIC village
      const { data: villages, error: fetchError } = await supabase
        .from('retirement_villages')
        .select('id, name, website')
        .eq('state', 'VIC')
        .limit(1);

      if (fetchError || !villages || villages.length === 0) {
        setResult(`❌ FAILED: Could not fetch VIC villages: ${fetchError?.message}`);
        return;
      }

      const testVillage = villages[0];
      console.log('📍 Test village:', testVillage);

      // Step 2: Update its website
      const { error: updateError } = await supabase
        .from('retirement_villages')
        .update({ 
          website: testWebsite,
          updated_at: new Date().toISOString()
        })
        .eq('id', testVillage.id);

      if (updateError) {
        setResult(`❌ UPDATE FAILED: ${updateError.message}\n\nThis is why data isn't persisting!`);
        console.error('Update error:', updateError);
        return;
      }

      console.log('✅ Update command executed');

      // Step 3: Wait 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 4: Read it back
      const { data: verification, error: verifyError } = await supabase
        .from('retirement_villages')
        .select('id, name, website')
        .eq('id', testVillage.id)
        .single();

      if (verifyError) {
        setResult(`❌ VERIFICATION FAILED: ${verifyError.message}`);
        return;
      }

      console.log('📖 Read back:', verification);

      // Step 5: Check if it matches
      if (verification.website === testWebsite) {
        setResult(`✅ SUCCESS! Data persists correctly!\n\nVillage: ${testVillage.name}\nOld website: ${testVillage.website || '(none)'}\nNew website: ${testWebsite}\nVerified: ${verification.website}\n\n✅ Database writes are working!\n\nThe problem must be:\n1. Fuzzy matching not finding villages\n2. Or health check querying wrong data`);
      } else {
        setResult(`❌ DATA NOT PERSISTING!\n\nVillage: ${testVillage.name}\nWrote: ${testWebsite}\nRead back: ${verification.website}\n\n⚠️ THIS IS THE ROOT PROBLEM!\nLikely causes:\n- Row Level Security (RLS) policies blocking updates\n- Permissions issues\n- Database triggers reverting changes\n- Using wrong Supabase client`);
      }

    } catch (err) {
      console.error('Test error:', err);
      setResult(`❌ TEST ERROR: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-400">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-purple-900 mb-2">
          🧪 Database Persistence Test
        </h2>
        <p className="text-sm text-purple-700">
          Test if database updates actually persist - diagnose the root cause
        </p>
      </div>

      <Button
        onClick={runTest}
        disabled={testing}
        className="w-full bg-purple-600 hover:bg-purple-700 mb-6"
      >
        {testing ? 'Testing...' : '🧪 Run Persistence Test'}
      </Button>

      {result && (
        <div className={`border-2 rounded-lg p-4 whitespace-pre-wrap font-mono text-sm ${
          result.includes('SUCCESS') 
            ? 'bg-green-50 border-green-400 text-green-900'
            : 'bg-red-50 border-red-400 text-red-900'
        }`}>
          {result}
        </div>
      )}
    </Card>
  );
}
