import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

export function DeleteOldVICVillages() {
  const [loading, setLoading] = useState(false);
  const [oldCount, setOldCount] = useState<number | null>(null);
  const [newCount, setNewCount] = useState<number | null>(null);
  const [deleted, setDeleted] = useState(false);

  const checkCounts = async () => {
    try {
      const supabase = getSupabaseClient();
      const today = new Date().toISOString().split('T')[0];

      // Count old villages (created before today)
      const { count: oldVillages, error: oldError } = await supabase
        .from('retirement_villages')
        .select('*', { count: 'exact', head: true })
        .eq('state', 'VIC')
        .lt('created_at', `${today}T00:00:00`);

      if (oldError) throw oldError;

      // Count new villages (created today)
      const { count: newVillages, error: newError } = await supabase
        .from('retirement_villages')
        .select('*', { count: 'exact', head: true })
        .eq('state', 'VIC')
        .gte('created_at', `${today}T00:00:00`);

      if (newError) throw newError;

      setOldCount(oldVillages || 0);
      setNewCount(newVillages || 0);
      console.log(`📊 Old: ${oldVillages}, New: ${newVillages}`);
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };

  const deleteOldVillages = async () => {
    if (oldCount === 0) {
      alert('No old villages to delete');
      return;
    }

    const confirmed = window.confirm(
      `⚠️ Delete ${oldCount} old VIC villages?\n\n` +
      `This will keep the ${newCount} villages uploaded today.\n\n` +
      `Click OK to continue.`
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const supabase = getSupabaseClient();
      const today = new Date().toISOString().split('T')[0];

      // Get all old village IDs
      const { data: oldVillages, error: fetchError } = await supabase
        .from('retirement_villages')
        .select('id')
        .eq('state', 'VIC')
        .lt('created_at', `${today}T00:00:00`);

      if (fetchError) throw fetchError;

      console.log(`🗑️ Deleting ${oldVillages?.length || 0} old villages...`);

      // Delete in batches of 50
      let deletedCount = 0;
      const batchSize = 50;

      for (let i = 0; i < (oldVillages || []).length; i += batchSize) {
        const batch = oldVillages!.slice(i, i + batchSize);
        const ids = batch.map(v => v.id);

        const { error: deleteError } = await supabase
          .from('retirement_villages')
          .delete()
          .in('id', ids);

        if (!deleteError) {
          deletedCount += batch.length;
          console.log(`✅ Deleted batch: ${deletedCount}/${oldVillages!.length}`);
        } else {
          console.error(`❌ Batch error:`, deleteError);
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setDeleted(true);
      setOldCount(0);
      alert(`✅ Deleted ${deletedCount} old villages!`);
    } catch (error) {
      alert(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border-4 border-orange-500">
      <h2 className="text-xl font-bold text-orange-600 mb-4">
        🧹 Clean Up Old Villages
      </h2>

      <p className="text-sm text-gray-600 mb-4">
        After uploading your new CSV, use this tool to delete the old VIC villages.
      </p>

      <div className="space-y-4">
        <button
          onClick={checkCounts}
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 font-semibold"
        >
          🔍 Check Old vs New Villages
        </button>

        {(oldCount !== null || newCount !== null) && (
          <div className="p-4 bg-gray-50 rounded border">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Old Villages (before today)</div>
                <div className="text-2xl font-bold text-red-600">{oldCount}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">New Villages (uploaded today)</div>
                <div className="text-2xl font-bold text-green-600">{newCount}</div>
              </div>
            </div>
          </div>
        )}

        {oldCount !== null && oldCount > 0 && !deleted && (
          <button
            onClick={deleteOldVillages}
            disabled={loading}
            className="w-full px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 font-bold"
          >
            <Trash2 className="inline w-4 h-4 mr-2" />
            {loading ? 'Deleting...' : `Delete ${oldCount} Old Villages`}
          </button>
        )}

        {deleted && (
          <div className="p-4 bg-green-100 rounded border border-green-500">
            <p className="font-bold text-green-800">
              ✅ Old villages deleted! Only {newCount} new villages remain.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
