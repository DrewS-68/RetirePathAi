import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle2, Download, RefreshCw, Database, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';

interface ScrapedVillageData {
  villageId: string;
  villageName: string;
  url: string;
  status: 'pending' | 'scraping' | 'success' | 'error';
  tier1: { [key: string]: any };
  tier2: { [key: string]: any };
  tier3: { [key: string]: any };
  error?: string;
  timestamp?: string;
}

export default function LocalStorageRecovery() {
  const [localStorageData, setLocalStorageData] = useState<ScrapedVillageData[]>([]);
  const [backupData, setBackupData] = useState<ScrapedVillageData[]>([]);
  const [successfulScrapes, setSuccessfulScrapes] = useState<ScrapedVillageData[]>([]);
  const [failedScrapes, setFailedScrapes] = useState<ScrapedVillageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Track if component is mounted
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // DON'T auto-load - localStorage parsing can be HUGE (hundreds of villages with full data)
  // This was causing memory crashes after multiple tab switches!

  const loadLocalStorageData = () => {
    setLoading(true);
    try {
      // Check for scraped data in localStorage
      const scrapedDataStr = localStorage.getItem('webScraperData');
      const backupDataStr = localStorage.getItem('webScraperBackup');
      const lastSaveStr = localStorage.getItem('webScraperLastSave');
      
      let scrapedData: ScrapedVillageData[] = [];
      let backup: ScrapedVillageData[] = [];
      
      if (scrapedDataStr) {
        try {
          scrapedData = JSON.parse(scrapedDataStr);
        } catch (e) {
          console.error('Error parsing scraped data:', e);
        }
      }
      
      if (backupDataStr) {
        try {
          backup = JSON.parse(backupDataStr);
        } catch (e) {
          console.error('Error parsing backup data:', e);
        }
      }
      
      setLocalStorageData(scrapedData);
      setBackupData(backup);
      
      // Categorize by success/failure
      const successful = scrapedData.filter(v => v.status === 'success');
      const failed = scrapedData.filter(v => v.status === 'error');
      
      setSuccessfulScrapes(successful);
      setFailedScrapes(failed);
      
      console.log('📊 LocalStorage Recovery Analysis:');
      console.log(`  - Total scraped: ${scrapedData.length}`);
      console.log(`  - Successful: ${successful.length}`);
      console.log(`  - Failed: ${failed.length}`);
      console.log(`  - Backup entries: ${backup.length}`);
      console.log(`  - Last save: ${lastSaveStr}`);
      
    } finally {
      setLoading(false);
      setDataLoaded(true);
    }
  };

  const analyzeScrapedData = (data: ScrapedVillageData[]) => {
    const stats = {
      total: data.length,
      withEntryPrice: 0,
      withMonthlyFees: 0,
      withEmail: 0,
      withAmenities: 0,
      errors: 0
    };
    
    data.forEach(village => {
      if (village.status === 'success') {
        const tier2 = village.tier2 || {};
        
        if (tier2.entry_price_from || tier2.entry_price_to) {
          stats.withEntryPrice++;
        }
        if (tier2.monthly_fee_from || tier2.monthly_fee_to) {
          stats.withMonthlyFees++;
        }
        if (tier2.email) {
          stats.withEmail++;
        }
        if (tier2.amenities && tier2.amenities.length > 0) {
          stats.withAmenities++;
        }
      } else if (village.status === 'error') {
        stats.errors++;
      }
    });
    
    return stats;
  };

  const downloadRecoveryData = () => {
    const data = localStorageData.length > 0 ? localStorageData : backupData;
    
    if (data.length === 0) {
      alert('No data to download');
      return;
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scraped-data-recovery-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadDetailedReport = () => {
    const successful = successfulScrapes;
    
    if (successful.length === 0) {
      alert('No successful scrapes to export');
      return;
    }
    
    const headers = [
      'Village ID',
      'Village Name',
      'Status',
      'Entry Price From',
      'Entry Price To',
      'Monthly Fee From',
      'Monthly Fee To',
      'Email',
      'Amenities Count',
      'Error'
    ];
    
    const rows = localStorageData.map(v => {
      const tier2 = v.tier2 || {};
      return [
        v.villageId,
        v.villageName,
        v.status,
        tier2.entry_price_from || '',
        tier2.entry_price_to || '',
        tier2.monthly_fee_from || '',
        tier2.monthly_fee_to || '',
        tier2.email || '',
        tier2.amenities?.length || 0,
        v.error || ''
      ];
    });
    
    const csv = [headers, ...rows].map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scraped-data-detailed-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const stats = analyzeScrapedData(localStorageData);
  const backupStats = analyzeScrapedData(backupData);

  // Show loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mr-3" />
          <span className="text-lg">Loading localStorage data...</span>
        </CardContent>
      </Card>
    );
  }

  // Show "Load Data" button if no data loaded
  if (!dataLoaded) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center text-center space-y-4 py-12">
          <Database className="h-16 w-16 text-muted-foreground" />
          <div>
            <h3 className="text-xl font-semibold mb-2">No Data Loaded</h3>
            <p className="text-muted-foreground mb-4">
              Click "Load Data" to analyze scraped data from localStorage (if any exists)
            </p>
            <Button onClick={loadLocalStorageData}>
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">LocalStorage Recovery & Diagnostics</h2>
          <p className="text-muted-foreground">Analyze scraped data from your recent session</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadLocalStorageData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={downloadRecoveryData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download JSON
          </Button>
          <Button onClick={downloadDetailedReport}>
            <Download className="h-4 w-4 mr-2" />
            Download CSV Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scraped</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{localStorageData.length}</div>
            <p className="text-xs text-muted-foreground">
              {backupData.length} in backup
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{successfulScrapes.length}</div>
            <p className="text-xs text-muted-foreground">
              {localStorageData.length > 0 
                ? `${((successfulScrapes.length / localStorageData.length) * 100).toFixed(1)}% success rate`
                : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedScrapes.length}</div>
            <p className="text-xs text-muted-foreground">
              {localStorageData.length > 0
                ? `${((failedScrapes.length / localStorageData.length) * 100).toFixed(1)}% error rate`
                : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Pricing</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.withEntryPrice}</div>
            <p className="text-xs text-muted-foreground">
              Entry price found
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Issue Alert */}
      {localStorageData.length > 0 && successfulScrapes.length < localStorageData.length * 0.5 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>⚠️ Low Success Rate Detected</strong>
            <p className="mt-2">
              Only {successfulScrapes.length} out of {localStorageData.length} villages were successfully scraped 
              ({((successfulScrapes.length / localStorageData.length) * 100).toFixed(1)}% success rate).
            </p>
            <p className="mt-2">
              <strong>Possible issues:</strong>
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>ScraperAPI rate limits or quota exceeded</li>
              <li>Villages have pricing behind login/paywalls</li>
              <li>Website structures don't match expected patterns</li>
              <li>Network timeouts or connectivity issues</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Data Extraction Analysis</CardTitle>
          <CardDescription>Breakdown of what data was successfully extracted</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-3">Current Session Data</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Villages:</span>
                  <Badge>{stats.total}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">With Entry Price:</span>
                  <Badge variant={stats.withEntryPrice > 0 ? "default" : "secondary"}>
                    {stats.withEntryPrice}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">With Monthly Fees:</span>
                  <Badge variant={stats.withMonthlyFees > 0 ? "default" : "secondary"}>
                    {stats.withMonthlyFees}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">With Email:</span>
                  <Badge variant={stats.withEmail > 0 ? "default" : "secondary"}>
                    {stats.withEmail}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">With Amenities:</span>
                  <Badge variant={stats.withAmenities > 0 ? "default" : "secondary"}>
                    {stats.withAmenities}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Errors:</span>
                  <Badge variant={stats.errors > 0 ? "destructive" : "secondary"}>
                    {stats.errors}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Backup Data</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Villages:</span>
                  <Badge>{backupStats.total}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">With Entry Price:</span>
                  <Badge variant={backupStats.withEntryPrice > 0 ? "default" : "secondary"}>
                    {backupStats.withEntryPrice}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">With Monthly Fees:</span>
                  <Badge variant={backupStats.withMonthlyFees > 0 ? "default" : "secondary"}>
                    {backupStats.withMonthlyFees}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">With Email:</span>
                  <Badge variant={backupStats.withEmail > 0 ? "default" : "secondary"}>
                    {backupStats.withEmail}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">With Amenities:</span>
                  <Badge variant={backupStats.withAmenities > 0 ? "default" : "secondary"}>
                    {backupStats.withAmenities}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Errors:</span>
                  <Badge variant={backupStats.errors > 0 ? "destructive" : "secondary"}>
                    {backupStats.errors}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sample of Failed Scrapes */}
      {failedScrapes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Failed Scrapes (Sample)</CardTitle>
            <CardDescription>First 10 villages that failed to scrape</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {failedScrapes.slice(0, 10).map((village, idx) => (
                <div key={idx} className="border-l-4 border-red-500 pl-4 py-2 bg-red-50 rounded">
                  <div className="font-medium">{village.villageName}</div>
                  <div className="text-sm text-muted-foreground">{village.url}</div>
                  <div className="text-sm text-red-600 mt-1">
                    <strong>Error:</strong> {village.error || 'Unknown error'}
                  </div>
                </div>
              ))}
              {failedScrapes.length > 10 && (
                <div className="text-sm text-muted-foreground text-center pt-2">
                  ... and {failedScrapes.length - 10} more failed scrapes
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sample of Successful Scrapes */}
      {successfulScrapes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Successful Scrapes (Sample)</CardTitle>
            <CardDescription>First 10 villages with successfully extracted data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {successfulScrapes.slice(0, 10).map((village, idx) => {
                const tier2 = village.tier2 || {};
                return (
                  <div key={idx} className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 rounded">
                    <div className="font-medium">{village.villageName}</div>
                    <div className="text-sm text-muted-foreground">{village.url}</div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      {tier2.entry_price_from && (
                        <div>
                          <strong>Entry From:</strong> ${tier2.entry_price_from.toLocaleString()}
                        </div>
                      )}
                      {tier2.entry_price_to && (
                        <div>
                          <strong>Entry To:</strong> ${tier2.entry_price_to.toLocaleString()}
                        </div>
                      )}
                      {tier2.monthly_fee_from && (
                        <div>
                          <strong>Monthly From:</strong> ${tier2.monthly_fee_from.toLocaleString()}
                        </div>
                      )}
                      {tier2.monthly_fee_to && (
                        <div>
                          <strong>Monthly To:</strong> ${tier2.monthly_fee_to.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {successfulScrapes.length > 10 && (
                <div className="text-sm text-muted-foreground text-center pt-2">
                  ... and {successfulScrapes.length - 10} more successful scrapes
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}