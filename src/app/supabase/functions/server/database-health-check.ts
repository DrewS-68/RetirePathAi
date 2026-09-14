// Database Health Check - Check VIC villages status
import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

/**
 * GET /make-server-3bba8be8/database-health-check/vic-villages
 * Check the status of VIC villages in the database
 */
app.get('/make-server-3bba8be8/database-health-check/vic-villages', async (c) => {
  try {
    console.log('🏥 DATABASE HEALTH CHECK - VIC VILLAGES');
    console.log('='.repeat(60));

    // 1. Total VIC villages - GET ALL FIELDS INCLUDING scraped_data
    const { data: allVic, error: e1 } = await supabase
      .from('retirement_villages')
      .select('id, name, operator, website, state, scraped_data')
      .eq('state', 'VIC');

    if (e1) {
      return c.json({ error: e1.message }, 500);
    }

    console.log(`\n📊 TOTAL VIC VILLAGES: ${allVic.length}`);

    // 2. VIC villages with operators
    const withOperator = allVic.filter(v => v.operator && v.operator.trim() !== '');
    console.log(`   With operator field: ${withOperator.length}`);

    // 3. VIC villages with websites in the WEBSITE field
    const withWebsite = allVic.filter(v => v.website && v.website.trim() !== '');
    console.log(`   With website field: ${withWebsite.length}`);

    // 4. VIC villages with websites in SCRAPED_DATA field
    const withScrapedWebsite = allVic.filter(v => {
      const scraped = v.scraped_data as any;
      return scraped?.website && scraped.website.trim() !== '';
    });
    console.log(`   With scraped_data.website: ${withScrapedWebsite.length}`);

    // 5. VIC villages with BOTH operator and website (either field)
    const withBoth = allVic.filter(v => {
      const hasOperator = v.operator && v.operator.trim() !== '';
      const hasWebsite = v.website && v.website.trim() !== '';
      const scraped = v.scraped_data as any;
      const hasScrapedWebsite = scraped?.website && scraped.website.trim() !== '';
      return hasOperator && (hasWebsite || hasScrapedWebsite);
    });
    console.log(`   With BOTH operator and website (any source): ${withBoth.length}`);

    // 6. Sample villages (first 10) - SHOW BOTH FIELDS
    console.log('\n📋 SAMPLE VILLAGES (first 10):');
    allVic.slice(0, 10).forEach((v, i) => {
      const scraped = v.scraped_data as any;
      console.log(`\n${i + 1}. ${v.name}`);
      console.log(`   Operator: ${v.operator || '❌ EMPTY'}`);
      console.log(`   Website field: ${v.website || '❌ EMPTY'}`);
      console.log(`   Scraped website: ${scraped?.website || '❌ EMPTY'}`);
    });

    // 7. Operator distribution
    const operatorCounts: { [key: string]: number } = {};
    withOperator.forEach(v => {
      const op = v.operator.trim();
      operatorCounts[op] = (operatorCounts[op] || 0) + 1;
    });

    const topOperators = Object.entries(operatorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    console.log('\n📊 TOP 10 OPERATORS (by village count):');
    topOperators.forEach(([op, count], i) => {
      console.log(`${i + 1}. ${op}: ${count} villages`);
    });

    // 8. Website domain distribution (from BOTH sources)
    const domains: { [key: string]: number } = {};
    allVic.forEach(v => {
      let websiteUrl = v.website;
      if (!websiteUrl || websiteUrl.trim() === '') {
        const scraped = v.scraped_data as any;
        websiteUrl = scraped?.website;
      }
      
      if (websiteUrl && websiteUrl.trim() !== '') {
        try {
          const url = new URL(websiteUrl);
          const domain = url.hostname;
          domains[domain] = (domains[domain] || 0) + 1;
        } catch {}
      }
    });

    const topDomains = Object.entries(domains)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    console.log('\n🌐 TOP 10 WEBSITE DOMAINS (from all sources):');
    topDomains.forEach(([domain, count], i) => {
      console.log(`${i + 1}. ${domain}: ${count} villages`);
    });

    // 9. CRITICAL INSIGHT: How many need migration?
    const needsMigration = allVic.filter(v => {
      const hasWebsiteField = v.website && v.website.trim() !== '';
      const scraped = v.scraped_data as any;
      const hasScrapedWebsite = scraped?.website && scraped.website.trim() !== '';
      return !hasWebsiteField && hasScrapedWebsite;
    });

    console.log('\n🔥 MIGRATION NEEDED:');
    console.log(`   ${needsMigration.length} villages have scraped websites but NO website field!`);
    console.log(`   These need to be copied from scraped_data.website → website`);

    return c.json({
      success: true,
      summary: {
        totalVicVillages: allVic.length,
        withOperator: withOperator.length,
        withWebsite: withWebsite.length,
        withScrapedWebsite: withScrapedWebsite.length,
        withBoth: withBoth.length,
        uniqueOperators: Object.keys(operatorCounts).length,
        needsMigration: needsMigration.length
      },
      topOperators: topOperators.map(([op, count]) => ({ operator: op, count })),
      topDomains: topDomains.map(([domain, count]) => ({ domain, count })),
      sampleVillages: allVic.slice(0, 20).map(v => {
        const scraped = v.scraped_data as any;
        return {
          name: v.name,
          operator: v.operator || null,
          website: v.website || null,
          scrapedWebsite: scraped?.website || null,
          hasOperator: !!(v.operator && v.operator.trim()),
          hasWebsite: !!(v.website && v.website.trim()),
          hasScrapedWebsite: !!(scraped?.website && scraped.website.trim())
        };
      })
    });

  } catch (error: any) {
    console.error('Health check error:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /make-server-3bba8be8/database-health-check/inspect-scraped-data
 * Inspect the actual structure of scraped_data field
 */
app.get('/make-server-3bba8be8/database-health-check/inspect-scraped-data', async (c) => {
  try {
    console.log('🔍 INSPECTING SCRAPED_DATA STRUCTURE');
    console.log('='.repeat(60));

    // Get all VIC villages with scraped_data
    const { data: allVic, error: e1 } = await supabase
      .from('retirement_villages')
      .select('id, name, operator, website, scraped_data')
      .eq('state', 'VIC')
      .limit(100); // First 100 for inspection

    if (e1) {
      return c.json({ error: e1.message }, 500);
    }

    console.log(`Total villages inspected: ${allVic.length}`);

    // Count how many have scraped_data
    const withScrapedData = allVic.filter(v => v.scraped_data && Object.keys(v.scraped_data as any).length > 0);
    const emptyScrapedData = allVic.filter(v => !v.scraped_data || Object.keys(v.scraped_data as any).length === 0);

    console.log(`With scraped_data: ${withScrapedData.length}`);
    console.log(`Empty scraped_data: ${emptyScrapedData.length}`);

    // Find all unique keys in scraped_data
    const allKeys = new Set<string>();
    withScrapedData.forEach(v => {
      const scraped = v.scraped_data as any;
      if (scraped) {
        Object.keys(scraped).forEach(key => allKeys.add(key));
      }
    });

    console.log('\n🔑 UNIQUE KEYS FOUND IN scraped_data:');
    Array.from(allKeys).forEach(key => {
      console.log(`   - ${key}`);
    });

    // Sample villages with their scraped_data
    console.log('\n📋 SAMPLE VILLAGES:');
    const samples = allVic.slice(0, 10);
    samples.forEach((v, i) => {
      console.log(`\n${i + 1}. ${v.name}`);
      console.log(`   Operator: ${v.operator || 'NONE'}`);
      console.log(`   Website field: ${v.website || 'NONE'}`);
      if (v.scraped_data) {
        console.log(`   scraped_data:`, JSON.stringify(v.scraped_data, null, 2));
      } else {
        console.log(`   scraped_data: EMPTY`);
      }
    });

    return c.json({
      success: true,
      summary: {
        total: allVic.length,
        withScrapedData: withScrapedData.length,
        emptyScrapedData: emptyScrapedData.length
      },
      commonKeys: Array.from(allKeys),
      samples: samples.map(v => ({
        name: v.name,
        operator: v.operator,
        website: v.website,
        scrapedData: v.scraped_data
      }))
    });

  } catch (error: any) {
    console.error('Inspection error:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /make-server-3bba8be8/database-health-check/migrate-websites
 * Copy scraped_data.website to main website field for VIC villages
 */
app.post('/make-server-3bba8be8/database-health-check/migrate-websites', async (c) => {
  try {
    console.log('🔄 STARTING WEBSITE MIGRATION');
    console.log('='.repeat(60));

    // Get all VIC villages with scraped_data
    const { data: allVic, error: fetchError } = await supabase
      .from('retirement_villages')
      .select('id, name, website, scraped_data')
      .eq('state', 'VIC');

    if (fetchError) {
      return c.json({ error: fetchError.message }, 500);
    }

    console.log(`Total VIC villages: ${allVic.length}`);

    let migrated = 0;
    let skipped = 0;
    let noScrapedData = 0;
    const errors: string[] = [];

    // Process each village
    for (const village of allVic) {
      // Skip if already has website
      if (village.website && village.website.trim() !== '') {
        skipped++;
        continue;
      }

      // Check for scraped website
      const scraped = village.scraped_data as any;
      const scrapedWebsite = scraped?.website;

      if (!scrapedWebsite || scrapedWebsite.trim() === '') {
        noScrapedData++;
        continue;
      }

      // Migrate!
      console.log(`Migrating ${village.name}: ${scrapedWebsite}`);
      
      const { error: updateError } = await supabase
        .from('retirement_villages')
        .update({ website: scrapedWebsite })
        .eq('id', village.id);

      if (updateError) {
        console.error(`Error migrating ${village.name}:`, updateError);
        errors.push(`${village.name}: ${updateError.message}`);
      } else {
        migrated++;
      }
    }

    console.log('\n✅ MIGRATION COMPLETE');
    console.log(`   Migrated: ${migrated}`);
    console.log(`   Skipped (had website): ${skipped}`);
    console.log(`   No scraped data: ${noScrapedData}`);
    console.log(`   Errors: ${errors.length}`);

    return c.json({
      success: true,
      migrated,
      skipped,
      noScrapedData,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('Migration error:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default app;