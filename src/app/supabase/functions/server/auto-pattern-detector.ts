// Auto Pattern Detector - Automatically discovers URL patterns from existing village websites
import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

/**
 * Extract base URL and pattern from a set of URLs
 */
function detectPattern(urls: { name: string; url: string }[]): {
  baseUrl: string;
  pattern: string;
  confidence: number;
} | null {
  if (urls.length < 2) {
    return null; // Need at least 2 URLs to detect a pattern
  }

  // Extract base URLs (protocol + domain)
  const baseUrls = urls.map(u => {
    try {
      const parsed = new URL(u.url);
      return `${parsed.protocol}//${parsed.hostname}`;
    } catch {
      return null;
    }
  }).filter(Boolean) as string[];

  // Find most common base URL
  const baseUrlCounts: { [key: string]: number } = {};
  baseUrls.forEach(base => {
    baseUrlCounts[base] = (baseUrlCounts[base] || 0) + 1;
  });

  const baseUrl = Object.entries(baseUrlCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  if (!baseUrl) {
    return null;
  }

  console.log(`   🔍 Detected base URL: ${baseUrl}`);

  // Extract paths
  const paths = urls.map(u => {
    try {
      const parsed = new URL(u.url);
      const urlBase = `${parsed.protocol}//${parsed.hostname}`;
      if (urlBase !== baseUrl) {
        return null; // Different base URL
      }
      return {
        name: u.name,
        path: parsed.pathname
      };
    } catch {
      return null;
    }
  }).filter(Boolean) as { name: string; path: string }[];

  if (paths.length < 2) {
    return null;
  }

  console.log(`   📋 Analyzing ${paths.length} paths...`);
  paths.forEach(p => console.log(`      ${p.name} → ${p.path}`));

  // Try to find common pattern
  // Look for village name or slug in paths
  const patterns: { pattern: string; matches: number }[] = [];

  for (const { name, path } of paths) {
    // Create slug from village name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug appears in path
    if (path.toLowerCase().includes(slug)) {
      // Try to extract the pattern
      const slugIndex = path.toLowerCase().indexOf(slug);
      const before = path.substring(0, slugIndex);
      const after = path.substring(slugIndex + slug.length);

      const pattern = `${before}{villageSlug}${after}`;
      
      // Count how many paths match this pattern
      let matchCount = 0;
      for (const { name: testName, path: testPath } of paths) {
        const testSlug = testName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        
        const expectedPath = pattern.replace('{villageSlug}', testSlug);
        if (testPath === expectedPath) {
          matchCount++;
        }
      }

      patterns.push({ pattern, matches: matchCount });
    }

    // Also check if full name appears (not slugified)
    const nameLower = name.toLowerCase().replace(/\s+/g, '-');
    if (path.toLowerCase().includes(nameLower)) {
      const nameIndex = path.toLowerCase().indexOf(nameLower);
      const before = path.substring(0, nameIndex);
      const after = path.substring(nameIndex + nameLower.length);

      const pattern = `${before}{villageSlug}${after}`;
      
      let matchCount = 0;
      for (const { name: testName, path: testPath } of paths) {
        const testSlug = testName.toLowerCase().replace(/\s+/g, '-');
        const expectedPath = pattern.replace('{villageSlug}', testSlug);
        if (testPath === expectedPath) {
          matchCount++;
        }
      }

      patterns.push({ pattern, matches: matchCount });
    }
  }

  // Find best pattern (most matches)
  patterns.sort((a, b) => b.matches - a.matches);

  if (patterns.length > 0 && patterns[0].matches >= 2) {
    const bestPattern = patterns[0];
    const confidence = bestPattern.matches / paths.length;

    console.log(`   ✅ Detected pattern: ${bestPattern.pattern}`);
    console.log(`   📊 Confidence: ${(confidence * 100).toFixed(0)}% (${bestPattern.matches}/${paths.length} matches)`);

    return {
      baseUrl,
      pattern: bestPattern.pattern,
      confidence
    };
  }

  return null;
}

/**
 * POST /make-server-3bba8be8/auto-pattern-detector/detect-operator-pattern
 * Automatically detect URL pattern for an operator
 */
app.post('/make-server-3bba8be8/auto-pattern-detector/detect-operator-pattern', async (c) => {
  try {
    const { operator } = await c.req.json();

    if (!operator) {
      return c.json({ error: 'Operator name required' }, 400);
    }

    console.log(`🔍 AUTO-DETECTING PATTERN FOR: ${operator}`);
    console.log('='.repeat(60));

    // Get villages with this operator that have websites
    const { data: villages, error: fetchError } = await supabase
      .from('retirement_villages')
      .select('id, name, operator, website')
      .eq('state', 'VIC')
      .ilike('operator', operator)
      .not('website', 'is', null)
      .not('website', 'eq', '')
      .limit(10); // Sample up to 10 villages

    if (fetchError) {
      console.error('Database error:', fetchError);
      return c.json({ error: fetchError.message }, 500);
    }

    if (!villages || villages.length < 2) {
      console.log(`⚠️  Need at least 2 villages with websites for operator "${operator}"`);
      console.log(`   Found: ${villages?.length || 0}`);
      return c.json({
        success: false,
        message: `Need at least 2 villages with websites for operator "${operator}". Found: ${villages?.length || 0}`,
        operator,
        villagesFound: villages?.length || 0
      });
    }

    console.log(`✅ Found ${villages.length} villages with websites`);

    // Prepare URL data
    const urlData = villages.map(v => ({
      name: v.name,
      url: v.website
    }));

    // Detect pattern
    const detected = detectPattern(urlData);

    if (!detected) {
      console.log(`❌ Could not detect pattern for operator "${operator}"`);
      console.log(`   URLs analyzed:`);
      urlData.forEach(u => console.log(`      ${u.name}: ${u.url}`));
      
      return c.json({
        success: false,
        message: 'Could not detect a consistent URL pattern',
        operator,
        villagesAnalyzed: villages.length,
        sampleUrls: urlData.slice(0, 5)
      });
    }

    // Validate pattern with one village
    const testVillage = villages[0];
    const testSlug = testVillage.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    let constructedUrl = detected.pattern.replace('{villageSlug}', testSlug);
    if (!constructedUrl.startsWith('http')) {
      constructedUrl = `${detected.baseUrl}${constructedUrl}`;
    }

    console.log(`   🧪 Testing pattern with: ${testVillage.name}`);
    console.log(`   🔗 Constructed: ${constructedUrl}`);
    console.log(`   ✓ Actual:      ${testVillage.website}`);

    const result = {
      success: true,
      operator,
      baseUrl: detected.baseUrl,
      pattern: detected.pattern,
      confidence: detected.confidence,
      villagesAnalyzed: villages.length,
      exampleVillages: villages.slice(0, 3).map(v => ({
        name: v.name,
        website: v.website
      })),
      testResult: {
        villageName: testVillage.name,
        constructedUrl,
        actualUrl: testVillage.website,
        match: constructedUrl === testVillage.website
      }
    };

    console.log('='.repeat(60));
    console.log('✅ PATTERN DETECTION COMPLETE');

    return c.json(result);

  } catch (error: any) {
    console.error('Error in auto pattern detector:', error);
    return c.json({ error: error.message || 'Pattern detection failed' }, 500);
  }
});

/**
 * POST /make-server-3bba8be8/auto-pattern-detector/detect-all-patterns
 * Auto-detect patterns for all operators in the whitelist
 */
app.post('/make-server-3bba8be8/auto-pattern-detector/detect-all-patterns', async (c) => {
  try {
    console.log('🚀 AUTO-DETECTING PATTERNS FOR ALL OPERATORS');
    console.log('='.repeat(60));

    // Load operator whitelist
    const operators = await kv.get('vic_operator_whitelist') || [];
    console.log(`📋 Loaded ${operators.length} operators from whitelist`);

    const results: any[] = [];
    const detectedPatterns: any[] = [];

    for (const operator of operators) {
      console.log(`\n🔍 Processing: ${operator}`);

      // Get villages with this operator that have websites
      const { data: villages, error: fetchError } = await supabase
        .from('retirement_villages')
        .select('id, name, operator, website')
        .eq('state', 'VIC')
        .ilike('operator', operator)
        .not('website', 'is', null)
        .not('website', 'eq', '')
        .limit(10);

      if (fetchError) {
        console.error(`   ❌ Database error:`, fetchError.message);
        results.push({ operator, success: false, error: fetchError.message });
        continue;
      }

      if (!villages || villages.length < 2) {
        console.log(`   ⏭️  Skipped: Only ${villages?.length || 0} villages with websites`);
        results.push({ operator, success: false, reason: 'insufficient_data', villagesFound: villages?.length || 0 });
        continue;
      }

      // Prepare URL data
      const urlData = villages.map(v => ({
        name: v.name,
        url: v.website
      }));

      // Detect pattern
      const detected = detectPattern(urlData);

      if (!detected) {
        console.log(`   ❌ No pattern detected`);
        results.push({ operator, success: false, reason: 'no_pattern_detected', villagesAnalyzed: villages.length });
        continue;
      }

      // Only save patterns with high confidence (≥50%)
      if (detected.confidence >= 0.5) {
        console.log(`   ✅ Pattern detected with ${(detected.confidence * 100).toFixed(0)}% confidence`);
        
        detectedPatterns.push({
          operator,
          baseUrl: detected.baseUrl,
          pattern: detected.pattern,
          verified: false,
          confidence: detected.confidence,
          villagesAnalyzed: villages.length
        });

        results.push({
          operator,
          success: true,
          baseUrl: detected.baseUrl,
          pattern: detected.pattern,
          confidence: detected.confidence,
          villagesAnalyzed: villages.length
        });
      } else {
        console.log(`   ⚠️  Low confidence: ${(detected.confidence * 100).toFixed(0)}%`);
        results.push({
          operator,
          success: false,
          reason: 'low_confidence',
          confidence: detected.confidence,
          villagesAnalyzed: villages.length
        });
      }

      // Small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Save detected patterns to KV (merge with existing)
    const existingPatterns = await kv.get('vic_operator_url_patterns') || [];
    console.log(`\n💾 Merging ${detectedPatterns.length} new patterns with ${existingPatterns.length} existing patterns...`);

    // Merge (avoid duplicates)
    const mergedPatterns = [...existingPatterns];
    for (const newPattern of detectedPatterns) {
      const existingIndex = mergedPatterns.findIndex((p: any) => 
        p.operator.toLowerCase() === newPattern.operator.toLowerCase()
      );
      
      if (existingIndex >= 0) {
        console.log(`   🔄 Updating pattern for: ${newPattern.operator}`);
        mergedPatterns[existingIndex] = newPattern;
      } else {
        console.log(`   ➕ Adding pattern for: ${newPattern.operator}`);
        mergedPatterns.push(newPattern);
      }
    }

    await kv.set('vic_operator_url_patterns', mergedPatterns);

    const summary = {
      totalOperators: operators.length,
      patternsDetected: detectedPatterns.length,
      totalPatternsStored: mergedPatterns.length,
      successRate: `${((detectedPatterns.length / operators.length) * 100).toFixed(1)}%`
    };

    console.log('\n='.repeat(60));
    console.log('✅ AUTO-DETECTION COMPLETE');
    console.log(`   Operators processed: ${summary.totalOperators}`);
    console.log(`   Patterns detected: ${summary.patternsDetected}`);
    console.log(`   Success rate: ${summary.successRate}`);

    return c.json({
      success: true,
      summary,
      results,
      detectedPatterns
    });

  } catch (error: any) {
    console.error('Error in batch pattern detection:', error);
    return c.json({ error: error.message || 'Batch detection failed' }, 500);
  }
});

export default app;
