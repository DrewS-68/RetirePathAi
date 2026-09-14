// Reviews API endpoints
import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { rateLimiters, requireAdmin, sanitizeHtml, sanitizeText, logSecurityEvent } from './security.ts';
import { validateInput, reviewSchema, reviewModerationSchema } from './validation.ts';

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
 * POST /reviews
 * Submit a new review for a village
 */
app.post('/make-server-3bba8be8/reviews', rateLimiters.reviews, async (c) => {
  try {
    // Verify user is authenticated
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - Please log in to submit a review' }, 401);
    }

    const body = await c.req.json();
    
    // Validate input with Zod schema
    const validation = validateInput(reviewSchema, body);
    const { village_id, rating, title, comment, experience_type, stayed_duration } = validation;
    
    // Sanitize text inputs to prevent XSS
    const sanitizedTitle = sanitizeText(title);
    const sanitizedComment = sanitizeText(comment);

    // Check if village exists
    const { data: village, error: villageError } = await supabase
      .from('retirement_villages')
      .select('id, name')
      .eq('id', village_id)
      .single();

    if (villageError || !village) {
      return c.json({ error: 'Village not found' }, 404);
    }

    // Check if user already reviewed this village
    const { data: existingReview } = await supabase
      .from('village_reviews_3bba8be8')
      .select('id')
      .eq('village_id', village_id)
      .eq('user_id', user.id)
      .single();

    if (existingReview) {
      await logSecurityEvent({
        type: 'suspicious_activity',
        userId: user.id,
        endpoint: '/reviews',
        details: `User attempted to submit duplicate review for village ${village_id}`,
        timestamp: new Date().toISOString()
      });
      
      return c.json({ error: 'You have already reviewed this village' }, 400);
    }

    // Create review
    const { data: review, error: createError } = await supabase
      .from('village_reviews_3bba8be8')
      .insert({
        village_id,
        user_id: user.id,
        user_email: user.email,
        rating,
        title: sanitizedTitle,
        comment: sanitizedComment,
        experience_type: experience_type || null,
        stayed_duration: stayed_duration || null,
        status: 'pending', // Reviews start as pending for moderation
        helpful_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating review:', createError);
      return c.json({ error: 'Failed to create review', details: createError.message }, 500);
    }

    console.log(`New review submitted by user ${user.id} for village ${village_id}`);

    return c.json({ 
      message: 'Review submitted successfully and is pending approval',
      review 
    }, 201);
  } catch (error) {
    // Check if it's a validation error
    if (error && typeof error === 'object' && 'type' in error && error.type === 'validation_error') {
      return c.json({ 
        error: 'Invalid input',
        details: error.errors 
      }, 400);
    }
    
    console.error('Error in POST /reviews:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * GET /reviews/village/:villageId
 * Get all approved reviews for a village
 */
app.get('/make-server-3bba8be8/reviews/village/:villageId', async (c) => {
  try {
    const villageId = c.req.param('villageId');

    const { data: reviews, error } = await supabase
      .from('village_reviews_3bba8be8')
      .select('*')
      .eq('village_id', villageId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return c.json({ error: 'Failed to fetch reviews', details: error.message }, 500);
    }

    // Calculate average rating
    const totalRating = reviews?.reduce((sum, review) => sum + review.rating, 0) || 0;
    const averageRating = reviews && reviews.length > 0 ? totalRating / reviews.length : 0;

    return c.json({ 
      reviews: reviews || [],
      count: reviews?.length || 0,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    });
  } catch (error) {
    console.error('Error in GET /reviews/village:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * GET /reviews/user
 * Get all reviews by the authenticated user
 */
app.get('/make-server-3bba8be8/reviews/user', async (c) => {
  try {
    // Verify user is authenticated
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: reviews, error } = await supabase
      .from('village_reviews_3bba8be8')
      .select(`
        *,
        retirement_villages (
          id,
          name,
          suburb,
          state
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user reviews:', error);
      return c.json({ error: 'Failed to fetch reviews', details: error.message }, 500);
    }

    return c.json({ reviews: reviews || [] });
  } catch (error) {
    console.error('Error in GET /reviews/user:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * PUT /reviews/:reviewId/helpful
 * Mark a review as helpful
 */
app.put('/make-server-3bba8be8/reviews/:reviewId/helpful', async (c) => {
  try {
    const reviewId = c.req.param('reviewId');

    // Get current review
    const { data: review, error: fetchError } = await supabase
      .from('village_reviews_3bba8be8')
      .select('helpful_count')
      .eq('id', reviewId)
      .single();

    if (fetchError || !review) {
      return c.json({ error: 'Review not found' }, 404);
    }

    // Increment helpful count
    const { error: updateError } = await supabase
      .from('village_reviews_3bba8be8')
      .update({ 
        helpful_count: (review.helpful_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId);

    if (updateError) {
      console.error('Error updating helpful count:', updateError);
      return c.json({ error: 'Failed to update review', details: updateError.message }, 500);
    }

    return c.json({ message: 'Review marked as helpful' });
  } catch (error) {
    console.error('Error in PUT /reviews/helpful:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * GET /reviews/admin/all
 * Get all reviews (for admin)
 */
app.get('/make-server-3bba8be8/reviews/admin/all', requireAdmin, async (c) => {
  try {
    const status = c.req.query('status'); // Optional filter by status

    let query = supabase
      .from('village_reviews_3bba8be8')
      .select(`
        *,
        retirement_villages (
          id,
          name,
          suburb,
          state
        )
      `);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: reviews, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin reviews:', error);
      return c.json({ error: 'Failed to fetch reviews', details: error.message }, 500);
    }

    return c.json({ reviews: reviews || [] });
  } catch (error) {
    console.error('Error in GET /reviews/admin/all:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * PUT /reviews/admin/:reviewId/approve
 * Approve a review
 */
app.put('/make-server-3bba8be8/reviews/admin/:reviewId/approve', requireAdmin, async (c) => {
  try {
    const reviewId = c.req.param('reviewId');
    const user = c.get('user'); // User is set by requireAdmin middleware

    const { error: updateError } = await supabase
      .from('village_reviews_3bba8be8')
      .update({ 
        status: 'approved',
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId);

    if (updateError) {
      console.error('Error approving review:', updateError);
      return c.json({ error: 'Failed to approve review', details: updateError.message }, 500);
    }

    console.log(`Review ${reviewId} approved by admin ${user.id}`);

    return c.json({ message: 'Review approved successfully' });
  } catch (error) {
    console.error('Error in PUT /reviews/admin/approve:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * PUT /reviews/admin/:reviewId/reject
 * Reject a review
 */
app.put('/make-server-3bba8be8/reviews/admin/:reviewId/reject', requireAdmin, async (c) => {
  try {
    const reviewId = c.req.param('reviewId');
    const body = await c.req.json();
    const user = c.get('user'); // User is set by requireAdmin middleware
    
    // Validate rejection reason if provided
    if (body.reason) {
      const validation = validateInput(reviewModerationSchema, body);
    }

    const { reason } = body;

    const { error: updateError } = await supabase
      .from('village_reviews_3bba8be8')
      .update({ 
        status: 'rejected',
        rejection_reason: reason || null,
        rejected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId);

    if (updateError) {
      console.error('Error rejecting review:', updateError);
      return c.json({ error: 'Failed to reject review', details: updateError.message }, 500);
    }

    console.log(`Review ${reviewId} rejected by admin ${user.id}`);

    return c.json({ message: 'Review rejected successfully' });
  } catch (error) {
    // Check if it's a validation error
    if (error && typeof error === 'object' && 'type' in error && error.type === 'validation_error') {
      return c.json({ 
        error: 'Invalid input',
        details: error.errors 
      }, 400);
    }
    
    console.error('Error in PUT /reviews/admin/reject:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * DELETE /reviews/admin/:reviewId
 * Delete a review
 */
app.delete('/make-server-3bba8be8/reviews/admin/:reviewId', requireAdmin, async (c) => {
  try {
    const reviewId = c.req.param('reviewId');
    const user = c.get('user'); // User is set by requireAdmin middleware

    const { error: deleteError } = await supabase
      .from('village_reviews_3bba8be8')
      .delete()
      .eq('id', reviewId);

    if (deleteError) {
      console.error('Error deleting review:', deleteError);
      return c.json({ error: 'Failed to delete review', details: deleteError.message }, 500);
    }

    console.log(`Review ${reviewId} deleted by admin ${user.id}`);
    
    await logSecurityEvent({
      type: 'unauthorized_access',
      userId: user.id,
      endpoint: '/reviews/admin/delete',
      details: `Admin deleted review ${reviewId}`,
      timestamp: new Date().toISOString()
    });

    return c.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /reviews/admin:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;