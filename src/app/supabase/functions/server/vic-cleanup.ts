import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Initialize Supabase with service role key (bypasses RLS)
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// DELETE all Victorian villages
app.delete("/make-server-3bba8be8/vic-cleanup/all", async (c) => {
  try {
    console.log('🗑️ VIC CLEANUP: Starting deletion of all Victorian villages...');

    // Get all VIC village IDs
    const { data: vicVillages, error: fetchError } = await supabase
      .from('retirement_villages')
      .select('id')
      .eq('state', 'VIC');

    if (fetchError) {
      console.error('❌ VIC CLEANUP: Failed to fetch villages:', fetchError);
      return c.json({ 
        error: 'Failed to fetch Victorian villages', 
        details: fetchError.message 
      }, 500);
    }

    const idsToDelete = vicVillages?.map(v => v.id) || [];
    console.log(`🗑️ VIC CLEANUP: Found ${idsToDelete.length} villages to delete`);

    if (idsToDelete.length === 0) {
      console.log('✅ VIC CLEANUP: No villages to delete');
      return c.json({ 
        success: true, 
        message: 'No Victorian villages found',
        deletedCount: 0 
      });
    }

    // Delete in batches of 100
    const batchSize = 100;
    let totalDeleted = 0;
    const errors: string[] = [];

    for (let i = 0; i < idsToDelete.length; i += batchSize) {
      const batch = idsToDelete.slice(i, i + batchSize);
      
      console.log(`🗑️ VIC CLEANUP: Deleting batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(idsToDelete.length / batchSize)} (${batch.length} items)...`);

      const { error: deleteError, count } = await supabase
        .from('retirement_villages')
        .delete({ count: 'exact' })
        .in('id', batch);

      if (deleteError) {
        console.error(`❌ VIC CLEANUP: Batch deletion error:`, deleteError);
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${deleteError.message}`);
      } else {
        totalDeleted += (count || 0);
        console.log(`✅ VIC CLEANUP: Deleted ${count} villages (${totalDeleted}/${idsToDelete.length} total)`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`✅ VIC CLEANUP: Deletion complete - ${totalDeleted}/${idsToDelete.length} deleted`);

    if (errors.length > 0) {
      console.error('❌ VIC CLEANUP: Errors encountered:', errors);
      return c.json({
        success: false,
        message: `Partial deletion: ${totalDeleted}/${idsToDelete.length} deleted`,
        deletedCount: totalDeleted,
        errors
      }, 500);
    }

    return c.json({
      success: true,
      message: `Successfully deleted all ${totalDeleted} Victorian villages`,
      deletedCount: totalDeleted
    });

  } catch (err) {
    console.error('❌ VIC CLEANUP: Unexpected error:', err);
    return c.json({ 
      error: 'Unexpected error during deletion', 
      details: err instanceof Error ? err.message : 'Unknown error' 
    }, 500);
  }
});

// GET count of Victorian villages
app.get("/make-server-3bba8be8/vic-cleanup/count", async (c) => {
  try {
    const { count, error } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'VIC');

    if (error) {
      console.error('❌ VIC CLEANUP: Failed to count villages:', error);
      return c.json({ error: 'Failed to count villages', details: error.message }, 500);
    }

    console.log(`📊 VIC CLEANUP: Current VIC village count: ${count || 0}`);

    return c.json({
      success: true,
      count: count || 0
    });

  } catch (err) {
    console.error('❌ VIC CLEANUP: Unexpected error:', err);
    return c.json({ 
      error: 'Unexpected error counting villages', 
      details: err instanceof Error ? err.message : 'Unknown error' 
    }, 500);
  }
});

export default app;
