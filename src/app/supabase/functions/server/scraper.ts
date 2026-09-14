import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";
import { sendEmail, operatorDataUpdateRequestEmail } from './email.tsx';
import * as kv from './kv_store.tsx';
import { validateVillageUrl, detectOperatorMismatch, KNOWN_OPERATOR_DOMAINS } from './url-validator.ts';
import { trySearchWithFallback } from './scraper-v2-cascading.ts';

const app = new Hono();

// Initialize Supabase client
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
};

/**
 * Clean URL by removing UTM parameters, tracking codes, and other query parameters
 * Example: https://aveo.com.au/village?utm_campaign=google → https://aveo.com.au/village
 */
function cleanUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Remove ALL query parameters (utm_, fbclid, gclid, etc.)
    urlObj.search = '';
    
    // Remove trailing slash for consistency
    let cleanedUrl = urlObj.toString();
    if (cleanedUrl.endsWith('/')) {
      cleanedUrl = cleanedUrl.slice(0, -1);
    }
    
    console.log(`   🧹 URL cleaned: ${url} → ${cleanedUrl}`);
    return cleanedUrl;
  } catch (e) {
    // If URL parsing fails, return original
    console.log(`   ⚠️ Could not parse URL for cleaning: ${url}`);
    return url;
  }
}

/**
 * Check if an operator is in the trusted whitelist
 */
function isOperatorTrusted(operator: string | null): boolean {
  if (!operator) return false;
  
  const operatorNormalized = operator.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  return KNOWN_OPERATOR_DOMAINS.some(item => {
    const knownNormalized = item.operator.toLowerCase().replace(/[^a-z0-9]/g, '');
    return knownNormalized === operatorNormalized;
  });
}

/**
 * Blacklist of common aggregator/directory sites (NOT official village websites)
 */
const AGGREGATOR_SITES = [
  'agedcareonline.com.au',
  'agedcareview.com.au',
  'agedcarequality.gov.au',
  'myagedcare.gov.au',
  'downsizing.com.au',
  'retirementlivingonline.com.au',
  'theurbandeveloper.com',
  'australianretirementvillages.com.au',
  'retirementliving.org.au',
  'agedcare101.com.au',
  'agedcareguide.com.au',
  'eldernet.com.au',
  'retirementvillages.com.au',
  'villages.com.au',
  'choice.com.au',
  'domain.com.au',
  'realestate.com.au',
  'ratecity.com.au',
  'productreview.com.au',
  'yelp.com',
  'tripadvisor.com',
  'yellowpages.com.au',
  'truelocal.com.au',
  'hotfrog.com.au',
  'whereis.com',
  'careforyou.com.au',
  'retirementlivingaustralia.com.au',
  'birdeye.com',
  'reviews.birdeye.com',
  'google.com/maps',
  'goo.gl/maps',
  'seek.com.au',
  'indeed.com.au',
  'jora.com',
  'careerone.com.au',
  'ethicaljobs.com.au',
  'jobs.com.au',
  'talent.com',
  'adzuna.com.au',
  // Test/sandbox sites
  'sandbox.haaa.com.au',
  // Review aggregators
  'careopinion.org.au',
  // Government sites (not village websites)
  'transport.vic.gov.au',
];

/**
 * Extract text from HTML using regex patterns
 */
function extractText(html: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      // Clean up HTML entities and extra whitespace
      return match[1]
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
    }
  }
  return null;
}

/**
 * Extract array of items from HTML
 */
function extractArray(html: string, patterns: RegExp[]): string[] {
  const items = new Set<string>();
  
  for (const pattern of patterns) {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        const cleaned = match[1]
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (cleaned && cleaned.length > 2 && cleaned.length < 100) {
          items.add(cleaned);
        }
      }
    }
  }
  
  return Array.from(items);
}

/**
 * Extract pricing information
 */
function extractPricing(html: string) {
  const pricing: any = {};
  
  // More flexible entry price patterns - handles ranges AND fixed prices
  // UPDATED: Now includes AGED CARE terminology (RAD, DAC, etc.)
  const entryRangePatterns = [
    // AGED CARE: RAD (Refundable Accommodation Deposit) patterns
    /(?:RAD|refundable\s+accommodation\s+deposit|accommodation\s+deposit|DAC|daily\s+accommodation\s+contribution)\s*:?\s*\$?\s*([\d,]+)(?:k|,000)?\s*(?:-|to|–)\s*\$?\s*([\d,]+)(?:k|,000)?/gi,
    /(?:maximum|minimum)?\s*(?:RAD|refundable\s+accommodation\s+deposit)\s*:?\s*\$\s*([\d,]+)(?:k|,000)?/gi,
    
    // RETIREMENT VILLAGES: Traditional entry price patterns
    /(?:entry|purchase|buy|buy-in|ingoing|deferred)\s+(?:price|cost|fee|contribution)s?\s*:?\s*\$?\s*([\d,]+)(?:k|,000)?\s*(?:-|to|–)\s*\$?\s*([\d,]+)(?:k|,000)?/gi,
    /from\s+\$\s*([\d,]+)(?:k|,000)?\s+(?:to|–|-)\s+\$?\s*([\d,]+)(?:k|,000)?/gi,
    /\$\s*([\d,]+)(?:k|,000)?\s*-\s*\$?\s*([\d,]+)(?:k|,000)?/g,
    
    // "Starting from" patterns (use as both min and max)
    /(?:from|starting|starts?\s+at|starting\s+from|price\s+from)\s*:?\s*\$\s*([\d,]+)(?:k|,000)?/gi,
  ];
  
  // Fixed price patterns (single value)
  const entryFixedPatterns = [
    // AGED CARE: RAD patterns
    /(?:RAD|refundable\s+accommodation\s+deposit|accommodation\s+deposit)\s*:?\s*\$\s*([\d,]+)(?:k|,000)?/gi,
    
    // RETIREMENT VILLAGES: Traditional patterns
    /(?:entry|purchase|buy|buy-in|ingoing|deferred)\s+(?:price|cost|fee|contribution)s?\s*:?\s*\$\s*([\d,]+)(?:k|,000)?/gi,
    /price\s*:?\s*\$\s*([\d,]+)(?:k|,000)?/gi,
  ];
  
  // Try range patterns first
  for (const pattern of entryRangePatterns) {
    pattern.lastIndex = 0; // Reset regex
    const matches = Array.from(html.matchAll(pattern));
    
    for (const match of matches) {
      if (match[2]) {
        // It's a range
        let min = parseInt(match[1].replace(/,/g, ''));
        let max = parseInt(match[2].replace(/,/g, ''));
        
        // Handle "k" suffix (e.g., "500k" = 500000)
        if (match[0].toLowerCase().includes('k')) {
          if (min < 10000) min *= 1000;
          if (max < 10000) max *= 1000;
        }
        
        // Validate range (between $50k and $2M for entry prices)
        if (min >= 50000 && max <= 2000000 && min < max) {
          pricing.entry_price_min = min;
          pricing.entry_price_max = max;
          break;
        }
      } else if (match[1]) {
        // "From $X" pattern - use as minimum
        let price = parseInt(match[1].replace(/,/g, ''));
        if (match[0].toLowerCase().includes('k') && price < 10000) {
          price *= 1000;
        }
        if (price >= 50000 && price <= 2000000) {
          pricing.entry_price_min = price;
          pricing.entry_price_max = price;
          break;
        }
      }
    }
    if (pricing.entry_price_min) break;
  }
  
  // If no range found, try fixed price patterns
  if (!pricing.entry_price_min) {
    for (const pattern of entryFixedPatterns) {
      pattern.lastIndex = 0;
      const matches = Array.from(html.matchAll(pattern));
      
      for (const match of matches) {
        if (match[1]) {
          let price = parseInt(match[1].replace(/,/g, ''));
          
          // Handle "k" suffix
          if (match[0].toLowerCase().includes('k') && price < 10000) {
            price *= 1000;
          }
          
          // Validate (between $50k and $2M)
          if (price >= 50000 && price <= 2000000) {
            pricing.entry_price_min = price;
            pricing.entry_price_max = price;
            break;
          }
        }
      }
      if (pricing.entry_price_min) break;
    }
  }
  
  // Monthly/weekly fees patterns - more flexible
  // UPDATED: Now includes AGED CARE daily fees (DAP, Basic Daily Fee)
  const monthlyRangePatterns = [
    // AGED CARE: Daily fees (DAP, Basic Daily Fee) - convert to monthly
    /(?:DAP|daily\s+accommodation\s+payment|basic\s+daily\s+fee|daily\s+fee)\s*:?\s*\$?\s*([\d,]+(?:\.\d{2})?)\s*(?:-|to|–)\s*\$?\s*([\d,]+(?:\.\d{2})?)/gi,
    
    // RETIREMENT VILLAGES: Traditional monthly/weekly patterns
    /(?:monthly|ongoing|recurrent|service)\s+(?:fee|fees|cost|charge|contribution)s?\s*:?\s*\$?\s*([\d,]+)\s*(?:-|to|–)\s*\$?\s*([\d,]+)/gi,
    /weekly\s+(?:fee|fees|cost|charge)s?\s*:?\s*\$?\s*([\d,]+)\s*(?:-|to|–)\s*\$?\s*([\d,]+)/gi,
  ];
  
  const monthlyFixedPatterns = [
    // AGED CARE: Daily fees (convert to monthly: daily * 30.42)
    /(?:DAP|daily\s+accommodation\s+payment|basic\s+daily\s+fee|daily\s+fee)\s*:?\s*\$\s*([\d,]+(?:\.\d{2})?)/gi,
    
    // RETIREMENT VILLAGES: Traditional patterns
    /(?:monthly|ongoing|recurrent|service)\s+(?:fee|fees|cost|charge|contribution)s?\s*:?\s*\$\s*([\d,]+)/gi,
    /weekly\s+(?:fee|fees|cost|charge)s?\s*:?\s*\$\s*([\d,]+)/gi,
  ];
  
  // Try range patterns for monthly fees
  for (const pattern of monthlyRangePatterns) {
    pattern.lastIndex = 0;
    const matches = Array.from(html.matchAll(pattern));
    
    for (const match of matches) {
      if (match[1] && match[2]) {
        let min = parseFloat(match[1].replace(/,/g, ''));
        let max = parseFloat(match[2].replace(/,/g, ''));
        
        // Convert daily to monthly (daily * 30.42 average days/month)
        if (match[0].toLowerCase().includes('daily') || match[0].toLowerCase().includes('dap')) {
          min = Math.round(min * 30.42);
          max = Math.round(max * 30.42);
        }
        
        // Convert weekly to monthly
        if (match[0].toLowerCase().includes('weekly')) {
          min = Math.round(min * 4.33);
          max = Math.round(max * 4.33);
        }
        
        // Validate (between $100 and $10000/month - increased max for aged care)
        if (min >= 100 && max <= 10000 && min < max) {
          pricing.monthly_fees_min = min;
          pricing.monthly_fees_max = max;
          break;
        }
      }
    }
    if (pricing.monthly_fees_min) break;
  }
  
  // Try fixed price patterns for monthly fees
  if (!pricing.monthly_fees_min) {
    for (const pattern of monthlyFixedPatterns) {
      pattern.lastIndex = 0;
      const matches = Array.from(html.matchAll(pattern));
      
      for (const match of matches) {
        if (match[1]) {
          let price = parseFloat(match[1].replace(/,/g, ''));
          
          // Convert daily to monthly (daily * 30.42)
          if (match[0].toLowerCase().includes('daily') || match[0].toLowerCase().includes('dap')) {
            price = Math.round(price * 30.42);
          }
          
          // Convert weekly to monthly
          if (match[0].toLowerCase().includes('weekly')) {
            price = Math.round(price * 4.33);
          }
          
          // Validate (increased max to $10k for aged care)
          if (price >= 100 && price <= 10000) {
            pricing.monthly_fees_min = price;
            pricing.monthly_fees_max = price;
            break;
          }
        }
      }
      if (pricing.monthly_fees_min) break;
    }
  }
  
  return pricing;
}

