// Data Enrichment & Web Scraping API Routes
// JavaScript-rendering version - uses ScraperAPI with Premium Proxies for sites with dynamic content
// UPDATED: Feb 7 2026 - Changed to premium=true (not ultra_premium) for Startup plan
// FORCE REDEPLOY: 2026-02-07 22:48
import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  extractImages,
  extractListItems,
  findPricingPDF,
  extractJSONLD,
} from "./html-extractor.ts";

const app = new Hono();

// Initialize Supabase client with service role for admin operations
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
};

/**
 * Helper function to mark a village as processed (even if skipped/failed)
 * This prevents the batch scraper from retrying the same village repeatedly
 */
async function markVillageAsProcessed(
  villageId: string,
  status: string,
  reason: string,
) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("retirement_villages")
    .update({
      scraped_data: {
        status,
        reason,
        scrapedAt: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", villageId);

  if (error) {
    console.error(
      `  ❌ Failed to save ${status} marker:`,
      error,
    );
  }
  return !error;
}

/**
 * Helper function to fetch HTML with optional JavaScript rendering
 * Uses ScraperAPI for JS-heavy sites to execute JavaScript and return rendered HTML
 */
async function fetchHtml(
  url: string,
  useJsRendering: boolean = false,
): Promise<string> {
  // Ensure URL has a protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
    console.log(`  🔧 Added https:// protocol to URL: ${url}`);
  }
  
  const scraperApiKey = Deno.env.get("SCRAPERAPI_KEY");
  
  // DEBUG: Log ScraperAPI key status
  console.log(`  🔑 ScraperAPI key check: useJsRendering=${useJsRendering}, hasKey=${!!scraperApiKey}, keyLength=${scraperApiKey?.length || 0}`);

  // ALWAYS use ScraperAPI if we have a key (not just for JS rendering)
  // This prevents SSL certificate errors and handles anti-bot protections
  if (scraperApiKey) {
    console.log(
      `  🤖 Using ScraperAPI (render=${useJsRendering}): ${url}`,
    );
    // Use premium=true for protected domains (retirement village websites)
    // Note: Your Startup plan includes "Premium" proxies, not "Ultra Premium"
    const scraperUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(url)}&render=${useJsRendering}`;
    
    // 🔥 DETAILED LOGGING FOR DEBUGGING DEPLOYMENT 🔥
    console.log(`🔥🔥🔥 SCRAPERAPI URL BEING CALLED: ${scraperUrl.replace(scraperApiKey, 'API_KEY_HIDDEN')} 🔥🔥🔥`);

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      60000, // 60 second timeout (increased from 30)
    );

    const response = await fetch(scraperUrl, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const html = await response.text();
      console.log(
        `  ✅ ScraperAPI fetched page with Premium Proxies (${html.length} bytes)`,
      );
      return html;
    } else {
      const errorText = await response.text();
      console.error(
        `  ❌ ScraperAPI failed (${response.status}): ${errorText}`,
      );
      
      // Parse ScraperAPI error message for more details
      let errorDetails = errorText.substring(0, 200);
      try {
        const errorJson = JSON.parse(errorText);
        errorDetails = errorJson.message || errorJson.error || errorText.substring(0, 200);
      } catch (e) {
        // Not JSON, use raw text
      }
      
      throw new Error(`ScraperAPI returned ${response.status}: ${errorDetails}`);
    }
  }

  // Fall back to regular fetch ONLY if no ScraperAPI key
  console.log(`  ⚠️ WARNING: No ScraperAPI key - using regular fetch (may fail with SSL errors): ${url}`);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  const response = await fetch(url, {
    method: "GET",
    signal: controller.signal,
    redirect: "follow",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  clearTimeout(timeoutId);
  return await response.text();
}

/**
 * GET /data-enrichment/stats
 * Get statistics about villages with/without websites
 */
app.get(
  "/make-server-3bba8be8/data-enrichment/stats",
  async (c) => {
    try {
      const supabase = getSupabaseAdmin();

      // Verify admin authentication
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      if (!accessToken) {
        return c.json(
          { error: "Unauthorized - missing access token" },
          401,
        );
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(accessToken);
      if (authError || !user) {
        return c.json(
          { error: "Unauthorized - invalid token" },
          401,
        );
      }

      const state = c.req.query("state");

      let query = supabase
        .from("retirement_villages")
        .select("website", { count: "exact" });

      if (state) {
        query = query.eq("state", state);
      }

      const { count: total } = await query;
      const { count: withWebsites } = await query.not(
        "website",
        "is",
        null,
      );

      return c.json({
        total: total || 0,
        withWebsites: withWebsites || 0,
        withoutWebsites: (total || 0) - (withWebsites || 0),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      return c.json(
        {
          error: "Failed to fetch stats",
          details: error.message,
        },
        500,
      );
    }
  },
);

/**
 * GET /data-enrichment/sample-village/:state
 * Get a sample village with website from a state for testing
 */
app.get(
  "/make-server-3bba8be8/data-enrichment/sample-village/:state",
  async (c) => {
    try {
      const supabase = getSupabaseAdmin();

      // Verify admin authentication
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      if (!accessToken) {
        return c.json(
          { error: "Unauthorized - missing access token" },
          401,
        );
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(accessToken);
      if (authError || !user) {
        return c.json(
          { error: "Unauthorized - invalid token" },
          401,
        );
      }

      const state = c.req.param("state");

      const { data: village, error: fetchError } =
        await supabase
          .from("retirement_villages")
          .select("*")
          .eq("state", state)
          .not("website", "is", null)
          .limit(1)
          .single();

      if (fetchError || !village) {
        return c.json(
          { error: "No village found with website" },
          404,
        );
      }

      return c.json({ village });
    } catch (error) {
      console.error("Error fetching sample village:", error);
      return c.json(
        {
          error: "Internal server error",
          details: error.message,
        },
        500,
      );
    }
  },
);

/**
 * POST /data-enrichment/scrape-village-data
 * Scrape data from village websites that already exist in database
 */
app.post(
  "/make-server-3bba8be8/data-enrichment/scrape-village-data",
  async (c) => {
    console.log('\n🔥🔥🔥 SCRAPE-VILLAGE-DATA ENDPOINT HIT - v1.31 DEPLOYED! 🔥🔥🔥\n');
    
    try {
      const supabase = getSupabaseAdmin();

      // Verify admin authentication
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      if (!accessToken) {
        console.error(
          "Authorization error: No access token provided",
        );
        return c.json(
          { error: "Unauthorized - missing access token" },
          401,
        );
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(accessToken);
      if (authError || !user) {
        console.error(
          "Authorization error during scraping:",
          authError,
        );
        return c.json(
          { error: "Unauthorized - invalid token" },
          401,
        );
      }

      const { state, villageIds, forceRescrape } =
        await c.req.json();

      let villages;
      let fetchError;

      if (villageIds && villageIds.length > 0) {
        // Scrape specific villages by ID (for testing single villages)
        console.log(
          `🚀 Starting scrape for ${villageIds.length} specific village(s)...`,
        );
        const result = await supabase
          .from("retirement_villages")
          .select("*")
          .in("id", villageIds)
          .not("website", "is", null);
        villages = result.data;
        fetchError = result.error;
      } else if (state) {
        // Scrape by state (original behavior)
        console.log(
          `🚀 Starting Puppeteer-enhanced scrape for state: ${state}`,
        );
        const result = await supabase
          .from("retirement_villages")
          .select("*")
          .eq("state", state)
          .not("website", "is", null)
          .is("scraped_data", null) // Only scrape villages that haven't been scraped yet
          .order("name")
          .limit(5); // Reduced from 10 - Puppeteer needs more time per site
        villages = result.data;
        fetchError = result.error;
      } else {
        return c.json(
          { error: "Must provide either state or villageIds" },
          400,
        );
      }

      if (fetchError) {
        console.error("Error fetching villages:", fetchError);
        return c.json(
          {
            error: "Failed to fetch villages",
            details: fetchError.message,
          },
          500,
        );
      }

      console.log(
        `Found ${villages?.length || 0} villages to scrape ${villageIds ? "(by ID)" : `in ${state}`}`,
      );

      const results = [];
      let browser = null;

      try {
        // TEMPORARILY USING FETCH-BASED SCRAPING (Puppeteer doesn't work in Edge Functions)
        console.log(
          "🌐 Using fetch-based scraping (Puppeteer temporarily disabled)...",
        );

        // Scrape each village
        for (const village of villages || []) {
          try {
            console.log(
              `🔍 Scraping: ${village.name} - ${village.website}`,
            );

            // Skip if already has scraped_data (unless forceRescrape is true)
            if (village.scraped_data && !forceRescrape) {
              results.push({
                villageId: village.id,
                name: village.name,
                status: "skipped",
                reason: "Already has scraped data",
                website: village.website,
              });
              continue;
            }

            // Log when force re-scraping
            if (village.scraped_data && forceRescrape) {
              console.log(
                `🔄 Force re-scraping ${village.name} (has existing data)`,
              );
            }

            // Use direct fetch instead of ScraperAPI (retirement village sites are simple HTML)
            // ScraperAPI quota has been exhausted - using regular fetch works fine for most sites
            let html;
            let htmlLower;
            try {
              // TESTING: Using render=false (simple HTTP fetch) like NSW/QLD/SA/WA states
              // This avoids the need for Premium Proxies and is faster/cheaper
              // If VIC sites need JS rendering, we'll see failures and can adjust
              html = await fetchHtml(village.website, false); // TEST: render=false like other states
              htmlLower = html.toLowerCase();
            } catch (err) {
              console.error(
                `  ❌ Failed to fetch ${village.website}: ${err.message}`,
              );
              
              // Save detailed error to database
              await markVillageAsProcessed(
                village.id,
                "failed",
                `Fetch error: ${err.message}`,
              );
              
              results.push({
                villageId: village.id,
                name: village.name,
                status: "failed",
                reason: `Fetch error: ${err.message}`,
                website: village.website,
              });
              continue;
            }

            // DEBUG: Log HTML stats
            console.log(
              `  📄 HTML fetched: ${html.length} characters, ${htmlLower.match(/<a[^>]+href/gi)?.length || 0} links`,
            );
            console.log(
              `  🔍 Homepage indicators: our homes=${htmlLower.includes("our homes")}, locations=${htmlLower.includes("locations")}, find a home=${htmlLower.includes("find a home")}`,
            );

            // Check if this is a corporate homepage (multi-village site)
            // Look for signs like: multiple locations, village directory, "our homes", etc.
            const isCorporateHomepage =
              (htmlLower.includes("our homes") ||
                htmlLower.includes("our villages") ||
                htmlLower.includes("locations") ||
                htmlLower.includes("find a home") ||
                htmlLower.includes("find a village")) &&
              (htmlLower.match(/<a[^>]+href/gi)?.length || 0) >
                50; // Many links suggest directory

            console.log(
              `  🏢 Corporate homepage detected: ${isCorporateHomepage}`,
            );

            let villageSpecificHtml = html;
            let scrapedUrl = village.website;

            // Try to find village-specific page if on corporate homepage
            if (isCorporateHomepage) {
              console.log(
                `  🔍 Detected corporate homepage, searching for village-specific page...`,
              );

              // Try to find a link containing the village name or suburb
              const villageName = village.name.toLowerCase();
              const nameWords = villageName
                .split(/\s+/)
                .filter(
                  (w) =>
                    w.length > 3 &&
                    ![
                      "arcare",
                      "aged",
                      "care",
                      "village",
                      "retirement",
                    ].includes(w),
                );

              console.log(
                `  🔤 Village name: "${villageName}", searching for words:`,
                nameWords,
              );

              // Look for links with village name/suburb in href or text
              const linkPattern =
                /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)</gi;
              const links = [...html.matchAll(linkPattern)];

              console.log(
                `  🔗 Found ${links.length} links to search through...`,
              );

              let villageLink = null;
              for (const link of links) {
                const href = link[1].toLowerCase();
                const text = link[2].toLowerCase();

                // Skip image URLs, downloads, and external sites
                if (
                  href.match(
                    /\.(jpg|jpeg|png|gif|webp|svg|pdf|doc|docx)$/i,
                  ) ||
                  href.includes("/wp-content/uploads/") ||
                  href.includes("/images/") ||
                  href.includes("/assets/") ||
                  href.includes("/media/")
                ) {
                  continue; // Skip this link
                }

                // Check if link contains any significant word from village name
                for (const word of nameWords) {
                  if (
                    href.includes(word) ||
                    text.includes(word)
                  ) {
                    villageLink = link[1];
                    console.log(
                      `  ✅ Found potential village page: ${villageLink} (matched "${word}" in ${href.includes(word) ? "href" : "text"})`,
                    );
                    break;
                  }
                }
                if (villageLink) break;
              }

              if (!villageLink) {
                console.log(
                  `  ⚠️ Could not find village-specific link among ${links.length} links`,
                );
              }

              // Try to fetch the village-specific page
              if (villageLink) {
                try {
                  // Build absolute URL
                  let absoluteUrl = villageLink;
                  if (villageLink.startsWith("/")) {
                    const urlObj = new URL(village.website);
                    absoluteUrl = `${urlObj.protocol}//${urlObj.host}${villageLink}`;
                  } else if (!villageLink.startsWith("http")) {
                    const urlObj = new URL(village.website);
                    absoluteUrl = `${urlObj.protocol}//${urlObj.host}/${villageLink}`;
                  }

                  console.log(
                    `  🌐 Fetching village-specific page: ${absoluteUrl}`,
                  );
                  villageSpecificHtml = await fetchHtml(
                    absoluteUrl,
                    false,
                  ); // TEST: render=false for village-specific pages too
                  scrapedUrl = absoluteUrl;
                  console.log(
                    `  ✅ Successfully fetched village-specific page!`,
                  );
                } catch (e) {
                  console.log(
                    `  ⚠️ Failed to fetch village-specific page, using homepage: ${e.message}`,
                  );
                }
              } else {
                console.log(
                  `  ⚠️ Could not find village-specific link, scraping homepage`,
                );
              }
            }

            // Use the village-specific HTML (or homepage if not found)
            const htmlToScrape = villageSpecificHtml;
            const htmlToScrapeLower =
              htmlToScrape.toLowerCase();

            // PARKED DOMAIN CHECK DISABLED
            // Accepting all pages (operator pages, general pages, etc.)
            // Some data is better than no data for prototype purposes
            console.log(`✅ Scraping ${village.name} (parked check disabled)`);

            // Use HTML text content for scraping (Puppeteer disabled)
            // Strip HTML tags for basic text extraction
            const textContent = htmlToScrape
              .replace(
                /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                "",
              )
              .replace(
                /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
                "",
              )
              .replace(/<[^>]+>/g, " ")
              .toLowerCase();

            console.log(
              `  📄 HTML: ${htmlToScrape.length} bytes → Text: ${textContent.length} chars`,
            );

            // EXTRACT DATA FROM HTML STRUCTURE (before stripping tags!)
            const extractedImages = extractImages(
              htmlToScrape,
              village.website,
            );
            const listItems = extractListItems(htmlToScrape);
            const pricingPDF = findPricingPDF(htmlToScrape);
            const jsonLdData = extractJSONLD(htmlToScrape);

            console.log(
              `  🖼️  Found ${extractedImages.length} images`,
            );
            console.log(
              `  📋 Found ${listItems.length} list items`,
            );
            if (pricingPDF)
              console.log(
                `  📄 Found pricing PDF: ${pricingPDF}`,
              );
            if (jsonLdData.length > 0)
              console.log(
                `  📊 Found ${jsonLdData.length} JSON-LD blocks`,
              );

            // Initialize scraped data object
            const scrapedData: any = {
              source: "puppeteer_scraper",
              scraped_at: new Date().toISOString(),
              scraped_from: scrapedUrl, // Use the actual URL scraped (might be village-specific)
            };

            let fieldsFound = 0;

            console.log(
              `📊 Extracting data for ${village.name}...`,
            );

            // Extract pricing information
            const pricingPatterns = [
              /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:per week|pw|weekly|\/week)/gi,
              /entry\s*(?:price|fee|cost|contribution)[:\s]*\$\s*(\d{1,3}(?:,\d{3})*)/gi,
              /from\s*\$\s*(\d{1,3}(?:,\d{3})*)/gi,
              /prices?\s*(?:start|starting|from)[:\s]*\$\s*(\d{1,3}(?:,\d{3})*)/gi,
              // Australian-specific patterns
              /weekly\s*(?:fee|fees|charge)[:\s]*\$\s*(\d{1,3}(?:,\d{3})*)/gi,
              /service\s*fee[:\s]*\$\s*(\d{1,3}(?:,\d{3})*)/gi,
              /deferred\s*management\s*fee/gi, // Just detect presence
              /investment\s*(?:range|from)[:\s]*\$\s*(\d{1,3}(?:,\d{3})*)/gi,
              /unit\s*prices?\s*(?:from|start)[:\s]*\$\s*(\d{1,3}(?:,\d{3})*)/gi,
              /\$\s*(\d{1,3}(?:,\d{3})*)\s*-\s*\$\s*(\d{1,3}(?:,\d{3})*)/gi, // Price ranges like "$450,000 - $650,000"
            ];

            const priceMatches = [];
            for (const pattern of pricingPatterns) {
              const matches = [
                ...textContent.matchAll(pattern),
              ];
              // Handle both single captures and range captures
              for (const match of matches) {
                if (match[1])
                  priceMatches.push(
                    parseInt(match[1].replace(/,/g, "")),
                  );
                if (match[2])
                  priceMatches.push(
                    parseInt(match[2].replace(/,/g, "")),
                  );
              }
            }

            if (priceMatches.length > 0) {
              const uniquePrices = [
                ...new Set(priceMatches),
              ].filter((p) => p > 100 && p < 10000000);
              if (uniquePrices.length > 0) {
                uniquePrices.sort((a, b) => a - b);
                scrapedData.scraped_entry_price_min =
                  uniquePrices[0];
                scrapedData.scraped_entry_price_max =
                  uniquePrices[uniquePrices.length - 1];
                fieldsFound++;
              }
            }

            // Extract phone numbers - ENHANCED to find "hidden" phone numbers
            // Australian phone number formats: (02) 1234 5678, 02 1234 5678, 1300 123 456, 13 12 34, +61 2 1234 5678
            const phonePatterns = [
              // Standard format with context words
              /(?:phone|call|contact|tel|fax|enquiries|inquiries)[:\s]*(\+?61[\s\-]?)?(\(?\d{1,2}\)?[\s\-]?\d{3,4}[\s\-]?\d{3,4})/gi,
              // 1300/1800 numbers
              /(1[38]00[\s\-]?\d{3}[\s\-]?\d{3})/gi,
              // 13 numbers (13 12 34 format)
              /(13[\s\-]?\d{2}[\s\-]?\d{2})/gi,
              // Generic Australian format (anywhere in text)
              /(\(?\d{2}\)?[\s\-]?\d{4}[\s\-]?\d{4})/g,
              // International format
              /(\+61[\s\-]?\d{1}[\s\-]?\d{4}[\s\-]?\d{4})/g,
            ];

            const phoneMatches = [];
            for (const pattern of phonePatterns) {
              const matches = [
                ...htmlToScrape.matchAll(pattern),
              ]; // Search raw HTML, not just text
              for (const match of matches) {
                // Get the full phone number (last capture group or full match)
                const phone = match[2] || match[1] || match[0];
                if (
                  phone &&
                  phone.replace(/\D/g, "").length >= 8
                ) {
                  // At least 8 digits
                  phoneMatches.push(phone.trim());
                }
              }
            }

            if (
              phoneMatches.length > 0 &&
              !village.contact_phone
            ) {
              // Take the first valid phone number found
              scrapedData.scraped_contact_phone =
                phoneMatches[0];
              fieldsFound++;
              console.log(
                `  ✅ Found phone: ${phoneMatches[0]}`,
              );
            }

            // Extract amenities - comprehensive list for Australian retirement villages
            const amenityKeywords = [
              // Recreation & Fitness
              "swimming pool",
              "pool",
              "heated pool",
              "indoor pool",
              "outdoor pool",
              "gym",
              "fitness",
              "fitness centre",
              "fitness center",
              "exercise room",
              "bowling green",
              "lawn bowls",
              "croquet",
              "tennis court",
              "golf",
              "putting green",
              "mini golf",

              // Social & Entertainment
              "library",
              "cinema",
              "theatre",
              "movie theatre",
              "community hall",
              "function room",
              "activities room",
              "meeting room",
              "lounge",
              "residents lounge",
              "common lounge",
              "bar",
              "club",
              "social club",
              "club house",
              "clubhouse",
              "games room",
              "billiards",
              "pool table",
              "snooker",

              // Creative & Hobbies
              "workshop",
              "craft room",
              "art room",
              "pottery",
              "woodwork",
              "men's shed",
              "hobby room",

              // Beauty & Wellness
              "hairdresser",
              "salon",
              "beauty salon",
              "barber",
              "spa",
              "massage",
              "wellness centre",

              // Outdoor & Gardens
              "garden",
              "gardens",
              "landscaped gardens",
              "community garden",
              "courtyard",
              "outdoor area",
              "barbecue area",
              "bbq area",
              "walking paths",
              "walking tracks",

              // Dining & Food
              "cafe",
              "coffee shop",
              "restaurant",
              "dining room",
              "commercial kitchen",
              "shared kitchen",

              // Medical & Care
              "medical centre",
              "health centre",
              "clinic",
              "emergency call",
              "24-hour emergency",

              // Services
              "laundry",
              "laundromat",
              "laundry facilities",
              "parking",
              "car park",
              "garage",
              "covered parking",
              "visitor parking",
              "guest parking",

              // Technology & Communication
              "internet",
              "wifi",
              "wi-fi",
              "broadband",
              "computer room",

              // Security
              "security",
              "gated",
              "secure entry",
              "intercom",

              // Additional
              "elevator",
              "lift",
              "chapel",
              "prayer room",
            ];

            // Use word boundary matching to avoid false positives (e.g., "spa" in "space")
            const foundAmenities = amenityKeywords.filter(
              (amenity) => {
                // Escape special regex characters and create word boundary pattern
                const escapedAmenity = amenity.replace(
                  /[.*+?^${}()|[\]\\]/g,
                  "\\$&",
                );
                const pattern = new RegExp(
                  `\\b${escapedAmenity}\\b`,
                  "i",
                );
                // Check BOTH text content AND list items (crucial for Arcare!)
                const combinedText =
                  textContent + " " + listItems.join(" ");
                const isMatch = pattern.test(combinedText);

                // DEBUG: Log context when "spa" is found
                if (amenity === "spa" && isMatch) {
                  const match = textContent.match(
                    new RegExp(
                      `.{0,50}\\b${escapedAmenity}\\b.{0,50}`,
                      "i",
                    ),
                  );
                  console.log(
                    `  🔍 DEBUG: Found "spa" in context: "${match ? match[0] : "no context"}"`,
                  );
                }

                return isMatch;
              },
            );

            console.log(
              `  🔍 Testing ${amenityKeywords.length} amenity keywords...`,
            );
            console.log(
              `  ✅ Found amenities:`,
              foundAmenities,
            );

            if (foundAmenities.length > 0) {
              scrapedData.scraped_amenities = foundAmenities;
              fieldsFound++;
              console.log(
                `  ✅ Saved ${foundAmenities.length} amenities:`,
                foundAmenities.join(", "),
              );
            }

            // Check if pet friendly
            if (
              textContent.includes("pet friendly") ||
              textContent.includes("pets welcome") ||
              textContent.includes("pet-friendly") ||
              textContent.includes("pets allowed")
            ) {
              scrapedData.scraped_pet_friendly = true;
              fieldsFound++;
            }

            // Extract image URLs - ENHANCED to find more images
            // Use the images we already extracted from HTML structure
            // (This replaces the old manual extraction below)
            const imageMatches = extractedImages.map((url) => ({
              url,
              isHighQuality: true, // Assume extracted images are quality since we filtered logos/icons
              source: "img",
            }));

            // 1. Standard img tags
            const imgTagPattern =
              /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
            const imgMatches = [
              ...htmlToScrape.matchAll(imgTagPattern),
            ];

            for (const match of imgMatches) {
              const imgUrl = match[1];

              // Skip small icons, logos, SVGs, and base64 images
              if (
                imgUrl.includes("logo") ||
                imgUrl.includes("icon") ||
                imgUrl.endsWith(".svg") ||
                imgUrl.startsWith("data:") ||
                imgUrl.includes("spinner") ||
                imgUrl.includes("loading") ||
                imgUrl.includes("placeholder") ||
                imgUrl.includes("avatar") ||
                (imgUrl.includes("thumb") &&
                  imgUrl.includes("nail"))
              ) {
                // Skip thumbnails but allow words containing 'thumb'
                continue;
              }

              // Try to build absolute URLs
              let absoluteUrl = imgUrl;
              try {
                if (imgUrl.startsWith("/")) {
                  const urlObj = new URL(village.website);
                  absoluteUrl = `${urlObj.protocol}//${urlObj.host}${imgUrl}`;
                } else if (!imgUrl.startsWith("http")) {
                  const urlObj = new URL(village.website);
                  absoluteUrl = `${urlObj.protocol}//${urlObj.host}/${imgUrl}`;
                }
              } catch (e) {
                // Skip if URL parsing fails
                continue;
              }

              // Look for high-quality indicators in URL or surrounding HTML
              const matchContext = htmlToScrape
                .substring(
                  Math.max(0, match.index - 300),
                  Math.min(
                    htmlToScrape.length,
                    match.index + 300,
                  ),
                )
                .toLowerCase();
              const isHighQuality =
                matchContext.includes("gallery") ||
                matchContext.includes("hero") ||
                matchContext.includes("banner") ||
                matchContext.includes("featured") ||
                matchContext.includes("slider") ||
                matchContext.includes("slideshow") ||
                matchContext.includes("carousel") ||
                absoluteUrl.includes("gallery") ||
                absoluteUrl.includes("slider") ||
                absoluteUrl.includes("hero") ||
                absoluteUrl.includes("banner");

              imageMatches.push({
                url: absoluteUrl,
                isHighQuality,
                source: "img",
              });
            }

            // 2. Picture/source tags (modern responsive images)
            const picturePattern =
              /<source[^>]+srcset=["']([^"']+)["'][^>]*>/gi;
            const pictureMatches = [
              ...htmlToScrape.matchAll(picturePattern),
            ];

            for (const match of pictureMatches) {
              const srcset = match[1];
              // Extract first URL from srcset (format: "url 1x, url 2x")
              const urlMatch = srcset.match(
                /([^\s,]+\.(?:jpg|jpeg|png|webp))/i,
              );
              if (urlMatch) {
                let imgUrl = urlMatch[1];

                try {
                  if (imgUrl.startsWith("/")) {
                    const urlObj = new URL(village.website);
                    imgUrl = `${urlObj.protocol}//${urlObj.host}${imgUrl}`;
                  } else if (!imgUrl.startsWith("http")) {
                    const urlObj = new URL(village.website);
                    imgUrl = `${urlObj.protocol}//${urlObj.host}/${imgUrl}`;
                  }

                  imageMatches.push({
                    url: imgUrl,
                    isHighQuality: true,
                    source: "picture",
                  });
                } catch (e) {
                  // Skip if URL parsing fails
                }
              }
            }

            // 3. CSS background images (often used for hero/banner images)
            const bgImagePattern =
              /background(?:-image)?:\s*url\(["']?([^"')]+)["']?\)/gi;
            const bgMatches = [
              ...htmlToScrape.matchAll(bgImagePattern),
            ];

            for (const match of bgMatches) {
              let imgUrl = match[1];

              // Skip data URIs and very small images
              if (
                imgUrl.startsWith("data:") ||
                imgUrl.includes("1x1") ||
                imgUrl.includes("pixel")
              ) {
                continue;
              }

              try {
                if (imgUrl.startsWith("/")) {
                  const urlObj = new URL(village.website);
                  imgUrl = `${urlObj.protocol}//${urlObj.host}${imgUrl}`;
                } else if (!imgUrl.startsWith("http")) {
                  const urlObj = new URL(village.website);
                  imgUrl = `${urlObj.protocol}//${urlObj.host}/${imgUrl}`;
                }

                imageMatches.push({
                  url: imgUrl,
                  isHighQuality: true,
                  source: "background",
                });
              } catch (e) {
                // Skip if URL parsing fails
              }
            }

            // Remove duplicates and prioritize high-quality images, limit to top 8
            const uniqueUrls = new Set();
            const sortedImages = imageMatches
              .filter((img) => {
                if (uniqueUrls.has(img.url)) return false;
                uniqueUrls.add(img.url);
                return true;
              })
              .sort((a, b) => {
                // Prioritize: high quality > source type (picture > background > img)
                if (a.isHighQuality !== b.isHighQuality)
                  return b.isHighQuality ? 1 : -1;
                const sourceOrder = {
                  picture: 3,
                  background: 2,
                  img: 1,
                };
                return (
                  sourceOrder[b.source] - sourceOrder[a.source]
                );
              })
              .map((img) => img.url)
              .slice(0, 8); // Increased from 6 to 8

            if (sortedImages.length > 0) {
              scrapedData.scraped_images = sortedImages;
              fieldsFound++;
              console.log(
                `  ✅ Found ${sortedImages.length} images`,
              );
            }

            // Only store if we found at least one field
            if (fieldsFound > 0) {
              const { error: updateError } = await supabase
                .from("retirement_villages")
                .update({
                  scraped_data: scrapedData,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", village.id);

              if (updateError) {
                results.push({
                  villageId: village.id,
                  name: village.name,
                  status: "failed",
                  reason: "Failed to save scraped data",
                  error: updateError.message,
                  debug: {
                    scrapedUrl,
                    originalUrl: village.website,
                    fieldsFound,
                  },
                });
              } else {
                results.push({
                  villageId: village.id,
                  name: village.name,
                  status: "success",
                  website: village.website,
                  fieldsFound,
                  extractedData: scrapedData,
                  debug: {
                    scrapedUrl,
                    originalUrl: village.website,
                  },
                });
              }
            } else {
              // IMPORTANT: Save a marker to scraped_data so we don't retry this village
              const { error: noDataUpdateError } =
                await supabase
                  .from("retirement_villages")
                  .update({
                    scraped_data: {
                      status: "no_data",
                      reason: "No data fields found on website",
                      scrapedAt: new Date().toISOString(),
                    },
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", village.id);

              if (noDataUpdateError) {
                console.error(
                  "  ❌ Failed to save no_data marker:",
                  noDataUpdateError,
                );
              }

              results.push({
                villageId: village.id,
                name: village.name,
                status: "no_data",
                reason: "No data fields found on website",
                website: village.website,
                debug: {
                  scrapedUrl,
                  originalUrl: village.website,
                  htmlLength: htmlToScrape.length,
                  textContentLength: textContent.length,
                  extractedImagesCount: extractedImages.length,
                  listItemsCount: listItems.length,
                  listItemsSample: listItems.slice(0, 5),
                  pricingPDF: pricingPDF || "none",
                  foundAmenities:
                    scrapedData.scraped_amenities || [],
                  htmlSample: htmlToScrape.substring(0, 500),
                },
              });
            }

            // Rate limiting - wait 2 seconds between scrapes
            await new Promise((resolve) =>
              setTimeout(resolve, 2000),
            );
          } catch (error) {
            console.error(
              `Error scraping ${village.name}:`,
              error,
            );
            results.push({
              villageId: village.id,
              name: village.name,
              status: "error",
              reason: error.message,
              website: village.website,
            });
          }
        }
      } finally {
        // Close browser after all villages
        if (browser) {
          await browser.close();
        }
      }

      // Calculate summary stats
      const summary = {
        total: results.length,
        success: results.filter((r) => r.status === "success")
          .length,
        noData: results.filter((r) => r.status === "no_data")
          .length,
        skipped: results.filter((r) => r.status === "skipped")
          .length,
        failed: results.filter(
          (r) => r.status === "failed" || r.status === "error",
        ).length,
      };

      console.log("Scraping complete:", summary);

      return c.json({
        success: true,
        summary,
        results,
      });
    } catch (error) {
      console.error(
        "Unexpected error in data scraping:",
        error,
      );
      return c.json(
        {
          error: "Internal server error",
          details: error.message,
        },
        500,
      );
    }
  },
);

