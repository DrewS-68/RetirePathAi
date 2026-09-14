import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Search, Trash2 } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';
import { Alert, AlertDescription } from '../ui/alert';

export function VICVillageDiagnostic() {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const checkVICVillages = async () => {
    setChecking(true);
    setResults(null);

    try {
      const supabase = getSupabaseClient();

      console.log('🔍 Checking for VIC villages...');

      // Try multiple queries to see what's actually in the database
      
      // Query 1: Exact match state='VIC'
      const { data: vicExact, error: e1 } = await supabase
        .from('retirement_villages')
        .select('id, name, state, operator')
        .eq('state', 'VIC');

      console.log('Query 1 (state=VIC):', vicExact?.length || 0, 'villages');

      // Query 2: Case-insensitive match
      const { data: vicIlike, error: e2 } = await supabase
        .from('retirement_villages')
        .select('id, name, state, operator')
        .ilike('state', 'vic');

      console.log('Query 2 (state ilike vic):', vicIlike?.length || 0, 'villages');

      // Query 3: All villages with Victoria-related states
      const { data: allStates, error: e3 } = await supabase
        .from('retirement_villages')
        .select('id, name, state, operator')
        .or('state.eq.VIC,state.eq.Vic,state.eq.vic,state.eq.Victoria,state.eq.victoria');

      console.log('Query 3 (all Victoria variations):', allStates?.length || 0, 'villages');

      // Query 4: Check if there are villages with NULL state
      const { data: nullState, error: e4 } = await supabase
        .from('retirement_villages')
        .select('id, name, state, operator')
        .is('state', null);

      console.log('Query 4 (NULL state):', nullState?.length || 0, 'villages');

      // Query 5: Count ALL villages in database
      const { count: totalCount, error: e5 } = await supabase
        .from('retirement_villages')
        .select('*', { count: 'exact', head: true });

      console.log('Query 5 (TOTAL villages):', totalCount || 0);

      setResults({
        vicExact: vicExact?.length || 0,
        vicIlike: vicIlike?.length || 0,
        allStates: allStates?.length || 0,
        nullState: nullState?.length || 0,
        totalCount: totalCount || 0,
        sampleVillages: vicExact?.slice(0, 10) || [],
        errors: [e1, e2, e3, e4, e5].filter(e => e !== null)
      });

    } catch (err) {
      console.error('Diagnostic error:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setChecking(false);
    }
  };

  const forceDeleteAll = async () => {
    if (!results) {
      alert('Run diagnostic first!');
      return;
    }

    const confirmed = confirm(
      `🚨 FORCE DELETE ALL VIC VILLAGES 🚨\n\n` +
      `This will delete:\n` +
      `• ${results.vicExact} villages with state='VIC'\n` +
      `• ${results.vicIlike} villages with state ilike 'vic'\n\n` +
      `Are you sure?`
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      const supabase = getSupabaseClient();

      console.log('🗑️ Starting delete operation...');
      console.log('🗑️ Target: Villages with state ilike "vic"');

      // Delete using case-insensitive match
      const { error, count, data } = await supabase
        .from('retirement_villages')
        .delete({ count: 'exact' })
        .ilike('state', 'vic')
        .select(); // Try to get data back to see what happened

      console.log('🗑️ Delete response:', { error, count, data });

      if (error) {
        console.error('❌ Delete error:', error);
        throw new Error(`Delete failed: ${error.message}\n\nDetails: ${JSON.stringify(error, null, 2)}`);
      }

      console.log(`✅ Delete completed. Count: ${count}`);

      if (count === 0) {
        alert(
          `⚠️ WARNING: Delete returned 0 rows!\n\n` +
          `This suggests a Row Level Security (RLS) policy is blocking deletes.\n\n` +
          `Possible solutions:\n` +
          `1. Check Supabase RLS policies on retirement_villages table\n` +
          `2. Use SUPABASE_SERVICE_ROLE_KEY instead of ANON_KEY\n` +
          `3. Disable RLS temporarily for this operation\n\n` +
          `Check the console for more details.`
        );
      } else {
        alert(`✅ Successfully deleted ${count} villages!`);
      }
      
      // Re-run diagnostic
      await checkVICVillages();

    } catch (err) {
      console.error('Delete error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-400">
      <h2 className="text-2xl font-bold mb-2 text-blue-900 flex items-center gap-2">
        <Search className="size-6" />
        🔍 VIC Village Diagnostic
      </h2>
      <p className="text-sm text-blue-700 mb-4">
        Check what VIC villages are actually in the database
      </p>

      <div className="flex gap-2">
        <Button
          onClick={checkVICVillages}
          disabled={checking}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {checking ? 'Checking...' : '🔍 Check Database'}
        </Button>

        {results && results.vicExact > 0 && (
          <Button
            onClick={forceDeleteAll}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleting ? 'Deleting...' : '🗑️ Force Delete All'}
          </Button>
        )}
      </div>

      {results && (
        <Alert className="mt-4 bg-white border-blue-500">
          <AlertDescription>
            <div className="space-y-2 text-sm">
              <h3 className="font-bold text-lg">📊 Database Status:</h3>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-blue-100 rounded">
                  <strong>state='VIC' (exact):</strong> {results.vicExact} villages
                </div>
                <div className="p-2 bg-purple-100 rounded">
                  <strong>state ilike 'vic':</strong> {results.vicIlike} villages
                </div>
                <div className="p-2 bg-green-100 rounded">
                  <strong>All Victoria variations:</strong> {results.allStates} villages
                </div>
                <div className="p-2 bg-yellow-100 rounded">
                  <strong>NULL state:</strong> {results.nullState} villages
                </div>
              </div>

              <div className="p-3 bg-gray-100 rounded mt-3">
                <strong>🌍 TOTAL villages in database:</strong> {results.totalCount}
              </div>

              {results.sampleVillages.length > 0 && (
                <div className="mt-4">
                  <strong>📋 Sample VIC Villages (first 10):</strong>
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    {results.sampleVillages.map((v: any) => (
                      <li key={v.id}>
                        <strong>{v.name}</strong> - {v.operator || '(no operator)'} - State: "{v.state}"
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {results.errors.length > 0 && (
                <div className="mt-4 p-2 bg-red-100 rounded">
                  <strong>⚠️ Errors:</strong>
                  <pre className="text-xs mt-1">{JSON.stringify(results.errors, null, 2)}</pre>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
}