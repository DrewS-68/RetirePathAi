import { useState } from 'react';
import { getSupabaseClient } from '../utils/supabase/client';

export function DebugPostcodeChecker() {
  const [searchTerm, setSearchTerm] = useState('cranbourne');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const checkPostcode = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const supabase = getSupabaseClient();
      
      console.log(`🔍 DEBUG: Searching for villages matching: "${searchTerm}"`);
      
      // Search by suburb OR village name containing the search term
      const { data, error: queryError } = await supabase
        .from('retirement_villages')
        .select('id, name, suburb, postcode, state, latitude, longitude, status, facility_type')
        .or(`suburb.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
        // REMOVED FILTERS - show ALL villages regardless of status/classification
        .order('suburb', { ascending: true });
      
      if (queryError) {
        throw new Error(queryError.message);
      }
      
      console.log(`✅ Found ${data?.length || 0} villages matching "${searchTerm}"`);
      
      // Group by postcode for easier analysis
      const byPostcode: Record<string, any[]> = {};
      (data || []).forEach(village => {
        const pc = village.postcode || 'NO_POSTCODE';
        if (!byPostcode[pc]) byPostcode[pc] = [];
        byPostcode[pc].push(village);
      });
      
      const summary = Object.entries(byPostcode).map(([postcode, villages]) => ({
        postcode,
        count: villages.length,
        withCoordinates: villages.filter(v => v.latitude && v.longitude).length,
        approved: villages.filter(v => v.status === 'approved').length,
        classified: villages.filter(v => v.facility_type).length,
      }));

      setResult({
        total: data?.length || 0,
        villages: data || [],
        byPostcode,
        summary
      });
      
      console.log('🔍 Debug Results:', { total: data?.length, summary });
    } catch (err: any) {
      console.error('Debug check error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">🔍 Postcode Debug Checker</h2>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter suburb or village name..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={checkPostcode}
          disabled={loading}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          ❌ Error: {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">📊 Summary</h3>
            <p className="text-gray-700">Total villages found: <strong>{result.total}</strong></p>
          </div>

          {result.summary && result.summary.length > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">📮 By Postcode</h3>
              <div className="space-y-2">
                {result.summary.map((pc: any) => (
                  <div key={pc.postcode} className="p-3 bg-white rounded border border-gray-200">
                    <div className="font-semibold text-gray-800">{pc.postcode}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {pc.count} villages | {pc.withCoordinates} with coordinates | 
                      {pc.approved} approved | {pc.classified} classified
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.villages && result.villages.length > 0 && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">🏘️ All Villages</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {result.villages.map((village: any) => (
                  <div key={village.id} className="p-3 bg-white rounded border border-gray-200">
                    <div className="font-semibold text-gray-800">{village.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="inline-block mr-3">📍 {village.suburb}, {village.postcode}</span>
                      <span className="inline-block mr-3">
                        {village.latitude && village.longitude ? '✅ Has coordinates' : '❌ No coordinates'}
                      </span>
                      <span className="inline-block mr-3">
                        {village.status === 'approved' ? '✅ Approved' : `⏳ ${village.status}`}
                      </span>
                      <span className="inline-block">
                        {village.facility_type ? `✅ Classified` : '❌ Unclassified'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}