/**
 * GET /data-enrichment/test-scrape
 * TEST ENDPOINT - Scrape a single village for testing (no auth required)
 */
app.get(
  "/make-server-3bba8be8/data-enrichment/test-scrape",
  async (c) => {
    try {
      const supabase = getSupabaseAdmin();
      const villageId = c.req.query("villageId");

      if (!villageId) {
        return c.json(
          { error: "Missing villageId parameter" },
          400,
        );
      }

      console.log(
        `🧪 TEST: Starting scrape for village: ${villageId}`,
      );

      // Fetch the village
      const { data: village, error: fetchError } =
        await supabase
          .from("retirement_villages")
          .select("*")
          .eq("id", villageId)
          .single();

      if (fetchError || !village) {
        console.error("Error fetching village:", fetchError);
        return c.json(
          {
            error: "Village not found",
            details: fetchError?.message,
          },
          404,
        );
      }

      if (!village.website) {
        return c.json({ error: "Village has no website" }, 400);
      }

      console.log(`  📍 Village: ${village.name}`);
      console.log(`  🌐 Website: ${village.website}`);

      const results = [];

      // Try scraping the website
      try {
        const scrapedUrl = village.website;
        console.log(
          `  🤖 Fetching with JavaScript rendering: ${scrapedUrl}`,
        );

        const html = await fetchHtml(scrapedUrl, true); // Use JS rendering

        if (html) {
          console.log(
            `  📄 Received HTML (${html.length} bytes)`,
          );

          // Extract structured data
          const jsonLd = extractJSONLD(html);

          // Extract images
          const images = extractImages(html, scrapedUrl);
          console.log(`  🖼️ Found ${images.length} images`);

          // Extract phone numbers (Australian format)
          const phoneRegex =
            /(?:\+61|0)[\s\-]?[2-478](?:[\s\-]?\d){8}|\(0[2-478]\)[\s\-]?\d{4}[\s\-]?\d{4}|1300[\s\-]?\d{3}[\s\-]?\d{3}|1800[\s\-]?\d{3}[\s\-]?\d{3}/g;
          const phoneMatches = html.match(phoneRegex) || [];
          const phoneNumbers = [...new Set(phoneMatches)].slice(
            0,
            5,
          );
          console.log(
            `  📱 Found ${phoneNumbers.length} phone numbers`,
          );

          // Extract pricing
          const pricingRegex =
            /\$[\d,]+(?:\s*(?:per|\/)\s*(?:week|month|year))?|\$[\d,]+\s*-\s*\$[\d,]+|from\s+\$[\d,]+/gi;
          const pricingMatches = html.match(pricingRegex) || [];
          const pricing = [...new Set(pricingMatches)].slice(
            0,
            10,
          );
          console.log(
            `  💰 Found ${pricing.length} pricing mentions`,
          );

          // Extract amenities - expanded keywords
          const amenityKeywords = [
            "pool",
            "swimming",
            "gym",
            "fitness",
            "library",
            "cinema",
            "theatre",
            "garden",
            "cafe",
            "restaurant",
            "dining",
            "bowling green",
            "billiards",
            "craft room",
            "workshop",
            "chapel",
            "hairdresser",
            "medical",
            "nurse",
            "emergency call",
            "security",
            "transport",
            "bus",
            "activities",
            "social",
            "outdoor",
            "bbq",
            "barbecue",
            "tennis",
            "putting green",
            "croquet",
            "spa",
            "sauna",
            "wellness",
            "yoga",
            "art studio",
            "music room",
            "common room",
            "lounge",
            "meeting room",
            "function room",
            "bar",
            "wifi",
            "internet",
            "parking",
            "garage",
            "storage",
            "laundry",
            "pet friendly",
            "pets allowed",
            "courtyard",
            "terrace",
            "balcony",
            "lift",
            "elevator",
            "wheelchair",
            "mobility",
            "aged care",
            "memory support",
            "dementia",
            "respite",
            "assisted living",
          ];

          const amenities: string[] = [];
          const lowerHtml = html.toLowerCase();
          for (const keyword of amenityKeywords) {
            if (lowerHtml.includes(keyword)) {
              amenities.push(keyword);
            }
          }
          console.log(
            `  🏊 Found ${amenities.length} amenities`,
          );

          // Count fields found
          let fieldsFound = 0;
          if (phoneNumbers.length > 0) fieldsFound++;
          if (pricing.length > 0) fieldsFound++;
          if (amenities.length > 0) fieldsFound++;
          if (images.length > 0) fieldsFound++;

          // Prepare scraped data
          const scrapedData = {
            phoneNumbers:
              phoneNumbers.length > 0 ? phoneNumbers : null,
            pricing: pricing.length > 0 ? pricing : null,
            amenities: amenities.length > 0 ? amenities : null,
            images: images.length > 0 ? images : null,
            jsonLd: jsonLd || null,
            scrapedAt: new Date().toISOString(),
            source: "test-scrape-endpoint",
          };

          // Save to database
          const { error: updateError } = await supabase
            .from("retirement_villages")
            .update({ scraped_data: scrapedData })
            .eq("id", village.id);

          if (updateError) {
            console.error(
              "  ❌ Failed to save scraped data:",
              updateError,
            );
            results.push({
              villageId: village.id,
              name: village.name,
              status: "failed",
              reason: "Failed to save scraped data",
              error: updateError.message,
              debug: {
                scrapedUrl,
                originalUrl: village.website,
                fieldsFound,
              },
            });
          } else {
            console.log(
              `  ✅ Scraped data saved successfully (${fieldsFound} fields)`,
            );

            // Create a response object WITHOUT the scraped_images to avoid massive console logs
            const responseData = { ...scrapedData };
            if (responseData.scraped_images) {
              // Just include image count, not the actual base64 data
              responseData.scraped_images_count =
                responseData.scraped_images.length;
              delete responseData.scraped_images;
            }

            results.push({
              villageId: village.id,
              name: village.name,
              status: "success",
              website: village.website,
              fieldsFound,
              extractedData: responseData,
              debug: {
                scrapedUrl,
                originalUrl: village.website,
              },
            });
          }
        } else {
          results.push({
            villageId: village.id,
            name: village.name,
            status: "no_data",
            reason: "No HTML received",
          });
        }
      } catch (scrapeError) {
        console.error(
          `  ❌ Error scraping ${village.name}:`,
          scrapeError,
        );
        results.push({
          villageId: village.id,
          name: village.name,
          status: "failed",
          reason: "Scraping error",
          error: scrapeError.message,
        });
      }

      return c.json({
        backendVersion: "1.32-scraper-test-message",
        testMessage: "🔥🔥🔥 NEW CODE IS RUNNING! 🔥🔥🔥",
        results: results
      });
    } catch (error) {
      console.error("Unexpected error in test scrape:", error);
      return c.json(
        {
          error: "Internal server error",
          details: error.message,
        },
        500,
      );
    }
  },
);

