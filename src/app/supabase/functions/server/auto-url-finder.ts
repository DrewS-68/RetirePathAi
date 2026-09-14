import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Known listing/directory sites to filter out
const BAD_DOMAINS = [
  'agedcareonline.com.au',
  'retirementlivingonline.com.au',
  'agedcareview.com.au',
  'agedcarequality.gov.au',
  'downsizing.com.au',
  'myagedcare.gov.au',
  'theurbandeveloper.com',
  'hougarden.com.au',
  'domain.com.au',
  'realestate.com.au',
  'listingloop.com.au',
  'propertyloop.com.au',
  'homely.com.au',
  'onthehouse.com.au',
  'realcommercial.com.au',
  'villages.com.au',
  'caringco.com.au',
  'ergonomics.com.au',
  'cdnews.com.au',
  'australianageingagenda.com.au',
  'aged-care.com.au',
  'architectureanddesign.com.au',
  'propertynoise.com.au',
  'news.com.au',
  'abc.net.au',
  'smh.com.au',
  'theage.com.au',
  'mapquest.com',
  'google.co',
  'google.com',
  'maps.google',
  'facebook.com',
  'linkedin.com',
  'twitter.com',
  'instagram.com',
  'youtube.com',
  'wikipedia.org',
  'wikidata.org',
];

// Extract URLs from Google search results HTML
function extractUrlsFromHtml(html: string): string[] {
  const urls: string[] = [];
  
  // Match Google search result URLs (simplified regex)
  // Google wraps URLs in various ways, but we'll look for actual href links
  const urlRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
  
  let match;
  while ((match = urlRegex.exec(html)) !== null) {
    const url = match[1];
    
    // Skip Google's internal links
    if (url.startsWith('/') || url.includes('google.com')) {
      continue;
    }
    
    // Try to extract the actual URL from Google's redirect
    try {
      if (url.includes('url?q=')) {
        const urlObj = new URL(url);
        const actualUrl = urlObj.searchParams.get('q');
        if (actualUrl) {
          urls.push(actualUrl);
        }
      } else if (url.startsWith('http')) {
        urls.push(url);
      }
    } catch {
      // Invalid URL, skip
    }
  }
  
  return urls;
}

// Check if a URL is from a bad domain
function isBadDomain(url: string): boolean {
  const urlLower = url.toLowerCase();
  
  // Filter out bad domains
  if (BAD_DOMAINS.some(domain => urlLower.includes(domain))) {
    return true;
  }
  
  // Filter out PDF files
  if (urlLower.endsWith('.pdf')) {
    return true;
  }
  
  return false;
}

// Find the best URL for a village
async function findVillageUrl(villageName: string): Promise<{ url: string | null; confidence: string; allUrls: string[] }> {
  const MAX_RETRIES = 3;
  const INITIAL_BACKOFF_MS = 2000; // Start with 2 seconds
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const scraperApiKey = Deno.env.get('SCRAPERAPI_KEY');
      
      if (!scraperApiKey) {
        throw new Error('SCRAPERAPI_KEY environment variable not set');
      }
      
      // Build Google search query
      const query = `"${villageName}" retirement village Victoria site:.com.au`;
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=20`;
      
      console.log(`🔍 Searching Google for: ${query} (Attempt ${attempt}/${MAX_RETRIES})`);
      
      // Use ScraperAPI to fetch Google search results - remove premium parameter to avoid issues
      const scraperUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(searchUrl)}&render=false`;
      
      // Add timeout with AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(scraperUrl, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ ScraperAPI error (attempt ${attempt}/${MAX_RETRIES}): ${response.status} - ${errorText.substring(0, 200)}`);
        
        // If it's a 500 error and we have retries left, wait and retry
        if (response.status >= 500 && attempt < MAX_RETRIES) {
          const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`⏳ Waiting ${backoffMs}before retry...`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
          continue; // Retry
        }
        
        // If it's a 429 (rate limit), wait longer
        if (response.status === 429 && attempt < MAX_RETRIES) {
          const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt); // Longer backoff for rate limits
          console.log(`⏳ Rate limited! Waiting ${backoffMs}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
          continue; // Retry
        }
        
        throw new Error(`ScraperAPI returned ${response.status}: ${errorText.substring(0, 200)}`);
      }
      
      const html = await response.text();
      console.log(`📄 Got ${html.length} chars of HTML from Google`);
      
      // Extract URLs from the HTML
      const foundUrls = extractUrlsFromHtml(html);
      console.log(`📊 Found ${foundUrls.length} total URLs from search results`);
      
      // 🐛 DEBUG: Show ALL extracted URLs before filtering
      if (foundUrls.length > 0) {
        console.log(`🔍 RAW URLs extracted from Google:`);
        foundUrls.slice(0, 10).forEach((url, i) => console.log(`   ${i + 1}. ${url}`));
      } else {
        console.log(`⚠️  WARNING: No URLs extracted from Google HTML!`);
      }
      
      // Filter out bad domains
      const goodUrls = foundUrls.filter(url => !isBadDomain(url));
      console.log(`✅ Filtered to ${goodUrls.length} good URLs`);
      
      // Log which URLs were filtered out
      const filteredOut = foundUrls.filter(url => isBadDomain(url));
      if (filteredOut.length > 0) {
        console.log(`🚫 Filtered out ${filteredOut.length} listing site URLs:`, filteredOut.slice(0, 3));
      }
      
      if (goodUrls.length === 0) {
        // Don't return bad URLs as alternatives!
        return { url: null, confidence: 'none', allUrls: [] };
      }
      
      // Return the first good URL with confidence level
      let confidence = 'low';
      
      const firstUrl = goodUrls[0].toLowerCase();
      const villageNameNormalized = villageName.toLowerCase()
        .replace(/retirement village/gi, '')
        .replace(/aged care/gi, '')
        .trim();
      
      // High confidence if village name appears in URL
      if (firstUrl.includes(villageNameNormalized.replace(/\s+/g, '-')) ||
          firstUrl.includes(villageNameNormalized.replace(/\s+/g, ''))) {
        confidence = 'high';
      } else if (goodUrls.length >= 2) {
        confidence = 'medium';
      }
      
      return { 
        url: goodUrls[0], 
        confidence,
        allUrls: goodUrls.slice(0, 5)
      };
      
    } catch (error: any) {
      // If it's the last attempt, throw the error
      if (attempt === MAX_RETRIES) {
        console.error(`❌ Final attempt failed for ${villageName}:`, error.message);
        throw error;
      }
      
      // If it's a timeout error, retry
      if (error.name === 'AbortError') {
        const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
        console.log(`⏳ Timeout! Waiting ${backoffMs}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        continue; // Retry
      }
      
      // For other errors, log and retry
      console.error(`⚠️ Attempt ${attempt}/${MAX_RETRIES} failed:`, error.message);
      const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }
  
  // Should never reach here
  throw new Error('All retry attempts exhausted');
}

