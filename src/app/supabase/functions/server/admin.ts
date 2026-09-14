// Admin API Routes - Village Management
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
 * GET /admin/villages
 * Get villages with filters (for admin use)
 */
app.get('/make-server-3bba8be8/admin/villages', async (c) => {
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
    
    // Get query parameters
    const state = c.req.query('state');
    const withoutWebsite = c.req.query('without_website') === 'true';
    const status = c.req.query('status') || 'approved';
    
    // Build query
    let query = supabase
      .from('retirement_villages')
      .select('*')
      .eq('status', status)
      .order('name', { ascending: true });
    
    if (state) {
      query = query.eq('state', state);
    }
    
    if (withoutWebsite) {
      query = query.is('website', null);
    }
    
    const { data: villages, error } = await query;
    
    if (error) {
      console.error('Error fetching villages:', error);
      return c.json({ error: 'Failed to fetch villages', details: error.message }, 500);
    }
    
    return c.json({ villages: villages || [] });
    
  } catch (error) {
    console.error('Unexpected error fetching villages:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * POST /admin/bulk-update-websites
 * Bulk update website URLs for multiple villages
 */
app.post('/make-server-3bba8be8/admin/bulk-update-websites', async (c) => {
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
    
    const body = await c.req.json();
    const { updates } = body; // Array of { villageId, website }
    
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return c.json({ error: 'Invalid request - updates array required' }, 400);
    }
    
    // Validate all updates
    for (const update of updates) {
      if (!update.villageId || !update.website) {
        return c.json({ error: 'Invalid update - villageId and website required for all entries' }, 400);
      }
      
      // Validate URL format
      try {
        new URL(update.website);
      } catch {
        return c.json({ error: `Invalid URL: ${update.website}` }, 400);
      }
    }
    
    // Perform bulk updates
    let successCount = 0;
    let failCount = 0;
    const errors = [];
    
    for (const update of updates) {
      try {
        const { error } = await supabase
          .from('retirement_villages')
          .update({ 
            website: update.website,
            updated_at: new Date().toISOString()
          })
          .eq('id', update.villageId);
        
        if (error) {
          failCount++;
          errors.push({
            villageId: update.villageId,
            error: error.message
          });
        } else {
          successCount++;
        }
      } catch (error) {
        failCount++;
        errors.push({
          villageId: update.villageId,
          error: error.message
        });
      }
    }
    
    console.log(`Bulk website update: ${successCount} succeeded, ${failCount} failed`);
    
    return c.json({ 
      success: true,
      updated: successCount,
      failed: failCount,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Unexpected error in bulk website update:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * POST /admin/update-village-website
 * Update a single village's website URL
 */
app.post('/make-server-3bba8be8/update-village-website', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    const body = await c.req.json();
    const { villageId, name, suburb, website } = body;
    
    if (!website) {
      return c.json({ error: 'website required' }, 400);
    }
    
    // Validate URL format
    try {
      new URL(website);
    } catch {
      return c.json({ error: 'Invalid website URL' }, 400);
    }
    
    // Try to find village by ID first, then fall back to name+suburb match
    let existingVillage = null;
    
    if (villageId) {
      const { data: villageById } = await supabase
        .from('retirement_villages')
        .select('id, name, suburb')
        .eq('id', villageId)
        .single();
      
      existingVillage = villageById;
    }
    
    // If not found by ID, try matching by name and suburb
    if (!existingVillage && name && suburb) {
      console.log(`🔍 Village ID not found, trying name+suburb match: ${name}, ${suburb}`);
      
      const { data: villageByNameSuburb } = await supabase
        .from('retirement_villages')
        .select('id, name, suburb')
        .eq('state', 'VIC')
        .ilike('name', name)
        .ilike('suburb', suburb)
        .single();
      
      existingVillage = villageByNameSuburb;
      
      if (existingVillage) {
        console.log(`✅ Found match: ${existingVillage.name} (${existingVillage.id})`);
      }
    }
    
    if (!existingVillage) {
      return c.json({ 
        success: false, 
        error: `Village not found: ${name || villageId} in ${suburb || 'unknown suburb'}` 
      }, 404);
    }
    
    // Update village website
    const { data, error } = await supabase
      .from('retirement_villages')
      .update({
        website: website,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingVillage.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating village website:', error);
      return c.json({ 
        success: false, 
        error: 'Failed to update village website', 
        details: error.message 
      }, 500);
    }
    
    console.log(`✅ Updated ${existingVillage.name} with website: ${website}`);
    
    return c.json({ 
      success: true,
      village: data
    });
    
  } catch (error) {
    console.error('Unexpected error updating village website:', error);
    return c.json({ 
      success: false, 
      error: 'Internal server error', 
      details: error.message 
    }, 500);
  }
});

/**
 * PUT /admin/village/:id
 * Update a single village (including website)
 */
app.put('/make-server-3bba8be8/admin/village/:id', async (c) => {
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
    
    // Validate website URL if provided
    if (body.website) {
      try {
        new URL(body.website);
      } catch {
        return c.json({ error: 'Invalid website URL' }, 400);
      }
    }
    
    // Update village
    const { data, error } = await supabase
      .from('retirement_villages')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', villageId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating village:', error);
      return c.json({ error: 'Failed to update village', details: error.message }, 500);
    }
    
    return c.json({ 
      success: true,
      village: data
    });
    
  } catch (error) {
    console.error('Unexpected error updating village:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * POST /admin/setup-scraped-data-column
 * One-click database setup for scraped_data column
 */
app.post('/make-server-3bba8be8/admin/setup-scraped-data-column', async (c) => {
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

    console.log(`🔧 Admin ${user.id} is setting up scraped_data column...`);

    // Execute SQL to add the column
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE retirement_villages ADD COLUMN IF NOT EXISTS scraped_data JSONB;'
    });

    if (error) {
      console.error('❌ Error adding scraped_data column:', error);
      
      // If RPC doesn't exist, provide manual instructions
      if (error.message.includes('exec_sql')) {
        return c.json({ 
          error: 'Automatic setup not available',
          manual: true,
          sql: 'ALTER TABLE retirement_villages ADD COLUMN IF NOT EXISTS scraped_data JSONB;',
          message: 'Please run the SQL manually in Supabase SQL Editor'
        }, 400);
      }
      
      throw error;
    }

    console.log('✅ scraped_data column added successfully');
    return c.json({ 
      success: true,
      message: 'Database setup complete! You can now use the Data Enrichment System.'
    });

  } catch (error: any) {
    console.error('Error in setup-scraped-data-column:', error);
    return c.json({ 
      error: error.message || 'Failed to setup database',
      manual: true,
      sql: 'ALTER TABLE retirement_villages ADD COLUMN IF NOT EXISTS scraped_data JSONB;',
      message: 'Please run the SQL manually in Supabase SQL Editor'
    }, 500);
  }
});

/**
 * GET /admin/investigate-database
 * Investigate the database to see what villages exist by state
 */
app.get('/make-server-3bba8be8/admin/investigate-database', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    console.log('[Admin] Starting database investigation...');
    
    // Get total count
    const { count: totalCount, error: totalError } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true });
    
    if (totalError) {
      console.error('[Admin] Error fetching total count:', totalError);
      return c.json({ error: 'Database error', details: totalError.message }, 500);
    }
    
    // Get all villages with their states
    const { data: villages, error: villagesError } = await supabase
      .from('retirement_villages')
      .select('state');
    
    if (villagesError) {
      console.error('[Admin] Error fetching villages:', villagesError);
      return c.json({ error: 'Database error', details: villagesError.message }, 500);
    }
    
    // Count by state
    const stateCounts: Record<string, number> = {};
    villages?.forEach(village => {
      const state = village.state || 'UNKNOWN';
      stateCounts[state] = (stateCounts[state] || 0) + 1;
    });
    
    // Convert to array and sort
    const stateBreakdown = Object.entries(stateCounts)
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count);
    
    console.log('[Admin] Database investigation complete:', {
      totalVillages: totalCount,
      stateBreakdown,
    });
    
    return c.json({
      totalVillages: totalCount || 0,
      stateBreakdown,
      vicVillages: stateCounts['VIC'] || 0,
      nswVillages: stateCounts['NSW'] || 0,
      qldVillages: stateCounts['QLD'] || 0,
      waVillages: stateCounts['WA'] || 0,
      saVillages: stateCounts['SA'] || 0,
      tasVillages: stateCounts['TAS'] || 0,
      actVillages: stateCounts['ACT'] || 0,
      ntVillages: stateCounts['NT'] || 0,
    });
    
  } catch (error) {
    console.error('[Admin] Error in investigate-database endpoint:', error);
    return c.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

/**
 * GET /admin/check-vic-websites
 * Check how many Victorian villages have websites vs need websites
 */
app.get('/make-server-3bba8be8/admin/check-vic-websites', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    console.log('[Admin] Checking VIC website status...');
    
    // Get total VIC count
    const { count: totalVIC, error: totalError } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'VIC');
    
    if (totalError) {
      console.error('[Admin] Error fetching total VIC count:', totalError);
      return c.json({ error: 'Database error', details: totalError.message }, 500);
    }
    
    // Get VIC villages WITH websites
    const { data: withWebsites, count: withWebsiteCount, error: withError } = await supabase
      .from('retirement_villages')
      .select('id, name, suburb, website', { count: 'exact' })
      .eq('state', 'VIC')
      .not('website', 'is', null)
      .limit(10);
    
    if (withError) {
      console.error('[Admin] Error fetching VIC with websites:', withError);
      return c.json({ error: 'Database error', details: withError.message }, 500);
    }
    
    // Get VIC villages WITHOUT websites
    const { data: withoutWebsites, count: withoutWebsiteCount, error: withoutError } = await supabase
      .from('retirement_villages')
      .select('id, name, suburb', { count: 'exact' })
      .eq('state', 'VIC')
      .is('website', null)
      .limit(10);
    
    if (withoutError) {
      console.error('[Admin] Error fetching VIC without websites:', withoutError);
      return c.json({ error: 'Database error', details: withoutError.message }, 500);
    }
    
    console.log('[Admin] VIC website check complete:', {
      totalVIC,
      withWebsite: withWebsiteCount,
      withoutWebsite: withoutWebsiteCount,
    });
    
    return c.json({
      totalVIC: totalVIC || 0,
      withWebsite: withWebsiteCount || 0,
      withoutWebsite: withoutWebsiteCount || 0,
      sampleWithWebsites: withWebsites || [],
      sampleWithoutWebsites: withoutWebsites || [],
    });
    
  } catch (error) {
    console.error('[Admin] Error in check-vic-websites endpoint:', error);
    return c.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

/**
 * POST /admin/delete-all-vic-websites
 * Clear all website URLs from VIC villages
 */
app.post('/make-server-3bba8be8/admin/delete-all-vic-websites', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    console.log('🗑️ Deleting all VIC village websites...');
    
    // Update all VIC villages to have null website
    const { error, count } = await supabase
      .from('retirement_villages')
      .update({ website: null })
      .eq('state', 'VIC')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error deleting websites:', error);
      return c.json({ error: error.message }, 500);
    }
    
    console.log(`✅ Cleared ${count} VIC village websites`);
    
    return c.json({
      success: true,
      cleared: count || 0
    });
    
  } catch (error) {
    console.error('Error in delete-all-vic-websites:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /admin/scrape-vic-websites
 * Scrape operator websites for VIC villages that don't have URLs
 * Uses Google Search via ScraperAPI to find real operator websites (not aggregators)
 */
app.post('/make-server-3bba8be8/admin/scrape-vic-websites', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    const scraperApiKey = Deno.env.get('SCRAPERAPI_KEY');
    
    if (!scraperApiKey) {
      return c.json({ error: 'SCRAPERAPI_KEY not configured' }, 500);
    }
    
    const { batchSize = 10, offset = 0 } = await c.req.json();
    
    console.log(`🔍 Starting VIC website scraper - batch size: ${batchSize}, offset: ${offset}`);
    
    // Get VIC villages without websites
    const { data: villages, error: fetchError } = await supabase
      .from('retirement_villages')
      .select('id, name, suburb, postcode, operator, website')
      .eq('state', 'VIC')
      .is('website', null)
      .not('operator', 'is', null) // Only scrape villages with operators
      .order('name')
      .range(offset, offset + batchSize - 1);
    
    if (fetchError) {
      console.error('Error fetching villages:', fetchError);
      return c.json({ error: fetchError.message }, 500);
    }
    
    if (!villages || villages.length === 0) {
      return c.json({
        success: true,
        message: 'No villages to scrape',
        results: [],
        hasMore: false
      });
    }
    
    console.log(`📋 Processing ${villages.length} villages...`);
    
    // COMPREHENSIVE MASTER BLACKLIST - 133 domains
    // Prevents scraper from saving aggregators, directories, social media, etc.
    const aggregatorSites = [
      // Property aggregators & real estate sites
      'realestate.com.au',
      'domain.com.au',
      'property.com.au',
      'realcommercial.com.au',
      'yourinvestmentpropertymag.com.au',
      'homely.com.au',
      'propertyvalue.com.au',
      'harcourts.net',
      'gjgardner.com.au',
      'bhhscoastalrealtors.com',
      'youngsandco.com.au',
      'maxbrown.com.au',
      'ratemyagent.com.au',
      'jelliscraig.com.au',
      'moullmurray.com',
      'roost.com.au',
      'view.com.au',
      
      // Aged care directories & aggregators
      'villages.com.au',
      'agedcareonline.com.au',
      'agedcare101.com.au',
      'agedcarequality.gov.au',
      'agedcareview.com.au',
      'awisemove.com.au',
      'agedcareguide.com.au',
      'retirementlivingonline.com.au',
      'downsizing.com.au',
      'australianretirementvillages.com.au',
      'retirementliving.org.au',
      'retirementaustralialiving.com.au',
      'seniorshousingonline.com.au',
      'myagedcare.gov.au',
      'gen-agedcaredata.gov.au',
      'agedcaremadeeasy.com.au',
      'tricare.com.au',
      'caringco.com.au',
      'agedcarefind.com.au',
      'dailycare.com.au',
      
      // Social media & major platforms
      'google.com',
      'facebook.com',
      'instagram.com',
      'linkedin.com',
      'wikipedia.org',
      'tripadvisor.com',
      'youtube.com',
      
      // Business directories & listings
      'yellowpages.com.au',
      'whitepages.com.au',
      'hougarden.com',
      'creditorwatch.com.au',
      'acnc.gov.au',
      'streetnews.com.au',
      'aussie.com.au',
      'realsearch.com.au',
      'chalmer.com.au',
      'aussieweb.com.au',
      'yelp.com',
      'bizly.com.au',
      'infoisinfo-au.com',
      'zoominfo.com',
      'cylex-australia.com',
      'my-community.com',
      'parkopedia.com.au',
      'abr.business.gov.au',
      'dlook.com.au',
      'simplyregional.com.au',
      'australianplanet.com',
      'chinesebusinessguide.com.au',
      'touristplaces.com.au',
      'localista.com.au',
      'editorials.localista.com.au',
      
      // Government & council sites
      'slv.vic.gov.au',
      'find.slv.vic.gov.au',
      'transport.vic.gov.au',
      'asx.com.au',
      'aph.gov.au',
      'communitygrants.gov.au',
      'gazette.vic.gov.au',
      'knox.vic.gov.au',
      'southgippsland.vic.gov.au',
      'centralgoldfields.vic.gov.au',
      'greatershepparton.com.au',
      
      // Maps & location services
      'mapquest.com',
      'whereis.com',
      'moovitapp.com',
      'findlatitudeandlongitude.com',
      'mapcarta.com',
      'maptons.com',
      'waze.com',
      'geoview.info',
      'australia-streets.openalfa.com',
      
      // Document & media sites
      'issuu.com',
      'yumpu.com',
      'prezi.com',
      'shutterstock.com',
      'newspapers.com',
      
      // Archives & libraries
      'paperspast.natlib.govt.nz',
      'trove.nla.gov.au',
      'victoriancollections.net.au',
      
      // Other
      'beenverified.com',
      'chamberofcommerce.com',
      'reviews.birdeye.com',
      'donatehq.com.au',
      'warrandyte.org.au',
      'sandbox.haaa.com.au',
      'dgas.org.au',
      'mrra.asn.au',
      'acncpubfilesprodstorage.blob.core.windows.net',
      'sa-venues.com',
      'victoriashighcountry.com.au',
      'changepath.com.au',
      'bnaibrith.org.au',
      'andrews.edu',
      'warrandytediary.com.au',
      'blairsmith.com.au',
      'mallacoota.org.au',
      'afr.com.au',
      'newly.com.au',
      'singaustralia.com.au'
    ];
    
    const results = [];
    
    for (const village of villages) {
      console.log(`\n🏘️  Processing: ${village.name}, ${village.suburb} (${village.operator})`);
      
      try {
        let foundWebsite: string | null = null;
        let operatorDomain: string | null = null;
        
        // PHASE 1: Find operator domain
        if (village.operator) {
          console.log(`   📍 Phase 1: Finding operator domain...`);
          const operatorQuery = `"${village.operator}" retirement villages official website Australia`;
          const operatorSearchUrl = `https://api.scraperapi.com/structured/google/search?api_key=${scraperApiKey}&query=${encodeURIComponent(operatorQuery)}&country=au&num=5`;
          
          try {
            const operatorResponse = await fetch(operatorSearchUrl, {
              signal: AbortSignal.timeout(30000)
            });
            
            if (operatorResponse.ok) {
              const operatorData = await operatorResponse.json();
              
              if (operatorData.organic_results && Array.isArray(operatorData.organic_results)) {
                for (const result of operatorData.organic_results) {
                  if (result.link) {
                    const isAggregator = aggregatorSites.some(agg => result.link.includes(agg));
                    
                    if (!isAggregator) {
                      try {
                        const urlObj = new URL(result.link);
                        operatorDomain = urlObj.hostname.replace('www.', '');
                        console.log(`   ✅ Found operator domain: ${operatorDomain}`);
                        break;
                      } catch (e) {
                        continue;
                      }
                    }
                  }
                }
              }
            }
          } catch (error: any) {
            console.log(`   ⚠️ Phase 1 failed: ${error.message}`);
          }
        }
        
        // PHASE 2: Search for village website
        console.log(`   📍 Phase 2: Searching for village website...`);
        
        let searchQuery: string;
        if (operatorDomain) {
          searchQuery = `site:${operatorDomain} "${village.name}"`;
          console.log(`   🎯 Using operator domain search: "${searchQuery}"`);
        } else if (village.operator) {
          searchQuery = `"${village.name}" ${village.suburb} "${village.operator}" retirement village Australia -agedcareonline -downsizing`;
          console.log(`   🔍 Using broad operator search: "${searchQuery}"`);
        } else {
          searchQuery = `"${village.name}" ${village.suburb} retirement village Australia -agedcareonline -downsizing -retirementlivingonline`;
          console.log(`   🏠 Using independent search: "${searchQuery}"`);
        }
        
        const searchUrl = `https://api.scraperapi.com/structured/google/search?api_key=${scraperApiKey}&query=${encodeURIComponent(searchQuery)}&country=au&num=10`;
        
        const searchResponse = await fetch(searchUrl, {
          signal: AbortSignal.timeout(30000)
        });
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          
          if (searchData.organic_results && Array.isArray(searchData.organic_results)) {
            for (const result of searchData.organic_results) {
              if (result.link) {
                const isAggregator = aggregatorSites.some(agg => result.link.includes(agg));
                
                if (!isAggregator) {
                  foundWebsite = result.link;
                  console.log(`   ✅ Found website: ${foundWebsite}`);
                  break;
                }
              }
            }
          }
        }
        
        // Save to database if found
        if (foundWebsite) {
          const { error: updateError } = await supabase
            .from('retirement_villages')
            .update({ 
              website: foundWebsite,
              updated_at: new Date().toISOString()
            })
            .eq('id', village.id);
          
          if (updateError) {
            console.error(`   ❌ Failed to save website: ${updateError.message}`);
            results.push({
              villageId: village.id,
              villageName: village.name,
              status: 'error',
              error: `Failed to save: ${updateError.message}`
            });
          } else {
            console.log(`   💾 Saved to database`);
            results.push({
              villageId: village.id,
              villageName: village.name,
              status: 'success',
              website: foundWebsite,
              operatorDomain: operatorDomain
            });
          }
        } else {
          console.log(`   ❌ No website found`);
          results.push({
            villageId: village.id,
            villageName: village.name,
            status: 'not_found'
          });
        }
        
        // Rate limiting - wait 2 seconds between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error: any) {
        console.error(`   ❌ Error processing village: ${error.message}`);
        results.push({
          villageId: village.id,
          villageName: village.name,
          status: 'error',
          error: error.message
        });
      }
    }
    
    // Check if there are more villages to process
    const { count: totalRemaining } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'VIC')
      .is('website', null)
      .not('operator', 'is', null);
    
    const hasMore = (totalRemaining || 0) > 0;
    
    const summary = {
      success: results.filter(r => r.status === 'success').length,
      notFound: results.filter(r => r.status === 'not_found').length,
      errors: results.filter(r => r.status === 'error').length
    };
    
    console.log(`\n📊 Batch complete: ${summary.success} found, ${summary.notFound} not found, ${summary.errors} errors`);
    console.log(`   Remaining villages: ${totalRemaining || 0}`);
    
    return c.json({
      success: true,
      results,
      summary,
      hasMore,
      totalRemaining: totalRemaining || 0,
      nextOffset: offset + batchSize
    });
    
  } catch (error) {
    console.error('Error in scrape-vic-websites:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /vic-url-stats
 * Get statistics about VIC villages and their URL status
 */
app.get('/make-server-3bba8be8/vic-url-stats', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Total VIC villages
    const { count: total, error: totalError } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'VIC');
    
    if (totalError) {
      return c.json({ error: totalError.message }, 500);
    }
    
    // VIC villages with operators
    const { count: withOperator, error: opError } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'VIC')
      .not('operator', 'is', null)
      .neq('operator', '');
    
    if (opError) {
      return c.json({ error: opError.message }, 500);
    }
    
    // VIC villages with websites (not null and not empty string)
    const { count: withWebsite, error: webError } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'VIC')
      .not('website', 'is', null)
      .neq('website', '');
    
    if (webError) {
      return c.json({ error: webError.message }, 500);
    }
    
    // Villages with operator but no website (or empty website)
    const { count: needingURLs, error: needError } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'VIC')
      .not('operator', 'is', null)
      .neq('operator', '')
      .or('website.is.null,website.eq.');
    
    if (needError) {
      return c.json({ error: needError.message }, 500);
    }
    
    // Debug: Get 20 random villages with websites
    const { data: sampleWithWebsites } = await supabase
      .from('retirement_villages')
      .select('id, name, suburb, website, created_at, updated_at')
      .eq('state', 'VIC')
      .not('website', 'is', null)
      .neq('website', '')
      .order('name')
      .limit(20);
    
    // Debug: Get 10 random villages WITHOUT websites
    const { data: sampleWithoutWebsites } = await supabase
      .from('retirement_villages')
      .select('id, name, suburb, operator, website')
      .eq('state', 'VIC')
      .or('website.is.null,website.eq.')
      .limit(10);
    
    console.log('📊 VIC URL Stats:', { total, withOperator, withWebsite, needingURLs });
    console.log('📝 Sample villages WITH websites (20):', sampleWithWebsites?.map(v => ({ name: v.name, website: v.website?.substring(0, 50) })));
    console.log('📝 Sample villages WITHOUT websites (10):', sampleWithoutWebsites?.map(v => ({ name: v.name, operator: v.operator })));
    
    return c.json({
      total: total || 0,
      withOperator: withOperator || 0,
      withWebsite: withWebsite || 0,
      needingURLs: needingURLs || 0,
      sampleWithWebsites: sampleWithWebsites,
      sampleWithoutWebsites: sampleWithoutWebsites
    });
    
  } catch (error) {
    console.error('Error fetching VIC URL stats:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /export-vic-villages-needing-urls
 * Export VIC villages that have operators but no website URLs
 */
app.get('/make-server-3bba8be8/export-vic-villages-needing-urls', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    const { data: villages, error } = await supabase
      .from('retirement_villages')
      .select('id, name, suburb, postcode, operator, website')
      .eq('state', 'VIC')
      .not('operator', 'is', null)
      .is('website', null)
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching villages:', error);
      return c.json({ error: error.message }, 500);
    }
    
    return c.json(villages || []);
    
  } catch (error) {
    console.error('Error exporting villages needing URLs:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * DELETE /admin/delete-vic-villages
 * Delete ALL VIC villages using service role (bypasses RLS)
 */
app.delete('/make-server-3bba8be8/admin/delete-vic-villages', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    console.log('🗑️ [Admin] Starting VIC village deletion...');
    
    // First, count how many we're about to delete
    const { count: beforeCount, error: countError } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'VIC');
    
    if (countError) {
      console.error('❌ [Admin] Error counting VIC villages:', countError);
      return c.json({ error: 'Database error', details: countError.message }, 500);
    }
    
    console.log(`🗑️ [Admin] Found ${beforeCount} VIC villages to delete`);
    
    // Perform the deletion
    const { error: deleteError } = await supabase
      .from('retirement_villages')
      .delete()
      .eq('state', 'VIC');
    
    if (deleteError) {
      console.error('❌ [Admin] Error deleting VIC villages:', deleteError);
      return c.json({ error: 'Delete failed', details: deleteError.message }, 500);
    }
    
    // Verify deletion
    const { count: afterCount, error: verifyError } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'VIC');
    
    if (verifyError) {
      console.error('⚠️ [Admin] Error verifying deletion:', verifyError);
      // Don't fail if we can't verify - the delete probably worked
    }
    
    const deletedCount = (beforeCount || 0) - (afterCount || 0);
    
    console.log(`✅ [Admin] Successfully deleted ${deletedCount} VIC villages`);
    console.log(`📊 [Admin] Before: ${beforeCount}, After: ${afterCount}`);
    
    return c.json({
      success: true,
      deletedCount,
      beforeCount,
      afterCount,
      message: `Successfully deleted ${deletedCount} VIC villages. ${afterCount} remaining (should be 0).`
    });
    
  } catch (error) {
    console.error('❌ [Admin] Error in delete-vic-villages endpoint:', error);
    return c.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

export default app;