/**
 * GET /data-enrichment/test-scraped-data/:villageId
 * TEST ENDPOINT - Check scraped data for a specific village (no auth required)
 */
app.get(
  "/make-server-3bba8be8/data-enrichment/test-scraped-data/:villageId",
  async (c) => {
    try {
      const supabase = getSupabaseAdmin();
      const villageId = c.req.param("villageId");

      const { data: village, error } = await supabase
        .from("retirement_villages")
        .select("id, name, website, scraped_data, updated_at")
        .eq("id", villageId)
        .single();

      if (error) {
        console.error("Error fetching village:", error);
        return c.json(
          {
            error: "Failed to fetch village",
            details: error.message,
          },
          500,
        );
      }

      if (!village) {
        return c.json({ error: "Village not found" }, 404);
      }

      return c.json({
        success: true,
        village: {
          id: village.id,
          name: village.name,
          website: village.website,
          updated_at: village.updated_at,
          scraped_data: village.scraped_data || null,
          has_scraped_data: !!village.scraped_data,
        },
      });
    } catch (error) {
      console.error(
        "Unexpected error fetching village:",
        error,
      );
      return c.json(
        {
          error: "Internal server error",
          details: error.message,
        },
        500,
      );
    }
  },
);

/**
 * GET /data-enrichment/villages-with-scraped-data
 * Get all villages that have scraped data pending review
 */
