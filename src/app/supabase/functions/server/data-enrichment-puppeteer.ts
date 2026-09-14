// Data Enrichment & Web Scraping API Routes  
// Puppeteer-enhanced version - scrapes existing websites with full JavaScript rendering
import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js@2';
import puppeteer from 'npm:puppeteer@23.11.1';

const app = new Hono();

// Initialize Supabase client with service role for admin operations
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

/**
 * GET /data-enrichment/stats
 * Get statistics about villages with/without websites
 */
app.get('/make-server-3bba8be8/data-enrichment/stats', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Verify admin authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - missing access token' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - invalid token' }, 401);
    }
    
    const state = c.req.query('state');
    
    let query = supabase
      .from('retirement_villages')
      .select('website', { count: 'exact' });
    
    if (state) {
      query = query.eq('state', state);
    }
    
    const { count: total } = await query;
    const { count: withWebsites } = await query.not('website', 'is', null);
    
    return c.json({
      total: total || 0,
      withWebsites: withWebsites || 0,
      withoutWebsites: (total || 0) - (withWebsites || 0)
    });
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    return c.json({ error: 'Failed to fetch stats', details: error.message }, 500);
  }
});

/**
 * GET /data-enrichment/sample-village/:state
 * Get a sample village with website from a state for testing
 */
