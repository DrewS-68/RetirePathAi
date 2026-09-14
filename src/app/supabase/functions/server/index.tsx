import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import * as kv from "./kv_store.tsx";
import * as stripeHelpers from "./stripe-helpers.ts";
import villageCleanupApp from "./village-cleanup.ts";
import vicCleanupApp from "./vic-cleanup.ts";
import bulkUrlFixerApp from "./bulk-url-fixer.ts";
import autoUrlFinderApp from "./auto-url-finder.ts";
import villagesApp from "./villages.ts";
import analyticsApp from "./analytics.ts";
import reviewsApp from "./reviews.ts";
import agentLeadsApp from "./agent-leads.ts";
import issueReportsApp from "./issue-reports.ts";
import databaseStatsApp from "./database-stats.ts";
import adminSetupApp from "./admin-setup.ts";
import storageApp from "./storage.ts";
import dataEnrichmentApp from "./data-enrichment.ts";
import adminApp from "./admin.ts";
import batchScrapingApp from "./batch-scraping.ts";
import bulkClassifierApp from "./bulk-classifier.ts";
import manualClassifierApp from "./manual-classifier.ts";
import villageFixerApp from "./village-fixer.ts";
import vicBulkAddApp from "./vic-bulk-add.ts";
import vicOperatorClearerApp from "./vic-operator-clearer.ts";
import vicOperatorUpdaterApp from "./vic-operator-updater.ts";
import vicReconcileApp from "./vic-reconcile.ts";
import simpleScraperApp from "./simple-scraper.ts";
import operatorScraperApp from "./operator-scraper.ts";
import vicOperatorScraperApp from "./vic-operator-scraper.ts";
import smartOperatorScraperApp from "./smart-operator-scraper.ts";
import vicFieldInspectorApp from "./vic-field-inspector.ts";
import vicOperatorExtractorApp from "./vic-operator-extractor.ts";
import vicOperatorWhitelistApp from "./vic-operator-whitelist.ts";
import vicOperatorPatternsApp from "./vic-operator-patterns.ts";
import scraperApp from "./scraper.ts";
import autoPatternDetectorApp from "./auto-pattern-detector.ts";
import patternDiagnosticsApp from "./pattern-diagnostics.ts";
import databaseHealthCheckApp from "./database-health-check.ts";
import vicMasterScrapeApp from "./vic-master-scrape.ts";
import patternOnlyScraperApp from "./pattern-only-scraper.ts";
import googleSearchScraperApp from "./google-search-scraper.ts";
import urlPatternGuesserApp from "./url-pattern-guesser.ts";
import vicBlacklistCleanupApp from "./vic-blacklist-cleanup.ts";
import vicUrlDiagnosticApp from "./vic-url-diagnostic.ts";
import vicUrlCleanupBackendApp from "./vic-url-cleanup-backend.ts";
import vicMultiStrategyScraperApp from "./vic-multi-strategy-scraper.ts";
import vicOperatorDomainsUploadApp from "./vic-operator-domains-upload.ts";
import { vicOperatorDomainScraperRoute } from "./vic-operator-domain-scraper.ts";
import { australianUnityAuditRoute, australianUnityCleanupRoute } from "./australian-unity-cleanup.ts";
import { 
  shouldMockOperatorExtraction,
  rateLimiters, 
  requireAuth, 
  requireAdmin,
  sanitizeText,
  isStrongPassword,
  logSecurityEvent 
} from "./security.ts";
import { validateInput, signupSchema } from "./validation.ts";

// Backend server for RetirePath
const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS - Allow all origins for Figma Make preview
app.use(
  "/*",
  cors({
    origin: "*", // Allow all origins
    allowHeaders: ["Content-Type", "Authorization", "apikey", "x-client-info"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length", "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
    maxAge: 600,
    credentials: false,
  }),
);

// Handle OPTIONS preflight requests explicitly
app.options("/*", (c) => {
  return c.text("", 204);
});

// Health check endpoint
app.get("/make-server-3bba8be8/health", (c) => {
  return c.json({ 
    status: "ok", 
    version: "1.40-vic-operator-domain-scraper-dual-query",
    timestamp: new Date().toISOString()
  });
});

// Sign up endpoint
app.post("/make-server-3bba8be8/signup", rateLimiters.auth, async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate input with Zod schema
    const validation = validateInput(signupSchema, body);
    const { email, password, name, membershipTier } = validation;
    
    // Sanitize name to prevent XSS
    const sanitizedName = sanitizeText(name);
    
    // Check password strength
    const passwordCheck = isStrongPassword(password);
    if (!passwordCheck.valid) {
      await logSecurityEvent({
        type: 'invalid_input',
        endpoint: '/signup',
        details: `Weak password attempt for email: ${email}`,
        timestamp: new Date().toISOString()
      });
      
      return c.json({ 
        error: 'Password does not meet security requirements',
        details: passwordCheck.errors
      }, 400);
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: sanitizedName },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (authError) {
      console.log(`Auth error during user signup: ${authError.message}`);
      
      await logSecurityEvent({
        type: 'auth_failure',
        endpoint: '/signup',
        details: `Signup failed for email: ${email} - ${authError.message}`,
        timestamp: new Date().toISOString()
      });
      
      return c.json({ error: authError.message }, 400);
    }

    // Store user profile in KV store
    const userId = authData.user.id;
    const userProfile = {
      id: userId,
      email,
      name: sanitizedName,
      membershipTier: membershipTier || 'free',
      createdAt: new Date().toISOString(),
      stripeCustomerId: null,
      subscriptionStatus: 'active'
    };

    await kv.set(`user:${userId}`, userProfile);
    
    // Set default role as 'member'
    await kv.set(`user:${userId}:role`, 'member');

    console.log(`New user signed up: ${userId} (${email})`);

    return c.json({ 
      success: true,
      user: {
        id: userId,
        email,
        name: sanitizedName,
        membershipTier: userProfile.membershipTier
      }
    });
  } catch (error) {
    // Check if it's a validation error
    if (error && typeof error === 'object' && 'type' in error && error.type === 'validation_error') {
      return c.json({ 
        error: 'Invalid input',
        details: error.errors 
      }, 400);
    }
    
    console.log(`Error during signup: ${error}`);
    return c.json({ error: "Signup failed" }, 500);
  }
});

// Get user profile endpoint
app.get("/make-server-3bba8be8/user/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      console.log(`Auth error while fetching user profile: ${authError?.message}`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get user profile from KV store
    const userProfile = await kv.get(`user:${user.id}`);

    if (!userProfile) {
      return c.json({ error: "User profile not found" }, 404);
    }

    return c.json({ profile: userProfile });
  } catch (error) {
    console.log(`Error fetching user profile: ${error}`);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

// Update membership tier endpoint
app.post("/make-server-3bba8be8/user/update-membership", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      console.log(`Auth error while updating membership: ${authError?.message}`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { membershipTier, stripeCustomerId, subscriptionStatus } = await c.req.json();

    // Get existing profile
    const userProfile = await kv.get(`user:${user.id}`);

    if (!userProfile) {
      return c.json({ error: "User profile not found" }, 404);
    }

    // Update profile
    const updatedProfile = {
      ...userProfile,
      membershipTier: membershipTier || userProfile.membershipTier,
      stripeCustomerId: stripeCustomerId || userProfile.stripeCustomerId,
      subscriptionStatus: subscriptionStatus || userProfile.subscriptionStatus,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`user:${user.id}`, updatedProfile);

    return c.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.log(`Error updating membership: ${error}`);
    return c.json({ error: "Failed to update membership" }, 500);
  }
});

// Record legal acknowledgment endpoint
app.post("/make-server-3bba8be8/user/acknowledge-legal", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      console.log(`Auth error while recording legal acknowledgment: ${authError?.message}`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get existing profile
    const userProfile = await kv.get(`user:${user.id}`);

    if (!userProfile) {
      return c.json({ error: "User profile not found" }, 404);
    }

    // Update profile with legal acknowledgment
    const updatedProfile = {
      ...userProfile,
      legalAcknowledgedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`user:${user.id}`, updatedProfile);

    return c.json({ success: true, legalAcknowledgedAt: updatedProfile.legalAcknowledgedAt });
  } catch (error) {
    console.log(`Error recording legal acknowledgment: ${error}`);
    return c.json({ error: "Failed to record acknowledgment" }, 500);
  }
});

