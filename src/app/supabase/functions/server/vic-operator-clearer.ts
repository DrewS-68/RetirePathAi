import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Initialize Supabase client with service role key
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// POST /make-server-3bba8be8/admin/vic-operators/clear-all - Clear all VIC operators
app.post('/make-server-3bba8be8/admin/vic-operators/clear-all', async (c) => {
  try {
    console.log('🗑️ CLEARING ALL VIC OPERATORS...');

    // Update all VIC villages to have NULL operator
    const { data, error, count } = await supabase
      .from('retirement_villages')
      .update({ operator: null })
      .eq('state', 'VIC')
      .select('id', { count: 'exact' });

    if (error) {
      console.error('❌ Database error:', error);
      throw error;
    }

    console.log(`✅ Cleared ${count} VIC village operators`);

    return c.json({
      success: true,
      cleared: count || 0,
      message: `Successfully cleared ${count} VIC village operators. Ready for fresh scraping!`
    });

  } catch (err: any) {
    console.error('❌ FATAL ERROR clearing operators:', err);
    return c.json({ 
      error: 'Failed to clear operators',
      details: err.message 
    }, 500);
  }
});

export default app;