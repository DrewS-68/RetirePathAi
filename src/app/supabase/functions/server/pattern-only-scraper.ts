import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const app = new Hono();

/**
 * PATTERN-ONLY SCRAPER - NO GOOGLE SEARCH
 * 
 * This scraper ONLY uses URL pattern construction + common URL templates.
 * It's MUCH faster and more reliable than Google Search.
 * 
 * Strategy:
 * 1. Load operator patterns from KV store
 * 2. For each village, construct likely URLs based on operator patterns
 * 3. Verify URLs with HEAD requests (fast, no Google API calls)
 * 4. Return results
 */

// Common retirement village URL patterns by major operators
const OPERATOR_URL_TEMPLATES: Record<string, (villageName: string, suburb: string) => string[]> = {
  'Aveo': (name, suburb) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return [
      `https://www.aveo.com.au/retirement-villages/${slug}`,
      `https://www.aveo.com.au/villages/${slug}`,
    ];
  },
  'Lendlease': (name, suburb) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return [
      `https://www.lendlease.com/au/retirement/${slug}`,
      `https://www.retireaustralia.com.au/villages/${slug}`,
    ];
  },
  'Stockland': (name, suburb) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return [
      `https://www.stockland.com.au/retirement-living/vic/${slug}`,
      `https://www.stockland.com.au/retirement/${slug}`,
    ];
  },
  'Ryman Healthcare': (name, suburb) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return [
      `https://www.rymanhealthcare.com.au/retirement-villages/victoria/${slug}`,
      `https://www.rymanhealthcare.com.au/villages/${slug}`,
    ];
  },
  'Uniting AgeWell': (name, suburb) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return [
      `https://www.unitingagewell.org/retirement-living/${slug}`,
      `https://www.unitingagewell.org/villages/${slug}`,
    ];
  },
  'IRT': (name, suburb) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return [
      `https://www.irt.org.au/retirement-villages/${slug}`,
      `https://www.irt.org.au/villages/victoria/${slug}`,
    ];
  },
  'Baptcare': (name, suburb) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return [
      `https://www.baptcare.org.au/services/retirement-living/${slug}`,
      `https://www.baptcare.org.au/villages/${slug}`,
    ];
  },
  'Anglicare': (name, suburb) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return [
      `https://www.anglicarevic.org.au/retirement-living/${slug}`,
      `https://www.anglicarevic.org.au/${slug}`,
    ];
  },
  'RSL Care': (name, suburb) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return [
      `https://www.rslcare.org.au/retirement/${slug}`,
      `https://www.rslcare.org.au/villages/${slug}`,
    ];
  },
  'Bolton Clarke': (name, suburb) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return [
      `https://www.boltonclarke.com.au/retirement-villages/${slug}`,
      `https://www.boltonclarke.com.au/${slug}`,
    ];
  },
};

/**
 * POST /pattern-only-scraper/find-websites
 * Find websites using ONLY pattern construction - NO Google Search
 */
