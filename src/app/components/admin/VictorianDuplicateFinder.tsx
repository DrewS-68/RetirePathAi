import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Search, Copy, Trash2 } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

interface DuplicateGroup {
  name: string;
  count: number;
  villages: {
    id: string;
    name: string;
    operator: string;
    suburb: string;
    postcode: string;
    facility_type: string;
    village_type: string;
    source: string;
    created_at: string;
  }[];
}

export function VictorianDuplicateFinder() {
  const [loading, setLoading] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    uniqueNames: number;
    duplicateGroups: number;
    totalDuplicates: number;
  } | null>(null);

  const findDuplicates = async () => {
    setLoading(true);

    try {
      const supabase = getSupabaseClient();

      // Get ALL Victorian villages
      const { data, error } = await supabase
        .from('retirement_villages')
        .select('id, name, operator, suburb, postcode, facility_type, village_type, source, created_at')
        .eq('state', 'VIC')
        .order('name');

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Group by name (case-insensitive, trimmed)
      const groupedByName: { [key: string]: typeof data } = {};
      
      data?.forEach(v => {
        const normalizedName = v.name.trim().toLowerCase();
        if (!groupedByName[normalizedName]) {
          groupedByName[normalizedName] = [];
        }
        groupedByName[normalizedName].push(v);
      });

      // Find groups with more than 1 village (duplicates)
      const duplicateGroups: DuplicateGroup[] = Object.entries(groupedByName)
        .filter(([_, villages]) => villages.length > 1)
        .map(([name, villages]) => ({
          name: villages[0].name, // Use original name (not normalized)
          count: villages.length,
          villages: villages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        }))
        .sort((a, b) => b.count - a.count);

      const totalDuplicates = duplicateGroups.reduce((sum, group) => sum + (group.count - 1), 0);

      setDuplicates(duplicateGroups);
      setStats({
        total: data?.length || 0,
        uniqueNames: Object.keys(groupedByName).length,
        duplicateGroups: duplicateGroups.length,
        totalDuplicates
      });

      console.log('🔍 Duplicate Analysis:', {
        total: data?.length || 0,
        uniqueNames: Object.keys(groupedByName).length,
        duplicateGroups: duplicateGroups.length,
        totalDuplicates
      });

    } catch (err) {
      console.error('Error finding duplicates:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to find duplicates'}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteOldestDuplicates = async () => {
    const confirm1 = window.confirm(
      `⚠️ DELETE OLDEST DUPLICATES?\n\n` +
      `This will delete ${stats?.totalDuplicates || 0} duplicate villages.\n\n` +
      `Strategy: For each village name, keep the NEWEST entry and delete all older ones.\n\n` +
      `This action CANNOT be undone!\n\n` +
      `Click OK to continue...`
    );

    if (!confirm1) return;

    const confirm2 = window.prompt(
      'Type DELETE to confirm permanent deletion of duplicates:'
    );

    if (confirm2 !== 'DELETE') {
      alert('Deletion cancelled. Must type DELETE exactly.');
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabaseClient();

      // For each duplicate group, delete all except the newest
      const idsToDelete: string[] = [];

      duplicates.forEach(group => {
        // Keep the first one (newest), delete the rest
        const toDelete = group.villages.slice(1);
        idsToDelete.push(...toDelete.map(v => v.id));
      });

      console.log('🗑️ DELETION STARTING...');
      console.log(`🗑️ Total IDs to delete: ${idsToDelete.length}`);
      console.log(`🗑️ First 10 IDs:`, idsToDelete.slice(0, 10));

      if (idsToDelete.length === 0) {
        alert('❌ No villages to delete!');
        setLoading(false);
        return;
      }

      // Delete in batches of 100
      const batchSize = 100;
      let totalDeleted = 0;
      const errors: string[] = [];

      for (let i = 0; i < idsToDelete.length; i += batchSize) {
        const batch = idsToDelete.slice(i, i + batchSize);
        
        console.log(`🗑️ Deleting batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(idsToDelete.length / batchSize)} (${batch.length} items)...`);

        const { error: deleteError, count } = await supabase
          .from('retirement_villages')
          .delete({ count: 'exact' })
          .in('id', batch);

        if (deleteError) {
          console.error('❌ Batch deletion error:', deleteError);
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${deleteError.message}`);
          // Continue with other batches even if one fails
        } else {
          totalDeleted += (count || 0);
          console.log(`✅ Deleted ${count} villages (${totalDeleted}/${idsToDelete.length} total)`);
        }

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      console.log('✅ DELETION COMPLETE');
      console.log(`✅ Total deleted: ${totalDeleted} out of ${idsToDelete.length} attempted`);

      if (errors.length > 0) {
        console.error('❌ Errors encountered:', errors);
        alert(
          `⚠️ Partial deletion:\n\n` +
          `✅ Deleted: ${totalDeleted}/${idsToDelete.length}\n` +
          `❌ Errors: ${errors.length}\n\n` +
          `Check console for details.`
        );
      } else {
        alert(
          `✅ Successfully deleted ${totalDeleted} duplicate villages!\n\n` +
          `You should now have ${stats!.uniqueNames} unique Victorian villages.`
        );
      }

      // Refresh the analysis
      console.log('🔄 Refreshing analysis...');
      await findDuplicates();

    } catch (err) {
      console.error('❌ DELETION FAILED:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to delete duplicates'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 border-2 border-orange-300 bg-orange-50">
      <div className="flex items-start gap-4 mb-6">
        <Copy className="size-8 text-orange-600 flex-shrink-0" />
        <div>
          <h2 className="text-2xl text-orange-900 mb-2">Victorian Duplicate Finder</h2>
          <p className="text-orange-800 mb-2">
            Find villages with identical names and identify which sources they came from
          </p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <Button
          onClick={findDuplicates}
          disabled={loading}
          size="lg"
        >
          <Search className="size-5 mr-2" />
          {loading ? 'Analyzing...' : 'Find Duplicate Villages'}
        </Button>

        {stats && stats.totalDuplicates > 0 && (
          <Button
            onClick={deleteOldestDuplicates}
            disabled={loading}
            variant="destructive"
            size="lg"
          >
            <Trash2 className="size-5 mr-2" />
            {loading ? 'Deleting...' : `Delete ${stats.totalDuplicates} Oldest Duplicates`}
          </Button>
        )}
      </div>

      {stats && (
        <Card className="p-4 bg-white mb-6">
          <h3 className="font-semibold text-xl mb-3">Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Villages</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Unique Names</p>
              <p className="text-2xl font-bold text-green-600">{stats.uniqueNames}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Duplicate Groups</p>
              <p className="text-2xl font-bold text-orange-600">{stats.duplicateGroups}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Duplicates</p>
              <p className="text-2xl font-bold text-red-600">{stats.totalDuplicates}</p>
            </div>
          </div>
          {stats.totalDuplicates > 0 && (
            <p className="text-sm text-orange-700 mt-3">
              ⚠️ If you delete {stats.totalDuplicates} duplicates, you'll have {stats.uniqueNames} unique villages
            </p>
          )}
        </Card>
      )}

      {duplicates.length > 0 && (
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          <h3 className="font-semibold text-lg">
            Duplicate Villages ({duplicates.length} groups)
          </h3>
          {duplicates.map((group, idx) => (
            <Card key={idx} className="p-4 bg-white border-2 border-orange-200">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-orange-900">{group.name}</h4>
                <span className="text-sm font-bold text-red-600">{group.count} entries</span>
              </div>
              <div className="space-y-2">
                {group.villages.map((v, vIdx) => (
                  <div 
                    key={v.id} 
                    className={`p-3 rounded text-sm ${
                      vIdx === 0 
                        ? 'bg-green-50 border-2 border-green-400' 
                        : 'bg-red-50 border border-red-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">
                        {vIdx === 0 ? '✅ KEEP (newest)' : `❌ DELETE (${vIdx === 1 ? '2nd oldest' : vIdx === 2 ? '3rd oldest' : `${vIdx + 1}th oldest`})`}
                      </span>
                      <span className="text-xs text-gray-600">
                        {new Date(v.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-700">
                      Source: <span className="font-medium">{v.source}</span> • 
                      Type: {v.facility_type} / {v.village_type} • 
                      Operator: {v.operator || 'None'} • 
                      {v.suburb} {v.postcode || 'NO POSTCODE'}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {stats && stats.totalDuplicates === 0 && (
        <Card className="p-4 bg-green-50 border-2 border-green-300">
          <p className="text-green-900 font-semibold">
            ✅ No duplicates found! All {stats.uniqueNames} Victorian villages have unique names.
          </p>
        </Card>
      )}
    </Card>
  );
}