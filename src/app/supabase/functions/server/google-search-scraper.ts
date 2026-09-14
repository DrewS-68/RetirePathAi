import { Hono } from "npm:hono";
import { DOMParser } from "jsr:@b-fuze/deno-dom@0.1.48";

const app = new Hono();

// Domain blacklist - aggregator sites to ignore
const BLACKLIST = [
  // Property aggregators & real estate sites
  'realestate.com.au',
  'domain.com.au',
  'property.com.au',
  'realcommercial.com.au',
  'yourinvestmentpropertymag.com.au',
  'homely.com.au',
  'propertyvalue.com.au',
  'harcourts.net',
  'gjgardner.com.au',
  'bhhscoastalrealtors.com',
  'youngsandco.com.au',
  'maxbrown.com.au',
  'ratemyagent.com.au',
  'jelliscraig.com.au',
  'moullmurray.com',
  'roost.com.au',
  'view.com.au',
  
  // Aged care directories & aggregators
  'villages.com.au',
  'agedcareonline.com.au',
  'agedcare101.com.au',
  'agedcarequality.gov.au',
  'agedcareview.com.au',
  'awisemove.com.au',
  'agedcareguide.com.au',
  'retirementlivingonline.com.au',
  'downsizing.com.au',
  'australianretirementvillages.com.au',
  'retirementliving.org.au',
  'retirementaustralialiving.com.au',
  'seniorshousingonline.com.au',
  'myagedcare.gov.au',
  'gen-agedcaredata.gov.au',
  'agedcaremadeeasy.com.au',
  'tricare.com.au',
  'caringco.com.au',
  'agedcarefind.com.au',
  'dailycare.com.au',
  
  // Social media & major platforms
  'google.com',
  'facebook.com',
  'instagram.com',
  'linkedin.com',
  'wikipedia.org',
  'tripadvisor.com',
  'youtube.com',
  
  // Business directories & listings
  'yellowpages.com.au',
  'whitepages.com.au',
  'hougarden.com',
  'creditorwatch.com.au',
  'acnc.gov.au',
  'streetnews.com.au',
  'aussie.com.au',
  'realsearch.com.au',
  'chalmer.com.au',
  'aussieweb.com.au',
  'yelp.com',
  'bizly.com.au',
  'infoisinfo-au.com',
  'zoominfo.com',
  'cylex-australia.com',
  'my-community.com',
  'parkopedia.com.au',
  'abr.business.gov.au',
  'dlook.com.au',
  'simplyregional.com.au',
  'australianplanet.com',
  'chinesebusinessguide.com.au',
  'touristplaces.com.au',
  'localista.com.au',
  'editorials.localista.com.au',
  
  // Government & council sites
  'slv.vic.gov.au',
  'find.slv.vic.gov.au',
  'transport.vic.gov.au',
  'asx.com.au',
  'aph.gov.au',
  'communitygrants.gov.au',
  'gazette.vic.gov.au',
  'knox.vic.gov.au',
  'southgippsland.vic.gov.au',
  'centralgoldfields.vic.gov.au',
  'greatershepparton.com.au',
  
  // Maps & location services
  'mapquest.com',
  'whereis.com',
  'moovitapp.com',
  'findlatitudeandlongitude.com',
  'mapcarta.com',
  'maptons.com',
  'waze.com',
  'geoview.info',
  'australia-streets.openalfa.com',
  
  // Document & media sites
  'issuu.com',
  'yumpu.com',
  'prezi.com',
  'shutterstock.com',
  'newspapers.com',
  
  // Archives & libraries
  'paperspast.natlib.govt.nz',
  'trove.nla.gov.au',
  'victoriancollections.net.au',
  
  // Other
  'beenverified.com',
  'chamberofcommerce.com',
  'reviews.birdeye.com',
  'donatehq.com.au',
  'warrandyte.org.au',
  'sandbox.haaa.com.au',
  'dgas.org.au',
  'mrra.asn.au',
  'acncpubfilesprodstorage.blob.core.windows.net',
  'sa-venues.com',
  'victoriashighcountry.com.au',
  'changepath.com.au',
  'bnaibrith.org.au',
  'andrews.edu',
  'warrandytediary.com.au',
  'blairsmith.com.au',
  'mallacoota.org.au',
  'afr.com.au',
  'newly.com.au',
  'singaustralia.com.au'
];

/**
 * ScraperAPI Google Search Endpoint
 * Uses ScraperAPI to fetch Google search results
 */