app.post('/make-server-3bba8be8/pattern-only-scraper/find-websites', async (c) => {
  console.log('\n🎯 PATTERN-ONLY SCRAPER - NO GOOGLE SEARCH 🎯\n');
  
  try {
    const { villages } = await c.req.json();
    
    if (!villages || !Array.isArray(villages)) {
      return c.json({ error: 'Invalid villages format' }, 400);
    }
    
    console.log(`🔍 Finding websites for ${villages.length} villages using PATTERNS ONLY...`);
    
    const scraperApiKey = Deno.env.get('SCRAPERAPI_KEY');
    
    if (!scraperApiKey) {
      return c.json({ error: 'SCRAPERAPI_KEY not configured' }, 500);
    }
    
    // Load operator URL patterns from KV store
    const patterns = await kv.get('vic_operator_url_patterns') || [];
    console.log(`📋 Loaded ${patterns.length} operator URL patterns from KV store`);
    
    const results = [];
    
    for (const village of villages) {
      try {
        console.log(`\n🏘️ Processing: ${village.name} (${village.operator || 'No operator'})`);
        
        let foundWebsite = null;
        const candidateUrls: string[] = [];
        
        // ========================================
        // STEP 1: Try KV store patterns
        // ========================================
        if (village.operator && patterns.length > 0) {
          const operatorPattern = patterns.find((p: any) => 
            p.operator.toLowerCase() === village.operator.toLowerCase()
          );
          
          if (operatorPattern) {
            console.log(`   🎯 Found KV pattern for: ${village.operator}`);
            
            const villageSlug = village.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '');
            
            let constructedUrl = operatorPattern.pattern
              .replace('{state}', 'vic')
              .replace('{village}', village.name)
              .replace('{villageSlug}', villageSlug);
            
            if (!constructedUrl.startsWith('http')) {
              constructedUrl = `${operatorPattern.baseUrl}${constructedUrl}`;
            }
            
            candidateUrls.push(constructedUrl);
            console.log(`   📝 KV pattern URL: ${constructedUrl}`);
          }
        }
        
        // ========================================
        // STEP 2: Try hardcoded operator templates
        // ========================================
        if (village.operator && OPERATOR_URL_TEMPLATES[village.operator]) {
          const templateUrls = OPERATOR_URL_TEMPLATES[village.operator](
            village.name,
            village.suburb
          );
          candidateUrls.push(...templateUrls);
          console.log(`   📝 Template URLs (${templateUrls.length}): ${templateUrls.join(', ')}`);
        }
        
        // ========================================
        // STEP 3: Try common patterns for unknown operators
        // ========================================
        if (candidateUrls.length === 0) {
          const slug = village.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          const commonPatterns = [
            `https://www.${slug}.com.au`,
            `https://www.${slug}retirement.com.au`,
            `https://www.${slug}village.com.au`,
          ];
          candidateUrls.push(...commonPatterns);
          console.log(`   📝 Common pattern URLs (${commonPatterns.length}): ${commonPatterns.join(', ')}`);
        }
        
        // ========================================
        // STEP 4: Verify candidate URLs with HEAD requests
        // ========================================
        console.log(`   🔍 Testing ${candidateUrls.length} candidate URLs...`);
        
        for (const candidateUrl of candidateUrls) {
          try {
            // Use ScraperAPI to verify the URL exists (HEAD request)
            const testUrl = `https://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(candidateUrl)}&method=HEAD`;
            
            const testResponse = await fetch(testUrl, {
              signal: AbortSignal.timeout(10000) // 10 second timeout
            });
            
            console.log(`   🌐 Testing ${candidateUrl}: ${testResponse.status}`);
            
            // Accept 200 OK or 403 Forbidden (some sites block HEAD requests but exist)
            if (testResponse.status === 200 || testResponse.status === 403) {
              foundWebsite = candidateUrl;
              console.log(`   ✅ FOUND: ${candidateUrl} (${testResponse.status})`);
              break; // Stop after first success
            }
          } catch (error: any) {
            console.log(`   ⚠️  ${candidateUrl}: ${error.message}`);
            continue;
          }
        }
        
        // ========================================
        // Result
        // ========================================
        if (foundWebsite) {
          results.push({
            villageId: village.id,
            villageName: village.name,
            suburb: village.suburb,
            operator: village.operator,
            status: 'found',
            website: foundWebsite,
            websiteType: 'pattern',
            method: 'pattern_construction'
          });
        } else {
          console.log(`   ❌ No valid URL found for ${village.name}`);
          results.push({
            villageId: village.id,
            villageName: village.name,
            suburb: village.suburb,
            operator: village.operator,
            status: 'not_found',
            error: 'No pattern matched',
          });
        }
        
      } catch (error: any) {
        console.error(`❌ Error processing ${village.name}:`, error.message);
        results.push({
          villageId: village.id,
          villageName: village.name,
          status: 'error',
          error: error.message,
        });
      }
    }
    
    const foundCount = results.filter(r => r.status === 'found').length;
    const notFoundCount = results.filter(r => r.status === 'not_found').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    console.log(`\n✅ Pattern-only scraping complete:`);
    console.log(`   Found: ${foundCount}`);
    console.log(`   Not Found: ${notFoundCount}`);
    console.log(`   Errors: ${errorCount}`);
    
    return c.json({ 
      backendVersion: "2.0-pattern-only",
      testMessage: "🎯 Pattern construction ONLY - NO Google Search!",
      success: true, 
      results,
      summary: {
        total: villages.length,
        found: foundCount,
        notFound: notFoundCount,
        errors: errorCount,
      }
    });
    
  } catch (error: any) {
    console.error('Error in pattern-only-scraper endpoint:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default app;
