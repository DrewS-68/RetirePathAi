// VIC Operator Bulk Updater API - Updates operators scraped from websites
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
 * POST /make-server-3bba8be8/admin/vic-operators/update-operator
 * Update a single village's operator field using service role (bypasses RLS)
 */
app.post('/make-server-3bba8be8/admin/vic-operators/update-operator', async (c) => {
  try {
    const body = await c.req.json();
    const { villageId, operator } = body;

    console.log(`📝 UPDATING OPERATOR: Village ID ${villageId} → "${operator}"`);

    if (!villageId) {
      return c.json({ error: 'villageId is required' }, 400);
    }

    if (!operator || typeof operator !== 'string' || operator.trim() === '') {
      return c.json({ error: 'operator must be a non-empty string' }, 400);
    }

    // Update the village using service role (bypasses RLS)
    const { data, error } = await supabase
      .from('retirement_villages')
      .update({ 
        operator: operator.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', villageId)
      .select('id, name, operator')
      .single();

    if (error) {
      console.error('❌ Database error updating operator:', error);
      return c.json({ error: 'Failed to update operator', details: error.message }, 500);
    }

    console.log(`✅ UPDATED: ${data.name} → ${data.operator}`);

    return c.json({
      success: true,
      village: data,
      message: `Successfully updated operator for ${data.name}`
    });

  } catch (err) {
    console.error('❌ Server error:', err);
    return c.json({ 
      error: 'Server error', 
      details: err instanceof Error ? err.message : 'Unknown error' 
    }, 500);
  }
});

/**
 * POST /make-server-3bba8be8/admin/vic-operators/clear-recent
 * Clear operators from VIC villages that were updated in the last X minutes
 * This helps recover from broken scraping runs
 */
app.post('/make-server-3bba8be8/admin/vic-operators/clear-recent', async (c) => {
  try {
    const body = await c.req.json();
    const { minutesAgo = 30 } = body;

    console.log(`🗑️ CLEARING RECENT OPERATORS: Villages updated in last ${minutesAgo} minutes`);

    // Calculate the timestamp threshold
    const thresholdDate = new Date();
    thresholdDate.setMinutes(thresholdDate.getMinutes() - minutesAgo);
    const thresholdISO = thresholdDate.toISOString();

    console.log(`📅 Threshold: ${thresholdISO}`);

    // Find VIC villages updated after the threshold that have operators
    const { data: recentVillages, error: findError } = await supabase
      .from('retirement_villages')
      .select('id, name, operator, updated_at')
      .eq('state', 'VIC')
      .gt('updated_at', thresholdISO)
      .not('operator', 'is', null)
      .neq('operator', '');

    if (findError) {
      console.error('❌ Error finding recent villages:', findError);
      return c.json({ error: 'Failed to find recent villages', details: findError.message }, 500);
    }

    if (!recentVillages || recentVillages.length === 0) {
      console.log('✅ No recent villages found to clear');
      return c.json({
        success: true,
        cleared: 0,
        message: 'No villages were updated in the specified time period'
      });
    }

    console.log(`📋 Found ${recentVillages.length} villages to clear:`, recentVillages.map(v => v.name));

    // Clear operators from these villages
    const villageIds = recentVillages.map(v => v.id);
    const { error: clearError } = await supabase
      .from('retirement_villages')
      .update({ 
        operator: '',
        updated_at: new Date().toISOString()
      })
      .in('id', villageIds);

    if (clearError) {
      console.error('❌ Error clearing operators:', clearError);
      return c.json({ error: 'Failed to clear operators', details: clearError.message }, 500);
    }

    console.log(`✅ CLEARED ${recentVillages.length} operators`);

    return c.json({
      success: true,
      cleared: recentVillages.length,
      villages: recentVillages.map(v => ({ id: v.id, name: v.name, clearedOperator: v.operator })),
      message: `Successfully cleared ${recentVillages.length} operators from recently updated villages`
    });

  } catch (err) {
    console.error('❌ Server error:', err);
    return c.json({ 
      error: 'Server error', 
      details: err instanceof Error ? err.message : 'Unknown error' 
    }, 500);
  }
});

/**
 * GET /make-server-3bba8be8/admin/vic-operators/check-timestamps
 * Check when each VIC village was last updated (diagnostic tool)
 */
app.get('/make-server-3bba8be8/admin/vic-operators/check-timestamps', async (c) => {
  try {
    console.log('🕐 CHECKING VIC VILLAGE TIMESTAMPS');

    // Get all VIC villages with their update timestamps
    const { data: villages, error } = await supabase
      .from('retirement_villages')
      .select('id, name, operator, updated_at')
      .eq('state', 'VIC')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching villages:', error);
      return c.json({ error: 'Failed to fetch villages', details: error.message }, 500);
    }

    // Calculate minutes ago for each village
    const now = new Date();
    const villagesWithTime = villages.map(v => {
      const updatedAt = new Date(v.updated_at);
      const minutesAgo = Math.floor((now.getTime() - updatedAt.getTime()) / 1000 / 60);
      
      return {
        id: v.id,
        name: v.name,
        operator: v.operator,
        updated_at: v.updated_at,
        minutesAgo,
      };
    });

    console.log(`✅ Found ${villages.length} VIC villages`);

    return c.json({
      success: true,
      villages: villagesWithTime,
      summary: {
        total: villages.length,
        withOperators: villages.filter(v => v.operator && v.operator !== '').length,
        missingOperators: villages.filter(v => !v.operator || v.operator === '').length,
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