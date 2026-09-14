import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { Hono } from 'npm:hono@4';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Expanded blacklist
const BLACKLIST_DOMAINS = [
  'villages.com.au',
  'agedcareguide.com.au',
  'retirementliving.org.au',
  'australianretirementliving.com.au',
  'northeastdirectory.com.au',
  'careopinion.org.au',
  'herniman.com.au',
  'library.olivet.org.au',
  'echucaca.com.au',
  'unitingvictas.org.au',
  'ncnhealth.org.au',
  'rslcaresa.com.au',
  'providencevillages.com.au'
];

interface OperatorDomain {
  operator: string;
  domain: string;
}

const parseOperatorCSV = (csv: string): OperatorDomain[] => {
  const lines = csv.split('\n').filter(line => line.trim());
  const operators: OperatorDomain[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(',');
    if (parts.length >= 2) {
      operators.push({
        operator: parts[0].trim(),
        domain: parts[1].trim()
      });
    }
  }
  
  return operators;
};

const isDomainBlacklisted = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    return BLACKLIST_DOMAINS.some(domain => hostname.includes(domain));
  } catch {
    return false;
  }
};

const isPDF = (url: string): boolean => {
  return url.toLowerCase().includes('.pdf');
};

const isGenericPage = (url: string): boolean => {
  const genericPaths = [
    '/privacy',
    '/terms-of-use',
    '/contact',
    '/about/privacy-and-policies',
    '/help-and-support/contact',
    '/media-centre/news-and-media',
    '/files/documents/',
    '/continuing-our-growth',
    '/find-a-lions-club',
    'intranet.tigcorp.com.au'
  ];
  
  return genericPaths.some(path => url.includes(path));
};

const cleanVillageName = (name: string): string => {
  // Remove common suffixes
  return name
    .replace(/\s+retirement\s+village$/i, '')
    .replace(/\s+aged\s+care$/i, '')
    .replace(/\s+retirement\s+living$/i, '')
    .trim();
};

const scrapeWithStrategy = async (query: string, apiKey: string): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://api.scraperapi.com/structured/google/search?api_key=${apiKey}&query=${encodeURIComponent(query)}&num=5`
    );
    
    if (!response.ok) {
      console.log(`ScraperAPI returned ${response.status} for query: ${query}`);
      return null;
    }
    
    const data = await response.json();
    const results = data.organic_results || [];
    
    // Find first valid result
    for (const result of results) {
      const url = result.link;
      if (!url) continue;
      
      // Skip blacklisted, PDFs, and generic pages
      if (isDomainBlacklisted(url) || isPDF(url) || isGenericPage(url)) {
        console.log(`Skipping invalid URL: ${url}`);
        continue;
      }
      
      // Valid URL found!
      return url;
    }
    
    return null;
  } catch (error: any) {
    console.error(`Scrape error for query "${query}":`, error.message);
    return null;
  }
};

const getOperatorDomain = (operatorName: string | null, operators: OperatorDomain[]): string | null => {
  if (!operatorName) return null;
  
  const found = operators.find(op => 
    op.operator.toLowerCase() === operatorName.toLowerCase()
  );
  
  return found ? found.domain : null;
};

