import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Facility type detection logic (same as scraper)
function detectFacilityType(village: any): string | null {
  const textToAnalyze = [
    village.name || '',
    village.description || '',
    village.operator || '',
    ...(village.amenities || []),
    ...(village.care_services || []),
    ...(village.activities || []),
  ].join(' ').toLowerCase();

  // Aged care keywords (strong indicators)
  const agedCareKeywords = [
    'aged care',
    'nursing home',
    'residential aged care',
    'my aged care',
    'dementia care',
    'memory support',
    'palliative care',
    'high care',
    'low care',
    'respite care',
    'rad', // Refundable Accommodation Deposit
    'dap', // Daily Accommodation Payment
    'aged care facility',
    'care home',
    'residential care',
  ];

  // Retirement village keywords
  const retirementKeywords = [
    'retirement village',
    'retirement living',
    'independent living',
    'over 55',
    '55+',
    '50+',
    'seniors living',
    'lifestyle village',
    'entry price',
    'loan license',
    'freehold',
    'dmf', // Deferred Management Fee
    'exit fee',
    'ingoing contribution',
  ];

  let agedCareScore = 0;
  let retirementScore = 0;

  // Count keyword matches
  agedCareKeywords.forEach(keyword => {
    if (textToAnalyze.includes(keyword)) {
      agedCareScore++;
    }
  });

  retirementKeywords.forEach(keyword => {
    if (textToAnalyze.includes(keyword)) {
      retirementScore++;
    }
  });

  // Classification logic
  if (agedCareScore >= 2 && retirementScore >= 2) {
    return 'both';
  } else if (agedCareScore >= 2) {
    return 'aged_care';
  } else if (retirementScore >= 2) {
    return 'retirement_village';
  }

  // Weak signals (single keyword match)
  if (agedCareScore === 1 && retirementScore === 0) {
    return 'aged_care';
  } else if (retirementScore === 1 && agedCareScore === 0) {
    return 'retirement_village';
  }

  return null; // Unable to classify
}

// Helper function to fetch ALL villages using pagination
async function fetchAllVillages() {
  console.log('[Bulk Classifier] Fetching all villages using pagination...');
  
  const allVillages: any[] = [];
  const pageSize = 1000;
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('retirement_villages')
      .select('id, name, facility_type, description, operator, amenities, care_services, activities, suburb, state')
      .order('id', { ascending: true })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('[Bulk Classifier] Pagination error:', error);
      throw error;
    }

    if (data && data.length > 0) {
      allVillages.push(...data);
      console.log(`[Bulk Classifier] Fetched page ${page + 1}: ${data.length} villages (total so far: ${allVillages.length})`);
      
      // Check if we got a full page - if not, we're done
      if (data.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }
    } else {
      hasMore = false;
    }
  }

  console.log(`[Bulk Classifier] Total villages fetched: ${allVillages.length}`);
  return allVillages;
}

// GET /make-server-3bba8be8/bulk-classifier/analyze
// Analyze all villages and return classification preview (doesn't modify database)
app.get('/make-server-3bba8be8/bulk-classifier/analyze', async (c) => {
  try {
    console.log('[Bulk Classifier] Starting analysis of all villages...');

    // Fetch ALL villages using pagination
    const villages = await fetchAllVillages();

    if (!villages || villages.length === 0) {
      return c.json({ 
        total: 0,
        alreadyClassified: 0,
        needsClassification: 0,
        breakdown: {},
        villages: []
      });
    }

    console.log(`[Bulk Classifier] Analyzing ${villages.length} villages...`);

    // Classify each village
    const analysisResults = villages.map(village => {
      const currentType = village.facility_type;
      const detectedType = detectFacilityType(village);

      return {
        id: village.id,
        name: village.name,
        suburb: village.suburb,
        state: village.state,
        currentType: currentType || 'unclassified',
        detectedType: detectedType || 'unable_to_classify',
        willChange: currentType !== detectedType,
      };
    });

    // Calculate statistics
    const alreadyClassified = villages.filter(v => v.facility_type !== null).length;
    const needsClassification = villages.filter(v => v.facility_type === null).length;

    const breakdown = {
      retirement_village: analysisResults.filter(v => v.detectedType === 'retirement_village').length,
      aged_care: analysisResults.filter(v => v.detectedType === 'aged_care').length,
      both: analysisResults.filter(v => v.detectedType === 'both').length,
      unable_to_classify: analysisResults.filter(v => v.detectedType === 'unable_to_classify').length,
    };

    const changesCount = analysisResults.filter(v => v.willChange).length;

    console.log('[Bulk Classifier] Analysis complete:', {
      total: villages.length,
      alreadyClassified,
      needsClassification,
      breakdown,
      changesCount,
    });

    return c.json({
      total: villages.length,
      alreadyClassified,
      needsClassification,
      breakdown,
      changesCount,
      villages: analysisResults,
    });

  } catch (err) {
    console.error('[Bulk Classifier] Analysis error:', err);
    return c.json({ error: `Analysis failed: ${err.message}` }, 500);
  }
});

