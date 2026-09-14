import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export function DeleteAllVictorianVillages() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    deletedCount?: number;
  } | null>(null);
  const [vicCount, setVicCount] = useState<number | null>(null);

  const checkVicCount = async () => {
    setLoading(true);
    try {
      console.log('📊 Checking VIC village count via backend...');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-cleanup/count`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setVicCount(data.count || 0);
      console.log(`📊 Total Victorian villages: ${data.count || 0}`);
    } catch (err) {
      console.error('Error counting VIC villages:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to count villages'}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteAllVicVillages = async () => {
    // Triple confirmation because this is destructive
    const confirm1 = window.confirm(
      `⚠️⚠️⚠️ DELETE ALL VICTORIAN VILLAGES? ⚠️⚠️⚠️\n\n` +
      `This will permanently delete ALL ${vicCount || 0} Victorian villages.\n\n` +
      `NO filters. NO conditions. EVERYTHING goes.\n\n` +
      `This action CANNOT be undone!\n\n` +
      `Are you ABSOLUTELY SURE?`
    );

    if (!confirm1) return;

    const confirm2 = window.prompt(
      `Type "DELETE ALL VIC" to confirm permanent deletion of all Victorian villages:`
    );

    if (confirm2 !== 'DELETE ALL VIC') {
      alert('Deletion cancelled. Must type "DELETE ALL VIC" exactly.');
      return;
    }

    const confirm3 = window.confirm(
      `FINAL WARNING!\n\n` +
      `This will delete ${vicCount || 0} Victorian villages RIGHT NOW.\n\n` +
      `Click OK to proceed with deletion.`
    );

    if (!confirm3) return;

    setLoading(true);
    setResult(null);

    try {
      console.log('🗑️ DELETING ALL VICTORIAN VILLAGES VIA BACKEND...');
      console.log(`🗑️ Expected to delete: ${vicCount || 0} villages`);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-cleanup/all`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      console.log('✅ DELETION COMPLETE:', data);

      setResult({
        success: true,
        message: data.message || `Successfully deleted all Victorian villages!`,
        deletedCount: data.deletedCount || 0
      });

      setVicCount(0);

    } catch (err) {
      console.error('❌ DELETION FAILED:', err);
      setResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to delete Victorian villages'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 border-4 border-red-500 bg-red-50">
      <div className="flex items-start gap-4 mb-6">
        <AlertTriangle className="size-10 text-red-600 flex-shrink-0" />
        <div>
          <h2 className="text-2xl font-bold text-red-900 mb-2">🚨 NUCLEAR OPTION: Delete ALL Victorian Villages</h2>
          <p className="text-red-800 mb-2">
            <strong>WARNING:</strong> This deletes EVERY Victorian village in the database with NO filters or conditions.
          </p>
          <p className="text-sm text-red-700">
            Use this when you want to completely wipe VIC data and start fresh with a clean import.
          </p>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <Button
          onClick={checkVicCount}
          disabled={loading}
          variant="outline"
          size="lg"
          className="border-red-300"
        >
          {loading ? 'Counting...' : 'Check VIC Village Count'}
        </Button>

        {vicCount !== null && vicCount > 0 && (
          <Button
            onClick={deleteAllVicVillages}
            disabled={loading}
            variant="destructive"
            size="lg"
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="size-5 mr-2" />
            {loading ? 'Deleting...' : `DELETE ALL ${vicCount} VIC VILLAGES`}
          </Button>
        )}
      </div>

      {vicCount !== null && (
        <div className="bg-white border-2 border-red-400 rounded-lg p-4 mb-4">
          <p className="text-red-900 font-bold text-xl">
            📊 Victorian Villages: {vicCount}
          </p>
          {vicCount === 0 && (
            <p className="text-sm text-green-700 mt-2">
              ✅ Database is clean! Ready for fresh VIC Gov import.
            </p>
          )}
        </div>
      )}

      {result && (
        <div className={`rounded-lg p-4 border-2 ${
          result.success 
            ? 'bg-green-50 border-green-300' 
            : 'bg-red-100 border-red-400'
        }`}>
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle className="size-6 text-green-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="size-6 text-red-600 flex-shrink-0" />
            )}
            <div>
              <p className={result.success ? 'text-green-900 font-semibold' : 'text-red-900 font-semibold'}>
                {result.success ? '✅ Success!' : '❌ Error'}
              </p>
              <p className={result.success ? 'text-green-800 text-sm' : 'text-red-800 text-sm'}>
                {result.message}
              </p>
              {result.success && result.deletedCount && result.deletedCount > 0 && (
                <div className="mt-3 text-sm text-green-800">
                  <p className="font-semibold">Next Steps:</p>
                  <ol className="list-decimal ml-5 mt-1 space-y-1">
                    <li>Verify count shows 0 VIC villages</li>
                    <li>Go to VIC Government Data Importer</li>
                    <li>Upload the clean 512-village CSV</li>
                    <li>Map "Physical address" to Address field</li>
                    <li>Import - should get exactly 512 villages</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 p-4 bg-white border-2 border-red-300 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>⚠️ USE WITH EXTREME CAUTION:</strong> This button deletes EVERYTHING from Victoria.
          Only use this when you're absolutely sure you want to wipe the slate clean and re-import from scratch.
        </p>
      </div>
    </Card>
  );
}