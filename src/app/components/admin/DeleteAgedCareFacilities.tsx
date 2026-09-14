import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

export function DeleteAgedCareFacilities() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    deletedCount?: number;
  } | null>(null);
  const [agedCareCount, setAgedCareCount] = useState<number | null>(null);

  const checkAgedCareCount = async () => {
    setLoading(true);
    setResult(null);

    try {
      const supabase = getSupabaseClient();

      // Count PURE aged care facilities only
      // Delete ONLY if:
      // - facility_type = 'aged_care' AND
      // - village_type is NOT 'Retirement Village' AND
      // - name doesn't contain 'retirement' or 'village'
      const { data: agedCareData, error } = await supabase
        .from('retirement_villages')
        .select('id, name, facility_type, village_type, description')
        .eq('facility_type', 'aged_care');

      if (error) {
        throw new Error(`Failed to fetch aged care facilities: ${error.message}`);
      }

      // Filter to PURE aged care (not combined with retirement village)
      const pureAgedCare = agedCareData?.filter(facility => {
        const name = facility.name?.toLowerCase() || '';
        const villageType = facility.village_type?.toLowerCase() || '';
        const description = facility.description?.toLowerCase() || '';
        
        // KEEP if it's a retirement village (even if it has aged care)
        const isRetirementVillage = 
          villageType.includes('retirement') ||
          villageType.includes('village') ||
          name.includes('retirement') ||
          name.includes('village') ||
          description.includes('retirement village');
        
        // DELETE only if it's NOT a retirement village
        return !isRetirementVillage;
      }) || [];

      const combinedFacilities = (agedCareData?.length || 0) - pureAgedCare.length;

      setAgedCareCount(pureAgedCare.length);
      
      console.log(`📊 Aged Care Analysis:`, {
        total: agedCareData?.length || 0,
        pureAgedCare: pureAgedCare.length,
        combinedWithRetirement: combinedFacilities
      });

      // Show detailed breakdown
      if (combinedFacilities > 0) {
        alert(
          `📊 Found ${agedCareData?.length} aged care facilities:\n\n` +
          `❌ ${pureAgedCare.length} PURE aged care (will delete)\n` +
          `✅ ${combinedFacilities} Combined retirement/aged care (will KEEP)\n\n` +
          `Check console for details.`
        );
      }

    } catch (err) {
      console.error('Error checking aged care count:', err);
      setResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to check aged care count'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAllAgedCare = async () => {
    // Double confirmation
    const confirm1 = window.confirm(
      `⚠️ DELETE PURE AGED CARE FACILITIES ONLY?\n\n` +
      `This will delete ${agedCareCount || 0} PURE aged care facilities.\n\n` +
      `✅ KEEPS: Retirement villages with aged care components\n` +
      `❌ DELETES: Pure aged care facilities (nursing homes, etc.)\n\n` +
      `This action CANNOT be undone!\n\n` +
      `Click OK to continue...`
    );

    if (!confirm1) return;

    const confirm2 = window.prompt(
      'Type DELETE to confirm permanent deletion of pure aged care facilities:'
    );

    if (confirm2 !== 'DELETE') {
      alert('Deletion cancelled. Must type DELETE exactly.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const supabase = getSupabaseClient();

      console.log('🔍 Fetching aged care facilities for smart deletion...');

      // Get all aged care facilities
      const { data: agedCareData, error: fetchError } = await supabase
        .from('retirement_villages')
        .select('id, name, facility_type, village_type, description')
        .eq('facility_type', 'aged_care');

      if (fetchError) {
        throw new Error(`Failed to fetch aged care facilities: ${fetchError.message}`);
      }

      // Filter to PURE aged care only
      const pureAgedCare = agedCareData?.filter(facility => {
        const name = facility.name?.toLowerCase() || '';
        const villageType = facility.village_type?.toLowerCase() || '';
        const description = facility.description?.toLowerCase() || '';
        
        // KEEP if it's a retirement village
        const isRetirementVillage = 
          villageType.includes('retirement') ||
          villageType.includes('village') ||
          name.includes('retirement') ||
          name.includes('village') ||
          description.includes('retirement village');
        
        // DELETE only pure aged care
        return !isRetirementVillage;
      }) || [];

      console.log(`🗑️ Deleting ${pureAgedCare.length} pure aged care facilities...`);
      console.log(`✅ Keeping ${(agedCareData?.length || 0) - pureAgedCare.length} combined facilities`);

      // Delete only the pure aged care facilities by ID
      const idsToDelete = pureAgedCare.map(f => f.id);
      
      if (idsToDelete.length === 0) {
        setResult({
          success: true,
          message: 'No pure aged care facilities to delete. All aged care is combined with retirement villages!',
          deletedCount: 0
        });
        setAgedCareCount(0);
        setLoading(false);
        return;
      }

      console.log(`🗑️ Deleting ${idsToDelete.length} facilities in batches of 100...`);

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
        console.log(`✅ Deleted ${count} facilities (${totalDeleted}/${idsToDelete.length} total)`);

        // Small delay between batches to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      console.log(`✅ Deleted ${totalDeleted} pure aged care facilities`);
      console.log(`✅ Kept ${(agedCareData?.length || 0) - totalDeleted} combined retirement/aged care facilities`);

      setResult({
        success: true,
        message: `Successfully deleted ${totalDeleted} pure aged care facilities. Kept ${(agedCareData?.length || 0) - totalDeleted} combined retirement/aged care facilities.`,
        deletedCount: totalDeleted
      });

      setAgedCareCount(0);

    } catch (err) {
      console.error('Error deleting aged care facilities:', err);
      setResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to delete aged care facilities'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 border-2 border-amber-300 bg-amber-50">
      <div className="flex items-start gap-4 mb-6">
        <AlertTriangle className="size-8 text-amber-600 flex-shrink-0" />
        <div>
          <h2 className="text-2xl text-amber-900 mb-2">Delete All Aged Care Facilities</h2>
          <p className="text-amber-800 mb-2">
            Since you're launching with retirement villages only, this will clean up your database by removing all aged care facilities.
          </p>
          <p className="text-sm text-amber-700">
            <strong>What will be deleted:</strong> Any facility with facility_type = 'aged_care' OR village_type = 'aged_care'
          </p>
          <p className="text-sm text-amber-700">
            <strong>What will be kept:</strong> All retirement_village facilities
          </p>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <Button
          onClick={checkAgedCareCount}
          disabled={loading}
          variant="outline"
          size="lg"
        >
          {loading ? 'Checking...' : 'Check How Many Aged Care'}
        </Button>

        {agedCareCount !== null && (
          <Button
            onClick={deleteAllAgedCare}
            disabled={loading || agedCareCount === 0}
            variant="destructive"
            size="lg"
          >
            <Trash2 className="size-5 mr-2" />
            {loading ? 'Deleting...' : `Delete ${agedCareCount} Aged Care Facilities`}
          </Button>
        )}
      </div>

      {agedCareCount !== null && agedCareCount > 0 && (
        <div className="bg-amber-100 border-2 border-amber-400 rounded-lg p-4 mb-4">
          <p className="text-amber-900 font-semibold">
            📊 Found {agedCareCount} aged care facilities in the database
          </p>
          <p className="text-sm text-amber-800 mt-1">
            Click the delete button above to permanently remove them.
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
              {result.success && result.deletedCount && (
                <div className="mt-3 text-sm text-green-800">
                  <p className="font-semibold">Next Steps:</p>
                  <ol className="list-decimal ml-5 mt-1 space-y-1">
                    <li>Use the Victorian Villages Inspector to verify deletion</li>
                    <li>Check that only retirement villages remain</li>
                    <li>Your database is now clean for launch! 🎉</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 p-4 bg-white border border-amber-200 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>⚠️ Important:</strong> This is a permanent operation. Make sure you have backups if needed.
          Aged care facilities cannot be recovered after deletion.
        </p>
      </div>
    </Card>
  );
}