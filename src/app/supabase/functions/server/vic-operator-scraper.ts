// VIC Operator Scraper - Scrapes operators for villages missing them
import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

/**
 * Helper function to fetch HTML using ScraperAPI
 */
async function fetchHtml(url: string): Promise<string> {
  const MAX_RETRIES = 3;
  const INITIAL_BACKOFF_MS = 2000; // Start with 2 seconds
  
  const scraperApiKey = Deno.env.get("SCRAPERAPI_KEY");
  
  if (!scraperApiKey) {
    throw new Error("SCRAPERAPI_KEY not configured");
  }
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(`  🤖 Fetching: ${url} (Attempt ${attempt}/${MAX_RETRIES})`);
    
    // Remove premium parameter to avoid issues - use standard ScraperAPI
    const scraperUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(url)}&render=false`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(scraperUrl, {
        method: "GET",
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`  ❌ ScraperAPI error (attempt ${attempt}/${MAX_RETRIES}): ${response.status} - ${errorText.substring(0, 200)}`);
        
        // If it's a 500 error and we have retries left, wait and retry
        if (response.status >= 500 && attempt < MAX_RETRIES) {
          const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`  ⏳ Waiting ${backoffMs}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
          continue; // Retry
        }
        
        // If it's a 429 (rate limit), wait longer
        if (response.status === 429 && attempt < MAX_RETRIES) {
          const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt); // Longer backoff for rate limits
          console.log(`  ⏳ Rate limited! Waiting ${backoffMs}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
          continue; // Retry
        }
        
        throw new Error(`ScraperAPI returned ${response.status}: ${errorText.substring(0, 200)}`);
      }
      
      const html = await response.text();
      console.log(`  ✅ Fetched ${html.length} bytes`);
      return html;
      
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      // If it's the last attempt, throw the error
      if (attempt === MAX_RETRIES) {
        console.error(`  ❌ Final attempt failed for ${url}:`, error.message);
        throw error;
      }
      
      // If it's a timeout error, retry
      if (error.name === 'AbortError') {
        const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
        console.log(`  ⏳ Timeout! Waiting ${backoffMs}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        continue; // Retry
      }
      
      // For other errors, log and retry
      console.error(`  ⚠️ Attempt ${attempt}/${MAX_RETRIES} failed:`, error.message);
      const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }
  
  // Should never reach here
  throw new Error('All retry attempts exhausted');
}

/**
 * Extract operator name from HTML using various patterns
 */
function extractOperator(html: string, villageName: string): string | null {
  const htmlLower = html.toLowerCase();
  
  // BLACKLIST: Operators to reject (false positives)
  const BLACKLISTED_OPERATORS = [
    'Aberlea Inc',
    'Aberlea',
    'Independent',
    'Inc',
    'Pty Ltd',
    'Ltd',
    'Company',
    'Village',
    'Retirement Village',
    'Aged Care',
  ];
  
  // Common patterns for operator names
  const patterns = [
    // "Operated by X", "Managed by X", "Owned by X"
    /(?:operated|managed|owned|run)\s+by\s+([A-Z][A-Za-z\s&'-]+(?:Retirement|Villages?|Living|Care|Group|Services|Communities|Homes))/i,
    
    // "X Retirement Villages", "X Aged Care", etc.
    /([A-Z][A-Za-z\s&'-]+)\s+(?:Retirement\s+(?:Villages?|Living|Communities)|Aged\s+Care|Senior\s+Living)/i,
    
    // Property/meta tags
    /<meta[^>]*property="og:site_name"[^>]*content="([^"]+)"/i,
    /<meta[^>]*name="author"[^>]*content="([^"]+)"/i,
    
    // Footer copyright
    /©\s*(?:20\d{2}[-–]\s*)?(?:20\d{2}\s+)?([A-Z][A-Za-z\s&'-]+(?:Retirement|Villages?|Living|Care|Group|Services|Communities|Homes))/i,
    
    // Common operator names in VIC
    /\b(Lendlease|Stockland|Aveo|Arcadia|Uniting\s+AgeWell|Churches\s+of\s+Christ|Baptist\s+Care|Mercy\s+Health|Japara|Bupa|Regis|Estia|Ryman|Retire\s+Australia|Ingenia|Gateway\s+Lifestyle)\b/i,
  ];
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      const operator = match[1].trim();
      
      // Filter out obvious false positives
      if (operator.length <= 3 || operator.length >= 100 || operator === villageName) {
        continue;
      }
      
      // Check against blacklist
      const isBlacklisted = BLACKLISTED_OPERATORS.some(blocked => 
        operator.toLowerCase().includes(blocked.toLowerCase()) ||
        blocked.toLowerCase().includes(operator.toLowerCase())
      );
      
      if (isBlacklisted) {
        console.log(`  🚫 REJECTED (blacklisted): "${operator}"`);
        continue;
      }
      
      console.log(`  ✅ Found operator: "${operator}"`);
      return operator;
    }
  }
  
  return null;
}

