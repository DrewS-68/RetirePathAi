// Smart Operator Scraper - Multi-strategy operator detection
// Combines Google Search, URL analysis, HTML scraping, and whitelist validation
import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

interface OperatorResult {
  operator: string | null;
  confidence: number;
  method: string;
  details?: string;
}

/**
 * STRATEGY 1: Extract operator from village NAME
 * e.g., "Levande Patterson Lakes" → "Levande"
 */
function extractOperatorFromName(villageName: string, operatorWhitelist: string[]): OperatorResult {
  console.log('  📝 Strategy 1: Checking village name...');
  
  const nameLower = villageName.toLowerCase();
  
  for (const operator of operatorWhitelist) {
    const operatorLower = operator.toLowerCase();
    
    // Check if operator name is at the START of village name
    if (nameLower.startsWith(operatorLower + ' ') || nameLower === operatorLower) {
      console.log(`    ✅ Found operator in name: "${operator}"`);
      return { operator, confidence: 100, method: 'village_name' };
    }
    
    // Check if first word of village name matches operator
    const firstWord = villageName.split(' ')[0];
    if (firstWord.toLowerCase() === operatorLower) {
      console.log(`    ✅ Found operator as first word: "${operator}"`);
      return { operator, confidence: 95, method: 'village_name' };
    }
  }
  
  console.log('    ❌ No operator in name');
  return { operator: null, confidence: 0, method: 'village_name' };
}

/**
 * STRATEGY 2: Extract operator from website URL/domain
 * e.g., "rymanhealthcare.com.au" → "Ryman Healthcare"
 */
function extractOperatorFromURL(websiteUrl: string, operatorWhitelist: string[]): OperatorResult {
  console.log('  🌐 Strategy 2: Checking website URL...');
  
  if (!websiteUrl || websiteUrl.trim() === '') {
    console.log('    ⚠️ No URL provided');
    return { operator: null, confidence: 0, method: 'url' };
  }
  
  try {
    const urlLower = websiteUrl.toLowerCase();
    
    // Extract domain name
    const domainMatch = websiteUrl.match(/https?:\/\/(?:www\.)?([^\/]+)/);
    if (!domainMatch) {
      console.log('    ⚠️ Could not parse URL');
      return { operator: null, confidence: 0, method: 'url' };
    }
    
    const domain = domainMatch[1]; // e.g., "rymanhealthcare.com.au"
    console.log(`    Domain: ${domain}`);
    
    // Check if any operator name appears in the domain
    for (const operator of operatorWhitelist) {
      const operatorClean = operator.toLowerCase().replace(/[^a-z0-9]/g, '');
      const domainClean = domain.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Exact match or operator name is in domain
      if (domainClean.includes(operatorClean) || domainClean.startsWith(operatorClean)) {
        console.log(`    ✅ Found operator in domain: "${operator}"`);
        return { operator, confidence: 100, method: 'url_domain', details: domain };
      }
    }
    
    console.log('    ❌ No operator in URL');
    return { operator: null, confidence: 0, method: 'url' };
    
  } catch (error) {
    console.log(`    ⚠️ URL parsing error: ${error.message}`);
    return { operator: null, confidence: 0, method: 'url' };
  }
}

/**
 * STRATEGY 3: Google Search with street address (most specific)
 */
