/**
 * LOCAL SCRAPER FOR RETIREPATH - SCRAPERAPI VERSION
 * 
 * USES SCRAPERAPI TO BYPASS ALL BLOCKING/TIMEOUT ISSUES
 * - No more timeouts
 * - No more DNS errors
 * - No more blocking
 * - JUST WORKS
 */

const https = require('https');
const http = require('http');
const readline = require('readline');

// Configuration
const BATCH_SIZE = 100; // Process 100 villages at a time
const DELAY_BETWEEN_REQUESTS = 3000; // 3 seconds between each scrape (ScraperAPI rate limiting)
const SCRAPE_TIMEOUT = 60000; // 60 SECOND TIMEOUT (ScraperAPI can be slower)

// Will be set after user input
let SUPABASE_URL = '';
let SUPABASE_SERVICE_ROLE_KEY = '';
let SCRAPERAPI_KEY = '';

// Stats tracking
const stats = {
  total: 0,
  processed: 0,
  success: 0,
  failed: 0,
  skipped: 0,
  startTime: Date.now()
};

/**
 * Prompt user for input
 */
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Make a fetch-like request using Node.js http/https
 */
function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    let timeoutId = null;
    let isResolved = false;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      isResolved = true;
    };

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    let urlObj;
    try {
      urlObj = new URL(url);
    } catch (err) {
      reject(new Error(`Invalid URL: ${url}`));
      return;
    }

    const lib = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        ...options.headers
      },
      timeout: SCRAPE_TIMEOUT
    };

    const req = lib.request(requestOptions, (res) => {
      if (isResolved) return;
      cleanup();

      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
        // Prevent memory issues - limit to 20MB
        if (data.length > 20000000) {
          if (!isResolved) {
            req.destroy();
            isResolved = true;
            reject(new Error('Response too large (>20MB)'));
          }
        }
      });
      
      res.on('end', () => {
        if (isResolved) return;
        isResolved = true;
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          text: () => Promise.resolve(data),
          json: () => Promise.resolve(JSON.parse(data))
        });
      });
    });

    req.on('error', (err) => {
      if (isResolved) return;
      cleanup();
      isResolved = true;
      reject(err);
    });
    
    req.on('timeout', () => {
      if (isResolved) return;
      cleanup();
      req.destroy();
      isResolved = true;
      reject(new Error(`Request timeout after ${SCRAPE_TIMEOUT/1000} seconds`));
    });

    timeoutId = setTimeout(() => {
      if (isResolved) return;
      cleanup();
      req.destroy();
      isResolved = true;
      reject(new Error(`Overall timeout after ${SCRAPE_TIMEOUT/1000} seconds`));
    }, SCRAPE_TIMEOUT);

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

/**
 * Fetch HTML from a URL using ScraperAPI
 */
async function fetchHtmlWithScraperAPI(targetUrl) {
  // Ensure target URL has protocol
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }

  // Build ScraperAPI URL
  const scraperApiUrl = `http://api.scraperapi.com/?api_key=${SCRAPERAPI_KEY}&url=${encodeURIComponent(targetUrl)}`;
  
  const response = await fetchUrl(scraperApiUrl);
  
  if (!response.ok) {
    throw new Error(`ScraperAPI returned ${response.status}: ${response.statusText}`);
  }
  
  return await response.text();
}

/**
 * Extract data from HTML
 */
