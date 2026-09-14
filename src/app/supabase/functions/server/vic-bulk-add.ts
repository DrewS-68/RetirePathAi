import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Initialize Supabase client with SERVICE ROLE KEY to bypass RLS
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
};

interface VillageToAdd {
  villageName: string;
  suburb: string;
  postcode: string;
  websiteUrl: string;
}

interface AddResult {
  villageName: string;
  suburb: string;
  postcode: string;
  websiteUrl: string;
  status: 'success' | 'already_exists' | 'error';
  message: string;
  errorCode?: string;
  errorDetails?: string;
  insertedId?: string;
}

// Bulk add new VIC villages endpoint
app.post("/make-server-3bba8be8/admin/vic-villages/bulk-add", async (c) => {
  try {
    console.log('\n========================================');
    console.log('🆕 VIC BULK ADD - Server Endpoint');
    console.log('========================================');

    const body = await c.req.json();
    const { villages } = body as { villages: VillageToAdd[] };

    if (!villages || !Array.isArray(villages) || villages.length === 0) {
      console.error('❌ Invalid request: villages array missing or empty');
      return c.json({ 
        error: 'Invalid request: villages array is required and must not be empty' 
      }, 400);
    }

    console.log(`📊 Processing ${villages.length} villages`);

    const supabase = getSupabaseAdmin();
    const results: AddResult[] = [];
    let successCount = 0;
    let alreadyExistsCount = 0;
    let errorCount = 0;

    for (let i = 0; i < villages.length; i++) {
      const village = villages[i];
      
      console.log(`\n--- Processing ${i + 1}/${villages.length} ---`);
      console.log('Village:', village.villageName);
      console.log('Suburb:', village.suburb);
      console.log('Postcode:', village.postcode);
      console.log('Website:', village.websiteUrl);

      try {
        // Validate required fields
        if (!village.villageName || !village.suburb || !village.postcode || !village.websiteUrl) {
          throw new Error('Missing required fields (villageName, suburb, postcode, websiteUrl)');
        }

        // Check if village already exists
        console.log('🔍 Checking if village exists...');
        const { data: existingVillages, error: searchError } = await supabase
          .from('retirement_villages')
          .select('id, name')
          .eq('state', 'VIC')
          .ilike('name', village.villageName);

        if (searchError) {
          console.error('❌ Search error:', searchError);
          throw searchError;
        }

        if (existingVillages && existingVillages.length > 0) {
          console.log('⏭️ Village already exists, skipping');
          results.push({
            villageName: village.villageName,
            suburb: village.suburb,
            postcode: village.postcode,
            websiteUrl: village.websiteUrl,
            status: 'already_exists',
            message: 'Village already exists in database',
          });
          alreadyExistsCount++;
          continue;
        }

        // Prepare insert data
        const newVillage = {
          name: village.villageName.trim(),
          state: 'VIC',
          suburb: village.suburb.trim(),
          postcode: village.postcode.trim(),
          location: `${village.suburb.trim()}, VIC`, // Required field!
          website: village.websiteUrl.trim(),
          operator: village.villageName.trim(), // Temporary - will be fixed by auto scraper
          facility_type: 'Retirement Village',
          created_at: new Date().toISOString(),
        };

        console.log('💾 Inserting village with SERVICE ROLE KEY (bypasses RLS)...');
        console.log('Insert data:', JSON.stringify(newVillage, null, 2));
        
        // Insert using service role key (bypasses RLS)
        const { data: insertedData, error: insertError } = await supabase
          .from('retirement_villages')
          .insert([newVillage])
          .select('id');

        if (insertError) {
          console.error('❌ Insert error:', insertError);
          throw insertError;
        }

        console.log('✅ Successfully inserted:', insertedData);

        results.push({
          villageName: village.villageName,
          suburb: village.suburb,
          postcode: village.postcode,
          websiteUrl: village.websiteUrl,
          status: 'success',
          message: 'Successfully added to database',
          insertedId: insertedData?.[0]?.id,
        });
        successCount++;

      } catch (error: any) {
        console.error(`❌ Error processing ${village.villageName}:`, error);
        
        results.push({
          villageName: village.villageName,
          suburb: village.suburb,
          postcode: village.postcode,
          websiteUrl: village.websiteUrl,
          status: 'error',
          message: error?.message || 'Unknown error',
          errorCode: error?.code || 'UNKNOWN',
          errorDetails: error?.details || error?.detail || '',
        });
        errorCount++;
      }
    }

    console.log('\n========================================');
    console.log('📊 BULK ADD COMPLETE');
    console.log(`✅ Success: ${successCount}`);
    console.log(`⏭️ Already Exists: ${alreadyExistsCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('========================================\n');

    return c.json({
      success: true,
      results,
      stats: {
        total: villages.length,
        success: successCount,
        alreadyExists: alreadyExistsCount,
        errors: errorCount,
      },
    });

  } catch (error: any) {
    console.error('❌ Fatal server error:', error);
    return c.json({
      error: 'Internal server error',
      message: error?.message || 'Unknown error',
      details: error?.details || error?.detail || '',
    }, 500);
  }
});

export default app;