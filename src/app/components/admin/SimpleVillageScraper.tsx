import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Loader, Play, CheckCircle, XCircle, Database, AlertCircle, RefreshCw } from 'lucide-react';

interface Stats {
  totalWithWebsites: number;
  totalScraped: number;
  totalRemaining: number;
  percentComplete: number;
}

interface DetailedStats {
  total: number;
  withWebsites: number;
  successfullyScraped: number;
  failedScrapes: number;
  notAttempted: number;
  skipped: number;
}

export function SimpleVillageScraper() {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [detailedStats, setDetailedStats] = useState<DetailedStats | null>(null);
  const [results, setResults] = useState<any>(null);
  const [loadingDetailed, setLoadingDetailed] = useState(false);
  const [clearingBatch, setClearingBatch] = useState(false);
  const [customVillageName, setCustomVillageName] = useState('');
  const [correctUrl, setCorrectUrl] = useState('');
  const [updatingUrl, setUpdatingUrl] = useState(false);
  
  // For name + URL update
  const [oldName, setOldName] = useState('');
  const [newName, setNewName] = useState('');
  const [newUrlForRename, setNewUrlForRename] = useState('');
  const [updatingNameAndUrl, setUpdatingNameAndUrl] = useState(false);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
    fetchDetailedBreakdown();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/batch-scraping/stats?state=VIC`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'apikey': publicAnonKey,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.overall);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchDetailedBreakdown = async () => {
    setLoadingDetailed(true);
    try {
      // Query database directly for detailed breakdown
      const supabaseUrl = `https://${projectId}.supabase.co/rest/v1/retirement_villages`;
      
      // Get all VIC villages with websites - USE "VIC" not "Victoria"!
      const allResponse = await fetch(
        `${supabaseUrl}?select=id,scraped_data&state=eq.VIC&website=not.is.null`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'apikey': publicAnonKey,
            'Prefer': 'count=exact',
          },
        }
      );

      if (allResponse.ok) {
        const villages = await allResponse.json();
        const total = villages.length;
        
        // Count by status
        let successfullyScraped = 0;
        let failedScrapes = 0;
        let notAttempted = 0;
        let skipped = 0;
        
        villages.forEach((v: any) => {
          if (!v.scraped_data) {
            notAttempted++;
          } else if (v.scraped_data.status === 'success') {
            successfullyScraped++;
          } else if (v.scraped_data.autoSkipped === true || v.scraped_data.status === 'failed' || v.scraped_data.status === 'no_data') {
            // Count all problematic scrapes as "skipped" so we can retry them
            skipped++;
          } else if (v.scraped_data.status === 'skipped') {
            skipped++;
          } else {
            // Has scraped_data but no status - assume success
            successfullyScraped++;
          }
        });
        
        setDetailedStats({
          total,
          withWebsites: total,
          successfullyScraped,
          failedScrapes,
          notAttempted,
          skipped,
        });
        
        console.log('📊 Detailed Stats:', {
          total,
          successfullyScraped,
          failedScrapes,
          notAttempted,
          skipped,
        });
      }
    } catch (error) {
      console.error('Error fetching detailed breakdown:', error);
    } finally {
      setLoadingDetailed(false);
    }
  };

  const clearOldBatch = async () => {
    if (!confirm('⚠️ This will clear any paused/running batch scraping operations.\n\nThis allows the Simple Village Scraper to run cleanly.\n\nContinue?')) {
      return;
    }

    setClearingBatch(true);
    try {
      console.log('🗑️ Clearing old batch scraping state...');
      
      // Delete the batch_scraping_state key from KV store
      const kvUrl = `https://${projectId}.supabase.co/rest/v1/kv_store_3bba8be8`;
      const response = await fetch(
        `${kvUrl}?key=eq.batch_scraping_state`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'apikey': publicAnonKey,
          },
        }
      );

      if (response.ok) {
        console.log('✅ Old batch cleared successfully');
        alert('✅ Old batch scraping state cleared!\n\nYou can now use the Simple Village Scraper.');
      } else {
        throw new Error('Failed to clear batch state');
      }
    } catch (error) {
      console.error('❌ Error clearing batch:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setClearingBatch(false);
    }
  };

  const testSingleVillage = async () => {
    if (!confirm('🧪 This will test scraping a SINGLE village to see the full error message.\n\nContinue?')) {
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      console.log('🧪 Testing single village scrape...');
      
      // Get just ONE village with null scraped_data
      const supabaseUrl = `https://${projectId}.supabase.co/rest/v1/retirement_villages`;
      const response = await fetch(
        `${supabaseUrl}?select=id,name,website&state=eq.VIC&website=not.is.null&scraped_data=is.null&limit=1`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'apikey': publicAnonKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch test village');
      }

      const villages = await response.json();
      if (villages.length === 0) {
        alert('✅ No villages need scraping!');
        setLoading(false);
        return;
      }

      const testVillage = villages[0];
      console.log('🧪 Test village:', testVillage);

      // Try to scrape it
      const scrapeResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/data-enrichment/scrape-village-data`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'apikey': publicAnonKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            villageIds: [testVillage.id],
            forceRescrape: false
          }),
        }
      );

      if (!scrapeResponse.ok) {
        const errorData = await scrapeResponse.json();
        console.error('❌ Scrape failed:', errorData);
        alert(`❌ Test scrape failed:\n\n${JSON.stringify(errorData, null, 2)}`);
      } else {
        const scrapeData = await scrapeResponse.json();
        console.log('✅ Test scrape succeeded:', scrapeData);
        alert(`✅ Test scrape succeeded!\n\nVillage: ${testVillage.name}\nResult: ${JSON.stringify(scrapeData, null, 2)}`);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const scrapeAllRemaining = async () => {
    if (!confirm(`⚠️ This will scrape ALL ${stats?.totalRemaining || '?'} remaining Victorian villages.\\\\n\\\\nThe process will run server-side (you can close your browser).\\\\n\\\\nContinue?`)) {
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      // Step 1: Get actual village IDs from database
      console.log('📡 Fetching unscraped Victorian villages...');
      
      const supabaseUrl = `https://${projectId}.supabase.co/rest/v1/retirement_villages`;
      
      // Query 1: Get villages with null scraped_data
      console.log('🔍 Query 1: Fetching villages with NULL scraped_data...');
      const nullResponse = await fetch(
        `${supabaseUrl}?select=id&state=eq.VIC&website=not.is.null&scraped_data=is.null`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'apikey': publicAnonKey,
          },
        }
      );

      // Query 2: Get villages with failed status
      console.log('🔍 Query 2: Fetching villages with FAILED status...');
      const failedResponse = await fetch(
        `${supabaseUrl}?select=id,scraped_data&state=eq.VIC&website=not.is.null&scraped_data=not.is.null`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'apikey': publicAnonKey,
          },
        }
      );

      if (!nullResponse.ok || !failedResponse.ok) {
        throw new Error('Failed to fetch village IDs');
      }

      const nullVillages = await nullResponse.json();
      const potentiallyFailedVillages = await failedResponse.json();
      
      // Filter for actual failures
      const failedVillages = potentiallyFailedVillages.filter((v: any) => 
        v.scraped_data?.status === 'failed'
      );

      console.log(`📊 Found ${nullVillages.length} villages with null scraped_data`);
      console.log(`📊 Found ${failedVillages.length} villages with failed status`);

      // Combine and deduplicate
      const allVillageIds = [
        ...nullVillages.map((v: any) => v.id),
        ...failedVillages.map((v: any) => v.id)
      ];
      
      const uniqueVillageIds = [...new Set(allVillageIds)];

      console.log(`✅ Total unique villages to scrape: ${uniqueVillageIds.length}`);

      if (uniqueVillageIds.length === 0) {
        alert('✅ All Victorian villages are already scraped!');
        setLoading(false);
        return;
      }

      // Confirm with actual count
      if (!confirm(`🚀 Ready to scrape ${uniqueVillageIds.length} villages.\n\nThis includes:\n- ${nullVillages.length} not yet attempted\n- ${failedVillages.length} failed attempts\n\nContinue?`)) {
        setLoading(false);
        return;
      }

      // Step 2: Call the original scraper with ALL IDs
      console.log(`🚀 Starting scrape of ${uniqueVillageIds.length} villages...`);
      
      // IMPORTANT: Process ONE village at a time to avoid ScraperAPI rate limiting
      // ScraperAPI appears to have strict rate limits that cause 546 errors with batches
      const BATCH_SIZE = 1;
      const batches: string[][] = [];
      
      for (let i = 0; i < uniqueVillageIds.length; i += BATCH_SIZE) {
        batches.push(uniqueVillageIds.slice(i, i + BATCH_SIZE));
      }
      
      console.log(`📦 Split into ${batches.length} batches of ${BATCH_SIZE} villages each`);
      
      let totalSuccess = 0;
      let totalFailed = 0;
      let totalSkipped = 0;
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`\n🔄 Processing batch ${i + 1}/${batches.length} (${batch.length} villages)...`);
        
        const scrapeResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/data-enrichment/scrape-village-data`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken || publicAnonKey}`,
              'apikey': publicAnonKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              villageIds: batch,
              forceRescrape: true // Force rescrape to override the skip logic
            }),
          }
        );

        if (!scrapeResponse.ok) {
          const errorData = await scrapeResponse.json();
          const errorMsg = errorData.error || errorData.details || 'Scraping failed';
          
          console.error(`❌ Batch ${i + 1} failed:`, errorMsg);
          
          // Check if it's a ScraperAPI quota error
          if (errorMsg.includes('546') || errorMsg.includes('quota') || errorMsg.includes('ScraperAPI')) {
            throw new Error(`⚠️ ScraperAPI Quota Exceeded\n\nThe scraper uses ScraperAPI to fetch website data, but the quota has been exceeded.\n\nOptions:\n1. Wait for quota to reset\n2. Upgrade ScraperAPI plan\n3. Use a different scraping method\n\nTechnical details: ${errorMsg}`);
          }
          
          // Continue to next batch even if this one failed
          totalFailed += batch.length;
          continue;
        }

        const scrapeData = await scrapeResponse.json();
        console.log(`✅ Batch ${i + 1} complete:`, scrapeData.summary);
        
        // Count results
        const batchResults = scrapeData.results || [];
        totalSuccess += batchResults.filter((r: any) => r.status === 'success').length;
        totalFailed += batchResults.filter((r: any) => r.status === 'failed' || r.status === 'error').length;
        totalSkipped += batchResults.filter((r: any) => r.status === 'skipped').length;
        
        // Small delay between batches to avoid rate limiting
        if (i < batches.length - 1) {
          console.log('⏳ Waiting 3 seconds before next batch...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
      
      const finalResults = {
        success: true,
        summary: {
          total: uniqueVillageIds.length,
          batches: batches.length,
          successful: totalSuccess,
          failed: totalFailed,
          skipped: totalSkipped
        }
      };
      
      console.log('✅ ALL BATCHES COMPLETE:', finalResults.summary);

      setResults(finalResults);
      
      // Show success message
      alert(`✅ Scraping initiated successfully!\n\n${finalResults.summary.total} villages queued for scraping.\n\nThe scraper runs server-side, so you can close your browser.`);
      
    } catch (error) {
      console.error('❌ Error:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const rescrapeParkedDomains = async () => {
    // Check if user is authenticated
    if (!accessToken) {
      alert('❌ You must be logged in to use this feature.\n\nPlease sign in and try again.');
      return;
    }

    // Get ALL skipped villages (regardless of reason)
    try {
      const supabaseUrl = `https://${projectId}.supabase.co/rest/v1/retirement_villages`;
      
      console.log('🔍 Fetching ALL skipped villages...');
      console.log('🔑 Using access token:', accessToken ? 'Present ✅' : 'Missing ❌');
      
      const response = await fetch(
        `${supabaseUrl}?select=id,name,website,scraped_data&state=eq.VIC&website=not.is.null&scraped_data=not.is.null`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': publicAnonKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch villages');
      }

      const allVillages = await response.json();
      
      // Filter for ANY problematic villages (autoSkipped, failed, no_data)
      const skippedVillages = allVillages.filter((v: any) => 
        v.scraped_data?.autoSkipped === true || 
        v.scraped_data?.status === 'failed' || 
        v.scraped_data?.status === 'no_data' ||
        v.scraped_data?.status === 'skipped'
      );

      console.log(`📊 Found ${skippedVillages.length} TOTAL skipped villages`);
      
      // Also log what reasons they have
      const reasonCounts: Record<string, number> = {};
      skippedVillages.forEach((v: any) => {
        const reason = v.scraped_data?.notes || v.scraped_data?.reason || 'unknown';
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
      });
      console.log('📋 Skip reasons:', reasonCounts);

      if (skippedVillages.length === 0) {
        alert('✅ No villages are currently marked as skipped!');
        return;
      }

      // Show reasons in confirmation
      const reasonSummary = Object.entries(reasonCounts)
        .map(([reason, count]) => `  • ${count}x: ${reason}`)
        .join('\\n');

      if (!confirm(`🔄 This will RESCRAPE ${skippedVillages.length} villages that were previously skipped.\\n\\nReasons:\\n${reasonSummary}\\n\\nParked domain check is now DISABLED.\\n\\nContinue?`)) {
        return;
      }

      setLoading(true);
      setResults(null);

      const villageIds = skippedVillages.map((v: any) => v.id);
      
      console.log(`🚀 Rescraping ${villageIds.length} previously-parked villages...`);
      
      // Process one at a time with 3-second delays
      const BATCH_SIZE = 1;
      const batches: string[][] = [];
      
      for (let i = 0; i < villageIds.length; i += BATCH_SIZE) {
        batches.push(villageIds.slice(i, i + BATCH_SIZE));
      }
      
      console.log(`📦 Split into ${batches.length} batches of ${BATCH_SIZE} village each`);
      
      let totalSuccess = 0;
      let totalFailed = 0;
      let totalSkipped = 0;
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`\n🔄 Processing batch ${i + 1}/${batches.length}...`);
        
        const scrapeResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/data-enrichment/scrape-village-data`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken || publicAnonKey}`,
              'apikey': publicAnonKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              villageIds: batch,
              forceRescrape: true  // Force rescrape even though they have data
            }),
          }
        );

        if (scrapeResponse.ok) {
          const batchResults = await scrapeResponse.json();
          const success = batchResults.results?.filter((r: any) => r.status === 'success').length || 0;
          const failed = batchResults.results?.filter((r: any) => r.status === 'failed').length || 0;
          const skipped = batchResults.results?.filter((r: any) => r.status === 'skipped').length || 0;
          
          totalSuccess += success;
          totalFailed += failed;
          totalSkipped += skipped;
          
          console.log(`  ✅ Batch complete: ${success} success, ${failed} failed, ${skipped} skipped`);
        } else {
          // Log the actual error response
          const errorBody = await scrapeResponse.text();
          console.error(`  ❌ Batch ${i + 1} failed (${scrapeResponse.status}): ${errorBody}`);
          
          // Check for invalid JWT
          if (errorBody.includes('Invalid JWT') || errorBody.includes('jwt')) {
            throw new Error('🔐 Your session has expired!\\n\\nPlease SIGN OUT and SIGN BACK IN to refresh your authentication token.\\n\\nThen try again.');
          }
          
          totalFailed += batch.length;
        }
        
        // 3-second delay between batches
        if (i < batches.length - 1) {
          console.log('⏳ Waiting 3 seconds before next batch...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
      
      const finalResults = {
        success: true,
        summary: {
          total: villageIds.length,
          batches: batches.length,
          successful: totalSuccess,
          failed: totalFailed,
          skipped: totalSkipped
        }
      };
      
      console.log('✅ RESCRAPING COMPLETE:', finalResults.summary);

      setResults(finalResults);
      
      alert(`✅ Rescraping complete!\\n\\nTotal: ${finalResults.summary.total}\\nSuccess: ${finalResults.summary.successful}\\nFailed: ${finalResults.summary.failed}\\nSkipped: ${finalResults.summary.skipped}`);
      
      // Refresh stats
      fetchStats();
      fetchDetailedBreakdown();
      
    } catch (error) {
      console.error('❌ Error:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-2">Simple Village Scraper</h2>
        <p className="text-muted-foreground">
          One-click scraping using the original working scraper (backend-only, no browser needed)
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total VIC Villages</p>
                <p className="text-2xl font-bold">{stats.totalWithWebsites}</p>
              </div>
              <Database className="size-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scraped</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalScraped}</p>
              </div>
              <CheckCircle className="size-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-2xl font-bold text-orange-600">{stats.totalRemaining}</p>
              </div>
              <XCircle className="size-8 text-orange-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.percentComplete}%</p>
              </div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </Card>
        </div>
      )}

      {/* Progress Bar */}
      {stats && (
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-medium">{stats.totalScraped} / {stats.totalWithWebsites}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${stats.percentComplete}%` }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Detailed Breakdown */}
      {detailedStats && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Detailed Status Breakdown</h3>
            <Button
              onClick={() => {
                fetchStats();
                fetchDetailedBreakdown();
              }}
              variant="outline"
              size="sm"
              disabled={loadingDetailed}
            >
              <RefreshCw className={`size-4 mr-2 ${loadingDetailed ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {loadingDetailed ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900 mb-1">Total with Websites</p>
                  <p className="text-3xl font-bold text-blue-600">{detailedStats.withWebsites}</p>
                </div>

                <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-900 mb-1">Successfully Scraped</p>
                  <p className="text-3xl font-bold text-green-600">{detailedStats.successfullyScraped}</p>
                </div>

                <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-900 mb-1">Failed Scrapes</p>
                  <p className="text-3xl font-bold text-red-600">{detailedStats.failedScrapes}</p>
                </div>

                <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-900 mb-1">Not Yet Attempted</p>
                  <p className="text-3xl font-bold text-orange-600">{detailedStats.notAttempted}</p>
                </div>

                <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-900 mb-1">Skipped</p>
                  <p className="text-3xl font-bold text-gray-600">{detailedStats.skipped}</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-2">What do these statuses mean?</p>
                    <ul className="space-y-1">
                      <li><strong>Successfully Scraped:</strong> Villages with good data from website scraping</li>
                      <li><strong>Failed Scrapes:</strong> Scraping was attempted but encountered errors (can be retried)</li>
                      <li><strong>Not Yet Attempted:</strong> Villages that haven't been scraped yet</li>
                      <li><strong>Skipped:</strong> Villages intentionally skipped (e.g., no valid website content)</li>
                    </ul>
                    <p className="mt-3 font-semibold">
                      📊 Scrapable villages remaining: <span className="text-lg">{detailedStats.failedScrapes + detailedStats.notAttempted}</span>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* NEW: Quick Link to Approve Scraped Data */}
              {detailedStats.successfullyScraped > 0 && (
                <div className="mt-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="size-6 text-green-600" />
                        <h4 className="text-xl font-bold text-green-900">Ready to Transfer Data!</h4>
                      </div>
                      <p className="text-sm text-green-800 mb-3">
                        <strong>{detailedStats.successfullyScraped}</strong> villages have scraped data stored in <code className="px-1.5 py-0.5 bg-green-100 rounded text-xs">scraped_data</code> field (JSONB).
                        <br />
                        This data needs to be transferred to the actual database columns to appear in the Village Matcher.
                      </p>
                      <p className="text-xs text-green-700 mb-4">
                        💡 <strong>What happens when you approve:</strong>
                        <br />
                        • Entry pricing → <code className="px-1 bg-green-100 rounded">entry_price_min/max</code>
                        <br />
                        • Contact phone → <code className="px-1 bg-green-100 rounded">contact_phone</code>
                        <br />
                        • Amenities → <code className="px-1 bg-green-100 rounded">amenities</code> (merged with existing)
                        <br />
                        • Images → <code className="px-1 bg-green-100 rounded">images</code> array
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        // Dispatch custom event to switch tabs and scroll
                        window.dispatchEvent(new CustomEvent('navigateToEnrichment', {
                          detail: { tab: 'vic-import', sectionId: 'data-enrichment-dashboard' }
                        }));
                      }}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 text-base shadow-lg"
                    >
                      <Database className="size-5 mr-2" />
                      Go to Approve Section
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {/* NEW: Update Name & URL Section */}
      <Card className="p-6 bg-indigo-50 border-indigo-200">
        <h3 className="text-lg font-semibold mb-4 text-indigo-900">✏️ Fix Name & URL (Complete Data Correction)</h3>
        <p className="text-sm text-indigo-900 mb-4">
          Update BOTH the village name and URL when the VIC Gov data has the wrong name.
        </p>
        
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Current name in database (e.g., Ave Maria Village - Shepparton)"
            value={oldName}
            onChange={(e) => setOldName(e.target.value)}
            className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          
          <input
            type="text"
            placeholder="Correct name (e.g., Shepparton Independent Living Units)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          
          <input
            type="text"
            placeholder="Correct URL (e.g., https://retirement-living.mercyhealth.com.au/...)"
            value={newUrlForRename}
            onChange={(e) => setNewUrlForRename(e.target.value)}
            className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          
          <Button
            onClick={async () => {
              if (!oldName.trim()) {
                alert('Please enter the current database name');
                return;
              }
              
              if (!newName.trim() && !newUrlForRename.trim()) {
                alert('Please enter at least a new name or new URL');
                return;
              }
              
              // Validate URL if provided
              if (newUrlForRename.trim() && !newUrlForRename.startsWith('http://') && !newUrlForRename.startsWith('https://')) {
                alert('❌ URL must start with http:// or https://');
                return;
              }

              setUpdatingNameAndUrl(true);

              try {
                console.log(`🔍 Searching for village: ${oldName}`);
                
                // Step 1: Search for village by current name
                const searchResponse = await fetch(
                  `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/data-enrichment/search-villages?name=${encodeURIComponent(oldName)}&state=VIC`,
                  {
                    headers: {
                      'Authorization': `Bearer ${accessToken || publicAnonKey}`,
                      'apikey': publicAnonKey,
                    },
                  }
                );

                if (!searchResponse.ok) {
                  const errorData = await searchResponse.json();
                  throw new Error(errorData.error || 'Failed to search for village');
                }

                const searchData = await searchResponse.json();
                const matchingVillages = searchData.villages;
                
                if (matchingVillages.length === 0) {
                  alert(`❌ No villages found matching "${oldName}"`);
                  return;
                }
                
                if (matchingVillages.length > 1) {
                  const villageList = matchingVillages.map((v: any) => `${v.name}`).join('\\n');
                  alert(`⚠️ Multiple villages found (${matchingVillages.length}). Using first match:\\n\\n${villageList}`);
                }

                const village = matchingVillages[0];
                console.log('✅ Found village:', village);
                
                // Step 2: Update name and/or URL
                console.log(`🔧 Updating village...`);
                const updateResponse = await fetch(
                  `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/data-enrichment/update-village-name-and-url`,
                  {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${accessToken || publicAnonKey}`,
                      'apikey': publicAnonKey,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      villageId: village.id,
                      newName: newName.trim() || undefined,
                      newUrl: newUrlForRename.trim() || undefined,
                    }),
                  }
                );
                
                if (!updateResponse.ok) {
                  const errorData = await updateResponse.json();
                  throw new Error(errorData.error || 'Failed to update village');
                }
                
                const updateData = await updateResponse.json();
                console.log('✅ Village updated:', updateData);
                
                // Step 3: Scrape the village
                console.log(`🚀 Scraping ${updateData.village.name}...`);
                const scrapeResponse = await fetch(
                  `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/data-enrichment/scrape-village-data`,
                  {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${accessToken || publicAnonKey}`,
                      'apikey': publicAnonKey,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      villageIds: [village.id],
                      forceRescrape: true
                    }),
                  }
                );

                if (!scrapeResponse.ok) {
                  const errorData = await scrapeResponse.json();
                  throw new Error(`Scrape failed: ${errorData.error || 'Unknown error'}`);
                }

                const scrapeData = await scrapeResponse.json();
                const result = scrapeData.results?.[0];
                
                console.log('✅ Scrape complete:', result);
                
                if (result?.status === 'success') {
                  alert(`✅ SUCCESS!\\n\\nOld Name: ${village.name}\\nNew Name: ${updateData.village.name}\\nOld URL: ${village.website}\\nNew URL: ${updateData.village.website}\\n\\nScraping completed successfully!`);
                  
                  // Clear inputs
                  setOldName('');
                  setNewName('');
                  setNewUrlForRename('');
                  
                  // Refresh stats
                  await fetchStats();
                  await fetchDetailedBreakdown();
                } else if (result?.status === 'skipped') {
                  alert(`⚠️ UPDATED but SCRAPE SKIPPED\\n\\nVillage: ${updateData.village.name}\\nReason: ${result.reason}\\n\\nThe data was updated but scraping was skipped.`);
                } else {
                  alert(`⚠️ UPDATED but SCRAPE FAILED\\n\\nVillage: ${updateData.village.name}\\nReason: ${result?.reason || 'Unknown'}\\n\\nThe data was updated successfully, but scraping encountered an error.`);
                }
                
              } catch (error) {
                console.error('❌ Error:', error);
                alert(`❌ Error: ${error.message}`);
              } finally {
                setUpdatingNameAndUrl(false);
              }
            }}
            disabled={updatingNameAndUrl || !oldName.trim() || (!newName.trim() && !newUrlForRename.trim())}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            size="lg"
          >
            {updatingNameAndUrl ? (
              <>
                <Loader className="size-5 mr-2 animate-spin" />
                Updating & Scraping...
              </>
            ) : (
              <>
                🚀 Update Name & URL, Then Scrape
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* NEW: Fix Village URL Section */}
      <Card className="p-6 bg-purple-50 border-purple-200">
        <h3 className="text-lg font-semibold mb-4 text-purple-900">🔧 Fix & Scrape Village (Manual URL Correction)</h3>
        <p className="text-sm text-purple-900 mb-4">
          Enter the village name and the CORRECT URL, then update and scrape it automatically.
        </p>
        
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Village name (e.g., Mercy Place Shepparton)"
            value={customVillageName}
            onChange={(e) => setCustomVillageName(e.target.value)}
            className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          
          <input
            type="text"
            placeholder="Correct URL (e.g., https://retirement-living.mercyhealth.com.au/...)"
            value={correctUrl}
            onChange={(e) => setCorrectUrl(e.target.value)}
            className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          
          <Button
            onClick={async () => {
              if (!customVillageName.trim()) {
                alert('Please enter a village name');
                return;
              }
              
              if (!correctUrl.trim()) {
                alert('Please enter the correct URL');
                return;
              }
              
              // Validate URL
              if (!correctUrl.startsWith('http://') && !correctUrl.startsWith('https://')) {
                alert('❌ URL must start with http:// or https://');
                return;
              }

              setUpdatingUrl(true);

              try {
                console.log(`🔍 Searching for village: ${customVillageName}`);
                
                // Step 1: Search for village by name
                const searchResponse = await fetch(
                  `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/data-enrichment/search-villages?name=${encodeURIComponent(customVillageName)}&state=VIC`,
                  {
                    headers: {
                      'Authorization': `Bearer ${accessToken || publicAnonKey}`,
                      'apikey': publicAnonKey,
                    },
                  }
                );

                if (!searchResponse.ok) {
                  const errorData = await searchResponse.json();
                  throw new Error(errorData.error || 'Failed to search for village');
                }

                const searchData = await searchResponse.json();
                const matchingVillages = searchData.villages;
                
                if (matchingVillages.length === 0) {
                  alert(`❌ No villages found matching "${customVillageName}"`);
                  return;
                }
                
                if (matchingVillages.length > 1) {
                  const villageList = matchingVillages.map((v: any) => `${v.name}`).join('\\n');
                  alert(`⚠️ Multiple villages found (${matchingVillages.length}). Using first match:\\n\\n${villageList}`);
                }

                const village = matchingVillages[0];
                console.log('✅ Found village:', village);
                
                // Step 2: Update URL
                console.log(`🔧 Updating ${village.name} URL to: ${correctUrl}`);
                const updateResponse = await fetch(
                  `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/data-enrichment/update-village-url`,
                  {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${accessToken || publicAnonKey}`,
                      'apikey': publicAnonKey,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      villageId: village.id,
                      newUrl: correctUrl,
                    }),
                  }
                );
                
                if (!updateResponse.ok) {
                  const errorData = await updateResponse.json();
                  throw new Error(errorData.error || 'Failed to update URL');
                }
                
                const updateData = await updateResponse.json();
                console.log('✅ URL updated:', updateData);
                
                // Step 3: Scrape the village
                console.log(`🚀 Scraping ${village.name}...`);
                const scrapeResponse = await fetch(
                  `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/data-enrichment/scrape-village-data`,
                  {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${accessToken || publicAnonKey}`,
                      'apikey': publicAnonKey,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      villageIds: [village.id],
                      forceRescrape: true
                    }),
                  }
                );

                if (!scrapeResponse.ok) {
                  const errorData = await scrapeResponse.json();
                  throw new Error(`Scrape failed: ${errorData.error || 'Unknown error'}`);
                }

                const scrapeData = await scrapeResponse.json();
                const result = scrapeData.results?.[0];
                
                console.log('✅ Scrape complete:', result);
                
                if (result?.status === 'success') {
                  alert(`✅ SUCCESS!\\n\\nVillage: ${village.name}\\nOld URL: ${village.website}\\nNew URL: ${correctUrl}\\n\\nScraping completed successfully!`);
                  
                  // Clear inputs
                  setCustomVillageName('');
                  setCorrectUrl('');
                  
                  // Refresh stats
                  await fetchStats();
                  await fetchDetailedBreakdown();
                } else if (result?.status === 'skipped') {
                  alert(`⚠️ URL UPDATED but SCRAPE SKIPPED\\n\\nVillage: ${village.name}\\nReason: ${result.reason}\\n\\nThe URL was updated but scraping was skipped.`);
                } else {
                  alert(`⚠️ URL UPDATED but SCRAPE FAILED\\n\\nVillage: ${village.name}\\nReason: ${result?.reason || 'Unknown'}\\n\\nThe URL was updated successfully, but scraping encountered an error.`);
                }
                
              } catch (error) {
                console.error('❌ Error:', error);
                alert(`❌ Error: ${error.message}`);
              } finally {
                setUpdatingUrl(false);
              }
            }}
            disabled={updatingUrl || !customVillageName.trim() || !correctUrl.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            size="lg"
          >
            {updatingUrl ? (
              <>
                <Loader className="size-5 mr-2 animate-spin" />
                Updating & Scraping...
              </>
            ) : (
              <>
                🚀 Update URL & Scrape Village
              </>
            )}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Scrape Specific Village (Test Parked Domains)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Enter a village name to test scraping with the new redirect-following logic.
        </p>
        
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Enter village name..."
            value={customVillageName}
            onChange={(e) => setCustomVillageName(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            onClick={async () => {
              if (!customVillageName.trim()) {
                alert('Please enter a village name');
                return;
              }

              setLoading(true);
              setResults(null);

              try {
                console.log(`🔍 Searching for village: ${customVillageName}`);
                
                // Search for village by name
                const supabaseUrl = `https://${projectId}.supabase.co/rest/v1/retirement_villages`;
                const searchResponse = await fetch(
                  `${supabaseUrl}?select=id,name,website&state=eq.VIC&name=ilike.%${customVillageName}%&website=not.is.null`,
                  {
                    headers: {
                      'Authorization': `Bearer ${accessToken || publicAnonKey}`,
                      'apikey': publicAnonKey,
                    },
                  }
                );

                if (!searchResponse.ok) {
                  throw new Error('Failed to search for village');
                }

                const matchingVillages = await searchResponse.json();
                
                if (matchingVillages.length === 0) {
                  alert(`❌ No villages found matching "${customVillageName}"`);
                  setLoading(false);
                  return;
                }
                
                if (matchingVillages.length > 1) {
                  const villageList = matchingVillages.map((v: any) => v.name).join('\n');
                  alert(`⚠️ Multiple villages found (${matchingVillages.length}). Using first match:\n\n${villageList}`);
                }

                const targetVillage = matchingVillages[0];
                console.log('✅ Found village:', targetVillage);
                alert(`🚀 Starting scrape for: ${targetVillage.name}\n\nThis will use JS rendering to follow redirects.`);

                // Try to scrape it with forceRescrape
                const scrapeResponse = await fetch(
                  `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/data-enrichment/scrape-village-data`,
                  {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${accessToken || publicAnonKey}`,
                      'apikey': publicAnonKey,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      villageIds: [targetVillage.id],
                      forceRescrape: true
                    }),
                  }
                );

                if (!scrapeResponse.ok) {
                  const errorData = await scrapeResponse.json();
                  console.error('❌ Scrape failed:', errorData);
                  alert(`❌ Scrape failed:\n\n${JSON.stringify(errorData, null, 2)}`);
                } else {
                  const scrapeData = await scrapeResponse.json();
                  console.log('✅ Scrape complete:', scrapeData);
                  
                  const result = scrapeData.results?.[0];
                  if (result?.status === 'success') {
                    alert(`✅ Success!\n\nVillage: ${targetVillage.name}\nStatus: ${result.status}\n\nCheck console for details.`);
                  } else if (result?.status === 'skipped') {
                    alert(`⚠️ Skipped\n\nVillage: ${targetVillage.name}\nReason: ${result.reason}\n\nThe scraper still detected a parked domain. Check console logs.`);
                  } else {
                    alert(`❌ Failed\n\nVillage: ${targetVillage.name}\nReason: ${result?.reason || 'Unknown'}`);
                  }
                  
                  // Refresh stats
                  await fetchStats();
                  await fetchDetailedBreakdown();
                }
              } catch (error) {
                console.error('❌ Error:', error);
                alert(`❌ Error: ${error.message}`);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading || !customVillageName.trim()}
            size="lg"
          >
            {loading ? (
              <>
                <Loader className="size-5 mr-2 animate-spin" />
                Scraping...
              </>
            ) : (
              <>
                🔍 Scrape This Village
              </>
            )}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Scrape All Remaining Villages</h3>
        <p className="text-sm text-muted-foreground mb-4">
          This will use the original backend scraper to process all {stats?.totalRemaining || 0} remaining Victorian villages.
          The scraper runs server-side, so you can close your browser after starting.
        </p>

        {/* Warning about old batch */}
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-900">
              <p className="font-semibold mb-1">⚠️ Old Batch Scraper Issue</p>
              <p className="mb-3">
                If the scraper fails with "Error: Scraping failed", it's because the old batch scraper 
                is still paused/running. Clear it first using the button below.
              </p>
              <Button
                onClick={clearOldBatch}
                disabled={clearingBatch}
                variant="outline"
                size="sm"
                className="border-yellow-300 hover:bg-yellow-100"
              >
                {clearingBatch ? (
                  <>
                    <Loader className="size-4 mr-2 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    🗑️ Clear Old Batch Scraper State
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 mb-4">
          <Button
            onClick={testSingleVillage}
            disabled={loading}
            variant="outline"
            size="lg"
          >
            {loading ? (
              <>
                <Loader className="size-5 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                🧪 Test Single Village (Debug)
              </>
            )}
          </Button>
          
          <Button
            onClick={scrapeAllRemaining}
            disabled={loading || !stats || stats.totalRemaining === 0}
            className="flex items-center gap-2 flex-1"
            size="lg"
          >
            {loading ? (
              <>
                <Loader className="size-5 animate-spin" />
                Scraping {stats?.totalRemaining || 0} villages...
              </>
            ) : (
              <>
                <Play className="size-5" />
                Scrape All {stats?.totalRemaining || 0} Remaining VIC Villages
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* NEW: Rescrape Parked Domains */}
      <Card className="p-6 bg-emerald-50 border-emerald-200">
        <h3 className="text-lg font-semibold mb-4 text-emerald-900">🔄 Rescrape Previously-Skipped "Parked Domains"</h3>
        <p className="text-sm text-emerald-900 mb-4">
          The parked domain check has been <strong>DISABLED</strong>. Click below to automatically rescrape all {detailedStats?.skipped || 0} villages 
          that were previously skipped due to "parked domain" detection.
        </p>
        
        <div className="mb-4 p-4 bg-emerald-100 border border-emerald-300 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-emerald-700 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-900">
              <p className="font-semibold mb-1">✅ What changed?</p>
              <ul className="space-y-1">
                <li>• Parked domain detection is now <strong>completely disabled</strong></li>
                <li>• Villages with operator pages or general retirement sites will now scrape</li>
                <li>• Some data is better than no data for prototype purposes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* DEBUG BUTTON */}
        <div className="mb-4">
          <Button
            onClick={async () => {
              try {
                const supabaseUrl = `https://${projectId}.supabase.co/rest/v1/retirement_villages`;
                const response = await fetch(
                  `${supabaseUrl}?select=id,name,website,scraped_data&state=eq.VIC&website=not.is.null`,
                  {
                    headers: {
                      'Authorization': `Bearer ${publicAnonKey}`,
                      'apikey': publicAnonKey,
                    },
                  }
                );
                
                const villages = await response.json();
                
                // Analyze ALL error types
                const errorTypes: Record<string, number> = {};
                const errorExamples: Record<string, any> = {};
                const failedVillages = villages.filter((v: any) => v.scraped_data);
                
                failedVillages.forEach((v: any) => {
                  const data = v.scraped_data;
                  let errorKey = 'unknown';
                  
                  if (data.autoSkipped) {
                    errorKey = 'autoSkipped';
                  } else if (data.error) {
                    errorKey = data.error.substring(0, 50); // First 50 chars
                  } else if (data.status) {
                    errorKey = `status: ${data.status}`;
                  }
                  
                  errorTypes[errorKey] = (errorTypes[errorKey] || 0) + 1;
                  if (!errorExamples[errorKey]) {
                    errorExamples[errorKey] = { name: v.name, scraped_data: data };
                  }
                });
                
                console.log('🔍 ALL ERROR TYPES:', errorTypes);
                console.log('📋 ERROR EXAMPLES:', errorExamples);
                
                const summary = Object.entries(errorTypes)
                  .map(([type, count]) => `${count}x: ${type}`)
                  .join('\n');
                
                alert(`📊 Error Type Breakdown:\n\n${summary}\n\nCheck console for examples!`);
              } catch (error) {
                console.error('Debug error:', error);
                alert(`Error: ${error.message}`);
              }
            }}
            variant="outline"
            size="sm"
            className="border-blue-300 hover:bg-blue-100"
          >
            🔍 Debug: Show ALL Error Types
          </Button>
        </div>

        <Button
          onClick={rescrapeParkedDomains}
          disabled={loading || !detailedStats || detailedStats.skipped === 0}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
          size="lg"
        >
          {loading ? (
            <>
              <Loader className="size-5 animate-spin" />
              Rescraping {detailedStats?.skipped || 0} villages...
            </>
          ) : (
            <>
              <RefreshCw className="size-5" />
              Rescrape All {detailedStats?.skipped || 0} Failed/Problematic Villages
            </>
          )}
        </Button>
      </Card>

      {/* Results */}
      {results && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Scraping Results</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckCircle className="size-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Success</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {results.results?.filter((r: any) => r.status === 'success').length || 0}
              </p>
            </div>

            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-1">
                <XCircle className="size-4 text-red-600" />
                <span className="text-sm font-medium text-red-900">Failed</span>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {results.results?.filter((r: any) => r.status === 'failed').length || 0}
              </p>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-1">
                <XCircle className="size-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Skipped</span>
              </div>
              <p className="text-2xl font-bold text-gray-600">
                {results.results?.filter((r: any) => r.status === 'skipped').length || 0}
              </p>
            </div>
          </div>

          <Button
            onClick={fetchStats}
            variant="outline"
            size="sm"
          >
            Refresh Stats
          </Button>
        </Card>
      )}
    </div>
  );
}