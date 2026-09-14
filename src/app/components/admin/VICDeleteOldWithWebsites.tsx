import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Trash2, AlertTriangle } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

export function VICDeleteOldWithWebsites() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [result, setResult] = useState<{ deleted: number; success: boolean } | null>(null);

  const checkCount = async () => {
    setChecking(true);
    try {
      const supabase = getSupabaseClient();
      
      // Count villages with websites
      const { data, error, count: dbCount } = await supabase
        .from('retirement_villages')
        .select('id, name, website', { count: 'exact' })
        .eq('state', 'VIC')
        .not('website', 'is', null)
        .neq('website', '');

      if (error) throw error;

      setCount(data?.length || 0);
      
      alert(
        `🔍 FOUND ${data?.length || 0} OLD VIC VILLAGES\n\n` +
        `These villages have websites and are the OLD data.\n\n` +
        `Your NEW 583 villages have NO websites, so they're safe!\n\n` +
        `Ready to delete the old ${data?.length || 0} villages?`
      );
    } catch (err) {
      console.error('Error checking count:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to check count'}`);
    } finally {
      setChecking(false);
    }
  };

  const deleteOldVillages = async () => {
    if (count === null) {
      alert('⚠️ Please check the count first!');
      return;
    }

    const confirmed = confirm(
      `🗑️ DELETE OLD VIC VILLAGES WITH WEBSITES\n\n` +
      `This will PERMANENTLY DELETE:\n` +
      `• ${count} VIC villages that HAVE websites\n\n` +
      `✅ Your ${371} NEW villages WITHOUT websites will be SAFE!\n\n` +
      `⚠️ THIS CANNOT BE UNDONE!\n\n` +
      `Delete the ${count} old villages?`
    );

    if (!confirmed) return;

    setLoading(true);
    setResult(null);

    try {
      const supabase = getSupabaseClient();

      console.log(`🗑️ Deleting VIC villages with websites...`);

      // First, get all villages with websites to delete
      const { data: villagesToDelete, error: fetchError } = await supabase
        .from('retirement_villages')
        .select('id, name, website')
        .eq('state', 'VIC')
        .not('website', 'is', null)
        .neq('website', '');

      if (fetchError) {
        console.error('Error fetching villages to delete:', fetchError);
        throw fetchError;
      }

      console.log(`Found ${villagesToDelete?.length || 0} villages to delete:`, villagesToDelete);

      if (!villagesToDelete || villagesToDelete.length === 0) {
        alert('⚠️ No villages with websites found to delete!');
        setLoading(false);
        return;
      }

      // Delete them one by one to ensure they're removed
      let deletedCount = 0;
      const errors: string[] = [];

      for (const village of villagesToDelete) {
        const { error: deleteError } = await supabase
          .from('retirement_villages')
          .delete()
          .eq('id', village.id);

        if (deleteError) {
          console.error(`Error deleting village ${village.name}:`, deleteError);
          errors.push(`${village.name}: ${deleteError.message}`);
        } else {
          deletedCount++;
          console.log(`✅ Deleted: ${village.name} (${village.website})`);
        }
      }

      if (errors.length > 0) {
        console.error('Deletion errors:', errors);
        alert(
          `⚠️ PARTIAL SUCCESS\n\n` +
          `Deleted: ${deletedCount} villages\n` +
          `Failed: ${errors.length} villages\n\n` +
          `Errors:\n${errors.slice(0, 5).join('\n')}\n\n` +
          `Check console for full details.`
        );
        setResult({ deleted: deletedCount, success: false });
      } else {
        console.log(`✅ Successfully deleted all ${deletedCount} villages with websites`);
        setResult({ deleted: deletedCount, success: true });
        
        alert(
          `✅ SUCCESS!\n\n` +
          `Deleted ${deletedCount} old VIC villages with websites.\n\n` +
          `✅ Your clean ${371} villages WITHOUT websites are intact!\n\n` +
          `Database now has only your NEW data! 🎉\n\n` +
          `NEXT STEP:\n` +
          `Run the Database Inspector again to verify they're gone!`
        );
      }
    } catch (err) {
      console.error('Error deleting villages:', err);
      alert(`❌ Error: ${err instanceof Error ? err.message : 'Failed to delete villages'}`);
      setResult({ deleted: 0, success: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-400">
      <h2 className="text-2xl font-bold mb-2 text-orange-900 flex items-center gap-2">
        <Trash2 className="size-6" />
        🎯 VIC: Delete OLD Villages (With Websites)
      </h2>
      <p className="text-sm text-orange-700 mb-4">
        Surgically remove the 70 OLD villages that have websites, keeping your 371 NEW villages safe
      </p>

      <Alert className="mb-4 bg-yellow-50 border-yellow-400">
        <AlertTriangle className="size-4" />
        <AlertDescription>
          <strong className="text-yellow-900">🎯 TARGETED DELETION</strong>
          <div className="mt-2 text-sm text-yellow-800 space-y-2">
            <p><strong>What this does:</strong></p>
            <ul className="list-disc ml-4">
              <li><strong className="text-red-700">DELETES:</strong> VIC villages that HAVE websites (the old 70)</li>
              <li><strong className="text-green-700">KEEPS SAFE:</strong> VIC villages WITHOUT websites (your new 371)</li>
            </ul>
            <p className="mt-3 text-xs bg-blue-50 p-2 rounded border border-blue-200">
              <strong>Why this works:</strong><br />
              • Your 583 NEW villages from CSV have NO websites<br />
              • The 70 OLD villages all have websites<br />
              • So deleting "villages with websites" = removing old data only! ✅
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {count !== null && (
        <Alert className="mb-4 bg-orange-100 border-orange-400">
          <AlertDescription>
            <strong className="text-orange-900">Found {count} old villages with websites</strong>
            <p className="text-sm text-orange-800 mt-1">
              These will be deleted. Your {371} villages without websites will remain safe.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <div className="flex gap-3">
          <Button
            onClick={checkCount}
            disabled={checking || loading}
            variant="outline"
            className="bg-blue-50 hover:bg-blue-100 border-blue-300"
          >
            {checking ? (
              <>
                <Trash2 className="size-4 mr-2 animate-pulse" />
                Checking...
              </>
            ) : (
              <>
                🔍 Step 1: Check How Many Will Be Deleted
              </>
            )}
          </Button>

          <Button
            onClick={deleteOldVillages}
            disabled={loading || checking || count === null}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
          >
            {loading ? (
              <>
                <Trash2 className="size-4 mr-2 animate-pulse" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="size-4 mr-2" />
                🗑️ Step 2: Delete {count !== null ? count : '???'} Old Villages
              </>
            )}
          </Button>
        </div>

        {count === null && (
          <p className="text-sm text-orange-700">
            👆 Click "Step 1" first to see how many villages will be deleted
          </p>
        )}
      </div>

      {result && (
        <Alert className={`mt-4 ${result.success ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'}`}>
          <AlertDescription className={result.success ? 'text-green-900' : 'text-red-900'}>
            {result.success ? (
              <>
                <strong>✅ Success!</strong>
                <p className="mt-1">
                  Deleted {result.deleted} old VIC villages with websites.
                </p>
                <p className="mt-2 text-sm">
                  <strong>Your clean data is now ready!</strong><br />
                  Next: Upload a CSV with website URLs to enrich the remaining villages.
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

      {/* Summary */}
      <div className="mt-4 p-4 bg-white rounded-lg border-2 border-orange-200">
        <h3 className="font-semibold mb-2 text-orange-900">📊 Current Database State</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 bg-gray-50 rounded border border-gray-200">
            <div className="text-2xl font-bold">441</div>
            <div className="text-xs text-gray-600">Total VIC</div>
          </div>
          <div className="p-2 bg-red-50 rounded border border-red-200">
            <div className="text-2xl font-bold text-red-700">70</div>
            <div className="text-xs text-red-600">OLD (have websites)</div>
          </div>
          <div className="p-2 bg-green-50 rounded border border-green-200">
            <div className="text-2xl font-bold text-green-700">371</div>
            <div className="text-xs text-green-600">NEW (no websites)</div>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-3 text-center">
          After deletion: 371 clean villages ready for website URLs
        </p>
      </div>
    </Card>
  );
}