// POST /make-server-3bba8be8/bulk-classifier/apply
// Apply classifications to database
app.post('/make-server-3bba8be8/bulk-classifier/apply', async (c) => {
  try {
    console.log('[Bulk Classifier] Starting bulk classification...');

    // **DIAGNOSTIC: Test what values are allowed for facility_type**
    console.log('[Bulk Classifier] 🔍 Testing facility_type constraints...');
    
    // Try to find one village and test updating it to 'aged_care'
    const { data: testVillage } = await supabase
      .from('retirement_villages')
      .select('id, facility_type')
      .limit(1)
      .single();
    
    if (testVillage) {
      console.log(`[Bulk Classifier] Test village:`, testVillage);
      const testUpdateResult = await supabase
        .from('retirement_villages')
        .update({ facility_type: 'aged_care' })
        .eq('id', testVillage.id)
        .select();
      
      console.log(`[Bulk Classifier] Test update to 'aged_care' result:`, testUpdateResult);
      console.log(`[Bulk Classifier] Full error object:`, JSON.stringify(testUpdateResult.error, null, 2));
      
      if (testUpdateResult.error) {
        console.error(`[Bulk Classifier] ⚠️ UPDATE FAILED!`);
        console.error(`[Bulk Classifier] Error code:`, testUpdateResult.error.code);
        console.error(`[Bulk Classifier] Error message:`, testUpdateResult.error.message);
        console.error(`[Bulk Classifier] Error details:`, testUpdateResult.error.details);
        console.error(`[Bulk Classifier] Error hint:`, testUpdateResult.error.hint);
        
        return c.json({
          error: `Single village update test failed! Error: ${testUpdateResult.error.message}. Code: ${testUpdateResult.error.code}. Details: ${testUpdateResult.error.details}. Hint: ${testUpdateResult.error.hint}`,
        }, 400);
      } else {
        console.log(`[Bulk Classifier] ✅ Test update SUCCEEDED! Updated village:`, testUpdateResult.data);
      }
    }

    // Fetch ALL villages using pagination
    const villages = await fetchAllVillages();

    if (!villages || villages.length === 0) {
      return c.json({ success: true, updated: 0, skipped: 0 });
    }

    console.log(`[Bulk Classifier] Processing ${villages.length} villages...`);

    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Group villages by their new classification
    const updatesByType: Record<string, string[]> = {
      retirement_village: [],
      aged_care: [],
      both: [],
    };

    // Classify all villages and group by type
    for (const village of villages) {
      const detectedType = detectFacilityType(village);

      // Only update if classification changed or is newly classified
      if (detectedType && village.facility_type !== detectedType) {
        updatesByType[detectedType].push(village.id);
        console.log(`[Bulk Classifier] ✅ WILL UPDATE: Village "${village.name}" (${village.id}): "${village.facility_type}" → "${detectedType}"`);
      } else {
        skipped++;
        
        // Log the first 10 skips to debug
        if (skipped <= 10) {
          console.log(`[Bulk Classifier] ⏭️ SKIPPED: Village "${village.name}" (${village.id}): current="${village.facility_type}", detected="${detectedType}", match=${village.facility_type === detectedType}`);
        }
      }
    }
    
    console.log(`[Bulk Classifier] 📊 SUMMARY: ${Object.values(updatesByType).flat().length} villages will be updated, ${skipped} skipped`);

    // Perform bulk updates for each facility type
    for (const [facilityType, villageIds] of Object.entries(updatesByType)) {
      if (villageIds.length === 0) continue;

      console.log(`[Bulk Classifier] Updating ${villageIds.length} villages to '${facilityType}'...`);
      
      // **BATCH UPDATES: Update in chunks of 100 to avoid "Bad Request" errors**
      const BATCH_SIZE = 100;
      const batches = [];
      
      for (let i = 0; i < villageIds.length; i += BATCH_SIZE) {
        batches.push(villageIds.slice(i, i + BATCH_SIZE));
      }
      
      console.log(`[Bulk Classifier] Split into ${batches.length} batches of up to ${BATCH_SIZE} villages each`);

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        console.log(`[Bulk Classifier] Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} villages)...`);

        try {
          const { error: updateError, data } = await supabase
            .from('retirement_villages')
            .update({ facility_type: facilityType })
            .in('id', batch);

          if (updateError) {
            console.error(`[Bulk Classifier] Error in batch ${batchIndex + 1}:`, updateError);
            errors.push(`Batch ${batchIndex + 1} update to ${facilityType} (${batch.length} villages) failed: ${updateError.message}`);
          } else {
            updated += batch.length;
            console.log(`[Bulk Classifier] ✓ Batch ${batchIndex + 1} succeeded: ${batch.length} villages updated`);
          }
        } catch (err) {
          console.error(`[Bulk Classifier] Exception in batch ${batchIndex + 1}:`, err);
          errors.push(`Batch ${batchIndex + 1} exception: ${err.message}`);
        }
      }
      
      console.log(`[Bulk Classifier] ✓ Completed all batches for '${facilityType}': ${villageIds.length} villages`);
    }

    console.log('[Bulk Classifier] Bulk classification complete:', {
      total: villages.length,
      updated,
      skipped,
      errors: errors.length,
    });

    return c.json({
      success: true,
      total: villages.length,
      updated,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (err) {
    console.error('[Bulk Classifier] Application error:', err);
    return c.json({ error: `Classification failed: ${err.message}` }, 500);
  }
});

export default app;