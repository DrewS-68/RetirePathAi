import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';
import { Alert, AlertDescription } from '../ui/alert';

export function VICVillageDeleter() {
  const [deleting, setDeleting] = useState(false);
  const [result, setResult] = useState<{ count: number; success: boolean } | null>(null);

  const deleteAllVICVillages = async () => {
    // First, count how many villages will be deleted
    const supabase = getSupabaseClient();
    const { count, error: countError } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'VIC');

    if (countError) {
      alert(`Error counting villages: ${countError.message}`);
      return;
    }

    const villageCount = count || 0;

    const confirmed = confirm(
      `🚨 DELETE ALL VIC VILLAGES 🚨\n\n` +
      `This will PERMANENTLY DELETE:\n` +
      `• ${villageCount} VIC villages\n` +
      `• All their data (names, operators, websites, etc.)\n\n` +
      `⚠️ THIS CANNOT BE UNDONE! ⚠️\n\n` +
      `After deletion, you can re-import your clean 583 villages.\n\n` +
      `Are you ABSOLUTELY SURE you want to delete all VIC villages?`
    );

    if (!confirmed) return;

    // Double confirmation
    const doubleConfirmed = confirm(
      `⚠️ FINAL WARNING ⚠️\n\n` +
      `You are about to delete ${villageCount} VIC villages.\n\n` +
      `Click OK to DELETE EVERYTHING.\n` +
      `Click Cancel to abort.`
    );

    if (!doubleConfirmed) return;

    setDeleting(true);
    setResult(null);

    try {
      console.log(`🗑️ Deleting all VIC villages...`);

      const { error: deleteError, count: deletedCount } = await supabase
        .from('retirement_villages')
        .delete({ count: 'exact' })
        .eq('state', 'VIC');

      if (deleteError) {
        throw deleteError;
      }

      console.log(`✅ Deleted ${deletedCount || villageCount} VIC villages`);

      setResult({ count: deletedCount || villageCount, success: true });
      
      alert(
        `✅ SUCCESS!\n\n` +
        `Deleted ${deletedCount || villageCount} VIC villages.\n\n` +
        `✅ Your database is now clean!\n\n` +
        `NEXT STEP:\n` +
        `1. Go to "VIC Village CSV Importer"\n` +
        `2. Upload your clean 583 villages CSV\n` +
        `3. Leave "Replace Existing" UNCHECKED (nothing to replace now!)\n` +
        `4. Click "Import to Database"`
      );
    } catch (err) {
      console.error('Error deleting villages:', err);
      alert(`❌ Error: ${err instanceof Error ? err.message : 'Failed to delete villages'}`);
      setResult({ count: 0, success: false });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-400">
      <h2 className="text-2xl font-bold mb-2 text-red-900 flex items-center gap-2">
        <Trash2 className="size-6" />
        🗑️ VIC Village Deleter
      </h2>
      <p className="text-sm text-red-700 mb-4">
        Nuclear option: Delete ALL VIC villages and start completely fresh
      </p>

      <Alert className="mb-4 bg-red-100 border-red-500">
        <AlertTriangle className="size-4" />
        <AlertDescription>
          <strong className="text-red-900">⚠️ DANGER ZONE ⚠️</strong>
          <div className="mt-2 text-sm text-red-800 space-y-2">
            <p><strong>This will:</strong></p>
            <ul className="list-disc ml-4">
              <li>Delete ALL VIC villages from the database</li>
              <li>Remove all their data (names, operators, websites, etc.)</li>
              <li>Cannot be undone!</li>
            </ul>
            <p className="mt-3"><strong>Use this when:</strong></p>
            <ul className="list-disc ml-4">
              <li>You have old/corrupted data mixed with new data</li>
              <li>You want to start completely fresh</li>
              <li>You have a clean CSV ready to re-import</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      <Button
        onClick={deleteAllVICVillages}
        disabled={deleting}
        className="bg-red-600 hover:bg-red-700 text-white font-bold"
      >
        {deleting ? (
          <>
            <Trash2 className="size-4 mr-2 animate-pulse" />
            Deleting...
          </>
        ) : (
          <>
            <Trash2 className="size-4 mr-2" />
            🗑️ DELETE ALL VIC VILLAGES
          </>
        )}
      </Button>

      {result && (
        <Alert className={`mt-4 ${result.success ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'}`}>
          <AlertDescription className={result.success ? 'text-green-900' : 'text-red-900'}>
            {result.success ? (
              <>
                <strong>✅ Success!</strong>
                <p className="mt-1">
                  Deleted {result.count} VIC villages. Database is now clean!
                </p>
                <p className="mt-2 text-sm">
                  <strong>Next step:</strong> Go to "VIC Village CSV Importer" and upload your clean 583 villages.
                </p>
              </>
            ) : (
              <>
                <strong>❌ Failed!</strong>
                <p className="mt-1">
                  Could not delete villages. Check console for errors.
                </p>
              </>
            )}
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
}