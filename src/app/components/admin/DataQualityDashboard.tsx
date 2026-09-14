import React, { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Database,
  BarChart3
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface Village {
  id: string;
  name: string;
  operator: string | null;
  location: string;
  suburb: string;
  postcode: string;
  state: string;
  contact_phone: string | null;
  contact_email: string | null;
  website: string | null;
  total_units: number | null;
  village_type: string | null;
  dmf_structure: string | null;
  entry_price_min: number | null;
  entry_price_max: number | null;
  monthly_fees_min: number | null;
  monthly_fees_max: number | null;
  amenities: string[];
  care_services: string[];
  age_restriction: number;
  description: string | null;
  images: string[];
  pet_friendly: boolean;
}

interface FieldStats {
  fieldName: string;
  displayName: string;
  tier: 1 | 2 | 3;
  filled: number;
  total: number;
  percentage: number;
}

interface TierStats {
  tier: 1 | 2 | 3;
  tierName: string;
  complete: number;
  total: number;
  percentage: number;
}

interface DataQualityDashboardProps {
  accessToken?: string;
}

export function DataQualityDashboard({ accessToken }: DataQualityDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [villages, setVillages] = useState<Village[]>([]);
  const [fieldStats, setFieldStats] = useState<FieldStats[]>([]);
  const [tierStats, setTierStats] = useState<TierStats[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string>('ALL');

  // Define field requirements
  const fieldRequirements = {
    tier1: [
      { field: 'name', display: 'Village Name' },
      { field: 'state', display: 'State' },
      { field: 'suburb', display: 'Suburb/City' },
      { field: 'postcode', display: 'Postcode' },
      { field: 'location', display: 'Street Address' },
      { field: 'contact_phone', display: 'Contact Phone' },
      { field: 'contact_email', display: 'Email' },
      { field: 'website', display: 'Website URL' },
      { field: 'operator', display: 'Operator/Management' },
    ],
    tier2: [
      { field: 'total_units', display: 'Number of Units' },
      { field: 'village_type', display: 'Accommodation Types' },
      { field: 'dmf_structure', display: 'Lease Structure' },
      { field: 'entry_price_min', display: 'Entry Cost Range' },
      { field: 'monthly_fees_min', display: 'Ongoing Fees' },
      { field: 'amenities', display: 'Amenities' },
      { field: 'care_services', display: 'Care Services' },
      { field: 'age_restriction', display: 'Age Restrictions' },
    ],
    tier3: [
      { field: 'description', display: 'Description/Overview' },
      { field: 'images', display: 'Photos (gallery)' },
      { field: 'pet_friendly', display: 'Pet Policy' },
    ],
  };

  const loadVillages = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 Fetching ALL villages with pagination...');
      
      // Fetch villages in batches of 1000 until we get all of them
      let allVillages: Village[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const from = page * pageSize;
        const to = from + pageSize - 1;
        
        console.log(`📥 Fetching batch ${page + 1} (rows ${from}-${to})...`);

        // Use the search endpoint with pagination via query params
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages/admin/all?from=${from}&to=${to}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to load villages: ${response.statusText}`);
        }

        const data = await response.json();
        const batchVillages = data.villages || [];
        
        console.log(`✅ Batch ${page + 1}: Received ${batchVillages.length} villages`);
        
        if (batchVillages.length > 0) {
          allVillages = [...allVillages, ...batchVillages];
          
          // If we got fewer than pageSize, we've reached the end
          if (batchVillages.length < pageSize) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      }
      
      console.log(`🎉 TOTAL VILLAGES LOADED: ${allVillages.length}`);
      
      setVillages(allVillages);
      calculateStats(allVillages);
    } catch (err) {
      console.error('Error loading villages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load villages');
    } finally {
      setLoading(false);
    }
  };

  const isFieldFilled = (village: Village, fieldName: string): boolean => {
    const value = village[fieldName as keyof Village];
    
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    if (typeof value === 'number' && value === 0 && fieldName !== 'age_restriction') return false;
    
    return true;
  };

  const isTierComplete = (village: Village, tier: 1 | 2 | 3): boolean => {
    const tierKey = `tier${tier}` as 'tier1' | 'tier2' | 'tier3';
    const fields = fieldRequirements[tierKey];
    
    return fields.every(({ field }) => isFieldFilled(village, field));
  };

  const calculateStats = (villageList: Village[]) => {
    const total = villageList.length;
    
    // Calculate field-by-field stats
    const allFields = [
      ...fieldRequirements.tier1.map(f => ({ ...f, tier: 1 as const })),
      ...fieldRequirements.tier2.map(f => ({ ...f, tier: 2 as const })),
      ...fieldRequirements.tier3.map(f => ({ ...f, tier: 3 as const })),
    ];

    const fieldStatsData: FieldStats[] = allFields.map(({ field, display, tier }) => {
      const filled = villageList.filter(v => isFieldFilled(v, field)).length;
      return {
        fieldName: field,
        displayName: display,
        tier,
        filled,
        total,
        percentage: total > 0 ? (filled / total) * 100 : 0,
      };
    });

    setFieldStats(fieldStatsData);

    // Calculate tier completion stats
    const tierStatsData: TierStats[] = [
      {
        tier: 1,
        tierName: 'TIER 1: Essential (Must Have)',
        complete: villageList.filter(v => isTierComplete(v, 1)).length,
        total,
        percentage: 0,
      },
      {
        tier: 2,
        tierName: 'TIER 2: Important (Critical for Users)',
        complete: villageList.filter(v => isTierComplete(v, 2)).length,
        total,
        percentage: 0,
      },
      {
        tier: 3,
        tierName: 'TIER 3: Nice to Have',
        complete: villageList.filter(v => isTierComplete(v, 3)).length,
        total,
        percentage: 0,
      },
    ];

    tierStatsData.forEach(t => {
      t.percentage = t.total > 0 ? (t.complete / t.total) * 100 : 0;
    });

    setTierStats(tierStatsData);
  };

  useEffect(() => {
    loadVillages();
  }, []);

  // Recalculate stats when state filter changes
  useEffect(() => {
    if (villages.length > 0) {
      const filtered = selectedState === 'ALL' ? villages : villages.filter(v => v.state === selectedState);
      calculateStats(filtered);
    }
  }, [selectedState, villages]);

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (percentage >= 50) return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Analyzing village data quality...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const filteredVillages = selectedState === 'ALL' ? villages : villages.filter(v => v.state === selectedState);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6" />
            Data Quality Dashboard
          </h2>
          <p className="text-gray-600 mt-1">
            Analyzing {filteredVillages.length.toLocaleString()} villages against schema requirements
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* State Filter */}
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-4 py-2 border rounded-lg text-sm font-medium"
          >
            <option value="ALL">All States</option>
            <option value="VIC">VIC</option>
            <option value="NSW">NSW</option>
            <option value="QLD">QLD</option>
            <option value="SA">SA</option>
            <option value="WA">WA</option>
            <option value="TAS">TAS</option>
            <option value="ACT">ACT</option>
            <option value="NT">NT</option>
          </select>
          <Button onClick={loadVillages} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tier Completion Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tierStats.map((tier) => (
          <Card key={tier.tier} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">
                  TIER {tier.tier}
                </div>
                <div className="text-2xl font-bold">
                  {tier.percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {tier.complete.toLocaleString()} / {tier.total.toLocaleString()} complete
                </div>
              </div>
              {getStatusIcon(tier.percentage)}
            </div>
            <Progress value={tier.percentage} className="mb-4" />
            <div className="text-sm text-gray-700 font-medium">
              {tier.tierName.split(':')[1]}
            </div>
          </Card>
        ))}
      </div>

      {/* Field-by-Field Breakdown */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5" />
          <h3 className="text-xl font-semibold">Field-by-Field Analysis</h3>
        </div>

        {/* TIER 1 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-red-100 text-red-700 hover:bg-red-100">TIER 1</Badge>
            <span className="text-sm font-medium text-gray-700">Essential (Must Have)</span>
          </div>
          <div className="space-y-3">
            {fieldStats
              .filter(f => f.tier === 1)
              .sort((a, b) => a.percentage - b.percentage)
              .map((field) => (
                <div key={field.fieldName} className="flex items-center gap-4">
                  <div className="w-48 text-sm font-medium text-gray-700">
                    {field.displayName}
                  </div>
                  <div className="flex-1">
                    <Progress value={field.percentage} className="h-2" />
                  </div>
                  <div className={`w-24 text-sm font-semibold text-right ${getStatusColor(field.percentage)}`}>
                    {field.percentage.toFixed(1)}%
                  </div>
                  <div className="w-32 text-sm text-gray-600 text-right">
                    {field.filled.toLocaleString()} / {field.total.toLocaleString()}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* TIER 2 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">TIER 2</Badge>
            <span className="text-sm font-medium text-gray-700">Important (Critical for Users)</span>
          </div>
          <div className="space-y-3">
            {fieldStats
              .filter(f => f.tier === 2)
              .sort((a, b) => a.percentage - b.percentage)
              .map((field) => (
                <div key={field.fieldName} className="flex items-center gap-4">
                  <div className="w-48 text-sm font-medium text-gray-700">
                    {field.displayName}
                  </div>
                  <div className="flex-1">
                    <Progress value={field.percentage} className="h-2" />
                  </div>
                  <div className={`w-24 text-sm font-semibold text-right ${getStatusColor(field.percentage)}`}>
                    {field.percentage.toFixed(1)}%
                  </div>
                  <div className="w-32 text-sm text-gray-600 text-right">
                    {field.filled.toLocaleString()} / {field.total.toLocaleString()}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* TIER 3 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">TIER 3</Badge>
            <span className="text-sm font-medium text-gray-700">Nice to Have</span>
          </div>
          <div className="space-y-3">
            {fieldStats
              .filter(f => f.tier === 3)
              .sort((a, b) => a.percentage - b.percentage)
              .map((field) => (
                <div key={field.fieldName} className="flex items-center gap-4">
                  <div className="w-48 text-sm font-medium text-gray-700">
                    {field.displayName}
                  </div>
                  <div className="flex-1">
                    <Progress value={field.percentage} className="h-2" />
                  </div>
                  <div className={`w-24 text-sm font-semibold text-right ${getStatusColor(field.percentage)}`}>
                    {field.percentage.toFixed(1)}%
                  </div>
                  <div className="w-32 text-sm text-gray-600 text-right">
                    {field.filled.toLocaleString()} / {field.total.toLocaleString()}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-500 mb-1">Total Villages</div>
            <div className="text-2xl font-bold">{villages.length.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Tier 1 Complete</div>
            <div className={`text-2xl font-bold ${getStatusColor(tierStats[0]?.percentage || 0)}`}>
              {tierStats[0]?.complete.toLocaleString() || 0}
            </div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Tier 2 Complete</div>
            <div className={`text-2xl font-bold ${getStatusColor(tierStats[1]?.percentage || 0)}`}>
              {tierStats[1]?.complete.toLocaleString() || 0}
            </div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Tier 3 Complete</div>
            <div className={`text-2xl font-bold ${getStatusColor(tierStats[2]?.percentage || 0)}`}>
              {tierStats[2]?.complete.toLocaleString() || 0}
            </div>
          </div>
        </div>
      </Card>

      {/* Bottom-10 Villages by Data Quality */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Most Incomplete Villages (Bottom 10)</h3>
        <div className="space-y-2">
          {villages
            .map(v => ({
              village: v,
              tier1: isTierComplete(v, 1),
              tier2: isTierComplete(v, 2),
              tier3: isTierComplete(v, 3),
              score: 
                (isTierComplete(v, 1) ? 1 : 0) * 100 +
                (isTierComplete(v, 2) ? 1 : 0) * 10 +
                (isTierComplete(v, 3) ? 1 : 0) * 1,
            }))
            .sort((a, b) => a.score - b.score)
            .slice(0, 10)
            .map(({ village, tier1, tier2, tier3 }) => (
              <div key={village.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{village.name}</div>
                  <div className="text-sm text-gray-600">
                    {village.suburb}, {village.state}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={tier1 ? 'default' : 'destructive'}>T1</Badge>
                  <Badge variant={tier2 ? 'default' : 'destructive'}>T2</Badge>
                  <Badge variant={tier3 ? 'default' : 'destructive'}>T3</Badge>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}