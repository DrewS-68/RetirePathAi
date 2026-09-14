import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-3bba8be8/health", (c) => {
  return c.json({ status: "ok" });
});

// Delete all VIC villages endpoint - batch approach to bypass RLS issues
app.post("/make-server-3bba8be8/delete-all-vic", async (c) => {
  try {
    console.log('🗑️ Starting deletion of all VIC villages...');

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseKey,
      {
        db: { schema: 'public' },
        auth: { persistSession: false }
      }
    );

    // Get all VIC village IDs
    const { data: villages, error: fetchError } = await supabase
      .from('retirement_villages')
      .select('id')
      .eq('state', 'VIC');

    if (fetchError) {
      throw new Error(`Fetch failed: ${fetchError.message}`);
    }

    const totalCount = villages?.length || 0;
    console.log(`📊 Found ${totalCount} VIC villages to delete`);

    if (totalCount === 0) {
      return c.json({
        success: true,
        count: 0,
        message: 'No VIC villages found'
      });
    }

    // Delete in batches of 50
    let deletedCount = 0;
    const batchSize = 50;
    const errors: string[] = [];

    for (let i = 0; i < villages.length; i += batchSize) {
      const batch = villages.slice(i, i + batchSize);
      const ids = batch.map(v => v.id);

      const { error: deleteError } = await supabase
        .from('retirement_villages')
        .delete()
        .in('id', ids);

      if (deleteError) {
        console.error(`Batch ${i}-${i + batchSize} error:`, deleteError.message);
        errors.push(`Batch ${i}-${i + batchSize}: ${deleteError.message}`);
      } else {
        deletedCount += batch.length;
        console.log(`✅ Deleted batch ${i}-${i + batchSize}: ${deletedCount}/${totalCount}`);
      }

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`✅ Deletion complete: ${deletedCount}/${totalCount}`);

    return c.json({
      success: true,
      count: deletedCount,
      total: totalCount,
      errors: errors,
      message: `Deleted ${deletedCount} of ${totalCount} VIC villages`
    });

  } catch (error) {
    console.error('❌ Delete error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Upload operator URLs endpoint
app.post("/make-server-3bba8be8/upload-operator-urls", async (c) => {
  try {
    const { rows } = await c.req.json();

    console.log(`📊 Uploading ${rows.length} operator URLs`);

    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    // Fetch all VIC villages
    const villagesResponse = await fetch(
      `${supabaseUrl}/rest/v1/retirement_villages?state=eq.VIC&status=eq.approved&select=id,name,operator,website`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    );

    if (!villagesResponse.ok) {
      throw new Error(`Failed to fetch villages: ${villagesResponse.status}`);
    }

    const villages = await villagesResponse.json();
    console.log(`📊 Loaded ${villages.length} VIC villages from database`);

    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];
    const details: Array<{ operator: string; count: number; url: string }> = [];

    // Group rows by operator
    const operatorUrlMap = new Map<string, string>();
    for (const row of rows) {
      operatorUrlMap.set(row.operator.toLowerCase().trim(), row.finalUrl);
    }

    console.log(`📊 Found ${operatorUrlMap.size} unique operators with URLs`);

    // Match villages to operators and update
    for (const [operatorKey, url] of operatorUrlMap.entries()) {
      // Find all villages with this operator
      const matchingVillages = villages.filter((v: any) => {
        if (!v.operator) return false;
        const villageOperator = v.operator.toLowerCase().trim();
        return villageOperator === operatorKey ||
               villageOperator.includes(operatorKey) ||
               operatorKey.includes(villageOperator);
      });

      if (matchingVillages.length === 0) {
        console.log(`⚠️ No villages found for operator: ${operatorKey}`);
        skipped++;
        continue;
      }

      console.log(`🎯 Found ${matchingVillages.length} villages for operator: ${operatorKey}`);
      details.push({
        operator: operatorKey,
        count: matchingVillages.length,
        url: url
      });

      // Update all matching villages
      for (const village of matchingVillages) {
        try {
          const updateResponse = await fetch(
            `${supabaseUrl}/rest/v1/retirement_villages?id=eq.${village.id}`,
            {
              method: 'PATCH',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({
                website: url,
                updated_at: new Date().toISOString()
              })
            }
          );

          if (updateResponse.ok) {
            updated++;
            console.log(`✅ Updated: ${village.name} → ${url}`);
          } else {
            const errorText = await updateResponse.text();
            errors.push(`Failed to update ${village.name}: HTTP ${updateResponse.status} - ${errorText}`);
            console.error(`❌ Failed: ${village.name}`);
          }
        } catch (error) {
          errors.push(`Error updating ${village.name}: ${error}`);
          console.error(`❌ Error: ${village.name}`, error);
        }
      }

      // Small delay between operators to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    return c.json({
      success: true,
      updated,
      skipped,
      errors,
      details: details.sort((a, b) => b.count - a.count)
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    return c.json({
      success: false,
      error: error.message || 'Unknown error'
    }, 500);
  }
});

// Scrape village data endpoint
app.post("/make-server-3bba8be8/scrape-village", async (c) => {
  try {
    const { villageId, villageName, website, operator } = await c.req.json();

    console.log(`🔍 Scraping village: ${villageName} (${website})`);

    if (!website || !website.startsWith('http')) {
      return c.json({ success: false, error: 'Invalid website URL' });
    }

    const scraperApiKey = Deno.env.get('SCRAPERAPI_KEY');
    if (!scraperApiKey) {
      console.error('❌ SCRAPERAPI_KEY not found in environment');
      return c.json({ success: false, error: 'ScraperAPI key not configured' });
    }

    // Call ScraperAPI to fetch the page
    const scraperUrl = `https://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(website)}&render=true`;

    console.log(`📡 Fetching page via ScraperAPI...`);
    const response = await fetch(scraperUrl);

    if (!response.ok) {
      throw new Error(`ScraperAPI returned ${response.status}`);
    }

    const html = await response.text();
    console.log(`✅ Received HTML (${html.length} chars)`);

    // Parse the HTML to extract data
    const scrapedData = extractVillageData(html, villageName, operator);

    console.log(`✅ Extracted data:`, {
      amenities: scrapedData.amenities?.length || 0,
      services: scrapedData.care_services?.length || 0,
      hasDescription: !!scrapedData.description
    });

    return c.json({
      success: true,
      data: scrapedData
    });

  } catch (error) {
    console.error('❌ Scraping error:', error);
    return c.json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

// Extract village data from HTML
function extractVillageData(html: string, villageName: string, operator: string | null): any {
  const data: any = {
    amenities: [],
    care_services: [],
    activities: [],
    description: null,
    contact_phone: null,
    contact_email: null,
    entry_price_min: null,
    entry_price_max: null,
    monthly_fees_min: null,
    monthly_fees_max: null,
    images: [],
    bedrooms: [],
    total_units: null,
    pet_friendly: false
  };

  const lowerHtml = html.toLowerCase();

  // Extract amenities (common facilities)
  const amenityKeywords = [
    'swimming pool', 'pool', 'gymnasium', 'gym', 'fitness centre', 'fitness center',
    'library', 'cinema', 'theatre', 'theater', 'bowling green', 'bowls',
    'craft room', 'workshop', 'salon', 'hairdresser', 'barber',
    'restaurant', 'dining room', 'cafe', 'coffee shop', 'bar', 'lounge',
    'garden', 'courtyard', 'outdoor area', 'bbq', 'barbecue',
    'tennis court', 'putting green', 'billiards', 'snooker',
    'community hall', 'function room', 'common room', 'meeting room',
    'computer room', 'business centre', 'business center',
    'parking', 'car park', 'garage', 'undercover parking'
  ];

  for (const keyword of amenityKeywords) {
    if (lowerHtml.includes(keyword)) {
      // Capitalize first letter of each word
      const formatted = keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      if (!data.amenities.includes(formatted)) {
        data.amenities.push(formatted);
      }
    }
  }

  // Extract care services
  const serviceKeywords = [
    'emergency call', 'emergency button', 'emergency response',
    'on-site nurse', 'nursing care', 'medical care', 'healthcare',
    'dementia care', 'memory care', 'alzheimer',
    'physiotherapy', 'physio', 'occupational therapy',
    'podiatry', 'chiropody', 'foot care',
    'doctor visits', 'gp visits', 'medical visits',
    'medication management', 'medication assistance',
    'personal care', 'assistance with daily living',
    'respite care', 'short stay', 'trial stay',
    'home care', 'domestic assistance', 'cleaning service',
    'meal delivery', 'meals on wheels', 'catering'
  ];

  for (const keyword of serviceKeywords) {
    if (lowerHtml.includes(keyword)) {
      const formatted = keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      if (!data.care_services.includes(formatted)) {
        data.care_services.push(formatted);
      }
    }
  }

  // Extract activities
  const activityKeywords = [
    'art class', 'arts and crafts', 'painting', 'drawing',
    'yoga', 'tai chi', 'pilates', 'exercise class',
    'dancing', 'dance class', 'zumba',
    'bingo', 'card games', 'board games', 'trivia',
    'cooking class', 'cooking demonstrations',
    'music', 'concerts', 'entertainment',
    'bus trips', 'excursions', 'outings', 'day trips',
    'gardening', 'garden club',
    'book club', 'reading group',
    'movie nights', 'film screenings'
  ];

  for (const keyword of activityKeywords) {
    if (lowerHtml.includes(keyword)) {
      const formatted = keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      if (!data.activities.includes(formatted)) {
        data.activities.push(formatted);
      }
    }
  }

  // Check for pet friendly
  if (lowerHtml.includes('pet friendly') || lowerHtml.includes('pets welcome') || lowerHtml.includes('pets allowed')) {
    data.pet_friendly = true;
  }

  // Extract phone number (Australian format)
  const phoneRegex = /(?:phone|tel|call|contact|p:|t:)[\s:]*(?:\+61|0)?[\s\-]?[1-9][\s\-]?\d{4}[\s\-]?\d{4}/gi;
  const phoneMatches = html.match(phoneRegex);
  if (phoneMatches && phoneMatches.length > 0) {
    // Clean up the phone number
    const phone = phoneMatches[0].replace(/.*?(\d[\s\-\d]+)/, '$1').replace(/\s+/g, ' ').trim();
    data.contact_phone = phone;
  }

  // Extract email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emailMatches = html.match(emailRegex);
  if (emailMatches && emailMatches.length > 0) {
    // Filter out common non-contact emails
    const validEmails = emailMatches.filter(email =>
      !email.includes('example.com') &&
      !email.includes('domain.com') &&
      !email.includes('sentry') &&
      !email.includes('google')
    );
    if (validEmails.length > 0) {
      data.contact_email = validEmails[0];
    }
  }

  // Extract bedroom options
  const bedroomRegex = /(\d)\s*(?:bed(?:room)?|br)/gi;
  const bedroomMatches = html.match(bedroomRegex);
  if (bedroomMatches) {
    const bedrooms = new Set<string>();
    for (const match of bedroomMatches) {
      const num = match.match(/\d/)?.[0];
      if (num && parseInt(num) <= 4) {
        bedrooms.add(num);
      }
    }
    data.bedrooms = Array.from(bedrooms).sort();
  }

  // Extract description (first paragraph that mentions the village or operator)
  const paragraphRegex = /<p[^>]*>(.*?)<\/p>/gi;
  const paragraphs = Array.from(html.matchAll(paragraphRegex));

  for (const match of paragraphs) {
    const text = match[1].replace(/<[^>]+>/g, '').trim();
    if (text.length > 100 && text.length < 1000) {
      const lowerText = text.toLowerCase();
      if (
        lowerText.includes(villageName.toLowerCase()) ||
        lowerText.includes('retirement') ||
        lowerText.includes('village') ||
        (operator && lowerText.includes(operator.toLowerCase()))
      ) {
        data.description = text;
        break;
      }
    }
  }

  // If no description found, try meta description
  if (!data.description) {
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (metaDescMatch) {
      data.description = metaDescMatch[1];
    }
  }

  return data;
}

// Comprehensive scraper endpoint - handles HTML, PDFs, and all formats
app.post("/make-server-3bba8be8/scrape-village-comprehensive", async (c) => {
  try {
    const { villageId, villageName, website, operator } = await c.req.json();

    console.log(`🔍 Comprehensive scrape: ${villageName} (${website})`);

    if (!website || !website.startsWith('http')) {
      return c.json({ success: false, error: 'Invalid website URL' });
    }

    const scraperApiKey = Deno.env.get('SCRAPERAPI_KEY');
    if (!scraperApiKey) {
      return c.json({ success: false, error: 'ScraperAPI key not configured' });
    }

    // Fetch main page
    const scraperUrl = `https://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(website)}&render=true`;
    const response = await fetch(scraperUrl);

    if (!response.ok) {
      throw new Error(`ScraperAPI returned ${response.status}`);
    }

    const html = await response.text();
    console.log(`✅ Fetched HTML (${html.length} chars)`);

    // Extract data from HTML
    const data = extractComprehensiveData(html, villageName, operator);

    // Find PDF links on the page
    const pdfLinks = findPDFLinks(html, website);
    console.log(`📄 Found ${pdfLinks.length} PDF links`);

    // Try to extract data from PDFs (limit to first 2 to save API credits)
    for (const pdfUrl of pdfLinks.slice(0, 2)) {
      try {
        console.log(`📄 Fetching PDF: ${pdfUrl}`);
        const pdfScraperUrl = `https://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(pdfUrl)}`;
        const pdfResponse = await fetch(pdfScraperUrl);

        if (pdfResponse.ok) {
          const pdfText = await pdfResponse.text();
          console.log(`✅ Extracted PDF text (${pdfText.length} chars)`);

          // Merge PDF data with HTML data
          const pdfData = extractComprehensiveData(pdfText, villageName, operator);
          data.amenities = [...new Set([...data.amenities, ...pdfData.amenities])];
          data.care_services = [...new Set([...data.care_services, ...pdfData.care_services])];
          data.activities = [...new Set([...data.activities, ...pdfData.activities])];

          // Prefer PDF pricing if found
          if (pdfData.entry_price_min) data.entry_price_min = pdfData.entry_price_min;
          if (pdfData.entry_price_max) data.entry_price_max = pdfData.entry_price_max;
          if (pdfData.monthly_fees_min) data.monthly_fees_min = pdfData.monthly_fees_min;
          if (pdfData.monthly_fees_max) data.monthly_fees_max = pdfData.monthly_fees_max;

          if (!data.description && pdfData.description) {
            data.description = pdfData.description;
          }
        }
      } catch (pdfError) {
        console.log(`⚠️ Could not fetch PDF: ${pdfError.message}`);
      }
    }

    console.log(`✅ Extracted: ${data.amenities.length} amenities, ${data.care_services.length} services`);

    return c.json({ success: true, data });

  } catch (error) {
    console.error('❌ Scraping error:', error);
    return c.json({ success: false, error: error.message });
  }
});

// Find PDF links in HTML
function findPDFLinks(html: string, baseUrl: string): string[] {
  const pdfLinks: string[] = [];
  const linkRegex = /href=["']([^"']+\.pdf[^"']*?)["']/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    let pdfUrl = match[1];

    // Make absolute URL
    if (pdfUrl.startsWith('/')) {
      const base = new URL(baseUrl);
      pdfUrl = `${base.protocol}//${base.host}${pdfUrl}`;
    } else if (!pdfUrl.startsWith('http')) {
      const base = new URL(baseUrl);
      pdfUrl = `${base.protocol}//${base.host}/${pdfUrl}`;
    }

    pdfLinks.push(pdfUrl);
  }

  return [...new Set(pdfLinks)]; // Remove duplicates
}

// Extract comprehensive data from any text (HTML or PDF)
function extractComprehensiveData(text: string, villageName: string, operator: string | null): any {
  const data: any = {
    amenities: [],
    care_services: [],
    activities: [],
    description: null,
    contact_phone: null,
    contact_email: null,
    entry_price_min: null,
    entry_price_max: null,
    monthly_fees_min: null,
    monthly_fees_max: null,
    bedrooms: [],
    pet_friendly: false
  };

  const lowerText = text.toLowerCase();

  // Amenities
  const amenityKeywords = [
    'swimming pool', 'pool', 'gymnasium', 'gym', 'fitness centre', 'fitness center',
    'library', 'cinema', 'theatre', 'theater', 'bowling green', 'bowls',
    'craft room', 'workshop', 'salon', 'hairdresser', 'barber',
    'restaurant', 'dining room', 'cafe', 'coffee shop', 'bar', 'lounge',
    'garden', 'courtyard', 'outdoor area', 'bbq', 'barbecue',
    'tennis court', 'putting green', 'billiards', 'snooker',
    'community hall', 'function room', 'common room', 'meeting room',
    'computer room', 'business centre', 'business center',
    'parking', 'car park', 'garage'
  ];

  for (const keyword of amenityKeywords) {
    if (lowerText.includes(keyword)) {
      const formatted = keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      if (!data.amenities.includes(formatted)) {
        data.amenities.push(formatted);
      }
    }
  }

  // Care services
  const serviceKeywords = [
    'emergency call', 'emergency button', 'nursing care', 'medical care',
    'dementia care', 'memory care', 'physiotherapy', 'physio',
    'podiatry', 'foot care', 'gp visits', 'doctor visits',
    'medication management', 'personal care', 'home care',
    'meal delivery', 'cleaning service', '24 hour', '24-hour'
  ];

  for (const keyword of serviceKeywords) {
    if (lowerText.includes(keyword)) {
      const formatted = keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      if (!data.care_services.includes(formatted)) {
        data.care_services.push(formatted);
      }
    }
  }

  // Activities
  const activityKeywords = [
    'art class', 'arts and crafts', 'yoga', 'tai chi', 'pilates',
    'dancing', 'dance class', 'bingo', 'card games', 'trivia',
    'cooking class', 'music', 'concerts', 'bus trips', 'excursions',
    'gardening', 'garden club', 'book club', 'movie nights'
  ];

  for (const keyword of activityKeywords) {
    if (lowerText.includes(keyword)) {
      const formatted = keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      if (!data.activities.includes(formatted)) {
        data.activities.push(formatted);
      }
    }
  }

  // Pet friendly
  if (lowerText.includes('pet friendly') || lowerText.includes('pets welcome') || lowerText.includes('pets allowed')) {
    data.pet_friendly = true;
  }

  // Extract pricing (look for dollar amounts)
  const priceRegex = /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g;
  const prices: number[] = [];
  let priceMatch;

  while ((priceMatch = priceRegex.exec(text)) !== null) {
    const price = parseInt(priceMatch[1].replace(/,/g, ''));
    if (price >= 50000 && price <= 2000000) { // Entry prices typically in this range
      prices.push(price);
    }
  }

  if (prices.length > 0) {
    prices.sort((a, b) => a - b);
    data.entry_price_min = prices[0];
    data.entry_price_max = prices[prices.length - 1];
  }

  // Monthly fees (smaller amounts)
  const monthlyRegex = /(?:monthly|per month|weekly|per week).*?\$\s*(\d{1,3}(?:,\d{3})*)/gi;
  const monthlyFees: number[] = [];
  let monthlyMatch;

  while ((monthlyMatch = monthlyRegex.exec(text)) !== null) {
    const fee = parseInt(monthlyMatch[1].replace(/,/g, ''));
    if (fee >= 100 && fee <= 10000) {
      monthlyFees.push(fee);
    }
  }

  if (monthlyFees.length > 0) {
    monthlyFees.sort((a, b) => a - b);
    data.monthly_fees_min = monthlyFees[0];
    data.monthly_fees_max = monthlyFees[monthlyFees.length - 1];
  }

  // Phone number
  const phoneRegex = /(?:phone|tel|call|contact|p:|t:)[\s:]*(?:\+61|0)?[\s\-]?[1-9][\s\-]?\d{4}[\s\-]?\d{4}/gi;
  const phoneMatches = text.match(phoneRegex);
  if (phoneMatches && phoneMatches.length > 0) {
    const phone = phoneMatches[0].replace(/.*?(\d[\s\-\d]+)/, '$1').replace(/\s+/g, ' ').trim();
    data.contact_phone = phone;
  }

  // Email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emailMatches = text.match(emailRegex);
  if (emailMatches && emailMatches.length > 0) {
    const validEmails = emailMatches.filter(email =>
      !email.includes('example.com') &&
      !email.includes('domain.com') &&
      !email.includes('sentry') &&
      !email.includes('google')
    );
    if (validEmails.length > 0) {
      data.contact_email = validEmails[0];
    }
  }

  // Bedrooms
  const bedroomRegex = /(\d)\s*(?:bed(?:room)?|br)/gi;
  const bedroomMatches = text.match(bedroomRegex);
  if (bedroomMatches) {
    const bedrooms = new Set<string>();
    for (const match of bedroomMatches) {
      const num = match.match(/\d/)?.[0];
      if (num && parseInt(num) <= 4) {
        bedrooms.add(num);
      }
    }
    data.bedrooms = Array.from(bedrooms).sort();
  }

  // Description
  const paragraphRegex = /<p[^>]*>(.*?)<\/p>/gi;
  const paragraphs = Array.from(text.matchAll(paragraphRegex));

  for (const match of paragraphs) {
    const desc = match[1].replace(/<[^>]+>/g, '').trim();
    if (desc.length > 100 && desc.length < 1000) {
      const lowerDesc = desc.toLowerCase();
      if (
        lowerDesc.includes(villageName.toLowerCase()) ||
        lowerDesc.includes('retirement') ||
        lowerDesc.includes('village') ||
        (operator && lowerDesc.includes(operator.toLowerCase()))
      ) {
        data.description = desc;
        break;
      }
    }
  }

  return data;
}

Deno.serve(app.fetch);