async function googleSearchForOperator(
  villageName: string,
  suburb: string,
  streetAddress: string | null,
  operatorWhitelist: string[]
): Promise<OperatorResult> {
  console.log('  🔍 Strategy 3: Google Search...');
  
  const scraperApiKey = Deno.env.get('SCRAPERAPI_KEY');
  if (!scraperApiKey) {
    console.log('    ⚠️ SCRAPERAPI_KEY not configured');
    return { operator: null, confidence: 0, method: 'google_search' };
  }
  
  try {
    // Build search query with street address if available
    let searchQuery: string;
    if (streetAddress && streetAddress.trim()) {
      searchQuery = `"${villageName}" "${streetAddress}" ${suburb} VIC retirement village`;
    } else {
      searchQuery = `"${villageName}" ${suburb} VIC retirement village operator`;
    }
    
    console.log(`    Query: ${searchQuery}`);
    
    const scraperUrl = `https://api.scraperapi.com/structured/google/search?api_key=${scraperApiKey}&query=${encodeURIComponent(searchQuery)}&country=au&num=10`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(scraperUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`    ⚠️ ScraperAPI error: ${response.status}`);
      return { operator: null, confidence: 0, method: 'google_search' };
    }
    
    const data = await response.json();
    
    if (!data.organic_results || data.organic_results.length === 0) {
      console.log('    ⚠️ No search results');
      return { operator: null, confidence: 0, method: 'google_search' };
    }
    
    console.log(`    Found ${data.organic_results.length} results`);
    
    // Check URLs first (most reliable)
    for (const result of data.organic_results) {
      const url = result.link || result.url || '';
      if (url) {
        const urlResult = extractOperatorFromURL(url, operatorWhitelist);
        if (urlResult.operator) {
          console.log(`    ✅ Found operator in search result URL: "${urlResult.operator}"`);
          return { ...urlResult, method: 'google_search_url' };
        }
      }
    }
    
    // Check text content
    const allText = data.organic_results
      .map((r: any) => `${r.title || ''} ${r.snippet || ''}`)
      .join(' ')
      .toLowerCase();
    
    for (const operator of operatorWhitelist) {
      const operatorLower = operator.toLowerCase();
      if (allText.includes(operatorLower)) {
        console.log(`    ✅ Found operator in search text: "${operator}"`);
        return { operator, confidence: 90, method: 'google_search_text' };
      }
    }
    
    console.log('    ❌ No operator in search results');
    return { operator: null, confidence: 0, method: 'google_search' };
    
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('    ⚠️ Google search timeout');
    } else {
      console.log(`    ⚠️ Google search error: ${error.message}`);
    }
    return { operator: null, confidence: 0, method: 'google_search' };
  }
}

/**
 * STRATEGY 4: Scrape village website HTML
 */
