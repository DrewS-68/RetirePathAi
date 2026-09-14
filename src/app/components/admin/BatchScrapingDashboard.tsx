import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Loader, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Database,
  Globe,
  Activity
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Alert } from '../ui/alert';

interface BatchState {
  batchId: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  totalVillages: number;
  processedVillages: number;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  currentVillageId: string | null;
  startedAt: string | null;
  completedAt: string | null;
  lastError: string | null;
  errors: Array<{villageId: string; error: string; timestamp: string}>;
  filterState?: string;  // NEW: Track which state filter was used
}

interface OverallStats {
  totalWithWebsites: number;
  totalScraped: number;
  totalRemaining: number;
  percentComplete: number;
}

interface StateStats {
  total: number;
  scraped: number;
  remaining: number;
}

export function BatchScrapingDashboard() {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [batchState, setBatchState] = useState<BatchState | null>(null);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [stateStats, setStateStats] = useState<Record<string, StateStats>>({});
  const [selectedState, setSelectedState] = useState<string>('all');
  const [batchSize, setBatchSize] = useState(20);  // Optimized: smaller batches for better timeout handling
  const [delayBetweenRequests, setDelayBetweenRequests] = useState(1500);  // Optimized: faster scraping
  const [autoResumeEnabled, setAutoResumeEnabled] = useState(true);  // Enable by default for convenience
  const [backendVersion, setBackendVersion] = useState<string>('checking...');
  
  // Fetch backend version on mount
  useEffect(() => {
    const checkBackendVersion = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/health`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'apikey': publicAnonKey,
            },
          }
        );
        const data = await response.json();
        setBackendVersion(data.version || 'unknown');
        console.log('🔥🔥🔥 BatchScrapingDashboard RENDER - Backend Version:', data.version, '🔥🔥🔥');
      } catch (err) {
        console.error('Failed to fetch backend version:', err);
        setBackendVersion('error');
      }
    };
    checkBackendVersion();
  }, []);
  
  // Use a ref to avoid closure issues with autoResumeEnabled
  const autoResumeRef = React.useRef(autoResumeEnabled);
  
  // Keep ref in sync with state
  useEffect(() => {
    autoResumeRef.current = autoResumeEnabled;
  }, [autoResumeEnabled]);

  // Memoize fetch functions to prevent dependency issues
  const fetchOverallStats = useCallback(async () => {
    try {
      // Pass the selectedState as a query parameter (if not "all")
      const stateParam = selectedState !== 'all' ? `?state=${selectedState}` : '';
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/batch-scraping/stats${stateParam}`;
      
      console.log('📊 fetchOverallStats CALLED!');
      console.log('   selectedState:', selectedState);
      console.log('   stateParam:', stateParam);
      console.log('   Full URL:', url);
      
      const response = await fetch(
        url,
        {
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'apikey': publicAnonKey,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('📊 Stats response error:', errorText);
        throw new Error(`Failed to fetch stats: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Stats received:', data);
      console.log('   Overall stats:', data.overall);
      
      setOverallStats(data.overall);
      setStateStats(data.byState || {});  // Default to empty object if byState doesn't exist
    } catch (error) {
      console.error('❌ Error fetching stats:', error.message);
    }
  }, [accessToken, selectedState]);  // Add selectedState as dependency

  const fetchBatchStatus = useCallback(async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/batch-scraping/status`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'apikey': publicAnonKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch batch status');
      }

      const data = await response.json();
      setBatchState(data.batch);
      
      // NEW: Sync the state filter dropdown with the batch's filterState
      if (data.batch && data.batch.filterState) {
        console.log(`🔄 Syncing dropdown to batch filterState: ${data.batch.filterState}`);
        setSelectedState(data.batch.filterState);
        
        // CRITICAL FIX: Fetch stats with the correct state immediately
        // We can't rely on useEffect because it might not trigger in time
        const stateParam = data.batch.filterState !== 'all' ? `?state=${data.batch.filterState}` : '';
        const statsUrl = `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/batch-scraping/stats${stateParam}`;
        console.log('📊 Fetching stats immediately after state sync:', statsUrl);
        
        const statsResponse = await fetch(statsUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'apikey': publicAnonKey,
          },
        });
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          console.log('📊 Stats data received:', statsData);
          setOverallStats(statsData.overall);
          setStateStats(statsData.byState || {});
        }
      }
      
      console.log('✅ Batch status refreshed:', data.batch);
    } catch (error) {
      console.error('Error fetching batch status:', error);
    }
  }, [accessToken]);  // Remove fetchOverallStats from dependencies

  // Auto-refresh status every 30 seconds when batch is running (reduced from 10s)
  useEffect(() => {
    if (batchState?.status === 'running') {
      const interval = setInterval(() => {
        fetchBatchStatus();
      }, 30000); // Changed from 10000 to 30000 (30 seconds)
      return () => clearInterval(interval);
    }
  }, [batchState?.status, fetchBatchStatus]);

  // Load initial data only once on mount
  useEffect(() => {
    fetchBatchStatus();
  }, [fetchBatchStatus]);
  
  // Refresh stats when selectedState changes
  useEffect(() => {
    console.log('🔄 selectedState changed to:', selectedState);
    fetchOverallStats();
  }, [selectedState, fetchOverallStats]);

  // SYNC DROPDOWN TO BATCH FILTER STATE (when resuming existing batch)
  useEffect(() => {
    if (batchState?.filterState) {
      // Convert full state name back to abbreviation for dropdown
      const stateAbbreviations: Record<string, string> = {
        'Victoria': 'VIC',
        'New South Wales': 'NSW',
        'Queensland': 'QLD',
        'South Australia': 'SA',
        'Western Australia': 'WA',
        'Tasmania': 'TAS',
        'Northern Territory': 'NT',
        'Australian Capital Territory': 'ACT'
      };
      
      const abbr = stateAbbreviations[batchState.filterState] || batchState.filterState;
      
      if (selectedState !== abbr && abbr !== 'all') {
        console.log(`🔄 Syncing dropdown to batch filter: ${batchState.filterState} → ${abbr}`);
        setSelectedState(abbr);
      }
    } else if (batchState && !batchState.filterState && selectedState !== 'all') {
      // Batch exists but has no filter = "All States"
      console.log('🔄 Syncing dropdown to batch filter: No filter → all');
      setSelectedState('all');
    }
  }, [batchState?.filterState, batchState?.status]);

  // 🔥 CRITICAL FIX: Auto-start processing loop if batch is running but loop isn't active
  // This handles page refreshes, component remounts, and silent loop crashes
  const processingLoopActiveRef = React.useRef(false);
  const hasAutoStartedRef = React.useRef(false); // NEW: Prevent multiple auto-starts
  
  useEffect(() => {
    console.log('🔍 Checking if processing loop needs to start...');
    console.log('   Batch status:', batchState?.status);
    console.log('   Loop active:', processingLoopActiveRef.current);
    console.log('   Has auto-started:', hasAutoStartedRef.current);
    
    // CRITICAL: Only auto-start ONCE per component mount
    if (batchState?.status === 'running' && !processingLoopActiveRef.current && !hasAutoStartedRef.current) {
      console.log('🚀 DETECTED RUNNING BATCH WITHOUT ACTIVE LOOP - AUTO-STARTING!');
      hasAutoStartedRef.current = true; // Mark that we've auto-started
      processingLoopActiveRef.current = true;
      
      // Small delay to ensure state is ready
      setTimeout(() => {
        processNextVillage();
      }, 500);
    }
    
    // Reset flag when batch stops
    if (batchState?.status !== 'running') {
      processingLoopActiveRef.current = false;
      hasAutoStartedRef.current = false; // Reset auto-start flag
    }
  }, [batchState?.status]); // REMOVED processNextVillage dependency to prevent infinite loop

  const startBatch = async () => {
    console.log('🚀 START BATCH CLICKED');
    console.log('  Access Token:', accessToken ? 'Present' : 'MISSING');
    console.log('  Project ID:', projectId);
    console.log('  Public Anon Key:', publicAnonKey ? 'Present' : 'MISSING');
    
    if (!accessToken) {
      console.error('❌ No access token - user not authenticated');
      alert('You must be logged in to start batch scraping. Please refresh the page and try again.');
      return;
    }
    
    setLoading(true);

    try {
      // Add timeout protection for the start batch call
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error('⏱️ START BATCH TIMEOUT - Request took longer than 30 seconds');
        controller.abort();
      }, 30000); // 30 second timeout
      
      console.log('📡 Calling /batch-scraping/start endpoint...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/batch-scraping/start`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': publicAnonKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            batchSize,
            delayBetweenRequests,
            filterState: selectedState || undefined
          }),
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      console.log('📡 START RESPONSE STATUS:', response.status);
      console.log('📡 START RESPONSE OK:', response.ok);

      const data = await response.json();
      
      console.log('📦 START RESPONSE DATA:', data);

      if (!response.ok) {
        // Log full error details for debugging
        console.error('❌ START BATCH FAILED:', {
          status: response.status,
          error: data.error,
          details: data.details,
          fullResponse: data
        });
        throw new Error(data.details || data.error || 'Failed to start batch scraping');
      }

      setBatchState(data.batch);
      
      console.log('✅ BATCH STATE SET:', data.batch);
      
      // Show message if batch was resumed
      if (data.resumed) {
        alert(`🔄 Resumed existing batch!\n\nProgress: ${data.batch.processedVillages}/${data.batch.totalVillages}\nSuccess: ${data.batch.successCount}\nFailed: ${data.batch.failedCount}`);
      }
      
      // Start the polling process
      console.log('🔄 Starting processNextVillage polling loop...');
      processNextVillage();
    } catch (error) {
      console.error('❌ Error starting batch:', error);
      
      // Check if it was a timeout
      if (error.name === 'AbortError') {
        alert('⏱️ Request timed out - the server might be overloaded. Please try again.');
      } else {
        alert(`❌ Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Process next village (called repeatedly while batch is running)
  const processNextVillage = async () => {
    console.log('🎯 processNextVillage CALLED!');
    console.log('   Batch state:', batchState);
    console.log('   Access token:', accessToken ? 'Present' : 'MISSING');
    
    try {
      // Get the next village to scrape from the backend
      console.log('📡 Fetching next village from backend...');
      const nextResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/batch-scraping/process-next`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'apikey': publicAnonKey,
          },
        }
      );

      const nextData = await nextResponse.json();

      if (!nextResponse.ok) {
        // Batch might be paused or completed
        console.log('Process next stopped:', nextData.error);
        setBatchState(nextData.batch || null);
        return;
      }

      // If done, stop processing
      if (nextData.done) {
        console.log('Batch completed!', nextData.message);
        setBatchState(nextData.batch);
        fetchOverallStats();
        
        // AUTO-RESUME: Check if batch completed successfully and auto-resume is enabled
        if (nextData.batch.status === 'completed' && autoResumeRef.current) {
          console.log('🔄 Auto-resume enabled - checking if more villages remain...');
          
          // Use the SAME state filter that the completed batch used
          const batchStateFilter = nextData.batch.filterState || selectedState;
          console.log(`🔍 Auto-resume will use state filter: ${batchStateFilter}`);
          
          // Fetch latest stats to see if there are more villages
          setTimeout(async () => {
            const stateParam = batchStateFilter && batchStateFilter !== 'all' ? `?state=${batchStateFilter}` : '';
            const statsResponse = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/batch-scraping/stats${stateParam}`,
              {
                headers: {
                  'Authorization': `Bearer ${accessToken || publicAnonKey}`,
                  'apikey': publicAnonKey,
                },
              }
            );
            
            if (statsResponse.ok) {
              const statsData = await statsResponse.json();
              console.log(`📊 Stats check: ${statsData.overall.totalRemaining} villages remaining`);
              
              if (statsData.overall.totalRemaining > 0) {
                console.log(`🚀 ${statsData.overall.totalRemaining} villages remaining - auto-starting next batch...`);
                // Auto-start next batch (no alert needed - just log)
                console.log(`🔄 AUTO-RESUME: Starting next batch with ${statsData.overall.totalRemaining} villages remaining...`);
                
                // Start next batch
                startBatch();
              } else {
                console.log('✅ All villages scraped! Auto-resume complete.');
                alert('🎉 All villages have been scraped! The batch scraping process is complete.');
              }
            } else {
              console.error('❌ Failed to fetch stats for auto-resume');
            }
          }, 3000); // Wait 3 seconds before auto-resuming
        }
        
        return;
      }

      // Got a village to scrape - call the scraping endpoint directly from frontend
      const village = nextData.village;
      console.log(`🔍 Frontend scraping: ${village.name} (${village.state})`);
      console.log(`   Website: ${village.website || 'NO WEBSITE!'}`);
      console.log(`   Has scraped_data: ${village.scraped_data ? 'YES' : 'NO'}`);

      try {
        // Call the scraping endpoint with timeout protection
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 75000); // 75 second timeout - gives backend 60s timeout room to work
        
        console.log(`   ⚡ Starting scrape with 75s timeout (backend has 60s)...`);
        
        const scrapeResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/data-enrichment/scrape-village-data`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken || publicAnonKey}`,
              'apikey': publicAnonKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              villageIds: [village.id],
              forceRescrape: true
            }),
            signal: controller.signal
          }
        );
        
        clearTimeout(timeoutId);
        console.log(`   ✅ Got response (status: ${scrapeResponse.status})`);

        const scrapeResult = await scrapeResponse.json();
        
        // 🔥 LOG TEST MESSAGE FROM BACKEND 🔥
        if (scrapeResult.testMessage) {
          console.log(`\n${scrapeResult.testMessage}\n`);
          console.log(`Backend Version: ${scrapeResult.backendVersion}\n`);
        }
        
        // Determine status from scraping result
        let status = 'failed';
        let reason = 'Unknown error';
        let fieldsFound = 0;

        if (scrapeResponse.ok && scrapeResult.results && scrapeResult.results.length > 0) {
          const villageResult = scrapeResult.results[0];
          status = villageResult.status;
          reason = villageResult.reason || villageResult.error;
          fieldsFound = villageResult.fieldsFound || 0;
        }
        
        // Log concise result
        if (status === 'success') {
          console.log(`✅ Success: ${village.name} (${fieldsFound} fields)`);
        } else if (status === 'skipped') {
          console.log(`⏭️ Skipped: ${village.name} - ${reason}`);
        } else {
          console.log(`❌ Failed: ${village.name} - ${reason}`);
        }

        // Record the result back to the batch-scraping system
        const recordResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/batch-scraping/record-result`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken || publicAnonKey}`,
              'apikey': publicAnonKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              villageId: village.id,
              status,
              reason,
              fieldsFound,
              error: reason
            })
          }
        );

        const recordData = await recordResponse.json();
        setBatchState(recordData.batch);

      } catch (scrapeError) {
        console.error('Error scraping village:', scrapeError);
        
        // Determine error type
        let errorMessage = 'Unknown error';
        if (scrapeError.name === 'AbortError') {
          errorMessage = 'Timeout after 75 seconds';  // Updated to match new 75s timeout
          console.log(`   ⏱️ TIMEOUT: ${village.name} took too long to scrape`);
        } else if (scrapeError.message) {
          errorMessage = scrapeError.message;
        }
        
        console.log(`   ❌ SCRAPE ERROR: ${errorMessage}`);
        
        // Record failure
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/batch-scraping/record-result`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken || publicAnonKey}`,
              'apikey': publicAnonKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              villageId: village.id,
              status: 'failed',
              error: errorMessage
            })
          }
        );
      }

      // Update batch state
      setBatchState(nextData.batch);
      
      // Refresh stats every 10 villages
      if (nextData.batch.processedVillages % 10 === 0) {
        fetchOverallStats();
      }

      // If batch is still running, continue processing with a delay
      if (nextData.batch.status === 'running') {
        setTimeout(() => {
          processNextVillage();
        }, delayBetweenRequests);
      } else {
        // Batch completed or paused
        console.log('Batch processing stopped:', nextData.message);
        console.log('Batch final status:', nextData.batch.status);
        fetchOverallStats();
        
        // AUTO-RESUME: Check if batch completed successfully and auto-resume is enabled
        if (nextData.batch.status === 'completed' && autoResumeRef.current) {
          console.log('🔄 Auto-resume enabled - checking if more villages remain...');
          
          // Use the SAME state filter that the completed batch used
          const batchStateFilter = nextData.batch.filterState || selectedState;
          console.log(`🔍 Auto-resume will use state filter: ${batchStateFilter}`);
          
          // Fetch latest stats to see if there are more villages
          setTimeout(async () => {
            const stateParam = batchStateFilter && batchStateFilter !== 'all' ? `?state=${batchStateFilter}` : '';
            const statsResponse = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/batch-scraping/stats${stateParam}`,
              {
                headers: {
                  'Authorization': `Bearer ${accessToken || publicAnonKey}`,
                  'apikey': publicAnonKey,
                },
              }
            );
            
            if (statsResponse.ok) {
              const statsData = await statsResponse.json();
              console.log(`📊 Stats check: ${statsData.overall.totalRemaining} villages remaining`);
              
              if (statsData.overall.totalRemaining > 0) {
                console.log(`🚀 ${statsData.overall.totalRemaining} villages remaining - auto-starting next batch...`);
                // Auto-start next batch (no alert needed - just log)
                console.log(`🔄 AUTO-RESUME: Starting next batch with ${statsData.overall.totalRemaining} villages remaining...`);
                
                // Start next batch
                startBatch();
              } else {
                console.log('✅ All villages scraped! Auto-resume complete.');
                alert('🎉 All villages have been scraped! The batch scraping process is complete.');
              }
            } else {
              console.error('❌ Failed to fetch stats for auto-resume');
            }
          }, 3000); // Wait 3 seconds before auto-resuming
        }
      }
    } catch (error) {
      console.error('Error processing next village:', error);
      // On error, wait longer before retrying
      setTimeout(() => {
        fetchBatchStatus().then(() => {
          if (batchState?.status === 'running') {
            processNextVillage();
          }
        });
      }, 5000);
    }
  };

  const pauseBatchScraping = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/batch-scraping/pause`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'apikey': publicAnonKey,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to pause batch');
      }

      setBatchState(data.batch);
      // Disable auto-resume when user manually pauses
      setAutoResumeEnabled(false);
      alert('⏸️ Batch scraping paused. Auto-resume has been disabled.');
    } catch (error) {
      console.error('Error pausing batch:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetBatch = async () => {
    if (!confirm('⚠️ Are you sure you want to reset the batch state? This will clear all progress tracking.')) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/batch-scraping/reset`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'apikey': publicAnonKey,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Failed to reset batch');
      }

      // Backend returns { batch: null } after successful reset
      setBatchState(null);
      console.log('✅ Batch state reset - frontend cleared');
      
      // DON'T reset selectedState - keep user's filter selection!
      // Just refetch stats with their current selection
      await fetchOverallStats();
      
      alert('✅ Batch state reset successfully. Your state filter has been preserved.');
    } catch (error) {
      console.error('Error resetting batch:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const skipProblematicVillages = async () => {
    const villageIds = [
      '51d4f9f2-0133-468c-b29d-5149db11a2b0', // DNS error village
      '84469347-b3ca-4983-bcd2-772abf39e120'  // Unknown error village (CORRECTED ID - was 8d, now 84)
    ];
    
    console.log('🔧 Attempting to skip villages:', villageIds);
    
    try {
      setLoading(true);

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/batch-scraping/add-to-skip-list`;
      console.log('🔧 URL:', url);
      console.log('🔧 Access Token:', accessToken ? 'Present' : 'Missing');

      const response = await fetch(
        url,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'apikey': publicAnonKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ villageIds }),
        }
      );

      console.log('🔧 Response status:', response.status);
      const data = await response.json();
      console.log('🔧 Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to add villages to skip list');
      }

      alert(`✅ Successfully added 2 problematic villages to skip list!\n\nTotal skipped: ${data.totalSkipped}\n\n🔄 The scraper will now skip these villages and move on to new ones.`);
      console.log('✅ Skip list updated:', data);
      
    } catch (error) {
      console.error('❌ Error adding to skip list:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-600 bg-blue-50';
      case 'paused': return 'text-yellow-600 bg-yellow-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Loader className="size-5 animate-spin" />;
      case 'paused': return <Pause className="size-5" />;
      case 'completed': return <CheckCircle className="size-5" />;
      case 'error': return <XCircle className="size-5" />;
      default: return <Activity className="size-5" />;
    }
  };

  const progressPercentage = batchState && batchState.totalVillages > 0
    ? Math.round((batchState.processedVillages / batchState.totalVillages) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl">Batch Scraping System</h2>
          <div className="px-3 py-1 bg-blue-100 border border-blue-300 rounded-lg">
            <span className="text-sm font-mono text-blue-900">
              Backend: {backendVersion}
            </span>
          </div>
        </div>
        <p className="text-muted-foreground">
          Automatically scrape data from all 2500+ retirement villages in production-ready batches
        </p>
      </div>
      
      {/* FACILITY TYPE AUDIT BUTTON */}
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-yellow-900 mb-1">🚨 Data Quality Check</h3>
            <p className="text-sm text-yellow-800">
              Run this audit to check if aged care facilities are mixed into your dataset
            </p>
          </div>
          <Button
            onClick={async () => {
              try {
                setLoading(true);
                const response = await fetch(
                  `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/batch-scraping/facility-type-audit`,
                  {
                    headers: {
                      'Authorization': `Bearer ${accessToken || publicAnonKey}`,
                      'apikey': publicAnonKey,
                    },
                  }
                );
                const data = await response.json();
                
                // Build a detailed breakdown message
                let message = `📊 FACILITY TYPE AUDIT RESULTS:\n\n`;
                message += `OVERALL:\n`;
                message += `Total: ${data.overall.total}\n`;
                message += `Retirement Villages: ${data.overall.retirement_village}\n`;
                message += `Aged Care: ${data.overall.aged_care}\n`;
                message += `Both: ${data.overall.both}\n`;
                message += `Unclassified: ${data.overall.unclassified}\n\n`;
                message += `BY STATE:\n`;
                
                Object.keys(data.byState).sort().forEach(state => {
                  const stats = data.byState[state];
                  message += `\n${state}:\n`;
                  message += `  Total: ${stats.total}\n`;
                  message += `  Retirement Villages: ${stats.retirement_village}\n`;
                  message += `  Aged Care: ${stats.aged_care}\n`;
                  message += `  Both: ${stats.both}\n`;
                  message += `  Unclassified: ${stats.unclassified}\n`;
                });
                
                alert(message);
                console.log('📊 Facility Type Audit:', data);
              } catch (error) {
                console.error('Error running audit:', error);
                alert(`Error: ${error.message}`);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {loading ? <Loader className="size-4 animate-spin mr-2" /> : null}
            Run Facility Audit
          </Button>
        </div>
      </Card>

      {/* Overall Statistics */}
      {overallStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total VIC Villages</p>
                <p className="text-2xl font-bold">{overallStats.totalWithWebsites}</p>
              </div>
              <Database className="size-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">VIC Scraped</p>
                <p className="text-2xl font-bold text-green-600">{overallStats.totalScraped}</p>
              </div>
              <CheckCircle className="size-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">VIC Remaining</p>
                <p className="text-2xl font-bold text-orange-600">{overallStats.totalRemaining}</p>
              </div>
              <Globe className="size-8 text-orange-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">VIC Progress</p>
                <p className="text-2xl font-bold text-blue-600">{overallStats.percentComplete}%</p>
              </div>
              <TrendingUp className="size-8 text-blue-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Progress Bar */}
      {overallStats && overallStats.totalWithWebsites > 0 && (
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>VIC Overall Progress</span>
              <span className="font-medium">{overallStats.totalScraped} / {overallStats.totalWithWebsites}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${overallStats.percentComplete}%` }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Batch Controls */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Batch Configuration</h3>
        
        {/* BATCH STATUS ALERT */}
        {batchState && batchState.status === 'running' && (
          <Alert className="mb-6 border-blue-300 bg-blue-50">
            <Activity className="size-5 text-blue-600" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">⚠️ Batch Currently Running</h4>
              <p className="text-sm text-blue-800 mb-3">
                A batch is actively scraping villages. You cannot change the state filter while a batch is running.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={pauseBatchScraping}
                  disabled={loading}
                  variant="outline"
                  className="border-blue-300 bg-white hover:bg-blue-50"
                >
                  <Pause className="size-4 mr-2" />
                  Pause Batch
                </Button>
                <Button
                  size="sm"
                  onClick={resetBatch}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <XCircle className="size-4 mr-2" />
                  Reset & Reconfigure
                </Button>
              </div>
            </div>
          </Alert>
        )}
        
        {/* Auto-Resume Toggle */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-blue-900">🚀 Auto-Resume Mode</h4>
                {autoResumeEnabled && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    ENABLED
                  </span>
                )}
              </div>
              <p className="text-sm text-blue-700">
                Automatically start the next batch when the current one completes. 
                <strong> Walk away and let it scrape all 1,797 remaining villages!</strong>
              </p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={autoResumeEnabled}
                onChange={(e) => setAutoResumeEnabled(e.target.checked)}
                className="size-5 cursor-pointer"
              />
              <span className="text-sm font-medium text-blue-900">
                {autoResumeEnabled ? 'ON' : 'OFF'}
              </span>
            </label>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">State Filter (Optional)</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              disabled={batchState?.status === 'running'}
            >
              <option value="all">All States</option>
              <option value="VIC">Victoria</option>
              <option value="NSW">New South Wales</option>
              <option value="QLD">Queensland</option>
              <option value="WA">Western Australia</option>
              <option value="SA">South Australia</option>
              <option value="TAS">Tasmania</option>
              <option value="ACT">ACT</option>
              <option value="NT">Northern Territory</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Batch Size</label>
            <input
              type="number"
              value={batchSize}
              onChange={(e) => setBatchSize(parseInt(e.target.value) || 50)}
              min={1}
              max={500}
              className="w-full border rounded-lg px-3 py-2"
              disabled={batchState?.status === 'running'}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Villages per batch (1-500)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Delay Between Requests (ms)</label>
            <input
              type="number"
              value={delayBetweenRequests}
              onChange={(e) => setDelayBetweenRequests(parseInt(e.target.value) || 2000)}
              min={500}
              max={10000}
              step={500}
              className="w-full border rounded-lg px-3 py-2"
              disabled={batchState?.status === 'running'}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Rate limiting (500-10000ms)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* DEBUG BUTTON - ALWAYS VISIBLE */}
          <Button
            onClick={() => {
              console.log('🧪 DEBUG BUTTON CLICKED!');
              console.log('🧪 accessToken:', accessToken ? 'EXISTS' : 'MISSING');
              console.log('🧪 publicAnonKey:', publicAnonKey ? 'EXISTS' : 'MISSING');
              console.log('🧪 batchState:', batchState);
              console.log('🧪 loading:', loading);
              startBatch();
            }}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
          >
            <Play className="size-4" />
            DEBUG TEST BUTTON
          </Button>
          
          {(!batchState || batchState.status === 'idle' || batchState.status === 'completed' || batchState.status === 'paused') && (
            <Button
              onClick={startBatch}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Play className="size-4" />
              {batchState?.status === 'paused' ? 'Resume Batch' : 'Start Batch Scraping'}
            </Button>
          )}

          {batchState?.status === 'running' && (
            <Button
              onClick={pauseBatchScraping}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Pause className="size-4" />
              Pause Batch
            </Button>
          )}
          
          {batchState?.status === 'running' && (
            <Button
              onClick={processNextVillage}
              variant="outline"
              className="flex items-center gap-2 bg-green-50 hover:bg-green-100"
            >
              <Play className="size-4" />
              Resume Processing Loop
            </Button>
          )}

          <Button
            onClick={async () => {
              await fetchBatchStatus();
              // Wait a tick for React state to update
              setTimeout(() => {
                fetchOverallStats();
              }, 100);
            }}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="size-4" />
            Refresh Status
          </Button>

          {/* Show Reset button whenever batch exists (not just when not running) */}
          {batchState && (
            <Button
              onClick={resetBatch}
              variant="outline"
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <XCircle className="size-4" />
              Reset Batch
            </Button>
          )}

          {/* Show skip button always when batch exists */}
          {batchState && (
            <Button
              onClick={skipProblematicVillages}
              variant="outline"
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700"
              disabled={loading}
            >
              <AlertCircle className="size-4" />
              Skip Stuck Villages
            </Button>
          )}
          
          {/* NEW: Quick skip for current stuck village */}
          {batchState?.errors && batchState.errors.length > 0 && (
            <Button
              onClick={async () => {
                // Get the most recent error's villageId
                const lastError = batchState.errors[batchState.errors.length - 1];
                const villageId = lastError.villageId;
                
                if (!villageId) {
                  alert('❌ No village ID found in error');
                  return;
                }
                
                if (!confirm(`⚠️ Skip village ${villageId}?\n\nThis village will be permanently skipped.`)) {
                  return;
                }
                
                try {
                  setLoading(true);
                  const response = await fetch(
                    `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/batch-scraping/add-to-skip-list`,
                    {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${accessToken || publicAnonKey}`,
                        'apikey': publicAnonKey,
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ villageIds: [villageId] }),
                    }
                  );
                  
                  const data = await response.json();
                  
                  if (!response.ok) {
                    throw new Error(data.error || 'Failed to skip village');
                  }
                  
                  alert(`✅ Skipped village ${villageId}!\n\nYou can now resume the batch.`);
                  console.log('✅ Village skipped:', data);
                  
                  // Refresh batch status
                  fetchBatchStatus();
                } catch (error) {
                  console.error('❌ Error skipping village:', error);
                  alert(`❌ Error: ${error.message}`);
                } finally {
                  setLoading(false);
                }
              }}
              variant="outline"
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700"
              disabled={loading}
            >
              <XCircle className="size-4" />
              Skip Current Stuck Village
            </Button>
          )}
        </div>
      </Card>

      {/* Current Batch Status */}
      {batchState && batchState.status !== 'idle' && (
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Current Batch Status</h3>
              <p className="text-sm text-muted-foreground">Batch ID: {batchState.batchId}</p>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(batchState.status)}`}>
              {getStatusIcon(batchState.status)}
              <span className="font-medium capitalize">{batchState.status}</span>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Batch Progress</span>
                <span className="font-medium">{batchState.processedVillages} / {batchState.totalVillages}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="text-right text-sm text-muted-foreground mt-1">
                {progressPercentage}%
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <CheckCircle className="size-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Success</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{batchState.successCount}</p>
              </div>

              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <XCircle className="size-4 text-red-600" />
                  <span className="text-sm font-medium text-red-900">Failed</span>
                </div>
                <p className="text-2xl font-bold text-red-600">{batchState.failedCount}</p>
              </div>

              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <AlertCircle className="size-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Skipped</span>
                </div>
                <p className="text-2xl font-bold text-gray-600">{batchState.skippedCount}</p>
              </div>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {batchState.startedAt && (
                <div>
                  <span className="text-muted-foreground">Started:</span>
                  <span className="ml-2 font-medium">
                    {new Date(batchState.startedAt).toLocaleString()}
                  </span>
                </div>
              )}
              {batchState.completedAt && (
                <div>
                  <span className="text-muted-foreground">Completed:</span>
                  <span className="ml-2 font-medium">
                    {new Date(batchState.completedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Recent Errors */}
            {batchState.errors && batchState.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Recent Errors ({batchState.errors.length})</h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                  {batchState.errors.slice(-10).reverse().map((error, index) => {
                    // Old errors from batch state - just display, don't log to console
                    const errorText = error.error || error.toString() || 'Unknown error';
                    return (
                      <div key={index} className="text-xs mb-2 last:mb-0">
                        <span className="text-red-700 font-mono">{errorText}</span>
                        <span className="text-red-600 ml-2">
                          ({new Date(error.timestamp).toLocaleTimeString()})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* State-by-State Breakdown */}
      {Object.keys(stateStats).length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">State-by-State Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(stateStats)
              .sort(([, a], [, b]) => b.remaining - a.remaining)
              .map(([state, stats]) => {
                const percent = stats.total > 0 ? Math.round((stats.scraped / stats.total) * 100) : 0;
                return (
                  <div key={state} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">{state}</h4>
                      <span className="text-sm text-muted-foreground">{percent}%</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-medium">{stats.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-600">Scraped:</span>
                        <span className="font-medium text-green-600">{stats.scraped}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-orange-600">Remaining:</span>
                        <span className="font-medium text-orange-600">{stats.remaining}</span>
                      </div>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      )}
    </div>
  );
}