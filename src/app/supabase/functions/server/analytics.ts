// Analytics API endpoints for admin dashboard
import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Enable CORS
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'apikey'],
}));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

/**
 * GET /analytics/overview
 * Get overview statistics for the dashboard
 */
app.get('/make-server-3bba8be8/analytics/overview', async (c) => {
  try {
    // Verify admin access
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const dateRange = c.req.query('range') || '30'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));

    // Get all users from KV store
    const allUsers = await kv.getByPrefix('user:');
    
    // Calculate user stats
    const totalUsers = allUsers.length;
    const tierCounts = {
      free: allUsers.filter((u: any) => u.membershipTier === 'free').length,
      premium: allUsers.filter((u: any) => u.membershipTier === 'premium').length,
      family: allUsers.filter((u: any) => u.membershipTier === 'family').length,
    };

    // Get new users in date range
    const newUsers = allUsers.filter((u: any) => {
      const createdAt = new Date(u.createdAt);
      return createdAt >= startDate;
    }).length;

    // Get total villages
    const { count: totalVillages } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    // Get pending villages
    const { count: pendingVillages } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get featured villages
    const { count: featuredVillages } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .eq('is_featured', true);

    // Get total agent leads
    const { count: totalLeads } = await supabase
      .from('agent_leads_3bba8be8')
      .select('*', { count: 'exact', head: true });

    // Get new leads in date range
    const { count: newLeads } = await supabase
      .from('agent_leads_3bba8be8')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Get leads by status
    const { data: leadsByStatus } = await supabase
      .from('agent_leads_3bba8be8')
      .select('status');

    const leadStatusCounts = {
      new: leadsByStatus?.filter(l => l.status === 'new').length || 0,
      contacted: leadsByStatus?.filter(l => l.status === 'contacted').length || 0,
      qualified: leadsByStatus?.filter(l => l.status === 'qualified').length || 0,
      converted: leadsByStatus?.filter(l => l.status === 'converted').length || 0,
      closed: leadsByStatus?.filter(l => l.status === 'closed').length || 0,
    };

    // Calculate revenue estimates
    const monthlyRevenue = {
      memberships: (tierCounts.premium * 19) + (tierCounts.family * 39),
      featuredListings: (featuredVillages || 0) * 299, // Assuming $299/month per featured listing
      projectedCommissions: (leadStatusCounts.converted || 0) * 5000, // Estimated avg commission
    };

    const totalRevenue = 
      monthlyRevenue.memberships + 
      monthlyRevenue.featuredListings + 
      monthlyRevenue.projectedCommissions;

    return c.json({
      overview: {
        totalRevenue,
        totalUsers: totalUsers || 0,
        totalVillages: totalVillages || 0,
        totalLeads: totalLeads || 0,
        newUsers: newUsers || 0,
        newLeads: newLeads || 0,
      },
      revenue: monthlyRevenue,
      users: {
        total: totalUsers || 0,
        byTier: tierCounts,
        new: newUsers || 0,
      },
      villages: {
        total: totalVillages || 0,
        pending: pendingVillages || 0,
        featured: featuredVillages || 0,
      },
      leads: {
        total: totalLeads || 0,
        new: newLeads || 0,
        byStatus: leadStatusCounts,
      },
      dateRange: parseInt(dateRange),
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    return c.json({ error: 'Failed to fetch analytics', details: error.message }, 500);
  }
});

/**
 * GET /analytics/revenue-chart
 * Get revenue data over time for charts
 */
