// Batch Scraping System for RetirePath - Production-ready village data enrichment
// Handles batch processing of 2500+ villages with rate limiting, error handling, and progress tracking
// Last updated: 2026-01-11 - FIXED: DB FILTER IN START ENDPOINT (scraped_data IS NULL)

import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js@2';

const app = new Hono();

console.log('✅ Batch scraping module loaded');

// Initialize Supabase client with service role
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

// Batch processing state (stored in memory during processing, persisted to KV store)
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
  filterState?: string; // NEW: Track which state filter was used for this batch
  retryCount?: Record<string, number>; // NEW: Track retry count per village ID
}

let currentBatch: BatchState | null = null;

// Skip list to prevent retrying failed villages in the current session
// Now persisted to KV store instead of just in-memory
let skipVillageIds: Set<string> = new Set();

// Maximum retries before auto-skipping a village (INCREASED FROM 1 TO 3)
const MAX_RETRIES = 3;

/**
 * Load skip list from KV store
 */
async function loadSkipList(): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('kv_store_3bba8be8')
    .select('value')
    .eq('key', 'batch_scraping_skip_list')
    .single();
  
  if (data?.value && Array.isArray(data.value)) {
    skipVillageIds = new Set(data.value);
    console.log(`📋 Loaded skip list: ${skipVillageIds.size} villages`);
  }
}

/**
 * Save skip list to KV store
 */
async function saveSkipList(): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase
    .from('kv_store_3bba8be8')
    .upsert({ 
      key: 'batch_scraping_skip_list', 
      value: Array.from(skipVillageIds) 
    });
}

/**
 * GET /batch-scraping/status
 * Get current batch scraping status
 */
app.get('/make-server-3bba8be8/batch-scraping/status', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Verify admin authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Load current batch from KV store to ensure we have the latest state
    if (!currentBatch) {
      const { data: kvData } = await supabase
        .from('kv_store_3bba8be8')
        .select('value')
        .eq('key', 'batch_scraping_state')
        .single();
      
      if (kvData?.value) {
        currentBatch = kvData.value as BatchState;
      }
    }
    
    return c.json({
      batch: currentBatch || {
        status: 'idle',
        totalVillages: 0,
        processedVillages: 0,
        successCount: 0,
        failedCount: 0,
        skippedCount: 0
      }
    });
    
  } catch (error) {
    console.error('Error fetching batch status:', error);
    return c.json({ error: 'Failed to fetch status', details: error.message }, 500);
  }
});

/**
 * POST /batch-scraping/start
 * Start batch scraping process
 * Body: { batchSize?: number, delayBetweenRequests?: number, filterState?: string }
 */
