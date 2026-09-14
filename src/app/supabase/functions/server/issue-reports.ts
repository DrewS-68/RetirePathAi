// Village Issue Reports API Routes
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

// Initialize Supabase client
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );
};

/**
 * POST /issue-reports/submit
 * Submit an issue report for a village
 * Body: { villageId, villageName, issueType, description, reporterEmail? }
 */
app.post('/make-server-3bba8be8/issue-reports/submit', async (c) => {
  try {
    const { villageId, villageName, issueType, description, reporterEmail } = await c.req.json();

    if (!villageId || !villageName || !issueType || !description) {
      return c.json({ 
        error: 'Missing required fields: villageId, villageName, issueType, description' 
      }, 400);
    }

    // Create unique report ID
    const reportId = `${villageId}_${Date.now()}`;
    
    // Create report object
    const report = {
      id: reportId,
      villageId,
      villageName,
      issueType,
      description,
      reporterEmail: reporterEmail || 'anonymous',
      status: 'pending',
      submittedAt: new Date().toISOString(),
      resolvedAt: null,
      adminNotes: null,
    };

    // Store in KV store
    await kv.set(`issue_report:${reportId}`, report);

    console.log(`Issue report submitted for village ${villageId}: ${issueType}`);

    return c.json({ 
      success: true, 
      message: 'Issue report submitted successfully',
      reportId 
    });
  } catch (error: any) {
    console.error('Error submitting issue report:', error);
    return c.json({ error: 'Failed to submit issue report', details: error.message }, 500);
  }
});

/**
 * GET /issue-reports/all
 * Get all issue reports (admin only)
 * Query params: status (optional) - 'pending', 'resolved', 'dismissed'
 */
app.get('/make-server-3bba8be8/issue-reports/all', async (c) => {
  try {
    // Get all issue reports from KV store
    const reports = await kv.getByPrefix('issue_report:');
    
    // Filter by status if provided
    const statusFilter = c.req.query('status');
    let filteredReports = reports;
    
    if (statusFilter) {
      filteredReports = reports.filter((report: any) => report.status === statusFilter);
    }

    // Sort by submission date (newest first)
    filteredReports.sort((a: any, b: any) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    return c.json({ reports: filteredReports });
  } catch (error: any) {
    console.error('Error fetching issue reports:', error);
    return c.json({ error: 'Failed to fetch issue reports', details: error.message }, 500);
  }
});

/**
 * GET /issue-reports/village/:villageId
 * Get all issue reports for a specific village
 */
app.get('/make-server-3bba8be8/issue-reports/village/:villageId', async (c) => {
  try {
    const villageId = c.req.param('villageId');
    
    // Get all issue reports
    const allReports = await kv.getByPrefix('issue_report:');
    
    // Filter by village ID
    const villageReports = allReports.filter((report: any) => 
      report.villageId === villageId
    );

    // Sort by submission date (newest first)
    villageReports.sort((a: any, b: any) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    return c.json({ reports: villageReports });
  } catch (error: any) {
    console.error('Error fetching village issue reports:', error);
    return c.json({ error: 'Failed to fetch village issue reports', details: error.message }, 500);
  }
});

/**
 * PUT /issue-reports/:reportId/resolve
 * Resolve an issue report (admin only)
 * Body: { status: 'resolved' | 'dismissed', adminNotes: string }
 */
app.put('/make-server-3bba8be8/issue-reports/:reportId/resolve', async (c) => {
  try {
    const reportId = c.req.param('reportId');
    const { status, adminNotes } = await c.req.json();

    if (!status || !['resolved', 'dismissed'].includes(status)) {
      return c.json({ error: 'Invalid status. Must be "resolved" or "dismissed"' }, 400);
    }

    // Get existing report
    const report = await kv.get(`issue_report:${reportId}`);

    if (!report) {
      return c.json({ error: 'Issue report not found' }, 404);
    }

    // Update report
    const updatedReport = {
      ...report,
      status,
      adminNotes: adminNotes || null,
      resolvedAt: new Date().toISOString(),
    };

    await kv.set(`issue_report:${reportId}`, updatedReport);

    console.log(`Issue report ${reportId} marked as ${status}`);

    return c.json({ 
      success: true, 
      message: `Issue report ${status} successfully`,
      report: updatedReport 
    });
  } catch (error: any) {
    console.error('Error resolving issue report:', error);
    return c.json({ error: 'Failed to resolve issue report', details: error.message }, 500);
  }
});

/**
 * DELETE /issue-reports/:reportId
 * Delete an issue report (admin only)
 */
app.delete('/make-server-3bba8be8/issue-reports/:reportId', async (c) => {
  try {
    const reportId = c.req.param('reportId');

    // Check if report exists
    const report = await kv.get(`issue_report:${reportId}`);

    if (!report) {
      return c.json({ error: 'Issue report not found' }, 404);
    }

    // Delete from KV store
    await kv.del(`issue_report:${reportId}`);

    console.log(`Issue report ${reportId} deleted`);

    return c.json({ 
      success: true, 
      message: 'Issue report deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting issue report:', error);
    return c.json({ error: 'Failed to delete issue report', details: error.message }, 500);
  }
});

export default app;
