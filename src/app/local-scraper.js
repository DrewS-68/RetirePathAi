/**
 * LOCAL SCRAPER FOR RETIREPATH
 * 
 * This script runs on your LOCAL MACHINE to scrape retirement village websites.
 * It will prompt you for your Supabase credentials.
 */

const https = require('https');
const http = require('http');
const readline = require('readline');

// Configuration
const BATCH_SIZE = 100; // Process 100 villages at a time
const DELAY_BETWEEN_REQUESTS = 2000; // 2 seconds between each scrape
const CONCURRENT_SCRAPES = 5; // Scrape 5 villages at a time

// Will be set after user input
let SUPABASE_URL = '';
let SUPABASE_SERVICE_ROLE_KEY = '';

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
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const urlObj = new URL(url);
    const lib = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...options.headers
      },
      timeout: 20000 // 20 second timeout
    };

    const req = lib.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          statusText: res.statusMessage,
          text: () => Promise.resolve(data),
          json: () => Promise.resolve(JSON.parse(data))
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

/**
 * Fetch HTML from a URL
 */
async function fetchHtml(url) {
  const response = await fetchUrl(url);
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
    /(?:phone|tel|call|contact|enquiry|enquiries|sales)[\s:]*(?:on[\s:]*)?(\(?\\d{2}\)?[\s.-]?\d{4}[\s.-]?\d{4})/gi,
    /(?:phone|tel|call|contact|enquiry|enquiries|sales)[\s:]*(?:on[\s:]*)?(\+?61[\s.-]?\d{1}[\s.-]?\d{4}[\s.-]?\d{4})/gi,
    /(?:1800|1300)[\s.-]?\d{3}[\s.-]?\d{3}/gi,
    /\(?\d{2}\)?[\s.-]?\d{4}[\s.-]?\d{4}/g
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

  // Extract amenities (70+ keywords organized by category)
  const amenityKeywords = {
    // Health & Wellness
    health: ['gym', 'fitness', 'pool', 'swimming', 'spa', 'wellness', 'health', 'medical', 'nurse', 'care'],
    // Social & Recreation
    social: ['lounge', 'community hall', 'cinema', 'theatre', 'library', 'billiards', 'craft room', 'workshop'],
    // Outdoor
    outdoor: ['garden', 'bowling green', 'tennis', 'putting green', 'barbecue', 'outdoor'],
    // Services
    services: ['hairdresser', 'salon', 'cafe', 'restaurant', 'dining', 'bar', 'kiosk'],
    // Security & Safety
    security: ['security', '24-hour', 'emergency call', 'gated', 'secure'],
    // Accommodation
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

  // Count fields found
  extracted.fieldsFound = Object.keys(extracted).length - 3; // Exclude scrapedAt, website, status

  return extracted;
}

/**
 * Get villages that need scraping from Supabase
 */
async function getVillagesToScrape(limit = BATCH_SIZE) {
  const url = `${SUPABASE_URL}/rest/v1/retirement_villages?select=id,name,website,state,scraped_data&website=not.is.null&or=(scraped_data.is.null,scraped_data->>status.eq.failed)&order=state,name&limit=${limit}`;
  
  const response = await fetchUrl(url, {
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch villages: ${response.status} ${response.statusText}\nURL: ${url}\nResponse: ${errorText}`);
  }

  return await response.json();
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
 * Scrape a single village
 */
async function scrapeVillage(village) {
  const startTime = Date.now();
  
  try {
    console.log(`🔍 [${stats.processed + 1}/${stats.total}] ${village.name} (${village.state})`);
    console.log(`   Website: ${village.website}`);

    // Skip if already scraped (unless it was a failure)
    if (village.scraped_data && village.scraped_data.status !== 'failed') {
      console.log(`   ⏭️  Skipped: Already has scraped data`);
      stats.skipped++;
      return;
    }

    // Fetch HTML
    const html = await fetchHtml(village.website);
    console.log(`   📄 HTML fetched: ${html.length} characters`);

    // Extract data
    const extracted = extractDataFromHtml(html, village.website);
    console.log(`   ✅ Success: ${extracted.fieldsFound} fields found`);

    // Update database
    await updateVillage(village.id, extracted);
    
    stats.success++;
    
    const duration = Date.now() - startTime;
    console.log(`   ⏱️  Completed in ${duration}ms`);
    
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    
    // Save failure to database so we don't retry in this session
    try {
      await updateVillage(village.id, {
        status: 'failed',
        reason: error.message,
        scrapedAt: new Date().toISOString()
      });
    } catch (updateError) {
      console.log(`   ⚠️  Failed to save error status: ${updateError.message}`);
    }
    
    stats.failed++;
  } finally {
    stats.processed++;
    
    // Print progress
    const percentComplete = Math.round((stats.processed / stats.total) * 100);
    const elapsed = Math.round((Date.now() - stats.startTime) / 1000);
    const rate = stats.processed / elapsed;
    const remaining = stats.total - stats.processed;
    const eta = remaining / rate;
    
    console.log(`   📊 Progress: ${stats.processed}/${stats.total} (${percentComplete}%) | Success: ${stats.success} | Failed: ${stats.failed} | Skipped: ${stats.skipped}`);
    console.log(`   ⏱️  ETA: ${Math.round(eta / 60)} minutes\n`);
  }
}

/**
 * Process villages with rate limiting
 */
async function processVillages(villages) {
  for (let i = 0; i < villages.length; i += CONCURRENT_SCRAPES) {
    const batch = villages.slice(i, i + CONCURRENT_SCRAPES);
    
    // Process batch concurrently
    await Promise.all(batch.map(village => scrapeVillage(village)));
    
    // Rate limiting delay
    if (i + CONCURRENT_SCRAPES < villages.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
    }
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🚀 RetirePath Local Scraper Starting...\n');
    
    // Get credentials from user
    SUPABASE_URL = await prompt('Enter your Supabase URL (e.g., https://xxxxx.supabase.co): ');
    SUPABASE_SERVICE_ROLE_KEY = await prompt('Enter your Supabase Service Role Key: ');
    
    // Validate inputs
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ ERROR: Both URL and Service Role Key are required!');
      process.exit(1);
    }
    
    // Remove trailing slash from URL
    SUPABASE_URL = SUPABASE_URL.replace(/\/$/, '');
    
    console.log('\n📊 Configuration:');
    console.log(`   - Batch size: ${BATCH_SIZE}`);
    console.log(`   - Delay: ${DELAY_BETWEEN_REQUESTS}ms`);
    console.log(`   - Concurrent: ${CONCURRENT_SCRAPES}`);
    console.log('');
    
    console.log('📡 Fetching villages from database...\n');
    
    const villages = await getVillagesToScrape();
    
    if (villages.length === 0) {
      console.log('✅ No villages need scraping! All done!');
      return;
    }
    
    stats.total = villages.length;
    
    console.log(`📋 Found ${villages.length} villages to scrape`);
    console.log(`⏱️  Estimated time: ${Math.round((villages.length * DELAY_BETWEEN_REQUESTS / CONCURRENT_SCRAPES) / 1000 / 60)} minutes\n`);
    console.log('─────────────────────────────────────────────────────────\n');
    
    await processVillages(villages);
    
    console.log('\n─────────────────────────────────────────────────────────');
    console.log('✅ SCRAPING COMPLETE!');
    console.log(`📊 Final Stats:`);
    console.log(`   Total: ${stats.total}`);
    console.log(`   Success: ${stats.success}`);
    console.log(`   Failed: ${stats.failed}`);
    console.log(`   Skipped: ${stats.skipped}`);
    console.log(`   Duration: ${Math.round((Date.now() - stats.startTime) / 1000 / 60)} minutes`);
    console.log('─────────────────────────────────────────────────────────\n');
    
    // If there are more villages, ask to continue
    const moreVillages = await getVillagesToScrape(1);
    if (moreVillages.length > 0) {
      console.log('🔄 More villages available to scrape!');
      console.log('   Run the script again to continue: node local-scraper.js\n');
    } else {
      console.log('🎉 ALL VILLAGES SCRAPED! Database is complete!\n');
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
main();