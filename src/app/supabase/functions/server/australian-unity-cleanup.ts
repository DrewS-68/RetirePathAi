import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

// The 8 correct Australian Unity villages
const CORRECT_AU_VILLAGES = [
  'Campbell Place Retirement Community',
  'Drummond Place Retirement Community',
  'Geelong Grove Retirement Community',
  'Morven Manor Retirement Community',
  'Peninsula Grange Retirement Community',
  'The Grace Albert Park Lake',
  'Victoria Grange Retirement Community',
  'Walmsley Retirement Community'
];

// GET: Audit - Load all villages currently marked as Australian Unity
export async function australianUnityAuditRoute(request: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Fetch all VIC villages where operator = 'Australian Unity'
    const { data: villages, error } = await supabase
      .from('retirement_villages')
      .select('id, name, suburb, website, operator')
      .eq('state', 'VIC')
      .eq('operator', 'Australian Unity')
      .order('name');

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Database error', details: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Found ${villages.length} villages marked as Australian Unity`);

    return new Response(
      JSON.stringify({ 
        villages,
        correctCount: villages.filter(v => CORRECT_AU_VILLAGES.includes(v.name)).length,
        incorrectCount: villages.filter(v => !CORRECT_AU_VILLAGES.includes(v.name)).length
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('Error in audit route:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// POST: Cleanup - Clear operator field for incorrectly assigned villages
export async function australianUnityCleanupRoute(request: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await request.json();
    const correctVillages = body.correctVillages || CORRECT_AU_VILLAGES;

    console.log('🧹 Starting Australian Unity cleanup...');
    console.log(`   ✅ Will KEEP ${correctVillages.length} correct villages`);

    // Get all villages currently marked as Australian Unity
    const { data: allAUVillages, error: fetchError } = await supabase
      .from('retirement_villages')
      .select('id, name')
      .eq('state', 'VIC')
      .eq('operator', 'Australian Unity');

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Database fetch error', details: fetchError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Identify villages to clear (not in the correct list)
    const villagesToClear = allAUVillages.filter(v => 
      !correctVillages.includes(v.name)
    );

    console.log(`   ❌ Will CLEAR ${villagesToClear.length} incorrect villages`);

    if (villagesToClear.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No incorrect villages to clear',
          clearedCount: 0 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Extract IDs to clear
    const idsToClear = villagesToClear.map(v => v.id);

    // Set operator to NULL for incorrect villages
    const { error: updateError } = await supabase
      .from('retirement_villages')
      .update({ operator: null })
      .in('id', idsToClear);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Database update error', details: updateError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Successfully cleared operator for ${villagesToClear.length} villages`);
    console.log(`✅ The ${correctVillages.length} correct villages remain as Australian Unity`);

    return new Response(
      JSON.stringify({ 
        success: true,
        clearedCount: villagesToClear.length,
        keptCount: correctVillages.length,
        clearedVillages: villagesToClear.map(v => v.name)
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('Error in cleanup route:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}