// Check feature access endpoint
app.post("/make-server-3bba8be8/user/check-access", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { feature } = await c.req.json();

    // Get user profile
    let userProfile = await kv.get(`user:${user.id}`);

    if (!userProfile) {
      return c.json({ error: "User profile not found" }, 404);
    }

    // Check if membership has expired
    if (userProfile.membershipExpiresAt) {
      const expirationDate = new Date(userProfile.membershipExpiresAt);
      const now = new Date();
      
      if (now > expirationDate && userProfile.membershipTier !== 'free') {
        // Membership has expired, downgrade to free
        userProfile = {
          ...userProfile,
          membershipTier: 'free',
          subscriptionStatus: 'expired',
          updatedAt: now.toISOString()
        };
        
        await kv.set(`user:${user.id}`, userProfile);
        console.log(`User ${user.id} membership expired, downgraded to free`);
      }
    }

    // Define feature access by tier
    const accessRules = {
      free: ['home-valuation', 'resources', 'guides', 'operator-dashboard'],
      premium: ['home-valuation', 'resources', 'guides', 'contract-review', 'village-matcher', 'progress-tracker', 'family-guide', 'operator-dashboard'],
      family: ['home-valuation', 'resources', 'guides', 'contract-review', 'village-matcher', 'progress-tracker', 'family-guide', 'operator-dashboard']
    };

    const userTier = userProfile.membershipTier || 'free';
    const hasAccess = accessRules[userTier]?.includes(feature) || false;

    return c.json({ 
      hasAccess, 
      membershipTier: userTier,
      membershipExpiresAt: userProfile.membershipExpiresAt || null
    });
  } catch (error) {
    console.log(`Error checking feature access: ${error}`);
    return c.json({ error: "Failed to check access" }, 500);
  }
});

// Create Stripe Checkout Session endpoint
app.post("/make-server-3bba8be8/create-checkout-session", rateLimiters.payment, async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      console.log(`Auth error while creating checkout session: ${authError?.message}`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { membershipTier, duration, amount } = await c.req.json();

    if (!membershipTier || membershipTier === 'free') {
      return c.json({ error: "Invalid membership tier" }, 400);
    }

    if (!duration || ![1, 3, 6].includes(duration)) {
      return c.json({ error: "Invalid duration" }, 400);
    }

    if (!amount || amount <= 0) {
      return c.json({ error: "Invalid amount" }, 400);
    }

    // Get user profile
    const userProfile = await kv.get(`user:${user.id}`);

    if (!userProfile) {
      return c.json({ error: "User profile not found" }, 404);
    }

    // Validate pricing
    const expectedPrices = {
      premium: {
        1: 19,
        3: 51,
        6: 95
      },
      family: {
        1: 39,
        3: 105,
        6: 195
      }
    };

    const expectedAmount = expectedPrices[membershipTier as 'premium' | 'family'][duration as 1 | 3 | 6];
    
    if (amount !== expectedAmount) {
      return c.json({ error: "Invalid amount for selected tier and duration" }, 400);
    }

    const priceInCents = amount * 100; // Convert dollars to cents

    // Create Stripe Checkout Session
    const session = await stripeHelpers.createCheckoutSession({
      userId: user.id,
      userEmail: userProfile.email,
      membershipTier: membershipTier,
      duration: duration,
      priceInCents: priceInCents,
      successUrl: `${Deno.env.get('APP_URL')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${Deno.env.get('APP_URL')}/`,
    });

    console.log(`Stripe checkout session created for user ${user.id}: ${session.id} (${duration} months)`);

    return c.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.log(`Error creating checkout session: ${error}`);
    return c.json({ error: "Failed to create checkout session" }, 500);
  }
});

