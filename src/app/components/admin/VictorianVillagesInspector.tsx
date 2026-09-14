import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Search, AlertCircle, CheckCircle, MapPin } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';

interface VillageData {
  id: string;
  name: string;
  operator: string;
  location: string;
  suburb: string;
  postcode: string;
  state: string;
  facility_type: string;
  village_type: string;
  status: string;
  created_at: string;
}

export function VictorianVillagesInspector() {
  const [loading, setLoading] = useState(false);
  const [villages, setVillages] = useState<VillageData[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    withPostcode: number;
    withoutPostcode: number;
    retirementVillageType: number;
    agedCareType: number;
    otherType: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inspectVictorianVillages = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();

      // Get all Victorian villages
      const { data, error: fetchError } = await supabase
        .from('retirement_villages')
        .select('id, name, operator, location, suburb, postcode, state, facility_type, village_type, status, created_at')
        .eq('state', 'VIC')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(`Database error: ${fetchError.message}`);
      }

      if (!data) {
        throw new Error('No data returned from database');
      }

      setVillages(data);

      // Calculate stats
      const withPostcode = data.filter(v => v.postcode && v.postcode.trim() !== '').length;
      const withoutPostcode = data.length - withPostcode;
      
      const retirementVillageType = data.filter(v => 
        v.facility_type === 'retirement_village' || 
        v.village_type === 'Retirement Village'
      ).length;
      
      const agedCareType = data.filter(v => 
        v.facility_type === 'aged_care' || 
        v.village_type === 'aged_care'
      ).length;
      
      const otherType = data.length - retirementVillageType - agedCareType;

      setStats({
        total: data.length,
        withPostcode,
        withoutPostcode,
        retirementVillageType,
        agedCareType,
        otherType
      });

      console.log('📊 Victorian Villages Stats:', {
        total: data.length,
        withPostcode,
        withoutPostcode,
        retirementVillageType,
        agedCareType,
        otherType
      });

      console.log('📋 Sample villages:', data.slice(0, 5));

    } catch (err) {
      console.error('Error inspecting Victorian villages:', err);
      setError(err instanceof Error ? err.message : 'Failed to inspect villages');
    } finally {
      setLoading(false);
    }
  };

  const checkCranbourneSpecifically = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();

      // Get all villages with postcode 3977
      const { data, error: fetchError } = await supabase
        .from('retirement_villages')
        .select('id, name, operator, location, suburb, postcode, state, facility_type, village_type, status')
        .eq('postcode', '3977');

      if (fetchError) {
        throw new Error(`Database error: ${fetchError.message}`);
      }

      console.log(`🔍 Found ${data?.length || 0} villages with postcode 3977:`, data);
      
      alert(`Found ${data?.length || 0} villages with postcode 3977. Check console for details.`);

    } catch (err) {
      console.error('Error checking Cranbourne:', err);
      setError(err instanceof Error ? err.message : 'Failed to check Cranbourne');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl mb-4">Victorian Villages Inspector</h2>
        <p className="text-gray-600 mb-4">
          Debug tool to inspect all Victorian villages in the database
        </p>

        <div className="flex gap-3 mb-6">
          <Button onClick={inspectVictorianVillages} disabled={loading}>
            <Search className="size-4 mr-2" />
            {loading ? 'Loading...' : 'Inspect All VIC Villages'}
          </Button>

          <Button onClick={checkCranbourneSpecifically} disabled={loading} variant="outline">
            <MapPin className="size-4 mr-2" />
            Check Cranbourne (3977)
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-red-800">{error}</div>
            </div>
          </div>
        )}

        {stats && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
                <div className="text-sm text-blue-700">Total VIC Villages</div>
              </Card>

              <Card className="p-4 bg-green-50 border-green-200">
                <div className="text-2xl font-bold text-green-900">{stats.withPostcode}</div>
                <div className="text-sm text-green-700">With Postcode</div>
              </Card>

              <Card className="p-4 bg-red-50 border-red-200">
                <div className="text-2xl font-bold text-red-900">{stats.withoutPostcode}</div>
                <div className="text-sm text-red-700">WITHOUT Postcode</div>
              </Card>

              <Card className="p-4 bg-purple-50 border-purple-200">
                <div className="text-2xl font-bold text-purple-900">{stats.retirementVillageType}</div>
                <div className="text-sm text-purple-700">Retirement Village Type</div>
              </Card>

              <Card className="p-4 bg-amber-50 border-amber-200">
                <div className="text-2xl font-bold text-amber-900">{stats.agedCareType}</div>
                <div className="text-sm text-amber-700">Aged Care Type</div>
              </Card>

              <Card className="p-4 bg-gray-50 border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{stats.otherType}</div>
                <div className="text-sm text-gray-700">Other Type</div>
              </Card>
            </div>

            {/* Sample Villages */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Recent Victorian Villages (First 20)</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {villages.slice(0, 20).map((village) => (
                  <div key={village.id} className="border-b border-gray-200 pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{village.name}</div>
                        <div className="text-sm text-gray-600">
                          {village.operator} • {village.location}
                        </div>
                        <div className="text-sm">
                          <span className={village.postcode ? 'text-green-600' : 'text-red-600'}>
                            {village.suburb || 'No suburb'} {village.postcode || 'NO POSTCODE'}
                          </span>
                          {' • '}
                          <span className={
                            village.facility_type === 'retirement_village' ? 'text-purple-600' :
                            village.facility_type === 'aged_care' ? 'text-amber-600' :
                            'text-gray-600'
                          }>
                            {village.facility_type || 'NO TYPE'} / {village.village_type || 'NO VILLAGE TYPE'}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(village.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {stats.withoutPostcode > 0 && (
              <div className="bg-amber-50 border-2 border-amber-500 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="size-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-2">
                      ⚠️ {stats.withoutPostcode} villages have NO POSTCODE!
                    </h3>
                    <p className="text-sm text-amber-800">
                      The address parser failed to extract postcodes from these villages' physical addresses.
                      This means they won't show up in postcode searches!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {stats.agedCareType > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">
                      ℹ️ {stats.agedCareType} villages marked as "aged_care"
                    </h3>
                    <p className="text-sm text-blue-800">
                      These are from old imports. New VIC import should set facility_type = 'retirement_village'
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
