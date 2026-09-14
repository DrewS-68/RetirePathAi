import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Search for a village by name
app.get('/make-server-3bba8be8/village-fixer/search', async (c) => {
  try {
    const name = c.req.query('name');
    
    if (!name) {
      return c.json({ error: 'Name parameter is required' }, 400);
    }

    console.log(`[Village Fixer] Searching for village: ${name}`);

    // First, let's check the total count to make sure table has data
    const { count: totalCount } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true });
    
    console.log(`[Village Fixer] Total villages in table: ${totalCount}`);

    // Search for the village (case-insensitive, partial match)
    const { data: villages, error } = await supabase
      .from('retirement_villages')
      .select('id, name, suburb, state, operator, website, facility_type, description')
      .ilike('name', `%${name}%`)
      .limit(10);

    console.log('[Village Fixer] Query executed');
    console.log('[Village Fixer] Error:', error);
    console.log('[Village Fixer] Villages returned:', villages);
    console.log(`[Village Fixer] Found ${villages?.length || 0} villages`);

    if (error) {
      console.error('[Village Fixer] Database error searching village:', error);
      return c.json({ error: 'Database error', details: error.message }, 500);
    }

    if (!villages || villages.length === 0) {
      console.log('[Village Fixer] No villages found');
      return c.json({ villages: [], count: 0, message: 'No villages found' });
    }

    console.log(`[Village Fixer] Found ${villages.length} village(s):`, villages.map(v => ({ id: v.id, name: v.name })));

    // If only one result, return it as the selected village
    // If multiple results, return all so user can choose
    return c.json({ 
      village: villages.length === 1 ? villages[0] : null,
      villages: villages,
      count: villages.length 
    });
  } catch (error) {
    console.error('[Village Fixer] Unexpected error in village search:', error);
    return c.json({ 
      error: 'Failed to search village', 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

// Update village data
app.post('/make-server-3bba8be8/village-fixer/update', async (c) => {
  try {
    const body = await c.req.json();
    const { id, name, suburb, state, operator, website, facility_type } = body;

    if (!id || !name || !suburb || !state) {
      return c.json({ error: 'Missing required fields: id, name, suburb, state' }, 400);
    }

    console.log(`Updating village ${id}:`, { name, suburb, state, operator, website, facility_type });

    // Update the village
    const { data, error } = await supabase
      .from('retirement_villages')
      .update({
        name,
        suburb,
        state,
        operator,
        website,
        facility_type,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating village:', error);
      return c.json({ error: 'Failed to update village', details: error.message }, 500);
    }

    console.log(`Successfully updated village ${id}`);

    return c.json({ 
      success: true, 
      village: data,
      message: 'Village updated successfully'
    });
  } catch (error) {
    console.error('Error in village update:', error);
    return c.json({ error: 'Failed to update village' }, 500);
  }
});

export default app;