async function scrapeWebsiteForOperator(
  websiteUrl: string,
  villageName: string,
  operatorWhitelist: string[]
): Promise<OperatorResult> {
  console.log('  🤖 Strategy 4: Scraping website...');
  
  if (!websiteUrl || websiteUrl.trim() === '') {
    console.log('    ⚠️ No URL provided');
    return { operator: null, confidence: 0, method: 'website_scrape' };
  }
  
  const scraperApiKey = Deno.env.get('SCRAPERAPI_KEY');
  if (!scraperApiKey) {
    console.log('    ⚠️ SCRAPERAPI_KEY not configured');
    return { operator: null, confidence: 0, method: 'website_scrape' };
  }
  
  try {
    const scraperUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(websiteUrl)}&render=false`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(scraperUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log(`    ⚠️ ScraperAPI error: ${response.status}`);
      return { operator: null, confidence: 0, method: 'website_scrape' };
    }
    
    const html = await response.text();
    console.log(`    Fetched ${html.length} bytes`);
    
    const htmlLower = html.toLowerCase();
    
    // Pattern 1: Copyright notices
    const copyrightPattern = /©\s*(?:20\d{2}[-–]\s*)?(?:20\d{2}\s+)?([^<>\n.]+?)(?:\s*<|\s*\.|\s*\||$)/gi;
    let match;
    while ((match = copyrightPattern.exec(html)) !== null) {
      const copyrightText = match[1].trim();
      
      // Check if any operator from whitelist is in the copyright text
      for (const operator of operatorWhitelist) {
        const operatorLower = operator.toLowerCase();
        const textLower = copyrightText.toLowerCase();
        
        if (textLower.includes(operatorLower)) {
          console.log(`    ✅ Found operator in copyright: "${operator}"`);
          return { operator, confidence: 95, method: 'website_copyright', details: copyrightText };
        }
      }
    }
    
    // Pattern 2: "Operated by", "Managed by", "Owned by"
    const operatedByPattern = /(?:operated|managed|owned|run)\s+by\s+([^<>\n.]+?)(?:\s*<|\s*\.|\s*\||$)/gi;
    while ((match = operatedByPattern.exec(html)) !== null) {
      const operatedByText = match[1].trim();
      
      for (const operator of operatorWhitelist) {
        const operatorLower = operator.toLowerCase();
        const textLower = operatedByText.toLowerCase();
        
        if (textLower.includes(operatorLower)) {
          console.log(`    ✅ Found operator in "operated by": "${operator}"`);
          return { operator, confidence: 100, method: 'website_operated_by', details: operatedByText };
        }
      }
    }
    
    // Pattern 3: Meta tags
    const metaSiteNameMatch = html.match(/<meta[^>]*property="og:site_name"[^>]*content="([^"]+)"/i);
    if (metaSiteNameMatch) {
      const siteName = metaSiteNameMatch[1];
      for (const operator of operatorWhitelist) {
        if (siteName.toLowerCase().includes(operator.toLowerCase())) {
          console.log(`    ✅ Found operator in meta tag: "${operator}"`);
          return { operator, confidence: 90, method: 'website_meta', details: siteName };
        }
      }
    }
    
    // Pattern 4: Simple text search for operators (last resort)
    for (const operator of operatorWhitelist) {
      const operatorLower = operator.toLowerCase();
      
      // Count occurrences (operator mentioned multiple times = more confident)
      const regex = new RegExp(operatorLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = html.match(regex);
      const count = matches ? matches.length : 0;
      
      if (count >= 5) { // Mentioned 5+ times
        console.log(`    ✅ Found operator mentioned ${count} times: "${operator}"`);
        return { operator, confidence: 85, method: 'website_frequency', details: `${count} mentions` };
      }
    }
    
    console.log('    ❌ No operator found in HTML');
    return { operator: null, confidence: 0, method: 'website_scrape' };
    
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('    ⚠️ Website scrape timeout');
    } else {
      console.log(`    ⚠️ Website scrape error: ${error.message}`);
    }
    return { operator: null, confidence: 0, method: 'website_scrape' };
  }
}

/**
 * MASTER FUNCTION: Try all strategies in order, return first success
 */
async function findOperatorMultiStrategy(
  villageName: string,
  suburb: string,
  website: string | null,
  streetAddress: string | null,
  operatorWhitelist: string[]
): Promise<OperatorResult> {
  console.log(`\n🏘️  Finding operator for: ${villageName}, ${suburb}`);
  
  // Strategy 1: Village name
  const nameResult = extractOperatorFromName(villageName, operatorWhitelist);
  if (nameResult.operator) return nameResult;
  
  // Strategy 2: Website URL
  if (website) {
    const urlResult = extractOperatorFromURL(website, operatorWhitelist);
    if (urlResult.operator) return urlResult;
  }
  
  // Strategy 3: Google Search
  const googleResult = await googleSearchForOperator(villageName, suburb, streetAddress, operatorWhitelist);
  if (googleResult.operator) return googleResult;
  
  // Strategy 4: Website scraping
  if (website) {
    const scrapeResult = await scrapeWebsiteForOperator(website, villageName, operatorWhitelist);
    if (scrapeResult.operator) return scrapeResult;
  }
  
  console.log('  ❌ All strategies failed');
  return { operator: null, confidence: 0, method: 'none' };
}

/**
 * POST /smart-operator-scraper/scrape-village
 * Scrape operator for a single village using multi-strategy approach
 */
app.post('/make-server-3bba8be8/smart-operator-scraper/scrape-village', async (c) => {
  try {
    const body = await c.req.json();
    const { villageId, villageName, suburb, website, streetAddress, operatorWhitelist } = body;
    
    if (!villageName || !suburb || !operatorWhitelist || operatorWhitelist.length === 0) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const result = await findOperatorMultiStrategy(
      villageName,
      suburb,
      website,
      streetAddress,
      operatorWhitelist
    );
    
    // Update database if operator found and villageId provided
    if (result.operator && villageId) {
      const { error: updateError } = await supabase
        .from('retirement_villages')
        .update({ operator: result.operator })
        .eq('id', villageId);
      
      if (updateError) {
        console.error(`❌ Database update failed: ${updateError.message}`);
        return c.json({ ...result, updated: false, error: updateError.message });
      }
      
      console.log(`✅ Database updated: ${villageName} → "${result.operator}"`);
    }
    
    return c.json({ ...result, updated: result.operator && villageId ? true : false });
    
  } catch (error: any) {
    console.error('Error in scrape-village:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /smart-operator-scraper/scrape-missing
 * Scrape operators for all villages missing them in a specific state
 */
app.post('/make-server-3bba8be8/smart-operator-scraper/scrape-missing', async (c) => {
  try {
    const body = await c.req.json();
    const { state, operatorWhitelist } = body;
    
    if (!state || !operatorWhitelist || operatorWhitelist.length === 0) {
      return c.json({ error: 'Missing required fields (state, operatorWhitelist)' }, 400);
    }
    
    console.log(`\n🚀 Starting smart operator scraping for ${state}...`);
    console.log(`📋 Using ${operatorWhitelist.length} operators in whitelist`);
    
    // Get all villages in state with missing operators
    const { data: villages, error: fetchError } = await supabase
      .from('retirement_villages')
      .select('id, name, suburb, website, street_address, operator')
      .eq('state', state)
      .or('operator.is.null,operator.eq.')
      .order('name');
    
    if (fetchError) {
      throw new Error(`Failed to fetch villages: ${fetchError.message}`);
    }
    
    if (!villages || villages.length === 0) {
      return c.json({
        success: true,
        message: `No ${state} villages with missing operators`,
        processed: 0,
        found: 0,
        notFound: 0,
        results: []
      });
    }
    
    console.log(`Found ${villages.length} villages to process`);
    
    let found = 0;
    let notFound = 0;
    const results: any[] = [];
    
    for (const village of villages) {
      const result = await findOperatorMultiStrategy(
        village.name,
        village.suburb,
        village.website,
        village.street_address,
        operatorWhitelist
      );
      
      if (result.operator) {
        // Update database
        const { error: updateError } = await supabase
          .from('retirement_villages')
          .update({ operator: result.operator })
          .eq('id', village.id);
        
        if (updateError) {
          console.error(`❌ Database update failed for ${village.name}: ${updateError.message}`);
          results.push({
            id: village.id,
            name: village.name,
            suburb: village.suburb,
            operator: result.operator,
            method: result.method,
            confidence: result.confidence,
            updated: false,
            error: updateError.message
          });
        } else {
          console.log(`✅ ${village.name} → "${result.operator}" (${result.method}, ${result.confidence}%)`);
          results.push({
            id: village.id,
            name: village.name,
            suburb: village.suburb,
            operator: result.operator,
            method: result.method,
            confidence: result.confidence,
            updated: true
          });
          found++;
        }
      } else {
        console.log(`❌ ${village.name} → Not found`);
        results.push({
          id: village.id,
          name: village.name,
          suburb: village.suburb,
          operator: null,
          method: 'none',
          confidence: 0,
          updated: false
        });
        notFound++;
      }
      
      // Rate limiting: 2 seconds between villages
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`\n✅ Smart scraping complete:`);
    console.log(`  - Processed: ${villages.length}`);
    console.log(`  - Found: ${found}`);
    console.log(`  - Not found: ${notFound}`);
    
    return c.json({
      success: true,
      processed: villages.length,
      found: found,
      notFound: notFound,
      results: results
    });
    
  } catch (error: any) {
    console.error('Error in scrape-missing:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /smart-operator-scraper/stats
 * Get statistics about missing operators by state
 */
app.get('/make-server-3bba8be8/smart-operator-scraper/stats', async (c) => {
  try {
    const { data: villages, error } = await supabase
      .from('retirement_villages')
      .select('state, operator')
      .or('operator.is.null,operator.eq.');
    
    if (error) {
      throw new Error(`Failed to fetch villages: ${error.message}`);
    }
    
    // Group by state
    const statsByState: Record<string, number> = {};
    for (const village of villages || []) {
      const state = village.state || 'Unknown';
      statsByState[state] = (statsByState[state] || 0) + 1;
    }
    
    return c.json({
      success: true,
      totalMissing: villages?.length || 0,
      byState: statsByState
    });
    
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default app;
