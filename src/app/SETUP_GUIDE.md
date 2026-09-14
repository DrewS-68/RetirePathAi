# RetirePath AI - Complete Setup Guide

## Quick Start (5 Minutes)

The membership system is **already working** for testing purposes! You can:

1. ✅ Create user accounts
2. ✅ Sign in/out
3. ✅ Select membership tiers (Free, Premium, Family)
4. ✅ Access features based on tier
5. ⚠️ Payment collection NOT yet implemented

### Try It Now

1. Open the app in your browser
2. Click "View Plans" or "Get Started"
3. Select a membership tier
4. Fill in test credentials:
   - Name: Test User
   - Email: test@example.com
   - Password: test123456
5. Explore the app and see how features are gated

## What's Already Set Up

### ✅ Backend (Supabase)
- Supabase connection established
- User authentication system
- Database (KV store) for user profiles
- API endpoints for signup, login, profile management
- Feature access control

### ✅ Frontend
- Sign up / Login forms
- Membership tier selection
- User profile menu
- Feature gates (locks premium features)
- Session management

## Current Limitations

### ❌ Not Implemented (Yet)
- **Payment processing** - No credit card collection
- **Email verification** - Emails auto-confirmed
- **Password reset** - Users can't reset forgotten passwords
- **Subscription management** - Can't upgrade/downgrade/cancel
- **Billing history** - No invoices or payment records

### 🔓 Security Warnings
This is a **prototype** and is NOT production-ready:
- No rate limiting (vulnerable to abuse)
- No email verification (anyone can create accounts)
- No PII compliance (GDPR/CCPA)
- No comprehensive error handling
- Test environment (not secured for real user data)

## For Testing & Demo

You can use the app as-is for:
- ✅ Demonstrating the user experience
- ✅ Testing feature access control
- ✅ Prototyping the flow
- ✅ Getting user feedback
- ✅ Pitching to investors/stakeholders

**DO NOT use for:**
- ❌ Collecting real user data
- ❌ Processing real payments
- ❌ Production deployment
- ❌ Storing sensitive information

## Adding Real Payments (Stripe)

To make this production-ready with payment processing, follow the comprehensive guide in:

📄 **[MEMBERSHIP_SYSTEM.md](./MEMBERSHIP_SYSTEM.md)** - Complete documentation

📄 **[StripeIntegrationGuide.tsx](./components/auth/StripeIntegrationGuide.tsx)** - Step-by-step Stripe setup

### Summary of What You'll Need:
1. Stripe account (free to create)
2. Stripe API keys (from dashboard)
3. Add keys to Supabase environment
4. Install Stripe libraries
5. Create checkout endpoints
6. Add webhook handlers
7. Test with Stripe test cards

**Time estimate:** 2-4 hours for full Stripe integration

## Deploying to Production

### Recommended Platforms