function extractDataFromHtml(html, website) {
  const htmlLower = html.toLowerCase();
  const extracted = {
    scrapedAt: new Date().toISOString(),
    website: website,
    status: 'success'
  };

  // Extract phone numbers (Australian formats)
  const phonePatterns = [
    /(1800|1300)[\s.-]?\d{3}[\s.-]?\d{3}/gi,
    /\(?\d{2}\)?[\s.-]?\d{4}[\s.-]?\d{4}/g,
    /\+?61[\s.-]?\d{1}[\s.-]?\d{4}[\s.-]?\d{4}/g
  ];

  const phones = new Set();
  for (const pattern of phonePatterns) {
    const matches = html.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const cleaned = match.replace(/[^\d+]/g, '');
        if (cleaned.length >= 10) {
          phones.add(match.trim());
        }
      });
    }
  }
  
  if (phones.size > 0) {
    extracted.phone = Array.from(phones)[0];
  }

  // Extract email
  const emailMatch = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    extracted.email = emailMatch[0];
  }

  // Extract pricing info
  const pricingKeywords = [
    'entry fee', 'entry price', 'entry cost',
    'from $', 'starting from $', 'prices from $',
    'deferred management fee', 'dmf',
    'weekly fee', 'monthly fee', 'service fee',
    'independent living units', 'retirement units'
  ];

  for (const keyword of pricingKeywords) {
    if (htmlLower.includes(keyword)) {
      extracted.hasPricing = true;
      break;
    }
  }

  // Extract amenities
  const amenityKeywords = {
    health: ['gym', 'fitness', 'pool', 'swimming', 'spa', 'wellness', 'health', 'medical', 'nurse', 'care'],
    social: ['lounge', 'community hall', 'cinema', 'theatre', 'library', 'billiards', 'craft room', 'workshop'],
    outdoor: ['garden', 'bowling green', 'tennis', 'putting green', 'barbecue', 'outdoor'],
    services: ['hairdresser', 'salon', 'cafe', 'restaurant', 'dining', 'bar', 'kiosk'],
    security: ['security', '24-hour', 'emergency call', 'gated', 'secure'],
    accommodation: ['studio', 'apartment', '1 bedroom', '2 bedroom', '3 bedroom', 'villa', 'unit']
  };

  extracted.amenities = [];
  for (const [category, keywords] of Object.entries(amenityKeywords)) {
    for (const keyword of keywords) {
      if (htmlLower.includes(keyword)) {
        if (!extracted.amenities.includes(keyword)) {
          extracted.amenities.push(keyword);
        }
      }
    }
  }

  // Extract care types
  const careTypes = [];
  if (htmlLower.includes('independent living')) careTypes.push('Independent Living');
  if (htmlLower.includes('assisted living')) careTypes.push('Assisted Living');
  if (htmlLower.includes('aged care') || htmlLower.includes('nursing home')) careTypes.push('Aged Care');
  if (htmlLower.includes('dementia') || htmlLower.includes('memory care')) careTypes.push('Memory Care');
  if (htmlLower.includes('respite')) careTypes.push('Respite Care');
  
  if (careTypes.length > 0) {
    extracted.careTypes = careTypes;
  }

  extracted.fieldsFound = Object.keys(extracted).length - 3;

  return extracted;
}

/**
 * Get villages that need scraping from Supabase
 */
async function getVillagesToScrape(limit = BATCH_SIZE) {
  const url = `${SUPABASE_URL}/rest/v1/retirement_villages?select=id,name,website,state,scraped_data&website=not.is.null&limit=${limit}`;
  
  const response = await fetchUrl(url, {
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch villages: ${response.status} ${response.statusText}\nResponse: ${errorText}`);
  }

  const data = await response.json();
  
  // Filter in JavaScript for villages that need scraping
  const filtered = data.filter(v => !v.scraped_data || v.scraped_data.status === 'failed');
  
  return filtered;
}

/**
 * Update village with scraped data
 */
async function updateVillage(villageId, scrapedData) {
  const response = await fetchUrl(
    `${SUPABASE_URL}/rest/v1/retirement_villages?id=eq.${villageId}`,
    {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        scraped_data: scrapedData,
        updated_at: new Date().toISOString()
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update village: ${response.status}`);
  }
}

/**
 * Scrape a single village using ScraperAPI
 */
async function scrapeVillage(village) {
  const startTime = Date.now();
  
  try {
    console.log(`🔍 [${stats.processed + 1}/${stats.total}] ${village.name} (${village.state})`);
    console.log(`   Website: ${village.website}`);

    if (village.scraped_data && village.scraped_data.status !== 'failed') {
      console.log(`   ⏭️  Skipped: Already has scraped data`);
      stats.skipped++;
      return;
    }

    console.log(`   📡 Requesting via ScraperAPI...`);
    const html = await fetchHtmlWithScraperAPI(village.website);
    
    console.log(`   📄 HTML fetched: ${html.length.toLocaleString()} characters`);

    const extracted = extractDataFromHtml(html, village.website);
    console.log(`   ✅ Success: ${extracted.fieldsFound} fields found`);

    await updateVillage(village.id, extracted);
    
    stats.success++;
    
    const duration = Date.now() - startTime;
    console.log(`   ⏱️  Completed in ${(duration/1000).toFixed(1)}s`);
    
  } catch (error) {
    const errorMsg = error.message || String(error);
    console.log(`   ❌ Failed: ${errorMsg}`);
    
    // Save failure to database
    try {
      await updateVillage(village.id, {
        status: 'failed',
        reason: errorMsg.substring(0, 200),
        scrapedAt: new Date().toISOString()
      });
    } catch (updateError) {
      console.log(`   ⚠️  Failed to save error status: ${updateError.message}`);
    }
    
    stats.failed++;
    
  } finally {
    stats.processed++;
    
    const percentComplete = Math.round((stats.processed / stats.total) * 100);
    const elapsed = Math.round((Date.now() - stats.startTime) / 1000);
    const rate = stats.processed / elapsed;
    const remaining = stats.total - stats.processed;
    const eta = remaining / rate;
    
    console.log(`   📊 Progress: ${stats.processed}/${stats.total} (${percentComplete}%) | ✅ ${stats.success} | ❌ ${stats.failed} | ⏭️ ${stats.skipped}`);
    if (eta > 0 && isFinite(eta)) {
      console.log(`   ⏱️  ETA: ${Math.round(eta / 60)} minutes\n`);
    } else {
      console.log('');
    }
  }
}