// Auto-find URL for a single village
app.post('/make-server-3bba8be8/auto-find-url', async (c) => {
  try {
    const { villageName } = await c.req.json();
    
    if (!villageName) {
      return c.json({ error: 'Village name is required' }, 400);
    }
    
    console.log(`🔍 Auto-finding URL for: ${villageName}`);
    
    const result = await findVillageUrl(villageName);
    
    return c.json({
      villageName,
      suggestedUrl: result.url,
      confidence: result.confidence,
      alternativeUrls: result.allUrls
    });
    
  } catch (error: any) {
    console.error('Error in auto-find-url:', error);
    return c.json({ 
      error: error.message || 'Failed to find URL',
      details: error.toString()
    }, 500);
  }
});

// Batch auto-find URLs for multiple villages
app.post('/make-server-3bba8be8/auto-find-urls-batch', async (c) => {
  try {
    const { villageIds } = await c.req.json();
    
    if (!Array.isArray(villageIds) || villageIds.length === 0) {
      return c.json({ error: 'Village IDs array is required' }, 400);
    }
    
    console.log(`🔍 Batch auto-finding URLs for ${villageIds.length} villages`);
    
    // Fetch village details
    const { data: villages, error: fetchError } = await supabase
      .from('retirement_villages')
      .select('id, name')
      .in('id', villageIds);
    
    if (fetchError) {
      throw new Error(`Database error: ${fetchError.message}`);
    }
    
    if (!villages || villages.length === 0) {
      return c.json({ error: 'No villages found' }, 404);
    }
    
    const results = [];
    
    // Process each village (with delay to avoid rate limiting)
    for (let i = 0; i < villages.length; i++) {
      const village = villages[i];
      
      try {
        console.log(`📍 Processing ${i + 1}/${villages.length}: ${village.name}`);
        
        const result = await findVillageUrl(village.name);
        
        results.push({
          id: village.id,
          name: village.name,
          suggestedUrl: result.url,
          confidence: result.confidence,
          alternativeUrls: result.allUrls,
          status: result.url ? 'found' : 'not_found'
        });
        
        // Add delay between requests (2 seconds)
        if (i < villages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error: any) {
        console.error(`❌ Failed for ${village.name}:`, error);
        
        results.push({
          id: village.id,
          name: village.name,
          suggestedUrl: null,
          confidence: 'error',
          alternativeUrls: [],
          status: 'error',
          error: error.message
        });
      }
    }
    
    const summary = {
      total: results.length,
      found: results.filter(r => r.status === 'found').length,
      notFound: results.filter(r => r.status === 'not_found').length,
      errors: results.filter(r => r.status === 'error').length
    };
    
    console.log(`✅ Batch complete:`, summary);
    
    return c.json({
      summary,
      results
    });
    
  } catch (error: any) {
    console.error('Error in auto-find-urls-batch:', error);
    return c.json({ 
      error: error.message || 'Failed to batch find URLs',
      details: error.toString()
    }, 500);
  }
});

// Save auto-found URLs to database
app.post('/make-server-3bba8be8/save-auto-found-urls', async (c) => {
  try {
    const { updates } = await c.req.json();
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return c.json({ error: 'Updates array is required' }, 400);
    }
    
    console.log(`💾 Saving ${updates.length} URL updates`);
    
    let updated = 0;
    let failed = 0;
    
    for (const update of updates) {
      const { id, url } = update;
      
      if (!id || !url) {
        console.error(`❌ Invalid update:`, update);
        failed++;
        continue;
      }
      
      const { error: updateError } = await supabase
        .from('retirement_villages')
        .update({ website: url })
        .eq('id', id);
      
      if (updateError) {
        console.error(`❌ Failed to update village ${id}:`, updateError.message);
        failed++;
      } else {
        console.log(`✅ Updated village ${id}`);
        updated++;
      }
    }
    
    return c.json({
      success: true,
      updated,
      failed,
      total: updates.length
    });
    
  } catch (error: any) {
    console.error('Error in save-auto-found-urls:', error);
    return c.json({ 
      error: error.message || 'Failed to save URLs',
      details: error.toString()
    }, 500);
  }
});

export default app;