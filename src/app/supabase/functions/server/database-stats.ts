import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// GET /make-server-3bba8be8/database-stats/villages
// Get comprehensive statistics about villages in the database
app.get('/make-server-3bba8be8/database-stats/villages', async (c) => {
  try {
    console.log('[Database Stats] Fetching village statistics...');

    // Get total count (no limit)
    const { count: totalCount, error: countError } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('[Database Stats] Error getting total count:', countError);
      return c.json({ error: `Count error: ${countError.message}` }, 500);
    }

    console.log(`[Database Stats] Total count: ${totalCount}`);

    // Fetch ALL rows with only the columns we need for grouping
    // Increase limit to 10000 to handle all villages
    const { data: allVillages, error: fetchError } = await supabase
      .from('retirement_villages')
      .select('status, facility_type, state, website, entry_price_min, entry_price_max, monthly_fees_min, monthly_fees_max')
      .limit(10000);

    if (fetchError) {
      console.error('[Database Stats] Error fetching villages:', fetchError);
      return c.json({ error: `Fetch error: ${fetchError.message}` }, 500);
    }

    console.log(`[Database Stats] Fetched ${allVillages.length} villages for analysis`);

    // Group by status
    const statusBreakdown = allVillages.reduce((acc: any, row: any) => {
      const status = row.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Group by facility_type
    const facilityBreakdown = allVillages.reduce((acc: any, row: any) => {
      const type = row.facility_type || 'unclassified';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Group by state
    const stateBreakdown = allVillages.reduce((acc: any, row: any) => {
      const state = row.state || 'unknown';
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {});

    // Count with website
    const withWebsiteCount = allVillages.filter(v => 
      v.website && v.website.trim() !== ''
    ).length;

    // Count with pricing
    const withPricingCount = allVillages.filter(v => 
      v.entry_price_min || v.entry_price_max || v.monthly_fees_min || v.monthly_fees_max
    ).length;

    const stats = {
      total: totalCount,
      byStatus: statusBreakdown,
      byFacilityType: facilityBreakdown,
      byState: stateBreakdown,
      withWebsite: withWebsiteCount,
      withPricing: withPricingCount,
    };

    console.log('[Database Stats] Statistics retrieved:', JSON.stringify(stats, null, 2));

    return c.json(stats);

  } catch (err) {
    console.error('[Database Stats] Error:', err);
    return c.json({ error: `Failed to get stats: ${err.message}` }, 500);
  }
});

// GET /make-server-3bba8be8/database-stats/vic-urls
// Get sample of VIC village URLs to analyze what we're scraping
app.get('/make-server-3bba8be8/database-stats/vic-urls', async (c) => {
  try {
    console.log('[Database Stats] Fetching VIC village URL samples...');

    // Get ALL VIC villages with their URLs (not just 20 - we want to see the full picture)
    const { data: vicVillages, error } = await supabase
      .from('retirement_villages')
      .select('id, name, website, state, status')
      .eq('state', 'VIC')
      .eq('status', 'approved');  // CRITICAL FIX: Only get approved villages

    if (error) {
      console.error('[Database Stats] Error fetching VIC villages:', error);
      return c.json({ error: `Fetch error: ${error.message}` }, 500);
    }

    console.log(`[Database Stats] Found ${vicVillages.length} VIC villages`);

    return c.json({
      total: vicVillages.length,
      villages: vicVillages
    });

  } catch (err) {
    console.error('[Database Stats] Error:', err);
    return c.json({ error: `Failed to get VIC URLs: ${err.message}` }, 500);
  }
});

// POST /make-server-3bba8be8/database-stats/bulk-update-urls
// Bulk update village URLs from CSV import
app.post('/make-server-3bba8be8/database-stats/bulk-update-urls', async (c) => {
  try {
    const body = await c.req.json();
    const { updates } = body;

    if (!updates || !Array.isArray(updates)) {
      return c.json({ error: 'Invalid request: updates array required' }, 400);
    }

    console.log(`[Database Stats] Bulk updating ${updates.length} village URLs...`);

    let updatedCount = 0;
    const errors: any[] = [];

    // Update each village individually (Supabase doesn't support bulk updates easily)
    for (const update of updates) {
      const { villageId, newUrl } = update;

      if (!villageId || !newUrl) {
        errors.push({ villageId, error: 'Missing villageId or newUrl' });
        continue;
      }

      const { error } = await supabase
        .from('retirement_villages')
        .update({ website: newUrl })
        .eq('id', villageId);

      if (error) {
        console.error(`[Database Stats] Error updating village ${villageId}:`, error);
        errors.push({ villageId, error: error.message });
      } else {
        updatedCount++;
      }
    }

    console.log(`[Database Stats] Successfully updated ${updatedCount}/${updates.length} villages`);

    if (errors.length > 0) {
      console.error('[Database Stats] Some updates failed:', errors);
    }

    return c.json({
      success: true,
      updatedCount,
      totalRequested: updates.length,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (err) {
    console.error('[Database Stats] Error:', err);
    return c.json({ error: `Failed to bulk update URLs: ${err.message}` }, 500);
  }
});

export default app;