app.post('/make-server-3bba8be8/batch-scraping/start', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Verify admin authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Load existing batch from KV if it exists
    const { data: kvData } = await supabase
      .from('kv_store_3bba8be8')
      .select('value')
      .eq('key', 'batch_scraping_state')
      .single();
    
    const existingBatch = kvData?.value as BatchState | null;
    
    // If there's an existing paused or running batch, resume it
    if (existingBatch && (existingBatch.status === 'paused' || existingBatch.status === 'running')) {
      console.log(`🔄 Resuming existing batch: ${existingBatch.batchId}`);
      console.log(`   Progress: ${existingBatch.processedVillages}/${existingBatch.totalVillages}`);
      
      // Update status to running
      existingBatch.status = 'running';
      currentBatch = existingBatch;
      
      // Load skip list
      await loadSkipList();
      
      // Save resumed state
      await supabase
        .from('kv_store_3bba8be8')
        .upsert({ 
          key: 'batch_scraping_state', 
          value: currentBatch 
        });
      
      return c.json({
        message: 'Batch scraping resumed',
        batch: currentBatch,
        resumed: true
      });
    }
    
    // Check if there's an active batch in memory
    if (currentBatch && currentBatch.status === 'running') {
      console.log('⚠️  In-memory batch is running:', currentBatch.batchId);
      return c.json({ 
        error: 'Batch already running', 
        batch: currentBatch 
      }, 409);
    }
    
    const { batchSize = 50, delayBetweenRequests = 2000, filterState } = await c.req.json();
    
    // SIMPLIFIED APPROACH: Get villages in TWO separate queries and combine
    // Query 1: Villages with NO scraped_data (never tried)
    let query1 = supabase
      .from('retirement_villages')
      .select('id, name, website, state, scraped_data')
      .not('website', 'is', null)
      .is('scraped_data', null)
      .order('state')
      .order('name');
    
    if (filterState) {
      query1 = query1.eq('state', filterState);
    }
    
    const { data: neverTried, error: error1 } = await query1;
    
    // Query 2: Villages with failed status (tried but failed)
    let query2 = supabase
      .from('retirement_villages')
      .select('id, name, website, state, scraped_data')
      .not('website', 'is', null)
      .not('scraped_data', 'is', null)
      .order('state')
      .order('name');
    
    if (filterState) {
      query2 = query2.eq('state', filterState);
    }
    
    const { data: withData, error: error2 } = await query2;
    
    if (error1 || error2) {
      console.error('Error fetching villages:', error1 || error2);
      return c.json({ error: 'Failed to fetch villages', details: (error1 || error2).message }, 500);
    }
    
    // Filter in memory for failed status
    const failed = withData?.filter(v => 
      v.scraped_data?.status === 'failed'
    ) || [];
    
    // Combine
    const villages = [...(neverTried || []), ...failed];
    
    console.log(`📊 Query returned ${villages?.length || 0} villages that need scraping`);
    console.log(`   - ${neverTried?.length || 0} never tried`);
    console.log(`   - ${failed.length} previously failed`);
    
    if (!villages || villages.length === 0) {
      return c.json({ 
        message: 'No villages need scraping',
        batch: {
          status: 'completed',
          totalVillages: 0,
          processedVillages: 0
        }
      });
    }
    
    // Initialize batch state
    const batchId = `batch_${Date.now()}`;
    
    // FORCE CLEAR skip list for fresh batch
    skipVillageIds = new Set();
    console.log(`🧹 FORCE CLEARED skip list - size is now: ${skipVillageIds.size} (should be 0)`);
    
    // Delete the skip list from KV completely
    await supabase
      .from('kv_store_3bba8be8')
      .delete()
      .eq('key', 'batch_scraping_skip_list');
    
    console.log(`🗑️  Deleted skip list from KV store`);
    
    currentBatch = {
      batchId,
      status: 'running',
      totalVillages: villages.length,
      processedVillages: 0,
      successCount: 0,
      failedCount: 0,
      skippedCount: 0,
      currentVillageId: null,
      startedAt: new Date().toISOString(),
      completedAt: null,
      lastError: null,
      errors: [],
      filterState: filterState || undefined  // NEW: Track filter state
    };
    
    // Save initial state to KV store
    await supabase
      .from('kv_store_3bba8be8')
      .upsert({ 
        key: 'batch_scraping_state', 
        value: currentBatch 
      });
    
    console.log(`🚀 Starting batch scraping: ${villages.length} villages (Batch ID: ${batchId})`);
    console.log(`📋 Using poll-based processing - frontend will call /process-next repeatedly`);
    
    return c.json({
      message: 'Batch scraping started',
      batch: currentBatch
    });
    
  } catch (error) {
    console.error('Error starting batch:', error);
    return c.json({ error: 'Failed to start batch', details: error.message }, 500);
  }
});

/**
 * POST /batch-scraping/pause
 * Pause current batch scraping
 */
app.post('/make-server-3bba8be8/batch-scraping/pause', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Verify admin authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Load current batch from KV if not in memory
    if (!currentBatch) {
      const { data: kvData } = await supabase
        .from('kv_store_3bba8be8')
        .select('value')
        .eq('key', 'batch_scraping_state')
        .single();
      
      if (kvData?.value) {
        currentBatch = kvData.value as BatchState;
      }
    }
    
    if (!currentBatch || currentBatch.status !== 'running') {
      return c.json({ error: 'No batch currently running' }, 400);
    }
    
    currentBatch.status = 'paused';
    
    // Save state
    await supabase
      .from('kv_store_3bba8be8')
      .upsert({ 
        key: 'batch_scraping_state', 
        value: currentBatch 
      });
    
    console.log(`⏸️  Batch scraping paused: ${currentBatch.batchId}`);
    
    return c.json({
      message: 'Batch scraping paused',
      batch: currentBatch
    });
    
  } catch (error) {
    console.error('Error pausing batch:', error);
    return c.json({ error: 'Failed to pause batch', details: error.message }, 500);
  }
});

/**
 * Background processing function
 * Processes villages one by one with rate limiting
 */
