// VIC Government Data Reconciliation API
import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const app = new Hono();

// Enable CORS
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Initialize Supabase admin client
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

/**
 * POST /vic-reconcile/update
 * Update a village with corrected data from VIC Government CSV
 */
app.post('/make-server-3bba8be8/vic-reconcile/update', async (c) => {
  try {
    const { villageId, updates } = await c.req.json();

    if (!villageId || !updates) {
      return c.json({ error: 'Missing villageId or updates' }, 400);
    }

    const supabase = getSupabaseAdmin();

    // Update the village
    const { data, error } = await supabase
      .from('retirement_villages')
      .update(updates)
      .eq('id', villageId)
      .select()
      .single();

    if (error) {
      console.error(`❌ Error updating village ${villageId}:`, error);
      return c.json({ error: 'Failed to update village', details: error.message }, 500);
    }

    console.log(`✅ Updated village ${villageId}:`, updates);

    return c.json({ success: true, village: data });
  } catch (error) {
    console.error('❌ Unexpected error in vic-reconcile/update:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * POST /vic-reconcile/batch-update
 * Batch update multiple villages
 */
app.post('/make-server-3bba8be8/vic-reconcile/batch-update', async (c) => {
  try {
    const { updates } = await c.req.json();

    if (!Array.isArray(updates) || updates.length === 0) {
      return c.json({ error: 'Invalid updates array' }, 400);
    }

    const supabase = getSupabaseAdmin();
    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (const update of updates) {
      const { villageId, data } = update;

      const { error } = await supabase
        .from('retirement_villages')
        .update(data)
        .eq('id', villageId);

      if (error) {
        results.failed++;
        results.errors.push({ villageId, error: error.message });
        console.error(`❌ Failed to update ${villageId}:`, error);
      } else {
        results.success++;
        console.log(`✅ Updated ${villageId}`);
      }
    }

    return c.json({
      success: true,
      results,
      message: `Updated ${results.success}/${updates.length} villages`,
    });
  } catch (error) {
    console.error('❌ Unexpected error in batch-update:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * POST /vic-reconcile/google-verify
 * Verify village address using Google Search via ScraperAPI
 */
app.post('/make-server-3bba8be8/vic-reconcile/google-verify', async (c) => {
  try {
    const { villageName, currentSuburb } = await c.req.json();

    if (!villageName) {
      return c.json({ error: 'Missing villageName' }, 400);
    }

    const scraperApiKey = Deno.env.get('SCRAPERAPI_KEY');
    if (!scraperApiKey) {
      return c.json({ error: 'SCRAPERAPI_KEY not configured' }, 500);
    }

    // Search for the village with address details
    const searchQuery = `"${villageName}" retirement village Victoria address`;
    const scraperUrl = `https://api.scraperapi.com/structured/google/search?api_key=${scraperApiKey}&query=${encodeURIComponent(searchQuery)}&country=au&num=5`;

    console.log(`🔍 Google verification: "${villageName}"`);

    const response = await fetch(scraperUrl, {
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ ScraperAPI error:`, errorText);
      return c.json({ 
        error: 'ScraperAPI request failed', 
        status: response.status,
        details: errorText.substring(0, 200)
      }, response.status);
    }

    const data = await response.json();

    // Extract address from Google results
    let googleSuburb = null;
    let googlePostcode = null;
    let googleAddress = null;
    let confidence = 'low';

    // Check knowledge graph first (most reliable)
    if (data.knowledge_graph?.address) {
      googleAddress = data.knowledge_graph.address;
    }

    // Check organic results
    if (!googleAddress && data.organic_results?.length > 0) {
      const firstResult = data.organic_results[0];
      
      // Check snippet for address pattern
      const snippet = firstResult.snippet || '';
      const addressMatch = snippet.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:VIC|Victoria)\s+(\d{4})\b/);
      
      if (addressMatch) {
        googleSuburb = addressMatch[1];
        googlePostcode = addressMatch[2];
        googleAddress = `${googleSuburb} VIC ${googlePostcode}`;
        confidence = 'medium';
      }
    }

    // Parse extracted address
    if (googleAddress) {
      const vicMatch = googleAddress.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:VIC|Victoria)\s+(\d{4})\b/i);
      if (vicMatch) {
        googleSuburb = vicMatch[1].toUpperCase();
        googlePostcode = vicMatch[2];
        
        // Check if it matches current suburb
        if (currentSuburb && googleSuburb.toLowerCase() === currentSuburb.toLowerCase()) {
          confidence = 'high';
        }
      }
    }

    console.log(`✅ Google result: ${googleSuburb || 'N/A'} ${googlePostcode || 'N/A'} (confidence: ${confidence})`);

    return c.json({
      success: true,
      villageName,
      google: {
        suburb: googleSuburb,
        postcode: googlePostcode,
        address: googleAddress,
        confidence,
      },
      rawResults: {
        knowledgeGraph: data.knowledge_graph || null,
        firstResult: data.organic_results?.[0] || null,
      }
    });
  } catch (error) {
    console.error('❌ Unexpected error in google-verify:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

export default app;