app.post("/make-server-3bba8be8/scrape-google-search", async (c) => {
  try {
    const body = await c.req.json();
    const { url, villageName, suburb, operator } = body;

    if (!url) {
      return c.json({ error: 'Missing url parameter' }, 400);
    }

    const scraperApiKey = Deno.env.get('SCRAPERAPI_KEY');
    if (!scraperApiKey) {
      return c.json({ error: 'ScraperAPI key not configured' }, 500);
    }

    console.log(`🔍 Scraping Google for: ${villageName} (${suburb})`);
    console.log(`   Query URL: ${url}`);

    let results: Array<{ title: string; url: string; snippet: string }> = [];

    // Try Method 1: ScraperAPI Structured Endpoint (if available)
    try {
      const searchQuery = `"${villageName}" ${suburb} VIC retirement village`;
      const structuredUrl = `https://api.scraperapi.com/structured/google/search?api_key=${scraperApiKey}&query=${encodeURIComponent(searchQuery)}&country=au&num=10`;
      
      console.log(`   🌐 Method 1: Trying ScraperAPI Structured Endpoint`);
      const response = await fetch(structuredUrl);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Got structured JSON (${JSON.stringify(data).length} chars)`);
        results = extractFromStructuredJSON(data);
        
        if (results.length > 0) {
          console.log(`   ✅ Structured API returned ${results.length} results`);
        } else {
          console.log(`   ⚠️ Structured API returned no results, trying raw HTML...`);
        }
      } else {
        console.log(`   ⚠️ Structured API failed (${response.status}), trying raw HTML...`);
      }
    } catch (e: any) {
      console.log(`   ⚠️ Structured API error: ${e.message}, trying raw HTML...`);
    }

    // Try Method 2: Raw HTML Scraping (fallback)
    if (results.length === 0) {
      try {
        console.log(`   🌐 Method 2: Trying raw HTML scraping`);
        const rawUrl = `https://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(url)}&country_code=au`;
        const response = await fetch(rawUrl);
        
        if (response.ok) {
          const html = await response.text();
          console.log(`   ✅ Got ${html.length} chars of HTML`);
          
          // Check if we got a valid Google results page
          if (html.includes('SearchResultsPage') || html.includes('search?q=')) {
            results = extractFromHTML(html);
            console.log(`   ✅ HTML scraping returned ${results.length} results`);
          } else {
            console.log(`   ⚠️ HTML doesn't look like Google results (might be captcha)`);
          }
        } else {
          console.log(`   ❌ Raw HTML request failed: ${response.status}`);
        }
      } catch (e: any) {
        console.log(`   ❌ HTML scraping error: ${e.message}`);
      }
    }

    // If still no results, return failure
    if (results.length === 0) {
      return c.json({ 
        success: false,
        message: 'No organic results found from any method',
        confidence: 0
      });
    }

    console.log(`   📊 Total extracted: ${results.length} organic results`);

    // Filter out blacklisted domains
    const filteredResults = results.filter(result => {
      try {
        const domain = new URL(result.url).hostname.replace('www.', '');
        // Check if domain EXACTLY MATCHES or ENDS WITH blacklisted domain
        // This prevents false positives like "basscare.org.au" matching "care"
        const isBlacklisted = BLACKLIST.some(bl => {
          if (domain === bl) return true; // Exact match
          if (domain.endsWith('.' + bl)) return true; // Subdomain match
          return false;
        });
        if (isBlacklisted) {
          console.log(`   ⛔ Blacklisted: ${domain}`);
        }
        return !isBlacklisted;
      } catch (e) {
        return false;
      }
    });

    console.log(`   ✅ ${filteredResults.length} results after blacklist filter`);

    if (filteredResults.length === 0) {
      return c.json({ 
        success: false,
        message: 'All results were blacklisted',
        confidence: 0
      });
    }

    // Score results based on relevance
    const scored = filteredResults.map(result => {
      let score = 0;
      const titleLower = result.title.toLowerCase();
      const urlLower = result.url.toLowerCase();
      const snippetLower = result.snippet.toLowerCase();
      const villageLower = villageName.toLowerCase();
      const suburbLower = suburb.toLowerCase();

      // Extract key words from village name for partial matching
      const villageWords = villageLower.split(/\s+/).filter(w => w.length > 3);

      // Title matching (most important)
      if (titleLower.includes(villageLower)) score += 50; // Full match
      villageWords.forEach(word => {
        if (titleLower.includes(word)) score += 10; // Partial word match
      });
      if (titleLower.includes(suburbLower)) score += 25;
      
      // URL matching
      if (urlLower.includes(villageLower.replace(/\s+/g, ''))) score += 40;
      if (urlLower.includes(villageLower.replace(/\s+/g, '-'))) score += 35;
      villageWords.forEach(word => {
        if (urlLower.includes(word)) score += 8;
      });
      
      // Snippet matching
      if (snippetLower.includes(villageLower)) score += 20;
      if (snippetLower.includes(suburbLower)) score += 15;

      // Operator matching - CRITICAL: If operator exists, URL MUST match it!
      let operatorMatched = false;
      if (operator) {
        const operatorLower = operator.toLowerCase();
        const operatorWords = operatorLower.split(/\s+/).filter(w => w.length > 3);
        
        // Check if ANY operator word appears in title or URL
        const operatorInTitle = operatorWords.some(word => titleLower.includes(word));
        const operatorInUrl = operatorWords.some(word => urlLower.includes(word.replace(/\s+/g, '')));
        const operatorInSnippet = operatorWords.some(word => snippetLower.includes(word));
        
        operatorMatched = operatorInTitle || operatorInUrl || operatorInSnippet;
        
        if (operatorMatched) {
          score += 30; // Bonus for matching operator
        } else {
          // REJECT: If operator exists but doesn't match, set score to 0!
          score = 0;
        }
      }

      // Retirement village keywords (important!)
      if (titleLower.includes('retirement') || titleLower.includes('aged care')) score += 15;
      if (urlLower.includes('retirement') || urlLower.includes('aged')) score += 10;

      return {
        ...result,
        confidence: Math.min(score, 100)
      };
    });

    // Sort by confidence (highest first)
    scored.sort((a, b) => b.confidence - a.confidence);

    const bestMatch = scored[0];

    console.log(`   🎯 Best match: ${bestMatch.url} (${bestMatch.confidence}% confidence)`);
    console.log(`   📊 Top 3 matches:`);
    scored.slice(0, 3).forEach((match, i) => {
      console.log(`      ${i + 1}. ${match.url} (${match.confidence}%)`);
    });

    // Lower threshold from 50% to 30% - we're being too strict!
    if (bestMatch.confidence >= 30) {
      return c.json({
        success: true,
        website: bestMatch.url,
        confidence: bestMatch.confidence,
        title: bestMatch.title,
        snippet: bestMatch.snippet,
        allResults: scored.slice(0, 5) // Top 5 for debugging
      });
    } else {
      return c.json({
        success: false,
        message: 'Best match confidence too low',
        confidence: bestMatch.confidence,
        bestMatch: bestMatch.url,
        allResults: scored.slice(0, 3)
      });
    }

  } catch (error: any) {
    console.error(`   ❌ Error: ${error.message}`);
    return c.json({ 
      error: error.message || 'Internal server error' 
    }, 500);
  }
});