app.get('/make-server-3bba8be8/analytics/revenue-chart', async (c) => {
  try {
    // Verify admin access
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const days = parseInt(c.req.query('days') || '30');
    const chartData = [];

    // Get all users from KV store
    const allUsers = await kv.getByPrefix('user:');

    // Generate data for each day
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      // Get users created on this day
      const usersOnDay = allUsers.filter((u: any) => {
        const createdAt = new Date(u.createdAt);
        return createdAt >= date && createdAt < nextDate;
      });

      // Calculate revenue for this day
      const dayRevenue = {
        memberships: 0,
        leads: 0,
        total: 0,
      };

      usersOnDay.forEach((user: any) => {
        if (user.membershipTier === 'premium') dayRevenue.memberships += 19;
        if (user.membershipTier === 'family') dayRevenue.memberships += 39;
      });

      // Get leads created on this day
      const { count: leadsOnDay } = await supabase
        .from('agent_leads_3bba8be8')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDate.toISOString());

      dayRevenue.leads = (leadsOnDay || 0) * 50; // Estimated value per lead
      dayRevenue.total = dayRevenue.memberships + dayRevenue.leads;

      chartData.push({
        date: date.toISOString().split('T')[0],
        memberships: dayRevenue.memberships,
        leads: dayRevenue.leads,
        total: dayRevenue.total,
      });
    }

    return c.json({ data: chartData });
  } catch (error) {
    console.error('Error fetching revenue chart data:', error);
    return c.json({ error: 'Failed to fetch chart data', details: error.message }, 500);
  }
});

/**
 * GET /analytics/user-growth
 * Get user growth data over time
 */
app.get('/make-server-3bba8be8/analytics/user-growth', async (c) => {
  try {
    // Verify admin access
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const days = parseInt(c.req.query('days') || '30');
    const chartData = [];

    // Get all users from KV store
    const allUsers = await kv.getByPrefix('user:');

    // Generate data for each day
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      // Count users created up to this day
      const usersUpToDate = allUsers.filter((u: any) => {
        const createdAt = new Date(u.createdAt);
        return createdAt < nextDate;
      });

      const tierCounts = {
        free: usersUpToDate.filter((u: any) => u.membershipTier === 'free').length,
        premium: usersUpToDate.filter((u: any) => u.membershipTier === 'premium').length,
        family: usersUpToDate.filter((u: any) => u.membershipTier === 'family').length,
      };

      chartData.push({
        date: date.toISOString().split('T')[0],
        total: usersUpToDate.length,
        free: tierCounts.free,
        premium: tierCounts.premium,
        family: tierCounts.family,
      });
    }

    return c.json({ data: chartData });
  } catch (error) {
    console.error('Error fetching user growth data:', error);
    return c.json({ error: 'Failed to fetch chart data', details: error.message }, 500);
  }
});

/**
 * GET /analytics/top-villages
 * Get top performing villages by views/inquiries
 */
app.get('/make-server-3bba8be8/analytics/top-villages', async (c) => {
  try {
    // Verify admin access
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const limit = parseInt(c.req.query('limit') || '10');

    // Get villages sorted by views (we'll need to add a views column later)
    const { data: villages } = await supabase
      .from('retirement_villages')
      .select('id, name, suburb, state, is_featured')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);

    // For now, return basic data
    // TODO: Add views tracking to villages table
    const topVillages = villages?.map((village, index) => ({
      ...village,
      views: Math.floor(Math.random() * 1000), // Placeholder until we add real tracking
      inquiries: Math.floor(Math.random() * 50), // Placeholder
      rank: index + 1,
    })) || [];

    return c.json({ data: topVillages });
  } catch (error) {
    console.error('Error fetching top villages:', error);
    return c.json({ error: 'Failed to fetch top villages', details: error.message }, 500);
  }
});

/**
 * GET /analytics/lead-sources
 * Get breakdown of lead sources
 */
app.get('/make-server-3bba8be8/analytics/lead-sources', async (c) => {
  try {
    // Verify admin access
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: leads } = await supabase
      .from('agent_leads_3bba8be8')
      .select('lead_source');

    const sourceCounts = {};
    leads?.forEach(lead => {
      const source = lead.lead_source || 'unknown';
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });

    const chartData = Object.entries(sourceCounts).map(([name, value]) => ({
      name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value,
    }));

    return c.json({ data: chartData });
  } catch (error) {
    console.error('Error fetching lead sources:', error);
    return c.json({ error: 'Failed to fetch lead sources', details: error.message }, 500);
  }
});

export default app;