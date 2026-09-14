import { useState } from 'react';
import { getSupabaseClient } from '../utils/supabase/client';

export function SimpleVillageQuery() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const checkCranbourne = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      
      // Get ALL villages with "cranbourne" in name or suburb
      const { data, error } = await supabase
        .from('retirement_villages')
        .select('name, suburb, postcode, state, status, facility_type, operator')
        .or('suburb.ilike.%cranbourne%,name.ilike.%cranbourne%')
        .order('name');
      
      if (error) throw error;
      
      setResult({
        total: data?.length || 0,
        villages: data || []
      });
      
      console.log('Cranbourne villages:', data);
    } catch (err: any) {
      console.error(err);
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl font-bold mb-4">🔍 Cranbourne Village Check</h2>
      
      <button 
        onClick={checkCranbourne} 
        disabled={loading}
        className="mb-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
      >
        {loading ? 'Checking...' : 'Check Cranbourne Villages'}
      </button>

      {result && (
        <div>
          {result.error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
              Error: {result.error}
            </div>
          ) : (
            <>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded mb-4">
                <strong>Total found: {result.total}</strong>
              </div>
              
              <div className="space-y-2">
                {result.villages.map((v: any, i: number) => (
                  <div key={i} className="p-3 bg-gray-50 border rounded">
                    <div className="font-semibold">{v.name}</div>
                    <div className="text-sm text-gray-600">
                      {v.suburb} {v.postcode} | Status: {v.status || 'N/A'} | Type: {v.facility_type || 'N/A'}
                      {v.operator && ` | Operator: ${v.operator}`}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}