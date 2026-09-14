import { useState } from 'react';
import { Trash2, RefreshCw } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

export function DeleteAllVICVillages() {
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [deleted, setDeleted] = useState(false);

  const checkCount = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('retirement_villages')
        .select('id', { count: 'exact', head: true })
        .eq('state', 'VIC');

      if (error) throw error;

      setCount(data?.length || 0);
    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteAll = async () => {
    const confirm1 = window.confirm(
      `⚠️ DELETE ALL ${count} VICTORIA VILLAGES?\n\nThis CANNOT be undone!\n\nClick OK to continue.`
    );
    if (!confirm1) return;

    const confirm2 = window.confirm(
      `⚠️ FINAL WARNING\n\nYou are about to delete ALL ${count} VIC villages.\n\nClick OK to DELETE.`
    );
    if (!confirm2) return;

    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('retirement_villages')
        .delete()
        .eq('state', 'VIC');

      if (error) throw error;

      setDeleted(true);
      setCount(0);
      alert(`✅ Successfully deleted all VIC villages!`);
    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border-4 border-red-500">
      <h2 className="text-xl font-bold text-red-600 mb-4">⚠️ Delete All VIC Data</h2>

      <div className="space-y-4">
        <button
          onClick={checkCount}
          disabled={loading}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
        >
          <RefreshCw className={`inline w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Check Current VIC Count
        </button>

        {count !== null && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-100 rounded">
              <div className="text-3xl font-bold">{count}</div>
              <div className="text-sm text-gray-600">VIC villages in database</div>
            </div>

            {count > 0 && !deleted && (
              <button
                onClick={deleteAll}
                disabled={loading}
                className="w-full px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 font-bold text-lg"
              >
                <Trash2 className="inline w-5 h-5 mr-2" />
                {loading ? 'Deleting...' : `DELETE ALL ${count} VIC VILLAGES`}
              </button>
            )}
          </div>
        )}

        {deleted && (
          <div className="p-4 bg-green-100 rounded border border-green-500">
            <p className="font-bold text-green-800">✅ All VIC villages deleted!</p>
            <p className="text-sm text-green-700 mt-2">Ready to upload fresh data.</p>
          </div>
        )}
      </div>
    </div>
  );
}