async function processBatchInBackground(
  villages: any[], 
  delayBetweenRequests: number,
  accessToken: string
) {
  const supabase = getSupabaseAdmin();
  
  console.log(`🚀 processBatchInBackground started with ${villages.length} villages`);
  console.log(`🔑 Access token: ${accessToken ? 'Present' : 'Missing'}`);
  console.log(`⏱️  Delay between requests: ${delayBetweenRequests}ms`);
  
  for (const village of villages) {
    // Check if batch was paused
    if (currentBatch?.status === 'paused') {
      console.log(`⏸️  Batch paused at village: ${village.name}`);
      break;
    }
    
    try {
      currentBatch!.currentVillageId = village.id;
      
      console.log(`🔍 [${currentBatch!.processedVillages + 1}/${currentBatch!.totalVillages}] Scraping: ${village.name} (${village.state})`);
      
      // Call the existing scrape endpoint
      const response = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/make-server-3bba8be8/data-enrichment/scrape-village-data`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            villageIds: [village.id],
            forceRescrape: false
          })
        }
      );
      
      const result = await response.json();
      
      if (response.ok && result.results && result.results.length > 0) {
        const villageResult = result.results[0];
        
        if (villageResult.status === 'success') {
          currentBatch!.successCount++;
          console.log(`  ✅ Success: ${villageResult.fieldsFound || 0} fields found`);
        } else if (villageResult.status === 'skipped') {
          currentBatch!.skippedCount++;
          console.log(`  ⏭️  Skipped: ${villageResult.reason || 'Unknown reason'}`);
        } else {
          currentBatch!.failedCount++;
          const errorMsg = villageResult.error || villageResult.reason || 'Unknown error';
          currentBatch!.errors.push({
            villageId: village.id,
            error: errorMsg,
            timestamp: new Date().toISOString()
          });
          console.log(`  ❌ Failed: ${errorMsg}`);
          
          // DON'T mark as attempted in database - let it be retried in future batches
          // Just track in skip list for this session
        }
      } else {
        currentBatch!.failedCount++;
        const errorMsg = result.error || 'Scraping endpoint returned error';
        currentBatch!.errors.push({
          villageId: village.id,
          error: errorMsg,
          timestamp: new Date().toISOString()
        });
        console.log(`  ❌ Failed: ${errorMsg}`);
        
        // DON'T mark as attempted in database - let it be retried in future batches
        // Just track in skip list for this session
      }
    } catch (error) {
      currentBatch!.failedCount++;
      const errorMsg = error?.message || error?.toString() || 'Unknown error during scraping';
      currentBatch!.errors.push({
        villageId: village.id,
        error: `${village.name}: ${errorMsg}`,
        timestamp: new Date().toISOString()
      });
      currentBatch!.lastError = errorMsg;
      console.error(`  ❌ Error scraping ${village.name}:`, error);
      console.error(`  ❌ Error details:`, JSON.stringify(error, null, 2));
      
      // DON'T mark as attempted in database - let it be retried in future batches
      // Just track in skip list for this session
    }
    
    currentBatch!.processedVillages++;
    currentBatch!.currentVillageId = null;
    
    // Add to skip list to prevent retrying
    skipVillageIds.add(village.id);
    console.log(`  📝 Added village to skip list (total: ${skipVillageIds.size})`);
    console.log(`  🔍 Skip list now contains: ${Array.from(skipVillageIds).slice(0, 5).join(', ')}${skipVillageIds.size > 5 ? '...' : ''}`);
    
    // Save progress every 5 villages
    if (currentBatch!.processedVillages % 5 === 0) {
      await supabase
        .from('kv_store_3bba8be8')
        .upsert({ 
          key: 'batch_scraping_state', 
          value: currentBatch 
        });
      
      console.log(`📊 Progress: ${currentBatch!.processedVillages}/${currentBatch!.totalVillages} (${Math.round(currentBatch!.processedVillages / currentBatch!.totalVillages * 100)}%)`);
    }
    
    // Rate limiting delay between requests
    if (currentBatch!.processedVillages < currentBatch!.totalVillages) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
    }
  }
  
  // Mark as completed
  if (currentBatch && currentBatch.status !== 'paused') {
    currentBatch.status = 'completed';
    currentBatch.completedAt = new Date().toISOString();
    
    await supabase
      .from('kv_store_3bba8be8')
      .upsert({ 
        key: 'batch_scraping_state', 
        value: currentBatch 
      });
    
    console.log(`✅ Batch scraping completed: ${currentBatch.successCount} succeeded, ${currentBatch.failedCount} failed, ${currentBatch.skippedCount} skipped`);
  }
}

/**
 * POST /batch-scraping/process-next
 * Get the next village to scrape (frontend will call the scraping endpoint)
 */
app.post('/make-server-3bba8be8/batch-scraping/process-next', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Verify admin authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Load current batch state from KV
    if (!currentBatch) {
      const { data: kvData } = await supabase
        .from('kv_store_3bba8be8')
        .select('value')
        .eq('key', 'batch_scraping_state')
        .single();
      
      if (kvData?.value) {
        currentBatch = kvData.value as BatchState;
      }
    }
    
    if (!currentBatch || currentBatch.status !== 'running') {
      return c.json({ error: 'No active batch', batch: currentBatch }, 400);
    }
    
    // Check if batch is already complete based on totalVillages
    if (currentBatch.processedVillages >= currentBatch.totalVillages) {
      console.log(`✅ Batch already completed: ${currentBatch.processedVillages}/${currentBatch.totalVillages}`);
      currentBatch.status = 'completed';
      currentBatch.completedAt = new Date().toISOString();
      
      await supabase
        .from('kv_store_3bba8be8')
        .upsert({ key: 'batch_scraping_state', value: currentBatch });
      
      return c.json({ 
        message: 'Batch completed', 
        batch: currentBatch,
        done: true
      });
    }
    
    // SIMPLIFIED APPROACH: Get villages in TWO separate queries and combine
    // Query 1: Villages with NO scraped_data (never tried)
    let query1 = supabase
      .from('retirement_villages')
      .select('id, name, website, state, scraped_data')
      .not('website', 'is', null)
      .is('scraped_data', null)
      .order('state')
      .order('name');
    
    if (currentBatch.filterState) {
      query1 = query1.eq('state', currentBatch.filterState);
    }
    
    const { data: neverTried, error: error1 } = await query1;
    
    // Query 2: Villages with failed status (tried but failed)
    let query2 = supabase
      .from('retirement_villages')
      .select('id, name, website, state, scraped_data')
      .not('website', 'is', null)
      .not('scraped_data', 'is', null)
      .order('state')
      .order('name');
    
    if (currentBatch.filterState) {
      query2 = query2.eq('state', currentBatch.filterState);
    }
    
    const { data: withData, error: error2 } = await query2;
    
    if (error1 || error2) {
      console.error('Error fetching next village:', error1 || error2);
      return c.json({ error: 'Failed to fetch village', details: (error1 || error2).message }, 500);
    }
    
    // Filter in memory for failed status
    const failed = withData?.filter(v => 
      v.scraped_data?.status === 'failed'
    ) || [];
    
    // Combine
    const villages = [...(neverTried || []), ...failed];
    
    if (!villages || villages.length === 0) {
      // No more villages - mark as completed
      console.log(`✅ No more villages to scrape - marking batch as completed`);
      currentBatch.status = 'completed';
      currentBatch.completedAt = new Date().toISOString();
      
      await supabase
        .from('kv_store_3bba8be8')
        .upsert({ key: 'batch_scraping_state', value: currentBatch });
      
      return c.json({ 
        message: 'Batch completed', 
        batch: currentBatch,
        done: true
      });
    }
    
    // Load skip list from KV if not in memory
    if (skipVillageIds.size === 0) {
      await loadSkipList();
    }
    
    // Filter to villages not in skip list
    const village = villages.find(v => !skipVillageIds.has(v.id));
    
    if (!village) {
      console.log('⚠️  All fetched villages are in skip list, completing batch');
      currentBatch.status = 'completed';
      currentBatch.completedAt = new Date().toISOString();
      
      await supabase
        .from('kv_store_3bba8be8')
        .upsert({ key: 'batch_scraping_state', value: currentBatch });
      
      return c.json({ 
        message: 'Batch completed', 
        batch: currentBatch,
        done: true
      });
    }
    
    // Return the village for the FRONTEND to scrape
    console.log(`📤 Returning village for frontend to scrape: ${village.name} (${village.state})`);
    console.log(`  📍 Village ID: ${village.id}`);
    console.log(`  🌐 Website: ${village.website}`);
    
    return c.json({ 
      done: false,
      village: {
        id: village.id,
        name: village.name,
        website: village.website,
        state: village.state
      },
      batch: currentBatch
    });
    
  } catch (error) {
    console.error('Error getting next village:', error);
    return c.json({ error: 'Failed to get next village', details: error.message }, 500);
  }
});

/**
 * POST /batch-scraping/record-result
 * Record the result of a village scraping (called by frontend after scraping)
 * Body: { villageId: string, status: 'success' | 'skipped' | 'failed', reason?: string, fieldsFound?: number }
 */
app.post('/make-server-3bba8be8/batch-scraping/record-result', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Verify admin authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { villageId, status, reason, fieldsFound, error: scrapingError } = await c.req.json();
    
    // Load current batch from KV if not in memory
    if (!currentBatch) {
      const { data: kvData } = await supabase
        .from('kv_store_3bba8be8')
        .select('value')
        .eq('key', 'batch_scraping_state')
        .single();
      
      if (kvData?.value) {
        currentBatch = kvData.value as BatchState;
      }
    }
    
    if (!currentBatch) {
      return c.json({ error: 'No active batch' }, 400);
    }
    
    // Initialize retryCount if it doesn't exist
    if (!currentBatch.retryCount) {
      currentBatch.retryCount = {};
    }
    
    // Update counts based on result
    if (status === 'success') {
      currentBatch.successCount++;
      console.log(`  ✅ Success: ${fieldsFound || 0} fields found`);
      
      // CRITICAL FIX: Mark village as successfully scraped in database
      await supabase
        .from('retirement_villages')
        .update({ 
          scraped_data: { 
            status: 'success', 
            fieldsFound: fieldsFound || 0,
            timestamp: new Date().toISOString(),
            lastScrapedAt: new Date().toISOString()
          } 
        })
        .eq('id', villageId);
      
      console.log(`  💾 Marked village as successfully scraped in database`);
      
    } else if (status === 'skipped') {
      currentBatch.skippedCount++;
      console.log(`  ⏭️  Skipped: ${reason || 'Unknown reason'}`)  ;
      
      // Mark as skipped in database
      await supabase
        .from('retirement_villages')
        .update({ 
          scraped_data: { 
            status: 'skipped', 
            reason: reason || 'Unknown reason',
            timestamp: new Date().toISOString()
          } 
        })
        .eq('id', villageId);
      
    } else {
      // Failed - check retry count
      currentBatch.failedCount++;
      const errorMsg = scrapingError || reason || 'Unknown error';
      
      // Increment retry count for this village
      currentBatch.retryCount[villageId] = (currentBatch.retryCount[villageId] || 0) + 1;
      const retries = currentBatch.retryCount[villageId];
      
      console.log(`  ❌ Failed (Attempt ${retries}/${MAX_RETRIES}): ${errorMsg}`);
      
      // If max retries exceeded, AUTO-SKIP this village
      if (retries >= MAX_RETRIES) {
        console.log(`  🚫 MAX RETRIES EXCEEDED - Auto-skipping village ${villageId}`);
        
        // Add to skip list
        skipVillageIds.add(villageId);
        await saveSkipList();
        
        // Mark as failed in database
        await supabase
          .from('retirement_villages')
          .update({ 
            scraped_data: { 
              status: 'failed', 
              error: `Auto-skipped after ${retries} failed attempts: ${errorMsg}`,
              timestamp: new Date().toISOString(),
              autoSkipped: true
            } 
          })
          .eq('id', villageId);
        
        console.log(`  🏷️  Marked village as auto-skipped in database`);
        currentBatch.skippedCount++;  // Count it as skipped, not failed
      } else {
        // Still have retries left - just log the error
        currentBatch.errors.push({
          villageId,
          error: `${errorMsg} (Attempt ${retries}/${MAX_RETRIES})`,
          timestamp: new Date().toISOString()
        });
        console.log(`  ❌ Will retry - ${MAX_RETRIES - retries} attempts remaining`);
      }
    }
    
    currentBatch.processedVillages++;
    
    // Add to skip list
    skipVillageIds.add(villageId);
    console.log(`  📝 Added village to skip list (total: ${skipVillageIds.size})`);
    
    // Save skip list to KV (persist across Edge Function restarts)
    await saveSkipList();
    
    // Save progress
    await supabase
      .from('kv_store_3bba8be8')
      .upsert({ key: 'batch_scraping_state', value: currentBatch });
    
    console.log(`📊 Progress: ${currentBatch.processedVillages}/${currentBatch.totalVillages} (${Math.round(currentBatch.processedVillages / currentBatch.totalVillages * 100)}%)`);
    
    return c.json({ 
      message: 'Result recorded',
      batch: currentBatch
    });
    
  } catch (error) {
    console.error('Error recording result:', error);
    return c.json({ error: 'Failed to record result', details: error.message }, 500);
  }
});

/**
 * GET /batch-scraping/stats
 * Get overall scraping statistics
 * Query params: ?state=VIC (optional - defaults to all states)
 */
app.get('/make-server-3bba8be8/batch-scraping/stats', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Verify admin authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Get optional state filter from query params
    let filterState = c.req.query('state');
    
    // NO NORMALIZATION NEEDED - database uses abbreviations (VIC, NSW, etc.)
    // Frontend sends abbreviations, database stores abbreviations, so just pass through!
    
    console.log(`📊 STATS REQUEST - filterState: ${filterState || 'ALL STATES'}`);
    
    // Build queries with optional state filter
    let withWebsitesQuery = supabase
      .from('retirement_villages')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')  // CRITICAL FIX: Only count approved villages
      .not('website', 'is', null);
    
    let scrapedQuery = supabase
      .from('retirement_villages')
      .select('id, scraped_data')
      .eq('status', 'approved')  // CRITICAL FIX: Only count approved villages
      .not('scraped_data', 'is', null);
    
    let remainingQuery = supabase
      .from('retirement_villages')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')  // CRITICAL FIX: Only count approved villages
      .not('website', 'is', null)
      .is('scraped_data', null);
    
    // Apply state filter if provided
    if (filterState) {
      withWebsitesQuery = withWebsitesQuery.eq('state', filterState);
      scrapedQuery = scrapedQuery.eq('state', filterState);
      remainingQuery = remainingQuery.eq('state', filterState);
    }
    
    // Execute queries
    const { count: totalWithWebsites } = await withWebsitesQuery;
    const { data: scrapedVillages } = await scrapedQuery;
    const { count: totalRemaining } = await remainingQuery;
    
    // Count only villages where scraped_data exists and isn't just an error object
    const totalScraped = scrapedVillages?.filter(v => {
      if (!v.scraped_data) return false;
      // If scraped_data has a 'status' field, it should be 'success'
      if (v.scraped_data.status) {
        return v.scraped_data.status === 'success';
      }
      // Otherwise, if it has any data fields, consider it scraped
      return Object.keys(v.scraped_data).length > 0;
    }).length || 0;
    
    console.log(`📊 STATS RESULT - ${filterState || 'ALL'}: ${totalScraped} scraped out of ${scrapedVillages?.length || 0} with non-null scraped_data, ${totalWithWebsites} total with websites`);
    
    // DEBUG: Check what state values actually exist in the database
    const { data: sampleVillages } = await supabase
      .from('retirement_villages')
      .select('state')
      .not('website', 'is', null)
      .limit(100);
    
    const uniqueStates = [...new Set(sampleVillages?.map(v => v.state) || [])];
    console.log('🔍 UNIQUE STATE VALUES IN DATABASE:', uniqueStates);
    
    // Calculate per-state breakdown - ONLY for states that exist in the database
    const byStateBreakdown: Record<string, { total: number; scraped: number; remaining: number }> = {};
    
    // CRITICAL FIX: If filterState is provided, only show that state in byState breakdown
    const statesToProcess = filterState ? [filterState] : uniqueStates;
    console.log('🔍 STATES TO PROCESS FOR byState breakdown:', statesToProcess);
    
    // Query each unique state that actually exists
    for (const state of statesToProcess) {
      const { count: stateTotal } = await supabase
        .from('retirement_villages')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'approved')  // CRITICAL FIX: Only count approved villages
        .not('website', 'is', null)
        .eq('state', state);
      
      const { data: stateScrapedVillages } = await supabase
        .from('retirement_villages')
        .select('id, scraped_data')
        .eq('status', 'approved')  // CRITICAL FIX: Only count approved villages
        .not('scraped_data', 'is', null)
        .eq('state', state);
      
      const { count: stateRemaining } = await supabase
        .from('retirement_villages')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'approved')  // CRITICAL FIX: Only count approved villages
        .not('website', 'is', null)
        .is('scraped_data', null)
        .eq('state', state);
      
      // Count successful scrapes for this state
      const stateScraped = stateScrapedVillages?.filter(v => {
        if (!v.scraped_data) return false;
        if (v.scraped_data.status) {
          return v.scraped_data.status === 'success';
        }
        return Object.keys(v.scraped_data).length > 0;
      }).length || 0;
      
      byStateBreakdown[state] = {
        total: stateTotal || 0,
        scraped: stateScraped,
        remaining: stateRemaining || 0
      };
      
      console.log(`📊 ${state}: ${stateTotal} total, ${stateScraped} scraped, ${stateRemaining} remaining`);
    }
    
    return c.json({
      overall: {
        totalWithWebsites: totalWithWebsites || 0,
        totalScraped: totalScraped || 0,
        totalRemaining: totalRemaining || 0,
        percentComplete: totalWithWebsites ? Math.round((totalScraped || 0) / totalWithWebsites * 100) : 0
      },
      byState: byStateBreakdown
    });
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    return c.json({ error: 'Failed to fetch stats', details: error.message }, 500);
  }
});

/**
 * POST /batch-scraping/add-to-skip-list
 * Manually add village IDs to skip list (for problematic villages)
 */
app.post('/make-server-3bba8be8/batch-scraping/add-to-skip-list', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Verify admin authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { villageIds } = await c.req.json();
    
    if (!villageIds || !Array.isArray(villageIds)) {
      return c.json({ error: 'villageIds array required' }, 400);
    }
    
    // Load current skip list
    await loadSkipList();
    
    // Add new IDs
    for (const id of villageIds) {
      skipVillageIds.add(id);
    }
    
    // Save updated skip list
    await saveSkipList();
    
    console.log(`✅ Added ${villageIds.length} villages to skip list (total: ${skipVillageIds.size})`);
    
    return c.json({ 
      message: 'Villages added to skip list',
      totalSkipped: skipVillageIds.size,
      added: villageIds
    });
    
  } catch (error) {
    console.error('Error adding to skip list:', error);
    return c.json({ error: 'Failed to add to skip list', details: error.message }, 500);
  }
});

/**
 * POST /batch-scraping/reset
 * Reset batch state (for testing/debugging)
 */
app.post('/make-server-3bba8be8/batch-scraping/reset', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Verify admin authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // FORCE stop any running batch
    currentBatch = null;
    
    // AGGRESSIVE DELETE - try multiple methods to ensure it's gone
    console.log('🔄 Attempting to delete batch_scraping_state from KV store...');
    
    // Method 1: Direct delete
    const { error: deleteError } = await supabase
      .from('kv_store_3bba8be8')
      .delete()
      .eq('key', 'batch_scraping_state');
    
    if (deleteError) {
      console.error('❌ Delete failed:', deleteError);
    } else {
      console.log('✅ Delete successful');
    }
    
    // Method 2: Verify it's actually gone
    const { data: checkData } = await supabase
      .from('kv_store_3bba8be8')
      .select('*')
      .eq('key', 'batch_scraping_state')
      .single();
    
    if (checkData) {
      console.error('⚠️ WARNING: Record still exists after delete!', checkData);
      // Try updating it to null as a fallback
      await supabase
        .from('kv_store_3bba8be8')
        .update({ value: null })
        .eq('key', 'batch_scraping_state');
    } else {
      console.log('✅ Verified: Record is gone from KV store');
    }
    
    // DON'T reset skip list - we want to keep problematic villages skipped!
    // The skip list should only be manually cleared if needed
    
    console.log('🔄 Batch state FORCE RESET - all state cleared (skip list preserved)');
    
    return c.json({ 
      message: 'Batch state reset successfully',
      batch: null,  // Explicitly return null so frontend knows to clear
      kvRecordDeleted: !checkData
    });
    
  } catch (error) {
    console.error('Error resetting batch:', error);
    return c.json({ error: 'Failed to reset batch', details: error.message }, 500);
  }
});

/**
 * GET /batch-scraping/facility-type-audit
 * Audit facility types in the database (find aged care vs retirement villages)
 */
app.get('/make-server-3bba8be8/batch-scraping/facility-type-audit', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Verify admin authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Get ALL villages with websites grouped by state and facility_type
    const { data: allVillages } = await supabase
      .from('retirement_villages')
      .select('id, name, state, website, facility_type')
      .not('website', 'is', null);
    
    if (!allVillages) {
      return c.json({ error: 'Failed to fetch villages' }, 500);
    }
    
    // Group by state and facility_type
    const breakdown: Record<string, {
      total: number;
      retirement_village: number;
      aged_care: number;
      both: number;
      unclassified: number;
    }> = {};
    
    let totalRetirementVillages = 0;
    let totalAgedCare = 0;
    let totalBoth = 0;
    let totalUnclassified = 0;
    
    for (const village of allVillages) {
      const state = village.state || 'UNKNOWN';
      
      if (!breakdown[state]) {
        breakdown[state] = {
          total: 0,
          retirement_village: 0,
          aged_care: 0,
          both: 0,
          unclassified: 0
        };
      }
      
      breakdown[state].total++;
      
      if (village.facility_type === 'retirement_village') {
        breakdown[state].retirement_village++;
        totalRetirementVillages++;
      } else if (village.facility_type === 'aged_care') {
        breakdown[state].aged_care++;
        totalAgedCare++;
      } else if (village.facility_type === 'both') {
        breakdown[state].both++;
        totalBoth++;
      } else {
        breakdown[state].unclassified++;
        totalUnclassified++;
      }
    }
    
    console.log('📊 FACILITY TYPE AUDIT:');
    console.log(`   Total villages: ${allVillages.length}`);
    console.log(`   Retirement villages: ${totalRetirementVillages}`);
    console.log(`   Aged care: ${totalAgedCare}`);
    console.log(`   Both: ${totalBoth}`);
    console.log(`   Unclassified: ${totalUnclassified}`);
    
    return c.json({
      overall: {
        total: allVillages.length,
        retirement_village: totalRetirementVillages,
        aged_care: totalAgedCare,
        both: totalBoth,
        unclassified: totalUnclassified
      },
      byState: breakdown
    });
    
  } catch (error) {
    console.error('Error running facility audit:', error);
    return c.json({ error: 'Failed to run audit', details: error.message }, 500);
  }
});

/**
 * GET /batch-scraping/data-quality-audit
 * Audit data quality for scraped villages (field completeness)
 * Query params: ?state=VIC (optional - defaults to all states)
 */
app.get('/make-server-3bba8be8/batch-scraping/data-quality-audit', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Verify admin authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Get optional state filter from query params
    const filterState = c.req.query('state');
    
    console.log(`📊 DATA QUALITY AUDIT - State: ${filterState || 'ALL'}`);
    
    // Get all villages with scraped_data
    let query = supabase
      .from('retirement_villages')
      .select('id, name, state, website, scraped_data')
      .not('scraped_data', 'is', null);
    
    if (filterState) {
      query = query.eq('state', filterState);
    }
    
    const { data: villages, error } = await query;
    
    if (error || !villages) {
      console.error('Error fetching villages:', error);
      return c.json({ error: 'Failed to fetch villages' }, 500);
    }
    
    // Filter to only successful scrapes
    const successfulVillages = villages.filter(v => 
      v.scraped_data && 
      (v.scraped_data.status === 'success' || Object.keys(v.scraped_data).length > 1)
    );
    
    console.log(`📊 Found ${successfulVillages.length} successfully scraped villages`);
    
    // Track field completeness
    const fieldCounts = {
      description: 0,
      care_levels: 0,
      amenities: 0,
      pricing: 0,
      contact_phone: 0,
      contact_email: 0,
      address: 0,
      suburb: 0,
      village_type: 0,
      operator: 0,
      units_count: 0,
      any_field: 0  // At least one enriched field
    };
    
    const totalFields = Object.keys(fieldCounts).length - 1; // Exclude 'any_field'
    
    let totalFieldsFound = 0;
    const fieldDistribution: number[] = []; // How many fields each village has
    
    for (const village of successfulVillages) {
      const data = village.scraped_data;
      let villageFieldCount = 0;
      
      if (data.description) {
        fieldCounts.description++;
        villageFieldCount++;
      }
      if (data.care_levels && data.care_levels.length > 0) {
        fieldCounts.care_levels++;
        villageFieldCount++;
      }
      if (data.amenities && data.amenities.length > 0) {
        fieldCounts.amenities++;
        villageFieldCount++;
      }
      if (data.pricing) {
        fieldCounts.pricing++;
        villageFieldCount++;
      }
      if (data.contact_phone) {
        fieldCounts.contact_phone++;
        villageFieldCount++;
      }
      if (data.contact_email) {
        fieldCounts.contact_email++;
        villageFieldCount++;
      }
      if (data.address) {
        fieldCounts.address++;
        villageFieldCount++;
      }
      if (data.suburb) {
        fieldCounts.suburb++;
        villageFieldCount++;
      }
      if (data.village_type) {
        fieldCounts.village_type++;
        villageFieldCount++;
      }
      if (data.operator) {
        fieldCounts.operator++;
        villageFieldCount++;
      }
      if (data.units_count) {
        fieldCounts.units_count++;
        villageFieldCount++;
      }
      
      if (villageFieldCount > 0) {
        fieldCounts.any_field++;
      }
      
      totalFieldsFound += villageFieldCount;
      fieldDistribution.push(villageFieldCount);
    }
    
    // Calculate percentages
    const fieldPercentages: Record<string, number> = {};
    for (const [field, count] of Object.entries(fieldCounts)) {
      fieldPercentages[field] = successfulVillages.length > 0 
        ? Math.round((count / successfulVillages.length) * 100) 
        : 0;
    }
    
    // Calculate average fields per village
    const avgFieldsPerVillage = successfulVillages.length > 0
      ? (totalFieldsFound / successfulVillages.length).toFixed(2)
      : '0';
    
    // Calculate field distribution stats
    const sortedDistribution = [...fieldDistribution].sort((a, b) => a - b);
    const median = sortedDistribution.length > 0
      ? sortedDistribution[Math.floor(sortedDistribution.length / 2)]
      : 0;
    const max = sortedDistribution.length > 0
      ? sortedDistribution[sortedDistribution.length - 1]
      : 0;
    const min = sortedDistribution.length > 0
      ? sortedDistribution[0]
      : 0;
    
    // Find villages with the most/least data
    const villagesWithScores = successfulVillages.map((v, idx) => ({
      id: v.id,
      name: v.name,
      state: v.state,
      fieldsFound: fieldDistribution[idx]
    }));
    
    villagesWithScores.sort((a, b) => b.fieldsFound - a.fieldsFound);
    const bestVillages = villagesWithScores.slice(0, 10);
    const worstVillages = villagesWithScores.slice(-10).reverse();
    
    console.log(`📊 AUDIT RESULTS:`);
    console.log(`   Total scraped: ${successfulVillages.length}`);
    console.log(`   Avg fields/village: ${avgFieldsPerVillage}`);
    console.log(`   Field distribution: min=${min}, median=${median}, max=${max}`);
    console.log(`   Top fields:`);
    console.log(`     - Description: ${fieldPercentages.description}%`);
    console.log(`     - Contact Phone: ${fieldPercentages.contact_phone}%`);
    console.log(`     - Amenities: ${fieldPercentages.amenities}%`);
    
    return c.json({
      summary: {
        totalVillages: successfulVillages.length,
        avgFieldsPerVillage: parseFloat(avgFieldsPerVillage),
        totalFieldsAvailable: totalFields,
        fieldDistribution: {
          min,
          median,
          max
        }
      },
      fieldCompleteness: {
        counts: fieldCounts,
        percentages: fieldPercentages
      },
      topPerformers: bestVillages,
      needsImprovement: worstVillages
    });
    
  } catch (error) {
    console.error('Error running data quality audit:', error);
    return c.json({ error: 'Failed to run audit', details: error.message }, 500);
  }
});

export default app;