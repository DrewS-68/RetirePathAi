import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { getSupabaseClient } from '../../utils/supabase/client';

interface BackendPersistenceTestProps {
  accessToken: string | null;
}

export function BackendPersistenceTest({ accessToken }: BackendPersistenceTestProps) {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);

  const runTest = async () => {
    setTesting(true);
    setResult(null);
    setSuccess(null);

    try {
      const supabase = getSupabaseClient();
      const testWebsite = `https://backend-test-${Date.now()}.com`;

      console.log('🧪 BACKEND PERSISTENCE TEST STARTING...');

      // Step 1: Get the FIRST VIC village
      const { data: villages, error: fetchError } = await supabase
        .from('retirement_villages')
        .select('id, name, website, state')
        .eq('state', 'VIC')
        .limit(1);

      if (fetchError || !villages || villages.length === 0) {
        setResult(`❌ FAILED: Could not fetch VIC villages: ${fetchError?.message}`);
        setSuccess(false);
        return;
      }

      const testVillage = villages[0];
      console.log('📍 Test village:', testVillage);
      console.log('📍 Original website:', testVillage.website);

      // Step 2: Call the BACKEND save-websites endpoint (what the scraper uses)
      console.log('💾 Calling backend /scraper/save-websites endpoint...');
      
      const saveResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scraper/save-websites`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            results: [{
              villageId: testVillage.id,
              villageName: testVillage.name,
              website: testWebsite,
              status: 'found'
            }]
          }),
        }
      );

      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        setResult(`❌ BACKEND SAVE FAILED (${saveResponse.status}): ${errorText}`);
        setSuccess(false);
        console.error('Backend save error:', errorText);
        return;
      }

      const saveResult = await saveResponse.json();
      console.log('💾 Backend save response:', saveResult);

      if (!saveResult.success) {
        setResult(`❌ BACKEND RETURNED ERROR: ${JSON.stringify(saveResult)}`);
        setSuccess(false);
        return;
      }

      // Step 3: Read back from database to verify it saved
      console.log('🔍 Reading back from database...');
      
      const { data: updatedVillage, error: readError } = await supabase
        .from('retirement_villages')
        .select('website')
        .eq('id', testVillage.id)
        .single();

      if (readError) {
        setResult(`❌ FAILED TO READ BACK: ${readError.message}`);
        setSuccess(false);
        return;
      }

      console.log('🔍 Read back website:', updatedVillage.website);

      // Step 4: Compare
      if (updatedVillage.website === testWebsite) {
        setResult(`✅ SUCCESS! Backend save endpoint WORKS!\n\n` +
          `✅ Wrote: ${testWebsite}\n` +
          `✅ Read back: ${updatedVillage.website}\n\n` +
          `🎉 The Web Scraper Tool WILL persist data!`);
        setSuccess(true);
      } else {
        setResult(`❌ DATA MISMATCH!\n\n` +
          `Wrote: ${testWebsite}\n` +
          `Read back: ${updatedVillage.website}\n\n` +
          `❌ The Web Scraper Tool WILL NOT persist data!`);
        setSuccess(false);
      }

    } catch (error: any) {
      console.error('Test error:', error);
      setResult(`❌ TEST ERROR: ${error.message}`);
      setSuccess(false);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="p-6 border-2 border-purple-500 bg-purple-50">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-purple-900 mb-2">
            🧪 Backend Persistence Test
          </h3>
          <p className="text-sm text-purple-700 mb-4">
            Tests if the <strong>backend /scraper/save-websites endpoint</strong> can save data.
            This is the SAME endpoint the Web Scraper Tool uses!
          </p>

          <Button
            onClick={runTest}
            disabled={testing}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing Backend...
              </>
            ) : (
              <>🧪 Run Backend Test</>
            )}
          </Button>

          {result && (
            <div className={`mt-4 p-4 rounded-lg border-2 ${
              success 
                ? 'bg-green-50 border-green-500' 
                : 'bg-red-50 border-red-500'
            }`}>
              <div className="flex items-start gap-2">
                {success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <pre className="text-sm font-mono whitespace-pre-wrap flex-1">
                  {result}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
