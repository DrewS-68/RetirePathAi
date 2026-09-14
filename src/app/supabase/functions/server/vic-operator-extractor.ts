// Extract operators from descriptions and update operator field
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
 * POST /make-server-3bba8be8/admin/vic-villages/extract-operators-from-descriptions
 * Extract operator names from descriptions and update the operator field
 */
app.post('/make-server-3bba8be8/admin/vic-villages/extract-operators-from-descriptions', async (c) => {
  try {
    console.log('🔧 EXTRACTING OPERATORS FROM DESCRIPTIONS');

    // Get all VIC villages
    const { data: villages, error: fetchError } = await supabase
      .from('retirement_villages')
      .select('id, name, description, operator')
      .eq('state', 'VIC')
      .order('name', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching villages:', fetchError);
      return c.json({ error: 'Failed to fetch villages', details: fetchError.message }, 500);
    }

    console.log(`📋 Found ${villages.length} VIC villages`);

    const results: any[] = [];
    let successCount = 0;
    let skipCount = 0;
    let failCount = 0;

    for (const village of villages) {
      try {
        // Skip if already has operator
        if (village.operator && village.operator.trim() !== '') {
          console.log(`⏭️ ${village.name}: Already has operator "${village.operator}"`);
          skipCount++;
          continue;
        }

        // Skip if no description
        if (!village.description) {
          console.log(`⏭️ ${village.name}: No description`);
          skipCount++;
          continue;
        }

        // Extract operator from description like "Village Name - Operated by OperatorName"
        const operatedByPattern = /(?:- Operated by |Operated by )([^-\n]+)/i;
        const match = village.description.match(operatedByPattern);

        if (!match) {
          console.log(`⏭️ ${village.name}: No "Operated by" pattern in description`);
          skipCount++;
          continue;
        }

        const extractedOperator = match[1].trim();
        console.log(`🔍 ${village.name}: Found operator "${extractedOperator}"`);

        // Update the operator field
        const { error: updateError } = await supabase
          .from('retirement_villages')
          .update({ operator: extractedOperator })
          .eq('id', village.id);

        if (updateError) {
          console.error(`❌ Failed to update ${village.name}:`, updateError);
          results.push({
            villageName: village.name,
            extractedOperator: extractedOperator,
            success: false,
            error: updateError.message
          });
          failCount++;
        } else {
          console.log(`✅ ${village.name}: Operator set to "${extractedOperator}"`);
          results.push({
            villageName: village.name,
            extractedOperator: extractedOperator,
            success: true
          });
          successCount++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));

      } catch (err) {
        console.error(`❌ Error processing ${village.name}:`, err);
        results.push({
          villageName: village.name,
          extractedOperator: '',
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
        failCount++;
      }
    }

    const summary = `
✅ Success: ${successCount}
❌ Failed: ${failCount}
⏭️ Skipped: ${skipCount}
📊 Total: ${villages.length}
    `.trim();

    console.log('\n' + summary);

    return c.json({
      success: true,
      summary: summary,
      results: results,
      counts: {
        success: successCount,
        failed: failCount,
        skipped: skipCount,
        total: villages.length
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
