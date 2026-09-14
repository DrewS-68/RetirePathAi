// Agent Leads API Routes - Revenue Engine Feature
import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { sendEmail, agentLeadNotificationEmail } from './email.tsx';

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

/**
 * POST /agent-leads/submit
 * Submit a new agent lead (selling home)
 */
app.post('/make-server-3bba8be8/agent-leads/submit', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    const body = await c.req.json();
    
    // Get user ID if authenticated (optional)
    let userId = null;
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (accessToken) {
      const { data: { user } } = await supabase.auth.getUser(accessToken);
      userId = user?.id || null;
    }
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'postcode'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return c.json({ error: `Missing required field: ${field}` }, 400);
      }
    }
    
    // Create lead record
    const leadData = {
      user_id: userId,
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      postcode: body.postcode,
      suburb: body.suburb || null,
      state: body.state || null,
      home_type: body.home_type || null,
      estimated_value: body.estimated_value || null,
      property_address: body.property_address || null,
      bedrooms: body.bedrooms || null,
      bathrooms: body.bathrooms || null,
      timeline: body.timeline || null,
      reason_for_selling: body.reason_for_selling || 'Moving to retirement village',
      additional_notes: body.additional_notes || null,
      lead_source: body.lead_source || 'home_valuation',
      status: 'new',
    };
    
    const { data, error } = await supabase
      .from('agent_leads')
      .insert([leadData])
      .select()
      .single();
    
    if (error) {
      console.error('Error submitting agent lead:', error);
      return c.json({ error: 'Failed to submit lead', details: error.message }, 500);
    }
    
    // Send notification email to admin about new lead
    try {
      await sendEmail(agentLeadNotificationEmail(data));
      console.log('Agent lead notification email sent successfully to admin');
    } catch (emailError) {
      console.error('Error sending agent lead notification email:', emailError);
      // Don't fail the request if email fails - lead is still saved
    }
    
    return c.json({ 
      success: true, 
      message: 'Thank you! We\'ll connect you with a trusted real estate agent soon.',
      lead: data 
    }, 201);
  } catch (error) {
    console.error('Unexpected error submitting agent lead:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * GET /agent-leads/my-leads
 * Get leads submitted by the logged-in user
 */
app.get('/make-server-3bba8be8/agent-leads/my-leads', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Verify user is authenticated
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - please log in' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - invalid token' }, 401);
    }
    
    // Get user's leads
    const { data, error } = await supabase
      .from('agent_leads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user leads:', error);
      return c.json({ error: 'Failed to fetch your leads', details: error.message }, 500);
    }
    
    return c.json({ leads: data || [] });
  } catch (error) {
    console.error('Unexpected error fetching user leads:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * GET /agent-leads/admin/all
 * Get all agent leads (requires admin auth)
 */
app.get('/make-server-3bba8be8/agent-leads/admin/all', async (c) => {
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
    
    // Get filter parameters
    const status = c.req.query('status');
    const timeline = c.req.query('timeline');
    
    // Build query
    let query = supabase
      .from('agent_leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    
    if (timeline) {
      query = query.eq('timeline', timeline);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching all leads:', error);
      return c.json({ error: 'Failed to fetch leads', details: error.message }, 500);
    }
    
    return c.json({ leads: data || [] });
  } catch (error) {
    console.error('Unexpected error fetching all leads:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * GET /agent-leads/admin/stats
 * Get statistics about leads (requires admin auth)
 */
app.get('/make-server-3bba8be8/agent-leads/admin/stats', async (c) => {
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
    
    // Get all leads
    const { data: allLeads, error } = await supabase
      .from('agent_leads')
      .select('*');
    
    if (error) {
      console.error('Error fetching leads for stats:', error);
      return c.json({ error: 'Failed to fetch stats', details: error.message }, 500);
    }
    
    // Calculate statistics
    const stats = {
      total: allLeads.length,
      new: allLeads.filter(l => l.status === 'new').length,
      contacted: allLeads.filter(l => l.status === 'contacted').length,
      qualified: allLeads.filter(l => l.status === 'qualified').length,
      converted: allLeads.filter(l => l.status === 'converted').length,
      lost: allLeads.filter(l => l.status === 'lost').length,
      totalCommission: allLeads
        .filter(l => l.status === 'converted' && l.commission_amount)
        .reduce((sum, l) => sum + parseFloat(l.commission_amount), 0),
      paidCommission: allLeads
        .filter(l => l.commission_paid && l.commission_amount)
        .reduce((sum, l) => sum + parseFloat(l.commission_amount), 0),
      unpaidCommission: allLeads
        .filter(l => l.status === 'converted' && !l.commission_paid && l.commission_amount)
        .reduce((sum, l) => sum + parseFloat(l.commission_amount), 0),
    };
    
    return c.json({ stats });
  } catch (error) {
    console.error('Unexpected error fetching stats:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * PUT /agent-leads/admin/:id
 * Update a lead (requires admin auth)
 */
app.put('/make-server-3bba8be8/agent-leads/admin/:id', async (c) => {
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
    
    // If status is changing to 'contacted', set contacted_at
    if (body.status === 'contacted' && !body.contacted_at) {
      body.contacted_at = new Date().toISOString();
    }
    
    // If status is changing to 'converted', set sale_completed_at
    if (body.status === 'converted' && !body.sale_completed_at) {
      body.sale_completed_at = new Date().toISOString();
    }
    
    // Update the lead
    const { data, error } = await supabase
      .from('agent_leads')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating lead:', error);
      return c.json({ error: 'Failed to update lead', details: error.message }, 500);
    }
    
    return c.json({ success: true, lead: data });
  } catch (error) {
    console.error('Unexpected error updating lead:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * DELETE /agent-leads/admin/:id
 * Delete a lead (requires admin auth)
 */
app.delete('/make-server-3bba8be8/agent-leads/admin/:id', async (c) => {
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
      .from('agent_leads')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting lead:', error);
      return c.json({ error: 'Failed to delete lead', details: error.message }, 500);
    }
    
    return c.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Unexpected error deleting lead:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

export default app;