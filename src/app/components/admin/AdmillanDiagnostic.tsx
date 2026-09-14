import React, { useState } from 'react';
import { AlertCircle, Search, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { getSupabaseClient } from '../../utils/supabase/client';

export default function AdmillanDiagnostic() {
  const [loading, setLoading] = useState(false);
  const [village, setVillage] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const checkAdmillan = async () => {
    setLoading(true);
    setError(null);
    setVillage(null);

    try {
      const supabase = getSupabaseClient();
      
      const { data, error: fetchError } = await supabase
        .from('retirement_villages')
        .select('*')
        .eq('state', 'VIC')
        .ilike('name', '%Admillan%')
        .limit(1)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setVillage(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Search className="w-8 h-8 text-purple-500" />
          <div>
            <h1 className="text-2xl font-bold">🔍 Admillan Diagnostic</h1>
            <p className="text-gray-600 text-sm">
              Check what operator data we have for Admillan
            </p>
          </div>
        </div>

        <button
          onClick={checkAdmillan}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium shadow"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Check Admillan Data
            </>
          )}
        </button>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-2">❌ Error</h3>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {village && (
          <div className="mt-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3">📋 Village Data:</h3>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-blue-900">Name:</span>
                  <span className="text-blue-800">{village.name}</span>
                  
                  <span className="font-medium text-blue-900">Operator:</span>
                  <span className="text-blue-800 font-bold">{village.operator || '❌ NULL'}</span>
                  
                  <span className="font-medium text-blue-900">Suburb:</span>
                  <span className="text-blue-800">{village.suburb}</span>
                  
                  <span className="font-medium text-blue-900">State:</span>
                  <span className="text-blue-800">{village.state}</span>
                  
                  <span className="font-medium text-blue-900">Website:</span>
                  <span className="text-blue-800">{village.website || '❌ NULL'}</span>
                  
                  <span className="font-medium text-blue-900">Facility Type:</span>
                  <span className="text-blue-800">{village.facility_type || '❌ NULL'}</span>
                </div>
              </div>
            </div>

            {village.operator && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Operator Analysis:</h3>
                <p className="text-yellow-800 text-sm mb-2">
                  Database says operator is: <strong>"{village.operator}"</strong>
                </p>
                <p className="text-yellow-800 text-sm">
                  ❓ Is this correct? If Admillan is INDEPENDENT, we should set operator to NULL or "Independent"
                </p>
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">📄 Full Raw Data:</h3>
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap font-mono text-gray-700 bg-white p-4 rounded border border-gray-200 max-h-96 overflow-y-auto">
                {JSON.stringify(village, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
