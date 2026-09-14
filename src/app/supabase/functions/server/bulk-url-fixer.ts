import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Helper to get Supabase admin client
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
};

/**
 * POST /bulk-url-fixer/update-and-scrape
 * Update a village's URL and trigger scraping
 */
app.post('/make-server-3bba8be8/bulk-url-fixer/update-and-scrape', async (c) => {
  try {
    const { villageName, newUrl, operator, suburb, state, postcode } = await c.req.json();
    
    if (!villageName || !newUrl) {
      return c.json({ 
        success: false,
        error: 'Village name and new URL are required' 
      }, 400);
    }

    console.log(`🔄 Bulk URL Fixer: Processing ${villageName}`);
    console.log(`   New URL: ${newUrl}`);
    console.log(`   Operator: ${operator || 'not provided'}`);
    console.log(`   Location: ${suburb}, ${state}`);

    // Use KV store to track village by name -> ID mapping
    // This bypasses all database schema issues
    const supabase = getSupabaseAdmin();
    
    // Step 1: Get all villages with this name from KV store
    console.log(`🔍 Searching for village: ${villageName}`);
    
    const kvKey = `village:name:${villageName}`;
    const villageIdFromKv = await kv.get(kvKey);
    
    let villageId: string | null = null;
    
    if (villageIdFromKv) {
      console.log(`✅ Found village ID in KV cache: ${villageIdFromKv}`);
      villageId = villageIdFromKv;
    } else {
      console.log(`⚠️ Village not in KV cache, searching all villages...`);
      
      // Fallback: Search through all village records in KV
      const allVillageKeys = await kv.getByPrefix('village:data:');
      console.log(`📊 Scanning ${allVillageKeys.length} village records...`);
      
      for (const record of allVillageKeys) {
        const data = record.value;
        if (data && typeof data === 'object' && 'name' in data) {
          // Case-insensitive match
          if (data.name.toLowerCase() === villageName.toLowerCase()) {
            villageId = data.id;
            console.log(`✅ Found matching village: ${data.name} (ID: ${villageId})`);
            // Cache it for next time
            await kv.set(kvKey, villageId);
            break;
          }
        }
      }
    }
    
    if (!villageId) {
      console.error(`❌ Village "${villageName}" not found`);
      return c.json({ 
        success: false,
        error: `Village "${villageName}" not found. Please check the name matches exactly.` 
      }, 404);
    }

    // Step 2: Get current village data
    const villageDataKey = `village:data:${villageId}`;
    const currentVillageData = await kv.get(villageDataKey);
    
    if (!currentVillageData) {
      console.error(`❌ Village data not found for ID: ${villageId}`);
      return c.json({ 
        success: false,
        error: `Village data not found for ID: ${villageId}` 
      }, 404);
    }

    console.log(`📋 Current village data:`, currentVillageData);
    console.log(`   Current URL: ${currentVillageData.website_url || 'none'}`);

    // Step 3: Build updated village data
    const updatedData = {
      ...currentVillageData,
      website_url: newUrl,
      last_scraped_at: null, // Reset so it will be scraped again later
      updated_at: new Date().toISOString()
    };

    // Update operator if provided
    if (operator && operator.trim() !== '') {
      updatedData.operator_name = operator.trim();
      console.log(`   Updating operator: ${currentVillageData.operator_name} → ${operator}`);
    }

    // Update location if provided
    if (suburb && suburb.trim() !== '') {
      updatedData.suburb = suburb.trim();
      console.log(`   Updating suburb: ${currentVillageData.suburb} → ${suburb}`);
    }

    if (state && state.trim() !== '') {
      updatedData.state = state.trim();
      console.log(`   Updating state: ${currentVillageData.state} → ${state}`);
    }

    if (postcode && postcode.trim() !== '') {
      updatedData.postcode = postcode.trim();
      console.log(`   Updating postcode: ${currentVillageData.postcode} → ${postcode}`);
    }

    // Update village name if it differs from the current one (correction case)
    if (villageName && villageName.trim() !== '' && villageName !== currentVillageData.name) {
      updatedData.name = villageName.trim();
      console.log(`   Updating village name: ${currentVillageData.name} → ${villageName}`);
    }

    // Step 4: Save updated data back to KV store
    try {
      console.log(`💾 Saving updated village data to KV store...`);
      await kv.set(villageDataKey, updatedData);
      console.log(`✅ Successfully updated ${villageName} in KV store`);
      
      // CRITICAL FIX: Also update the actual database table!
      console.log(`💾 Saving to retirement_villages database table...`);
      const { error: dbError } = await supabase
        .from('retirement_villages')
        .update({
          website: newUrl,
          operator: operator?.trim() || null,
          suburb: suburb?.trim() || null,
          state: state?.trim() || null,
          postcode: postcode?.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', villageId);
      
      if (dbError) {
        console.error('❌ Database update error:', dbError);
        throw new Error(`Database update failed: ${dbError.message}`);
      }
      
      console.log(`✅ Successfully updated ${villageName} in database`);
    } catch (error: any) {
      console.error('❌ Update error:', error);
      return c.json({ 
        success: false,
        error: 'Failed to update village',
        details: error.message 
      }, 500);
    }

    console.log(`✅ Updated URL for ${villageName} - ready for scraping`);

    // SUCCESS - Just update the URL, don't trigger scraping
    return c.json({
      success: true,
      message: `Successfully updated ${villageName}`,
      villageId: villageId,
      oldUrl: currentVillageData.website_url,
      newUrl: newUrl
    });

  } catch (error: any) {
    console.error('❌ Bulk URL Fixer error:', error);
    console.error('Error stack:', error.stack);
    return c.json({ 
      success: false,
      error: error.message || 'Internal server error',
      details: error.stack 
    }, 500);
  }
});

export default app;