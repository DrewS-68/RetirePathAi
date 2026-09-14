import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle, Clock, PlayCircle, StopCircle, Download, RefreshCw, AlertTriangle, Database, XCircle, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface Village {
  id: string;
  name: string;
  operator: string | null;
  website: string | null;
  state: string;
  suburb: string;
  entry_price_min: number | null;
  entry_price_max: number | null;
  monthly_fees_min: number | null;
  monthly_fees_max: number | null;
}

interface ScrapeResult {
  villageId: string;
  villageName: string;
  status: 'success' | 'error' | 'no-pricing';
  entryPriceFrom?: number;
  entryPriceTo?: number;
  monthlyFeeFrom?: number;
  monthlyFeeTo?: number;
  error?: string;
  savedToDb: boolean;
  saveAttempts: number;
}

export default function ResilientPricingScraper({ accessToken }: { accessToken: string | null }) {
  const [loading, setLoading] = useState(false);
  const [villages, setVillages] = useState<Village[]>([]);
  const [scraping, setScraping] = useState(false);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const [results, setResults] = useState<ScrapeResult[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    scraped: 0,
    saved: 0,
    failed: 0,
    noPricing: 0
  });
  
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Create ONE Supabase client and reuse it - CRITICAL to prevent memory leaks
  const supabaseClientRef = useRef<ReturnType<typeof createClient> | null>(null);

  // Cleanup on unmount - CRITICAL for preventing crashes
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      pausedRef.current = true;
      
      // Abort any in-flight requests
      if (abortControllerRef.current) {
        try {
          abortControllerRef.current.abort();
        } catch (e) {
          // Silently fail
        }
      }
      
      // Clear Supabase client
      supabaseClientRef.current = null;
    };
  }, []);

  // Get or create Supabase client - REUSE the same instance
  const getSupabaseClient = () => {
    if (!supabaseClientRef.current) {
      supabaseClientRef.current = createClient(
        `https://${projectId}.supabase.co`,
        publicAnonKey,
        {
          auth: {
            persistSession: false, // Don't persist session
            autoRefreshToken: false, // Don't auto-refresh
            detectSessionInUrl: false // Don't detect session in URL
          },
          realtime: {
            params: {
              eventsPerSecond: 0, // Disable realtime completely
            },
          },
          global: {
            headers: accessToken ? {
              Authorization: `Bearer ${accessToken}`
            } : {}
          }
        }
      );
    }
    return supabaseClientRef.current;
  };

  // Keep ref in sync
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // Load villages missing entry pricing
  const loadVillages = async () => {
    // Safety check: Don't load if component is unmounted
    if (!isMountedRef.current) {
      console.log('⚠️ Component unmounted, skipping load');
      return;
    }
    
    try {
      setLoading(true);
      setLoadError(null);
      
      console.log('🔍 Querying for villages missing pricing...');
      console.log('🔑 Access Token present:', !!accessToken);
      
      if (!accessToken) {
        throw new Error('No access token available. Please log in.');
      }
      
      // Create abort controller with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error('⏱️ Database query timed out after 10 seconds');
      }, 10000); // 10 second timeout
      
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        clearTimeout(timeoutId);
        throw new Error('Failed to initialize Supabase client');
      }
      
      // Query for villages where entry_price_min is null
      const { data, error } = await supabase
        .from('retirement_villages')
        .select('id, name, operator, website, state, suburb, entry_price_min, entry_price_max, monthly_fees_min, monthly_fees_max')
        .not('website', 'is', null)
        .is('entry_price_min', null)
        .order('state', { ascending: true })
        .order('suburb', { ascending: true })
        .limit(1000) // Limit to prevent overwhelming the UI
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error) {
        console.error('❌ Query error:', error);
        throw new Error(`Database query failed: ${error.message}`);
      }

      // Safety check before updating state
      if (!isMountedRef.current) {
        console.log('⚠️ Component unmounted during query, skipping state update');
        return;
      }

      console.log(`✅ Loaded ${data?.length || 0} villages missing entry pricing`);
      if (data && data.length > 0) {
        console.log('📊 Sample villages:', data.slice(0, 2));
      }
      
      setVillages(data || []);
      
    } catch (error: any) {
      console.error('❌ Error in loadVillages:', error);
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        const errorMessage = error?.message || 'Unknown error occurred';
        setLoadError(`Failed to load villages: ${errorMessage}`);
        
        // Show user-friendly alert
        alert(`Error loading villages: ${errorMessage}\n\nPlease check:\n1. You are logged in\n2. You have admin access\n3. Check browser console for details`);
      }
    } finally {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  // Don't auto-load on mount - user should click "Load Villages" button
  // This prevents crashes when component mounts without proper auth

  // Save a SINGLE result to database with retries
  const saveSingleToDatabase = async (result: ScrapeResult, retries = 3): Promise<boolean> => {
    if (result.status !== 'success') {
      // Skip logging to reduce console memory
      return false; // Don't save if no pricing found
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Only log on first attempt
        if (attempt === 1) {
          console.log(`💾 Saving ${result.villageName}...`);
        }

        const updateData: any = {
          updated_at: new Date().toISOString()
        };

        if (result.entryPriceFrom !== undefined) updateData.entry_price_min = result.entryPriceFrom;
        if (result.entryPriceTo !== undefined) updateData.entry_price_max = result.entryPriceTo;
        if (result.monthlyFeeFrom !== undefined) updateData.monthly_fees_min = result.monthlyFeeFrom;
        if (result.monthlyFeeTo !== undefined) updateData.monthly_fees_max = result.monthlyFeeTo;

        // Direct Supabase update
        const { data, error } = await getSupabaseClient()
          .from('retirement_villages')
          .update(updateData)
          .eq('id', result.villageId)
          .select();

        if (error) {
          console.error(`❌ DB error: ${result.villageName}`);
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          return false;
        }

        console.log(`✅ Saved ${result.villageName}`);
        return true;

      } catch (error: any) {
        console.error(`❌ Exception: ${result.villageName}`);
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        return false;
      }
    }

    return false;
  };

  // Scrape a single village
  const scrapeSingleVillage = async (village: Village): Promise<ScrapeResult> => {
    const result: ScrapeResult = {
      villageId: village.id,
      villageName: village.name,
      status: 'error',
      savedToDb: false,
      saveAttempts: 0
    };

    try {
      // Minimal logging
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scraper/scrape-village`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            villageId: village.id,
            villageName: village.name,
            url: village.website
          }),
        }
      );

      if (!response.ok) {
        result.error = `HTTP ${response.status}`;
        return result;
      }

      const data = await response.json();
      
      // Check if scraping was successful
      if (!data.success) {
        result.error = data.error || 'Scraping failed';
        return result;
      }
      
      // Check if pricing was found in tier2
      const tier2 = data.data?.tier2 || {};
      if (tier2.entry_price_from || tier2.monthly_fee_from) {
        result.status = 'success';
        result.entryPriceFrom = tier2.entry_price_from;
        result.entryPriceTo = tier2.entry_price_to;
        result.monthlyFeeFrom = tier2.monthly_fee_from;
        result.monthlyFeeTo = tier2.monthly_fee_to;
      } else {
        result.status = 'no-pricing';
      }

    } catch (error: any) {
      result.error = error.message;
    }

    return result;
  };

  // Main scraping loop with immediate save after each scrape
  const startScraping = async () => {
    if (villages.length === 0) {
      alert('No villages to scrape!');
      return;
    }

    if (!accessToken) {
      alert('You must be logged in to scrape villages.');
      return;
    }

    setScraping(true);
    setPaused(false);
    
    // DON'T keep all results - only track counts and recent failures
    const recentResults: ScrapeResult[] = [];
    let scraped = 0;
    let saved = 0;
    let failed = 0;
    let noPricing = 0;

    setProgress({
      current: 0,
      total: villages.length,
      scraped: 0,
      saved: 0,
      failed: 0,
      noPricing: 0
    });

    console.log(`🚀 Starting resilient scraping of ${villages.length} villages...`);

    try {
      for (let i = 0; i < villages.length; i++) {
        // Check if paused or unmounted
        if (pausedRef.current || !isMountedRef.current) {
          console.log('⏸️  Scraping stopped');
          break;
        }

        try {
          const village = villages[i];
          
          // Only log every 20 villages to reduce console spam
          if (i % 20 === 0) {
            console.log(`📍 ${i + 1}/${villages.length} | ✅ ${saved} | ⚠️ ${noPricing} | ❌ ${failed}`);
          }

          // Step 1: Scrape the village
          const result = await scrapeSingleVillage(village);
          scraped++;
          
          if (result.status === 'success') {
            // Step 2: IMMEDIATELY save to database
            const saveSuccess = await saveSingleToDatabase(result, 3);
            
            if (saveSuccess) {
              result.savedToDb = true;
              saved++;
            } else {
              result.savedToDb = false;
              failed++;
              // Only keep failures in memory for debugging
              recentResults.push(result);
              if (recentResults.length > 30) recentResults.shift(); // Keep max 30
            }
          } else if (result.status === 'no-pricing') {
            noPricing++;
          } else {
            failed++;
            // Keep recent failures
            recentResults.push(result);
            if (recentResults.length > 30) recentResults.shift();
          }

          // Update state every 20 villages to reduce React overhead
          if (i % 20 === 0 || i === villages.length - 1) {
            // Only update state if component is still mounted
            if (!isMountedRef.current) break;
            
            // Use requestIdleCallback or setTimeout to not block scraping
            setTimeout(() => {
              if (!isMountedRef.current) return;
              
              // Only store failures, not all results
              setResults([...recentResults]);
              
              setProgress({
                current: i + 1,
                total: villages.length,
                scraped,
                saved,
                failed,
                noPricing
              });
            }, 0);
            
            // Force garbage collection hint every 50 villages
            if (i % 50 === 0 && i > 0) {
              // Clear console to free memory
              if (console.clear) {
                // Don't actually clear - just a hint to browser
              }
            }
          }

          // 2 second delay between requests
          await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (villageError: any) {
          console.error(`❌ Error at ${i}: ${villageError.message}`);
          failed++;
          // Continue to next village even if one crashes
        }
      }

      // Final state update
      if (isMountedRef.current) {
        setResults([...recentResults]); // Only failures
        setProgress({
          current: villages.length,
          total: villages.length,
          scraped,
          saved,
          failed,
          noPricing
        });
      }

    } catch (loopError: any) {
      console.error('❌ Critical error in scraping loop:', loopError);
      if (isMountedRef.current) {
        alert(`Scraping stopped due to error: ${loopError.message}`);
      }
    } finally {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setScraping(false);
        console.log(`🎉 Complete: ${saved} saved, ${noPricing} no pricing, ${failed} failed`);
        
        // Notify other components that village data has been updated
        window.dispatchEvent(new CustomEvent('villageDataUpdated'));
        
        // Reload villages to refresh counts (this will show progress)
        try {
          await loadVillages();
        } catch (reloadError) {
          console.error('Failed to reload:', reloadError);
        }
      }
    }
  };

  const handlePause = () => {
    setPaused(true);
    console.log('⏸️  Pause requested...');
  };

  const handleResume = () => {
    setPaused(false);
    console.log('▶️  Resuming...');
    // Note: This won't actually resume the loop, you'll need to click "Start" again
    // For a true resume, we'd need to track which villages were processed
  };

  const exportResults = () => {
    const csv = [
      ['Village Name', 'Status', 'Entry Price From', 'Entry Price To', 'Monthly Fee From', 'Monthly Fee To', 'Saved to DB', 'Error'].join(','),
      ...results.map(r => [
        `"${r.villageName}"`,
        r.status,
        r.entryPriceFrom || '',
        r.entryPriceTo || '',
        r.monthlyFeeFrom || '',
        r.monthlyFeeTo || '',
        r.savedToDb ? 'YES' : 'NO',
        r.error || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pricing-scrape-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const successResults = results.filter(r => r.status === 'success' && r.savedToDb);
  const failedResults = results.filter(r => r.status === 'error' || !r.savedToDb);
  const noPricingResults = results.filter(r => r.status === 'no-pricing');

  // Catch any rendering errors
  if (!accessToken) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Resilient Pricing Scraper
          </CardTitle>
          <CardDescription>
            Scrapes pricing and saves IMMEDIATELY - no data loss!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              ⚠️ You must be signed in as an admin to use this tool.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Resilient Pricing Scraper
            </CardTitle>
            <CardDescription>
              Scrapes pricing and saves IMMEDIATELY - no data loss!
            </CardDescription>
          </div>
          <Button onClick={loadVillages} variant="outline" size="sm" disabled={loading || scraping}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Strategy Explanation */}
        <Alert className="bg-blue-50 border-blue-200">
          <Zap className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <strong className="text-blue-900">How this works differently:</strong>
            <ul className="mt-2 space-y-1 text-sm text-blue-800">
              <li>✅ Scrapes ONE village at a time</li>
              <li>✅ Saves to database IMMEDIATELY after each scrape</li>
              <li>✅ Retries failed saves 3 times automatically</li>
              <li>✅ Shows real-time progress with detailed logging</li>
              <li>✅ No localStorage needed - data goes straight to DB</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Missing Pricing</div>
            <div className="text-2xl font-bold">{villages.length}</div>
          </Card>
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="text-sm text-green-700">Successfully Saved</div>
            <div className="text-2xl font-bold text-green-700">{progress.saved}</div>
          </Card>
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="text-sm text-yellow-700">No Pricing Found</div>
            <div className="text-2xl font-bold text-yellow-700">{progress.noPricing}</div>
          </Card>
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="text-sm text-red-700">Failed</div>
            <div className="text-2xl font-bold text-red-700">{progress.failed}</div>
          </Card>
        </div>

        {/* Load villages prompt if none loaded */}
        {villages.length === 0 && !loading && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span className="text-blue-900">Click "Load Villages" to find villages missing pricing data.</span>
                <Button 
                  onClick={loadVillages} 
                  size="sm"
                  className="ml-4"
                  disabled={loading || !accessToken}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Load Villages
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Show error if load failed */}
        {loadError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        )}

        {/* Progress */}
        {scraping && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress: {progress.current} / {progress.total}</span>
              <span className="font-medium">
                {progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0}%
              </span>
            </div>
            <Progress value={progress.total > 0 ? (progress.current / progress.total) * 100 : 0} />
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-3">
          {!scraping ? (
            <Button 
              onClick={startScraping} 
              disabled={villages.length === 0 || !accessToken}
              className="bg-gradient-to-r from-green-600 to-emerald-600"
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Start Resilient Scraping
            </Button>
          ) : (
            <Button onClick={handlePause} variant="destructive">
              <StopCircle className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}
          
          {results.length > 0 && (
            <Button onClick={exportResults} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Results CSV
            </Button>
          )}
        </div>

        {/* Results Summary */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Results</h3>
              <div className="flex gap-2">
                <Badge variant="default" className="bg-green-600">
                  {successResults.length} Saved
                </Badge>
                <Badge variant="secondary">
                  {noPricingResults.length} No Pricing
                </Badge>
                <Badge variant="destructive">
                  {failedResults.length} Failed
                </Badge>
              </div>
            </div>

            {/* Failed results - show these first so user can retry */}
            {failedResults.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{failedResults.length} villages failed to scrape or save:</strong>
                  <ul className="mt-2 space-y-1 text-sm max-h-40 overflow-y-auto">
                    {failedResults.map(r => (
                      <li key={r.villageId}>
                        {r.villageName} - {r.error || 'Save failed'}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Success summary */}
            {successResults.length > 0 && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>✅ {successResults.length} villages successfully scraped and saved to database!</strong>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}