/**
 * Extract email addresses
 */
function extractEmail(html: string): string | null {
  const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
  const match = html.match(emailPattern);
  
  if (match && match[1]) {
    const email = match[1].toLowerCase();
    // Filter out common noise emails
    if (!email.includes('example.com') && 
        !email.includes('test.com') &&
        !email.includes('wixpress.com') &&
        !email.includes('sentry.io')) {
      return email;
    }
  }
  
  return null;
}

/**
 * Extract phone number
 */
function extractPhone(html: string): string | null {
  const phonePatterns = [
    /(?:phone|tel|call)[\s:]*([0-9\s\(\)\-\+]{10,})/i,
    /(\+?61\s?[2-478](?:\s?\d){8})/,
    /(\(0[2-478]\)\s?\d{4}\s?\d{4})/,
    /(0[2-478]\s?\d{4}\s?\d{4})/,
  ];
  
  for (const pattern of phonePatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      // Clean up phone number
      let phone = match[1].replace(/\s+/g, ' ').trim();
      if (phone.length >= 10) {
        return phone;
      }
    }
  }
  
  return null;
}

/**
 * Extract village type
 */
function extractVillageType(html: string): string | null {
  if (/independent\s+living/i.test(html)) return 'Independent Living';
  if (/assisted\s+living/i.test(html)) return 'Assisted Living';
  if (/aged\s+care/i.test(html)) return 'Aged Care';
  if (/retirement\s+village/i.test(html)) return 'Retirement Village';
  return null;
}

/**
 * Detect facility type (Retirement Village vs Aged Care vs Both)
 * This is CRITICAL for separating retirement pricing from aged care pricing
 */
function detectFacilityType(html: string): 'retirement_village' | 'aged_care' | 'both' | null {
  const htmlLower = html.toLowerCase();
  
  // AGED CARE KEYWORDS (strong indicators)
  const agedCareKeywords = [
    'rad',
    'refundable accommodation deposit',
    'daily accommodation payment',
    'dap',
    'basic daily fee',
    'residential aged care',
    'nursing home',
    'my aged care',
    'acar',
    'dementia care',
    'palliative care',
    'aged care services',
  ];
  
  // RETIREMENT VILLAGE KEYWORDS (strong indicators)
  const retirementKeywords = [
    'retirement village',
    'retirement living',
    'over 55',
    '55+',
    '55 plus',
    'independent living units',
    'retirement units',
    'retirement apartments',
    'entry price',
    'exit fee',
    'deferred management fee',
    'dmf',
    'ingoing contribution',
  ];
  
  // Count matches
  let agedCareScore = 0;
  let retirementScore = 0;
  
  for (const keyword of agedCareKeywords) {
    if (htmlLower.includes(keyword)) {
      agedCareScore++;
    }
  }
  
  for (const keyword of retirementKeywords) {
    if (htmlLower.includes(keyword)) {
      retirementScore++;
    }
  }
  
  console.log(`   🏥 Aged Care Score: ${agedCareScore} | 🏘️ Retirement Score: ${retirementScore}`);
  
  // Determine facility type based on scores
  if (agedCareScore >= 2 && retirementScore >= 2) {
    return 'both';
  } else if (agedCareScore >= 2) {
    return 'aged_care';
  } else if (retirementScore >= 2) {
    return 'retirement_village';
  }
  
  return null;
}

/**
 * Extract care level
 */
function extractCareLevel(html: string): string | null {
  if (/low\s+care/i.test(html)) return 'Low Care';
  if (/high\s+care/i.test(html)) return 'High Care';
  if (/dementia\s+care/i.test(html)) return 'Dementia Care';
  if (/independent/i.test(html)) return 'Independent';
  return null;
}

/**
 * Extract images from HTML
 */
function extractImages(html: string, baseUrl: string): string[] {
  const images = new Set<string>();
  
  // Extract img src attributes - MUCH more flexible now
  const imgPattern = /<img[^>]+src=["']([^"']+)["']/gi;
  const matches = html.matchAll(imgPattern);
  
  for (const match of matches) {
    let imgUrl = match[1];
    
    // Skip tiny icons/logos based on common naming patterns
    const skipPatterns = [
      'icon',
      'logo',
      'favicon',
      'sprite',
      'emoji',
      'avatar',
      'facebook',
      'twitter',
      'instagram',
      'linkedin',
      'youtube',
      'social',
    ];
    
    const shouldSkip = skipPatterns.some(pattern => 
      imgUrl.toLowerCase().includes(pattern)
    );
    
    if (shouldSkip) {
      continue;
    }
    
    // Convert relative URLs to absolute
    if (imgUrl.startsWith('//')) {
      imgUrl = 'https:' + imgUrl;
    } else if (imgUrl.startsWith('/')) {
      const urlObj = new URL(baseUrl);
      imgUrl = `${urlObj.protocol}//${urlObj.host}${imgUrl}`;
    } else if (!imgUrl.startsWith('http')) {
      imgUrl = new URL(imgUrl, baseUrl).toString();
    }
    
    // Only include valid image URLs - expanded to include more formats
    if (imgUrl.match(/\.(jpg|jpeg|png|webp|gif|svg)/i) || 
        imgUrl.includes('image') || 
        imgUrl.includes('photo') ||
        imgUrl.includes('gallery')) {
      images.add(imgUrl);
      console.log(`   🖼️  Found image: ${imgUrl.substring(0, 80)}...`);
    }
  }
  
  const imageArray = Array.from(images).slice(0, 20); // Increased to 20 images
  console.log(`   📸 Total images extracted: ${imageArray.length}`);
  
  return imageArray;
}

/**
 * Main scraping function
 */
