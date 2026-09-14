/**
 * V2: Improved Google search with multi-strategy approach
 * Tries to find SPECIFIC village page first, then falls back to operator homepage
 */

export async function findVillageWebsiteV2(village: any, scraperApiKey: string) {
  console.log(`\n🔍 === SEARCHING FOR: ${village.name} (${village.suburb}) ===`);
  
  // Define search strategies in priority order
  const searchStrategies = [];
  
  if (village.operator) {
    // STRATEGY 1: Find specific village page with operator context (BEST!)
    searchStrategies.push({
      query: `"${village.name}" ${village.suburb} ${village.operator} retirement village`,
      name: 'SPECIFIC_VILLAGE_PAGE',
      description: 'Specific village page with operator',
      priority: 1
    });
    
    // STRATEGY 2: Operator homepage (FALLBACK)
    searchStrategies.push({
      query: `${village.operator} retirement villages`,
      name: 'OPERATOR_HOMEPAGE',
      description: 'Operator homepage',
      priority: 2
    });
  } else {
    // No operator: Search for village directly
    searchStrategies.push({
      query: `"${village.name}" ${village.suburb} ${village.state} retirement village`,
      name: 'VILLAGE_DIRECT',
      description: 'Village search without operator',
      priority: 1
    });
  }
  
  // Blacklist of aggregator sites
  const aggregatorSites = [
    'agedcareonline.com.au',
    'agedcarequality.gov.au',
    'myagedcare.gov.au',
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
    // ⚡ NEW: More aggregators and listing sites from error log
    'startlocal.com.au',
    'localsearch.com.au',
    'dailycare.com.au',
    'reiwa.com.au',  // Real Estate Institute WA
    'propertyreporter.com.au',
    'weeklytimesnow.com.au',
    'adelaidenow.com.au',
    'streetnews.com.au',
    'gjgardner.com.au',  // Home builder
    'aussie.com.au',  // Finance/property
    'plre.com.au',  // Property listing
    'gaponly.com.au',  // Vet clinics
    'buildadvisor.com.au',  // Building site
    'sjcre.com.au',  // Real estate
    'history.lakemac.com.au',  // Local history site
  ];
  
  // Try each strategy
  for (const strategy of searchStrategies) {
    console.log(`\n🎯 Strategy ${strategy.priority}: ${strategy.name}`);
    console.log(`   Query: "${strategy.query}"`);
    
    try {
      // Search Google via ScraperAPI with retry logic
      const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(strategy.query)}`;
      const scraperUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(googleSearchUrl)}`;
      
      let response;
      let retryCount = 0;
      const maxRetries = 2;
      
      while (retryCount <= maxRetries) {
        try {
          response = await fetch(scraperUrl, {
            signal: AbortSignal.timeout(60000) // Increased from 30s to 60s
          });
          
          if (response.ok) {
            break; // Success!
          }
          
          console.log(`   ❌ Search failed: ${response.status}, retry ${retryCount + 1}/${maxRetries}`);
          retryCount++;
          
          if (retryCount <= maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s before retry
          }
        } catch (fetchError: any) {
          if (fetchError.name === 'TimeoutError' || fetchError.message?.includes('timed out')) {
            console.log(`   ⏱️  Timeout on attempt ${retryCount + 1}/${maxRetries + 1}`);
            retryCount++;
            
            if (retryCount <= maxRetries) {
              console.log(`   🔄 Waiting 10 seconds before retry...`);
              await new Promise(resolve => setTimeout(resolve, 10000)); // Wait longer for timeouts
            } else {
              throw new Error('Search timed out after 3 attempts');
            }
          } else {
            throw fetchError; // Re-throw non-timeout errors
          }
        }
      }
      
      if (!response || !response.ok) {
        console.log(`   ❌ Search failed after ${maxRetries + 1} attempts`);
        continue;
      }
      
      const html = await response.text();
      console.log(`   📄 Got ${html.length} chars of HTML`);
      
      // Extract URLs
      const urls = extractUrlsFromGoogle(html);
      console.log(`   📄 Found ${urls.length} URLs in Google HTML`);
      
      // 🐛 DEBUG: Show ALL extracted URLs before filtering
      if (urls.length > 0) {
        console.log(`   🔍 RAW URLs extracted:`);
        urls.slice(0, 10).forEach((url, i) => console.log(`      ${i + 1}. ${url}`));
      } else {
        console.log(`   ⚠️  WARNING: No URLs extracted from Google HTML! This means:`);
        console.log(`      • Google returned unexpected HTML format`);
        console.log(`      • Our regex patterns couldn't find any links`);
        console.log(`   💡 Consider manually checking ScraperAPI response format`);
      }
      
      if (urls.length === 0) {
        console.log(`   ⚠️  No URLs found, trying next strategy...`);
        continue;
      }
      
      // Filter and prioritize URLs
      const validUrls = [];
      
      for (const url of urls) {
        // Skip unwanted domains
        if (isUnwantedUrl(url)) {
          continue;
        }
        
        // Skip aggregators
        if (aggregatorSites.some(agg => url.includes(agg))) {
          console.log(`   📂 Skipping aggregator: ${url}`);
          continue;
        }
        
        validUrls.push(url);
        console.log(`   🌐 Valid URL: ${url}`);
      }
      
      if (validUrls.length === 0) {
        console.log(`   ⚠️  No valid URLs found, trying next strategy...`);
        continue;
      }
      
      // PRIORITIZATION LOGIC
      let selectedUrl = null;
      
      // For specific village page searches: Prefer URLs with village/location keywords in path
      if (strategy.priority === 1 && village.operator) {
        // Look for URLs that contain village name or suburb in the path
        const villageName = village.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const suburb = village.suburb.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        for (const url of validUrls) {
          const urlLower = url.toLowerCase();
          const path = urlLower.split('/').slice(3).join('/'); // Get path after domain
          
          if (path.includes(villageName) || path.includes(suburb) || path.includes('villages/')) {
            selectedUrl = url;
            console.log(`   ✅ FOUND SPECIFIC PAGE: ${url}`);
            break;
          }
        }
      }
      
      // If no specific page found, take first valid URL
      if (!selectedUrl && validUrls.length > 0) {
        selectedUrl = validUrls[0];
        console.log(`   ✅ Selected first valid URL: ${selectedUrl}`);
      }
      
      if (selectedUrl) {
        return {
          villageId: village.id,
          villageName: village.name,
          suburb: village.suburb,
          state: village.state,
          status: 'found',
          website: selectedUrl,
          websiteType: 'official',
          searchStrategy: strategy.name,
        };
      }
      
    } catch (error: any) {
      console.error(`   ❌ Error with strategy "${strategy.name}":`, error.message);
      continue;
    }
  }
  
  // No website found with any strategy
  console.log(`\n❌ No website found for ${village.name} after trying all strategies`);
  return {
    villageId: village.id,
    villageName: village.name,
    suburb: village.suburb,
    state: village.state,
    status: 'not_found',
    error: 'No website found in search results',
  };
}

