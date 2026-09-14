import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  Home, 
  Calendar,
  BarChart3,
  Download,
  Filter,
  RefreshCw,
  MapPin,
  Building2,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { getSupabaseClient } from '../../utils/supabase/client';

interface PricingData {
  id: string;
  name: string;
  operator: string | null;
  suburb: string;
  state: string;
  website: string | null;
  entry_price_min: number | null;
  entry_price_max: number | null;
  monthly_fees_min: number | null;
  monthly_fees_max: number | null;
  facility_type: 'retirement_village' | 'aged_care' | 'both' | null;
  updated_at: string;
}

interface ReviewStats {
  totalVillages: number;
  villagesWithEntryPrice: number;
  villagesWithMonthlyFee: number;
  villagesWithBothPrices: number;
  villagesWithNoPricing: number;
  averageEntryPrice: number;
  averageMonthlyFee: number;
  recentlyScraped: number;
}

export default function ScrapedDataReview({ accessToken }: { accessToken: string | null }) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [recentData, setRecentData] = useState<PricingData[]>([]);
  const [allData, setAllData] = useState<PricingData[]>([]); // Store all data for filtering
  const [facilityFilter, setFacilityFilter] = useState<'all' | 'retirement_village' | 'aged_care' | 'both' | 'unclassified'>('all');
  
  const isMountedRef = useRef(true);
  const supabase = getSupabaseClient();

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadReviewData = async () => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    try {
      console.log('🔄 Loading pricing data from database...');
      
      // ONLY query columns that actually exist in the database
      const { data: villages, error } = await supabase
        .from('retirement_villages')
        .select('id, name, operator, suburb, state, website, entry_price_min, entry_price_max, monthly_fees_min, monthly_fees_max, facility_type, updated_at')
        .order('updated_at', { ascending: false, nullsFirst: false });

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log(`✅ Loaded ${villages?.length || 0} villages`);

      if (!isMountedRef.current) return;

      if (villages) {
        calculateStats(villages);
        setRecentData(villages.slice(0, 100)); // Top 100 most recent
        setAllData(villages); // Store all data for filtering
      }
    } catch (error) {
      console.error('Error loading review data:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const calculateStats = (villages: PricingData[]) => {
    const totalVillages = villages.length;
    const villagesWithEntryPrice = villages.filter(v => v.entry_price_min || v.entry_price_max).length;
    const villagesWithMonthlyFee = villages.filter(v => v.monthly_fees_min || v.monthly_fees_max).length;
    const villagesWithBothPrices = villages.filter(v => 
      (v.entry_price_min || v.entry_price_max) && (v.monthly_fees_min || v.monthly_fees_max)
    ).length;
    const villagesWithNoPricing = villages.filter(v => 
      !v.entry_price_min && !v.entry_price_max && !v.monthly_fees_min && !v.monthly_fees_max
    ).length;
    
    const entryPrices = villages
      .map(v => v.entry_price_min || v.entry_price_max)
      .filter(p => p !== null) as number[];
    const averageEntryPrice = entryPrices.length > 0 
      ? entryPrices.reduce((a, b) => a + b, 0) / entryPrices.length 
      : 0;
    
    const monthlyFees = villages
      .map(v => v.monthly_fees_min || v.monthly_fees_max)
      .filter(p => p !== null) as number[];
    const averageMonthlyFee = monthlyFees.length > 0 
      ? monthlyFees.reduce((a, b) => a + b, 0) / monthlyFees.length 
      : 0;
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentlyScraped = villages.filter(v => 
      v.updated_at && new Date(v.updated_at) > sevenDaysAgo
    ).length;

    setStats({
      totalVillages,
      villagesWithEntryPrice,
      villagesWithMonthlyFee,
      villagesWithBothPrices,
      villagesWithNoPricing,
      averageEntryPrice,
      averageMonthlyFee,
      recentlyScraped
    });
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  const getFacilityTypeBadge = (facilityType: string | null) => {
    if (!facilityType) return null;
    
    const badges = {
      'retirement_village': <Badge variant="default" className="bg-blue-500">Retirement</Badge>,
      'aged_care': <Badge variant="default" className="bg-purple-500">Aged Care</Badge>,
      'both': <Badge variant="default" className="bg-green-500">Both</Badge>,
    };
    
    return badges[facilityType as keyof typeof badges] || null;
  };

  // Apply facility type filter to data
  const getFilteredData = () => {
    if (facilityFilter === 'all') {
      return recentData;
    }
    if (facilityFilter === 'unclassified') {
      return recentData.filter(v => !v.facility_type);
    }
    return recentData.filter(v => v.facility_type === facilityFilter);
  };

  // Calculate counts for each facility type
  const getFacilityCounts = () => {
    if (!allData.length) return { all: 0, retirement: 0, agedCare: 0, both: 0, unclassified: 0 };
    
    return {
      all: allData.length,
      retirement: allData.filter(v => v.facility_type === 'retirement_village').length,
      agedCare: allData.filter(v => v.facility_type === 'aged_care').length,
      both: allData.filter(v => v.facility_type === 'both').length,
      unclassified: allData.filter(v => !v.facility_type).length,
    };
  };

  const filteredData = getFilteredData();
  const facilityCounts = getFacilityCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-3 text-lg">Loading scraped data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Scraped Data Review</h2>
          <p className="text-muted-foreground">Analysis of pricing data from scraping</p>
        </div>
        <Button onClick={loadReviewData} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {stats ? 'Refresh' : 'Load Data'}
        </Button>
      </div>

      {!stats && !loading && (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <BarChart3 className="h-16 w-16 text-muted-foreground" />
            <div>
              <h3 className="text-xl font-semibold mb-2">No Data Loaded</h3>
              <p className="text-muted-foreground mb-4">
                Click "Load Data" to fetch and analyze pricing data for all 2,569 villages
              </p>
              <Button onClick={loadReviewData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Load Data Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {stats && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Villages</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalVillages.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.recentlyScraped} updated in last 7 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Full Pricing</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.villagesWithBothPrices.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage(stats.villagesWithBothPrices, stats.totalVillages)} of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entry Price Only</CardTitle>
                <Home className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.villagesWithEntryPrice.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Avg: {formatCurrency(stats.averageEntryPrice)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">No Pricing</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.villagesWithNoPricing.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage(stats.villagesWithNoPricing, stats.totalVillages)} of total
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Villages (Top 100)</CardTitle>
              <CardDescription>Most recently updated villages</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Facility Type Filter Buttons */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground mr-2">Filter by Type:</span>
                
                <Button
                  variant={facilityFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFacilityFilter('all')}
                  className="gap-2"
                >
                  All
                  <Badge variant="secondary" className="ml-1 bg-muted">{facilityCounts.all}</Badge>
                </Button>
                
                <Button
                  variant={facilityFilter === 'retirement_village' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFacilityFilter('retirement_village')}
                  className="gap-2"
                >
                  🏘️ Retirement
                  <Badge variant="secondary" className="ml-1 bg-blue-500 text-white">{facilityCounts.retirement}</Badge>
                </Button>
                
                <Button
                  variant={facilityFilter === 'aged_care' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFacilityFilter('aged_care')}
                  className="gap-2"
                >
                  🏥 Aged Care
                  <Badge variant="secondary" className="ml-1 bg-purple-500 text-white">{facilityCounts.agedCare}</Badge>
                </Button>
                
                <Button
                  variant={facilityFilter === 'both' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFacilityFilter('both')}
                  className="gap-2"
                >
                  🏘️🏥 Both
                  <Badge variant="secondary" className="ml-1 bg-green-500 text-white">{facilityCounts.both}</Badge>
                </Button>
                
                <Button
                  variant={facilityFilter === 'unclassified' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFacilityFilter('unclassified')}
                  className="gap-2"
                >
                  ❓ Unclassified
                  <Badge variant="secondary" className="ml-1 bg-gray-500 text-white">{facilityCounts.unclassified}</Badge>
                </Button>
              </div>

              {/* Results Count */}
              {facilityFilter !== 'all' && (
                <div className="mb-3 text-sm text-muted-foreground">
                  Showing {filteredData.length} of {recentData.length} villages
                </div>
              )}

              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="text-left p-3 font-medium">Village</th>
                        <th className="text-left p-3 font-medium">Location</th>
                        <th className="text-center p-3 font-medium">Type</th>
                        <th className="text-right p-3 font-medium">Entry Price</th>
                        <th className="text-right p-3 font-medium">Monthly Fee</th>
                        <th className="text-center p-3 font-medium">Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map(village => (
                        <tr key={village.id} className="border-t hover:bg-muted/50">
                          <td className="p-3">
                            <div className="font-medium">{village.name}</div>
                            <div className="text-xs text-muted-foreground">{village.operator}</div>
                          </td>
                          <td className="p-3">
                            <div>{village.suburb}</div>
                            <div className="text-xs text-muted-foreground">{village.state}</div>
                          </td>
                          <td className="p-3 text-center">
                            {getFacilityTypeBadge(village.facility_type)}
                          </td>
                          <td className="p-3 text-right">
                            {village.entry_price_min || village.entry_price_max ? (
                              <div>
                                {village.entry_price_min && formatCurrency(village.entry_price_min)}
                                {village.entry_price_min && village.entry_price_max && ' - '}
                                {village.entry_price_max && formatCurrency(village.entry_price_max)}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {village.monthly_fees_min || village.monthly_fees_max ? (
                              <div>
                                {village.monthly_fees_min && formatCurrency(village.monthly_fees_min)}
                                {village.monthly_fees_min && village.monthly_fees_max && ' - '}
                                {village.monthly_fees_max && formatCurrency(village.monthly_fees_max)}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {village.updated_at ? (
                              <div className="text-xs">
                                {new Date(village.updated_at).toLocaleDateString()}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}