import React, { useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

export function VICDuplicateChecker() {
  const [loading, setLoading] = useState(false);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [deleteProgress, setDeleteProgress] = useState<string>('');

  const findDuplicates = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();

      // Get all VIC villages
      const { data: villages, error } = await supabase
        .from('retirement_villages')
        .select('id,name,operator,website,created_at')
        .eq('state', 'VIC')
        .order('name');

      if (error) throw error;

      setTotalCount(villages?.length || 0);

      // Find duplicates by name
      const nameMap = new Map<string, any[]>();
      villages?.forEach(v => {
        const key = v.name.toLowerCase().trim();
        if (!nameMap.has(key)) {
          nameMap.set(key, []);
        }
        nameMap.get(key)!.push(v);
      });

      // Filter to only duplicates
      const dupes: any[] = [];
      nameMap.forEach((villages, name) => {
        if (villages.length > 1) {
          dupes.push({
            name,
            count: villages.length,
            // Sort NEWEST first (descending by created_at)
            villages: villages.sort((a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
          });
        }
      });

      setDuplicates(dupes);
      console.log(`Found ${dupes.length} duplicate sets`);
    } catch (error) {
      alert(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const removeDuplicates = async () => {
    const totalToDelete = duplicates.reduce((sum, d) => sum + d.count - 1, 0);
    const confirmed = window.confirm(
      `Delete ${totalToDelete} duplicate villages?\n\n` +
      `This will keep the NEWEST entry for each village (uploaded today) and delete the old ones.`
    );
    if (!confirmed) return;

    setLoading(true);
    setDeleteProgress(`Starting deletion of ${totalToDelete} duplicates...`);

    try {
      const supabase = getSupabaseClient();
      let deleted = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const dupe of duplicates) {
        // Keep first (newest), delete rest (older ones)
        const toDelete = dupe.villages.slice(1);

        for (const village of toDelete) {
          setDeleteProgress(`Deleting ${deleted + failed + 1}/${totalToDelete}: ${village.name}...`);

          const { error } = await supabase
            .from('retirement_villages')
            .delete()
            .eq('id', village.id);

          if (error) {
            failed++;
            errors.push(`${village.name}: ${error.message}`);
            console.error(`❌ Error deleting ${village.name}:`, error);
          } else {
            deleted++;
            console.log(`✅ Deleted duplicate: ${village.name}`);
          }

          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      setDeleteProgress('');

      if (failed > 0) {
        alert(`⚠️ Partial success:\n\nDeleted: ${deleted}\nFailed: ${failed}\n\nError: ${errors[0]}\n\nCheck console for details.`);
        console.error('Delete errors:', errors);
      } else {
        alert(`✅ Deleted ${deleted} duplicates!`);
      }

      findDuplicates(); // Refresh
    } catch (error) {
      setDeleteProgress('');
      alert(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border-2 border-orange-500">
      <h2 className="text-xl font-bold text-orange-600 mb-4">
        🔍 Check for Duplicates
      </h2>

      <div className="space-y-4">
        <button
          onClick={findDuplicates}
          disabled={loading}
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
        >
          <Search className="inline w-4 h-4 mr-2" />
          {loading ? 'Checking...' : 'Find Duplicates'}
        </button>

        {totalCount > 0 && (
          <div className="p-4 bg-gray-50 rounded">
            <div className="text-2xl font-bold">{totalCount}</div>
            <div className="text-sm text-gray-600">Total VIC villages</div>
            {duplicates.length > 0 && (
              <div className="mt-2 text-orange-600 font-semibold">
                Found {duplicates.length} duplicate sets ({duplicates.reduce((sum, d) => sum + d.count - 1, 0)} duplicates)
              </div>
            )}
          </div>
        )}

        {duplicates.length > 0 && (
          <>
            <div className="max-h-96 overflow-y-auto border rounded">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left p-2 border-b">Village Name</th>
                    <th className="text-left p-2 border-b">Operator</th>
                    <th className="text-left p-2 border-b">Count</th>
                    <th className="text-left p-2 border-b">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {duplicates.map((dupe, i) => (
                    <React.Fragment key={i}>
                      {dupe.villages.map((v: any, j: number) => (
                        <tr key={v.id} className={j === 0 ? 'bg-green-50' : 'bg-red-50'}>
                          <td className="p-2 border-b">{v.name}</td>
                          <td className="p-2 border-b">{v.operator}</td>
                          <td className="p-2 border-b">
                            {j === 0 ? '✓ Keep (Newest)' : '✗ Delete (Old)'}
                          </td>
                          <td className="p-2 border-b text-xs">
                            {new Date(v.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {deleteProgress && (
              <div className="p-3 bg-yellow-50 rounded border border-yellow-300 mb-4">
                <p className="text-sm font-semibold text-yellow-800">{deleteProgress}</p>
              </div>
            )}

            <button
              onClick={removeDuplicates}
              disabled={loading}
              className="w-full px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 font-bold"
            >
              <Trash2 className="inline w-4 h-4 mr-2" />
              {loading ? 'Deleting...' : `Delete ${duplicates.reduce((sum, d) => sum + d.count - 1, 0)} Duplicates`}
            </button>
          </>
        )}

        {duplicates.length === 0 && totalCount > 0 && (
          <div className="p-4 bg-green-50 rounded border border-green-300">
            <p className="text-green-800 font-semibold">
              ✅ No duplicates found! All {totalCount} villages are unique.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
