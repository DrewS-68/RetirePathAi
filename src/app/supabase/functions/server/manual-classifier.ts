import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// GET /make-server-3bba8be8/manual-classifier/unclassified
// Fetch unclassified villages (facility_type is null) - LIMITED TO 50 AT A TIME
app.get('/make-server-3bba8be8/manual-classifier/unclassified', async (c) => {
  try {
    console.log('[Manual Classifier] Starting fetch...');
    console.log('[Manual Classifier] Supabase URL:', Deno.env.get('SUPABASE_URL'));
    console.log('[Manual Classifier] Has Service Role Key:', !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));

    // First, get the TOTAL count of unclassified villages
    console.log('[Manual Classifier] Counting total unclassified villages...');
    const { count: totalCount, error: countError } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true })
      .is('facility_type', null);

    if (countError) {
      console.error('[Manual Classifier] Count error:', countError);
      // Don't fail - continue with fetching villages
    }

    console.log('[Manual Classifier] Total unclassified count:', totalCount);

    // Then fetch the first 50 villages for display
    console.log('[Manual Classifier] Executing Supabase query for first 50...');
    const { data, error } = await supabase
      .from('retirement_villages')
      .select('id, name, suburb, state, operator, description, amenities, care_services, activities, website, facility_type')
      .is('facility_type', null)
      .order('name', { ascending: true })
      .limit(50);

    console.log('[Manual Classifier] Query completed');
    console.log('[Manual Classifier] Error:', error);
    console.log('[Manual Classifier] Data length:', data?.length);

    if (error) {
      console.error('[Manual Classifier] Supabase error details:', JSON.stringify(error, null, 2));
      throw new Error(`Supabase query failed: ${error.message || error.hint || JSON.stringify(error)}`);
    }

    console.log(`[Manual Classifier] Successfully fetched ${data?.length || 0} villages out of ${totalCount || 'unknown'} total`);

    return c.json({
      success: true,
      total: totalCount || data?.length || 0,  // Use ACTUAL total count from database
      showing: data?.length || 0,  // How many we're returning in this batch
      villages: data || [],
    });

  } catch (err) {
    console.error('[Manual Classifier] FULL Error:', err);
    console.error('[Manual Classifier] Error stack:', err?.stack);
    const errorMessage = err?.message || err?.toString() || 'Unknown error';
    return c.json({ 
      error: `Failed to fetch unclassified villages: ${errorMessage}`,
      errorType: typeof err,
      errorKeys: err ? Object.keys(err) : [],
      stack: err?.stack
    }, 500);
  }
});

// POST /make-server-3bba8be8/manual-classifier/classify
// Classify a single village
app.post('/make-server-3bba8be8/manual-classifier/classify', async (c) => {
  try {
    const body = await c.req.json();
    const { villageId, facilityType } = body;

    if (!villageId || !facilityType) {
      return c.json({ error: 'Missing villageId or facilityType' }, 400);
    }

    if (!['retirement_village', 'aged_care', 'both', 'not_a_village'].includes(facilityType)) {
      return c.json({ error: 'Invalid facilityType. Must be retirement_village, aged_care, both, or not_a_village' }, 400);
    }

    console.log(`[Manual Classifier] Classifying village ${villageId} as ${facilityType}`);

    // Update the village
    const { error } = await supabase
      .from('retirement_villages')
      .update({ facility_type: facilityType })
      .eq('id', villageId);

    if (error) {
      console.error('[Manual Classifier] Error updating village:', error);
      throw error;
    }

    console.log(`[Manual Classifier] Successfully classified village ${villageId}`);

    return c.json({
      success: true,
      villageId,
      facilityType,
    });

  } catch (err) {
    console.error('[Manual Classifier] Error:', err);
    return c.json({ error: `Failed to classify village: ${err.message}` }, 500);
  }
});

// GET /make-server-3bba8be8/manual-classifier/stats
// Get classification statistics
app.get('/make-server-3bba8be8/manual-classifier/stats', async (c) => {
  try {
    console.log('[Manual Classifier] Fetching classification stats...');

    // Count by facility type
    const { data: retirementCount } = await supabase
      .from('retirement_villages')
      .select('id', { count: 'exact', head: true })
      .eq('facility_type', 'retirement_village');

    const { data: agedCareCount } = await supabase
      .from('retirement_villages')
      .select('id', { count: 'exact', head: true })
      .eq('facility_type', 'aged_care');

    const { data: bothCount } = await supabase
      .from('retirement_villages')
      .select('id', { count: 'exact', head: true })
      .eq('facility_type', 'both');

    const { data: unclassifiedCount } = await supabase
      .from('retirement_villages')
      .select('id', { count: 'exact', head: true })
      .is('facility_type', null);

    const { data: totalCount } = await supabase
      .from('retirement_villages')
      .select('id', { count: 'exact', head: true });

    const stats = {
      total: totalCount || 0,
      retirement_village: retirementCount || 0,
      aged_care: agedCareCount || 0,
      both: bothCount || 0,
      unclassified: unclassifiedCount || 0,
    };

    console.log('[Manual Classifier] Stats:', stats);

    return c.json(stats);

  } catch (err) {
    console.error('[Manual Classifier] Error:', err);
    return c.json({ error: `Failed to fetch stats: ${err.message}` }, 500);
  }
});

// GET /make-server-3bba8be8/manual-classifier/villages-by-operator/:operator
// Get all villages by a specific operator
app.get('/make-server-3bba8be8/manual-classifier/villages-by-operator/:operator', async (c) => {
  try {
    const operator = c.req.param('operator');
    
    if (!operator) {
      return c.json({ error: 'Operator name is required' }, 400);
    }

    console.log(`[Manual Classifier] Fetching villages by operator: ${operator}`);

    const { data, error, count } = await supabase
      .from('retirement_villages')
      .select('id, name, suburb, state, facility_type, website', { count: 'exact' })
      .ilike('operator', operator) // Case-insensitive match
      .order('name', { ascending: true });

    if (error) {
      console.error('[Manual Classifier] Error fetching villages by operator:', error);
      throw error;
    }

    console.log(`[Manual Classifier] Found ${count} villages by operator: ${operator}`);

    return c.json({
      success: true,
      operator,
      count: count || 0,
      villages: data || [],
    });

  } catch (err) {
    console.error('[Manual Classifier] Error:', err);
    return c.json({ error: `Failed to fetch villages by operator: ${err.message}` }, 500);
  }
});

export default app;