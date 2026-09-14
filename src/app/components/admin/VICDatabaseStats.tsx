import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Loader2, Database, CheckCircle, XCircle, Building2 } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

interface Stats {
  total: number;
  withOperators: number;
  withoutOperators: number;
  withWebsites: number;
  withoutWebsites: number;
}

export function VICDatabaseStats() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = getSupabaseClient();
      
      // Get all VIC villages
      const { data: allVillages, error: allError } = await supabase
        .from('retirement_villages')
        .select('id, name, operator, website')
        .eq('state', 'VIC');
      
      if (allError) throw allError;
      
      const total = allVillages?.length || 0;
      const withOperators = allVillages?.filter(v => v.operator && v.operator.trim() !== '').length || 0;
      const withoutOperators = total - withOperators;
      const withWebsites = allVillages?.filter(v => v.website && v.website.trim() !== '').length || 0;
      const withoutWebsites = total - withWebsites;
      
      setStats({
        total,
        withOperators,
        withoutOperators,
        withWebsites,
        withoutWebsites,
      });
      
      console.log('✅ VIC Database Stats:', {
        total,
        withOperators,
        withoutOperators,
        withWebsites,
        withoutWebsites,
      });
      
    } catch (err: any) {
      console.error('❌ Error loading stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-400">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Database className="size-5" />
          📊 VIC Database Stats (Live)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={loadStats} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Database className="size-4 mr-2" />
              Check Database Now
            </>
          )}
        </Button>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 rounded text-red-800 text-sm">
            ❌ {error}
          </div>
        )}

        {stats && (
          <div className="space-y-3">
            <div className="p-4 bg-white rounded-lg border-2 border-blue-300">
              <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total VIC Villages in Database</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-green-50 rounded border border-green-300">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="size-4 text-green-600" />
                  <span className="text-xl font-bold text-green-700">{stats.withOperators}</span>
                </div>
                <div className="text-xs text-gray-600">With Operators</div>
              </div>

              <div className="p-3 bg-red-50 rounded border border-red-300">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="size-4 text-red-600" />
                  <span className="text-xl font-bold text-red-700">{stats.withoutOperators}</span>
                </div>
                <div className="text-xs text-gray-600">No Operator</div>
              </div>

              <div className="p-3 bg-blue-50 rounded border border-blue-300">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="size-4 text-blue-600" />
                  <span className="text-xl font-bold text-blue-700">{stats.withWebsites}</span>
                </div>
                <div className="text-xs text-gray-600">With Websites</div>
              </div>

              <div className="p-3 bg-orange-50 rounded border border-orange-300">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="size-4 text-orange-600" />
                  <span className="text-xl font-bold text-orange-700">{stats.withoutWebsites}</span>
                </div>
                <div className="text-xs text-gray-600">No Website</div>
              </div>
            </div>

            <div className="text-xs text-gray-500 mt-2">
              💡 This queries the live Supabase database in real-time
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
