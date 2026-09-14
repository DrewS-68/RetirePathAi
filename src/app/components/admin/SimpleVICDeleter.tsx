import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export function SimpleVICDeleter() {
  const [loading, setLoading] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [progress, setProgress] = useState<string>('');

  const deleteAll = async () => {
    const confirm1 = window.confirm(
      '⚠️ DELETE ALL VICTORIA VILLAGES?\n\nCurrently 2326 villages in database.\n\nThis CANNOT be undone!\n\nClick OK to continue.'
    );
    if (!confirm1) return;

    const confirm2 = window.confirm(
      '⚠️ FINAL WARNING\n\nClick OK to DELETE ALL 2326 VIC villages.'
    );
    if (!confirm2) return;

    setLoading(true);
    setProgress('Calling backend delete service...');

    try {
      console.log('🗑️ Calling backend to delete all VIC villages...');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/delete-all-vic`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Invalid response: ${responseText}`);
      }

      if (!response.ok || !result.success) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      setCount(result.count);
      setDeleted(true);
      setProgress('');
      alert(`✅ Successfully deleted ${result.count} VIC villages!`);
    } catch (error) {
      console.error('❌ Delete error:', error);
      alert(`Error deleting villages:\n\n${error instanceof Error ? error.message : String(error)}\n\nCheck browser console for details.`);
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border-4 border-red-500">
      <h2 className="text-xl font-bold text-red-600 mb-4">
        🗑️ Delete ALL VIC Villages
      </h2>

      {!deleted && (
        <>
          <button
            onClick={deleteAll}
            disabled={loading}
            className="w-full px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 font-bold text-lg"
          >
            <Trash2 className="inline w-5 h-5 mr-2" />
            {loading ? 'DELETING...' : 'DELETE ALL VIC VILLAGES NOW'}
          </button>

          {progress && (
            <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-300">
              <p className="text-sm font-semibold text-yellow-800">{progress}</p>
            </div>
          )}
        </>
      )}

      {deleted && (
        <div className="p-4 bg-green-100 rounded border border-green-500">
          <p className="font-bold text-green-800">
            ✅ Deleted {count} VIC villages!
          </p>
          <p className="text-sm text-green-700 mt-2">
            Scroll down to re-upload your 470 villages.
          </p>
        </div>
      )}
    </div>
  );
}
