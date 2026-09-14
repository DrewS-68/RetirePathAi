// THIS IS A WORK-IN-PROGRESS FILE TO IMPLEMENT CASCADING FALLBACK SEARCHES
// This will replace the Phase 3 logic in scraper.ts

// Cascading search strategies: try in order until we find clean URLs
// 1. WITH OPERATOR: Village + Suburb + Operator
// 2. WITHOUT OPERATOR: Village + Suburb only
// 3. BROAD: Village + State (fallback)

interface SearchStrategy {
  name: string;
  query: string;
  description: string;
}

async function trySearchWithFallback(
  village: any,
  suburb: string,
  operator: string | null,
  state: string,
  scraperApiKey: string,
  aggregatorSites: string[]
): Promise<{
  foundUrls: string[];
  aggregatorUrls: string[];
  strategyUsed: string;
  allStrategiesTried: { strategy: string; totalUrls: number; cleanUrls: number; aggregatorUrls: number }[];
}> {
  
  const strategies: SearchStrategy[] = [];
  
  // Strategy 1: With operator (if available)
  if (operator) {
    strategies.push({
      name: 'WITH_OPERATOR',
      query: `"${village.name}" ${suburb} "${operator}" retirement village Australia -agedcareonline -downsizing`,
      description: `Village + Suburb + Operator`
    });
  }
  
  // Strategy 2: Without operator (village + suburb only)
  strategies.push({
    name: 'WITHOUT_OPERATOR',
    query: `"${village.name}" ${suburb} retirement village Australia -agedcareonline -downsizing -retirementlivingonline`,
    description: `Village + Suburb (no operator)`
  });
  
  // Strategy 3: Broad search (village + state fallback)
  strategies.push({
    name: 'BROAD_STATE',
    query: `"${village.name}" ${state} retirement village Australia -agedcareonline -downsizing -retirementlivingonline`,
    description: `Village + State (fallback)`
  });
  
  const allStrategiesTried: any[] = [];
  
  // Try each strategy in order until we find clean URLs
  for (const strategy of strategies) {
    console.log(`   🔍 Trying strategy: ${strategy.name} - ${strategy.description}`);
    console.log(`   📝 Query: ${strategy.query}`);
    
    const scraperUrl = `https://api.scraperapi.com/structured/google/search?api_key=${scraperApiKey}&query=${encodeURIComponent(strategy.query)}&country=au&num=10`;
    
    try {
      const response = await fetch(scraperUrl, {
        signal: AbortSignal.timeout(45000)
      });
      
      if (!response.ok) {
        console.log(`   ❌ Search failed: ${response.status}`);
        allStrategiesTried.push({
          strategy: strategy.name,
          totalUrls: 0,
          cleanUrls: 0,
          aggregatorUrls: 0,
          error: `HTTP ${response.status}`
        });
        continue;
      }
      
      const searchData = await response.json();
      const organic_results = searchData.organic_results || [];
      
      console.log(`   📄 Received ${organic_results.length} results`);
      
      // Extract and filter URLs
      const allUrls: string[] = [];
      const aggregatorUrls: string[] = [];
      
      for (const result of organic_results) {
        if (!result.link) continue;
        
        const url = result.link;
        
        // Skip Google's own URLs and social media
        if (url.includes('google.') || 
            url.includes('facebook.com') || 
            url.includes('youtube.com') ||
            url.includes('twitter.com')) {
          continue;
        }
        
        // Skip bad URLs (PDFs, docs, etc.)
        const urlLower = url.toLowerCase();
        if (urlLower.includes('.pdf') ||
            urlLower.includes('.doc') ||
            urlLower.includes('.xml')) {
          continue;
        }
        
        // Check if aggregator
        const isAggregator = aggregatorSites.some(agg => url.includes(agg));
        
        if (isAggregator) {
          aggregatorUrls.push(url);
          console.log(`   📂 Aggregator: ${url}`);
        } else {
          allUrls.push(url);
          console.log(`   ✅ Clean URL: ${url}`);
        }
      }
      
      allStrategiesTried.push({
        strategy: strategy.name,
        totalUrls: organic_results.length,
        cleanUrls: allUrls.length,
        aggregatorUrls: aggregatorUrls.length
      });
      
      // If we found clean URLs, use this strategy!
      if (allUrls.length > 0) {
        console.log(`   ✅ SUCCESS! Found ${allUrls.length} clean URLs with strategy: ${strategy.name}`);
        return {
          foundUrls: allUrls,
          aggregatorUrls: aggregatorUrls,
          strategyUsed: strategy.name,
          allStrategiesTried
        };
      }
      
      console.log(`   ⚠️ No clean URLs found with ${strategy.name}, trying next strategy...`);
      
      // Small delay between searches
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error: any) {
      console.log(`   ❌ Strategy ${strategy.name} failed: ${error.message}`);
      allStrategiesTried.push({
        strategy: strategy.name,
        totalUrls: 0,
        cleanUrls: 0,
        aggregatorUrls: 0,
        error: error.message
      });
    }
  }
  
  // All strategies failed - return empty
  console.log(`   ❌ All strategies exhausted - no clean URLs found`);
  return {
    foundUrls: [],
    aggregatorUrls: [],
    strategyUsed: 'NONE',
    allStrategiesTried
  };
}

export { trySearchWithFallback };