async function scrapeVillageWebsite(url: string, villageName: string) {
  try {
    const scraperApiKey = Deno.env.get('SCRAPERAPI_KEY');
    
    console.log(`🕷️  Scraping: ${villageName} (${url})`);
    
    let html = '';
    let usedMethod = '';
    
    // Try ScraperAPI first (if key is available)
    if (scraperApiKey) {
      try {
        const scraperUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(url)}`;
        
        // Add timeout to prevent hanging (20 seconds max)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);
        
        const response = await fetch(scraperUrl, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          html = await response.text();
          usedMethod = 'ScraperAPI';
          console.log(`✅ ScraperAPI success: Retrieved ${html.length} characters`);
        } else {
          console.warn(`⚠️ ScraperAPI returned ${response.status}: ${response.statusText} - falling back to direct fetch`);
        }
      } catch (scraperError) {
        console.warn(`⚠️ ScraperAPI failed: ${scraperError instanceof Error ? scraperError.message : 'Unknown error'} - falling back to direct fetch`);
      }
    }
    
    // Fallback to direct fetch if ScraperAPI failed or is not configured
    if (!html) {
      console.log(`🔄 Using direct fetch for ${url}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          redirect: 'follow', // IMPORTANT: Follow redirects
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0',
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Direct fetch returned ${response.status}: ${response.statusText}. URL may be incorrect or site is blocking requests.`);
        }
        
        html = await response.text();
        usedMethod = 'Direct Fetch';
        console.log(`✅ Direct fetch success: Retrieved ${html.length} characters`);
      } catch (directError) {
        clearTimeout(timeoutId);
        throw new Error(`Both ScraperAPI and direct fetch failed. Direct fetch error: ${directError instanceof Error ? directError.message : 'Unknown error'}`);
      }
    }
    
    if (!html || html.length < 100) {
      throw new Error(`Retrieved HTML is too small (${html.length} chars) - likely an error page`);
    }
    
    const htmlLower = html.toLowerCase();
    
    console.log(`📄 Processing ${html.length} characters of HTML (via ${usedMethod})`);
    
    // Extract ALL tiers in one pass
    const tier1: any = {};
    const tier2: any = {};
    const tier3: any = {};
    
    // TIER 1 - Essential
    const villageType = extractVillageType(html);
    if (villageType) tier1.village_type = villageType;
    
    const careLevel = extractCareLevel(html);
    if (careLevel) tier1.care_level = careLevel;
    
    // **NEW: Detect facility type** (retirement_village, aged_care, or both)
    const facilityType = detectFacilityType(html);
    if (facilityType) {
      tier1.facility_type = facilityType;
      console.log(`   🏷️  Facility Type: ${facilityType.toUpperCase().replace('_', ' ')}`);
    }
    
    // TIER 2 - Important
    const pricing = extractPricing(html);
    Object.assign(tier2, pricing);
    
    const email = extractEmail(html);
    if (email) tier2.contact_email = email;
    
    const phone = extractPhone(html);
    if (phone) tier2.contact_phone = phone;
    
    // Extract amenities
    const amenityPatterns = [
      // Look for <li> tags with amenity keywords (original pattern)
      /<li[^>]*>([^<]*(?:pool|gym|garden|library|cinema|cafe|restaurant|salon|lounge|hall|workshop|studio|fitness|spa|bbq|barbecue|theatre|theater|chapel|bowling|billiard|tennis|court|community|dining|auditorium)[^<]*)<\/li>/gi,
      
      // Look for any <li> tag content (broader search for ALL list items)
      /<li[^>]*class="[^"]*(?:amenity|feature|facility)[^"]*"[^>]*>([^<]+)<\/li>/gi,
      /<li[^>]*>([^<]{10,80})<\/li>/gi, // Any li with 10-80 chars (likely amenities)
      
      // Look for divs or spans with amenity/feature classes
      /<div[^>]*class="[^"]*(?:amenity|feature|facility)[^"]*"[^>]*>([^<]+)<\/div>/gi,
      /<span[^>]*class="[^"]*(?:amenity|feature|facility)[^"]*"[^>]*>([^<]+)<\/span>/gi,
    ];
    const amenities = extractArray(html, amenityPatterns);
    if (amenities.length > 0) {
      console.log(`🎯 Found ${amenities.length} amenities:`, amenities);
      tier2.amenities = amenities;
    } else {
      console.log('⚠️ No amenities found - HTML may have different structure');
    }
    
    // Extract care services
    const carePatterns = [
      /<li[^>]*>([^<]*(?:care|nursing|medical|health|therapy|assistance|support)[^<]*)<\/li>/gi,
    ];
    const careServices = extractArray(html, carePatterns);
    if (careServices.length > 0) tier2.care_services = careServices;
    
    // TIER 3 - Nice to Have
    const images = extractImages(html, url);
    if (images.length > 0) tier3.images = images;
    
    // Extract activities
    const activityPatterns = [
      /<li[^>]*>([^<]*(?:activity|activities|event|class|group|club|social)[^<]*)<\/li>/gi,
    ];
    const activities = extractArray(html, activityPatterns);
    if (activities.length > 0) tier3.activities = activities;
    
    // Count fields found
    const fieldsFound = 
      Object.keys(tier1).length + 
      Object.keys(tier2).length + 
      Object.keys(tier3).length;
    
    console.log(`✅ Extracted ${fieldsFound} fields from ${villageName}`);
    console.log(`   Tier 1: ${Object.keys(tier1).length} fields`);
    console.log(`   Tier 2: ${Object.keys(tier2).length} fields`);
    console.log(`   Tier 3: ${Object.keys(tier3).length} fields`);
    
    return {
      success: true,
      data: {
        tier1,
        tier2,
        tier3,
        fieldsFound,
        totalFields: 12, // Max possible fields we're extracting
      },
    };
    
  } catch (error: any) {
    console.error(`❌ Scraping error for ${villageName}:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * POST /scraper/scrape-village
 * Scrape a single village website
 */
app.post('/make-server-3bba8be8/scraper/scrape-village', async (c) => {
  try {
    // Note: This endpoint does NOT require authentication to allow for easier testing
    // In production, you may want to add authentication here
    
    const { villageId, url, villageName } = await c.req.json();
    
    if (!villageId || !url || !villageName) {
      console.error('❌ Missing required fields:', { villageId, url, villageName });
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    console.log(`🚀 Starting scrape for ${villageName} (${url})`);
    const result = await scrapeVillageWebsite(url, villageName);
    
    if (!result.success) {
      console.error(`❌ Scrape failed for ${villageName}:`, result.error);
    }
    
    return c.json(result);
    
  } catch (error: any) {
    console.error('❌ Error in scrape-village endpoint:', error);
    console.error('Error stack:', error.stack);
    return c.json({ 
      success: false,
      error: error.message || 'Internal server error',
      details: error.stack 
    }, 500);
  }
});

/**
 * POST /scraper/scrape-url-only
 * Scrape a URL without requiring an existing village ID (for adding new villages)
 */
app.post('/make-server-3bba8be8/scraper/scrape-url-only', async (c) => {
  try {
    const { url } = await c.req.json();
    
    if (!url) {
      return c.json({ error: 'URL is required' }, 400);
    }
    
    console.log(`🔍 Scraping URL for new village: ${url}`);
    
    // Scrape the website (use a generic name since we don't know it yet)
    const result = await scrapeVillageWebsite(url, 'New Village');
    
    if (result.success && result.data) {
      console.log(`✅ Successfully scraped URL`);
      return c.json({
        success: true,
        data: {
          ...result.data.tier1,
          ...result.data.tier2,
          ...result.data.tier3,
          website: url,
        }
      });
    } else {
      console.error(`❌ Scraping failed:`, result.error);
      return c.json({
        success: false,
        error: result.error || 'Scraping failed'
      }, 400);
    }
  } catch (error: any) {
    console.error('Error in scrape-url-only:', error);
    return c.json({ 
      success: false,
      error: error.message || 'Internal server error',
    }, 500);
  }
});

/**
 * POST /scraper/save-results
 * Save scraped results to database
 */
app.post('/make-server-3bba8be8/scraper/save-results', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Verify authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { results } = await c.req.json();
    
    if (!results || !Array.isArray(results)) {
      return c.json({ error: 'Invalid results format' }, 400);
    }
    
    console.log(`💾 Saving ${results.length} scraped results to database...`);
    
    let updated = 0;
    let failed = 0;
    
    for (const result of results) {
      try {
        // Merge tier1, tier2, tier3 into a single update object
        const updateData: any = {
          ...result.tier1,
          ...result.tier2,
          ...result.tier3,
          updated_at: new Date().toISOString(),
        };
        
        // Remove empty values
        Object.keys(updateData).forEach(key => {
          if (updateData[key] === null || updateData[key] === undefined || updateData[key] === '') {
            delete updateData[key];
          }
        });
        
        const { error: updateError } = await supabase
          .from('retirement_villages')
          .update(updateData)
          .eq('id', result.villageId);
        
        if (updateError) {
          console.error(`Failed to update ${result.villageName}:`, updateError.message);
          failed++;
        } else {
          console.log(`✅ Updated ${result.villageName}`);
          updated++;
        }
        
      } catch (error: any) {
        console.error(`Error updating ${result.villageName}:`, error.message);
        failed++;
      }
    }
    
    console.log(`✅ Saved ${updated} villages, ${failed} failed`);
    
    return c.json({ 
      success: true, 
      updated, 
      failed,
      total: results.length 
    });
    
  } catch (error: any) {
    console.error('Error saving scraper results:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /scraper/update-village
 * Update a single village with provided data (using SERVICE_ROLE_KEY to bypass RLS)
 */
app.post('/make-server-3bba8be8/scraper/update-village', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Verify authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { villageId, updateData } = await c.req.json();
    
    if (!villageId || !updateData) {
      return c.json({ error: 'Missing villageId or updateData' }, 400);
    }
    
    console.log(`🔧 Updating village ${villageId} with SERVICE_ROLE_KEY:`, updateData);
    
    // Use SERVICE_ROLE_KEY to bypass RLS
    const { data, error: updateError } = await supabase
      .from('retirement_villages')
      .update(updateData)
      .eq('id', villageId)
      .select()
      .single();
    
    if (updateError) {
      console.error(`❌ Failed to update village:`, updateError);
      return c.json({ 
        success: false, 
        error: updateError.message,
        details: updateError 
      }, 400);
    }
    
    console.log(`✅ Successfully updated village ${villageId}`);
    
    return c.json({ 
      success: true,
      data 
    });
    
  } catch (error: any) {
    console.error('Error updating village:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /scraper/email-operators
 * Send emails to operators asking them to update their village profiles
 */
app.post('/make-server-3bba8be8/scraper/email-operators', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Verify authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { villageIds } = await c.req.json();
    
    if (!villageIds || !Array.isArray(villageIds)) {
      return c.json({ error: 'Invalid villageIds format' }, 400);
    }
    
    console.log(`📧 Sending emails to operators for ${villageIds.length} villages...`);
    
    let sent = 0;
    let skipped = 0;
    
    for (const villageId of villageIds) {
      try {
        // Fetch village details
        const { data: village, error: fetchError } = await supabase
          .from('retirement_villages')
          .select('*')
          .eq('id', villageId)
          .single();
        
        if (fetchError || !village) {
          console.error(`Failed to fetch village ${villageId}:`, fetchError?.message);
          skipped++;
          continue;
        }
        
        // Skip if no contact email
        if (!village.contact_email) {
          console.log(`Skipping ${village.name} - no contact email`);
          skipped++;
          continue;
        }
        
        // Send email to operator
        await sendEmail(operatorDataUpdateRequestEmail(village));
        console.log(`✅ Sent email to ${village.contact_email} for ${village.name}`);
        sent++;
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error: any) {
        console.error(`Error sending email for village ${villageId}:`, error.message);
        skipped++;
      }
    }
    
    console.log(`✅ Sent ${sent} emails, skipped ${skipped}`);
    
    return c.json({ 
      success: true, 
      sent, 
      skipped,
      total: villageIds.length 
    });
    
  } catch (error: any) {
    console.error('Error sending operator emails:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /scraper/find-websites
 * Search Google to find missing website URLs for villages
 */
app.post('/make-server-3bba8be8/scraper/find-websites', async (c) => {
  console.log('\n🔥🔥🔥 SCRAPER ENDPOINT HIT - NEW v1.31 CODE! 🔥🔥🔥\n');
  
  try {
    const { villages } = await c.req.json();
    
    if (!villages || !Array.isArray(villages)) {
      return c.json({ error: 'Invalid villages format' }, 400);
    }
    
    console.log(`🔍 Finding websites for ${villages.length} villages...`);
    
    const scraperApiKey = Deno.env.get('SCRAPERAPI_KEY');
    
    if (!scraperApiKey) {
      return c.json({ error: 'SCRAPERAPI_KEY not configured' }, 500);
    }
    
    // Load operator URL patterns
    const patterns = await kv.get('vic_operator_url_patterns') || [];
    console.log(`📋 Loaded ${patterns.length} operator URL patterns`);
    
    const results = [];
    
    for (const village of villages) {
      try {
        let foundWebsite = null;
        let websiteType: 'official' | 'aggregator' | 'pattern' | null = null;
        
        // ========================================
        // STEP 1: Try URL pattern construction (FASTEST & MOST RELIABLE)
        // ========================================
        if (village.operator && patterns.length > 0) {
          const operatorPattern = patterns.find((p: any) => 
            p.operator.toLowerCase() === village.operator.toLowerCase()
          );
          
          if (operatorPattern) {
            console.log(`🎯 Found URL pattern for operator: ${village.operator}`);
            
            // Construct URL from pattern
            const villageSlug = village.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '');
            
            const stateSlug = village.state ? village.state.toLowerCase() : 'vic';
            
            let constructedUrl = operatorPattern.pattern
              .replace('{state}', stateSlug)
              .replace('{village}', village.name)
              .replace('{villageSlug}', villageSlug);
            
            // Ensure full URL
            if (!constructedUrl.startsWith('http')) {
              constructedUrl = `${operatorPattern.baseUrl}${constructedUrl}`;
            }
            
            console.log(`   🔗 Constructed URL: ${constructedUrl}`);
            
            // Verify URL exists (HEAD request via ScraperAPI)
            try {
              const testUrl = `https://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(constructedUrl)}&method=HEAD`;
              const testResponse = await fetch(testUrl, {
                signal: AbortSignal.timeout(15000) // 15 second timeout for HEAD request
              });
              
              if (testResponse.ok || testResponse.status === 200) {
                foundWebsite = constructedUrl;
                websiteType = 'pattern';
                console.log(`   ✅ Pattern URL verified: ${constructedUrl}`);
                
                results.push({
                  villageId: village.id,
                  villageName: village.name,
                  suburb: village.suburb,
                  operator: village.operator,
                  status: 'found',
                  website: foundWebsite,
                  websiteType,
                  method: 'url_pattern'
                });
                continue; // Skip Google Search
              } else {
                console.log(`   ⚠️  Pattern URL returned ${testResponse.status}, trying Google Search...`);
              }
            } catch (error: any) {
              console.log(`   ⚠️  Pattern URL verification failed: ${error.message}, trying Google Search...`);
            }
          }
        }
        
        // ========================================
        // STEP 2: Fall back to Google Search
        // ========================================
        
        console.log(`\n🔥🔥🔥 THREE-PHASE DISCOVERY SEARCH! 🔥🔥🔥\n`);
        
        // ========================================
        // THREE-PHASE SEARCH STRATEGY:
        // Phase 1: Search village name only to discover CORRECT suburb/operator from snippets
        // Phase 2: Find operator domain using discovered data
        // Phase 3: Search for village page with corrected data
        // ========================================
        
        let detectedOperator: string | null = null;
        let operatorDomain: string | null = null;
        
        // ========================================
        // PHASE 1: Discover operator (ONLY if CSV has operator)
        // ========================================
        
        // Use CSV suburb (always correct) and CSV operator (if exists)
        const finalSuburb = village.suburb; // ✅ Always use database suburb (it's correct)
        let finalOperator = village.operator; // Start with CSV operator (may be null for independent villages)
        
        // If CSV has an operator, try to discover if it's more accurate
        if (village.operator) {
          console.log(`📍 PHASE 1: Validating operator (suburb: ${village.suburb})...`);
          
          const discoveryQuery = `"${village.name}" ${village.suburb} Victoria retirement village`;
          console.log(`   🔍 Discovery search: "${discoveryQuery}"`);
          
          const discoverySearchUrl = `https://api.scraperapi.com/structured/google/search?api_key=${scraperApiKey}&query=${encodeURIComponent(discoveryQuery)}&country=au&num=10`;
          
          try {
            const discoveryResponse = await fetch(discoverySearchUrl, {
              signal: AbortSignal.timeout(30000)
            });
            
            if (discoveryResponse.ok) {
              const discoveryData = await discoveryResponse.json();
              console.log(`   📄 Discovery search returned ${discoveryData.organic_results?.length || 0} results`);
              
              if (discoveryData.organic_results && Array.isArray(discoveryData.organic_results)) {
                for (const result of discoveryData.organic_results) {
                  const snippet = result.snippet || '';
                  const title = result.title || '';
                  const text = `${title} ${snippet}`;
                  
                  console.log(`   📝 Snippet: ${snippet.substring(0, 150)}...`);
                  
                  if (!detectedOperator) {
                    const operatorPatterns = [
                      /(?:by|operated by|part of|managed by)\s+([A-Z][A-Za-z\s&]+?)(?:\.|,|\s+is|\s+offers|\s+provides)/,
                      /(Aveo|Lendlease|Stockland|Anglicare|Uniting|RSL|Baptist Care|Mercy|Ryman|Baptcare|IRT|[A-Z][A-Za-z]+\s+(?:AgeWell|Living|Care|Group))/i,
                    ];
                    
                    for (const pattern of operatorPatterns) {
                      const opMatch = text.match(pattern);
                      if (opMatch) {
                        detectedOperator = opMatch[1].trim();
                        console.log(`   🏢 Detected operator: ${detectedOperator}`);
                        break;
                      }
                    }
                  }
                  
                  if (detectedOperator) break;
                }
              }
            }
          } catch (error: any) {
            console.log(`   ⚠️ Phase 1 discovery failed: ${error.message}`);
          }
          
          if (detectedOperator) {
            finalOperator = detectedOperator;
            console.log(`   ✅ Using discovered operator: ${finalOperator}`);
          } else {
            console.log(`   ✅ Using CSV operator: ${finalOperator}`);
          }
        } else {
          console.log(`📍 PHASE 1: Independent/NFP village (no operator in CSV) - suburb: ${finalSuburb}`);
          console.log(`   ⏭️  Skipping operator discovery`);
        }
        
        console.log(`   ✅ Final - Suburb: ${finalSuburb} (CSV ✓), Operator: ${finalOperator || 'NONE (independent)'}`);
        
        
        // ========================================
        // PHASE 2: Find operator domain (if operator exists)
        // ========================================
        if (finalOperator) {
          console.log(`📍 PHASE 2: Searching for operator domain...`);
          
          const operatorQuery = `"${finalOperator}" retirement villages official website Australia`;
          console.log(`   🔍 Operator search: "${operatorQuery}"`);
          
          const operatorSearchUrl = `https://api.scraperapi.com/structured/google/search?api_key=${scraperApiKey}&query=${encodeURIComponent(operatorQuery)}&country=au&num=5`;
          
          try {
            const operatorResponse = await fetch(operatorSearchUrl, {
              signal: AbortSignal.timeout(30000)
            });
            
            if (operatorResponse.ok) {
              const operatorData = await operatorResponse.json();
              console.log(`   📄 Operator search returned ${operatorData.organic_results?.length || 0} results`);
              
              if (operatorData.organic_results && Array.isArray(operatorData.organic_results)) {
                for (const result of operatorData.organic_results) {
                  if (result.link) {
                    const isAggregator = AGGREGATOR_SITES.some(agg => result.link.includes(agg));
                    
                    if (!isAggregator) {
                      try {
                        const urlObj = new URL(result.link);
                        operatorDomain = urlObj.hostname.replace('www.', '');
                        console.log(`   ✅ Found operator domain: ${operatorDomain}`);
                        break;
                      } catch (e) {
                        continue;
                      }
                    }
                  }
                }
              }
            }
          } catch (error: any) {
            console.log(`   ⚠️ Phase 2 operator search failed: ${error.message}`);
          }
        }
        
        // ========================================
        // PHASE 3: Search for village website (STAGE 1 - With Operator)
        // ========================================
        console.log(`📍 PHASE 3: Searching for village website...`);
        
        // Check if operator is trusted
        const operatorTrusted = isOperatorTrusted(village.operator);
        if (village.operator) {
          console.log(`   🏢 Operator: ${village.operator} ${operatorTrusted ? '✅ (TRUSTED - in whitelist)' : '⚠️ (not in whitelist)'}`);
        }
        
        // ⚡ START WITH SIMPLE NATURAL QUERY (mimics how humans search Google)
        // This often returns sponsored ads with the official website!
        // Format: "Village Name" suburb state
        
        let searchQuery: string;
        let searchStrategy: string;
        
        // 🎯 STRATEGY 1: Simple natural query (what a human would type)
        searchQuery = `${village.name} ${finalSuburb} retirement village`;
        searchStrategy = 'NATURAL_QUERY';
        console.log(`   🔍 STRATEGY: Natural search (like a human): "${searchQuery}"`);
        
        // Use ScraperAPI's Google Search API (returns structured JSON instead of HTML)
        // Documentation: https://www.scraperapi.com/documentation/google-search-results/
        const scraperUrl = `https://api.scraperapi.com/structured/google/search?api_key=${scraperApiKey}&query=${encodeURIComponent(searchQuery)}&country=au&num=10`;
        
        console.log(`   🌐 ScraperAPI Google Search API URL: ${scraperUrl.substring(0, 100)}...`);
        
        const response = await fetch(scraperUrl, {
          signal: AbortSignal.timeout(45000) // 45 second timeout
        });
        
        console.log(`   📡 Response status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
          const errorBody = await response.text();
          console.error(`❌ Google search failed for ${village.name}`);
          console.error(`   Status: ${response.status} ${response.statusText}`);
          console.error(`   Error body: ${errorBody.substring(0, 500)}`);
          results.push({
            villageId: village.id,
            villageName: village.name,
            status: 'error',
            error: `Search failed: ${response.status} - ${errorBody.substring(0, 200)}`,
          });
          continue;
        }
        
        // Parse JSON response instead of HTML
        const searchData = await response.json();
        
        console.log(`   📄 Received ${searchData.organic_results?.length || 0} organic results`);
        
        // 🐛 DEBUG: Log FULL ScraperAPI response to see what we're getting
        console.log(`   🔍 FULL ScraperAPI RESPONSE:`, JSON.stringify(searchData, null, 2).substring(0, 1500));
        
        // Extract URLs from ALL result types (organic + ads/sponsored)
        const allMatches = new Set<string>();
        
        // 1️⃣ PRIORITY: Check sponsored/ads results FIRST (often the official website!)
        if (searchData.ads && Array.isArray(searchData.ads)) {
          console.log(`   💰 Found ${searchData.ads.length} sponsored ads`);
          searchData.ads.forEach((ad: any) => {
            if (ad.link || ad.url) {
              const url = ad.link || ad.url;
              allMatches.add(url);
              console.log(`   💰 Sponsored ad: ${ad.title?.substring(0, 50)} - ${url}`);
            }
          });
        }
        
        // 2️⃣ Check organic results
        if (searchData.organic_results && Array.isArray(searchData.organic_results)) {
          searchData.organic_results.forEach((result: any) => {
            if (result.link) {
              allMatches.add(result.link);
              console.log(`   🔗 Organic result: ${result.title?.substring(0, 50)} - ${result.link}`);
            }
          });
        } else {
          console.log(`   ⚠️ WARNING: No organic_results found in response!`);
          console.log(`   🔍 Checking alternative fields...`);
          
          // Check if it's a different structure
          if (searchData.results) {
            console.log(`   🔍 Found 'results' field with ${searchData.results?.length} items`);
          }
          if (searchData.organic) {
            console.log(`   🔍 Found 'organic' field with ${searchData.organic?.length} items`);
          }
          if (searchData.error) {
            console.log(`   ❌ ScraperAPI returned error: ${searchData.error}`);
          }
        }
        
        console.log(`   📄 Found ${allMatches.size} URL matches from Google structured results`);
        
        // 🐛 DEBUG: Show ALL raw URLs BEFORE filtering
        if (allMatches.size > 0) {
          console.log(`   🔍 RAW URLs extracted from Google (before filtering):`);
          Array.from(allMatches).slice(0, 15).forEach((url, i) => {
            console.log(`      ${i + 1}. ${url}`);
          });
        }
        
        // Variables already declared at beginning of loop - reusing them here
        const allUrls = [];
        const aggregatorUrls = [];
        let skippedCount = { google: 0, badUrls: 0, aggregators: 0 };
        
        for (const url of allMatches) {
          
          // Skip Google's own URLs (ALL domains) and social media
          if (url.includes('google.') ||  // Catches google.com, google.co.in, google.com.au, etc.
              url.includes('gstatic.com') || // Google static content
              url.includes('facebook.com') || 
              url.includes('youtube.com') ||
              url.includes('twitter.com') ||
              url.includes('instagram.com') ||
              url.includes('linkedin.com') ||
              url.includes('/search?') ||  // Google search URLs
              url.includes('/url?q=') ||   // Google redirect URLs
              url.includes('accounts.google') ||
              url.includes('support.google')) {
            console.log(`   🚫 SKIPPED (Google/Social): ${url}`);
            skippedCount.google++;
            continue;
          }
          
          // ⚡ NEW: Skip PDFs, documents, and bad URLs
          const urlLower = url.toLowerCase();
          if (urlLower.includes('.pdf') ||
              urlLower.includes('.doc') ||
              urlLower.includes('.docx') ||
              urlLower.includes('.xls') ||
              urlLower.includes('.xlsx') ||
              urlLower.includes('.xml') ||  // Sitemap files
              urlLower.includes('#:~:text=') ||  // Fragment URLs
              urlLower.includes('property.com.au') ||
              urlLower.includes('realestate.com.au') ||
              urlLower.includes('domain.com.au') ||
              urlLower.includes('onthehouse.com.au') ||  // Property listing site
              urlLower.includes('heraldsun.com.au') ||  // News site
              urlLower.includes('awisemove.com.au') ||
              urlLower.includes('laterlifeadvice.com.au') ||
              urlLower.includes('jwire.com.au') ||
              urlLower.includes('cdnews.com.au') ||
              urlLower.includes('anytimefitness.com.au') ||
              urlLower.includes('img.seniorshousingonline.com.au') ||
              urlLower.includes('acg-staging.dps.com.au')) {
            console.log(`   🚫 SKIPPED (Bad URL type): ${url}`);
            skippedCount.badUrls++;
            continue;
          }
          
          // Check if it's an aggregator site
          const isAggregator = AGGREGATOR_SITES.some(aggregator => url.includes(aggregator));
          
          if (isAggregator) {
            const matchedAgg = AGGREGATOR_SITES.find(agg => url.includes(agg));
            aggregatorUrls.push(url);
            console.log(`   📂 SKIPPED (Aggregator - ${matchedAgg}): ${url}`);
            skippedCount.aggregators++;
            continue; // Don't add to allUrls yet - we'll use as fallback
          }
          
          // Clean the URL (remove UTM parameters, tracking codes, etc.)
          const cleanedUrl = cleanUrl(url);
          
          allUrls.push(cleanedUrl);
          console.log(`   ✅ ACCEPTED: ${cleanedUrl}`);
        }
        
        console.log(`   📊 Filtering summary: ${allUrls.length} accepted, ${skippedCount.google} Google/social, ${skippedCount.badUrls} bad URLs, ${skippedCount.aggregators} aggregators`);
        
        // SMART PRIORITIZATION: Find the best URL
        // Priority 1: URL containing operator name (prefer SHORTER URLs)
        // Priority 2: URL with retirement/village/care keywords (prefer SHORTER URLs)
        // Priority 3: Shortest URL
        
        if (village.operator && allUrls.length > 0) {
          // Try to find URL with operator name in domain (prefer shorter ones)
          const operatorSlug = village.operator.toLowerCase().replace(/[^a-z0-9]/g, '');
          const operatorMatches = [];
          
          for (const url of allUrls) {
            const domain = url.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (domain.includes(operatorSlug)) {
              operatorMatches.push(url);
            }
          }
          
          // If we found operator matches, pick the SHORTEST one
          if (operatorMatches.length > 0) {
            foundWebsite = operatorMatches.reduce((shortest, current) => 
              current.length < shortest.length ? current : shortest
            );
            websiteType = 'official';
            console.log(`   ✅ Selected OPERATOR DOMAIN (shortest): ${foundWebsite}`);
          }
        }
        
        // Priority 2: Look for retirement-specific domains (prefer shorter ones)
        if (!foundWebsite && allUrls.length > 0) {
          const retirementMatches = [];
          
          for (const url of allUrls) {
            if ((url.includes('living') || 
                 url.includes('care') ||
                 url.includes('retirement') ||
                 url.includes('village') ||
                 url.includes('aged'))) {
              retirementMatches.push(url);
            }
          }
          
          // If we found retirement matches, pick the SHORTEST one
          if (retirementMatches.length > 0) {
            foundWebsite = retirementMatches.reduce((shortest, current) => 
              current.length < shortest.length ? current : shortest
            );
            websiteType = 'official';
            console.log(`   ✅ Selected RETIREMENT DOMAIN (shortest): ${foundWebsite}`);
          }
        }
        
        // Priority 3: Pick the SHORTEST URL overall
        if (!foundWebsite && allUrls.length > 0) {
          foundWebsite = allUrls.reduce((shortest, current) => 
            current.length < shortest.length ? current : shortest
          );
          websiteType = 'official';
          console.log(`   ✅ Selected SHORTEST URL: ${foundWebsite}`);
        }
        
        // NO FALLBACK TO AGGREGATORS! If we only found aggregators, leave blank
        // Better to have no website than a misleading aggregator URL
        if (!foundWebsite) {
          console.log(`   ⚠️ Stage 1 complete: No official website found for ${village.name}`);
          console.log(`   📋 Aggregator URLs found (rejected): ${aggregatorUrls.length}`);
          aggregatorUrls.forEach((aggUrl, i) => {
            console.log(`      ${i + 1}. ${aggUrl}`);
          });
        }
        
        if (foundWebsite) {
          console.log(`✅ Found ${websiteType} website for ${village.name}: ${foundWebsite}`);
          
          // ========================================
          // CRITICAL: VALIDATE URL BEFORE SAVING
          // ========================================
          console.log(`🔍 VALIDATING URL before saving...`);
          
          // Check for operator mismatch (LOG WARNING ONLY - don't reject)
          const mismatchCheck = detectOperatorMismatch(foundWebsite, village.operator);
          if (mismatchCheck.isMismatch) {
            console.log(`⚠️ OPERATOR MISMATCH WARNING (not blocking):`);
            console.log(`   ${mismatchCheck.reason}`);
            console.log(`   URL: ${foundWebsite}`);
            console.log(`   Expected: ${village.operator}`);
            console.log(`   Found: ${mismatchCheck.foundOperator}`);
            console.log(`   ℹ️  Continuing with validation - operator used as hint only`);
          }
          
          // Perform deep validation (fetches page content)
          const validation = await validateVillageUrl(
            foundWebsite,
            village.name,
            village.operator,
            village.suburb,
            scraperApiKey!
          );
          
          if (validation.isValid) {
            console.log(`   ✅ URL VALIDATED (${validation.confidence}% confidence)`);
            validation.reasons.forEach(r => console.log(`      ${r}`));
            
            results.push({
              villageId: village.id,
              villageName: village.name,
              suburb: village.suburb,
              state: village.state,
              status: 'found',
              website: foundWebsite,
              websiteType: websiteType,
              confidence: validation.confidence,
              validationReasons: validation.reasons,
            });
          } else {
            console.error(`   ❌ URL REJECTED (${validation.confidence}% confidence - below 50% threshold)`);
            console.error(`      URL: ${foundWebsite}`);
            validation.warnings.forEach(w => console.error(`      ${w}`));
            
            results.push({
              villageId: village.id,
              villageName: village.name,
              suburb: village.suburb,
              state: village.state,
              status: 'validation_failed',
              error: `URL validation failed (${validation.confidence}% confidence)`,
              rejectedUrl: foundWebsite,
              validationWarnings: validation.warnings,
            });
          }
        } else {
          // ========================================
          // 🔄 STAGE 2: FALLBACK - Search without operator influence
          // ========================================
          console.log(`\n🔄 ======================================`);
          console.log(`🔄 STAGE 2: No website found in Stage 1`);
          console.log(`🔄 Retrying WITHOUT operator influence...`);
          console.log(`🔄 ======================================\n`);
          
          // Re-search with simplified query (no operator prioritization)
          const fallbackQuery = `"${village.name}" ${finalSuburb} VIC retirement village`;
          console.log(`   🔍 Fallback search: "${fallbackQuery}"`);
          
          const fallbackUrl = `https://api.scraperapi.com/structured/google/search?api_key=${scraperApiKey}&query=${encodeURIComponent(fallbackQuery)}&country=au&num=10`;
          
          try {
            const fallbackResponse = await fetch(fallbackUrl, {
              signal: AbortSignal.timeout(45000)
            });
            
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              console.log(`   📄 Fallback: ${fallbackData.organic_results?.length || 0} results`);
              
              const fallbackUrls: string[] = [];
              const fallbackAggregators: string[] = [];
              
              // Check ads first
              if (fallbackData.ads && Array.isArray(fallbackData.ads)) {
                fallbackData.ads.forEach((ad: any) => {
                  if (ad.link || ad.url) {
                    const url = ad.link || ad.url;
                    console.log(`   💰 Fallback ad: ${url}`);
                    
                    // Apply same filters
                    const urlLower = url.toLowerCase();
                    const isAggregator = AGGREGATOR_SITES.some(agg => url.includes(agg));
                    
                    if (isAggregator) {
                      fallbackAggregators.push(url);
                      console.log(`   📂 SKIPPED (Aggregator): ${url}`);
                    } else if (!urlLower.includes('google.') && !urlLower.includes('facebook.') && 
                              !urlLower.includes('youtube.') && !urlLower.includes('.pdf')) {
                      fallbackUrls.push(cleanUrl(url));
                      console.log(`   ✅ ACCEPTED: ${url}`);
                    }
                  }
                });
              }
              
              // Check organic results
              if (fallbackData.organic_results && Array.isArray(fallbackData.organic_results)) {
                fallbackData.organic_results.forEach((result: any) => {
                  if (result.link) {
                    const url = result.link;
                    const urlLower = url.toLowerCase();
                    const isAggregator = AGGREGATOR_SITES.some(agg => url.includes(agg));
                    
                    if (isAggregator) {
                      fallbackAggregators.push(url);
                      console.log(`   📂 SKIPPED (Aggregator): ${url}`);
                    } else if (!urlLower.includes('google.') && !urlLower.includes('facebook.') && 
                              !urlLower.includes('youtube.') && !urlLower.includes('.pdf')) {
                      fallbackUrls.push(cleanUrl(url));
                      console.log(`   ✅ ACCEPTED: ${url}`);
                    }
                  }
                });
              }
              
              // Pick shortest valid URL (no operator preference!)
              if (fallbackUrls.length > 0) {
                const fallbackWebsite = fallbackUrls.reduce((shortest, current) => 
                  current.length < shortest.length ? current : shortest
                );
                console.log(`   ✅ Stage 2 found: ${fallbackWebsite}`);
                
                // Validate this URL
                const fallbackValidation = await validateVillageUrl(
                  fallbackWebsite,
                  village.name,
                  null, // NO OPERATOR - pure validation
                  village.suburb,
                  scraperApiKey!
                );
                
                if (fallbackValidation.isValid) {
                  console.log(`   ✅ STAGE 2 SUCCESS - URL validated!`);
                  results.push({
                    villageId: village.id,
                    villageName: village.name,
                    suburb: village.suburb,
                    state: village.state,
                    status: 'found',
                    website: fallbackWebsite,
                    websiteType: 'official',
                    confidence: fallbackValidation.confidence,
                    validationReasons: fallbackValidation.reasons,
                    searchStage: 'stage2_no_operator'
                  });
                } else {
                  console.log(`   ❌ Stage 2 validation failed`);
                  results.push({
                    villageId: village.id,
                    villageName: village.name,
                    suburb: village.suburb,
                    state: village.state,
                    status: 'not_found',
                    error: 'Stage 2: Found URL but validation failed',
                  });
                }
              } else {
                console.log(`   ❌ Stage 2: No valid URLs found`);
                results.push({
                  villageId: village.id,
                  villageName: village.name,
                  suburb: village.suburb,
                  state: village.state,
                  status: 'not_found',
                  error: 'No website found after 2-stage search',
                });
              }
            } else {
              console.log(`   ❌ Stage 2 search failed: ${fallbackResponse.status}`);
              results.push({
                villageId: village.id,
                villageName: village.name,
                suburb: village.suburb,
                state: village.state,
                status: 'not_found',
                error: 'Stage 2 search failed',
              });
            }
          } catch (fallbackError: any) {
            console.log(`   ❌ Stage 2 error: ${fallbackError.message}`);
            results.push({
              villageId: village.id,
              villageName: village.name,
              suburb: village.suburb,
              state: village.state,
              status: 'not_found',
              error: `Stage 2 failed: ${fallbackError.message}`,
            });
          }
        }
        
        // Add delay between searches to respect rate limits (2 seconds)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error: any) {
        console.error(`❌ Error finding website for ${village.name}:`, error.message);
        console.error(`   Full error:`, error);
        console.error(`   Error stack:`, error.stack);
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
    const validationFailedCount = results.filter(r => r.status === 'validation_failed').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    console.log(`✅ Website search complete: ${foundCount} validated, ${validationFailedCount} validation failed, ${notFoundCount} not found, ${errorCount} errors`);
    
    return c.json({ 
      backendVersion: "1.48-two-stage-fixed",
      testMessage: "🎯 Stage 1: With operator | Stage 2: No operator (scope fixed)!",
      success: true, 
      results,
      summary: {
        total: villages.length,
        found: foundCount,
        validationFailed: validationFailedCount,
        notFound: notFoundCount,
        errors: errorCount,
      }
    });
    
  } catch (error: any) {
    console.error('Error in find-websites endpoint:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /scraper/save-websites
 * Save found website URLs to database
 */
app.post('/make-server-3bba8be8/scraper/save-websites', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Verify authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { results } = await c.req.json();
    
    if (!results || !Array.isArray(results)) {
      return c.json({ error: 'Invalid results format' }, 400);
    }
    
    console.log(`💾 Saving ${results.length} website URLs to database...`);
    console.log(`📋 Village IDs being updated:`, results.map(r => `${r.villageId} (${r.villageName})`));
    
    let updated = 0;
    let failed = 0;
    const updateDetails: any[] = [];
    
    for (const result of results) {
      try {
        console.log(`🔄 Updating village ${result.villageId} (${result.villageName}) with website: ${result.website}`);
        
        // CRITICAL: First check if village exists and get its current data
        const { data: existingVillage, error: fetchError } = await supabase
          .from('retirement_villages')
          .select('id, name, state, status, website')
          .eq('id', result.villageId)
          .single();
        
        if (fetchError || !existingVillage) {
          console.error(`❌ Village ${result.villageId} not found in database:`, fetchError?.message);
          failed++;
          updateDetails.push({
            villageId: result.villageId,
            villageName: result.villageName,
            status: 'failed',
            error: 'Village not found in database'
          });
          continue;
        }
        
        console.log(`📊 Existing village data:`, {
          id: existingVillage.id,
          name: existingVillage.name,
          state: existingVillage.state,
          status: existingVillage.status,
          currentWebsite: existingVillage.website
        });
        
        // Now update the website
        const { error: updateError, data: updatedData } = await supabase
          .from('retirement_villages')
          .update({ 
            website: result.website,
            updated_at: new Date().toISOString(),
          })
          .eq('id', result.villageId)
          .select();
        
        if (updateError) {
          console.error(`❌ Failed to update ${result.villageName}:`, updateError.message);
          failed++;
          updateDetails.push({
            villageId: result.villageId,
            villageName: result.villageName,
            status: 'failed',
            error: updateError.message
          });
        } else {
          console.log(`✅ Updated ${result.villageName} with website: ${result.website}`);
          console.log(`✅ Updated data returned:`, updatedData);
          updated++;
          updateDetails.push({
            villageId: result.villageId,
            villageName: result.villageName,
            website: result.website,
            status: 'success',
            previousWebsite: existingVillage.website
          });
        }
        
      } catch (error: any) {
        console.error(`❌ Error updating ${result.villageName}:`, error.message);
        failed++;
        updateDetails.push({
          villageId: result.villageId,
          villageName: result.villageName,
          status: 'failed',
          error: error.message
        });
      }
    }
    
    console.log(`✅ Saved ${updated} website URLs, ${failed} failed`);
    console.log(`📊 Update details:`, JSON.stringify(updateDetails, null, 2));
    
    return c.json({ 
      success: true, 
      updated, 
      failed,
      total: results.length,
      details: updateDetails
    });
    
  } catch (error: any) {
    console.error('Error saving website URLs:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /scraper/export-websites-csv
 * Export found websites as CSV for local backup
 */
app.get('/make-server-3bba8be8/scraper/export-websites-csv', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Verify authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Get query params
    const url = new URL(c.req.url);
    const state = url.searchParams.get('state') || 'VIC';
    const onlyWithWebsites = url.searchParams.get('onlyWithWebsites') === 'true';
    
    console.log(`📥 Exporting ${state} villages as CSV (onlyWithWebsites: ${onlyWithWebsites})...`);
    
    // Build query
    let query = supabase
      .from('retirement_villages')
      .select('id, name, state, suburb, postcode, operator, website, status')
      .eq('state', state)
      .order('name');
    
    if (onlyWithWebsites) {
      query = query.not('website', 'is', null);
    }
    
    const { data: villages, error } = await query;
    
    if (error) {
      throw new Error(`Failed to fetch villages: ${error.message}`);
    }
    
    // Generate CSV
    const headers = ['ID', 'Name', 'State', 'Suburb', 'Postcode', 'Operator', 'Website', 'Status'];
    const rows = villages?.map(v => [
      v.id,
      `"${v.name?.replace(/"/g, '""') || ''}"`, // Escape quotes
      v.state,
      `"${v.suburb?.replace(/"/g, '""') || ''}"`,
      v.postcode,
      `"${v.operator?.replace(/"/g, '""') || ''}"`,
      v.website || '',
      v.status
    ]) || [];
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    console.log(`✅ Generated CSV with ${villages?.length || 0} villages`);
    
    // Return as downloadable file
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="retirement-villages-${state}-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
    
  } catch (error: any) {
    console.error('Error exporting CSV:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /scraper/debug-vic-websites
 * Debug endpoint to check VIC villages website status
 */
app.get('/make-server-3bba8be8/scraper/debug-vic-websites', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    console.log('🔍 Checking VIC villages website status...');
    
    // Count total VIC villages
    const { count: totalCount, error: totalError } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'VIC');
    
    if (totalError) {
      throw new Error(`Failed to count total VIC villages: ${totalError.message}`);
    }
    
    // Count VIC villages with websites
    const { count: withWebsiteCount, error: withWebsiteError } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'VIC')
      .not('website', 'is', null)
      .neq('website', '');
    
    if (withWebsiteError) {
      throw new Error(`Failed to count VIC villages with websites: ${withWebsiteError.message}`);
    }
    
    // Count approved VIC villages
    const { count: approvedCount, error: approvedError } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'VIC')
      .eq('status', 'approved');
    
    if (approvedError) {
      throw new Error(`Failed to count approved VIC villages: ${approvedError.message}`);
    }
    
    // Count approved VIC villages with websites
    const { count: approvedWithWebsiteCount, error: approvedWithWebsiteError } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'VIC')
      .eq('status', 'approved')
      .not('website', 'is', null)
      .neq('website', '');
    
    if (approvedWithWebsiteError) {
      throw new Error(`Failed to count approved VIC villages with websites: ${approvedWithWebsiteError.message}`);
    }
    
    // Get sample villages with websites
    const { data: sampleWithWebsite, error: sampleWithError } = await supabase
      .from('retirement_villages')
      .select('id, name, suburb, state, operator, website')
      .eq('state', 'VIC')
      .eq('status', 'approved')
      .not('website', 'is', null)
      .neq('website', '')
      .limit(20);
    
    if (sampleWithError) {
      throw new Error(`Failed to fetch sample with websites: ${sampleWithError.message}`);
    }
    
    // Get sample villages WITHOUT websites (all of them, not just 20)
    const { data: sampleWithoutWebsite, error: sampleWithoutError } = await supabase
      .from('retirement_villages')
      .select('id, name, suburb, state, operator, website')
      .eq('state', 'VIC')
      .eq('status', 'approved')
      .or('website.is.null,website.eq.');
    
    if (sampleWithoutError) {
      throw new Error(`Failed to fetch sample without websites: ${sampleWithoutError.message}`);
    }
    
    console.log(`✅ VIC Stats: ${totalCount} total, ${withWebsiteCount} with websites, ${approvedCount} approved, ${approvedWithWebsiteCount} approved with websites`);
    
    return c.json({
      success: true,
      total: totalCount,
      withWebsite: withWebsiteCount,
      withoutWebsite: (totalCount || 0) - (withWebsiteCount || 0),
      approved: approvedCount,
      approvedWithWebsite: approvedWithWebsiteCount,
      approvedWithoutWebsite: (approvedCount || 0) - (approvedWithWebsiteCount || 0),
      sampleWithWebsite: sampleWithWebsite || [],
      sampleWithoutWebsite: sampleWithoutWebsite || [],
    });
    
  } catch (error: any) {
    console.error('Error in debug-vic-websites:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /scraper/delete-bad-website
 * Delete the bad aggregator website from a specific village
 */
app.post('/make-server-3bba8be8/scraper/delete-bad-website', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Verify authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { villageName, state } = await c.req.json();
    
    console.log(`🗑️ Deleting bad website from: ${villageName}, ${state}`);
    
    // Find the village
    const { data: village, error: findError } = await supabase
      .from('retirement_villages')
      .select('id, name, website')
      .eq('name', villageName)
      .eq('state', state)
      .single();
    
    if (findError || !village) {
      throw new Error(`Village not found: ${findError?.message}`);
    }
    
    const previousWebsite = village.website;
    
    // Clear the website
    const { error: updateError } = await supabase
      .from('retirement_villages')
      .update({ website: null })
      .eq('id', village.id);
    
    if (updateError) {
      throw new Error(`Failed to update: ${updateError.message}`);
    }
    
    console.log(`✅ Cleared website from ${villageName}: ${previousWebsite}`);
    
    return c.json({
      success: true,
      villageId: village.id,
      villageName: village.name,
      previousWebsite
    });
    
  } catch (error: any) {
    console.error('Error deleting bad website:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /scraper/test-url
 * Quick URL validation - just checks if URL returns 200 OK (no scraping)
 */
app.post('/make-server-3bba8be8/scraper/test-url', async (c) => {
  try {
    const { url } = await c.req.json();
    
    if (!url) {
      return c.json({ error: 'URL is required' }, 400);
    }
    
    console.log(`🧪 Testing URL: ${url}`);
    
    try {
      // Try direct fetch first (faster)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        method: 'HEAD', // HEAD is faster than GET
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log(`✅ URL is accessible: ${url} (${response.status})`);
        return c.json({ 
          success: true, 
          status: response.status,
          statusText: response.statusText,
          url,
        });
      } else {
        console.log(`❌ URL returned error: ${url} (${response.status})`);
        return c.json({ 
          success: false, 
          error: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          url,
        });
      }
    } catch (error) {
      console.error(`❌ URL test failed: ${url}`, error);
      return c.json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error',
        url,
      });
    }
    
  } catch (error: any) {
    console.error('Error in test-url endpoint:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Scrape Adventist Senior Living locations
app.post('/make-server-3bba8be8/scraper/scrape-adventist', async (c) => {
  try {
    const { url } = await c.req.json();

    if (!url) {
      return c.json({ error: 'URL is required' }, 400);
    }

    console.log(`[Adventist Scraper] Fetching: ${url}`);

    const scraperApiKey = Deno.env.get('SCRAPERAPI_KEY');
    if (!scraperApiKey) {
      console.error('[Adventist Scraper] SCRAPERAPI_KEY not found');
      return c.json({ error: 'ScraperAPI key not configured' }, 500);
    }

    let html = '';
    let fetchMethod = '';

    // Try ScraperAPI first
    try {
      console.log('[Adventist Scraper] Trying ScraperAPI...');
      const scraperUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(url)}`;
      const response = await fetch(scraperUrl);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Adventist Scraper] ScraperAPI failed: ${response.status} ${response.statusText}`);
        console.error(`[Adventist Scraper] ScraperAPI error details: ${errorText}`);
        throw new Error(`ScraperAPI returned ${response.status}: ${response.statusText}`);
      }

      html = await response.text();
      fetchMethod = 'ScraperAPI';
      console.log(`[Adventist Scraper] ✅ Fetched ${html.length} bytes via ScraperAPI`);
    } catch (scraperError) {
      console.error('[Adventist Scraper] ScraperAPI failed, trying direct fetch...', scraperError);
      
      // Fallback to direct fetch
      try {
        const directResponse = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });

        if (!directResponse.ok) {
          throw new Error(`Direct fetch failed: ${directResponse.status} ${directResponse.statusText}`);
        }

        html = await directResponse.text();
        fetchMethod = 'Direct Fetch';
        console.log(`[Adventist Scraper] ✅ Fetched ${html.length} bytes via direct fetch`);
      } catch (directError) {
        console.error('[Adventist Scraper] Both ScraperAPI and direct fetch failed:', directError);
        return c.json({ 
          error: 'Failed to fetch website',
          details: `ScraperAPI error: ${scraperError instanceof Error ? scraperError.message : 'Unknown error'}. Direct fetch error: ${directError instanceof Error ? directError.message : 'Unknown error'}`,
        }, 500);
      }
    }

    // Parse the HTML to extract village information
    const villages: Array<{
      name: string;
      suburb: string;
      state: string;
      postcode: string;
      website: string;
      address?: string;
      contact_phone?: string;
      contact_email?: string;
      operator: string;
      facility_type: string;
    }> = [];

    // Strategy: Look for location cards/blocks on the page
    // Common patterns:
    // - <div class="location"> or <article class="location">
    // - <h2> or <h3> for village names
    // - Links to individual village pages
    // - Address text with suburb, state, postcode

    // Extract all links that look like location pages
    const linkPattern = /<a[^>]*href=["']([^"']*\/locations\/[^"']*|[^"']*village[^"']*)["'][^>]*>(.*?)<\/a>/gi;
    const links: Array<{ url: string; text: string }> = [];
    let linkMatch;
    
    while ((linkMatch = linkPattern.exec(html)) !== null) {
      const href = linkMatch[1];
      const text = linkMatch[2].replace(/<[^>]*>/g, '').trim();
      
      if (text && text.length > 3 && !href.includes('#')) {
        // Make absolute URL
        let absoluteUrl = href;
        if (href.startsWith('/')) {
          const urlObj = new URL(url);
          absoluteUrl = `${urlObj.protocol}//${urlObj.host}${href}`;
        } else if (!href.startsWith('http')) {
          absoluteUrl = new URL(href, url).href;
        }
        
        links.push({ url: absoluteUrl, text });
      }
    }

    console.log(`[Adventist Scraper] Found ${links.length} potential location links`);

    // IMPROVED: Parse Adventist-specific HTML structure
    // The Adventist website uses cards/sections for each location
    // Let's try multiple parsing strategies
    
    // Strategy 1: Look for WordPress-style location cards (common pattern)
    const cardPattern = /<(?:div|article)[^>]*class=[\"'][^\"']*(?:card|location|facility|village|wp-block)[^\"']*[\"'][^>]*>([\s\S]*?)<\/(?:div|article)>/gi;
    let cardMatch;
    
    while ((cardMatch = cardPattern.exec(html)) !== null) {
      const block = cardMatch[1];
      
      // Extract name from heading
      const nameMatch = block.match(/<h[2-6][^>]*>(.*?)<\/h[2-6]>/i);
      if (!nameMatch) continue;
      
      const name = nameMatch[1].replace(/<[^>]*>/g, '').trim();
      if (!name || name.length < 3) continue;
      
      // Extract link to individual village page
      const linkMatch = block.match(/<a[^>]*href=[\"']([^\"']*)[\"']/i);
      let villageUrl = '';
      if (linkMatch) {
        const href = linkMatch[1];
        villageUrl = href.startsWith('http') ? href : 
                     href.startsWith('/') ? new URL(href, url).href : 
                     new URL(href, url).href;
      }
      
      // Extract address/suburb/state/postcode
      const addressMatch = block.match(/([A-Za-z\s]+),\s*(NSW|VIC|QLD|SA|WA|TAS|NT|ACT)[\s,]*(\d{4})?/i);
      const suburb = addressMatch ? addressMatch[1].trim() : name;
      const state = addressMatch ? addressMatch[2].toUpperCase() : 'NSW';
      const postcode = addressMatch ? (addressMatch[3] || '') : '';
      
      // Extract phone
      const phoneMatch = block.match(/(?:phone|tel|call|p:)[:\s]*([0-9\s\(\)\-]{8,})/i);
      const phone = phoneMatch ? phoneMatch[1].trim() : '';
      
      // Extract email
      const emailMatch = block.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      const email = emailMatch ? emailMatch[1] : '';
      
      villages.push({
        name,
        suburb,
        state,
        postcode,
        website: villageUrl,
        address: addressMatch ? addressMatch[0] : '',
        contact_phone: phone,
        contact_email: email,
        operator: 'Adventist Senior Living',
        facility_type: 'retirement_village',
      });
    }
    
    console.log(`[Adventist Scraper] Strategy 1 (cards): Found ${villages.length} villages`);

    // Strategy 2: Look for list items with location links
    if (villages.length === 0) {
      console.log('[Adventist Scraper] Trying Strategy 2: List items...');
      
      const listItemPattern = /<li[^>]*>([\s\S]*?)<\/li>/gi;
      let listMatch;
      
      while ((listMatch = listItemPattern.exec(html)) !== null) {
        const item = listMatch[1];
        
        // Must have a link
        const linkMatch = item.match(/<a[^>]*href=[\"']([^\"']*)[\"'][^>]*>(.*?)<\/a>/i);
        if (!linkMatch) continue;
        
        const href = linkMatch[1];
        const linkText = linkMatch[2].replace(/<[^>]*>/g, '').trim();
        
        // Skip navigation links, social media, etc.
        if (!linkText || linkText.length < 3 || 
            href.includes('facebook.com') || 
            href.includes('instagram.com') ||
            href.includes('linkedin.com') ||
            href.includes('#') ||
            linkText.toLowerCase().includes('read more') ||
            linkText.toLowerCase().includes('view all') ||
            linkText.toLowerCase().includes('contact')) {
          continue;
        }
        
        const villageUrl = href.startsWith('http') ? href : 
                          href.startsWith('/') ? new URL(href, url).href : 
                          new URL(href, url).href;
        
        // Extract address if present
        const addressMatch = item.match(/([A-Za-z\s]+),\s*(NSW|VIC|QLD|SA|WA|TAS|NT|ACT)[\s,]*(\d{4})?/i);
        const name = linkText;
        const suburb = addressMatch ? addressMatch[1].trim() : linkText;
        const state = addressMatch ? addressMatch[2].toUpperCase() : 'NSW';
        const postcode = addressMatch ? (addressMatch[3] || '') : '';
        
        villages.push({
          name,
          suburb,
          state,
          postcode,
          website: villageUrl,
          address: addressMatch ? addressMatch[0] : '',
          operator: 'Adventist Senior Living',
          facility_type: 'retirement_village',
        });
      }
      
      console.log(`[Adventist Scraper] Strategy 2 (lists): Found ${villages.length} villages`);
    }

    // Strategy 3: Parse all location-related links as fallback
    if (villages.length === 0 && links.length > 0) {
      console.log('[Adventist Scraper] Trying Strategy 3: All location links...');
      
      for (const link of links) {
        // Skip if it's the main locations page
        if (link.url === url || link.url + '/' === url) continue;
        
        // Skip if text is too generic
        if (link.text.toLowerCase().includes('location') ||
            link.text.toLowerCase().includes('read more') ||
            link.text.toLowerCase().includes('view all') ||
            link.text.toLowerCase() === 'home') {
          continue;
        }
        
        const suburbMatch = link.text.match(/([A-Za-z\s]+)(?:,\s*(NSW|VIC|QLD|SA|WA|TAS|NT|ACT))?/);
        const name = link.text;
        const suburb = suburbMatch ? suburbMatch[1].trim() : link.text;
        const state = suburbMatch && suburbMatch[2] ? suburbMatch[2].toUpperCase() : 'NSW';
        
        villages.push({
          name,
          suburb,
          state,
          postcode: '',
          website: link.url,
          operator: 'Adventist Senior Living',
          facility_type: 'retirement_village',
        });
      }
      
      console.log(`[Adventist Scraper] Strategy 3 (links): Found ${villages.length} villages`);
    }

    // Strategy 4: ULTRA-AGGRESSIVE - Extract ALL text content and look for patterns
    if (villages.length <= 1) {
      console.log('[Adventist Scraper] Trying Strategy 4: Ultra-aggressive text extraction...');
      
      // Extract ALL heading elements
      const allHeadingsPattern = /<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi;
      const headings: string[] = [];
      let headingMatch;
      
      while ((headingMatch = allHeadingsPattern.exec(html)) !== null) {
        const heading = headingMatch[1].replace(/<[^>]*>/g, '').trim();
        if (heading && heading.length > 3 && heading.length < 100) {
          headings.push(heading);
        }
      }
      
      console.log(`[Adventist Scraper] Found ${headings.length} headings total`);
      console.log(`[Adventist Scraper] First 10 headings:`, headings.slice(0, 10));
      
      // Look for headings that sound like village names
      for (const heading of headings) {
        // Skip common non-village headings
        if (heading.toLowerCase().includes('location') && heading.length < 20) continue;
        if (heading.toLowerCase().includes('about')) continue;
        if (heading.toLowerCase().includes('contact')) continue;
        if (heading.toLowerCase().includes('home')) continue;
        if (heading.toLowerCase().includes('service')) continue;
        if (heading.toLowerCase().includes('news')) continue;
        
        // Check if heading mentions a state (likely a village location)
        const stateMatch = heading.match(/\b(NSW|VIC|QLD|SA|WA|TAS|NT|ACT)\b/i);
        
        if (stateMatch || heading.toLowerCase().includes('village') || heading.toLowerCase().includes('senior') || heading.toLowerCase().includes('care') || heading.toLowerCase().includes('retirement')) {
          const state = stateMatch ? stateMatch[1].toUpperCase() : 'NSW';
          
          villages.push({
            name: heading,
            suburb: heading,
            state,
            postcode: '',
            website: url,
            operator: 'Adventist Senior Living',
            facility_type: 'retirement_village',
          });
        }
      }
      
      console.log(`[Adventist Scraper] Strategy 4 (headings): Found ${villages.length} total villages`);
    }
    
    // Remove duplicates based on name
    const uniqueVillages = villages.filter((v, index, self) =>
      index === self.findIndex((t) => t.name.toLowerCase() === v.name.toLowerCase())
    );
    
    console.log(`[Adventist Scraper] Final count: ${uniqueVillages.length} unique villages`);

    return c.json({
      success: true,
      count: uniqueVillages.length,
      villages: uniqueVillages,
    });

  } catch (error) {
    console.error('[Adventist Scraper] Error:', error);
    return c.json({ 
      error: 'Failed to scrape Adventist locations', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// 🐛 DEBUG ENDPOINT: Test ScraperAPI Google Search directly
app.post('/make-server-3bba8be8/scraper/debug-scraperapi', async (c) => {
  try {
    const scraperApiKey = Deno.env.get('SCRAPERAPI_KEY');
    
    if (!scraperApiKey) {
      return c.json({ error: 'SCRAPERAPI_KEY not configured' }, 500);
    }
    
    // Test with Admillan
    const searchQuery = `"Admillan Retirement Living" Ferntree Gully Victoria Uniting AgeWell retirement village Australia site:.com.au`;
    const scraperUrl = `https://api.scraperapi.com/structured/google/search?api_key=${scraperApiKey}&query=${encodeURIComponent(searchQuery)}&country=au&num=10`;
    
    console.log('🐛 DEBUG: Testing ScraperAPI...');
    console.log('🐛 Search Query:', searchQuery);
    console.log('🐛 ScraperAPI URL (first 150 chars):', scraperUrl.substring(0, 150) + '...');
    
    const response = await fetch(scraperUrl, {
      signal: AbortSignal.timeout(45000)
    });
    
    console.log('🐛 Response Status:', response.status, response.statusText);
    console.log('🐛 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('🐛 ERROR Response Body:', errorText);
      return c.json({
        error: 'ScraperAPI request failed',
        status: response.status,
        statusText: response.statusText,
        body: errorText
      }, response.status);
    }
    
    const data = await response.json();
    
    console.log('🐛 Response Type:', typeof data);
    console.log('🐛 Response Keys:', Object.keys(data));
    console.log('🐛 FULL RESPONSE:');
    console.log(JSON.stringify(data, null, 2));
    
    // Return the full response to the browser
    return c.json({
      success: true,
      searchQuery,
      responseStatus: response.status,
      responseData: data,
      organicResultsCount: data.organic_results?.length || 0,
      hasOrganicResults: !!data.organic_results,
      responseKeys: Object.keys(data)
    });
    
  } catch (error: any) {
    console.error('🐛 DEBUG ERROR:', error);
    console.error('🐛 Error Stack:', error.stack);
    return c.json({ 
      error: error.message,
      stack: error.stack,
      type: error.constructor.name
    }, 500);
  }
});

/**
 * POST /scraper/find-url-google
 * Find retirement village URL using ScraperAPI + DuckDuckGo HTML scraping
 * Based on Copilot workflow - cheaper and no quota limits!
 */
app.post('/make-server-3bba8be8/scraper/find-url-google', async (c) => {
  try {
    const { villageName } = await c.req.json();
    
    if (!villageName) {
      return c.json({ error: 'villageName is required' }, 400);
    }
    
    console.log(`🦆 Finding URL for: ${villageName} (DuckDuckGo)`);
    
    const scraperApiKey = Deno.env.get('SCRAPERAPI_KEY');
    
    if (!scraperApiKey) {
      return c.json({ error: 'SCRAPERAPI_KEY not configured' }, 500);
    }
    
    // Blacklisted domains to exclude
    const BLACKLIST = [
      'domain.com.au',
      'realestate.com.au',
      'realestateview.com.au',
      'aged.com.au',
      'retirementliving.org.au',
      'facebook.com',
      'linkedin.com',
      'google.com',
      'google.com.au',
      'duckduckgo.com'
    ];
    
    // Use ScraperAPI to fetch DuckDuckGo HTML (FREE - no quota limits!)
    const searchQuery = encodeURIComponent(`${villageName} retirement village Victoria`);
    const duckDuckGoUrl = `https://duckduckgo.com/html/?q=${searchQuery}`;
    const scraperUrl = `https://api.scraperapi.com/?api_key=${scraperApiKey}&url=${encodeURIComponent(duckDuckGoUrl)}`;
    
    console.log(`   🔍 Search query: "${villageName} retirement village Victoria"`);
    console.log(`   🦆 DuckDuckGo URL: ${duckDuckGoUrl}`);
    
    const response = await fetch(scraperUrl, {
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ ScraperAPI error:`, errorText);
      return c.json({ error: 'ScraperAPI request failed', details: errorText }, 500);
    }
    
    const html = await response.text();
    console.log(`   📄 Received HTML (${html.length} chars)`);
    
    // Extract URLs from DuckDuckGo HTML using regex
    // DuckDuckGo result links are in: <a class="result__a" href="/l/?uddg=...&rut=...">
    // But the actual URL is in the uddg parameter, encoded
    const urlMatches = html.matchAll(/class="result__a"[^>]*href="([^"]+)"/g);
    const extractedUrls: string[] = [];
    
    for (const match of urlMatches) {
      const hrefValue = match[1];
      
      // DuckDuckGo wraps URLs in tracking redirects like /l/?uddg=ENCODED_URL
      // Try to extract the uddg parameter
      if (hrefValue.includes('uddg=')) {
        try {
          const uddgMatch = hrefValue.match(/uddg=([^&]+)/);
          if (uddgMatch) {
            const decodedUrl = decodeURIComponent(uddgMatch[1]);
            extractedUrls.push(decodedUrl);
            console.log(`   🔗 Extracted URL: ${decodedUrl}`);
          }
        } catch (e) {
          console.log(`   ⚠️ Failed to decode URL from: ${hrefValue}`);
        }
      }
    }
    
    console.log(`   📊 Found ${extractedUrls.length} URLs`);
    
    let foundUrl = null;
    
    // Filter and prioritize URLs
    for (const url of extractedUrls) {
      const urlLower = url.toLowerCase();
      
      // Skip blacklisted domains
      const isBlacklisted = BLACKLIST.some(domain => urlLower.includes(domain));
      if (isBlacklisted) {
        console.log(`   ⏭️  Skipping blacklisted: ${url}`);
        continue;
      }
      
      // Skip invalid URLs
      if (!urlLower.startsWith('http')) {
        console.log(`   ⏭️  Skipping invalid URL: ${url}`);
        continue;
      }
      
      // Prefer URLs that look official
      const villageNameSlug = villageName.toLowerCase().replace(/\s+/g, '');
      const seemsOfficial = 
        urlLower.includes(villageNameSlug) ||
        urlLower.includes('retirement') ||
        urlLower.includes('village') ||
        urlLower.includes('living');
      
      if (seemsOfficial || !foundUrl) {
        foundUrl = url;
        console.log(`   ${seemsOfficial ? '✅' : '⚠️'} Selected URL: ${foundUrl}`);
        
        if (seemsOfficial) {
          break; // Found a good match, stop searching
        }
      }
    }
    
    // Save to database if URL found
    if (foundUrl) {
      try {
        const { error: updateError } = await supabase
          .from('villages')
          .update({ website: foundUrl })
          .eq('name', villageName)
          .eq('state', 'VIC');
        
        if (updateError) {
          console.error(`❌ Database update error:`, updateError);
        } else {
          console.log(`   ✅ Saved to database: ${foundUrl}`);
        }
      } catch (dbError) {
        console.error(`❌ Database exception:`, dbError);
      }
    } else {
      console.log(`   ❌ No suitable URL found for ${villageName}`);
    }
    
    return c.json({ 
      villageName,
      url: foundUrl,
      resultsFound: extractedUrls.length
    });
    
  } catch (error: any) {
    console.error('Error finding URL:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /scraper/export-scraped-urls
 * Export URLs from database for specific villages
 */
app.post('/make-server-3bba8be8/scraper/export-scraped-urls', async (c) => {
  try {
    const { villageNames } = await c.req.json();
    
    if (!villageNames || !Array.isArray(villageNames)) {
      return c.json({ error: 'villageNames array is required' }, 400);
    }
    
    console.log(`📊 Exporting ${villageNames.length} villages from database...`);
    
    // Batch the query to avoid .in() size limits (max ~100 items)
    const BATCH_SIZE = 100;
    let allVillages: any[] = [];
    
    for (let i = 0; i < villageNames.length; i += BATCH_SIZE) {
      const batch = villageNames.slice(i, i + BATCH_SIZE);
      
      const { data: batchVillages, error } = await supabase
        .from('villages')
        .select('name, website')
        .eq('state', 'VIC')
        .in('name', batch);
      
      if (error) {
        console.error(`❌ Database error (batch ${i}-${i+BATCH_SIZE}):`, error);
        return c.json({ error: 'Database query failed', details: error }, 500);
      }
      
      if (batchVillages) {
        allVillages = allVillages.concat(batchVillages);
      }
    }
    
    // Sort by name
    allVillages.sort((a, b) => a.name.localeCompare(b.name));
    
    const withUrls = allVillages.filter(v => v.website).length;
    const withoutUrls = allVillages.length - withUrls;
    
    console.log(`✅ Found ${allVillages.length} villages (${withUrls} with URLs, ${withoutUrls} without)`);
    
    return c.json({
      villages: allVillages,
      withUrls,
      withoutUrls,
      total: allVillages.length
    });
    
  } catch (error: any) {
    console.error('Export error:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default app;