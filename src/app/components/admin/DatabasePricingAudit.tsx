import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle2, Download, RefreshCw, Database, XCircle, TrendingUp, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Input } from '../ui/input';
import { getSupabaseClient } from '../../utils/supabase/client';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface Village {
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
  updated_at: string;
}

export default function DatabasePricingAudit({ accessToken }: { accessToken: string | null }) {
  const [loading, setLoading] = useState(false); // Changed to false - don't auto-load
  const [allVillages, setAllVillages] = useState<Village[]>([]);
  const [recentlyUpdated, setRecentlyUpdated] = useState<Village[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Track if component is mounted
  const isMountedRef = useRef(true);

  const supabase = getSupabaseClient();

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // DON'T auto-load on mount to prevent memory issues

  const loadDatabaseData = async () => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    try {
      console.log('🔍 Loading database pricing data...');
      
      // Fetch ALL villages to get complete picture
      const { data: villages, error } = await supabase
        .from('retirement_villages')
        .select(`
          id, 
          name, 
          operator, 
          suburb, 
          state, 
          website, 
          entry_price_min, 
          entry_price_max, 
          monthly_fees_min, 
          monthly_fees_max,
          updated_at
        `)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log(`✅ Loaded ${villages?.length || 0} villages from database`);
      
      if (villages) {
        setAllVillages(villages);
        
        // Get villages updated in the last 2 hours (likely from recent scraping)
        const twoHoursAgo = new Date();
        twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
        
        const recent = villages.filter(v => {
          const updatedAt = new Date(v.updated_at);
          return updatedAt > twoHoursAgo;
        });
        
        console.log(`📊 Found ${recent.length} villages updated in last 2 hours`);
        setRecentlyUpdated(recent);
        
        // Log detailed stats
        const withPricing = villages.filter(v => 
          v.entry_price_min || v.entry_price_max || v.monthly_fees_min || v.monthly_fees_max
        );
        const withoutPricing = villages.filter(v => 
          !v.entry_price_min && !v.entry_price_max && !v.monthly_fees_min && !v.monthly_fees_max
        );
        
        console.log('📈 Database Statistics:');
        console.log(`  - Total villages: ${villages.length}`);
        console.log(`  - With pricing: ${withPricing.length}`);
        console.log(`  - Without pricing: ${withoutPricing.length}`);
        console.log(`  - Recently updated (2hrs): ${recent.length}`);
      }
    } catch (error) {
      console.error('❌ Error loading database data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load database data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = allVillages.length;
    const withEntryPrice = allVillages.filter(v => v.entry_price_min || v.entry_price_max).length;
    const withMonthlyFee = allVillages.filter(v => v.monthly_fees_min || v.monthly_fees_max).length;
    
    const withAnyPricing = allVillages.filter(v => 
      v.entry_price_min || v.entry_price_max || v.monthly_fees_min || v.monthly_fees_max
    ).length;
    
    const withoutPricing = total - withAnyPricing;
    
    return {
      total,
      withEntryPrice,
      withMonthlyFee,
      withAnyPricing,
      withoutPricing
    };
  };

  const getFilteredVillages = () => {
    if (!searchTerm) return recentlyUpdated;
    
    const term = searchTerm.toLowerCase();
    return recentlyUpdated.filter(v => 
      v.name.toLowerCase().includes(term) ||
      v.suburb.toLowerCase().includes(term) ||
      v.state.toLowerCase().includes(term) ||
      (v.operator && v.operator.toLowerCase().includes(term))
    );
  };

  const downloadFullReport = () => {
    const headers = [
      'Village ID',
      'Name',
      'Operator',
      'Suburb',
      'State',
      'Website',
      'Entry Price Min',
      'Entry Price Max',
      'Monthly Fees Min',
      'Monthly Fees Max',
      'Record Updated At'
    ];

    const rows = allVillages.map(v => [
      v.id,
      v.name,
      v.operator || '',
      v.suburb,
      v.state,
      v.website || '',
      v.entry_price_min || '',
      v.entry_price_max || '',
      v.monthly_fees_min || '',
      v.monthly_fees_max || '',
      v.updated_at
    ]);

    const csv = [headers, ...rows].map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `database-full-audit-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadRecentUpdates = () => {
    if (recentlyUpdated.length === 0) return;

    const headers = [
      'Name',
      'Suburb',
      'State',
      'Entry Price Min',
      'Entry Price Max',
      'Monthly Fees Min',
      'Monthly Fees Max',
      'Updated At',
      'Had Pricing Before?'
    ];

    const rows = recentlyUpdated.map(v => [
      v.name,
      v.suburb,
      v.state,
      v.entry_price_min || '',
      v.entry_price_max || '',
      v.monthly_fees_min || '',
      v.monthly_fees_max || '',
      new Date(v.updated_at).toLocaleString(),
      (v.entry_price_min || v.entry_price_max || v.monthly_fees_min || v.monthly_fees_max) ? 'YES' : 'NO'
    ]);

    const csv = [headers, ...rows].map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recent-updates-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const stats = calculateStats();
  const filteredVillages = getFilteredVillages();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mr-3" />
          <span className="text-lg">Loading database data...</span>
        </CardContent>
      </Card>
    );
  }

  // Show "Load Data" button if no data
  if (allVillages.length === 0 && !loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center text-center space-y-4 py-12">
          <Database className="h-16 w-16 text-muted-foreground" />
          <div>
            <h3 className="text-xl font-semibold mb-2">No Data Loaded</h3>
            <p className="text-muted-foreground mb-4">
              Click "Load Data" to fetch database statistics for all 2,569 villages
            </p>
            <Button onClick={loadDatabaseData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Load Data Now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Database Pricing Audit</h2>
          <p className="text-muted-foreground">Real-time analysis of what's actually in the database</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadDatabaseData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={downloadRecentUpdates} variant="outline" disabled={recentlyUpdated.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Recent Updates CSV
          </Button>
          <Button onClick={downloadFullReport}>
            <Download className="h-4 w-4 mr-2" />
            Full Database CSV
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total in Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All villages in database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Pricing Data</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.withAnyPricing.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? `${((stats.withAnyPricing / stats.total) * 100).toFixed(1)}%` : '0%'} of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing Pricing</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.withoutPricing.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? `${((stats.withoutPricing / stats.total) * 100).toFixed(1)}%` : '0%'} still missing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recently Updated</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{recentlyUpdated.length}</div>
            <p className="text-xs text-muted-foreground">
              Last 2 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Field Coverage</CardTitle>
          <CardDescription>How many villages have each pricing field populated</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Entry Price (Min/Max)</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{stats.withEntryPrice.toLocaleString()}</Badge>
                <span className="text-sm text-muted-foreground w-16 text-right">
                  {stats.total > 0 ? `${((stats.withEntryPrice / stats.total) * 100).toFixed(1)}%` : '0%'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Monthly Fees (Min/Max)</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{stats.withMonthlyFee.toLocaleString()}</Badge>
                <span className="text-sm text-muted-foreground w-16 text-right">
                  {stats.total > 0 ? `${((stats.withMonthlyFee / stats.total) * 100).toFixed(1)}%` : '0%'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recently Updated Villages */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Updated Villages (Last 2 Hours)</CardTitle>
          <CardDescription>
            Villages that were updated in the last 2 hours - likely from your recent scraping session
          </CardDescription>
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, suburb, state, or operator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {recentlyUpdated.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No villages were updated in the last 2 hours. This suggests the scraping session may not have saved data to the database.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                Showing {filteredVillages.length} of {recentlyUpdated.length} recently updated villages
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="text-left p-3 font-medium">Village</th>
                        <th className="text-left p-3 font-medium">Location</th>
                        <th className="text-right p-3 font-medium">Entry Price</th>
                        <th className="text-right p-3 font-medium">Monthly Fee</th>
                        <th className="text-center p-3 font-medium">Status</th>
                        <th className="text-center p-3 font-medium">Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVillages.map(village => {
                        const hasPricing = !!(village.entry_price_min || village.entry_price_max || village.monthly_fees_min || village.monthly_fees_max);
                        return (
                          <tr key={village.id} className="border-t hover:bg-muted/50">
                            <td className="p-3">
                              <div className="font-medium">{village.name}</div>
                              <div className="text-xs text-muted-foreground">{village.operator}</div>
                            </td>
                            <td className="p-3">
                              <div>{village.suburb}</div>
                              <div className="text-xs text-muted-foreground">{village.state}</div>
                            </td>
                            <td className="p-3 text-right">
                              {village.entry_price_min || village.entry_price_max ? (
                                <div className="text-sm">
                                  {village.entry_price_min && `$${village.entry_price_min.toLocaleString()}`}
                                  {village.entry_price_min && village.entry_price_max && ' - '}
                                  {village.entry_price_max && village.entry_price_max !== village.entry_price_min && `$${village.entry_price_max.toLocaleString()}`}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              {village.monthly_fees_min || village.monthly_fees_max ? (
                                <div className="text-sm">
                                  {village.monthly_fees_min && `$${village.monthly_fees_min.toLocaleString()}`}
                                  {village.monthly_fees_min && village.monthly_fees_max && ' - '}
                                  {village.monthly_fees_max && village.monthly_fees_max !== village.monthly_fees_min && `$${village.monthly_fees_max.toLocaleString()}`}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              {hasPricing ? (
                                <Badge variant="default" className="bg-green-600">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Has Pricing
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  No Pricing
                                </Badge>
                              )}
                            </td>
                            <td className="p-3 text-center text-xs text-muted-foreground">
                              {new Date(village.updated_at).toLocaleTimeString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}