/**
 * Extract organic search results from Google JSON
 */
function extractFromStructuredJSON(data: any): Array<{ title: string; url: string; snippet: string }> {
  const results: Array<{ title: string; url: string; snippet: string }> = [];

  try {
    // Method 1: Look for JSON-LD data (most reliable)
    if (data && data.organic_results) {
      data.organic_results.forEach((item: any) => {
        if (item.url && item.title) {
          results.push({
            url: item.url,
            title: item.title,
            snippet: item.snippet || ''
          });
        }
      });
    }

    console.log(`✅ Extracted ${results.length} results using structured data`);
    
  } catch (e: any) {
    console.error(`❌ Error extracting results: ${e.message}`);
  }

  return results;
}

/**
 * Extract organic search results from raw HTML
 */
function extractFromHTML(html: string): Array<{ title: string; url: string; snippet: string }> {
  const results: Array<{ title: string; url: string; snippet: string }> = [];

  try {
    // Parse HTML to find search results
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const searchResults = doc.querySelectorAll('.tF2Cxc');

    searchResults.forEach(result => {
      const titleElement = result.querySelector('.DKV0Md');
      const urlElement = result.querySelector('.yuRUbf a');
      const snippetElement = result.querySelector('.VwiC3b');

      if (titleElement && urlElement && snippetElement) {
        const title = titleElement.textContent || '';
        const url = urlElement.getAttribute('href') || '';
        const snippet = snippetElement.textContent || '';

        results.push({
          title: stripHtml(title),
          url: stripHtml(url),
          snippet: stripHtml(snippet)
        });
      }
    });

    console.log(`✅ Extracted ${results.length} results using raw HTML`);
    
  } catch (e: any) {
    console.error(`❌ Error extracting results: ${e.message}`);
  }

  return results;
}

/**
 * Strip HTML tags and decode entities
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

export default app;