app.get(
  "/make-server-3bba8be8/data-enrichment/villages-with-scraped-data",
  async (c) => {
    try {
      const supabase = getSupabaseAdmin();

      // Verify admin authentication
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      if (!accessToken) {
        return c.json(
          { error: "Unauthorized - missing access token" },
          401,
        );
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(accessToken);
      if (authError || !user) {
        return c.json(
          { error: "Unauthorized - invalid token" },
          401,
        );
      }

      // Get optional state filter from query params
      const stateFilter = c.req.query("state");
      console.log("🔍 [BACKEND] Received state filter:", stateFilter);

      // Build query with optional state filter
      let query = supabase
        .from("retirement_villages")
        .select("*")
        .not("scraped_data", "is", null);

      // Add state filter if provided
      if (stateFilter && stateFilter !== 'ALL') {
        console.log("🔍 [BACKEND] Applying state filter:", stateFilter);
        query = query.eq("state", stateFilter);
      }

      const { data: villages, error } = await query
        .order("updated_at", { ascending: false });

      if (error) {
        console.error(
          "Error fetching villages with scraped data:",
          error,
        );
        return c.json(
          {
            error: "Failed to fetch villages",
            details: error.message,
          },
          500,
        );
      }

      console.log("🔍 [BACKEND] Returning villages:", villages?.length, "filtered by:", stateFilter || "ALL");

      return c.json({ 
        villages: villages || [],
        filteredBy: stateFilter || 'ALL',
        totalCount: villages?.length || 0
      });
    } catch (error) {
      console.error(
        "Unexpected error fetching villages with scraped data:",
        error,
      );
      return c.json(
        {
          error: "Internal server error",
          details: error.message,
        },
        500,
      );
    }
  },
);

/**
 * POST /data-enrichment/approve-scraped-data/:id
 * Approve and merge scraped data into village record
 */
app.post(
  "/make-server-3bba8be8/data-enrichment/approve-scraped-data/:id",
  async (c) => {
    try {
      const supabase = getSupabaseAdmin();
      const villageId = c.req.param("id");

      // Verify admin authentication
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      if (!accessToken) {
        return c.json(
          { error: "Unauthorized - missing access token" },
          401,
        );
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(accessToken);
      if (authError || !user) {
        return c.json(
          { error: "Unauthorized - invalid token" },
          401,
        );
      }

      const body = await c.req.json();
      const { fieldsToApprove } = body; // Array of field names to approve

      // Get village with scraped data
      const { data: village, error: fetchError } =
        await supabase
          .from("retirement_villages")
          .select("*")
          .eq("id", villageId)
          .single();

      if (fetchError || !village) {
        return c.json({ error: "Village not found" }, 404);
      }

      if (!village.scraped_data) {
        return c.json(
          { error: "No scraped data available" },
          400,
        );
      }

      const scrapedData = village.scraped_data as any;
      const updates: any = {
        updated_at: new Date().toISOString(),
      };

      // Map scraped fields to actual fields
      const fieldMapping: Record<string, string> = {
        scraped_entry_price_min: "entry_price_min",
        scraped_entry_price_max: "entry_price_max",
        scraped_contact_phone: "contact_phone",
        scraped_amenities: "amenities",
        scraped_pet_friendly: "pet_friendly",
        scraped_images: "images",
      };

      // Apply approved fields
      if (fieldsToApprove && fieldsToApprove.length > 0) {
        for (const scrapedField of fieldsToApprove) {
          const actualField = fieldMapping[scrapedField];
          if (actualField && scrapedData[scrapedField]) {
            // Special handling for amenities - merge instead of replace
            if (
              actualField === "amenities" &&
              Array.isArray(scrapedData[scrapedField])
            ) {
              const existingAmenities = village.amenities || [];
              const scrapedAmenities =
                scrapedData[scrapedField];
              // Merge and deduplicate
              updates[actualField] = [
                ...new Set([
                  ...existingAmenities,
                  ...scrapedAmenities,
                ]),
              ];
            } else {
              updates[actualField] = scrapedData[scrapedField];
            }
          }
        }
      } else {
        // Approve all fields if none specified
        for (const [
          scrapedField,
          actualField,
        ] of Object.entries(fieldMapping)) {
          if (scrapedData[scrapedField]) {
            // Special handling for amenities - merge instead of replace
            if (
              actualField === "amenities" &&
              Array.isArray(scrapedData[scrapedField])
            ) {
              const existingAmenities = village.amenities || [];
              const scrapedAmenities =
                scrapedData[scrapedField];
              // Merge and deduplicate
              updates[actualField] = [
                ...new Set([
                  ...existingAmenities,
                  ...scrapedAmenities,
                ]),
              ];
            } else {
              updates[actualField] = scrapedData[scrapedField];
            }
          }
        }
      }

      // Mark as verified and clear scraped data
      updates.verified = true;
      updates.scraped_data = null;

      const { data, error: updateError } = await supabase
        .from("retirement_villages")
        .update(updates)
        .eq("id", villageId)
        .select()
        .single();

      if (updateError) {
        console.error(
          "Error approving scraped data:",
          updateError,
        );
        return c.json(
          {
            error: "Failed to approve scraped data",
            details: updateError.message,
          },
          500,
        );
      }

      return c.json({
        success: true,
        message: "Scraped data approved and merged",
        village: data,
      });
    } catch (error) {
      console.error(
        "Unexpected error approving scraped data:",
        error,
      );
      return c.json(
        {
          error: "Internal server error",
          details: error.message,
        },
        500,
      );
    }
  },
);

/**
 * POST /data-enrichment/reject-scraped-data/:id
 * Reject scraped data for a village
 */
app.post(
  "/make-server-3bba8be8/data-enrichment/reject-scraped-data/:id",
  async (c) => {
    try {
      const supabase = getSupabaseAdmin();
      const villageId = c.req.param("id");

      // Verify admin authentication
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      if (!accessToken) {
        return c.json(
          { error: "Unauthorized - missing access token" },
          401,
        );
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(accessToken);
      if (authError || !user) {
        return c.json(
          { error: "Unauthorized - invalid token" },
          401,
        );
      }

      // Clear scraped data
      const { data, error: updateError } = await supabase
        .from("retirement_villages")
        .update({
          scraped_data: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", villageId)
        .select()
        .single();

      if (updateError) {
        console.error(
          "Error rejecting scraped data:",
          updateError,
        );
        return c.json(
          {
            error: "Failed to reject scraped data",
            details: updateError.message,
          },
          500,
        );
      }

      return c.json({
        success: true,
        message: "Scraped data rejected",
        village: data,
      });
    } catch (error) {
      console.error(
        "Unexpected error rejecting scraped data:",
        error,
      );
      return c.json(
        {
          error: "Internal server error",
          details: error.message,
        },
        500,
      );
    }
  },
);

/**
 * POST /data-enrichment/approve-all-scraped-data
 * Bulk approve all villages with scraped data
 */
app.post(
  "/make-server-3bba8be8/data-enrichment/approve-all-scraped-data",
  async (c) => {
    try {
      const supabase = getSupabaseAdmin();

      // Verify admin authentication
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      if (!accessToken) {
        return c.json(
          { error: "Unauthorized - missing access token" },
          401,
        );
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(accessToken);
      if (authError || !user) {
        return c.json(
          { error: "Unauthorized - invalid token" },
          401,
        );
      }

      // Get optional state filter from request body
      let stateFilter;
      try {
        const body = await c.req.json();
        stateFilter = body.state;
        console.log("🔍 [BACKEND] Bulk approve - received state filter from body:", stateFilter);
      } catch (e) {
        console.log("🔍 [BACKEND] Bulk approve - no body or parse error, proceeding without state filter");
        stateFilter = undefined;
      }

      // Build query with optional state filter
      let query = supabase
        .from("retirement_villages")
        .select("*")
        .not("scraped_data", "is", null);

      // Add state filter if provided
      if (stateFilter && stateFilter !== 'ALL') {
        console.log("🔍 [BACKEND] Bulk approve - applying state filter:", stateFilter);
        query = query.eq("state", stateFilter);
      }

      // Get all villages with scraped data
      const { data: villages, error: fetchError } = await query;

      if (fetchError) {
        console.error(
          "Error fetching villages with scraped data:",
          fetchError,
        );
        return c.json(
          {
            error: "Failed to fetch villages",
            details: fetchError.message,
          },
          500,
        );
      }

      if (!villages || villages.length === 0) {
        return c.json(
          { error: "No villages with scraped data found" },
          404,
        );
      }

      const results = {
        total: villages.length,
        successful: 0,
        failed: 0,
        errors: [],
      };

      // Field mapping
      const fieldMapping: Record<string, string> = {
        scraped_entry_price_min: "entry_price_min",
        scraped_entry_price_max: "entry_price_max",
        scraped_contact_phone: "contact_phone",
        scraped_amenities: "amenities",
        scraped_pet_friendly: "pet_friendly",
        scraped_images: "images",
      };

      // Process each village
      for (const village of villages) {
        try {
          const scrapedData = village.scraped_data as any;
          const updates: any = {
            updated_at: new Date().toISOString(),
            verified: true,
            scraped_data: null,
          };

          // Apply all scraped fields with merge logic for amenities
          for (const [
            scrapedField,
            actualField,
          ] of Object.entries(fieldMapping)) {
            if (scrapedData[scrapedField]) {
              // Special handling for amenities - merge instead of replace
              if (
                actualField === "amenities" &&
                Array.isArray(scrapedData[scrapedField])
              ) {
                const existingAmenities =
                  village.amenities || [];
                const scrapedAmenities =
                  scrapedData[scrapedField];
                // Merge and deduplicate
                updates[actualField] = [
                  ...new Set([
                    ...existingAmenities,
                    ...scrapedAmenities,
                  ]),
                ];
              } else {
                updates[actualField] =
                  scrapedData[scrapedField];
              }
            }
          }

          const { error: updateError } = await supabase
            .from("retirement_villages")
            .update(updates)
            .eq("id", village.id);

          if (updateError) {
            console.error(
              `Error approving scraped data for ${village.name}:`,
              updateError,
            );
            results.failed++;
            results.errors.push({
              villageName: village.name,
              error: updateError.message,
            });
          } else {
            results.successful++;
          }
        } catch (error) {
          console.error(
            `Unexpected error processing ${village.name}:`,
            error,
          );
          results.failed++;
          results.errors.push({
            villageName: village.name,
            error: error.message,
          });
        }
      }

      console.log("Bulk approval complete:", results);

      return c.json({
        success: true,
        message: `Bulk approval complete: ${results.successful} successful, ${results.failed} failed`,
        results,
      });
    } catch (error) {
      console.error(
        "Unexpected error in bulk approval:",
        error,
      );
      return c.json(
        {
          error: "Internal server error",
          details: error.message,
        },
        500,
      );
    }
  },
);

/**
 * GET /data-enrichment/find-duplicates
 * Find duplicate villages (same name + suburb + state)
 */
app.get(
  "/make-server-3bba8be8/data-enrichment/find-duplicates",
  async (c) => {
    try {
      const supabase = getSupabaseAdmin();

      // Verify admin authentication
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      if (!accessToken) {
        return c.json(
          { error: "Unauthorized - missing access token" },
          401,
        );
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(accessToken);
      if (authError || !user) {
        return c.json(
          { error: "Unauthorized - invalid token" },
          401,
        );
      }

      // Get all villages
      const { data: villages, error: fetchError } =
        await supabase
          .from("retirement_villages")
          .select("*")
          .order("name");

      if (fetchError) {
        console.error("Error fetching villages:", fetchError);
        return c.json(
          {
            error: "Failed to fetch villages",
            details: fetchError.message,
          },
          500,
        );
      }

      // Group by name + suburb + state
      const groupedVillages = new Map<string, any[]>();

      for (const village of villages || []) {
        const key =
          `${village.name}|${village.suburb}|${village.state}`.toLowerCase();
        if (!groupedVillages.has(key)) {
          groupedVillages.set(key, []);
        }
        groupedVillages.get(key)!.push(village);
      }

      // Find duplicates (groups with more than 1 village)
      const duplicates = [];
      for (const [key, group] of groupedVillages.entries()) {
        if (group.length > 1) {
          duplicates.push({
            key,
            count: group.length,
            villages: group.map((v) => ({
              id: v.id,
              name: v.name,
              suburb: v.suburb,
              state: v.state,
              operator: v.operator,
              website: v.website,
              created_at: v.created_at,
              has_scraped_data: !!v.scraped_data,
            })),
          });
        }
      }

      return c.json({
        success: true,
        duplicateCount: duplicates.length,
        totalDuplicateVillages: duplicates.reduce(
          (sum, d) => sum + d.count,
          0,
        ),
        duplicates,
      });
    } catch (error) {
      console.error(
        "Unexpected error finding duplicates:",
        error,
      );
      return c.json(
        {
          error: "Internal server error",
          details: error.message,
        },
        500,
      );
    }
  },
);

/**
 * POST /data-enrichment/delete-village/:id
 * Delete a specific village (for removing duplicates)
 */
app.post(
  "/make-server-3bba8be8/data-enrichment/delete-village/:id",
  async (c) => {
    try {
      const supabase = getSupabaseAdmin();
      const villageId = c.req.param("id");

      // Verify admin authentication
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      if (!accessToken) {
        return c.json(
          { error: "Unauthorized - missing access token" },
          401,
        );
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(accessToken);
      if (authError || !user) {
        return c.json(
          { error: "Unauthorized - invalid token" },
          401,
        );
      }

      const { error: deleteError } = await supabase
        .from("retirement_villages")
        .delete()
        .eq("id", villageId);

      if (deleteError) {
        console.error("Error deleting village:", deleteError);
        return c.json(
          {
            error: "Failed to delete village",
            details: deleteError.message,
          },
          500,
        );
      }

      return c.json({
        success: true,
        message: "Village deleted successfully",
      });
    } catch (error) {
      console.error(
        "Unexpected error deleting village:",
        error,
      );
      return c.json(
        {
          error: "Internal server error",
          details: error.message,
        },
        500,
      );
    }
  },
);

/**
 * GET /data-enrichment/multi-location-analysis
 * Analyze websites that serve multiple villages (multi-location operators)
 */
app.get(
  "/make-server-3bba8be8/data-enrichment/multi-location-analysis",
  async (c) => {
    try {
      const supabase = getSupabaseAdmin();

      // Verify admin authentication
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      if (!accessToken) {
        return c.json(
          { error: "Unauthorized - missing access token" },
          401,
        );
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(accessToken);
      if (authError || !user) {
        return c.json(
          { error: "Unauthorized - invalid token" },
          401,
        );
      }

      // Get all villages with websites
      const { data: villages, error: fetchError } =
        await supabase
          .from("retirement_villages")
          .select("*")
          .not("website", "is", null)
          .order("name");

      if (fetchError) {
        console.error("Error fetching villages:", fetchError);
        return c.json(
          {
            error: "Failed to fetch villages",
            details: fetchError.message,
          },
          500,
        );
      }

      // Group by website (normalize URLs)
      const websiteGroups = new Map<string, any[]>();

      for (const village of villages || []) {
        if (!village.website) continue;

        // Normalize website URL (remove protocol, www, trailing slash)
        const normalizedWebsite = village.website
          .toLowerCase()
          .replace(/^https?:\/\//, "")
          .replace(/^www\./, "")
          .replace(/\/$/, "");

        if (!websiteGroups.has(normalizedWebsite)) {
          websiteGroups.set(normalizedWebsite, []);
        }

        websiteGroups.get(normalizedWebsite)!.push({
          id: village.id,
          name: village.name,
          suburb: village.suburb,
          state: village.state,
          operator: village.operator,
          website: village.website,
          has_scraped_data: !!village.scraped_data,
        });
      }

      // Find multi-location operators (websites with multiple villages)
      const multiLocationOperators = [];
      for (const [
        website,
        villageList,
      ] of websiteGroups.entries()) {
        if (villageList.length > 1) {
          multiLocationOperators.push({
            website,
            count: villageList.length,
            villages: villageList,
            operator: villageList[0].operator || "Unknown",
            states: [
              ...new Set(villageList.map((v) => v.state)),
            ],
            suburbs: [
              ...new Set(villageList.map((v) => v.suburb)),
            ],
          });
        }
      }

      // Sort by count (most villages first)
      multiLocationOperators.sort((a, b) => b.count - a.count);

      return c.json({
        success: true,
        totalOperators: multiLocationOperators.length,
        totalVillages: multiLocationOperators.reduce(
          (sum, op) => sum + op.count,
          0,
        ),
        operators: multiLocationOperators,
      });
    } catch (error) {
      console.error(
        "Unexpected error analyzing multi-location operators:",
        error,
      );
      return c.json(
        {
          error: "Internal server error",
          details: error.message,
        },
        500,
      );
    }
  },
);

/**
 * POST /data-enrichment/bulk-delete-duplicates
 * Smart bulk delete: keeps the best village from each duplicate group, deletes the rest
 */
app.post(
  "/make-server-3bba8be8/data-enrichment/bulk-delete-duplicates",
  async (c) => {
    try {
      const supabase = getSupabaseAdmin();

      // Verify admin authentication
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      if (!accessToken) {
        return c.json(
          { error: "Unauthorized - missing access token" },
          401,
        );
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(accessToken);
      if (authError || !user) {
        return c.json(
          { error: "Unauthorized - invalid token" },
          401,
        );
      }

      // Get all villages
      const { data: villages, error: fetchError } =
        await supabase
          .from("retirement_villages")
          .select("*")
          .order("name");

      if (fetchError) {
        console.error("Error fetching villages:", fetchError);
        return c.json(
          {
            error: "Failed to fetch villages",
            details: fetchError.message,
          },
          500,
        );
      }

      // Group by name + suburb + state
      const groupedVillages = new Map<string, any[]>();

      for (const village of villages || []) {
        const key =
          `${village.name}|${village.suburb}|${village.state}`.toLowerCase();
        if (!groupedVillages.has(key)) {
          groupedVillages.set(key, []);
        }
        groupedVillages.get(key)!.push(village);
      }

      // Process each duplicate group
      const results = {
        totalGroups: 0,
        totalDeleted: 0,
        totalKept: 0,
        errors: [] as any[],
        details: [] as any[],
      };

      for (const [key, group] of groupedVillages.entries()) {
        if (group.length <= 1) continue; // Skip non-duplicates

        results.totalGroups++;

        // Score each village to determine which to keep
        const scoredVillages = group.map((village) => {
          let score = 0;

          // Higher score = better data quality
          if (village.website) score += 10;
          if (village.contact_phone) score += 5;
          if (
            village.entry_price_min ||
            village.entry_price_max
          )
            score += 8;
          if (village.amenities && village.amenities.length > 0)
            score += village.amenities.length;
          if (village.operator) score += 3;
          if (village.verified) score += 15; // Verified villages are preferred
          if (!village.scraped_data) score += 20; // Prefer villages without pending scraped data

          // Prefer older villages (they're more likely to be from FOI data)
          const ageInDays =
            (Date.now() -
              new Date(village.created_at).getTime()) /
            (1000 * 60 * 60 * 24);
          if (ageInDays > 7) score += 10;

          return { ...village, score };
        });

        // Sort by score (highest first)
        scoredVillages.sort((a, b) => b.score - a.score);

        // Keep the best one
        const keepVillage = scoredVillages[0];
        const deleteVillages = scoredVillages.slice(1);

        results.totalKept++;

        // Delete the rest
        for (const village of deleteVillages) {
          try {
            const { error: deleteError } = await supabase
              .from("retirement_villages")
              .delete()
              .eq("id", village.id);

            if (deleteError) {
              console.error(
                `Error deleting village ${village.id}:`,
                deleteError,
              );
              results.errors.push({
                villageId: village.id,
                villageName: village.name,
                error: deleteError.message,
              });
            } else {
              results.totalDeleted++;
            }
          } catch (error) {
            console.error(
              `Exception deleting village ${village.id}:`,
              error,
            );
            results.errors.push({
              villageId: village.id,
              villageName: village.name,
              error: error.message,
            });
          }
        }

        results.details.push({
          key,
          kept: {
            id: keepVillage.id,
            name: keepVillage.name,
            suburb: keepVillage.suburb,
            state: keepVillage.state,
            score: keepVillage.score,
          },
          deleted: deleteVillages.map((v) => ({
            id: v.id,
            score: v.score,
          })),
        });
      }

      console.log("Bulk delete duplicates complete:", results);

      return c.json({
        success: true,
        message: `Processed ${results.totalGroups} duplicate groups: kept ${results.totalKept} best villages, deleted ${results.totalDeleted} duplicates`,
        results,
      });
    } catch (error) {
      console.error(
        "Unexpected error bulk deleting duplicates:",
        error,
      );
      return c.json(
        {
          error: "Internal server error",
          details: error.message,
        },
        500,
      );
    }
  },
);

/**
 * POST /data-enrichment/validate-websites
 * Validate all village websites and detect parked domains, 404s, redirects, etc.
 */
app.post(
  "/make-server-3bba8be8/data-enrichment/validate-websites",
  async (c) => {
    try {
      const supabase = getSupabaseAdmin();

      // Verify admin authentication
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      if (!accessToken) {
        return c.json(
          { error: "Unauthorized - missing access token" },
          401,
        );
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(accessToken);
      if (authError || !user) {
        return c.json(
          { error: "Unauthorized - invalid token" },
          401,
        );
      }

      // Get all villages with websites
      const { data: villages, error: fetchError } =
        await supabase
          .from("retirement_villages")
          .select("*")
          .not("website", "is", null)
          .order("name");

      if (fetchError) {
        console.error("Error fetching villages:", fetchError);
        return c.json(
          {
            error: "Failed to fetch villages",
            details: fetchError.message,
          },
          500,
        );
      }

      console.log(
        `Validating ${villages?.length || 0} village websites...`,
      );

      const results = {
        total: villages?.length || 0,
        valid: 0,
        parkedDomain: 0,
        notFound: 0,
        redirect: 0,
        timeout: 0,
        sslError: 0,
        otherError: 0,
        details: [] as any[],
      };

      // Parked domain indicators
      const parkedDomainIndicators = [
        "godaddy",
        "domain for sale",
        "buy this domain",
        "this domain is for sale",
        "parked domain",
        "namecheap",
        "sedo",
        "domain parking",
        "afternic",
        "hugedomains",
        "bodis",
        "parkingcrew",
      ];

      // Validate each website
      for (const village of villages || []) {
        if (!village.website) continue;

        try {
          console.log(
            `Validating: ${village.name} - ${village.website}`,
          );

          const controller = new AbortController();
          const timeoutId = setTimeout(
            () => controller.abort(),
            10000,
          ); // 10 second timeout

          const response = await fetch(village.website, {
            method: "GET",
            signal: controller.signal,
            redirect: "follow",
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
          });

          clearTimeout(timeoutId);

          const html = await response.text();
          const htmlLower = html.toLowerCase();

          // Check for parked domain
          const isParked = parkedDomainIndicators.some(
            (indicator) => htmlLower.includes(indicator),
          );

          if (isParked) {
            results.parkedDomain++;
            results.details.push({
              id: village.id,
              name: village.name,
              suburb: village.suburb,
              state: village.state,
              website: village.website,
              status: "parked_domain",
              statusCode: response.status,
              finalUrl: response.url,
              message:
                "Parked domain or for sale page detected",
            });
          } else if (response.status === 404) {
            results.notFound++;
            results.details.push({
              id: village.id,
              name: village.name,
              suburb: village.suburb,
              state: village.state,
              website: village.website,
              status: "not_found",
              statusCode: 404,
              finalUrl: response.url,
              message: "Page not found (404)",
            });
          } else if (
            response.url !== village.website &&
            !response.url.startsWith(village.website)
          ) {
            // Redirected to a completely different domain
            results.redirect++;
            results.details.push({
              id: village.id,
              name: village.name,
              suburb: village.suburb,
              state: village.state,
              website: village.website,
              status: "redirect",
              statusCode: response.status,
              finalUrl: response.url,
              message: `Redirects to different domain: ${response.url}`,
            });
          } else if (
            response.status >= 200 &&
            response.status < 300
          ) {
            results.valid++;
            // Don't add to details array for valid websites
          } else {
            results.otherError++;
            results.details.push({
              id: village.id,
              name: village.name,
              suburb: village.suburb,
              state: village.state,
              website: village.website,
              status: "error",
              statusCode: response.status,
              finalUrl: response.url,
              message: `HTTP error: ${response.status}`,
            });
          }
        } catch (error) {
          console.error(
            `Error validating ${village.website}:`,
            error,
          );

          if (error.name === "AbortError") {
            results.timeout++;
            results.details.push({
              id: village.id,
              name: village.name,
              suburb: village.suburb,
              state: village.state,
              website: village.website,
              status: "timeout",
              statusCode: null,
              finalUrl: null,
              message: "Request timeout (10s)",
            });
          } else if (
            error.message?.includes("SSL") ||
            error.message?.includes("certificate")
          ) {
            results.sslError++;
            results.details.push({
              id: village.id,
              name: village.name,
              suburb: village.suburb,
              state: village.state,
              website: village.website,
              status: "ssl_error",
              statusCode: null,
              finalUrl: null,
              message: "SSL/Certificate error",
            });
          } else {
            results.otherError++;
            results.details.push({
              id: village.id,
              name: village.name,
              suburb: village.suburb,
              state: village.state,
              website: village.website,
              status: "error",
              statusCode: null,
              finalUrl: null,
              message: error.message || "Unknown error",
            });
          }
        }
      }

      console.log("Website validation complete:", results);

      return c.json({
        success: true,
        results,
      });
    } catch (error) {
      console.error(
        "Unexpected error validating websites:",
        error,
      );
      return c.json(
        {
          error: "Internal server error",
          details: error.message,
        },
        500,
      );
    }
  },
);

/**
 * POST /data-enrichment/clear-invalid-websites
 * Clear (set to null) invalid website URLs based on validation results
 */
app.post(
  "/make-server-3bba8be8/data-enrichment/clear-invalid-websites",
  async (c) => {
    try {
      const supabase = getSupabaseAdmin();

      // Verify admin authentication
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      if (!accessToken) {
        return c.json(
          { error: "Unauthorized - missing access token" },
          401,
        );
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(accessToken);
      if (authError || !user) {
        return c.json(
          { error: "Unauthorized - invalid token" },
          401,
        );
      }

      // Get village IDs to clear from request body
      const { villageIds } = await c.req.json();

      if (
        !villageIds ||
        !Array.isArray(villageIds) ||
        villageIds.length === 0
      ) {
        return c.json(
          { error: "No village IDs provided" },
          400,
        );
      }

      console.log(
        `Clearing websites for ${villageIds.length} villages...`,
      );

      const results = {
        total: villageIds.length,
        successful: 0,
        failed: 0,
        errors: [] as any[],
      };

      // Clear websites for each village
      for (const villageId of villageIds) {
        try {
          const { error: updateError } = await supabase
            .from("retirement_villages")
            .update({ website: null })
            .eq("id", villageId);

          if (updateError) {
            console.error(
              `Error clearing website for village ${villageId}:`,
              updateError,
            );
            results.failed++;
            results.errors.push({
              villageId,
              error: updateError.message,
            });
          } else {
            results.successful++;
          }
        } catch (error) {
          console.error(
            `Exception clearing website for village ${villageId}:`,
            error,
          );
          results.failed++;
          results.errors.push({
            villageId,
            error: error.message,
          });
        }
      }

      console.log("Clear invalid websites complete:", results);

      return c.json({
        success: true,
        message: `Cleared ${results.successful} invalid website URLs`,
        results,
      });
    } catch (error) {
      console.error(
        "Unexpected error clearing invalid websites:",
        error,
      );
      return c.json(
        {
          error: "Internal server error",
          details: error.message,
        },
        500,
      );
    }
  },
);

/**
 * GET /data-enrichment/search-villages
 * Search for villages by name (admin only)
 */
app.get(
  "/make-server-3bba8be8/data-enrichment/search-villages",
  async (c) => {
    try {
      const supabase = getSupabaseAdmin();

      // Verify admin authentication
      const accessToken = c.req.header("Authorization")?.split(" ")[1];
      if (!accessToken) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
      if (authError || !user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const villageName = c.req.query("name");
      const state = c.req.query("state") || "VIC";

      if (!villageName) {
        return c.json({ error: "Missing name parameter" }, 400);
      }

      // Search for villages
      const { data: villages, error: searchError } = await supabase
        .from("retirement_villages")
        .select("id, name, website, state")
        .eq("state", state)
        .ilike("name", `%${villageName}%`);

      if (searchError) {
        console.error("Failed to search villages:", searchError);
        return c.json({ error: "Search failed", details: searchError.message }, 500);
      }

      console.log(`🔍 Found ${villages.length} villages matching "${villageName}"`);

      return c.json({
        success: true,
        villages: villages,
      });
    } catch (error) {
      console.error("Error searching villages:", error);
      return c.json(
        { error: "Internal server error", details: error.message },
        500
      );
    }
  }
);

/**
 * POST /data-enrichment/update-village-url
 * Update a village's website URL (admin only)
 */
app.post(
  "/make-server-3bba8be8/data-enrichment/update-village-url",
  async (c) => {
    try {
      const supabase = getSupabaseAdmin();

      // Verify admin authentication
      const accessToken = c.req.header("Authorization")?.split(" ")[1];
      if (!accessToken) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
      if (authError || !user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { villageId, newUrl } = await c.req.json();

      if (!villageId || !newUrl) {
        return c.json({ error: "Missing villageId or newUrl" }, 400);
      }

      // Validate URL format
      if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
        return c.json({ error: "URL must start with http:// or https://" }, 400);
      }

      // Update the village
      const { data: village, error: updateError } = await supabase
        .from("retirement_villages")
        .update({
          website: newUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", villageId)
        .select()
        .single();

      if (updateError) {
        console.error("Failed to update village URL:", updateError);
        return c.json({ error: "Failed to update village", details: updateError.message }, 500);
      }

      console.log(`✅ Updated village ${village.name} URL to: ${newUrl}`);

      return c.json({
        success: true,
        village: {
          id: village.id,
          name: village.name,
          website: village.website,
        },
      });
    } catch (error) {
      console.error("Error updating village URL:", error);
      return c.json(
        { error: "Internal server error", details: error.message },
        500
      );
    }
  }
);

/**
 * POST /data-enrichment/update-village-name-and-url
 * Update a village's name AND website URL (admin only)
 */
app.post(
  "/make-server-3bba8be8/data-enrichment/update-village-name-and-url",
  async (c) => {
    try {
      const supabase = getSupabaseAdmin();

      // Verify admin authentication
      const accessToken = c.req.header("Authorization")?.split(" ")[1];
      if (!accessToken) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
      if (authError || !user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { villageId, newName, newUrl } = await c.req.json();

      if (!villageId) {
        return c.json({ error: "Missing villageId" }, 400);
      }

      // Build update object
      const updates: any = {
        updated_at: new Date().toISOString(),
      };

      if (newName) {
        updates.name = newName;
      }

      if (newUrl) {
        // Validate URL format
        if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
          return c.json({ error: "URL must start with http:// or https://" }, 400);
        }
        updates.website = newUrl;
      }

      // Update the village
      const { data: village, error: updateError } = await supabase
        .from("retirement_villages")
        .update(updates)
        .eq("id", villageId)
        .select()
        .single();

      if (updateError) {
        console.error("Failed to update village:", updateError);
        return c.json({ error: "Failed to update village", details: updateError.message }, 500);
      }

      console.log(`✅ Updated village ${village.name}`);
      if (newName) console.log(`   - Name: ${newName}`);
      if (newUrl) console.log(`   - URL: ${newUrl}`);

      return c.json({
        success: true,
        village: {
          id: village.id,
          name: village.name,
          website: village.website,
        },
      });
    } catch (error) {
      console.error("Error updating village:", error);
      return c.json(
        { error: "Internal server error", details: error.message },
        500
      );
    }
  }
);

export default app;