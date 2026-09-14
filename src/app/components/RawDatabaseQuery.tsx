import { useState } from 'react';
import { getSupabaseClient } from '../utils/supabase/client';

export function RawDatabaseQuery() {
  const [postcode, setPostcode] = useState('3977');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const checkDatabase = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      
      // Query 1: Check ALL villages with this postcode (no filters)
      const { data: allVillages, error: error1 } = await supabase
        .from('retirement_villages')
        .select('*')
        .eq('postcode', postcode)
        .order('name');
      
      if (error1) throw error1;
      
      // Query 2: Check villages with status != 'approved'
      const { data: unapproved, error: error2 } = await supabase
        .from('retirement_villages')
        .select('*')
        .eq('postcode', postcode)
        .neq('status', 'approved')
        .order('name');
      
      if (error2) throw error2;
      
      // Query 3: Check villages with null or aged_care facility_type
      const { data: badType, error: error3 } = await supabase
        .from('retirement_villages')
        .select('*')
        .eq('postcode', postcode)
        .or('facility_type.is.null,facility_type.eq.aged_care')
        .order('name');
      
      if (error3) throw error3;
      
      // Query 4: Check total count in entire database
      const { count: totalCount } = await supabase
        .from('retirement_villages')
        .select('*', { count: 'exact', head: true });
      
      setResult({
        totalInDatabase: totalCount || 0,
        allInPostcode: allVillages || [],
        unapproved: unapproved || [],
        badType: badType || []
      });
      
      console.log('=== RAW DATABASE CHECK ===');
      console.log('Total villages in database:', totalCount);
      console.log(`All villages with postcode ${postcode}:`, allVillages);
      console.log('Unapproved:', unapproved);
      console.log('Bad facility type:', badType);
      
    } catch (err: any) {
      console.error(err);
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl font-bold mb-4">🔍 Raw Database Query (No Filters)</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Postcode to check:</label>
        <input
          type="text"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="3977"
        />
      </div>
      
      <button 
        onClick={checkDatabase} 
        disabled={loading}
        className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-semibold mb-4"
      >
        {loading ? 'Checking...' : 'Check Database (All Villages)'}
      </button>

      {result && !result.error && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 border border-gray-300 rounded">
            <strong>📊 Total villages in entire database:</strong> {result.totalInDatabase}
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <strong>🏘️ ALL villages with postcode {postcode} (no filters):</strong> {result.allInPostcode.length}
            <div className="mt-2 space-y-2">
              {result.allInPostcode.map((v: any) => (
                <div key={v.id} className="text-sm bg-white p-2 rounded border">
                  <div className="font-semibold">{v.name}</div>
                  <div className="text-gray-600">
                    Status: <span className="font-mono">{v.status || 'NULL'}</span> | 
                    Type: <span className="font-mono">{v.facility_type || 'NULL'}</span> |
                    Has Coords: {v.latitude && v.longitude ? '✅' : '❌'}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {result.unapproved.length > 0 && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded">
              <strong>⚠️ Villages with status != 'approved':</strong> {result.unapproved.length}
              <div className="mt-2 space-y-1 text-sm">
                {result.unapproved.map((v: any) => (
                  <div key={v.id}>{v.name} - Status: {v.status || 'NULL'}</div>
                ))}
              </div>
            </div>
          )}
          
          {result.badType.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <strong>⚠️ Villages with null/aged_care facility_type:</strong> {result.badType.length}
              <div className="mt-2 space-y-1 text-sm">
                {result.badType.map((v: any) => (
                  <div key={v.id}>{v.name} - Type: {v.facility_type || 'NULL'}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {result?.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          ❌ Error: {result.error}
        </div>
      )}
    </div>
  );
}