app.get('/make-server-3bba8be8/data-enrichment/sample-village/:state', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Verify admin authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - missing access token' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - invalid token' }, 401);
    }
    
    const state = c.req.param('state');
    
    const { data: village, error: fetchError } = await supabase
      .from('retirement_villages')
      .select('*')
      .eq('state', state)
      .not('website', 'is', null)
      .limit(1)
      .single();
    
    if (fetchError || !village) {
      return c.json({ error: 'No village found with website' }, 404);
    }
    
    return c.json({ village });
    
  } catch (error) {
    console.error('Error fetching sample village:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * POST /data-enrichment/scrape-village-data
 * Scrape data from village websites using Puppeteer for full JavaScript rendering
 */
app.post('/make-server-3bba8be8/data-enrichment/scrape-village-data', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Verify admin authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      console.error('Authorization error: No access token provided');
      return c.json({ error: 'Unauthorized - missing access token' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      console.error('Authorization error during scraping:', authError);
      return c.json({ error: 'Unauthorized - invalid token' }, 401);
    }
    
    const { state } = await c.req.json();
    
    console.log(`🚀 Starting Puppeteer-enhanced scrape for state: ${state}`);
    
    // Get villages with websites that haven't been scraped yet (no scraped_data)
    // LIMIT to 5 villages per batch (Puppeteer is slower but more thorough)
    const { data: villages, error: fetchError } = await supabase
      .from('retirement_villages')
      .select('*')
      .eq('state', state)
      .not('website', 'is', null)
      .is('scraped_data', null) // Only scrape villages that haven't been scraped yet
      .order('name')
      .limit(5); // Reduced from 10 - Puppeteer needs more time per site
    
    if (fetchError) {
      console.error('Error fetching villages:', fetchError);
      return c.json({ error: 'Failed to fetch villages', details: fetchError.message }, 500);
    }
    
    console.log(`Found ${villages?.length || 0} villages to scrape in ${state} (limited to 5 per batch with Puppeteer)`);
    
    const results = [];
    let browser = null;
    
    try {
      // Launch browser once for all villages
      console.log('🌐 Launching headless browser...');
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process'
        ]
      });
      
      console.log('✅ Browser launched successfully');
    
      // Scrape each village
      for (const village of villages || []) {
        let page = null;
        try {
          console.log(`🔍 Scraping: ${village.name} - ${village.website}`);
          
          // Skip if already has scraped_data (extra safety check)
          if (village.scraped_data) {
            results.push({
              villageId: village.id,
              name: village.name,
              status: 'skipped',
              reason: 'Already has scraped data',
              website: village.website
            });
            continue;
          }
          
          // Create new page for this village
          page = await browser.newPage();
          
          // Set viewport and user agent
          await page.setViewport({ width: 1920, height: 1080 });
          await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
          
          // Navigate to website with timeout
          try {
            await page.goto(village.website, {
              waitUntil: 'networkidle2',
              timeout: 60000 // 60 second timeout (increased from 30)
            });
          } catch (navError) {
            console.log(`⚠️ Navigation timeout/error for ${village.name}, trying domcontentloaded...`);
            await page.goto(village.website, {
              waitUntil: 'domcontentloaded',
              timeout: 30000 // 30 second timeout (increased from 15)
            });
          }
          
          // Wait a bit for any lazy-loaded content
          await page.waitForTimeout(2000);
          
          // Get page content
          const html = await page.content();
          const htmlLower = html.toLowerCase();
          
          // Check for parked domains
          const parkedDomainIndicators = [
            'godaddy', 'domain for sale', 'buy this domain', 
            'this domain is for sale', 'parked domain', 'namecheap',
            'sedo', 'domain parking', 'afternic', 'hugedomains', 'bodis'
          ];
          
          const isParked = parkedDomainIndicators.some(indicator => htmlLower.includes(indicator));
          
          if (isParked) {
            console.log(`⚠️ Parked domain detected for ${village.name}: ${village.website}`);
            results.push({
              villageId: village.id,
              name: village.name,
              status: 'skipped',
              reason: 'Parked domain or for sale page detected',
              website: village.website
            });
            await page.close();
            continue;
          }
          
          // Get text content from rendered page
          const textContent = await page.evaluate(() => document.body.innerText.toLowerCase());
          
          // Initialize scraped data object
          const scrapedData: any = {
            source: 'puppeteer_scraper',
            scraped_at: new Date().toISOString(),
            scraped_from: village.website
          };
          
          let fieldsFound = 0;
          
          console.log(`📊 Extracting data for ${village.name}...`);
          
          // Extract pricing information
          const pricingPatterns = [
            /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:per week|pw|weekly|\/week)/gi,
            /entry\s*(?:price|fee|cost|contribution)[:\s]*\$\s*(\d{1,3}(?:,\d{3})*)/gi,
            /from\s*\$\s*(\d{1,3}(?:,\d{3})*)/gi,
            /prices?\s*(?:start|starting|from)[:\s]*\$\s*(\d{1,3}(?:,\d{3})*)/gi,
            /weekly\s*(?:fee|fees|charge)[:\s]*\$\s*(\d{1,3}(?:,\d{3})*)/gi,
            /service\s*fee[:\s]*\$\s*(\d{1,3}(?:,\d{3})*)/gi,
            /deferred\s*management\s*fee/gi,
            /investment\s*(?:range|from)[:\s]*\$\s*(\d{1,3}(?:,\d{3})*)/gi,
            /unit\s*prices?\s*(?:from|start)[:\s]*\$\s*(\d{1,3}(?:,\d{3})*)/gi,
            /\$\s*(\d{1,3}(?:,\d{3})*)\s*-\s*\$\s*(\d{1,3}(?:,\d{3})*)/gi
          ];
          
          const priceMatches = [];
          for (const pattern of pricingPatterns) {
            const matches = [...textContent.matchAll(pattern)];
            for (const match of matches) {
              if (match[1]) priceMatches.push(parseInt(match[1].replace(/,/g, '')));
              if (match[2]) priceMatches.push(parseInt(match[2].replace(/,/g, '')));
            }
          }
          
          if (priceMatches.length > 0) {
            const uniquePrices = [...new Set(priceMatches)].filter(p => p > 100 && p < 10000000);
            if (uniquePrices.length > 0) {
              uniquePrices.sort((a, b) => a - b);
              scrapedData.scraped_entry_price_min = uniquePrices[0];
              scrapedData.scraped_entry_price_max = uniquePrices[uniquePrices.length - 1];
              fieldsFound++;
              console.log(`  💰 Found pricing: $${uniquePrices[0]} - $${uniquePrices[uniquePrices.length - 1]}`);
            }
          }
          
          // Extract phone numbers - ENHANCED with page.evaluate
          const phoneNumbers = await page.evaluate(() => {
            const phones = [];
            const phonePattern = /(?:phone|call|contact|tel|enquir)[:\s]*(\d{2,4}[\s\-]?\d{3,4}[\s\-]?\d{4})/gi;
            
            // Search in all text nodes
            const walker = document.createTreeWalker(
              document.body,
              NodeFilter.SHOW_TEXT,
              null
            );
            
            let node;
            while (node = walker.nextNode()) {
              const matches = node.textContent?.matchAll(phonePattern);
              if (matches) {
                for (const match of matches) {
                  if (match[1]) phones.push(match[1].trim());
                }
              }
            }
            
            // Also check href attributes for tel: links
            document.querySelectorAll('a[href^="tel:"]').forEach(link => {
              const tel = link.getAttribute('href')?.replace('tel:', '').trim();
              if (tel) phones.push(tel);
            });
            
            return [...new Set(phones)]; // Remove duplicates
          });
          
          if (phoneNumbers.length > 0 && !village.contact_phone) {
            scrapedData.scraped_contact_phone = phoneNumbers[0];
            fieldsFound++;
            console.log(`  📞 Found phone: ${phoneNumbers[0]}`);
          }
          
          // Extract amenities - comprehensive list for Australian retirement villages
          const amenityKeywords = [
            // Recreation & Fitness
            'swimming pool', 'pool', 'heated pool', 'indoor pool', 'outdoor pool',
            'gym', 'fitness', 'fitness centre', 'fitness center', 'exercise room',
            'bowling green', 'lawn bowls', 'croquet', 'tennis court',
            'golf', 'putting green', 'mini golf',
            
            // Social & Entertainment
            'library', 'cinema', 'theatre', 'movie theatre',
            'community hall', 'function room', 'activities room', 'meeting room',
            'lounge', 'residents lounge', 'common lounge',
            'bar', 'club', 'social club', 'club house', 'clubhouse',
            'games room', 'billiards', 'pool table', 'snooker',
            
            // Creative & Hobbies
            'workshop', 'craft room', 'art room', 'pottery',
            'woodwork', 'men\'s shed', 'hobby room',
            
            // Beauty & Wellness
            'hairdresser', 'salon', 'beauty salon', 'barber',
            'spa', 'massage', 'wellness centre',
            
            // Outdoor & Gardens
            'garden', 'gardens', 'landscaped gardens', 'community garden',
            'courtyard', 'outdoor area', 'barbecue area', 'bbq area',
            'walking paths', 'walking tracks',
            
            // Dining & Food
            'cafe', 'coffee shop', 'restaurant', 'dining room',
            'commercial kitchen', 'shared kitchen',
            
            // Medical & Care
            'medical centre', 'health centre', 'clinic',
            'emergency call', '24-hour emergency',
            
            // Services
            'laundry', 'laundromat', 'laundry facilities',
            'parking', 'car park', 'garage', 'covered parking',
            'visitor parking', 'guest parking',
            
            // Technology & Communication
            'internet', 'wifi', 'wi-fi', 'broadband',
            'computer room',
            
            // Security
            'security', 'gated', 'secure entry', 'intercom',
            
            // Additional
            'elevator', 'lift', 'chapel', 'prayer room'
          ];
          
          const foundAmenities = amenityKeywords.filter(amenity => 
            textContent.includes(amenity)
          );
          
          if (foundAmenities.length > 0) {
            scrapedData.scraped_amenities = foundAmenities;
            fieldsFound++;
            console.log(`  🏊 Found ${foundAmenities.length} amenities`);
          }
          
          // Check if pet friendly
          if (textContent.includes('pet friendly') || 
              textContent.includes('pets welcome') ||
              textContent.includes('pet-friendly') ||
              textContent.includes('pets allowed')) {
            scrapedData.scraped_pet_friendly = true;
            fieldsFound++;
            console.log(`  🐕 Pet friendly: Yes`);
          }
          
          // Extract image URLs - ENHANCED with Puppeteer evaluation
          console.log(`  🖼️  Extracting images...`);
          const images = await page.evaluate(() => {
            const imageData = [];
            const imgElements = document.querySelectorAll('img');
            
            imgElements.forEach((img, index) => {
              const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
              if (!src) return;
              
              // Skip small icons, logos, SVGs, and base64 images
              if (src.includes('logo') || 
                  src.includes('icon') || 
                  src.endsWith('.svg') ||
                  src.startsWith('data:') ||
                  src.includes('spinner') ||
                  src.includes('loading') ||
                  src.includes('placeholder')) {
                return;
              }
              
              // Check image dimensions (skip tiny images)
              const width = img.naturalWidth || img.width;
              const height = img.naturalHeight || img.height;
              
              if (width < 200 || height < 150) {
                return; // Skip small images
              }
              
              // Check for high-quality indicators
              const alt = (img.alt || '').toLowerCase();
              const className = (img.className || '').toLowerCase();
              const parentClass = (img.parentElement?.className || '').toLowerCase();
              
              const isHighQuality = 
                className.includes('gallery') ||
                className.includes('hero') ||
                className.includes('featured') ||
                className.includes('slider') ||
                className.includes('carousel') ||
                parentClass.includes('gallery') ||
                parentClass.includes('slider') ||
                parentClass.includes('hero') ||
                src.includes('gallery') ||
                src.includes('slider') ||
                src.includes('hero');
              
              imageData.push({
                url: src,
                width,
                height,
                isHighQuality,
                alt
              });
            });
            
            return imageData;
          });
          
          // Filter and sort images
          const sortedImages = images
            .filter(img => img.width >= 400 && img.height >= 300) // Higher quality threshold
            .sort((a, b) => {
              // Prioritize high quality first
              if (a.isHighQuality !== b.isHighQuality) {
                return b.isHighQuality ? 1 : -1;
              }
              // Then by size
              return (b.width * b.height) - (a.width * a.height);
            })
            .map(img => img.url)
            .slice(0, 8); // Increased from 6 to 8 images
          
          if (sortedImages.length > 0) {
            scrapedData.scraped_images = sortedImages;
            fieldsFound++;
            console.log(`  🖼️  Found ${sortedImages.length} high-quality images`);
          }
          
          // Close the page
          await page.close();
          
          // Only store if we found at least one field
          if (fieldsFound > 0) {
            const { error: updateError } = await supabase
              .from('retirement_villages')
              .update({ 
                scraped_data: scrapedData,
                updated_at: new Date().toISOString()
              })
              .eq('id', village.id);
            
            if (updateError) {
              results.push({
                villageId: village.id,
                name: village.name,
                status: 'failed',
                reason: 'Failed to save scraped data',
                error: updateError.message
              });
            } else {
              results.push({
                villageId: village.id,
                name: village.name,
                status: 'success',
                website: village.website,
                fieldsFound
              });
              console.log(`  ✅ Successfully scraped ${fieldsFound} fields for ${village.name}`);
            }
          } else {
            results.push({
              villageId: village.id,
              name: village.name,
              status: 'no_data',
              reason: 'No data fields found on website',
              website: village.website
            });
            console.log(`  ⚠️  No data found for ${village.name}`);
          }
          
          // Rate limiting - wait 3 seconds between scrapes (Puppeteer is more intensive)
          await new Promise(resolve => setTimeout(resolve, 3000));
          
        } catch (error) {
          console.error(`❌ Error scraping ${village.name}:`, error);
          if (page) await page.close();
          results.push({
            villageId: village.id,
            name: village.name,
            status: 'error',
            reason: error.message,
            website: village.website
          });
        }
      }
    } finally {
      // Always close browser
      if (browser) {
        await browser.close();
        console.log('🔒 Browser closed');
      }
    }
    
    // Calculate summary stats
    const summary = {
      total: results.length,
      success: results.filter(r => r.status === 'success').length,
      noData: results.filter(r => r.status === 'no_data').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      failed: results.filter(r => r.status === 'failed' || r.status === 'error').length
    };
    
    console.log('✅ Puppeteer scraping complete:', summary);
    
    return c.json({ 
      success: true,
      summary,
      results
    });
    
  } catch (error) {
    console.error('Unexpected error in Puppeteer scraping:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * GET /data-enrichment/villages-with-scraped-data
 * Get all villages that have scraped data pending review
 */
app.get('/make-server-3bba8be8/data-enrichment/villages-with-scraped-data', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Verify admin authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - missing access token' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - invalid token' }, 401);
    }
    
    const { data: villages, error } = await supabase
      .from('retirement_villages')
      .select('*')
      .not('scraped_data', 'is', null)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching villages with scraped data:', error);
      return c.json({ error: 'Failed to fetch villages', details: error.message }, 500);
    }
    
    return c.json({ villages: villages || [] });
    
  } catch (error) {
    console.error('Unexpected error fetching villages with scraped data:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

export default app;
