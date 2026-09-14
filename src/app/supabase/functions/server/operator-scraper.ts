import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';

const app = new Hono();

app.use('*', cors());

// Fuzzy string matching
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
  const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (s1 === s2) return 100;
  if (s1.includes(s2) || s2.includes(s1)) return 90;

  // Levenshtein distance
  const matrix: number[][] = [];
  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const distance = matrix[s2.length][s1.length];
  const maxLength = Math.max(s1.length, s2.length);
  return Math.round((1 - distance / maxLength) * 100);
}

// Extract operator from search results - NEW APPROACH: Just get the operator name from TOP result
function extractOperatorFromResults(results: any[], operatorWhitelist: string[]): { operator: string | null; confidence: number } {
  console.log('📋 Extracting operator from TOP Google result (no whitelist filtering)...');
  
  if (!results || results.length === 0) {
    console.log('❌ No search results');
    return { operator: null, confidence: 0 };
  }

  // Get the TOP result (most relevant)
  const topResult = results[0];
  const url = topResult.link || topResult.url || '';
  const title = topResult.title || '';
  const snippet = topResult.snippet || '';
  
  console.log('🔍 TOP Result:');
  console.log('   URL:', url);
  console.log('   Title:', title);
  console.log('   Snippet:', snippet.substring(0, 200));

  // STEP 1: Extract operator from domain name (most reliable)
  if (url) {
    const domainMatch = url.match(/https?:\/\/(?:www\.)?([^\/]+)/);
    if (domainMatch) {
      const domain = domainMatch[1];
      console.log(`   Domain: ${domain}`);
      
      // Skip aggregator/directory sites
      const skipDomains = [
        'agedcare101.com.au',
        'myagedcare.gov.au', 
        'retirementliving.com.au',
        'seniorsliving.net.au',
        'homesandland.com.au',
        'realestate.com.au',
        'domain.com.au',
        'google.com',
        'facebook.com',
        'linkedin.com'
      ];
      
      const isAggregator = skipDomains.some(skip => domain.includes(skip));
      
      if (!isAggregator) {
        // Extract operator name from domain (e.g., "aveo.com.au" → "Aveo")
        const domainParts = domain.split('.');
        const operatorFromDomain = domainParts[0]
          .replace(/[-_]/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        console.log(`✅ Extracted operator from domain: "${operatorFromDomain}"`);
        return { operator: operatorFromDomain, confidence: 90 };
      }
    }
  }

  // STEP 2: Extract operator from title (look for patterns like "X Retirement Village" or "X - Village Name")
  const titlePatterns = [
    // "Operator Name | Village Name" or "Operator Name - Village Name"
    /^([^|\-–—]+?)[\s]*[\|\-–—]/,
    // "Village Name - Operator Name"
    /[\|\-–—][\s]*([^|\-–—]+?)$/,
    // Look for retirement/aged care company names
    /([\w\s]+(?:Retirement|Aged Care|Living|Communities|Care|Villages|Homes))/i,
  ];

  for (const pattern of titlePatterns) {
    const match = title.match(pattern);
    if (match && match[1]) {
      const extracted = match[1].trim();
      // Skip if it's the village name itself or too short
      if (extracted.length > 3 && !extracted.toLowerCase().includes('retirement village')) {
        console.log(`✅ Extracted operator from title: "${extracted}"`);
        return { operator: extracted, confidence: 85 };
      }
    }
  }

  // STEP 3: Look for operator names in snippet (first organization mentioned)
  const snippetPatterns = [
    /([\w\s]+(?:Retirement|Aged Care|Living|Communities|Care|Villages|Homes))/i,
    /(?:operated by|managed by|by)\s+([\w\s]{5,30})/i,
  ];

  for (const pattern of snippetPatterns) {
    const match = snippet.match(pattern);
    if (match && match[1]) {
      const extracted = match[1].trim();
      if (extracted.length > 3) {
        console.log(`✅ Extracted operator from snippet: "${extracted}"`);
        return { operator: extracted, confidence: 75 };
      }
    }
  }

  console.log('❌ Could not extract operator from top result');
  return { operator: null, confidence: 0 };
}

// Scrape operator for a village
app.post('/make-server-3bba8be8/operator-scraper/scrape', async (c) => {
  try {
    const body = await c.req.json();
    const { villageName, suburb, streetAddress, operatorWhitelist } = body;

    // 🆕 Operator whitelist is now OPTIONAL - backend extracts from Google
    if (!villageName || !suburb) {
      return c.json({ error: 'Missing required fields: villageName and suburb' }, 400);
    }

    console.log(`\n🔍 Scraping operator for: ${villageName}, ${suburb}`);
    if (streetAddress) {
      console.log(`📍 Street address: ${streetAddress}`);
    }

    const scraperApiKey = Deno.env.get('SCRAPERAPI_KEY');
    if (!scraperApiKey) {
      console.error('❌ SCRAPERAPI_KEY not found');
      return c.json({ error: 'ScraperAPI key not configured' }, 500);
    }

    // 🆕 Build search query with street address for better specificity
    let searchQuery: string;
    if (streetAddress && streetAddress.trim()) {
      // Use street address for highly specific search (most likely to find actual village website)
      searchQuery = `"${villageName}" "${streetAddress}" ${suburb} VIC`;
      console.log('🔍 Search query (with address):', searchQuery);
    } else {
      // Fallback to suburb-based search
      searchQuery = `"${villageName}" ${suburb} VIC retirement village`;
      console.log('🔍 Search query (no address):', searchQuery);
    }

    // Use ScraperAPI with Google Search JSON API
    const scraperUrl = `https://api.scraperapi.com/structured/google/search?api_key=${scraperApiKey}&query=${encodeURIComponent(searchQuery)}&country=au&num=10`;

    console.log('📡 Calling ScraperAPI...');
    const response = await fetch(scraperUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ScraperAPI error:', response.status, errorText);
      return c.json({
        scrapedOperator: null,
        matchedOperator: null,
        confidence: 0,
        error: `ScraperAPI error: ${response.status}`,
      });
    }

    const data = await response.json();
    console.log('✅ ScraperAPI response received');
    console.log('📊 Results count:', data.organic_results?.length || 0);

    if (!data.organic_results || data.organic_results.length === 0) {
      console.log('⚠️ No search results found');
      return c.json({
        scrapedOperator: null,
        matchedOperator: null,
        confidence: 0,
      });
    }

    // Extract operator from results
    const { operator, confidence } = extractOperatorFromResults(data.organic_results, operatorWhitelist);

    console.log('🎯 Final result:', { operator, confidence });

    return c.json({
      scrapedOperator: operator,
      matchedOperator: operator,
      confidence,
    });
  } catch (error: any) {
    console.error('❌ Scraping error:', error);
    return c.json({
      scrapedOperator: null,
      matchedOperator: null,
      confidence: 0,
      error: error?.message || 'Unknown error',
    }, 500);
  }
});

// 🆕 SAVE SCRAPED RESULTS TO DATABASE
app.post('/make-server-3bba8be8/operator-scraper/save-results', async (c) => {
  try {
    const body = await c.req.json();
    const { results } = body;

    if (!results || !Array.isArray(results)) {
      return c.json({ error: 'Invalid results format' }, 400);
    }

    console.log(`💾 Saving ${results.length} operator scraping results to database...`);

    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase credentials');
      return c.json({ error: 'Database configuration error' }, 500);
    }

    const { createClient } = await import('npm:@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      db: { schema: 'public' },
      auth: { persistSession: false }
    });

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const result of results) {
      const { village, matchedOperator, confidence, status } = result;

      // Skip if no match found
      if (status !== 'matched' || !matchedOperator) {
        skipCount++;
        console.log(`⏭️  Skipping ${village.name} - no operator match`);
        continue;
      }

      try {
        // Normalize data for better matching
        const normalizedName = village.name.trim();
        const normalizedSuburb = village.suburb.trim();
        const normalizedPostcode = village.postcode.trim();

        // STRATEGY 1: Try case-insensitive exact match
        let { data, error } = await supabase
          .from('villages_3bba8be8')
          .update({
            operator: matchedOperator,
            updated_at: new Date().toISOString(),
          })
          .ilike('name', normalizedName)
          .ilike('suburb', normalizedSuburb)
          .eq('postcode', normalizedPostcode)
          .eq('state', 'VIC')
          .select();

        // STRATEGY 2: If no match, try name + postcode only
        if (!data || data.length === 0) {
          const { data: data2, error: error2 } = await supabase
            .from('villages_3bba8be8')
            .update({
              operator: matchedOperator,
              updated_at: new Date().toISOString(),
            })
            .ilike('name', normalizedName)
            .eq('postcode', normalizedPostcode)
            .eq('state', 'VIC')
            .select();
          
          data = data2;
          error = error2;
        }

        // STRATEGY 3: If still no match, try name only
        if (!data || data.length === 0) {
          const { data: data3, error: error3 } = await supabase
            .from('villages_3bba8be8')
            .update({
              operator: matchedOperator,
              updated_at: new Date().toISOString(),
            })
            .ilike('name', normalizedName)
            .eq('state', 'VIC')
            .limit(1)
            .select();
          
          data = data3;
          error = error3;
        }

        if (error) {
          console.error(`❌ Error updating ${village.name}:`, error.message);
          errors.push(`${village.name}: ${error.message}`);
          errorCount++;
        } else if (!data || data.length === 0) {
          console.error(`⚠️ Village not found: ${village.name}, ${village.suburb}, ${village.postcode}`);
          errors.push(`${village.name}: Not found in database`);
          skipCount++;
        } else {
          console.log(`✅ Updated ${village.name} → ${matchedOperator}`);
          successCount++;
        }
      } catch (err: any) {
        console.error(`❌ Exception updating ${village.name}:`, err.message);
        errors.push(`${village.name}: ${err.message}`);
        errorCount++;
      }
    }

    console.log(`📊 Save complete: ${successCount} success, ${skipCount} skipped, ${errorCount} errors`);

    return c.json({
      success: true,
      successCount,
      skipCount,
      errorCount,
      errors: errors.slice(0, 10),
    });
  } catch (error: any) {
    console.error('❌ Save results error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// 🆕 EXPORT VILLAGES WITHOUT OPERATORS
app.get('/make-server-3bba8be8/operator-scraper/export-missing', async (c) => {
  try {
    console.log('📤 Exporting VIC villages without operators...');

    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase credentials');
      return c.json({ error: 'Database configuration error' }, 500);
    }

    const { createClient } = await import('npm:@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      db: { schema: 'public' },
      auth: { persistSession: false }
    });

    // Query VIC villages without operators
    const { data: villages, error } = await supabase
      .from('villages_3bba8be8')
      .select('name, suburb, postcode, street_address, state')
      .eq('state', 'VIC')
      .or('operator.is.null,operator.eq.')
      .order('suburb', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ Database query error:', error);
      return c.json({ error: error.message }, 500);
    }

    console.log(`✅ Found ${villages?.length || 0} VIC villages without operators`);

    return c.json({
      success: true,
      count: villages?.length || 0,
      villages: villages || [],
    });
  } catch (error: any) {
    console.error('❌ Export error:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default app;