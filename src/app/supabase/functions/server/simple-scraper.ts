import { Hono } from "npm:hono";

const app = new Hono();

// Simple HTML fetching function
async function fetchHtml(url: string): Promise<string> {
  const scraperApiKey = Deno.env.get('SCRAPERAPI_KEY');
  
  // Try ScraperAPI first if available
  if (scraperApiKey) {
    try {
      const scraperUrl = `https://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(url)}&render=false`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(scraperUrl, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const html = await response.text();
        console.log(`✅ ScraperAPI fetched ${url} (${html.length} bytes)`);
        return html;
      } else {
        console.warn(`⚠️ ScraperAPI returned ${response.status} for ${url} - falling back to direct fetch`);
      }
    } catch (err) {
      console.warn(`⚠️ ScraperAPI error for ${url}: ${err instanceof Error ? err.message : 'Unknown'} - falling back`);
    }
  }
  
  // Fallback to direct fetch
  console.log(`🔄 Using direct fetch for ${url}...`);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log(`✅ Direct fetch success for ${url} (${html.length} bytes)`);
    return html;
  } catch (err) {
    clearTimeout(timeoutId);
    throw new Error(`Failed to fetch ${url}: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

// POST /make-server-3bba8be8/scrape-website - Simple HTML scraper
app.post('/make-server-3bba8be8/scrape-website', async (c) => {
  try {
    const { url } = await c.req.json();
    
    if (!url) {
      return c.json({ error: 'URL is required' }, 400);
    }
    
    console.log(`🌐 Scraping: ${url}`);
    
    const html = await fetchHtml(url);
    
    return c.json({
      success: true,
      url,
      html,
      length: html.length,
    });
    
  } catch (err: any) {
    console.error('❌ Scraping error:', err);
    return c.json({
      error: 'Scraping failed',
      details: err.message,
    }, 500);
  }
});

export default app;