app.post('/make-server-3bba8be8/vic-multi-strategy-scraper/run', async (c) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const scraperApiKey = Deno.env.get('SCRAPERAPI_KEY');
  if (!scraperApiKey) {
    return c.json({ success: false, error: 'SCRAPERAPI_KEY not configured' }, 500);
  }

  try {
    const body = await c.req.json();
    const batchSize = body.batchSize || 10;

    console.log(`🚀 Starting multi-strategy scraper (batch size: ${batchSize})...`);

    // Load operator domains CSV
    const csvData = await kv.get('vic-operator-domains-csv');
    if (!csvData) {
      return c.json({ success: false, error: 'Operator domains CSV not found. Please upload it first.' }, 400);
    }

    const operators = parseOperatorCSV(csvData);
    console.log(`📋 Loaded ${operators.length} operator domains`);

    // Get villages without URLs
    const { data: villages, error } = await supabase
      .from('retirement_villages')
      .select('id, name, operator, suburb, street_address')
      .eq('state', 'VIC')
      .is('website', null)
      .limit(batchSize);

    if (error) {
      console.error('Database error:', error);
      return c.json({ success: false, error: error.message }, 500);
    }

    if (!villages || villages.length === 0) {
      return c.json({
        success: true,
        message: '✅ No villages without URLs found!',
        summary: { total: 0, success: 0, failed: 0 },
        results: []
      });
    }

    console.log(`🔍 Found ${villages.length} villages without URLs`);

    const results: any[] = [];
    let successCount = 0;
    let failCount = 0;

    // Check for abort signal every iteration
    for (let i = 0; i < villages.length; i++) {
      const village = villages[i];
      
      console.log(`\n📍 Processing ${i + 1}/${villages.length}: ${village.name}`);
      
      const cleanName = cleanVillageName(village.name);
      const operatorDomain = getOperatorDomain(village.operator, operators);
      
      let foundUrl: string | null = null;
      let strategyUsed = '';

      // STRATEGY 1: Operator domain search (if we have operator domain)
      if (operatorDomain && !foundUrl) {
        const query = `${cleanName} site:${operatorDomain}`;
        console.log(`  Strategy 1 (Domain Search): ${query}`);
        foundUrl = await scrapeWithStrategy(query, scraperApiKey);
        if (foundUrl) strategyUsed = 'Domain Search';
      }

      // STRATEGY 2: Simplified search (village + retirement + VIC)
      if (!foundUrl) {
        const query = `"${cleanName}" retirement village Victoria`;
        console.log(`  Strategy 2 (Simplified): ${query}`);
        foundUrl = await scrapeWithStrategy(query, scraperApiKey);
        if (foundUrl) strategyUsed = 'Simplified Search';
      }

      // STRATEGY 3: With operator name (if exists)
      if (!foundUrl && village.operator) {
        const query = `${village.operator} "${cleanName}" retirement village VIC`;
        console.log(`  Strategy 3 (With Operator): ${query}`);
        foundUrl = await scrapeWithStrategy(query, scraperApiKey);
        if (foundUrl) strategyUsed = 'Operator Search';
      }

      // STRATEGY 4: Location-based (if we have suburb)
      if (!foundUrl && village.suburb) {
        const query = `retirement village "${cleanName}" ${village.suburb} Victoria`;
        console.log(`  Strategy 4 (Location): ${query}`);
        foundUrl = await scrapeWithStrategy(query, scraperApiKey);
        if (foundUrl) strategyUsed = 'Location Search';
      }

      // STRATEGY 5: Aged care variation
      if (!foundUrl) {
        const query = `"${cleanName}" aged care ${village.suburb || 'Victoria'}`;
        console.log(`  Strategy 5 (Aged Care): ${query}`);
        foundUrl = await scrapeWithStrategy(query, scraperApiKey);
        if (foundUrl) strategyUsed = 'Aged Care Search';
      }

      // Update database if URL found
      if (foundUrl) {
        console.log(`  ✅ Found URL: ${foundUrl} (${strategyUsed})`);
        
        const { error: updateError } = await supabase
          .from('retirement_villages')
          .update({ website: foundUrl })
          .eq('id', village.id);

        if (updateError) {
          console.error(`  ❌ Update error:`, updateError);
          results.push({
            village: village.name,
            status: 'error',
            error: updateError.message
          });
          failCount++;
        } else {
          results.push({
            village: village.name,
            status: 'success',
            url: foundUrl,
            strategy: strategyUsed
          });
          successCount++;
        }
      } else {
        console.log(`  ⚠️ No URL found after trying all strategies`);
        results.push({
          village: village.name,
          status: 'not_found',
          message: 'All strategies failed'
        });
        failCount++;
      }

      // Rate limiting: 1 request per second (conservative)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n✅ Scraping complete: ${successCount} success, ${failCount} failed`);

    return c.json({
      success: true,
      summary: {
        total: villages.length,
        success: successCount,
        failed: failCount
      },
      results
    });

  } catch (error: any) {
    console.error('Multi-strategy scraper error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.get('/make-server-3bba8be8/vic-multi-strategy-scraper/count', async (c) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    const { count, error } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'VIC')
      .is('website', null);

    if (error) {
      console.error('Count error:', error);
      return c.json({ success: false, error: error.message }, 500);
    }

    return c.json({ success: true, count: count || 0 });
  } catch (error: any) {
    console.error('Count endpoint error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default app;