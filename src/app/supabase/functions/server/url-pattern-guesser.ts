import { Hono } from "npm:hono";

const app = new Hono();

/**
 * URL Pattern Guesser - tries common patterns when scraping fails
 * This is a fallback for when Google scraping doesn't work
 */
app.post("/make-server-3bba8be8/guess-url-pattern", async (c) => {
  try {
    const body = await c.req.json();
    const { villageName, suburb, operator } = body;

    if (!villageName) {
      return c.json({ error: 'Village name required' }, 400);
    }

    console.log(`🔮 Guessing URL patterns for: ${villageName}`);

    // Generate possible domain patterns
    const patterns = generateUrlPatterns(villageName, suburb, operator);
    
    console.log(`   Generated ${patterns.length} URL patterns to test`);

    // Test each pattern
    const results: Array<{ url: string; status: number; valid: boolean }> = [];
    
    for (const pattern of patterns.slice(0, 10)) { // Test top 10
      try {
        const response = await fetch(pattern, {
          method: 'HEAD',
          redirect: 'follow',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        
        const valid = response.ok;
        results.push({ url: pattern, status: response.status, valid });
        
        if (valid) {
          console.log(`   ✅ FOUND: ${pattern} (${response.status})`);
          return c.json({
            success: true,
            website: pattern,
            confidence: 70,
            method: 'pattern-matching'
          });
        } else {
          console.log(`   ❌ Failed: ${pattern} (${response.status})`);
        }
      } catch (error: any) {
        console.log(`   ⚠️ Error testing ${pattern}: ${error.message}`);
        results.push({ url: pattern, status: 0, valid: false });
      }
    }

    return c.json({
      success: false,
      message: 'No valid URLs found in pattern matching',
      testedPatterns: results
    });

  } catch (error: any) {
    console.error(`   ❌ Error: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * Generate common URL patterns for retirement villages
 */
function generateUrlPatterns(villageName: string, suburb?: string, operator?: string): string[] {
  const patterns: string[] = [];
  
  // Clean and format names
  const cleanName = villageName.toLowerCase()
    .replace(/retirement\s+village/gi, '')
    .replace(/aged\s+care/gi, '')
    .trim();
  
  const nameNoSpaces = cleanName.replace(/\s+/g, '');
  const nameWithDashes = cleanName.replace(/\s+/g, '-');
  const nameWithUnderscores = cleanName.replace(/\s+/g, '_');
  
  // Common TLDs for Australian sites
  const tlds = ['.com.au', '.au', '.com'];
  
  // Pattern 1: village name only
  tlds.forEach(tld => {
    patterns.push(`https://${nameNoSpaces}${tld}`);
    patterns.push(`https://www.${nameNoSpaces}${tld}`);
    patterns.push(`https://${nameWithDashes}${tld}`);
    patterns.push(`https://www.${nameWithDashes}${tld}`);
  });
  
  // Pattern 2: with "retirement" or "aged"
  tlds.forEach(tld => {
    patterns.push(`https://${nameNoSpaces}retirement${tld}`);
    patterns.push(`https://${nameNoSpaces}-retirement${tld}`);
    patterns.push(`https://${nameNoSpaces}agedcare${tld}`);
  });
  
  // Pattern 3: Operator-based (if available)
  if (operator) {
    const cleanOperator = operator.toLowerCase().replace(/\s+/g, '');
    tlds.forEach(tld => {
      patterns.push(`https://${cleanOperator}${tld}/${nameNoSpaces}`);
      patterns.push(`https://www.${cleanOperator}${tld}/${nameNoSpaces}`);
      patterns.push(`https://www.${cleanOperator}${tld}/villages/${nameNoSpaces}`);
      patterns.push(`https://www.${cleanOperator}${tld}/retirement-villages/${nameWithDashes}`);
    });
  }
  
  // Pattern 4: Suburb-based
  if (suburb) {
    const cleanSuburb = suburb.toLowerCase().replace(/\s+/g, '');
    tlds.forEach(tld => {
      patterns.push(`https://${nameNoSpaces}${cleanSuburb}${tld}`);
      patterns.push(`https://${nameNoSpaces}-${cleanSuburb}${tld}`);
    });
  }
  
  return patterns;
}

export default app;
