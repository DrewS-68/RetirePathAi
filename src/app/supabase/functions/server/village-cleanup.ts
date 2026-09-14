import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Get all unique operators with counts
app.get('/make-server-3bba8be8/cleanup/operators', async (c) => {
  try {
    console.log('[Cleanup] Fetching unique operators...');

    // Get all operators with their counts
    const { data: operators, error } = await supabase
      .from('retirement_villages')
      .select('operator')
      .order('operator');

    if (error) {
      console.error('[Cleanup] Error fetching operators:', error);
      return c.json({ error: 'Database error', details: error.message }, 500);
    }

    // Count occurrences of each operator
    const operatorCounts = new Map<string, number>();
    
    operators?.forEach(({ operator }) => {
      const key = operator || '(null)';
      operatorCounts.set(key, (operatorCounts.get(key) || 0) + 1);
    });

    // Convert to array and sort by count (descending)
    const operatorList = Array.from(operatorCounts.entries())
      .map(([operator, count]) => ({ operator, count }))
      .sort((a, b) => b.count - a.count);

    console.log(`[Cleanup] Found ${operatorList.length} unique operators`);

    return c.json({
      operators: operatorList,
      total: operatorList.length,
    });

  } catch (error) {
    console.error('[Cleanup] Error in operators endpoint:', error);
    return c.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// Merge multiple operators into one (bulk rename)
app.post('/make-server-3bba8be8/cleanup/merge-operators', async (c) => {
  try {
    const { oldOperators, newOperator } = await c.req.json();

    if (!Array.isArray(oldOperators) || oldOperators.length === 0) {
      return c.json({ error: 'oldOperators must be a non-empty array' }, 400);
    }

    if (!newOperator || typeof newOperator !== 'string') {
      return c.json({ error: 'newOperator must be a non-empty string' }, 400);
    }

    console.log(`[Cleanup] Merging operators: [${oldOperators.join(', ')}] -> ${newOperator}`);

    // Update all villages with old operator names to new operator name
    const { data, error, count } = await supabase
      .from('retirement_villages')
      .update({ operator: newOperator })
      .in('operator', oldOperators)
      .select();

    if (error) {
      console.error('[Cleanup] Error merging operators:', error);
      return c.json({ error: 'Database error', details: error.message }, 500);
    }

    console.log(`[Cleanup] Successfully updated ${data?.length || 0} villages`);

    return c.json({
      success: true,
      updatedCount: data?.length || 0,
      newOperator,
    });

  } catch (error) {
    console.error('[Cleanup] Error in merge-operators endpoint:', error);
    return c.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// Add a new village
app.post('/make-server-3bba8be8/cleanup/add-village', async (c) => {
  try {
    const villageData = await c.req.json();

    // Validate required fields
    if (!villageData.name || !villageData.suburb) {
      return c.json({ error: 'Name and suburb are required' }, 400);
    }

    console.log(`[Cleanup] Adding new village: ${villageData.name} in ${villageData.suburb}, ${villageData.state}`);
    console.log('[Cleanup] Full village data:', JSON.stringify(villageData, null, 2));

    // Insert the new village
    const insertData = {
      name: villageData.name,
      operator: villageData.operator || null,
      location: villageData.suburb || villageData.state || 'SA', // Required field
      suburb: villageData.suburb,
      state: villageData.state || 'SA',
      postcode: villageData.postcode || '0000', // ✅ Default postcode if none provided (database requires non-null)
      website: villageData.website || null,
      facility_type: villageData.facility_type || 'retirement_village',
      status: 'approved', // ✅ Set status to approved so it shows in directory
    };

    console.log('[Cleanup] Inserting data:', JSON.stringify(insertData, null, 2));

    const { data, error } = await supabase
      .from('retirement_villages')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('[Cleanup] Database error adding village:', error);
      console.error('[Cleanup] Error code:', error.code);
      console.error('[Cleanup] Error message:', error.message);
      console.error('[Cleanup] Error details:', error.details);
      return c.json({ 
        error: 'Database error', 
        details: error.message,
        code: error.code,
        hint: error.hint 
      }, 500);
    }

    console.log(`[Cleanup] Successfully added village with ID: ${data.id}`);

    return c.json({
      success: true,
      village: data,
    });

  } catch (error) {
    console.error('[Cleanup] Error in add-village endpoint:', error);
    return c.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// Fix villages with missing status field (one-time fix)
app.post('/make-server-3bba8be8/cleanup/fix-status', async (c) => {
  try {
    console.log('[Cleanup] Fixing villages with null status...');

    // Update all villages where status is null to 'approved'
    const { data, error } = await supabase
      .from('retirement_villages')
      .update({ status: 'approved' })
      .is('status', null)
      .select();

    if (error) {
      console.error('[Cleanup] Error fixing status:', error);
      return c.json({ error: 'Database error', details: error.message }, 500);
    }

    console.log(`[Cleanup] Successfully updated ${data?.length || 0} villages`);

    return c.json({
      success: true,
      updatedCount: data?.length || 0,
      message: `Fixed ${data?.length || 0} villages with missing status`,
    });

  } catch (error) {
    console.error('[Cleanup] Error in fix-status endpoint:', error);
    return c.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// Search for villages by name (for debugging)
app.get('/make-server-3bba8be8/cleanup/search-village', async (c) => {
  try {
    const searchTerm = c.req.query('name');
    
    if (!searchTerm) {
      return c.json({ error: 'Search term required' }, 400);
    }

    console.log(`[Cleanup] Searching for villages matching: ${searchTerm}`);

    // Search for villages by name (case-insensitive, partial match)
    const { data, error } = await supabase
      .from('retirement_villages')
      .select('*')
      .ilike('name', `%${searchTerm}%`)
      .order('name');

    if (error) {
      console.error('[Cleanup] Error searching villages:', error);
      return c.json({ error: 'Database error', details: error.message }, 500);
    }

    console.log(`[Cleanup] Found ${data?.length || 0} matching villages`);

    return c.json({
      success: true,
      villages: data || [],
      count: data?.length || 0,
    });

  } catch (error) {
    console.error('[Cleanup] Error in search-village endpoint:', error);
    return c.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// Update a specific village's facility type
app.post('/make-server-3bba8be8/cleanup/update-facility-type', async (c) => {
  try {
    const { villageId, facilityType } = await c.req.json();

    if (!villageId) {
      return c.json({ error: 'Village ID required' }, 400);
    }

    if (!facilityType) {
      return c.json({ error: 'Facility type required' }, 400);
    }

    console.log(`[Cleanup] Updating village ${villageId} to facility_type: ${facilityType}`);

    const { data, error } = await supabase
      .from('retirement_villages')
      .update({ facility_type: facilityType })
      .eq('id', villageId)
      .select()
      .single();

    if (error) {
      console.error('[Cleanup] Error updating facility type:', error);
      return c.json({ error: 'Database error', details: error.message }, 500);
    }

    console.log(`[Cleanup] Successfully updated village: ${data.name}`);

    return c.json({
      success: true,
      village: data,
    });

  } catch (error) {
    console.error('[Cleanup] Error in update-facility-type endpoint:', error);
    return c.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// Update multiple fields of a village (for fixing incorrect data)
app.post('/make-server-3bba8be8/cleanup/update-village', async (c) => {
  try {
    const { villageId, updates } = await c.req.json();

    if (!villageId) {
      return c.json({ error: 'Village ID required' }, 400);
    }

    if (!updates || Object.keys(updates).length === 0) {
      return c.json({ error: 'No updates provided' }, 400);
    }

    console.log(`[Cleanup] Updating village ${villageId} with:`, updates);

    const { data, error } = await supabase
      .from('retirement_villages')
      .update(updates)
      .eq('id', villageId)
      .select()
      .single();

    if (error) {
      console.error('[Cleanup] Error updating village:', error);
      return c.json({ error: 'Database error', details: error.message }, 500);
    }

    console.log(`[Cleanup] Successfully updated village: ${data.name}`);

    return c.json({
      success: true,
      village: data,
    });

  } catch (error) {
    console.error('[Cleanup] Error in update-village endpoint:', error);
    return c.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// Delete a single village by ID
app.post('/make-server-3bba8be8/cleanup/delete-village', async (c) => {
  try {
    const { villageId } = await c.req.json();

    if (!villageId) {
      return c.json({ error: 'Village ID required' }, 400);
    }

    console.log(`[Cleanup] Deleting village ${villageId}...`);

    // First get the village name for logging
    const { data: village, error: fetchError } = await supabase
      .from('retirement_villages')
      .select('name')
      .eq('id', villageId)
      .single();

    if (fetchError) {
      console.error('[Cleanup] Error fetching village:', fetchError);
      return c.json({ error: 'Village not found', details: fetchError.message }, 404);
    }

    // Delete the village
    const { error } = await supabase
      .from('retirement_villages')
      .delete()
      .eq('id', villageId);

    if (error) {
      console.error('[Cleanup] Error deleting village:', error);
      return c.json({ error: 'Database error', details: error.message }, 500);
    }

    console.log(`[Cleanup] Successfully deleted village: ${village.name}`);

    return c.json({
      success: true,
      message: `Successfully deleted village: ${village.name}`,
    });

  } catch (error) {
    console.error('[Cleanup] Error in delete-village endpoint:', error);
    return c.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// Delete all villages from a fake/incorrect operator
app.post('/make-server-3bba8be8/cleanup/delete-operator-villages', async (c) => {
  try {
    const { operator } = await c.req.json();

    if (!operator || typeof operator !== 'string') {
      return c.json({ error: 'Operator name is required' }, 400);
    }

    console.log(`[Cleanup] Deleting all villages from operator: ${operator}`);

    // Delete all villages with this operator
    const { data, error } = await supabase
      .from('retirement_villages')
      .delete()
      .eq('operator', operator)
      .select();

    if (error) {
      console.error('[Cleanup] Error deleting villages:', error);
      return c.json({ error: 'Database error', details: error.message }, 500);
    }

    console.log(`[Cleanup] Successfully deleted ${data?.length || 0} villages from operator: ${operator}`);

    return c.json({
      success: true,
      deletedCount: data?.length || 0,
      operator,
    });

  } catch (error) {
    console.error('[Cleanup] Error in delete-operator-villages endpoint:', error);
    return c.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// Detect obvious fake/invalid villages
app.get('/make-server-3bba8be8/cleanup/detect-fakes', async (c) => {
  try {
    console.log('[Cleanup] Detecting obvious fake villages...');

    // Get all unclassified villages (facility_type is NULL, not 'unclassified')
    const { data: villages, error } = await supabase
      .from('retirement_villages')
      .select('*')
      .is('facility_type', null); // Changed from .eq('facility_type', 'unclassified')

    if (error) {
      console.error('[Cleanup] Error fetching villages:', error);
      return c.json({ error: 'Database error', details: error.message }, 500);
    }

    console.log(`[Cleanup] Found ${villages?.length || 0} unclassified villages to scan`);

    const suspectedFakes: Array<{
      id: string;
      name: string;
      operator: string | null;
      suburb: string;
      website: string | null;
      reasons: string[];
      severity: 'high' | 'medium' | 'low';
    }> = [];

    // Get operator counts
    const operatorCounts = new Map<string, number>();
    villages?.forEach(v => {
      const op = v.operator || '(null)';
      operatorCounts.set(op, (operatorCounts.get(op) || 0) + 1);
    });

    // Analyze each village
    for (const village of villages || []) {
      const reasons: string[] = [];
      let severity: 'high' | 'medium' | 'low' = 'low';

      // Check 1: No contact info at all
      if (!village.website && !village.contact_phone && !village.contact_email) {
        reasons.push('No contact information (no website, phone, or email)');
        severity = 'high';
      }

      // REMOVED: Check 2 - Operator with only 1-2 villages (small operators are legitimate!)

      // Check 3: Invalid/suspicious website patterns
      if (village.website) {
        const website = village.website.toLowerCase();
        const suspiciousPatterns = [
          'parked',
          'forsale',
          'godaddy',
          'namecheap',
          'domain.com',
          'sedo.com',
          'afternic.com',
          'hugedomains.com',
          'dan.com'
        ];
        
        for (const pattern of suspiciousPatterns) {
          if (website.includes(pattern)) {
            reasons.push(`Suspicious website (contains "${pattern}")`);
            severity = 'high';
            break;
          }
        }
      }

      // Check 4: Null or empty operator
      if (!village.operator || village.operator.trim() === '') {
        reasons.push('No operator specified');
        if (severity === 'low') severity = 'medium';
      }

      // Check 5: Very short or generic name
      if (village.name && village.name.length < 5) {
        reasons.push('Village name is very short (< 5 characters)');
        if (severity === 'low') severity = 'medium';
      }

      // Check 6: Duplicate detection (same name + suburb)
      // IMPROVED: For duplicates, mark as MEDIUM severity if this village has a proper website
      // and HIGH severity if it doesn't (likely the fake duplicate)
      const duplicates = villages?.filter(v => 
        v.id !== village.id &&
        v.name?.toLowerCase() === village.name?.toLowerCase() &&
        v.suburb?.toLowerCase() === village.suburb?.toLowerCase()
      ) || [];
      
      if (duplicates.length > 0) {
        // Check if THIS village has a proper website
        const hasProperWebsite = village.website && 
                                !village.website.toLowerCase().includes('parked') &&
                                !village.website.toLowerCase().includes('godaddy') &&
                                village.website.startsWith('http');
        
        // Check if major operator
        const majorOperators = ['rsl lifecare', 'uniting care', 'lendlease', 'stockland', 'aveo'];
        const isMajorOperator = majorOperators.some(op => 
          village.operator?.toLowerCase().includes(op)
        );
        
        // If this village has a proper website AND major operator, it's LIKELY the real one
        // Mark as LOW severity (for review, but probably keep it)
        if (hasProperWebsite && isMajorOperator) {
          reasons.push(`⚠️ LIKELY REAL: Duplicate exists, but this has proper website (${village.website})`);
          severity = 'low';
        } else if (hasProperWebsite) {
          // Has website but not major operator - mark as medium
          reasons.push(`Duplicate: ${duplicates.length} other village(s) with same name in ${village.suburb} (this one has website)`);
          if (severity === 'low') severity = 'medium';
        } else {
          // No proper website - probably the fake duplicate
          reasons.push(`❌ LIKELY FAKE: Duplicate with no website (${duplicates.length} other(s) exist)`);
          severity = 'high';
        }
      }

      // If we found any issues, add to suspected fakes
      if (reasons.length > 0) {
        suspectedFakes.push({
          id: village.id,
          name: village.name,
          operator: village.operator,
          suburb: village.suburb,
          website: village.website,
          reasons,
          severity,
        });
      }
    }

    // Sort by severity (high first)
    suspectedFakes.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    console.log(`[Cleanup] Found ${suspectedFakes.length} suspected fake villages`);

    return c.json({
      success: true,
      total: villages?.length || 0,
      suspectedFakes,
      summary: {
        total: suspectedFakes.length,
        high: suspectedFakes.filter(v => v.severity === 'high').length,
        medium: suspectedFakes.filter(v => v.severity === 'medium').length,
        low: suspectedFakes.filter(v => v.severity === 'low').length,
      }
    });

  } catch (error) {
    console.error('[Cleanup] Error in detect-fakes endpoint:', error);
    return c.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// Bulk delete suspected fake villages
app.post('/make-server-3bba8be8/cleanup/bulk-delete-fakes', async (c) => {
  try {
    const { villageIds } = await c.req.json();

    if (!Array.isArray(villageIds) || villageIds.length === 0) {
      return c.json({ error: 'Village IDs array is required' }, 400);
    }

    console.log(`[Cleanup] Bulk deleting ${villageIds.length} villages...`);

    const { data, error } = await supabase
      .from('retirement_villages')
      .delete()
      .in('id', villageIds)
      .select();

    if (error) {
      console.error('[Cleanup] Error bulk deleting villages:', error);
      return c.json({ error: 'Database error', details: error.message }, 500);
    }

    console.log(`[Cleanup] Successfully deleted ${data?.length || 0} villages`);

    return c.json({
      success: true,
      deletedCount: data?.length || 0,
    });

  } catch (error) {
    console.error('[Cleanup] Error in bulk-delete-fakes endpoint:', error);
    return c.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// Auto-delete exact duplicates (same name + suburb + operator + website)
app.post('/make-server-3bba8be8/cleanup/auto-delete-exact-duplicates', async (c) => {
  try {
    console.log('[Cleanup] Finding exact duplicates...');

    // Get all villages (or just unclassified if you prefer)
    const { data: villages, error } = await supabase
      .from('retirement_villages')
      .select('*')
      .order('id'); // Order by ID so we keep the oldest one

    if (error) {
      console.error('[Cleanup] Error fetching villages:', error);
      return c.json({ error: 'Database error', details: error.message }, 500);
    }

    console.log(`[Cleanup] Scanning ${villages?.length || 0} villages for exact duplicates...`);

    // Group villages by name + suburb + operator + website
    const groups = new Map<string, typeof villages>();
    
    villages?.forEach(village => {
      // Create a unique key from name + suburb + operator + website
      const key = [
        village.name?.toLowerCase().trim() || '',
        village.suburb?.toLowerCase().trim() || '',
        village.operator?.toLowerCase().trim() || '',
        village.website?.toLowerCase().trim() || ''
      ].join('|');
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(village);
    });

    // Find groups with more than 1 village (duplicates)
    const duplicateGroups: Array<{
      name: string;
      suburb: string;
      operator: string | null;
      website: string | null;
      count: number;
      kept: any;
      deleted: any[];
    }> = [];

    const villageIdsToDelete: string[] = [];

    for (const [key, group] of groups.entries()) {
      if (group.length > 1) {
        // Keep the first one (oldest ID), delete the rest
        const [kept, ...toDelete] = group;
        
        duplicateGroups.push({
          name: kept.name,
          suburb: kept.suburb,
          operator: kept.operator,
          website: kept.website,
          count: group.length,
          kept: { id: kept.id, name: kept.name },
          deleted: toDelete.map(v => ({ id: v.id, name: v.name })),
        });

        villageIdsToDelete.push(...toDelete.map(v => v.id));
      }
    }

    console.log(`[Cleanup] Found ${duplicateGroups.length} duplicate groups with ${villageIdsToDelete.length} duplicates to delete`);

    // Delete the duplicates if any found
    let deletedCount = 0;
    if (villageIdsToDelete.length > 0) {
      const { data: deleted, error: deleteError } = await supabase
        .from('retirement_villages')
        .delete()
        .in('id', villageIdsToDelete)
        .select();

      if (deleteError) {
        console.error('[Cleanup] Error deleting duplicates:', deleteError);
        return c.json({ error: 'Database error', details: deleteError.message }, 500);
      }

      deletedCount = deleted?.length || 0;
      console.log(`[Cleanup] Successfully deleted ${deletedCount} exact duplicates`);
    }

    return c.json({
      success: true,
      duplicateGroups,
      totalGroups: duplicateGroups.length,
      deletedCount,
      message: deletedCount > 0 
        ? `Deleted ${deletedCount} exact duplicates from ${duplicateGroups.length} groups`
        : 'No exact duplicates found',
    });

  } catch (error) {
    console.error('[Cleanup] Error in auto-delete-exact-duplicates endpoint:', error);
    return c.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// Get database statistics
app.get('/make-server-3bba8be8/cleanup/stats', async (c) => {
  try {
    console.log('[Cleanup] Fetching database statistics...');

    // Get total count
    const { count: totalCount, error: totalError } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      console.error('[Cleanup] Error fetching total count:', totalError);
      return c.json({ error: 'Database error', details: totalError.message }, 500);
    }

    // Get classified count (facility_type IS NOT NULL)
    const { count: classifiedCount, error: classifiedError } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true })
      .not('facility_type', 'is', null);

    if (classifiedError) {
      console.error('[Cleanup] Error fetching classified count:', classifiedError);
      return c.json({ error: 'Database error', details: classifiedError.message }, 500);
    }

    // Get unclassified count (facility_type IS NULL)
    const { count: unclassifiedCount, error: unclassifiedError } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true })
      .is('facility_type', null);

    if (unclassifiedError) {
      console.error('[Cleanup] Error fetching unclassified count:', unclassifiedError);
      return c.json({ error: 'Database error', details: unclassifiedError.message }, 500);
    }

    // Get breakdown by facility type
    const { data: facilityTypeBreakdown, error: breakdownError } = await supabase
      .from('retirement_villages')
      .select('facility_type')
      .not('facility_type', 'is', null);

    if (breakdownError) {
      console.error('[Cleanup] Error fetching facility type breakdown:', breakdownError);
      return c.json({ error: 'Database error', details: breakdownError.message }, 500);
    }

    // Count by facility type
    const typeCounts: Record<string, number> = {};
    facilityTypeBreakdown?.forEach(village => {
      const type = village.facility_type || 'Unknown';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    console.log('[Cleanup] Statistics:', {
      total: totalCount,
      classified: classifiedCount,
      unclassified: unclassifiedCount,
      breakdown: typeCounts,
    });

    return c.json({
      total: totalCount || 0,
      classified: classifiedCount || 0,
      unclassified: unclassifiedCount || 0,
      breakdown: typeCounts,
      percentageClassified: totalCount ? ((classifiedCount || 0) / totalCount * 100).toFixed(1) : 0,
    });

  } catch (error) {
    console.error('[Cleanup] Error in stats endpoint:', error);
    return c.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// Get all unclassified villages for manual classification
app.get('/make-server-3bba8be8/cleanup/get-unclassified', async (c) => {
  try {
    console.log('[Cleanup] Fetching unclassified villages...');

    const { data: villages, error, count } = await supabase
      .from('retirement_villages')
      .select('id, name, operator, suburb, state, postcode, website, contact_phone, contact_email', { count: 'exact' })
      .is('facility_type', null)
      .order('name');

    if (error) {
      console.error('[Cleanup] Error fetching unclassified villages:', error);
      return c.json({ error: 'Database error', details: error.message }, 500);
    }

    console.log(`[Cleanup] Found ${count || 0} unclassified villages`);

    return c.json({
      villages: villages || [],
      count: count || 0,
    });

  } catch (error) {
    console.error('[Cleanup] Error in get-unclassified endpoint:', error);
    return c.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// Classify a village (set facility_type)
app.post('/make-server-3bba8be8/cleanup/classify-village', async (c) => {
  try {
    const { villageId, facilityType } = await c.req.json();

    if (!villageId || !facilityType) {
      return c.json({ error: 'Village ID and facility type are required' }, 400);
    }

    console.log(`[Cleanup] Classifying village ${villageId} as ${facilityType}...`);

    const { data, error } = await supabase
      .from('retirement_villages')
      .update({ facility_type: facilityType })
      .eq('id', villageId)
      .select()
      .single();

    if (error) {
      console.error('[Cleanup] Error classifying village:', error);
      return c.json({ error: 'Database error', details: error.message }, 500);
    }

    console.log(`[Cleanup] Successfully classified village: ${data.name}`);

    return c.json({
      success: true,
      village: data,
    });

  } catch (error) {
    console.error('[Cleanup] Error in classify-village endpoint:', error);
    return c.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// Get duplicates for a specific village
app.post('/make-server-3bba8be8/cleanup/get-duplicates', async (c) => {
  try {
    const { villageId } = await c.req.json();

    if (!villageId) {
      return c.json({ error: 'Village ID is required' }, 400);
    }

    console.log(`[Cleanup] Getting duplicates for village ${villageId}...`);

    // First get the village details
    const { data: village, error: villageError } = await supabase
      .from('retirement_villages')
      .select('name, suburb, postcode')
      .eq('id', villageId)
      .single();

    if (villageError || !village) {
      console.error('[Cleanup] Error fetching village:', villageError);
      return c.json({ error: 'Village not found', details: villageError?.message }, 404);
    }

    // Find all villages with the same name and suburb (excluding the current one)
    const { data: duplicates, error: duplicatesError } = await supabase
      .from('retirement_villages')
      .select('id, name, operator, suburb, state, postcode, website, contact_phone, contact_email, facility_type')
      .eq('name', village.name)
      .eq('suburb', village.suburb)
      .neq('id', villageId)
      .order('name');

    if (duplicatesError) {
      console.error('[Cleanup] Error fetching duplicates:', duplicatesError);
      return c.json({ error: 'Database error', details: duplicatesError.message }, 500);
    }

    console.log(`[Cleanup] Found ${duplicates?.length || 0} duplicates for ${village.name}`);

    return c.json({
      duplicates: duplicates || [],
    });

  } catch (error) {
    console.error('[Cleanup] Error in get-duplicates endpoint:', error);
    return c.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// Bulk import villages from CSV
app.post('/make-server-3bba8be8/cleanup/bulk-import', async (c) => {
  try {
    const { villages } = await c.req.json();

    if (!Array.isArray(villages) || villages.length === 0) {
      return c.json({ error: 'Villages array is required and must not be empty' }, 400);
    }

    console.log(`[Cleanup] Bulk importing ${villages.length} villages...`);

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Process each village
    for (const villageData of villages) {
      try {
        // Validate required fields
        if (!villageData.name || !villageData.suburb) {
          errors.push(`Skipped row: Name and suburb are required (got: ${JSON.stringify(villageData)})`);
          skipped++;
          continue;
        }

        // Check if village already exists (by name and suburb)
        const { data: existing } = await supabase
          .from('retirement_villages')
          .select('id, name')
          .eq('name', villageData.name)
          .eq('suburb', villageData.suburb)
          .maybeSingle();

        if (existing) {
          console.log(`[Cleanup] Village already exists: ${villageData.name} in ${villageData.suburb}`);
          skipped++;
          continue;
        }

        // Insert the new village
        const { error } = await supabase
          .from('retirement_villages')
          .insert([{
            name: villageData.name.trim(),
            operator: villageData.operator?.trim() || null,
            location: villageData.suburb?.trim() || villageData.state || 'Unknown',
            suburb: villageData.suburb?.trim(),
            state: villageData.state?.toUpperCase().trim() || 'SA',
            postcode: villageData.postcode?.trim() || null,
            website: villageData.website?.trim() || null,
            facility_type: villageData.facility_type?.toLowerCase().trim() || 'retirement_village',
            status: 'approved', // Auto-approve so it shows in directory
          }]);

        if (error) {
          errors.push(`Failed to import ${villageData.name}: ${error.message}`);
          skipped++;
        } else {
          imported++;
        }

      } catch (err) {
        console.error(`[Cleanup] Error importing village ${villageData.name}:`, err);
        errors.push(`Error importing ${villageData.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        skipped++;
      }
    }

    console.log(`[Cleanup] Bulk import complete: ${imported} imported, ${skipped} skipped`);

    return c.json({
      success: true,
      imported,
      skipped,
      total: villages.length,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('[Cleanup] Error in bulk-import endpoint:', error);
    return c.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// Scrape ECH map to extract all villages
app.post('/make-server-3bba8be8/cleanup/scrape-ech', async (c) => {
  try {
    console.log('[ECH Scraper] Starting ECH map scrape...');

    const scraperApiKey = Deno.env.get('SCRAPERAPI_KEY');
    const useScraperAPI = scraperApiKey && scraperApiKey.trim().length > 0;

    // Target URL
    const targetUrl = 'https://ech.asn.au';
    
    let html: string;
    let fetchMethod: string;

    // Try ScraperAPI first if available
    if (useScraperAPI) {
      try {
        console.log('[ECH Scraper] Attempting with ScraperAPI...');
        // Removed country_code=au since it requires a higher plan tier
        const scraperUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(targetUrl)}&render=true`;

        const response = await fetch(scraperUrl, { 
          signal: AbortSignal.timeout(60000) // 60 second timeout
        });

        if (response.ok) {
          html = await response.text();
          fetchMethod = 'ScraperAPI';
          console.log('[ECH Scraper] Successfully fetched via ScraperAPI, HTML length:', html.length);
        } else {
          console.error('[ECH Scraper] ScraperAPI failed with status:', response.status);
          const errorText = await response.text();
          console.error('[ECH Scraper] ScraperAPI error response:', errorText.substring(0, 500));
          throw new Error(`ScraperAPI returned status ${response.status}: ${errorText.substring(0, 200)}`);
        }
      } catch (scraperError) {
        console.error('[ECH Scraper] ScraperAPI error:', scraperError);
        // Fall through to direct fetch
        console.log('[ECH Scraper] Falling back to direct fetch...');
        
        try {
          const directResponse = await fetch(targetUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            signal: AbortSignal.timeout(30000) // 30 second timeout
          });

          if (!directResponse.ok) {
            throw new Error(`Direct fetch failed with status ${directResponse.status}`);
          }

          html = await directResponse.text();
          fetchMethod = 'Direct fetch (ScraperAPI fallback)';
          console.log('[ECH Scraper] Successfully fetched via direct fetch, HTML length:', html.length);
        } catch (directError) {
          console.error('[ECH Scraper] Direct fetch also failed:', directError);
          return c.json({ 
            error: 'Failed to fetch ECH website', 
            details: `ScraperAPI error: ${scraperError instanceof Error ? scraperError.message : 'Unknown'}. Direct fetch error: ${directError instanceof Error ? directError.message : 'Unknown'}`,
            suggestion: 'The website may be blocking automated requests. Try using the CSV Import Tool with manually collected data.'
          }, 500);
        }
      }
    } else {
      // No ScraperAPI key, try direct fetch
      console.log('[ECH Scraper] No ScraperAPI key found, using direct fetch...');
      
      try {
        const directResponse = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          signal: AbortSignal.timeout(30000)
        });

        if (!directResponse.ok) {
          throw new Error(`HTTP ${directResponse.status}`);
        }

        html = await directResponse.text();
        fetchMethod = 'Direct fetch';
        console.log('[ECH Scraper] Successfully fetched via direct fetch, HTML length:', html.length);
      } catch (directError) {
        console.error('[ECH Scraper] Direct fetch failed:', directError);
        return c.json({ 
          error: 'Failed to fetch ECH website', 
          details: directError instanceof Error ? directError.message : 'Unknown error',
          suggestion: 'The website may be blocking automated requests or is temporarily unavailable. Try again later or use the CSV Import Tool.'
        }, 500);
      }
    }

    // Parse the HTML to extract village data
    const villages: Array<{
      name: string;
      suburb: string;
      state: string;
      operator: string;
      facility_type: string;
    }> = [];

    // Try multiple parsing strategies:
    
    // Strategy 1: Look for JSON data in script tags (various patterns)
    const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    let scriptMatch;
    
    while ((scriptMatch = scriptRegex.exec(html)) !== null) {
      const scriptContent = scriptMatch[1];
      
      // Look for arrays with location-like data
      const arrayMatches = scriptContent.match(/\[[\s\S]{20,3000}?\]/g);
      if (arrayMatches) {
        for (const arrayStr of arrayMatches) {
          try {
            const parsed = JSON.parse(arrayStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              // Check if array contains location objects
              const sample = parsed[0];
              if (sample && typeof sample === 'object' && 
                  (sample.name || sample.title || sample.location || sample.address || sample.suburb)) {
                console.log('[ECH Scraper] Found location array with', parsed.length, 'items');
                
                parsed.forEach((item: any) => {
                  const name = item.name || item.title || item.site_name || item.location_name || '';
                  const suburb = item.suburb || item.location || item.city || item.address || '';
                  
                  if (name && typeof name === 'string' && name.length > 2) {
                    villages.push({
                      name: name.includes('ECH') ? name : `ECH ${name}`,
                      suburb: suburb || 'Unknown',
                      state: item.state || 'SA',
                      operator: 'ECH',
                      facility_type: 'retirement_village',
                    });
                  }
                });
              }
            }
          } catch (e) {
            // Not valid JSON or not what we're looking for
          }
        }
      }
      
      // Look for object literals with village/location data
      const varRegex = /(?:var|let|const)\s+(\w+)\s*=\s*(\{[\s\S]{20,3000}?\});/g;
      let varMatch;
      while ((varMatch = varRegex.exec(scriptContent)) !== null) {
        try {
          const parsed = JSON.parse(varMatch[2]);
          if (parsed.locations || parsed.villages || parsed.sites) {
            const dataArray = parsed.locations || parsed.villages || parsed.sites;
            console.log('[ECH Scraper] Found data object with', dataArray.length, 'items');
            
            if (Array.isArray(dataArray)) {
              dataArray.forEach((item: any) => {
                const name = item.name || item.title || '';
                const suburb = item.suburb || item.location || '';
                
                if (name && name.length > 2) {
                  villages.push({
                    name: name.includes('ECH') ? name : `ECH ${name}`,
                    suburb: suburb || 'Unknown',
                    state: 'SA',
                    operator: 'ECH',
                    facility_type: 'retirement_village',
                  });
                }
              });
            }
          }
        } catch (e) {
          // Skip
        }
      }
    }

    // Strategy 2: Look for WordPress REST API or AJAX endpoints in the HTML
    const apiEndpointRegex = /["'](https?:\/\/[^"']*\/wp-json\/[^"']+)["']/gi;
    let apiMatch;
    const apiEndpoints: string[] = [];
    while ((apiMatch = apiEndpointRegex.exec(html)) !== null) {
      apiEndpoints.push(apiMatch[1]);
    }
    
    if (apiEndpoints.length > 0) {
      console.log('[ECH Scraper] Found', apiEndpoints.length, 'API endpoints, attempting to fetch...');
      // Try fetching from API endpoints
      for (const endpoint of apiEndpoints.slice(0, 3)) { // Only try first 3
        try {
          const apiResponse = await fetch(endpoint);
          if (apiResponse.ok) {
            const apiData = await apiResponse.json();
            console.log('[ECH Scraper] API endpoint returned data:', typeof apiData);
            // Process API data if it contains villages
            // This would need custom logic based on the actual API structure
          }
        } catch (e) {
          // Skip failed endpoints
        }
      }
    }

    // Strategy 3: Look for HTML elements with data attributes
    const dataAttributeRegex = /data-(?:name|title|location)=["']([^"']+)["'][^>]*data-(?:suburb|address)=["']([^"']+)["']/gi;
    let match;
    while ((match = dataAttributeRegex.exec(html)) !== null) {
      villages.push({
        name: match[1].includes('ECH') ? match[1] : `ECH ${match[1]}`,
        suburb: match[2],
        state: 'SA',
        operator: 'ECH',
        facility_type: 'retirement_village',
      });
    }

    // Strategy 4: Look for address patterns in HTML (fallback)
    // This is less reliable but can catch some cases
    const addressRegex = />\s*([^<]{3,60})\s*<[^>]*>\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*,?\s*SA\s*</gi;
    while ((match = addressRegex.exec(html)) !== null) {
      const potentialName = match[1].trim();
      const suburb = match[2].trim();
      
      // Filter out common false positives
      if (potentialName.length > 5 && suburb.length > 3 && 
          !potentialName.includes('©') && !potentialName.includes('Privacy') &&
          /^[A-Za-z\s-]+$/.test(potentialName)) {
        villages.push({
          name: potentialName.includes('ECH') ? potentialName : `ECH ${potentialName}`,
          suburb: suburb,
          state: 'SA',
          operator: 'ECH',
          facility_type: 'retirement_village',
        });
      }
    }

    // Deduplicate by name+suburb
    const uniqueVillages = Array.from(
      new Map(villages.map(v => [`${v.name.toLowerCase()}-${v.suburb.toLowerCase()}`, v])).values()
    );

    console.log(`[ECH Scraper] Extracted ${uniqueVillages.length} unique villages`);

    // If we couldn't extract any villages, return the HTML for manual inspection
    if (uniqueVillages.length === 0) {
      console.log('[ECH Scraper] No villages found, returning HTML snippet for debugging');
      
      // Extract useful information for debugging
      const hasScripts = html.includes('<script');
      const hasReact = html.includes('react') || html.includes('React');
      const hasWordPress = html.includes('wp-content') || html.includes('wp-json');
      const hasMap = html.includes('map') || html.includes('google.maps') || html.includes('leaflet');
      
      return c.json({
        success: false,
        villages: [],
        htmlSnippet: html.substring(0, 5000),
        debug: {
          htmlLength: html.length,
          hasScripts,
          hasReact,
          hasWordPress,
          hasMap,
          message: 'The website appears to load villages dynamically. Try accessing the API directly or provide manual data.',
        },
        message: 'Could not automatically parse villages. The site likely uses dynamic JavaScript loading.',
      });
    }

    return c.json({
      success: true,
      villages: uniqueVillages,
      count: uniqueVillages.length,
    });

  } catch (error) {
    console.error('[ECH Scraper] Error in scrape-ech endpoint:', error);
    return c.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// Scrape COFC retirement villages
app.post('/make-server-3bba8be8/cleanup/scrape-cofc', async (c) => {
  try {
    console.log('[COFC Scraper] Starting COFC scrape...');

    const scraperApiKey = Deno.env.get('SCRAPERAPI_KEY');
    const useScraperAPI = scraperApiKey && scraperApiKey.trim().length > 0;

    const targetUrl = 'https://www.cofc.com.au/retirement-aged-care/retirement-villages/find-a-retirement-village';
    
    let html: string;

    // Try ScraperAPI first if available, otherwise direct fetch
    if (useScraperAPI) {
      try {
        console.log('[COFC Scraper] Attempting with ScraperAPI...');
        const scraperUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(targetUrl)}&render=true`;

        const response = await fetch(scraperUrl, { 
          signal: AbortSignal.timeout(60000)
        });

        if (response.ok) {
          html = await response.text();
          console.log('[COFC Scraper] Successfully fetched via ScraperAPI, HTML length:', html.length);
        } else {
          const errorText = await response.text();
          console.error('[COFC Scraper] ScraperAPI failed:', response.status, errorText.substring(0, 500));
          throw new Error(`ScraperAPI failed: ${response.status}`);
        }
      } catch (scraperError) {
        console.log('[COFC Scraper] Falling back to direct fetch...');
        const directResponse = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          signal: AbortSignal.timeout(30000)
        });

        if (!directResponse.ok) {
          return c.json({ 
            error: 'Failed to fetch COFC website', 
            details: `ScraperAPI and direct fetch both failed. Status: ${directResponse.status}`,
            suggestion: 'Try using the CSV Import Tool instead.'
          }, 500);
        }

        html = await directResponse.text();
        console.log('[COFC Scraper] Fetched via direct fetch, HTML length:', html.length);
      }
    } else {
      const directResponse = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: AbortSignal.timeout(30000)
      });

      if (!directResponse.ok) {
        return c.json({ 
          error: 'Failed to fetch COFC website', 
          details: `HTTP ${directResponse.status}`,
          suggestion: 'The website may be blocking requests.'
        }, 500);
      }

      html = await directResponse.text();
      console.log('[COFC Scraper] Fetched via direct fetch, HTML length:', html.length);
    }

    const villages: Array<{
      name: string;
      suburb: string;
      state: string;
      operator: string;
      facility_type: string;
      website?: string;
    }> = [];

    // Parse COFC website structure
    // Look for village cards, links, or structured data
    
    // Strategy 1: Look for links to individual village pages
    const villageLinkRegex = /<a[^>]*href=["']([^"']*retirement-villages\/[^"']+)["'][^>]*>([^<]+)<\/a>/gi;
    let match;
    const foundLinks = new Map<string, { link: string; name: string }>();
    const allFoundLinks: Array<{ link: string; name: string; reason?: string }> = [];
    
    // Blacklist of non-village terms (exact match or contains)
    const blacklistTerms = [
      'retirement villages',
      'find a retirement village',
      'life in our villages',
      'costs explained',
      'retirement village costs explained',
      'step-by-step',
      'book a tour',
      'explore',
      'overview',
      'contact',
      'about',
      'news',
      'event',
      'career',
      'faq',
      'privacy',
      'terms',
      'policy',
    ];
    
    while ((match = villageLinkRegex.exec(html)) !== null) {
      const link = match[1];
      const name = match[2].trim();
      const nameLower = name.toLowerCase();
      
      allFoundLinks.push({ link, name });
      
      // Skip if name is too short
      if (name.length <= 2) {
        allFoundLinks[allFoundLinks.length - 1].reason = 'Name too short';
        continue;
      }
      
      // Skip if it's a blacklisted term
      const isBlacklisted = blacklistTerms.some(term => nameLower === term || nameLower.includes(term));
      if (isBlacklisted) {
        allFoundLinks[allFoundLinks.length - 1].reason = 'Blacklisted term';
        continue;
      }
      
      // Skip the main directory page or generic URLs
      if (link.endsWith('retirement-villages/') || 
          link.includes('find-a-retirement-village') ||
          link.endsWith('#')) {
        allFoundLinks[allFoundLinks.length - 1].reason = 'Directory/generic page';
        continue;
      }
      
      // Only accept if we haven't seen this exact URL before (dedup by URL, not name)
      if (!foundLinks.has(link)) {
        foundLinks.set(link, { link, name });
        allFoundLinks[allFoundLinks.length - 1].reason = '✅ ACCEPTED';
      } else {
        allFoundLinks[allFoundLinks.length - 1].reason = 'Duplicate URL';
      }
    }

    console.log(`[COFC Scraper] Found ${allFoundLinks.length} total links, accepted ${foundLinks.size}`);
    
    // Log a sample of what we found for debugging
    if (allFoundLinks.length > 0) {
      console.log('[COFC Scraper] Sample of found links:');
      allFoundLinks.slice(0, 10).forEach((item, idx) => {
        console.log(`  ${idx + 1}. "${item.name}" -> ${item.link} [${item.reason || 'processing...'}]`);
      });
    }
    
    // Convert foundLinks Map to villages array
    for (const { link, name } of foundLinks.values()) {
      // Try to extract suburb and state from the link or URL path
      let suburb = 'Unknown';
      let state = 'SA';
      
      // Extract from URL path (e.g., /retirement-villages/sa/adelaide/village-name)
      const pathMatch = link.match(/retirement-villages\/([a-z]{2,3})\/([a-z-]+)/i);
      if (pathMatch) {
        const stateCode = pathMatch[1].toUpperCase();
        // Map common state codes
        if (['SA', 'VIC', 'NSW', 'QLD', 'WA', 'TAS', 'NT', 'ACT'].includes(stateCode)) {
          state = stateCode;
        }
        suburb = pathMatch[2].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      } else {
        // Try to extract just the suburb from the end of the URL
        const suburbMatch = link.match(/\/([a-z-]+)$/);
        if (suburbMatch) {
          suburb = suburbMatch[1].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }
      }
      
      villages.push({
        name: name,
        suburb: suburb,
        state: state,
        operator: 'Catholic Homes',
        facility_type: 'retirement_village',
        website: link.startsWith('http') ? link : `https://www.cofc.com.au${link}`,
      });
    }

    // Strategy 2: Look for structured data (JSON-LD)
    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let jsonMatch;
    
    while ((jsonMatch = jsonLdRegex.exec(html)) !== null) {
      try {
        const jsonData = JSON.parse(jsonMatch[1]);
        
        // Check if it's an ItemList with locations
        if (jsonData['@type'] === 'ItemList' && jsonData.itemListElement) {
          jsonData.itemListElement.forEach((item: any) => {
            if (item.name && item.address) {
              const name = item.name;
              
              // Skip blacklisted items
              const nameLower = name.toLowerCase();
              const isBlacklisted = blacklistTerms.some(term => nameLower === term || nameLower.includes(term));
              if (isBlacklisted) return;
              
              const address = item.address;
              const suburb = address.addressLocality || address.suburb || 'Unknown';
              const state = address.addressRegion || 'SA';
              
              if (!villages.some(v => v.name === name)) {
                villages.push({
                  name: name,
                  suburb: suburb,
                  state: state,
                  operator: 'Catholic Homes',
                  facility_type: 'retirement_village',
                  website: item.url || undefined,
                });
              }
            }
          });
        }
      } catch (e) {
        // Not valid JSON or not relevant
      }
    }

    // Strategy 3: Look for village cards with data attributes or specific HTML structure
    // Only include this if we haven't found villages via links/JSON-LD
    if (villages.length === 0) {
      const cardRegex = /<div[^>]*class=["'][^"']*village[^"']*["'][^>]*>([\s\S]{0,500}?)<\/div>/gi;
      while ((match = cardRegex.exec(html)) !== null) {
        const cardContent = match[1];
        
        // Extract name from h2, h3, or strong tags
        const nameMatch = cardContent.match(/<(?:h2|h3|strong)[^>]*>([^<]+)<\/(?:h2|h3|strong)>/i);
        if (nameMatch) {
          const name = nameMatch[1].trim();
          
          // Skip blacklisted items
          const nameLower = name.toLowerCase();
          const isBlacklisted = blacklistTerms.some(term => nameLower === term || nameLower.includes(term));
          if (isBlacklisted) continue;
          
          // Extract suburb if present
          const suburbMatch = cardContent.match(/(?:suburb|location|address)["'][^>]*>([^<]+)</i);
          const suburb = suburbMatch ? suburbMatch[1].trim() : 'Unknown';
          
          if (!villages.some(v => v.name === name) && name.length > 2) {
            villages.push({
              name: name,
              suburb: suburb,
              state: 'SA',
              operator: 'Catholic Homes',
              facility_type: 'retirement_village',
            });
          }
        }
      }
    }

    // Deduplicate by name
    const uniqueVillages = Array.from(
      new Map(villages.map(v => [v.name.toLowerCase(), v])).values()
    );

    console.log(`[COFC Scraper] Extracted ${uniqueVillages.length} unique villages`);

    if (uniqueVillages.length === 0) {
      console.log('[COFC Scraper] No villages found, returning debug info');
      
      return c.json({
        success: false,
        villages: [],
        htmlSnippet: html.substring(0, 5000),
        allFoundLinks: allFoundLinks, // Include all found links for debugging
        debug: {
          htmlLength: html.length,
          hasRetirementLinks: html.includes('retirement-villages/'),
          hasJsonLd: html.includes('application/ld+json'),
          totalLinksFound: allFoundLinks.length,
          linksAccepted: foundLinks.size,
          message: 'Could not parse villages. Website structure may have changed.',
        },
        message: 'No villages found. The website structure may have changed.',
      });
    }

    return c.json({
      success: true,
      villages: uniqueVillages,
      count: uniqueVillages.length,
    });

  } catch (error) {
    console.error('[COFC Scraper] Error in scrape-cofc endpoint:', error);
    return c.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

export default app;