/**
 * POST /vic-operator-scraper/scrape-missing-operators
 * Scrapes operators for VIC villages that are missing them
 */
app.post('/make-server-3bba8be8/vic-operator-scraper/scrape-missing-operators', async (c) => {
  try {
    console.log('🔍 Starting VIC operator scraping...');
    
    // Get all VIC villages with missing operators
    const { data: villages, error: fetchError } = await supabase
      .from('retirement_villages')
      .select('id, name, suburb, website')
      .eq('state', 'VIC')
      .or('operator.is.null,operator.eq.')
      .not('website', 'is', null)
      .not('website', 'eq', '');
    
    if (fetchError) {
      throw new Error(`Failed to fetch villages: ${fetchError.message}`);
    }
    
    if (!villages || villages.length === 0) {
      return c.json({
        success: true,
        message: 'No VIC villages with missing operators (that have websites)',
        processed: 0,
        updated: 0,
        failed: 0
      });
    }
    
    console.log(`Found ${villages.length} VIC villages with missing operators`);
    
    let updated = 0;
    let failed = 0;
    const results: any[] = [];
    
    for (const village of villages) {
      console.log(`\n🏘️  Processing: ${village.name} (${village.suburb})`);
      console.log(`  Website: ${village.website}`);
      
      try {
        // Fetch the HTML
        const html = await fetchHtml(village.website);
        
        // Extract operator
        const operator = extractOperator(html, village.name);
        
        if (operator) {
          // Update the database
          const { error: updateError } = await supabase
            .from('retirement_villages')
            .update({ operator: operator })
            .eq('id', village.id);
          
          if (updateError) {
            throw new Error(`Database update failed: ${updateError.message}`);
          }
          
          console.log(`  ✅ Updated: ${village.name} → operator: "${operator}"`);
          
          results.push({
            id: village.id,
            name: village.name,
            suburb: village.suburb,
            website: village.website,
            operator: operator,
            status: 'success'
          });
          
          updated++;
        } else {
          console.log(`  ⚠️ No operator found for ${village.name}`);
          
          results.push({
            id: village.id,
            name: village.name,
            suburb: village.suburb,
            website: village.website,
            operator: null,
            status: 'no_operator_found'
          });
          
          failed++;
        }
        
        // Rate limiting: wait 2 seconds between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error: any) {
        console.error(`  ❌ Failed to scrape ${village.name}: ${error.message}`);
        
        results.push({
          id: village.id,
          name: village.name,
          suburb: village.suburb,
          website: village.website,
          error: error.message,
          status: 'error'
        });
        
        failed++;
      }
    }
    
    console.log(`\n✅ Scraping complete:`);
    console.log(`  - Processed: ${villages.length}`);
    console.log(`  - Updated: ${updated}`);
    console.log(`  - Failed: ${failed}`);
    
    return c.json({
      success: true,
      processed: villages.length,
      updated: updated,
      failed: failed,
      results: results
    });
    
  } catch (error: any) {
    console.error('Error in vic-operator-scraper:', error);
    return c.json({ error: error.message || 'Failed to scrape operators' }, 500);
  }
});

/**
 * GET /vic-operator-scraper/missing-operators
 * Get list of VIC villages missing operators
 */
app.get('/make-server-3bba8be8/vic-operator-scraper/missing-operators', async (c) => {
  try {
    const { data: villages, error } = await supabase
      .from('retirement_villages')
      .select('id, name, suburb, website, operator')
      .eq('state', 'VIC')
      .or('operator.is.null,operator.eq.')
      .order('name');
    
    if (error) {
      throw new Error(`Failed to fetch villages: ${error.message}`);
    }
    
    return c.json({
      success: true,
      count: villages?.length || 0,
      villages: villages || []
    });
    
  } catch (error: any) {
    console.error('Error fetching missing operators:', error);
    return c.json({ error: error.message || 'Failed to fetch data' }, 500);
  }
});

export default app;