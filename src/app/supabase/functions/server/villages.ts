// Retirement Village Management API Routes
import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { 
  sendEmail, 
  villageSubmissionNotificationEmail,
  villageApprovedEmail,
  villageRejectedEmail
} from './email.tsx';
import { sampleVillages } from './seed-villages.ts';

const app = new Hono();

// Enable CORS
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'apikey'],
}));

// Initialize Supabase client with service role for admin operations
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

// Get Supabase client for user operations
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );
};

/**
 * GET /villages/search
 * Search and filter retirement villages
 * Query params: state, postcode, minPrice, maxPrice, type, features, careLevel
 */
app.get('/make-server-3bba8be8/villages/search', async (c) => {
  try {
    const supabase = getSupabaseClient();
    
    // Get query parameters
    const state = c.req.query('state');
    const postcode = c.req.query('postcode');
    const minPrice = c.req.query('minPrice');
    const maxPrice = c.req.query('maxPrice');
    const villageType = c.req.query('type');
    const careLevel = c.req.query('careLevel');
    const petFriendly = c.req.query('petFriendly');
    
    // Build query
    let query = supabase
      .from('retirement_villages')
      .select('*')
      .eq('status', 'approved') // Only show approved villages
      .not('facility_type', 'is', null); // FILTER OUT UNCLASSIFIED: Only show villages with verified facility_type
    
    // Apply filters
    if (state) {
      query = query.eq('state', state);
    }
    
    if (postcode) {
      query = query.eq('postcode', postcode);
    }
    
    if (minPrice) {
      query = query.gte('entry_price_min', parseInt(minPrice));
    }
    
    if (maxPrice) {
      query = query.lte('entry_price_max', parseInt(maxPrice));
    }
    
    if (villageType) {
      query = query.eq('village_type', villageType);
    }
    
    if (careLevel) {
      query = query.eq('care_level', careLevel);
    }
    
    if (petFriendly === 'true') {
      query = query.eq('pet_friendly', true);
    }
    
    // Execute query with high limit and ordering
    const { data, error } = await query
      .order('name', { ascending: true })
      .range(0, 9999); // Use range instead of limit - supports up to 10,000 villages
    
    console.log(`✅ FETCHED ${data?.length || 0} VILLAGES FROM DATABASE`);
    
    if (error) {
      console.error('Error fetching villages:', error);
      return c.json({ error: 'Failed to fetch villages', details: error.message }, 500);
    }
    
    // Sort results: featured villages first, then alphabetically
    const sortedData = (data || []).sort((a, b) => {
      // Featured villages come first
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      // Then sort alphabetically by name
      return a.name.localeCompare(b.name);
    });
    
    return c.json({ villages: sortedData });
  } catch (error) {
    console.error('Unexpected error in villages search:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * GET /villages/vic-all
 * Get all VIC villages with operator and address info
 */
app.get('/make-server-3bba8be8/villages/vic-all', async (c) => {
  try {
    const supabase = getSupabaseClient();
    
    const { data: villages, error } = await supabase
      .from('retirement_villages')
      .select('id, name, suburb, postcode, state, operator, website, street_address')
      .eq('state', 'VIC')
      .order('name');

    if (error) {
      console.error('❌ Error fetching VIC villages:', error);
      return c.json({ error: error.message }, 500);
    }

    console.log(`✅ Fetched ${villages?.length || 0} VIC villages`);

    return c.json({
      villages: villages || [],
      count: villages?.length || 0,
    });
  } catch (err: any) {
    console.error('❌ Error in /villages/vic-all:', err);
    return c.json({ error: err?.message || 'Unknown error' }, 500);
  }
});

/**
 * GET /villages/all
 * Get ALL villages (no status filtering) - for admin data quality analysis
 */
app.get('/make-server-3bba8be8/villages/all', async (c) => {
  try {
    const supabase = getSupabaseClient();
    
    // Fetch ALL villages regardless of status
    const { data, error } = await supabase
      .from('retirement_villages')
      .select('*')
      .order('created_at', { ascending: false })
      .range(0, 9999); // Support up to 10,000 villages
    
    if (error) {
      console.error('Error fetching all villages:', error);
      return c.json({ error: 'Failed to fetch villages', details: error.message }, 500);
    }
    
    console.log(`✅ FETCHED ${data?.length || 0} TOTAL VILLAGES (ALL STATUSES) FOR ANALYSIS`);
    
    return c.json(data || []);
  } catch (error) {
    console.error('Unexpected error in villages/all:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * GET /villages/my-submissions
 * Get all villages submitted by the logged-in user (operator dashboard)
 * NOTE: This must come BEFORE /villages/:id to avoid route collision
 */
app.get('/make-server-3bba8be8/villages/my-submissions', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Verify user is authenticated
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - please log in to view your submissions' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - invalid token' }, 401);
    }
    
    // Get all villages submitted by this user
    const { data, error } = await supabase
      .from('retirement_villages')
      .select('*')
      .eq('submitted_by_user_id', user.id)
      .order('submitted_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user submissions:', error);
      return c.json({ error: 'Failed to fetch your submissions', details: error.message }, 500);
    }
    
    return c.json({ villages: data || [] });
  } catch (error) {
    console.error('Unexpected error fetching user submissions:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * GET /villages/:id
 * Get a single village by ID
 * NOTE: This must come AFTER specific routes like /villages/my-submissions
 */
app.get('/make-server-3bba8be8/villages/:id', async (c) => {
  try {
    const supabase = getSupabaseClient();
    const id = c.req.param('id');
    
    const { data, error } = await supabase
      .from('retirement_villages')
      .select('*')
      .eq('id', id)
      .eq('status', 'approved')
      // FILTER OUT UNCLASSIFIED: Only show villages with verified facility_type
      .not('facility_type', 'is', null)
      .single();
    
    if (error) {
      console.error('Error fetching village:', error);
      return c.json({ error: 'Village not found', details: error.message }, 404);
    }
    
    return c.json({ village: data });
  } catch (error) {
    console.error('Unexpected error fetching village:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * POST /villages/submit
 * Submit a new village for approval (from operator submission form)
 */
app.post('/make-server-3bba8be8/villages/submit', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    const body = await c.req.json();
    
    // Get user ID if authenticated (optional - allow anonymous submissions)
    let userId = null;
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (accessToken) {
      const { data: { user } } = await supabase.auth.getUser(accessToken);
      userId = user?.id || null;
    }
    
    // Validate required fields
    const requiredFields = ['name', 'location', 'suburb', 'postcode', 'state', 'contact_email'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return c.json({ error: `Missing required field: ${field}` }, 400);
      }
    }
    
    // Create village record with 'pending' status
    const villageData = {
      name: body.name,
      operator: body.operator || null,
      location: body.location,
      suburb: body.suburb,
      postcode: body.postcode,
      state: body.state,
      latitude: body.latitude || null,
      longitude: body.longitude || null,
      
      village_type: body.village_type || null,
      care_level: body.care_level || null,
      
      entry_price_min: body.entry_price_min || null,
      entry_price_max: body.entry_price_max || null,
      monthly_fees_min: body.monthly_fees_min || null,
      monthly_fees_max: body.monthly_fees_max || null,
      dmf_structure: body.dmf_structure || null,
      dmf_percentage: body.dmf_percentage || null,
      dmf_cap: body.dmf_cap || null,
      
      amenities: body.amenities || [],
      care_services: body.care_services || [],
      activities: body.activities || [],
      
      pet_friendly: body.pet_friendly || false,
      total_units: body.total_units || null,
      bedrooms: body.bedrooms || [],
      age_restriction: body.age_restriction || 55,
      
      contact_phone: body.contact_phone || null,
      contact_email: body.contact_email,
      website: body.website || null,
      
      description: body.description || null,
      images: body.images || [],
      
      status: 'pending', // Requires admin approval
      source: 'operator_submission',
      submitted_at: new Date().toISOString(),
      submitted_by_user_id: userId, // Track which user submitted (if logged in)
    };
    
    const { data, error } = await supabase
      .from('retirement_villages')
      .insert([villageData])
      .select()
      .single();
    
    if (error) {
      console.error('Error submitting village:', error);
      return c.json({ error: 'Failed to submit village', details: error.message }, 500);
    }
    
    // Send email notification to admin about new submission
    try {
      await sendEmail(villageSubmissionNotificationEmail(data));
      console.log('Village submission notification email sent successfully to admin');
    } catch (emailError) {
      console.error('Error sending village submission notification email:', emailError);
      // Don't fail the request if email fails - submission is still saved
    }
    
    return c.json({ 
      success: true, 
      message: 'Village submitted successfully and is pending approval',
      village: data 
    }, 201);
  } catch (error) {
    console.error('Unexpected error submitting village:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * GET /villages/admin/pending
 * Get all pending village submissions (requires admin auth)
 */
app.get('/make-server-3bba8be8/villages/admin/pending', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // TODO: Add admin authentication check
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - missing access token' }, 401);
    }
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - invalid token' }, 401);
    }
    
    // Get pending villages
    const { data, error } = await supabase
      .from('retirement_villages')
      .select('*')
      .eq('status', 'pending')
      .order('submitted_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching pending villages:', error);
      return c.json({ error: 'Failed to fetch pending villages', details: error.message }, 500);
    }
    
    return c.json({ villages: data || [] });
  } catch (error) {
    console.error('Unexpected error fetching pending villages:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * GET /villages/admin/all
 * Get all villages regardless of status (requires admin auth)
 */
app.get('/make-server-3bba8be8/villages/admin/all', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Verify user is authenticated
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - missing access token' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - invalid token' }, 401);
    }
    
    // Get pagination parameters from query string
    const fromParam = c.req.query('from');
    const toParam = c.req.query('to');
    const from = fromParam ? parseInt(fromParam) : 0;
    const to = toParam ? parseInt(toParam) : 99; // Changed from 999 to 99 (100 villages) to prevent timeouts
    
    console.log(`📊 Admin API: Fetching villages from ${from} to ${to}`);

    // Get villages with pagination
    const { data, error } = await supabase
      .from('retirement_villages')
      .select(`
        id,
        name,
        operator,
        location,
        suburb,
        postcode,
        state,
        latitude,
        longitude,
        village_type,
        care_level,
        entry_price_min,
        entry_price_max,
        monthly_fees_min,
        monthly_fees_max,
        dmf_structure,
        dmf_percentage,
        dmf_cap,
        pet_friendly,
        total_units,
        bedrooms,
        age_restriction,
        contact_phone,
        contact_email,
        website,
        description,
        images,
        amenities,
        care_services,
        activities,
        status,
        source,
        verified,
        featured,
        submitted_at,
        approved_at,
        approved_by,
        rejected_at,
        rejected_by,
        rejection_reason,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) {
      console.error('Error fetching all villages:', error);
      return c.json({ error: 'Failed to fetch villages', details: error.message }, 500);
    }
    
    console.log(`✅ ADMIN API: Fetched ${data?.length || 0} villages (batch ${from}-${to})`);
    
    return c.json({ villages: data || [] });
  } catch (error) {
    console.error('Unexpected error fetching all villages:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * PUT /villages/admin/:id/approve
 * Approve a pending village (requires admin auth)
 */
app.put('/make-server-3bba8be8/villages/admin/:id/approve', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    const id = c.req.param('id');
    
    // Verify user is authenticated
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - missing access token' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - invalid token' }, 401);
    }
    
    const { data, error } = await supabase
      .from('retirement_villages')
      .update({ 
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user.id
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error approving village:', error);
      return c.json({ error: 'Failed to approve village', details: error.message }, 500);
    }
    
    // Send approval email to operator
    await sendEmail(villageApprovedEmail(data, data.contact_email));
    
    return c.json({ success: true, village: data });
  } catch (error) {
    console.error('Unexpected error approving village:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * PUT /villages/admin/:id/reject
 * Reject a pending village (requires admin auth)
 */
app.put('/make-server-3bba8be8/villages/admin/:id/reject', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    const id = c.req.param('id');
    const body = await c.req.json();
    
    // Verify user is authenticated
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - missing access token' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - invalid token' }, 401);
    }
    
    const { data, error } = await supabase
      .from('retirement_villages')
      .update({ 
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejected_by: user.id,
        rejection_reason: body.reason || null
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error rejecting village:', error);
      return c.json({ error: 'Failed to reject village', details: error.message }, 500);
    }
    
    // Send rejection email to operator with reason
    await sendEmail(villageRejectedEmail(data, data.contact_email, data.rejection_reason || 'No reason provided'));
    
    return c.json({ success: true, village: data });
  } catch (error) {
    console.error('Unexpected error rejecting village:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * PUT /villages/admin/:id
 * Update a village (requires admin auth)
 */
app.put('/make-server-3bba8be8/villages/admin/:id', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    const id = c.req.param('id');
    const body = await c.req.json();
    
    // Verify user is authenticated
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - missing access token' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - invalid token' }, 401);
    }
    
    const { data, error } = await supabase
      .from('retirement_villages')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating village:', error);
      return c.json({ error: 'Failed to update village', details: error.message }, 500);
    }
    
    return c.json({ success: true, village: data });
  } catch (error) {
    console.error('Unexpected error updating village:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * DELETE /villages/admin/:id
 * Delete a village (requires admin auth)
 */
app.delete('/make-server-3bba8be8/villages/admin/:id', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    const id = c.req.param('id');
    
    // Verify user is authenticated
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - missing access token' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - invalid token' }, 401);
    }
    
    const { error } = await supabase
      .from('retirement_villages')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting village:', error);
      return c.json({ error: 'Failed to delete village', details: error.message }, 500);
    }
    
    return c.json({ success: true, message: 'Village deleted successfully' });
  } catch (error) {
    console.error('Unexpected error deleting village:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * PUT /villages/my-submissions/:id
 * Update operator's own village (only if pending or rejected)
 */
app.put('/make-server-3bba8be8/villages/my-submissions/:id', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    const id = c.req.param('id');
    const body = await c.req.json();
    
    // Verify user is authenticated
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - please log in' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - invalid token' }, 401);
    }
    
    // First, verify the user owns this village and it's editable
    const { data: village, error: fetchError } = await supabase
      .from('retirement_villages')
      .select('*')
      .eq('id', id)
      .eq('submitted_by_user_id', user.id)
      .single();
    
    if (fetchError || !village) {
      return c.json({ error: 'Village not found or you do not have permission to edit it' }, 404);
    }
    
    // Only allow editing if status is pending or rejected
    if (village.status !== 'pending' && village.status !== 'rejected') {
      return c.json({ 
        error: 'You can only edit villages that are pending or rejected. Approved villages must be edited by admin.' 
      }, 403);
    }
    
    // Update the village (reset to pending if it was rejected)
    const updateData = {
      ...body,
      status: 'pending', // Reset to pending when resubmitting
      submitted_at: new Date().toISOString(), // Update submission time
      rejection_reason: null, // Clear rejection reason
      rejected_at: null,
      rejected_by: null,
      updated_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('retirement_villages')
      .update(updateData)
      .eq('id', id)
      .eq('submitted_by_user_id', user.id) // Double-check ownership
      .select()
      .single();
    
    if (error) {
      console.error('Error updating village:', error);
      return c.json({ error: 'Failed to update village', details: error.message }, 500);
    }
    
    return c.json({ 
      success: true, 
      message: 'Village updated and resubmitted for review',
      village: data 
    });
  } catch (error) {
    console.error('Unexpected error updating village:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * DELETE /villages/my-submissions/:id
 * Delete operator's own village (only if pending or rejected)
 */
app.delete('/make-server-3bba8be8/villages/my-submissions/:id', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    const id = c.req.param('id');
    
    // Verify user is authenticated
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - please log in' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - invalid token' }, 401);
    }
    
    // First, verify the user owns this village
    const { data: village, error: fetchError } = await supabase
      .from('retirement_villages')
      .select('*')
      .eq('id', id)
      .eq('submitted_by_user_id', user.id)
      .single();
    
    if (fetchError || !village) {
      return c.json({ error: 'Village not found or you do not have permission to delete it' }, 404);
    }
    
    // Only allow deleting if status is pending or rejected
    if (village.status === 'approved') {
      return c.json({ 
        error: 'You cannot delete an approved village. Please contact admin for assistance.' 
      }, 403);
    }
    
    const { error } = await supabase
      .from('retirement_villages')
      .delete()
      .eq('id', id)
      .eq('submitted_by_user_id', user.id); // Double-check ownership
    
    if (error) {
      console.error('Error deleting village:', error);
      return c.json({ error: 'Failed to delete village', details: error.message }, 500);
    }
    
    return c.json({ success: true, message: 'Village deleted successfully' });
  } catch (error) {
    console.error('Unexpected error deleting village:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * PUT /villages/:id
 * Update a village (for testing - no auth required)
 */
app.put('/make-server-3bba8be8/villages/:id', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const { data, error } = await supabase
      .from('retirement_villages')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating village:', error);
      return c.json({ error: 'Failed to update village', details: error.message }, 500);
    }
    
    return c.json({ success: true, village: data });
  } catch (error) {
    console.error('Unexpected error updating village:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * POST /villages/csv-import
 * Create a new village from CSV import (no auth required - for admin tools)
 */
app.post('/make-server-3bba8be8/villages/csv-import', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    const body = await c.req.json();
    
    console.log('📥 CSV Import - Creating new village:', body.name);
    
    // Validate required field
    if (!body.name) {
      return c.json({ error: 'Missing required field: name' }, 400);
    }
    
    // Create village record
    const villageData = {
      name: body.name,
      state: body.state || 'VIC',
      operator: body.operator || null,
      suburb: body.suburb || null,
      postcode: body.postcode || null,
      website: body.website || null,
      location: body.location || body.suburb || 'Victoria, Australia', // Required field: use location, suburb, or default
      contact_email: body.contact_email || 'admin@retirepath.com.au', // Required field: placeholder if not provided
      status: body.status || 'approved', // Default to approved for CSV imports
      source: body.source || 'csv_import',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('retirement_villages')
      .insert([villageData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating village via CSV import:', error);
      return c.json({ error: 'Failed to create village', details: error.message }, 500);
    }
    
    console.log('✅ CSV Import - Village created successfully:', data.id);
    
    return c.json({ 
      success: true, 
      message: 'Village created successfully via CSV import',
      village: data 
    }, 201);
  } catch (error) {
    console.error('Unexpected error in CSV import:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * POST /villages/batch-update-addresses
 * Batch update street addresses for villages (admin tool)
 * Body: { updates: [{ id: string, street_address: string }] }
 */
app.post('/make-server-3bba8be8/villages/batch-update-addresses', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    const body = await c.req.json();
    
    const updates = body.updates || [];
    
    if (updates.length === 0) {
      return c.json({ error: 'No updates provided' }, 400);
    }
    
    console.log(`📍 Batch updating ${updates.length} village addresses...`);
    
    const successfulUpdates = [];
    const failedUpdates = [];
    
    // Update each village individually
    for (const update of updates) {
      const { id, street_address } = update;
      
      if (!id || !street_address) {
        failedUpdates.push({ id, error: 'Missing id or street_address' });
        continue;
      }
      
      const { data, error } = await supabase
        .from('retirement_villages')
        .update({ street_address })
        .eq('id', id)
        .select('id, name')
        .single();
      
      if (error) {
        console.error(`❌ Failed to update ${id}:`, error);
        failedUpdates.push({ id, error: error.message });
      } else {
        successfulUpdates.push(data);
      }
    }
    
    console.log(`✅ Successfully updated ${successfulUpdates.length}/${updates.length} addresses`);
    
    return c.json({
      success: true,
      updated: successfulUpdates.length,
      failed: failedUpdates.length,
      successfulUpdates,
      failedUpdates: failedUpdates.length > 0 ? failedUpdates : undefined,
    });
  } catch (error) {
    console.error('❌ Error in batch address update:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * POST /villages/seed
 * Seed the database with sample villages (admin only - for setup)
 */
app.post('/make-server-3bba8be8/villages/seed', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Verify user is authenticated (optional - remove auth for initial setup)
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - missing access token' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - invalid token' }, 401);
    }
    
    const insertedVillages = [];
    const errors = [];
    
    for (const village of sampleVillages) {
      const villageData = {
        name: village.name,
        operator: village.operatorName,
        location: village.address,
        suburb: village.suburb,
        postcode: village.postcode,
        state: village.state,
        latitude: village.lat,
        longitude: village.lng,
        
        village_type: village.villageType,
        care_level: village.villageType,
        
        entry_price_min: village.priceRange.min,
        entry_price_max: village.priceRange.max,
        monthly_fees_min: village.monthlyFees.min,
        monthly_fees_max: village.monthlyFees.max,
        
        amenities: village.features,
        care_services: village.careServices,
        activities: [],
        bedrooms: village.unitTypes,
        
        pet_friendly: village.petFriendly,
        total_units: village.totalUnits,
        age_restriction: 55,
        
        contact_email: village.operatorEmail,
        contact_phone: null,
        website: null,
        
        description: village.description,
        images: [],
        
        status: village.status,
        source: 'seed_data',
        verified: true,
        featured: village.featured,
        submitted_at: new Date().toISOString(),
        approved_at: new Date().toISOString(),
        approved_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('retirement_villages')
        .insert([villageData])
        .select()
        .single();
      
      if (error) {
        console.error(`Error inserting village ${village.name}:`, error);
        errors.push({ village: village.name, error: error.message });
      } else {
        insertedVillages.push(data);
      }
    }
    
    return c.json({ 
      success: true,
      message: `Successfully seeded ${insertedVillages.length} villages`,
      inserted: insertedVillages.length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Unexpected error seeding villages:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * POST /villages/delete-all-vic-websites
 * Delete all website URLs from VIC villages (set to null)
 * Admin only - for cleaning corrupted data before fresh scrape
 */
app.post('/make-server-3bba8be8/villages/delete-all-vic-websites', async (c) => {
  try {
    console.log('🗑️ DELETE ALL VIC WEBSITES - Starting...');
    
    const supabase = getSupabaseAdmin();
    
    // Update all VIC villages to set website = null
    const { data, error, count } = await supabase
      .from('retirement_villages')
      .update({ website: null })
      .eq('state', 'VIC')
      .not('website', 'is', null)
      .select('id', { count: 'exact' });
    
    if (error) {
      console.error('❌ Error deleting VIC websites:', error);
      return c.json({ error: 'Failed to delete websites', details: error.message }, 500);
    }
    
    console.log(`✅ Deleted ${count} websites from VIC villages`);
    
    return c.json({ 
      success: true,
      message: `Deleted all VIC websites`,
      deletedCount: count || 0
    });
  } catch (error) {
    console.error('❌ Unexpected error deleting VIC websites:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * GET /villages/debug-postcode
 * Debug endpoint to check villages in/near a specific suburb/postcode
 */
app.get('/make-server-3bba8be8/villages/debug-postcode', async (c) => {
  try {
    const supabase = getSupabaseClient();
    const searchTerm = c.req.query('search') || 'cranbourne';
    
    console.log(`🔍 DEBUG: Searching for villages matching: "${searchTerm}"`);
    
    // Search by suburb OR village name containing the search term
    const { data, error } = await supabase
      .from('retirement_villages')
      .select('id, name, suburb, postcode, state, latitude, longitude, status, facility_type')
      .or(`suburb.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
      .order('suburb', { ascending: true });
    
    if (error) {
      console.error('Debug query error:', error);
      return c.json({ error: 'Failed to fetch villages', details: error.message }, 500);
    }
    
    console.log(`✅ Found ${data?.length || 0} villages matching "${searchTerm}"`);
    
    // Group by postcode for easier analysis
    const byPostcode: Record<string, any[]> = {};
    (data || []).forEach(village => {
      const pc = village.postcode || 'NO_POSTCODE';
      if (!byPostcode[pc]) byPostcode[pc] = [];
      byPostcode[pc].push(village);
    });
    
    return c.json({ 
      total: data?.length || 0,
      villages: data || [],
      byPostcode,
      summary: Object.entries(byPostcode).map(([postcode, villages]) => ({
        postcode,
        count: villages.length,
        withCoordinates: villages.filter(v => v.latitude && v.longitude).length,
        approved: villages.filter(v => v.status === 'approved').length,
        classified: villages.filter(v => v.facility_type).length,
      }))
    });
  } catch (error) {
    console.error('Unexpected error in debug endpoint:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * GET /villages/admin/count-no-website
 * Count how many villages have no website
 */
app.get('/make-server-3bba8be8/villages/admin/count-no-website', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Verify user is authenticated
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - missing access token' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - invalid token' }, 401);
    }
    
    // Count villages with no website
    const { count, error } = await supabase
      .from('retirement_villages')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')
      .eq('state', 'VIC')  // CRITICAL FIX: Only count VIC villages
      .or('website.is.null,website.eq.');
    
    if (error) {
      console.error('Error counting villages:', error);
      return c.json({ error: 'Failed to count villages', details: error.message }, 500);
    }
    
    console.log(`✅ Counted ${count || 0} villages with no website`);
    
    return c.json({ count: count || 0 });
  } catch (error) {
    console.error('Unexpected error counting villages:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * GET /villages/admin/no-website-batch
 * Get a batch of villages with no website (pagination)
 * Query params: offset, limit
 */
app.get('/make-server-3bba8be8/villages/admin/no-website-batch', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Verify user is authenticated
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - missing access token' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - invalid token' }, 401);
    }
    
    // Get pagination parameters
    const offsetParam = c.req.query('offset');
    const limitParam = c.req.query('limit');
    const offset = offsetParam ? parseInt(offsetParam) : 0;
    const limit = limitParam ? parseInt(limitParam) : 50;
    
    console.log(`📊 Fetching batch of villages with no website: offset=${offset}, limit=${limit}`);
    
    // Get villages with no website
    const { data, error } = await supabase
      .from('retirement_villages')
      .select('id, name, suburb, state, operator, website, status')
      .eq('status', 'approved')
      .eq('state', 'VIC')  // CRITICAL FIX: Only fetch VIC villages
      .or('website.is.null,website.eq.')
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching villages:', error);
      return c.json({ error: 'Failed to fetch villages', details: error.message }, 500);
    }
    
    console.log(`✅ Fetched ${data?.length || 0} villages`);
    
    return c.json({ villages: data || [] });
  } catch (error) {
    console.error('Unexpected error fetching villages:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

export default app;