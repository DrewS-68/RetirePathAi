// VIC Villages Field Inspector - Diagnostic tool to see all database fields
import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const app = new Hono();

// Enable CORS
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

/**
 * GET /make-server-3bba8be8/admin/vic-villages/inspect-fields
 * Get all VIC villages with ALL their fields to diagnose the import issue
 */
app.get('/make-server-3bba8be8/admin/vic-villages/inspect-fields', async (c) => {
  try {
    console.log('🔍 INSPECTING ALL VIC VILLAGE FIELDS');

    const { data: villages, error } = await supabase
      .from('retirement_villages')
      .select('id, name, operator, suburb, postcode, website, description, location, updated_at, created_at')
      .eq('state', 'VIC')
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ Error fetching villages:', error);
      return c.json({ error: 'Failed to fetch villages', details: error.message }, 500);
    }

    console.log(`✅ Found ${villages.length} VIC villages`);
    console.log(`With operators: ${villages.filter(v => v.operator && v.operator !== '').length}`);
    console.log(`With suburb: ${villages.filter(v => v.suburb && v.suburb !== '').length}`);
    console.log(`With website: ${villages.filter(v => v.website && v.website !== '').length}`);

    // Log first 3 villages for debugging
    villages.slice(0, 3).forEach(v => {
      console.log(`\n📋 ${v.name}:`);
      console.log(`  operator: "${v.operator}"`);
      console.log(`  suburb: "${v.suburb}"`);
      console.log(`  postcode: "${v.postcode}"`);
      console.log(`  website: "${v.website}"`);
      console.log(`  updated_at: "${v.updated_at}"`);
    });

    return c.json({
      success: true,
      villages: villages,
      summary: {
        total: villages.length,
        withOperator: villages.filter(v => v.operator && v.operator !== '').length,
        withSuburb: villages.filter(v => v.suburb && v.suburb !== '').length,
        withWebsite: villages.filter(v => v.website && v.website !== '').length,
        recentlyUpdated: villages.filter(v => {
          const updateTime = new Date(v.updated_at).getTime();
          const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
          return updateTime > tenMinutesAgo;
        }).length
      }
    });

  } catch (err) {
    console.error('❌ Server error:', err);
    return c.json({ 
      error: 'Server error', 
      details: err instanceof Error ? err.message : 'Unknown error' 
    }, 500);
  }
});

export default app;