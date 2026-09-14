import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Trash2, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

export function DeleteOldVictorianVillages() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    deletedCount?: number;
  } | null>(null);
  const [oldVicCount, setOldVicCount] = useState<number | null>(null);
  const [cutoffDate, setCutoffDate] = useState<string>('');

  const checkOldVicVillages = async () => {
    setLoading(true);
    setResult(null);

    try {
      const supabase = getSupabaseClient();

      // Get ALL Victorian villages
      const { data: allVic, error: allError } = await supabase
        .from('retirement_villages')
        .select('id, name, created_at, postcode, facility_type')
        .eq('state', 'VIC')
        .order('created_at', { ascending: false });

      if (allError) {
        throw new Error(`Failed to fetch VIC villages: ${allError.message}`);
      }

      console.log('📊 All Victorian Villages:', allVic?.length);
      
      // Analyze by date
      const sortedByDate = allVic?.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ) || [];

      // The newest 512 should be your fresh import
      const newest512 = sortedByDate.slice(0, 512);
      const oldest = sortedByDate.slice(512);

      // Find the cutoff date (creation date of the 512th newest)
      const cutoff = newest512.length > 0 ? newest512[newest512.length - 1].created_at : '';
      
      setCutoffDate(cutoff);
      setOldVicCount(oldest.length);

      console.log('📅 Date Analysis:', {
        total: sortedByDate.length,
        newest512Count: newest512.length,
        oldestCount: oldest.length,
        cutoffDate: cutoff,
        newestDate: sortedByDate[0]?.created_at,
        oldestDate: sortedByDate[sortedByDate.length - 1]?.created_at
      });

      // Count villages with missing postcodes in old vs new
      const oldMissingPostcodes = oldest.filter(v => !v.postcode || v.postcode.trim() === '').length;
      const newMissingPostcodes = newest512.filter(v => !v.postcode || v.postcode.trim() === '').length;

      console.log('📍 Postcode Analysis:', {
        oldVillages: oldest.length,
        oldMissingPostcodes,
        newVillages: newest512.length,
        newMissingPostcodes
      });

      alert(
        `📊 Victorian Villages Analysis:\n\n` +
        `Total: ${sortedByDate.length} villages\n\n` +
        `✅ NEWEST 512 (keep):\n` +
        `   - Created after: ${new Date(cutoff).toLocaleDateString()}\n` +
        `   - Missing postcodes: ${newMissingPostcodes}\n\n` +
        `❌ OLDEST ${oldest.length} (delete):\n` +
        `   - Created before: ${new Date(cutoff).toLocaleDateString()}\n` +
        `   - Missing postcodes: ${oldMissingPostcodes}\n\n` +
        `Check console for details.`
      );

    } catch (err) {
      console.error('Error analyzing VIC villages:', err);
      setResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to analyze VIC villages'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteOldVicVillages = async () => {
    if (!cutoffDate) {
      alert('Please check old VIC villages first to determine the cutoff date.');
      return;
    }

    // Double confirmation
    const confirm1 = window.confirm(
      `⚠️ DELETE OLD VICTORIAN VILLAGES?\n\n` +
      `This will delete ${oldVicCount || 0} OLD Victorian villages.\n\n` +
      `❌ DELETES: Villages created BEFORE ${new Date(cutoffDate).toLocaleDateString()}\n` +
      `✅ KEEPS: The newest 512 villages (your fresh import)\n\n` +
      `This action CANNOT be undone!\n\n` +
      `Click OK to continue...`
    );

    if (!confirm1) return;

    const confirm2 = window.prompt(
      'Type DELETE to confirm permanent deletion of old VIC villages:'
    );

    if (confirm2 !== 'DELETE') {
      alert('Deletion cancelled. Must type DELETE exactly.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const supabase = getSupabaseClient();

      console.log(`🗑️ Deleting Victorian villages created before ${cutoffDate}...`);

      // Get all old VIC villages (before cutoff date)
      const { data: oldVillages, error: fetchError } = await supabase
        .from('retirement_villages')
        .select('id')
        .eq('state', 'VIC')
        .lt('created_at', cutoffDate);

      if (fetchError) {
        throw new Error(`Failed to fetch old VIC villages: ${fetchError.message}`);
      }

      const idsToDelete = oldVillages?.map(v => v.id) || [];

      if (idsToDelete.length === 0) {
        setResult({
          success: true,
          message: 'No old Victorian villages to delete!',
          deletedCount: 0
        });
        setOldVicCount(0);
        setLoading(false);
        return;
      }

      console.log(`🗑️ Deleting ${idsToDelete.length} old VIC villages in batches of 100...`);

      // Delete in batches of 100 to avoid "Bad Request" errors
      const batchSize = 100;
      let totalDeleted = 0;

      for (let i = 0; i < idsToDelete.length; i += batchSize) {
        const batch = idsToDelete.slice(i, i + batchSize);
        
        console.log(`🗑️ Deleting batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(idsToDelete.length / batchSize)} (${batch.length} items)...`);

        const { error: deleteError, count } = await supabase
          .from('retirement_villages')
          .delete({ count: 'exact' })
          .in('id', batch);

        if (deleteError) {
          throw new Error(`Batch deletion failed at item ${i}: ${deleteError.message}`);
        }

        totalDeleted += (count || 0);
        console.log(`✅ Deleted ${count} villages (${totalDeleted}/${idsToDelete.length} total)`);

        // Small delay between batches to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      console.log(`✅ Deleted ${totalDeleted} old Victorian villages`);

      setResult({
        success: true,
        message: `Successfully deleted ${totalDeleted} old Victorian villages. You should now have ~512 clean VIC villages remaining.`,
        deletedCount: totalDeleted
      });

      setOldVicCount(0);
      setCutoffDate('');

    } catch (err) {
      console.error('Error deleting old VIC villages:', err);
      setResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to delete old VIC villages'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 border-2 border-purple-300 bg-purple-50">
      <div className="flex items-start gap-4 mb-6">
        <Calendar className="size-8 text-purple-600 flex-shrink-0" />
        <div>
          <h2 className="text-2xl text-purple-900 mb-2">Delete Old Victorian Villages</h2>
          <p className="text-purple-800 mb-2">
            Delete old VIC villages (from previous imports) that have missing postcodes and wrong data.
          </p>
          <p className="text-sm text-purple-700">
            <strong>Strategy:</strong> Keep the newest 512 villages (your fresh import), delete all older ones.
          </p>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <Button
          onClick={checkOldVicVillages}
          disabled={loading}
          variant="outline"
          size="lg"
        >
          <Calendar className="size-5 mr-2" />
          {loading ? 'Analyzing...' : 'Analyze VIC Villages by Date'}
        </Button>

        {oldVicCount !== null && oldVicCount > 0 && (
          <Button
            onClick={deleteOldVicVillages}
            disabled={loading}
            variant="destructive"
            size="lg"
          >
            <Trash2 className="size-5 mr-2" />
            {loading ? 'Deleting...' : `Delete ${oldVicCount} Old VIC Villages`}
          </Button>
        )}
      </div>

      {cutoffDate && oldVicCount !== null && (
        <div className="bg-purple-100 border-2 border-purple-400 rounded-lg p-4 mb-4">
          <p className="text-purple-900 font-semibold mb-2">
            📅 Cutoff Date: {new Date(cutoffDate).toLocaleString()}
          </p>
          <p className="text-sm text-purple-800">
            ❌ Will delete: {oldVicCount} villages created BEFORE this date<br/>
            ✅ Will keep: ~512 villages created ON/AFTER this date
          </p>
        </div>
      )}

      {result && (
        <div className={`rounded-lg p-4 border-2 ${
          result.success 
            ? 'bg-green-50 border-green-300' 
            : 'bg-red-50 border-red-300'
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
                    <li>Use the Victorian Villages Inspector to verify you have ~512 VIC villages</li>
                    <li>Check if they still have missing postcodes</li>
                    <li>If postcodes are still missing, re-import the CSV with the fixed parser</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 p-4 bg-white border border-purple-200 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>⚠️ Important:</strong> This deletes old Victorian villages based on creation date.
          Make sure you've recently imported fresh VIC data before using this tool.
        </p>
      </div>
    </Card>
  );
}