function extractUrlsFromGoogle(html: string): string[] {
  const patterns = [
    /<a href="\/url\?q=(https?:\/\/[^&"]+)/gi,
    /<a[^>]+href="(https?:\/\/[^"]+)"/gi,
    /data-href="(https?:\/\/[^"]+)"/gi,
  ];
  
  const urls = new Set<string>();
  for (const pattern of patterns) {
    const matches = [...html.matchAll(pattern)];
    matches.forEach(m => {
      if (m[1]) {
        try {
          urls.add(decodeURIComponent(m[1]));
        } catch (e) {
          // Skip malformed URLs
        }
      }
    });
  }
  
  return Array.from(urls);
}

function isUnwantedUrl(url: string): boolean {
  const unwantedPatterns = [
    'google.',
    'gstatic.com',
    'facebook.com',
    'youtube.com',
    'twitter.com',
    'instagram.com',
    'linkedin.com',
    '/search?',
    '/url?q=',
    'accounts.google',
    'support.google',
    // ⚡ NEW: Reject PDFs and documents
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.xml',  // Sitemap files
    // ⚡ NEW: Reject URLs with fragments/anchors (often generic listing pages)
    '#:~:text=',
    // ⚡ NEW: Reject generic property listing sites
    'property.com.au',
    'realestate.com.au',
    'domain.com.au',
    'onthehouse.com.au',
    // ⚡ NEW: Reject news sites
    'heraldsun.com.au',
    // ⚡ NEW: Reject generic directories
    'awisemove.com.au',
    'laterlifeadvice.com.au',
    'jwire.com.au',
    'cdnews.com.au',
    'anytimefitness.com.au',
    'img.seniorshousingonline.com.au',
    'acg-staging.dps.com.au',
  ];
  
  return unwantedPatterns.some(pattern => url.toLowerCase().includes(pattern));
}