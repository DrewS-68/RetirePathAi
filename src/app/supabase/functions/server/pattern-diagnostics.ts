// Pattern Diagnostics - Debug why pattern detection isn't working
import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

/**
 * GET /make-server-3bba8be8/pattern-diagnostics/operator-url-stats
 * Show statistics about operators and their village URLs
 */
app.get('/make-server-3bba8be8/pattern-diagnostics/operator-url-stats', async (c) => {
  try {
    console.log('📊 ANALYZING OPERATOR URL STATISTICS');
    console.log('='.repeat(60));

    // Get ALL VIC villages with operators (regardless of website)
    const { data: allVillages, error: fetchError } = await supabase
      .from('retirement_villages')
      .select('id, name, operator, website')
      .eq('state', 'VIC')
      .not('operator', 'is', null)
      .not('operator', 'eq', '');

    if (fetchError) {
      return c.json({ error: fetchError.message }, 500);
    }

    console.log(`Total VIC villages with operator: ${allVillages.length}`);

    // Group by operator
    const operatorGroups: { [key: string]: any[] } = {};
    allVillages.forEach(v => {
      const op = v.operator.trim();
      if (!operatorGroups[op]) {
        operatorGroups[op] = [];
      }
      operatorGroups[op].push(v);
    });

    // Analyze each operator
    const operatorStats = Object.entries(operatorGroups)
      .map(([operator, villages]) => {
        const villagesWithWebsites = villages.filter(v => v.website && v.website.trim() !== '');
        return {
          operator,
          villageCount: villagesWithWebsites.length, // Count only villages WITH websites
          totalVillages: villages.length, // Total villages for this operator
          villages: villagesWithWebsites.map(v => ({
            name: v.name,
            website: v.website
          }))
        };
      })
      .sort((a, b) => b.villageCount - a.villageCount);

    // Show top 20 operators
    console.log('\n📋 TOP 20 OPERATORS (by village count with websites):\n');
    const top20 = operatorStats.slice(0, 20);
    
    top20.forEach((stat, index) => {
      console.log(`${index + 1}. ${stat.operator}: ${stat.villageCount} villages with websites (${stat.totalVillages} total)`);
      
      // Show sample URLs
      if (stat.villageCount >= 2) {
        console.log('   Sample URLs:');
        stat.villages.slice(0, 3).forEach(v => {
          console.log(`   - ${v.name}: ${v.website}`);
        });
      }
      console.log('');
    });

    // Statistics
    const eligibleForPattern = operatorStats.filter(s => s.villageCount >= 2);
    const needsPattern = operatorStats.filter(s => s.villageCount >= 2 && s.villageCount <= 10);
    const bigOperators = operatorStats.filter(s => s.villageCount > 10);
    const totalVillagesWithWebsites = operatorStats.reduce((sum, s) => sum + s.villageCount, 0);

    const summary = {
      totalOperators: operatorStats.length,
      operatorsWithMultipleVillages: eligibleForPattern.length,
      operatorsWithOnlyOneVillage: operatorStats.filter(s => s.villageCount === 1).length,
      operatorsWithNoWebsites: operatorStats.filter(s => s.villageCount === 0).length,
      bigOperators: bigOperators.length,
      totalVillagesWithWebsites: totalVillagesWithWebsites
    };

    console.log('='.repeat(60));
    console.log('📊 SUMMARY:');
    console.log(`   Total operators: ${summary.totalOperators}`);
    console.log(`   Operators with ≥2 villages (with websites): ${summary.operatorsWithMultipleVillages}`);
    console.log(`   Operators with 1 village: ${summary.operatorsWithOnlyOneVillage}`);
    console.log(`   Operators with no websites: ${summary.operatorsWithNoWebsites}`);
    console.log(`   Big operators (>10 villages): ${summary.bigOperators}`);
    console.log(`   Total villages with websites: ${summary.totalVillagesWithWebsites}`);

    return c.json({
      success: true,
      summary,
      top20Operators: top20,
      allOperatorStats: operatorStats
    });

  } catch (error: any) {
    console.error('Error in diagnostics:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /make-server-3bba8be8/pattern-diagnostics/test-single-operator
 * Test pattern detection for a single operator with detailed logging
 */
app.post('/make-server-3bba8be8/pattern-diagnostics/test-single-operator', async (c) => {
  try {
    const { operator } = await c.req.json();

    if (!operator) {
      return c.json({ error: 'Operator name required' }, 400);
    }

    console.log(`\n🔍 DETAILED PATTERN ANALYSIS FOR: ${operator}`);
    console.log('='.repeat(60));

    // Get villages
    const { data: villages, error: fetchError } = await supabase
      .from('retirement_villages')
      .select('id, name, operator, website')
      .eq('state', 'VIC')
      .ilike('operator', operator)
      .not('website', 'is', null)
      .not('website', 'eq', '')
      .limit(10);

    if (fetchError || !villages || villages.length === 0) {
      return c.json({ error: 'No villages found' }, 404);
    }

    console.log(`Found ${villages.length} villages with websites:\n`);
    villages.forEach((v, i) => {
      console.log(`${i + 1}. ${v.name}`);
      console.log(`   URL: ${v.website}`);
      
      // Parse URL
      try {
        const url = new URL(v.website);
        console.log(`   Domain: ${url.hostname}`);
        console.log(`   Path: ${url.pathname}`);
        
        // Check for village name/slug in URL
        const slug = v.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const nameInPath = url.pathname.toLowerCase().includes(slug);
        console.log(`   Slug "${slug}" in path? ${nameInPath ? '✅ YES' : '❌ NO'}`);
      } catch (e) {
        console.log(`   ⚠️ Invalid URL format`);
      }
      console.log('');
    });

    // Try to detect common base URLs
    const baseUrls: { [key: string]: number } = {};
    villages.forEach(v => {
      try {
        const url = new URL(v.website);
        const base = `${url.protocol}//${url.hostname}`;
        baseUrls[base] = (baseUrls[base] || 0) + 1;
      } catch {}
    });

    console.log('Base URL Distribution:');
    Object.entries(baseUrls)
      .sort((a, b) => b[1] - a[1])
      .forEach(([base, count]) => {
        console.log(`   ${base}: ${count} villages (${((count / villages.length) * 100).toFixed(0)}%)`);
      });

    return c.json({
      success: true,
      operator,
      villageCount: villages.length,
      villages: villages.map(v => {
        const slug = v.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        try {
          const url = new URL(v.website);
          return {
            name: v.name,
            website: v.website,
            domain: url.hostname,
            path: url.pathname,
            slug,
            slugInPath: url.pathname.toLowerCase().includes(slug)
          };
        } catch {
          return {
            name: v.name,
            website: v.website,
            error: 'Invalid URL'
          };
        }
      }),
      baseUrls
    });

  } catch (error: any) {
    console.error('Error:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default app;