1. **Vercel** (Easiest - Recommended)
   - Connect your GitHub repo
   - Auto-deploy on push
   - Free tier available
   - Great for React apps
   - [vercel.com](https://vercel.com)

2. **Netlify** (Similar to Vercel)
   - Simple deployment
   - Free tier
   - Good docs
   - [netlify.com](https://netlify.com)

3. **AWS Amplify** (More powerful)
   - Enterprise features
   - Scalable
   - More complex setup
   - [aws.amazon.com/amplify](https://aws.amazon.com/amplify)

### Deployment Checklist

Before deploying to production:

- [ ] Add Stripe integration (if accepting payments)
- [ ] Enable email verification in Supabase
- [ ] Add password reset functionality
- [ ] Set up proper error logging (Sentry, LogRocket, etc.)
- [ ] Add rate limiting to API endpoints
- [ ] Configure proper CORS policies
- [ ] Add privacy policy page
- [ ] Add terms of service page
- [ ] Set up SSL certificate (usually automatic with hosting)
- [ ] Configure custom domain
- [ ] Add Google Analytics or similar
- [ ] Test thoroughly with real users
- [ ] Set up monitoring/alerting
- [ ] Create backup strategy for database
- [ ] Plan for scaling (if expecting high traffic)

## Transferring to Webflow

Based on your earlier question about Webflow:

### Option 1: Keep Separate (Recommended)
- **Webflow**: Marketing site (landing, about, pricing)
- **Hosted App**: Full React app (Vercel/Netlify)
- **Setup**: Link from Webflow to app at subdomain
- **Example**: 
  - Marketing: `retirepath.ai` (Webflow)
  - App: `app.retirepath.ai` (Vercel/Netlify)

### Option 2: Webflow + Embed
- Host React app separately
- Embed specific features in Webflow via iframes
- **Limitation**: Clunky UX, not recommended

### Option 3: Rebuild in Webflow
- Manually recreate design in Webflow
- **Major Problem**: Lose all React functionality
- **Not recommended** - You'd be starting from scratch

## Environment Variables

Your app needs these environment variables:

### Already Configured (via Supabase)
```
SUPABASE_URL=https://[your-project].supabase.co
SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

### To Add (for Stripe)
```
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Add these in:
- Supabase Dashboard → Settings → Edge Functions → Secrets
- Your hosting platform's environment variable settings

## Database Structure

### Current Schema (KV Store)

```
Key: user:{userId}
Value: {
  id: string
  email: string
  name: string
  membershipTier: 'free' | 'premium' | 'family'
  createdAt: string
  stripeCustomerId: string | null
  subscriptionStatus: 'active' | 'canceled' | 'past_due'
  updatedAt?: string
}
```

### Why KV Store?
- Simple key-value storage
- Perfect for prototyping
- No migrations needed
- Flexible schema

### For Production at Scale
Consider migrating to proper tables with:
- Indexing for faster queries
- Relations between tables
- Transaction support
- Better query capabilities

But for now, KV store is perfectly fine!

## Monitoring User Activity

Currently, you can monitor:
- User signups (check Supabase Auth dashboard)
- API calls (check Supabase Edge Function logs)
- Errors (console logs in browser + server logs)

### Recommended Additions:
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Google Analytics** - User behavior
- **Mixpanel** - Product analytics
- **Stripe Dashboard** - Payment/subscription metrics (after integration)

## Cost Estimates

### Current Setup (Free Tier)
- Supabase: Free (up to 50k monthly active users)
- Figma Make: [varies by plan]
- Total: ~$0/month for testing

### Production Costs (Estimated)
- **Hosting** (Vercel/Netlify): $0-20/month
- **Supabase Pro**: $25/month (needed for production)
- **Stripe**: 2.9% + $0.30 per transaction
- **Domain**: $10-15/year
- **Total**: ~$40-50/month + transaction fees

### At Scale (1000 paying users)
- Hosting: $20/month
- Supabase: $25-100/month (depends on usage)
- Stripe fees: ~$870/month (assuming $30 avg subscription)
- Monitoring tools: $50-100/month
- **Total**: ~$965-1,090/month operational costs

## Getting Help

### Documentation References
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Stripe**: [stripe.com/docs](https://stripe.com/docs)
- **React**: [react.dev](https://react.dev)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com)

### Common Issues & Solutions

**Problem**: "User profile not found"
- **Cause**: Auth user created but profile not in KV store
- **Fix**: Re-signup or manually create profile entry

**Problem**: Can't access premium features after upgrading
- **Cause**: Frontend hasn't refreshed user profile
- **Fix**: Refresh page or call `refreshProfile()`

**Problem**: "Unauthorized" on API calls
- **Cause**: Access token expired or not sent
- **Fix**: Re-login to get fresh token

**Problem**: Payment not working
- **Cause**: Stripe not integrated yet!
- **Fix**: Follow Stripe integration guide

## Next Steps

### For Immediate Demo/Testing:
1. ✅ Test the current system
2. ✅ Gather user feedback
3. ✅ Refine UX/UI based on feedback

### For Production Launch:
1. 🔧 Integrate Stripe payments
2. 🔧 Add email verification
3. 🔧 Deploy to Vercel/Netlify
4. 🔧 Configure custom domain
5. 🔧 Add monitoring & analytics
6. 🔧 Create legal pages (privacy, terms)
7. 🚀 Launch!

### For Long-term Growth:
1. 📊 Analyze user behavior
2. 🎯 Optimize conversion funnel
3. 🆕 Add requested features
4. 📈 Implement marketing site (Webflow)
5. 💰 Optimize pricing strategy

## Support

Questions about the implementation? Check these files:
- `MEMBERSHIP_SYSTEM.md` - Full membership documentation
- `components/auth/StripeIntegrationGuide.tsx` - Payment setup
- `contexts/AuthContext.tsx` - Auth implementation
- `supabase/functions/server/index.tsx` - Backend API

Good luck with RetirePath AI! 🎉
