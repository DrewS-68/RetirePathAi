// Simplified Data Enrichment - Manual Website Entry
import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const app = new Hono();

// Enable CORS
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'apikey'],
}));

// Initialize Supabase client with service role for admin operations
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

/**
 * POST /data-enrichment/scrape-village-data
 * Scrape data from village websites (simplified - only scrapes existing websites)
 */
app.post('/make-server-3bba8be8/data-enrichment/scrape-village-data', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Verify admin authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - missing access token' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - invalid token', details: authError?.message }, 401);
    }
    
    const body = await c.req.json();
    const { villageIds, state } = body;
    
    // Get villages with websites
    let query = supabase
      .from('retirement_villages')
      .select('*')
      .not('website', 'is', null);
    
    if (villageIds && villageIds.length > 0) {
      query = query.in('id', villageIds);
    } else if (state) {
      query = query.eq('state', state);
    }
    
    const { data: villages, error: fetchError } = await query;
    
    if (fetchError) {
      console.error('Error fetching villages:', fetchError);
      return c.json({ error: 'Failed to fetch villages', details: fetchError.message }, 500);
    }
    
    if (!villages || villages.length === 0) {
      return c.json({ error: 'No villages with websites found' }, 404);
    }
    
    const results = [];
    
    for (const village of villages) {
      try {
        console.log(`🔍 Starting scrape for: ${village.name} - ${village.website}`);
        
        if (!village.website) {
          results.push({
            villageId: village.id,
            name: village.name,
            status: 'skipped',
            reason: 'No website'
          });
          continue;
        }
        
        // Fetch website content
        console.log(`📡 Fetching website: ${village.website}`);
        const response = await fetch(village.website, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        if (!response.ok) {
          console.log(`❌ HTTP error ${response.status} for ${village.name}`);
          results.push({
            villageId: village.id,
            name: village.name,
            status: 'failed',
            reason: `HTTP ${response.status}`,
            website: village.website
          });
          continue;
        }
        
        const html = await response.text();
        console.log(`✅ Fetched HTML - length: ${html.length} characters`);
        
        const textContent = html.replace(/<[^>]*>/g, ' ').toLowerCase();
        console.log(`📄 Extracted text content - length: ${textContent.length} characters`);
        console.log(`📄 First 500 chars: ${textContent.substring(0, 500)}`);
        
        // Extract data using pattern matching
        const scrapedData: any = {
          source: 'web_scraping',
          scraped_at: new Date().toISOString(),
          scraped_from: village.website
        };
        
        // Extract pricing information
        const pricingPatterns = [
          /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:per week|pw|weekly)/gi,
          /entry\s*(?:price|fee|cost)[:\s]*\$\s*(\d{1,3}(?:,\d{3})*)/gi,
          /from\s*\$\s*(\d{1,3}(?:,\d{3})*)/gi,
          /prices?\s*(?:start|starting|from)[:\s]*\$\s*(\d{1,3}(?:,\d{3})*)/gi
        ];
        
        const priceMatches = [];
        for (const pattern of pricingPatterns) {
          const matches = [...textContent.matchAll(pattern)];
          priceMatches.push(...matches.map(m => parseInt(m[1].replace(/,/g, ''))));
        }
        console.log(`💰 Found ${priceMatches.length} price matches:`, priceMatches);
        
        if (priceMatches.length > 0) {
          const uniquePrices = [...new Set(priceMatches)].sort((a, b) => a - b);
          scrapedData.scraped_entry_price_min = uniquePrices[0];
          scrapedData.scraped_entry_price_max = uniquePrices[uniquePrices.length - 1];
        }
        
        // Extract phone numbers
        const phonePattern = /(?:phone|call|contact)[:\s]*(\d{2,4}[\s\-]?\d{3,4}[\s\-]?\d{4})/gi;
        const phoneMatches = [...textContent.matchAll(phonePattern)];
        console.log(`📞 Found ${phoneMatches.length} phone matches:`, phoneMatches.map(m => m[0]));
        
        if (phoneMatches.length > 0 && !village.contact_phone) {
          scrapedData.scraped_contact_phone = phoneMatches[0][1].trim();
        }
        
        // Extract amenities
        const amenityKeywords = [
          'swimming pool', 'pool', 'gym', 'fitness', 'library', 'cinema', 
          'theatre', 'bowling green', 'garden', 'cafe', 'restaurant', 
          'hairdresser', 'salon', 'workshop', 'craft room', 'billiards',
          'community hall', 'lounge', 'bar', 'club', 'games room'
        ];
        
        const foundAmenities = amenityKeywords.filter(amenity => 
          textContent.includes(amenity)
        );
        console.log(`🏊 Found ${foundAmenities.length} amenities:`, foundAmenities);
        
        if (foundAmenities.length > 0) {
          scrapedData.scraped_amenities = foundAmenities;
        }
        
        // Check if pet friendly
        if (textContent.includes('pet friendly') || 
            textContent.includes('pets welcome') ||
            textContent.includes('pet-friendly')) {
          scrapedData.scraped_pet_friendly = true;
          console.log(`🐾 Pet friendly: true`);
        }
        
        console.log(`📊 Final scraped data fields:`, Object.keys(scrapedData).filter(k => k.startsWith('scraped_')));
        console.log(`📊 Full scraped data:`, JSON.stringify(scrapedData, null, 2));
        
        // Store scraped data in a JSON field for review
        const { error: updateError } = await supabase
          .from('retirement_villages')
          .update({ 
            scraped_data: scrapedData,
            updated_at: new Date().toISOString()
          })
          .eq('id', village.id);
        
        if (updateError) {
          console.error(`❌ Failed to save scraped data for ${village.name}:`, updateError);
          results.push({
            villageId: village.id,
            name: village.name,
            status: 'failed',
            reason: 'Failed to save scraped data',
            scrapedData
          });
        } else {
          const dataFieldCount = Object.keys(scrapedData).filter(k => k.startsWith('scraped_')).length;
          console.log(`✅ Successfully saved ${dataFieldCount} data fields for ${village.name}`);
          
          results.push({
            villageId: village.id,
            name: village.name,
            status: dataFieldCount > 0 ? 'success' : 'no_data',
            reason: dataFieldCount === 0 ? 'No data fields found on website' : undefined,
            website: village.website,
            dataFound: dataFieldCount
          });
        }
        
        // Rate limiting - wait 3 seconds between scrapes
        await new Promise(resolve => setTimeout(resolve, 3000));
        
      } catch (error) {
        console.error(`❌ Error scraping ${village.name}:`, error);
        results.push({
          villageId: village.id,
          name: village.name,
          status: 'error',
          reason: error.message,
          website: village.website
        });
      }
    }
    
    // Calculate summary stats
    const summary = {
      total: results.length,
      success: results.filter(r => r.status === 'success').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      failed: results.filter(r => r.status === 'failed' || r.status === 'error').length
    };
    
    return c.json({ 
      success: true,
      summary,
      results
    });
    
  } catch (error) {
    console.error('Unexpected error in data scraping:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * GET /data-enrichment/villages-with-scraped-data
 * Get all villages that have scraped data pending review
 * Query params: ?state=VIC (optional - filter by state)
 */
app.get('/make-server-3bba8be8/data-enrichment/villages-with-scraped-data', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Verify admin authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - missing access token' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - invalid token' }, 401);
    }
    
    // Get optional state filter from query params
    const url = new URL(c.req.url);
    const stateFilter = url.searchParams.get('state');
    
    console.log('🔍 [Backend] Villages with scraped data request');
    console.log('🔍 [Backend] Full URL:', c.req.url);
    console.log('🔍 [Backend] State filter from searchParams:', stateFilter);
    console.log('🔍 [Backend] State filter type:', typeof stateFilter);
    console.log('🔍 [Backend] State filter value:', JSON.stringify(stateFilter));
    
    // Build query
    let query = supabase
      .from('retirement_villages')
      .select('*')
      .not('scraped_data', 'is', null);
    
    // Add state filter if provided
    if (stateFilter) {
      console.log('✅ [Backend] Adding .eq("state", stateFilter) to query');
      query = query.eq('state', stateFilter);
    } else {
      console.log('⚠️ [Backend] No state filter - stateFilter is falsy:', stateFilter);
    }
    
    const { data: villages, error } = await query.order('updated_at', { ascending: false });
    
    console.log('📊 [Backend] Query completed');
    console.log('📊 [Backend] Villages returned:', villages?.length);
    console.log('📊 [Backend] First village state (if any):', villages?.[0]?.state);
    console.log('📊 [Backend] Last village state (if any):', villages?.[villages.length - 1]?.state);
    console.log('📊 [Backend] Unique states in results:', [...new Set(villages?.map(v => v.state))]);
    console.log('📊 [Backend] Error:', error?.message);
    
    if (error) {
      console.error('Error fetching villages with scraped data:', error);
      return c.json({ error: 'Failed to fetch villages', details: error.message }, 500);
    }
    
    // Get counts per state for the UI
    const { data: allVillages } = await supabase
      .from('retirement_villages')
      .select('state')
      .not('scraped_data', 'is', null);
    
    const stateCounts: {[key: string]: number} = {};
    if (allVillages) {
      allVillages.forEach((v: any) => {
        stateCounts[v.state] = (stateCounts[v.state] || 0) + 1;
      });
    }
    
    return c.json({ 
      villages: villages || [],
      stateCounts,
      totalCount: villages?.length || 0,
      filteredBy: stateFilter || 'ALL'
    });
    
  } catch (error) {
    console.error('Unexpected error fetching villages with scraped data:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * POST /data-enrichment/approve-scraped-data/:id
 * Approve and merge scraped data into village record
 */
app.post('/make-server-3bba8be8/data-enrichment/approve-scraped-data/:id', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    const villageId = c.req.param('id');
    
    // Verify admin authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - missing access token' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - invalid token' }, 401);
    }
    
    const body = await c.req.json();
    const { fieldsToApprove } = body; // Array of field names to approve
    
    // Get village with scraped data
    const { data: village, error: fetchError } = await supabase
      .from('retirement_villages')
      .select('*')
      .eq('id', villageId)
      .single();
    
    if (fetchError || !village) {
      return c.json({ error: 'Village not found' }, 404);
    }
    
    if (!village.scraped_data) {
      return c.json({ error: 'No scraped data available' }, 400);
    }
    
    const scrapedData = village.scraped_data as any;
    const updates: any = {
      updated_at: new Date().toISOString()
    };
    
    // Map scraped fields to actual fields
    const fieldMapping: Record<string, string> = {
      'scraped_entry_price_min': 'entry_price_min',
      'scraped_entry_price_max': 'entry_price_max',
      'scraped_contact_phone': 'contact_phone',
      'scraped_amenities': 'amenities',
      'scraped_pet_friendly': 'pet_friendly'
    };
    
    // Apply approved fields
    if (fieldsToApprove && fieldsToApprove.length > 0) {
      for (const scrapedField of fieldsToApprove) {
        const actualField = fieldMapping[scrapedField];
        if (actualField && scrapedData[scrapedField]) {
          updates[actualField] = scrapedData[scrapedField];
        }
      }
    } else {
      // Approve all fields if none specified
      for (const [scrapedField, actualField] of Object.entries(fieldMapping)) {
        if (scrapedData[scrapedField]) {
          updates[actualField] = scrapedData[scrapedField];
        }
      }
    }
    
    // Mark as verified and clear scraped data
    updates.verified = true;
    updates.scraped_data = null;
    
    const { data, error: updateError } = await supabase
      .from('retirement_villages')
      .update(updates)
      .eq('id', villageId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error approving scraped data:', updateError);
      return c.json({ error: 'Failed to approve scraped data', details: updateError.message }, 500);
    }
    
    return c.json({ 
      success: true,
      message: 'Scraped data approved and merged',
      village: data
    });
    
  } catch (error) {
    console.error('Unexpected error approving scraped data:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * POST /data-enrichment/reject-scraped-data/:id
 * Reject scraped data for a village
 */
app.post('/make-server-3bba8be8/data-enrichment/reject-scraped-data/:id', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    const villageId = c.req.param('id');
    
    // Verify admin authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - missing access token' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - invalid token' }, 401);
    }
    
    // Clear scraped data
    const { data, error: updateError } = await supabase
      .from('retirement_villages')
      .update({ 
        scraped_data: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', villageId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error rejecting scraped data:', updateError);
      return c.json({ error: 'Failed to reject scraped data', details: updateError.message }, 500);
    }
    
    return c.json({ 
      success: true,
      message: 'Scraped data rejected',
      village: data
    });
    
  } catch (error) {
    console.error('Unexpected error rejecting scraped data:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

export default app;