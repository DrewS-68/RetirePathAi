import { useState } from 'react';
import { getSupabaseClient } from '../utils/supabase/client';
import { Button } from './ui/button';
import { AlertCircle, CheckCircle, Wrench } from 'lucide-react';

export function FixMissingFacilityType() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fixMissingFacilityType = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const supabase = getSupabaseClient();
      
      // Step 1: Find all villages with NULL facility_type
      const { data: nullVillages, error: error1 } = await supabase
        .from('retirement_villages')
        .select('*')
        .is('facility_type', null);
      
      if (error1) throw error1;
      
      console.log('Villages with NULL facility_type:', nullVillages);
      
      // Step 2: Update them to 'retirement_village' (this is the correct value for retirement villages)
      if (nullVillages && nullVillages.length > 0) {
        const { error: updateError } = await supabase
          .from('retirement_villages')
          .update({ facility_type: 'retirement_village' })
          .is('facility_type', null);
        
        if (updateError) throw updateError;
        
        setResult({
          success: true,
          fixed: nullVillages.length,
          villages: nullVillages.map((v: any) => ({
            id: v.id,
            name: v.name,
            postcode: v.postcode,
            state: v.state
          }))
        });
        
        console.log(`✅ Fixed ${nullVillages.length} villages with missing facility_type`);
        
        // Trigger village data refresh
        window.dispatchEvent(new Event('villageDataUpdated'));
      } else {
        setResult({
          success: true,
          fixed: 0,
          message: 'No villages found with missing facility_type'
        });
      }
      
    } catch (err: any) {
      console.error(err);
      setResult({
        success: false,
        error: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Wrench className="size-6 text-orange-600" />
        Fix Missing facility_type
      </h2>
      
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-gray-700 mb-2">
          <strong>What this does:</strong> Finds all villages in the database with <code className="bg-gray-100 px-1 rounded">facility_type = NULL</code> 
          and sets them to <code className="bg-gray-100 px-1 rounded">facility_type = 'retirement_village'</code>
        </p>
        <p className="text-sm text-gray-700">
          <strong>Why:</strong> The Village Directory filters out villages with null facility_type, so they don't appear in search results.
        </p>
      </div>
      
      <button 
        onClick={fixMissingFacilityType} 
        disabled={loading}
        className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-semibold mb-4"
      >
        {loading ? 'Fixing...' : 'Fix All Villages with NULL facility_type'}
      </button>

      {result && result.success && result.fixed > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="size-5 text-green-600" />
            <strong className="text-green-900">✅ Fixed {result.fixed} villages!</strong>
          </div>
          
          <div className="mt-3 max-h-60 overflow-y-auto">
            <p className="text-sm font-semibold text-gray-700 mb-2">Updated villages:</p>
            <div className="space-y-1">
              {result.villages.map((v: any) => (
                <div key={v.id} className="text-sm bg-white p-2 rounded border text-gray-700">
                  <strong>{v.name}</strong> - {v.postcode}, {v.state}
                </div>
              ))}
            </div>
          </div>
          
          <p className="text-sm text-green-700 mt-3">
            These villages will now appear in the Village Directory! 🎉
          </p>
        </div>
      )}
      
      {result && result.success && result.fixed === 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-800">✓ All villages already have facility_type set. No fixes needed!</p>
        </div>
      )}
      
      {result && !result.success && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-5" />
            <strong>Error:</strong>
          </div>
          <p className="mt-1">{result.error}</p>
        </div>
      )}
    </div>
  );
}