// Stripe Webhook endpoint
app.post("/make-server-3bba8be8/stripe-webhook", async (c) => {
  try {
    const signature = c.req.header('stripe-signature');
    const body = await c.req.text();

    if (!signature) {
      console.log('No Stripe signature found in webhook request');
      return c.json({ error: "No signature" }, 400);
    }

    let event;
    try {
      event = stripeHelpers.constructEvent(
        body,
        signature,
        Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
      );
    } catch (err) {
      console.log(`Webhook signature verification failed: ${err}`);
      return c.json({ error: "Webhook signature verification failed" }, 400);
    }

    console.log(`Received Stripe webhook event: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as stripeHelpers.StripeCheckoutSession;
        const userId = session.client_reference_id || session.metadata?.userId;
        const membershipTier = session.metadata?.membershipTier;
        const duration = parseInt(session.metadata?.duration || '1');

        if (userId && membershipTier) {
          // Update user's membership
          const userProfile = await kv.get(`user:${userId}`);
          
          if (userProfile) {
            // Calculate expiration date based on duration
            const now = new Date();
            const expirationDate = new Date(now);
            expirationDate.setMonth(expirationDate.getMonth() + duration);
            
            const updatedProfile = {
              ...userProfile,
              membershipTier: membershipTier,
              stripeCustomerId: session.customer as string,
              subscriptionStatus: 'active',
              subscriptionDuration: duration,
              membershipExpiresAt: expirationDate.toISOString(),
              updatedAt: now.toISOString()
            };
            
            await kv.set(`user:${userId}`, updatedProfile);
            console.log(`User ${userId} upgraded to ${membershipTier} for ${duration} months (expires: ${expirationDate.toISOString()})`);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as stripeHelpers.StripeSubscription;
        const customerId = subscription.customer as string;
        
        // Find user by Stripe customer ID
        const users = await kv.getByPrefix('user:');
        const user = users.find((u: any) => u.stripeCustomerId === customerId);
        
        if (user) {
          const updatedProfile = {
            ...user,
            subscriptionStatus: subscription.status,
            updatedAt: new Date().toISOString()
          };
          
          await kv.set(`user:${user.id}`, updatedProfile);
          console.log(`Subscription updated for user ${user.id}: ${subscription.status}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as stripeHelpers.StripeSubscription;
        const customerId = subscription.customer as string;
        
        // Find user by Stripe customer ID
        const users = await kv.getByPrefix('user:');
        const user = users.find((u: any) => u.stripeCustomerId === customerId);
        
        if (user) {
          const updatedProfile = {
            ...user,
            membershipTier: 'free',
            subscriptionStatus: 'canceled',
            updatedAt: new Date().toISOString()
          };
          
          await kv.set(`user:${user.id}`, updatedProfile);
          console.log(`Subscription canceled for user ${user.id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return c.json({ received: true });
  } catch (error) {
    console.log(`Error processing webhook: ${error}`);
    return c.json({ error: "Webhook processing failed" }, 500);
  }
});

// Fix duplicate images endpoint
app.post("/make-server-3bba8be8/fix-duplicate-images", async (c) => {
  try {
    console.log("🔧 Starting duplicate image fix...");

    // Step 1: Fetch ALL villages using pagination
    const allVillages: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      console.log(`📥 Fetching page ${page + 1} (rows ${from}-${to})...`);

      const { data, error: fetchError } = await supabase
        .from('retirement_villages')
        .select('id, name, operator, images')
        .eq('status', 'approved')
        .range(from, to);

      if (fetchError) {
        console.error(`Fetch error: ${fetchError.message}`);
        return c.json({ error: `Fetch error: ${fetchError.message}` }, 500);
      }

      if (data && data.length > 0) {
        allVillages.push(...data);
        
        if (data.length < pageSize) {
          hasMore = false;
        } else {
          page++;
        }
      } else {
        hasMore = false;
      }
    }

    console.log(`✅ Fetched ${allVillages.length} total villages`);

    // Step 2: Find duplicate image URLs
    const imageToVillages: { [url: string]: any[] } = {};
    
    allVillages.forEach((village) => {
      if (village.images && village.images.length > 0) {
        village.images.forEach((imageUrl: string) => {
          if (!imageToVillages[imageUrl]) {
            imageToVillages[imageUrl] = [];
          }
          imageToVillages[imageUrl].push(village);
        });
      }
    });

    // Step 3: Identify duplicates (images used by more than 1 village)
    const duplicates: { [url: string]: any[] } = {};
    Object.entries(imageToVillages).forEach(([url, villages]) => {
      if (villages.length > 1) {
        duplicates[url] = villages;
      }
    });

    console.log(`🔍 Found ${Object.keys(duplicates).length} duplicate image URLs`);

    // Step 4: For each duplicate, keep it only for the FIRST village, remove from others
    const updates: { id: string; name: string; oldImages: string[]; newImages: string[] }[] = [];

    Object.entries(duplicates).forEach(([url, villages]) => {
      console.log(`📸 Image "${url}" is used by ${villages.length} villages`);
      
      villages.forEach((village, index) => {
        if (index === 0) {
          // Keep for the first village
          console.log(`   ✅ KEEP for: ${village.name}`);
        } else {
          // Remove from other villages
          console.log(`   ❌ REMOVE from: ${village.name}`);
          
          const oldImages = village.images || [];
          const newImages = oldImages.filter((img: string) => img !== url);
          
          updates.push({
            id: village.id,
            name: village.name,
            oldImages,
            newImages
          });
        }
      });
    });

    console.log(`📝 Will update ${updates.length} villages`);

    // Step 5: Update villages to remove duplicate images
    let updated = 0;
    let failed = 0;

    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('retirement_villages')
        .update({ images: update.newImages })
        .eq('id', update.id);

      if (updateError) {
        console.error(`❌ Failed to update ${update.name}:`, updateError.message);
        failed++;
      } else {
        console.log(`✅ Updated ${update.name}: ${update.oldImages.length} → ${update.newImages.length} images`);
        updated++;
      }
    }

    const summary = {
      totalVillages: allVillages.length,
      villagesWithImages: allVillages.filter(v => v.images && v.images.length > 0).length,
      duplicateUrls: Object.keys(duplicates).length,
      villagesUpdated: updated,
      villagesFailed: failed,
      duplicateExamples: Object.entries(duplicates).slice(0, 5).map(([url, villages]) => ({
        url,
        affectedVillages: villages.length,
        villages: villages.map(v => v.name).join(', ')
      }))
    };

    console.log('🎉 DUPLICATE FIX COMPLETE:', summary);
    return c.json(summary);

  } catch (error: any) {
    console.error("Error in fix-duplicate-images:", error);
    return c.json({ error: error.message || "Failed to fix duplicate images" }, 500);
  }
});

// Delete all VIC villages endpoint (uses SERVICE_ROLE_KEY to bypass RLS)
app.post("/make-server-3bba8be8/admin/delete-vic-villages", requireAdmin, async (c) => {
  try {
    console.log("🗑️  Starting VIC village deletion (admin request)...");

    // Count first
    const { count: beforeCount, error: countError } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'VIC');

    if (countError) {
      console.error(`Count error: ${countError.message}`);
      return c.json({ error: `Count error: ${countError.message}` }, 500);
    }

    console.log(`Found ${beforeCount} VIC villages to delete`);

    // Delete using SERVICE_ROLE_KEY (bypasses RLS)
    const { error: deleteError, count: deletedCount } = await supabase
      .from('retirement_villages')
      .delete({ count: 'exact' })
      .eq('state', 'VIC');

    if (deleteError) {
      console.error(`Delete error: ${deleteError.message}`);
      return c.json({ error: `Delete error: ${deleteError.message}` }, 500);
    }

    console.log(`✅ Deleted ${deletedCount} VIC villages`);

    return c.json({
      success: true,
      beforeCount,
      deletedCount
    });

  } catch (error: any) {
    console.error("Error in delete-vic-villages:", error);
    return c.json({ error: error.message || "Failed to delete VIC villages" }, 500);
  }
});

// Promote user to admin (temporary endpoint for setup)
app.post("/make-server-3bba8be8/admin/promote-self", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - No token provided' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }

    // Promote user to admin
    await kv.set(`user:${user.id}:role`, 'admin');
    
    console.log(`🔑 User ${user.id} (${user.email}) promoted to admin`);

    return c.json({
      success: true,
      userId: user.id,
      email: user.email,
      role: 'admin'
    });

  } catch (error: any) {
    console.error("Error promoting user:", error);
    return c.json({ error: error.message || "Failed to promote user" }, 500);
  }
});

// Mount village routes
app.route('/', villagesApp);

// Mount agent leads routes
app.route('/', agentLeadsApp);

// Mount analytics routes
app.route('/', analyticsApp);

// Mount reviews routes
app.route('/', reviewsApp);

// Mount issue reports routes
app.route('/', issueReportsApp);

// Mount admin setup routes
app.route('/', adminSetupApp);

// Mount storage routes
app.route('/', storageApp);

// Mount data enrichment routes
app.route('/', dataEnrichmentApp);

// Mount admin routes
app.route('/', adminApp);

// Mount batch scraping routes
app.route('/', batchScrapingApp);

// Mount scraper routes
app.route('/', scraperApp);

// Mount pattern-only scraper routes (NO Google Search - FAST!)
app.route('/', patternOnlyScraperApp);

// Mount bulk classifier routes
app.route('/', bulkClassifierApp);

// Mount database stats routes
app.route('/', databaseStatsApp);

// Mount manual classifier routes
app.route('/', manualClassifierApp);

// Mount village fixer routes
app.route('/', villageFixerApp);

// Mount village cleanup routes
app.route('/', villageCleanupApp);

// Mount vic cleanup routes
app.route('/', vicCleanupApp);

// Mount bulk URL fixer routes
app.route('/', bulkUrlFixerApp);

// Mount auto URL finder routes
app.route('/', autoUrlFinderApp);

// Mount VIC bulk add routes
app.route('/', vicBulkAddApp);

// Mount VIC operator clearer routes
app.route('/', vicOperatorClearerApp);

// Mount VIC operator updater routes
app.route('/', vicOperatorUpdaterApp);

// Mount VIC reconcile routes
app.route('/', vicReconcileApp);

// VIC Village Real-Time Counter routes
app.get('/make-server-3bba8be8/admin/vic-villages/count', async (c) => {
  try {
    const { count, error } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'VIC');

    if (error) {
      console.error('Error counting VIC villages:', error);
      return c.json({ error: error.message }, 500);
    }

    console.log(`✅ VIC village count: ${count}`);
    return c.json({ count: count || 0 });
  } catch (err) {
    console.error('Error in VIC count endpoint:', err);
    return c.json({ error: 'Failed to count VIC villages' }, 500);
  }
});

app.get('/make-server-3bba8be8/admin/vic-villages/sample', async (c) => {
  try {
    const { data, error } = await supabase
      .from('retirement_villages')
      .select('id, name, operator, suburb, created_at')
      .eq('state', 'VIC')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching VIC village sample:', error);
      return c.json({ error: error.message }, 500);
    }

    console.log(`✅ Fetched ${data?.length || 0} sample VIC villages`);
    return c.json({ villages: data || [] });
  } catch (err) {
    console.error('Error in VIC sample endpoint:', err);
    return c.json({ error: 'Failed to fetch VIC villages sample' }, 500);
  }
});

// Mount simple scraper routes
app.route('/', simpleScraperApp);

// Mount operator scraper routes
app.route('/', operatorScraperApp);

// Mount VIC operator scraper routes
app.route('/', vicOperatorScraperApp);

// Mount smart operator scraper routes
app.route('/', smartOperatorScraperApp);

// Mount Google search scraper routes
app.route('/', googleSearchScraperApp);

// Mount URL pattern guesser routes
app.route('/', urlPatternGuesserApp);

// Mount VIC blacklist cleanup routes
app.route('/', vicBlacklistCleanupApp);

// Mount VIC URL diagnostic routes
app.route('/', vicUrlDiagnosticApp);

// Mount VIC URL cleanup backend routes
app.route('/', vicUrlCleanupBackendApp);

// Mount VIC multi-strategy scraper routes
app.route('/', vicMultiStrategyScraperApp);

// Mount VIC operator domains upload routes
app.route('/', vicOperatorDomainsUploadApp);

// VIC Operator Domain Scraper route
app.post('/make-server-3bba8be8/vic-operator-domain-scraper', async (c) => {
  return vicOperatorDomainScraperRoute(c.req.raw);
});

// Australian Unity Cleanup routes
app.get('/make-server-3bba8be8/australian-unity-audit', async (c) => {
  return australianUnityAuditRoute(c.req.raw);
});

app.post('/make-server-3bba8be8/australian-unity-cleanup', async (c) => {
  return australianUnityCleanupRoute(c.req.raw);
});

// VIC Operator Mismatch Diagnostic - Check for villages where website domain doesn't match operator
app.get('/make-server-3bba8be8/admin/check-operator-mismatches', async (c) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Import the operator domain map - need to import the entire module
    const scraperModule = await import('./vic-operator-domain-scraper.ts');
    const operatorDomainMap = scraperModule.parseOperatorDomainCSV(scraperModule.OPERATOR_DOMAIN_CSV);
    
    // Get all VIC villages with websites
    const { data: villages, error } = await supabase
      .from('retirement_villages')
      .select('id, name, operator, website, updated_at')
      .eq('state', 'VIC')
      .not('website', 'is', null)
      .not('website', 'eq', '')
      .not('website', 'like', 'No official%')
      .not('website', 'like', 'Invalid%');
    
    if (error) {
      console.error('Error fetching villages:', error);
      return c.json({ success: false, error: error.message }, 500);
    }
    
    // Check each village for operator mismatches
    const mismatches = [];
    for (const village of villages || []) {
      if (village.website && village.website.startsWith('http')) {
        const urlDomain = scraperModule.extractDomain(village.website);
        if (urlDomain) {
          const expectedOperator = scraperModule.findOperatorByDomain(urlDomain, operatorDomainMap);
          
          // If URL domain matches a different operator, it's a mismatch
          if (expectedOperator && expectedOperator !== village.operator) {
            mismatches.push({
              id: village.id,
              name: village.name,
              operator: village.operator,
              website: village.website,
              extractedDomain: urlDomain,
              expectedOperator,
              updated_at: village.updated_at
            });
          }
        }
      }
    }
    
    console.log(`Found ${mismatches.length} operator mismatches`);
    
    return c.json({
      success: true,
      mismatches,
      total: mismatches.length
    });
  } catch (error) {
    console.error('Error checking mismatches:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// VIC Operator Mismatch - Check specific village
app.get('/make-server-3bba8be8/admin/check-specific-village', async (c) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const villageName = c.req.query('name');
    if (!villageName) {
      return c.json({ success: false, error: 'Village name required' }, 400);
    }
    
    // Import the operator domain map
    const scraperModule = await import('./vic-operator-domain-scraper.ts');
    const operatorDomainMap = scraperModule.parseOperatorDomainCSV(scraperModule.OPERATOR_DOMAIN_CSV);
    
    // Get the village
    const { data: villages, error } = await supabase
      .from('retirement_villages')
      .select('id, name, operator, website, updated_at')
      .eq('state', 'VIC')
      .ilike('name', `%${villageName}%`)
      .limit(1);
    
    if (error) {
      console.error('Error fetching village:', error);
      return c.json({ success: false, error: error.message }, 500);
    }
    
    if (!villages || villages.length === 0) {
      return c.json({ success: false, error: 'Village not found' }, 404);
    }
    
    const village = villages[0];
    let result: any = {
      id: village.id,
      name: village.name,
      operator: village.operator,
      website: village.website,
      updated_at: village.updated_at,
      isMismatch: false
    };
    
    if (village.website && village.website.startsWith('http')) {
      const urlDomain = scraperModule.extractDomain(village.website);
      if (urlDomain) {
        const expectedOperator = scraperModule.findOperatorByDomain(urlDomain, operatorDomainMap);
        
        result.extractedDomain = urlDomain;
        result.expectedOperator = expectedOperator;
        result.isMismatch = expectedOperator && expectedOperator !== village.operator;
      }
    }
    
    return c.json(result);
  } catch (error) {
    console.error('Error checking village:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// VIC Recent Scrape Results - Get the last 100 updated villages
app.get('/make-server-3bba8be8/admin/vic-recent-scrape-results', async (c) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Get the 100 most recently updated VIC villages
    const { data: villages, error } = await supabase
      .from('retirement_villages')
      .select('id, name, operator, website, updated_at')
      .eq('state', 'VIC')
      .order('updated_at', { ascending: false })
      .limit(100);
    
    if (error) {
      console.error('Error fetching recent scrape results:', error);
      return c.json({ success: false, error: error.message }, 500);
    }
    
    // Calculate stats
    const stats = {
      total: villages.length,
      withWebsites: villages.filter(v => v.website && v.website.startsWith('http')).length,
      notFound: villages.filter(v => v.website === 'No official website').length,
      invalid: villages.filter(v => v.website && v.website.startsWith('Invalid')).length,
      null: villages.filter(v => !v.website).length,
    };
    
    return c.json({
      success: true,
      villages,
      stats,
    });
  } catch (error) {
    console.error('Error in vic-recent-scrape-results:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// KV Store API - Generic key-value storage endpoints
app.post('/make-server-3bba8be8/kv/get', async (c) => {
  try {
    const { key } = await c.req.json();
    if (!key) {
      return c.json({ error: 'Key is required' }, 400);
    }
    
    const value = await kv.get(key);
    return c.json({ key, value });
  } catch (error: any) {
    console.error('KV get error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.post('/make-server-3bba8be8/kv/set', async (c) => {
  try {
    const { key, value } = await c.req.json();
    if (!key) {
      return c.json({ error: 'Key is required' }, 400);
    }
    
    await kv.set(key, value);
    return c.json({ success: true, key });
  } catch (error: any) {
    console.error('KV set error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Admin: Bulk clear operator from all VIC villages
app.post('/make-server-3bba8be8/admin/bulk-clear-operator', async (c) => {
  try {
    const { operatorName } = await c.req.json();
    console.log(`[BULK CLEAR] Clearing operator: "${operatorName}"`);

    const result = await supabase
      .from('retirement_villages')
      .update({ operator: null })
      .eq('state', 'VIC')
      .eq('operator', operatorName)
      .select();

    console.log(`[BULK CLEAR] Cleared ${result.data?.length || 0} villages`);

    return c.json({
      success: true,
      cleared: result.data?.length || 0,
      villages: result.data?.map((v: any) => v.name) || [],
    });
  } catch (error) {
    console.error('[BULK CLEAR] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Admin: Get recent operator clearing activity (from logs)
app.get('/make-server-3bba8be8/admin/cleared-operators-log', async (c) => {
  try {
    // Since we don't have a separate audit table, let's check which villages have null operators
    const result = await supabase
      .from('retirement_villages')
      .select('name, suburb, postcode, street_address')
      .eq('state', 'VIC')
      .is('operator', null)
      .order('name');

    console.log(`[CLEARED LOG] Found ${result.data?.length || 0} villages with null operators`);

    return c.json({
      success: true,
      unmatchedVillages: result.data || [],
      total: result.data?.length || 0,
    });
  } catch (error) {
    console.error('[CLEARED LOG] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Admin: Restore operators from backup CSV (only 100% matched, not Aberlea)
app.post('/make-server-3bba8be8/admin/restore-operators-from-backup', async (c) => {
  try {
    const { villages } = await c.req.json();
    console.log(`[RESTORE] Received ${villages?.length || 0} villages to restore`);

    let restored = 0;
    let skipped = 0;
    const restoredList = [];

    for (const village of villages) {
      // Only restore if:
      // 1. Confidence is 100% (definitely correct)
      // 2. NOT Aberlea Inc (we know those were wrong)
      if (village.confidence === '100%' && village.operator && village.operator !== 'Aberlea Inc') {
        const result = await supabase
          .from('retirement_villages')
          .update({ operator: village.operator })
          .eq('state', 'VIC')
          .eq('name', village.name)
          .is('operator', null) // Only update if currently NULL
          .select();

        if (result.data && result.data.length > 0) {
          restored++;
          restoredList.push({ name: village.name, operator: village.operator });
          console.log(`[RESTORE] ✓ ${village.name} → ${village.operator}`);
        } else {
          skipped++;
        }
      } else {
        skipped++;
      }
    }

    console.log(`[RESTORE] Complete: ${restored} restored, ${skipped} skipped`);

    return c.json({
      success: true,
      restored,
      skipped,
      restoredList,
    });
  } catch (error) {
    console.error('[RESTORE] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Mount VIC field inspector routes
app.route('/', vicFieldInspectorApp);

// Mount VIC operator extractor routes
app.route('/', vicOperatorExtractorApp);

// Mount VIC operator whitelist routes
app.route('/', vicOperatorWhitelistApp);

// Mount VIC operator patterns routes
app.route('/', vicOperatorPatternsApp);

// Mount auto pattern detector routes
app.route('/', autoPatternDetectorApp);

// Mount pattern diagnostics routes
app.route('/', patternDiagnosticsApp);

// Mount database health check routes
app.route('/', databaseHealthCheckApp);

// Mount VIC master scrape routes
app.route('/', vicMasterScrapeApp);

// VIC Operator Full Export - Check all operators A-Z
app.get('/make-server-3bba8be8/vic-operator-full-check', async (c) => {
  try {
    console.log('=== VIC OPERATOR FULL CHECK DEBUG ===');
    
    // Query retirement_villages table directly (NOT KV store!)
    const { data: vicVillages, error: dbError } = await supabase
      .from('retirement_villages')
      .select('id, name, suburb, postcode, operator, state, website')
      .eq('state', 'VIC');
    
    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }
    
    console.log('Total VIC villages from DB:', vicVillages?.length || 0);
    console.log('Sample VIC villages:', vicVillages?.slice(0, 3).map((v: any) => ({ name: v.name, operator: v.operator })));

    const total = vicVillages?.length || 0;
    const withOperators = vicVillages?.filter((v: any) => v.operator && v.operator.trim() !== '') || [];
    const withoutOperators = vicVillages?.filter((v: any) => !v.operator || v.operator.trim() === '') || [];

    console.log('VIC with operators:', withOperators.length);
    console.log('VIC without operators:', withoutOperators.length);

    // Operator breakdown
    const operatorMap = new Map<string, number>();
    withOperators.forEach((v: any) => {
      const op = v.operator.trim();
      operatorMap.set(op, (operatorMap.get(op) || 0) + 1);
    });

    const operatorBreakdown = Array.from(operatorMap.entries())
      .map(([operator, count]) => ({ operator, count }))
      .sort((a, b) => b.count - a.count);

    // Alphabetical distribution (WITH operators only)
    const alphabetMap = new Map<string, number>();
    withOperators.forEach((v: any) => {
      const firstLetter = v.name?.charAt(0)?.toUpperCase() || '?';
      alphabetMap.set(firstLetter, (alphabetMap.get(firstLetter) || 0) + 1);
    });

    const alphabeticalDistribution = Array.from(alphabetMap.entries())
      .map(([letter, count]) => ({ letter, count }))
      .sort((a, b) => a.letter.localeCompare(b.letter));

    return c.json({
      total,
      withOperators: withOperators.length,
      withoutOperators: withoutOperators.length,
      operatorBreakdown,
      alphabeticalDistribution,
      villages: withOperators.map((v: any) => ({
        id: v.id,
        name: v.name,
        suburb: v.suburb,
        postcode: v.postcode,
        operator: v.operator,
        state: v.state,
        website: v.website
      })),
      villagesWithoutOperators: withoutOperators.map((v: any) => ({
        id: v.id,
        name: v.name,
        suburb: v.suburb,
        postcode: v.postcode,
        state: v.state,
        website: v.website
      })),
      debug: {
        source: 'retirement_villages table (not KV store)',
        totalVic: vicVillages?.length || 0
      }
    });
  } catch (err: any) {
    console.error('VIC operator full check error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// VIC Update Operator by Name - Bulk import endpoint
app.post('/make-server-3bba8be8/vic-update-operator-by-name', async (c) => {
  try {
    const { villageName, suburb, postcode, operator } = await c.req.json();
    
    console.log(`🔄 Updating operator for: ${villageName}, ${suburb}, ${postcode} -> ${operator}`);
    
    // Find village by name, suburb, and postcode
    const { data: villages, error: findError } = await supabase
      .from('retirement_villages')
      .select('id, name, suburb, postcode, operator')
      .eq('state', 'VIC')
      .eq('suburb', suburb)
      .eq('postcode', postcode)
      .ilike('name', villageName);
    
    if (findError) {
      console.error('Find error:', findError);
      return c.json({ success: false, error: findError.message }, 500);
    }
    
    if (!villages || villages.length === 0) {
      console.warn(`⚠️ Village not found: ${villageName}`);
      return c.json({ success: false, error: 'Village not found' }, 404);
    }
    
    if (villages.length > 1) {
      console.warn(`⚠️ Multiple villages found for ${villageName}, using first match`);
    }
    
    const village = villages[0];
    
    // Update operator
    const { error: updateError } = await supabase
      .from('retirement_villages')
      .update({ operator })
      .eq('id', village.id);
    
    if (updateError) {
      console.error('Update error:', updateError);
      return c.json({ success: false, error: updateError.message }, 500);
    }
    
    console.log(`✅ Successfully updated ${villageName} with operator: ${operator}`);
    
    return c.json({ 
      success: true, 
      message: `Updated ${villageName}`,
      village: {
        id: village.id,
        name: village.name,
        oldOperator: village.operator,
        newOperator: operator
      }
    });
    
  } catch (err: any) {
    console.error('VIC update operator error:', err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

// Operator Scraper: Save scraped results to database (BULK)
app.post('/make-server-3bba8be8/operator-scraper/save-results', async (c) => {
  try {
    const { results } = await c.req.json();
    
    console.log(`💾 Saving ${results.length} operator scraping results to database...`);
    
    if (!results || !Array.isArray(results) || results.length === 0) {
      return c.json({ success: false, error: 'No results provided' }, 400);
    }
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    // Process each result
    for (const result of results) {
      // Only save matched results
      if (result.status !== 'matched' || !result.matchedOperator) {
        skipCount++;
        continue;
      }
      
      const { village, matchedOperator } = result;
      
      try {
        // Find village by name, suburb, and postcode
        const { data: villages, error: findError } = await supabase
          .from('retirement_villages')
          .select('id, name, suburb, postcode, operator')
          .eq('state', 'VIC')
          .eq('suburb', village.suburb)
          .eq('postcode', village.postcode)
          .ilike('name', village.name);
        
        if (findError) {
          console.error(`❌ Find error for ${village.name}:`, findError);
          errorCount++;
          errors.push(`Find error for ${village.name}: ${findError.message}`);
          continue;
        }
        
        if (!villages || villages.length === 0) {
          console.warn(`⚠️ Village not found: ${village.name}, ${village.suburb}`);
          skipCount++;
          continue;
        }
        
        const dbVillage = villages[0];
        
        // Skip if operator already set
        if (dbVillage.operator && dbVillage.operator.trim() !== '') {
          console.log(`⏭️ Skipping ${village.name} - already has operator: ${dbVillage.operator}`);
          skipCount++;
          continue;
        }
        
        // Update operator
        const { error: updateError } = await supabase
          .from('retirement_villages')
          .update({ operator: matchedOperator })
          .eq('id', dbVillage.id);
        
        if (updateError) {
          console.error(`❌ Update error for ${village.name}:`, updateError);
          errorCount++;
          errors.push(`Update error for ${village.name}: ${updateError.message}`);
          continue;
        }
        
        console.log(`✅ Updated ${village.name} with operator: ${matchedOperator}`);
        successCount++;
        
      } catch (err: any) {
        console.error(`❌ Error processing ${village.name}:`, err);
        errorCount++;
        errors.push(`Error processing ${village.name}: ${err.message}`);
      }
    }
    
    console.log(`📊 Bulk save complete: ${successCount} updated, ${skipCount} skipped, ${errorCount} errors`);
    
    return c.json({
      success: true,
      successCount,
      skipCount,
      errorCount,
      errors: errors.slice(0, 10), // Only return first 10 errors
      totalProcessed: results.length
    });
    
  } catch (err: any) {
    console.error('Operator scraper save error:', err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

// Database Stats - Simple VIC count
app.get('/make-server-3bba8be8/database-stats', async (c) => {
  try {
    console.log('📊 Fetching VIC database stats...');
    
    const { data: vicVillages, error } = await supabase
      .from('villages_3bba8be8')
      .select('operator')
      .eq('state', 'VIC');

    if (error) {
      console.error('❌ Database stats query error:', error);
      return c.json({ error: error.message }, 500);
    }

    if (!vicVillages) {
      console.log('⚠️ No VIC villages found (data is null)');
      return c.json({
        byState: [{
          state: 'VIC',
          count: 0,
          with_operator: 0,
          without_operator: 0
        }]
      });
    }

    const total = vicVillages.length;
    const withOperator = vicVillages.filter(v => v.operator && v.operator.trim() !== '').length;
    const withoutOperator = total - withOperator;

    console.log(`✅ VIC Stats: ${total} total, ${withOperator} with operator, ${withoutOperator} without`);

    return c.json({
      byState: [{
        state: 'VIC',
        count: total,
        with_operator: withOperator,
        without_operator: withoutOperator
      }]
    });
  } catch (err: any) {
    console.error('❌ Database stats exception:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Add error handler for unhandled errors
app.onError((err, c) => {
  console.error('Unhandled server error:', err);
  return c.json({ 
    error: 'Internal server error',
    details: err instanceof Error ? err.message : 'Unknown error'
  }, 500);
});

// Wrap Deno.serve in try-catch to see startup errors
try {
  console.log('🚀 Starting RetirePath server v1.38-operator-search-fix...');
  Deno.serve(app.fetch);
  console.log('✅ Server started successfully');
} catch (error) {
  console.error('❌ FATAL: Server failed to start:', error);
  throw error;
}

// Admin: Get all unmatched villages (NULL operator)
app.get('/make-server-3bba8be8/admin/unmatched-villages', async (c) => {
  try {
    const result = await supabase
      .from('retirement_villages')
      .select('id, name, suburb, postcode, street_address')
      .eq('state', 'VIC')
      .is('operator', null)
      .order('name');

    console.log(`[UNMATCHED] Found ${result.data?.length || 0} villages without operators`);

    return c.json({
      success: true,
      count: result.data?.length || 0,
      villages: result.data || [],
    });
  } catch (error) {
    console.error('[UNMATCHED] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Admin: Restore operators from CSV with better parsing
app.post('/make-server-3bba8be8/admin/restore-operators-v2', async (c) => {
  try {
    const { csvContent } = await c.req.json();
    console.log(`[RESTORE-V2] Received CSV content, length: ${csvContent?.length}`);

    // Parse CSV line by line (tab-delimited with \r\n endings)
    const lines = csvContent.split(/\r?\n/);
    console.log(`[RESTORE-V2] Total lines: ${lines.length}`);
    console.log(`[RESTORE-V2] First line (header): ${lines[0]}`);
    console.log(`[RESTORE-V2] Second line (sample): ${lines[1]}`);
    
    const restorationMap = new Map();
    
    // Skip header (line 0)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = line.split('\t');
      
      // Debug first few lines
      if (i <= 3) {
        console.log(`[RESTORE-V2] Line ${i}: ${parts.length} parts`, parts);
      }
      
      if (parts.length >= 6) {
        const villageName = parts[0];
        const matchedOperator = parts[4]; // "Matched Operator" column
        const confidence = parts[5];
        
        // Debug what we're checking
        if (i <= 3) {
          console.log(`[RESTORE-V2] Line ${i}: name="${villageName}", operator="${matchedOperator}", confidence="${confidence}"`);
        }
        
        // Only include 100% matches that are NOT Aberlea Inc or "Not found"
        if (confidence === '100%' && 
            matchedOperator && 
            matchedOperator !== 'None' && 
            matchedOperator !== 'Not found' &&
            !matchedOperator.includes('Aberlea')) {
          restorationMap.set(villageName, matchedOperator);
        }
      }
    }
    
    console.log(`[RESTORE-V2] Found ${restorationMap.size} villages to restore`);
    console.log(`[RESTORE-V2] Sample restoration map:`, Array.from(restorationMap.entries()).slice(0, 5));

    let restored = 0;
    const restoredList = [];
    
    for (const [villageName, operator] of restorationMap.entries()) {
      const result = await supabase
        .from('retirement_villages')
        .update({ operator })
        .eq('state', 'VIC')
        .eq('name', villageName)
        .is('operator', null)
        .select();

      if (result.data && result.data.length > 0) {
        restored++;
        restoredList.push({ name: villageName, operator });
        console.log(`[RESTORE-V2] ✓ ${villageName} → ${operator}`);
      }
    }

    console.log(`[RESTORE-V2] Complete: ${restored} restored`);

    return c.json({
      success: true,
      restored,
      totalInCSV: restorationMap.size,
      restoredList,
    });
  } catch (error) {
    console.error('[RESTORE-V2] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Admin: DIAGNOSE what restore would do (without actually restoring)
app.post('/make-server-3bba8be8/admin/diagnose-restore', async (c) => {
  try {
    const { csvContent } = await c.req.json();
    
    // Parse CSV
    const lines = csvContent.split(/\r?\n/);
    const restorationMap = new Map();
    
    // Sample first 5 lines for debugging
    const sampleLines = [];
    
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      const parts = line.split('\t');
      sampleLines.push({
        lineNumber: i,
        text: line.substring(0, 200), // First 200 chars
        partsCount: parts.length,
        parts: parts.map(p => p.substring(0, 50)) // First 50 chars of each part
      });
    }
    
    // Parse data lines (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = line.split('\t');
      
      if (parts.length >= 6) {
        const villageName = parts[0];
        const matchedOperator = parts[4];
        const confidence = parts[5];
        
        if (confidence === '100%' && 
            matchedOperator && 
            matchedOperator !== 'None' && 
            matchedOperator !== 'Not found' &&
            !matchedOperator.includes('Aberlea')) {
          restorationMap.set(villageName, matchedOperator);
        }
      }
    }
    
    // Get current unmatched count
    const { count } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'VIC')
      .is('operator', null);

    return c.json({
      success: true,
      currentUnmatched: count || 0,
      csvTotalLines: lines.length,
      csvCandidates: restorationMap.size,
      sampleLines,
      sampleCandidates: Array.from(restorationMap.entries()).slice(0, 10)
    });
  } catch (error) {
    console.error('[DIAGNOSE] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Admin: Export ALL VIC villages to CSV
app.get('/make-server-3bba8be8/admin/export-vic-all-villages-csv', async (c) => {
  try {
    console.log('[VIC-EXPORT-ALL] Fetching all VIC villages...');
    
    const { data, error } = await supabase
      .from('retirement_villages')
      .select('id, name, suburb, postcode, operator, state')
      .eq('state', 'VIC')
      .order('name');

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      throw new Error('No VIC villages found');
    }

    console.log(`[VIC-EXPORT-ALL] Found ${data.length} villages`);

    // Create CSV
    const headers = ['ID', 'Name', 'Suburb', 'Postcode', 'Operator', 'State'];
    const rows = data.map(village => [
      village.id,
      `"${village.name}"`,
      `"${village.suburb}"`,
      village.postcode,
      village.operator ? `"${village.operator}"` : 'NULL',
      village.state
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    console.log(`[VIC-EXPORT-ALL] CSV generated with ${rows.length} rows`);

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="vic_all_villages_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('[VIC-EXPORT-ALL] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Admin: Breakout VIC villages by operator status and save to /data folder
app.post('/make-server-3bba8be8/admin/breakout-vic-villages', async (c) => {
  try {
    console.log('[VIC-BREAKOUT] Fetching all VIC villages...');
    
    const { data, error } = await supabase
      .from('retirement_villages')
      .select('id, name, suburb, postcode, operator, state')
      .eq('state', 'VIC')
      .order('name');

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      throw new Error('No VIC villages found');
    }

    console.log(`[VIC-BREAKOUT] Found ${data.length} villages`);

    // Separate villages: NULL operators (needs scraping) vs has operators
    const needsScraping = data.filter(v => !v.operator || v.operator === 'NULL' || v.operator.trim() === '');
    const hasOperators = data.filter(v => v.operator && v.operator !== 'NULL' && v.operator.trim() !== '');

    console.log(`[VIC-BREAKOUT] Needs scraping: ${needsScraping.length}, Has operators: ${hasOperators.length}`);

    // Create CSV headers
    const headers = ['ID', 'Name', 'Suburb', 'Postcode', 'Operator', 'State'];

    // Create "needs scraping" CSV
    const needsScrapingRows = needsScraping.map(village => [
      village.id,
      `"${village.name}"`,
      `"${village.suburb}"`,
      village.postcode,
      'NULL',
      village.state
    ]);
    const needsScrapingCSV = [
      headers.join(','),
      ...needsScrapingRows.map(row => row.join(','))
    ].join('\n');

    // Create "has operators" CSV
    const hasOperatorsRows = hasOperators.map(village => [
      village.id,
      `"${village.name}"`,
      `"${village.suburb}"`,
      village.postcode,
      `"${village.operator}"`,
      village.state
    ]);
    const hasOperatorsCSV = [
      headers.join(','),
      ...hasOperatorsRows.map(row => row.join(','))
    ].join('\n');

    // Write files to /tmp (only writable directory in Deno)
    const needsScrapingPath = '/tmp/vic_needs_scraping.csv';
    const hasOperatorsPath = '/tmp/vic_has_operators.csv';
    
    await Deno.writeTextFile(needsScrapingPath, needsScrapingCSV);
    await Deno.writeTextFile(hasOperatorsPath, hasOperatorsCSV);

    console.log(`[VIC-BREAKOUT] Files written to /tmp`);
    console.log(`[VIC-BREAKOUT] - ${needsScrapingPath}: ${needsScraping.length} villages`);
    console.log(`[VIC-BREAKOUT] - ${hasOperatorsPath}: ${hasOperators.length} villages`);

    // Store the CSVs in the KV store for easy retrieval
    await kv.set('vic_needs_scraping_csv', needsScrapingCSV);
    await kv.set('vic_has_operators_csv', hasOperatorsCSV);
    
    console.log('[VIC-BREAKOUT] CSVs stored in KV store');

    return c.json({
      success: true,
      total: data.length,
      needsScraping: needsScraping.length,
      hasOperators: hasOperators.length,
      message: 'Files saved to /tmp and KV store',
    });
  } catch (error) {
    console.error('[VIC-BREAKOUT] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Admin: Download CSV from KV store
app.get('/make-server-3bba8be8/admin/download-csv/:filename', async (c) => {
  try {
    const filename = c.req.param('filename');
    console.log(`[DOWNLOAD-CSV] Fetching ${filename} from KV store...`);
    
    const csvContent = await kv.get(`${filename}_csv`);
    
    if (!csvContent) {
      throw new Error('CSV not found in KV store. Run breakout first.');
    }
    
    console.log(`[DOWNLOAD-CSV] CSV found, ${csvContent.length} bytes`);

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('[DOWNLOAD-CSV] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Admin: Export ONLY unmatched VIC villages (no operator) to CSV
app.get('/make-server-3bba8be8/admin/export-unmatched-vic-villages', async (c) => {
  try {
    // Get ALL VIC villages
    const result = await supabase
      .from('retirement_villages')
      .select('name, suburb, postcode, operator, street_address')
      .eq('state', 'VIC')
      .order('name');

    console.log(`[EXPORT-UNMATCHED-VIC] Total VIC villages: ${result.data?.length || 0}`);

    // Filter for villages without valid operators
    // Handle: NULL, empty string, "NULL" string, undefined
    const unmatched = (result.data || []).filter((v: any) => 
      !v.operator || 
      v.operator === '' || 
      v.operator === 'NULL' ||
      v.operator.trim() === ''
    );

    console.log(`[EXPORT-UNMATCHED-VIC] Unmatched villages: ${unmatched.length}`);
    console.log(`[EXPORT-UNMATCHED-VIC] Sample unmatched:`, unmatched.slice(0, 5).map((v: any) => ({
      name: v.name,
      operator: v.operator,
      operatorType: typeof v.operator
    })));

    return c.json({
      success: true,
      villages: unmatched.map((v: any) => ({
        name: v.name,
        suburb: v.suburb,
        postcode: v.postcode,
        street_address: v.street_address
      })),
      total: unmatched.length,
    });
  } catch (error) {
    console.error('[EXPORT-UNMATCHED-VIC] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Admin: Find villages with operator containing a pattern
app.post('/make-server-3bba8be8/admin/villages-with-operator-containing', async (c) => {
  try {
    const { state, operatorPattern } = await c.req.json();
    
    console.log(`[FIND-OPERATOR-PATTERN] Searching ${state} villages for operator containing: ${operatorPattern}`);

    const result = await supabase
      .from('retirement_villages')
      .select('id, name, suburb, postcode, operator')
      .eq('state', state)
      .ilike('operator', `%${operatorPattern}%`)
      .order('name');

    console.log(`[FIND-OPERATOR-PATTERN] Found ${result.data?.length || 0} villages`);

    return c.json({
      success: true,
      villages: result.data || [],
      total: result.data?.length || 0,
    });
  } catch (error) {
    console.error('[FIND-OPERATOR-PATTERN] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Admin: Bulk clear operators for specific village IDs
app.post('/make-server-3bba8be8/admin/bulk-clear-operators', async (c) => {
  try {
    const { villageIds } = await c.req.json();
    
    if (!Array.isArray(villageIds) || villageIds.length === 0) {
      return c.json({ success: false, error: 'villageIds must be a non-empty array' }, 400);
    }

    console.log(`[BULK-CLEAR-OPERATORS] Clearing operators for ${villageIds.length} villages`);

    // Clear operator field (set to null)
    const result = await supabase
      .from('retirement_villages')
      .update({ operator: null })
      .in('id', villageIds);

    if (result.error) {
      throw new Error(result.error.message);
    }

    console.log(`[BULK-CLEAR-OPERATORS] Successfully cleared operators`);

    return c.json({
      success: true,
      cleared: villageIds.length,
    });
  } catch (error) {
    console.error('[BULK-CLEAR-OPERATORS] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Admin: Get VIC operator statistics
app.get('/make-server-3bba8be8/admin/vic-operator-stats', async (c) => {
  try {
    // Get total count
    const { count: total } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'VIC');

    // Get count with operators
    const { count: withOperator } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'VIC')
      .not('operator', 'is', null);

    // Get count without operators
    const { count: withoutOperator } = await supabase
      .from('retirement_villages')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'VIC')
      .is('operator', null);

    // Get operator breakdown (group by operator)
    const { data: allVillages } = await supabase
      .from('retirement_villages')
      .select('operator')
      .eq('state', 'VIC')
      .not('operator', 'is', null);

    const operatorCounts = new Map<string, number>();
    allVillages?.forEach((v) => {
      if (v.operator) {
        operatorCounts.set(v.operator, (operatorCounts.get(v.operator) || 0) + 1);
      }
    });

    const operatorBreakdown = Array.from(operatorCounts.entries())
      .map(([operator, count]) => ({ operator, count }))
      .sort((a, b) => b.count - a.count);

    console.log(`[VIC-STATS] Total: ${total}, With Operator: ${withOperator}, Without: ${withoutOperator}`);

    return c.json({
      success: true,
      total: total || 0,
      withOperator: withOperator || 0,
      withoutOperator: withoutOperator || 0,
      operatorBreakdown,
    });
  } catch (error) {
    console.error('[VIC-STATS] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Admin: Get recently updated VIC villages (those with operators)
app.get('/make-server-3bba8be8/admin/vic-recently-updated-villages', async (c) => {
  try {
    const { data } = await supabase
      .from('retirement_villages')
      .select('id, name, suburb, postcode, operator')
      .eq('state', 'VIC')
      .not('operator', 'is', null)
      .order('name')
      .limit(100);

    console.log(`[VIC-RECENT] Found ${data?.length || 0} villages with operators`);

    return c.json({
      success: true,
      villages: data || [],
      total: data?.length || 0,
    });
  } catch (error) {
    console.error('[VIC-RECENT] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// VIC Operator CSV Merger - Merge scraped operators into database
app.post('/make-server-3bba8be8/vic-operator-csv-merger', async (c) => {
  try {
    const { villages } = await c.req.json();
    
    console.log(`🔄 Starting CSV merge for ${villages.length} villages...`);
    
    const results = {
      updated: 0,
      skipped: 0,
      failed: 0,
      details: [] as any[]
    };
    
    for (const village of villages) {
      const { name, suburb, operator } = village;
      
      // Find the village in database (match by name and optionally suburb)
      let query = supabase
        .from('retirement_villages')
        .select('id, name, suburb, operator')
        .eq('state', 'VIC')
        .ilike('name', name);
      
      const { data: matches, error: fetchError } = await query;
      
      if (fetchError) {
        console.error(`❌ Error fetching ${name}:`, fetchError.message);
        results.failed++;
        results.details.push({
          village: name,
          suburb: suburb,
          operator: operator,
          status: 'failed',
          reason: `Database error: ${fetchError.message}`
        });
        continue;
      }
      
      if (!matches || matches.length === 0) {
        console.log(`⚠️ Village not found: ${name}`);
        results.failed++;
        results.details.push({
          village: name,
          suburb: suburb,
          operator: operator,
          status: 'failed',
          reason: 'Village not found in database'
        });
        continue;
      }
      
      // If multiple matches and suburb provided, try to narrow down
      let targetVillage = matches[0];
      if (matches.length > 1 && suburb) {
        const suburbMatch = matches.find(v => 
          v.suburb?.toLowerCase() === suburb.toLowerCase()
        );
        if (suburbMatch) {
          targetVillage = suburbMatch;
        }
      }
      
      // Check if village already has an operator
      if (targetVillage.operator && targetVillage.operator.trim() !== '') {
        console.log(`⏭️  Skipped ${name}: Already has operator "${targetVillage.operator}"`);
        results.skipped++;
        results.details.push({
          village: name,
          suburb: suburb,
          operator: operator,
          status: 'skipped',
          reason: `Already has operator: ${targetVillage.operator}`
        });
        continue;
      }
      
      // Update the village with the new operator
      const { error: updateError } = await supabase
        .from('retirement_villages')
        .update({ operator: operator })
        .eq('id', targetVillage.id);
      
      if (updateError) {
        console.error(`❌ Failed to update ${name}:`, updateError.message);
        results.failed++;
        results.details.push({
          village: name,
          suburb: suburb,
          operator: operator,
          status: 'failed',
          reason: `Update failed: ${updateError.message}`
        });
        continue;
      }
      
      console.log(`✅ Updated ${name} → "${operator}"`);
      results.updated++;
      results.details.push({
        village: name,
        suburb: suburb,
        operator: operator,
        status: 'updated',
        reason: 'Successfully updated'
      });
    }
    
    console.log(`\n📊 Merge Complete:`);
    console.log(`  - Updated: ${results.updated}`);
    console.log(`  - Skipped: ${results.skipped}`);
    console.log(`  - Failed: ${results.failed}`);
    
    return c.json(results);
    
  } catch (error: any) {
    console.error('❌ CSV Merge error:', error);
    return c.json({ error: error.message || 'Failed to merge CSV' }, 500);
  }
});

// Admin: Export VIC villages WITH operators to CSV (for diagnosis)
app.get('/make-server-3bba8be8/admin/vic-operators-csv', async (c) => {
  try {
    const { data: villages, error } = await supabase
      .from('retirement_villages')
      .select('id, name, suburb, postcode, operator, website')
      .eq('state', 'VIC')
      .not('operator', 'is', null)
      .order('name');
    
    if (error) {
      throw new Error(`Failed to fetch villages: ${error.message}`);
    }
    
    console.log(`[VIC-OPERATORS-CSV] Fetched ${villages?.length || 0} VIC villages with operators`);
    
    return c.json({
      success: true,
      count: villages?.length || 0,
      villages: villages || []
    });
  } catch (error: any) {
    console.error('[VIC-OPERATORS-CSV] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Admin: Check specific scraped villages by name
app.post('/make-server-3bba8be8/admin/vic-scraped-villages-check', async (c) => {
  try {
    const { villageNames } = await c.req.json();
    
    if (!Array.isArray(villageNames) || villageNames.length === 0) {
      return c.json({ success: false, error: 'villageNames must be a non-empty array' }, 400);
    }
    
    console.log(`[SCRAPED-CHECK] Checking ${villageNames.length} villages...`);
    
    // Fetch villages by name
    const { data: villages, error } = await supabase
      .from('retirement_villages')
      .select('id, name, suburb, postcode, operator')
      .eq('state', 'VIC')
      .in('name', villageNames)
      .order('name');
    
    if (error) {
      throw new Error(`Failed to fetch villages: ${error.message}`);
    }
    
    console.log(`[SCRAPED-CHECK] Found ${villages?.length || 0} villages in database`);
    
    // Count Aberlea contamination
    const aberleaCount = villages?.filter(v => 
      v.operator && v.operator.toLowerCase().includes('aberlea')
    ).length || 0;
    
    console.log(`[SCRAPED-CHECK] Aberlea contamination: ${aberleaCount} villages`);
    
    return c.json({
      success: true,
      count: villages?.length || 0,
      aberleaCount,
      villages: villages || []
    });
  } catch (error: any) {
    console.error('[SCRAPED-CHECK] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Admin: Merge scraped operators (excluding NULL and Aberlea)
app.post('/make-server-3bba8be8/admin/merge-scraped-operators', async (c) => {
  try {
    const { operators } = await c.req.json();
    
    if (!Array.isArray(operators) || operators.length === 0) {
      return c.json({ success: false, error: 'operators must be a non-empty array' }, 400);
    }
    
    console.log(`[MERGE-OPERATORS] Received ${operators.length} operators to merge`);
    
    let updated = 0;
    let notFound = 0;
    const notFoundVillages: string[] = [];
    
    // Update each village
    for (const item of operators) {
      const { name, operator, website } = item;
      
      // Find the village
      const { data: villages, error: selectError } = await supabase
        .from('retirement_villages')
        .select('id')
        .eq('state', 'VIC')
        .eq('name', name)
        .limit(1);
      
      if (selectError || !villages || villages.length === 0) {
        console.log(`[MERGE-OPERATORS] Village not found: ${name}`);
        notFound++;
        notFoundVillages.push(name);
        continue;
      }
      
      const villageId = villages[0].id;
      
      // Update the operator and website
      const updateData: any = { operator };
      if (website) {
        updateData.website = website;
      }
      
      const { error: updateError } = await supabase
        .from('retirement_villages')
        .update(updateData)
        .eq('id', villageId);
      
      if (updateError) {
        console.error(`[MERGE-OPERATORS] Failed to update ${name}:`, updateError);
        continue;
      }
      
      updated++;
      console.log(`[MERGE-OPERATORS] ✅ Updated ${name} -> ${operator}`);
    }
    
    const skipped = operators.length - updated - notFound;
    
    console.log(`[MERGE-OPERATORS] Complete: ${updated} updated, ${notFound} not found, ${skipped} skipped`);
    
    return c.json({
      success: true,
      received: operators.length,
      valid: operators.length,
      updated,
      notFound,
      skipped,
      notFoundVillages
    });
  } catch (error: any) {
    console.error('[MERGE-OPERATORS] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Admin: Get VIC villages with good operators (non-NULL, non-Aberlea)
app.get('/make-server-3bba8be8/admin/vic-get-good-operators', async (c) => {
  try {
    console.log('[GET-GOOD-OPS] Fetching VIC villages with valid operators...');
    
    const { data: villages, error } = await supabase
      .from('retirement_villages')
      .select('id, name, suburb, postcode, operator')
      .eq('state', 'VIC')
      .not('operator', 'is', null)
      .order('name');
    
    if (error) {
      throw new Error(`Failed to fetch villages: ${error.message}`);
    }
    
    // Filter out Aberlea
    const goodOperators = villages?.filter(v => 
      v.operator && !v.operator.toLowerCase().includes('aberlea')
    ) || [];
    
    console.log(`[GET-GOOD-OPS] Found ${goodOperators.length} villages with good operators`);
    
    return c.json({
      success: true,
      count: goodOperators.length,
      villages: goodOperators
    });
  } catch (error: any) {
    console.error('[GET-GOOD-OPS] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Admin: Compare CSV villages with database to see what operators they currently have
app.post('/make-server-3bba8be8/admin/vic-compare-csv', async (c) => {
  try {
    const { villages } = await c.req.json();
    
    if (!Array.isArray(villages) || villages.length === 0) {
      return c.json({ success: false, error: 'villages must be a non-empty array' }, 400);
    }
    
    console.log(`[COMPARE-CSV] Comparing ${villages.length} villages with database...`);
    console.log('[COMPARE-CSV] First 3 villages:', villages.slice(0, 3));
    
    const comparison: any[] = [];
    let matching = 0;
    let different = 0;
    let nullInDb = 0;
    let aberleaInDb = 0;
    
    for (const csvVillage of villages) {
      const { name, operator: csvOperator } = csvVillage;
      
      // Find village in database using case-insensitive and trimmed comparison
      const { data: dbVillages, error } = await supabase
        .from('retirement_villages')
        .select('name, operator')
        .eq('state', 'VIC')
        .ilike('name', name.trim())
        .limit(1);
      
      if (error) {
        console.log(`[COMPARE-CSV] Error finding village "${name}":`, error);
        continue;
      }
      
      if (!dbVillages || dbVillages.length === 0) {
        console.log(`[COMPARE-CSV] Village not found in DB: "${name}"`);
        continue;
      }
      
      const dbVillage = dbVillages[0];
      const dbOperator = dbVillage.operator;
      
      const match = dbOperator === csvOperator;
      
      if (match) {
        matching++;
      } else if (dbOperator === null) {
        nullInDb++;
      } else if (dbOperator?.toLowerCase().includes('aberlea')) {
        aberleaInDb++;
      } else {
        different++;
      }
      
      comparison.push({
        name,
        csvOperator,
        operator: dbOperator,
        match
      });
    }
    
    const shouldUpdate = nullInDb + aberleaInDb + different;
    
    console.log(`[COMPARE-CSV] Results: ${matching} matching, ${different} different, ${nullInDb} NULL, ${aberleaInDb} Aberlea`);
    
    return c.json({
      success: true,
      stats: {
        total: comparison.length,
        matching,
        different,
        nullInDb,
        aberleaInDb,
        shouldUpdate
      },
      comparison
    });
  } catch (error: any) {
    console.error('[COMPARE-CSV] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});