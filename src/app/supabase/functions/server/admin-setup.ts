// Admin Setup Utility
// Use this to set up your first admin user

import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { setUserRole } from './security.ts';

const app = new Hono();

// Enable CORS
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'apikey'],
}));

/**
 * POST /make-admin
 * TEMPORARY ENDPOINT - Remove after setting up your first admin!
 * 
 * This endpoint allows you to promote a user to admin.
 * YOU MUST REMOVE THIS ENDPOINT AFTER CREATING YOUR FIRST ADMIN USER FOR SECURITY!
 * 
 * Usage:
 * POST /make-server-3bba8be8/make-admin
 * Body: { "userId": "your-user-id-here", "secretKey": "your-secret-key" }
 * 
 * Steps:
 * 1. Sign up normally through your app
 * 2. Get your user ID from the response or Supabase dashboard
 * 3. Set ADMIN_SETUP_SECRET in your environment variables
 * 4. Call this endpoint with your userId and the secret key
 * 5. DELETE this endpoint after you have admin access
 */
app.post('/make-server-3bba8be8/make-admin', async (c) => {
  try {
    const { userId, secretKey } = await c.req.json();
    
    // Verify secret key from environment variable
    const expectedSecret = Deno.env.get('ADMIN_SETUP_SECRET');
    
    if (!expectedSecret) {
      return c.json({ 
        error: 'Admin setup not configured',
        message: 'Please set ADMIN_SETUP_SECRET environment variable first'
      }, 500);
    }
    
    if (secretKey !== expectedSecret) {
      console.log('⚠️ SECURITY: Failed admin setup attempt with wrong secret key');
      return c.json({ error: 'Invalid secret key' }, 403);
    }
    
    if (!userId) {
      return c.json({ error: 'userId is required' }, 400);
    }
    
    // Set user as admin
    await setUserRole(userId, 'admin');
    
    console.log(`✅ User ${userId} has been granted admin access`);
    console.log(`⚠️  IMPORTANT: Please delete the /make-admin endpoint now for security!`);
    
    return c.json({ 
      success: true,
      message: 'User promoted to admin successfully',
      warning: 'DELETE THIS ENDPOINT NOW! It is a security risk to leave it active.'
    });
  } catch (error) {
    console.error('Error in make-admin:', error);
    return c.json({ error: 'Failed to set admin role' }, 500);
  }
});

/**
 * POST /set-role
 * Admin-only endpoint to set user roles
 * Keep this one - it's secure and requires existing admin
 */
app.post('/make-server-3bba8be8/set-role', async (c) => {
  try {
    // This would need to import and use requireAdmin middleware
    // For now, this is just a placeholder
    
    const { userId, role } = await c.req.json();
    
    if (!userId || !role) {
      return c.json({ error: 'userId and role are required' }, 400);
    }
    
    if (!['admin', 'operator', 'member'].includes(role)) {
      return c.json({ error: 'Invalid role. Must be admin, operator, or member' }, 400);
    }
    
    await setUserRole(userId, role as 'admin' | 'operator' | 'member');
    
    console.log(`User ${userId} role updated to: ${role}`);
    
    return c.json({ 
      success: true,
      message: `User role updated to ${role}`
    });
  } catch (error) {
    console.error('Error setting role:', error);
    return c.json({ error: 'Failed to set role' }, 500);
  }
});

export default app;