/**
 * Process villages SEQUENTIALLY (one at a time)
 */
async function processVillages(villages) {
  for (let i = 0; i < villages.length; i++) {
    await scrapeVillage(villages[i]);
    
    // Delay between requests (except for last one)
    if (i < villages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
    }
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🚀 RetirePath ScraperAPI Scraper Starting...\n');
    
    SUPABASE_URL = await prompt('Enter your Supabase URL (e.g., https://xxxxx.supabase.co): ');
    SUPABASE_SERVICE_ROLE_KEY = await prompt('Enter your Supabase Service Role Key: ');
    SCRAPERAPI_KEY = await prompt('Enter your ScraperAPI Key: ');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SCRAPERAPI_KEY) {
      console.error('❌ ERROR: All three keys are required!');
      process.exit(1);
    }
    
    SUPABASE_URL = SUPABASE_URL.replace(/\/$/, '');
    
    console.log('\n📊 Configuration:');
    console.log(`   - Using ScraperAPI ✅`);
    console.log(`   - Batch size: ${BATCH_SIZE}`);
    console.log(`   - Delay: ${DELAY_BETWEEN_REQUESTS}ms`);
    console.log(`   - Timeout: ${SCRAPE_TIMEOUT}ms (${SCRAPE_TIMEOUT/1000} seconds)`);
    console.log('');
    
    // CONTINUOUS LOOP - Process all batches automatically
    let batchNumber = 0;
    let grandTotal = { success: 0, failed: 0, skipped: 0 };
    const overallStartTime = Date.now();
    
    while (true) {
      batchNumber++;
      stats.startTime = Date.now(); // Reset for each batch
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📦 BATCH ${batchNumber}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('📡 Fetching villages from database...\n');
      
      let villages;
      try {
        villages = await getVillagesToScrape();
        console.log(`✅ Successfully fetched villages from database\n`);
      } catch (error) {
        console.error('❌ ERROR fetching villages from database:');
        console.error('   Error message:', error.message);
        console.error('   Error details:', error);
        console.error('\n🔍 Debugging info:');
        console.error('   SUPABASE_URL:', SUPABASE_URL);
        console.error('   Has Service Role Key:', SUPABASE_SERVICE_ROLE_KEY ? 'Yes' : 'No');
        throw error;
      }
      
      if (villages.length === 0) {
        console.log('🎉🎉🎉 ALL VILLAGES SCRAPED! 🎉🎉🎉');
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 GRAND TOTAL STATS:');
        console.log(`   Total Batches: ${batchNumber - 1}`);
        console.log(`   Total Success: ${grandTotal.success}`);
        console.log(`   Total Failed: ${grandTotal.failed}`);
        console.log(`   Total Skipped: ${grandTotal.skipped}`);
        console.log(`   Total Duration: ${Math.round((Date.now() - overallStartTime) / 1000 / 60)} minutes`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n✅ DATABASE COMPLETE! All villages with websites have been scraped!\n');
        break;
      }
      
      // Reset stats for this batch
      stats.total = villages.length;
      stats.processed = 0;
      stats.success = 0;
      stats.failed = 0;
      stats.skipped = 0;
      
      console.log(`📋 Found ${villages.length} villages to scrape`);
      console.log(`⏱️  Estimated time: ${Math.round((villages.length * (DELAY_BETWEEN_REQUESTS + 8000)) / 1000 / 60)} minutes\n`);
      console.log('─────────────────────────────────────────────────────────\n');
      
      await processVillages(villages);
      
      // Add to grand totals
      grandTotal.success += stats.success;
      grandTotal.failed += stats.failed;
      grandTotal.skipped += stats.skipped;
      
      console.log('\n─────────────────────────────────────────────────────────');
      console.log(`✅ BATCH ${batchNumber} COMPLETE!`);
      console.log(`📊 Batch Stats:`);
      console.log(`   Success: ${stats.success}`);
      console.log(`   Failed: ${stats.failed}`);
      console.log(`   Skipped: ${stats.skipped}`);
      console.log(`   Duration: ${Math.round((Date.now() - stats.startTime) / 1000 / 60)} minutes`);
      console.log('────────────────────────────────────────────────────────\n');
      
      console.log('📊 Grand Total So Far:');
      console.log(`   Total Success: ${grandTotal.success}`);
      console.log(`   Total Failed: ${grandTotal.failed}`);
      console.log(`   Total Skipped: ${grandTotal.skipped}\n`);
      
      console.log('⏳ Waiting 5 seconds before next batch...\n');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();