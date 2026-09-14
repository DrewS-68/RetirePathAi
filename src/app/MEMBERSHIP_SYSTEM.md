# RetirePath AI - Membership & Payment System

## Overview

RetirePath AI now includes a complete membership system with three tiers:
- **Free**: Basic features (Home Valuation, Resources, Guides)
- **Premium** ($29/month): Full access to all features
- **Family** ($49/month): Premium features + multi-user access

## What's Been Implemented

### 1. Authentication System
- **Location**: `/contexts/AuthContext.tsx`
- User registration (sign up)
- User login/logout
- Session management with Supabase Auth
- Profile management

### 2. Backend API (Supabase Edge Functions)
- **Location**: `/supabase/functions/server/index.tsx`
- `POST /signup` - Create new user accounts
- `GET /user/profile` - Fetch user profile and membership tier
- `POST /user/update-membership` - Update membership status
- `POST /user/check-access` - Verify feature access permissions

### 3. Frontend Components

#### Authentication Components
- **SignUp** (`/components/auth/SignUp.tsx`) - Registration form
- **Login** (`/components/auth/Login.tsx`) - Login form
- **MembershipPlans** (`/components/auth/MembershipPlans.tsx`) - Tier selection
- **UserMenu** (`/components/auth/UserMenu.tsx`) - User profile dropdown
- **FeatureGate** (`/components/auth/FeatureGate.tsx`) - Access control wrapper

#### Protected Features
The following features are now protected by membership tier:
- ✅ **Contract Review** - Premium/Family only
- ✅ **Village Matcher** - Premium/Family only
- ✅ **Progress Tracker** - Premium/Family only
- ✅ **Family Guide** - Premium/Family only
- ✅ **Home Valuation** - Available to Free tier
- ✅ **Resources** - Available to Free tier
- ✅ **Guides** - Available to Free tier

## How It Works

### User Registration Flow
1. User clicks "Get Started" or "View Plans"
2. Selects a membership tier (Free, Premium, or Family)
3. Fills out registration form (name, email, password)
4. Account is created in Supabase Auth
5. User profile is stored in KV store with selected tier
6. User is automatically logged in

### Feature Access Control
```tsx
<FeatureGate feature="contract-review">
  <ContractReview userData={userData} />
</FeatureGate>
```

When a user tries to access a premium feature:
- If not logged in → Shows "Sign In Required" prompt
- If logged in with Free tier → Shows "Upgrade to Premium" prompt
- If logged in with Premium/Family → Shows the feature

## Payment Integration (Not Yet Implemented)

### Current Status
⚠️ **IMPORTANT**: The app currently does NOT process payments. Users can:
- Create accounts
- Select membership tiers
- Access features based on their tier

However, no actual payment is collected. The membership tier is stored in the database but is essentially "honor system" at this point.

### To Add Real Payments with Stripe

Follow the detailed instructions in:
- `/components/auth/StripeIntegrationGuide.tsx`

**Quick Overview:**
1. Create a Stripe account at https://stripe.com
2. Get your API keys (Publishable and Secret)
3. Add Stripe keys to Supabase environment variables
4. Install `@stripe/stripe-js` on frontend
5. Add checkout session endpoint to backend
6. Add webhook handler for payment events
7. Update MembershipPlans component to use Stripe Checkout
8. Configure webhook in Stripe Dashboard

### Why Stripe?
- Industry-standard payment processor
- Handles all sensitive payment data (PCI compliant)
- Supports subscriptions out of the box
- No credit card data stored in your app
- Built-in fraud protection

## Database Schema

User profiles are stored in Supabase KV store with this structure:

```typescript
{
  id: string;              // Supabase Auth user ID
  email: string;           // User email
  name: string;            // User full name
  membershipTier: 'free' | 'premium' | 'family';
  createdAt: string;       // ISO timestamp
  stripeCustomerId: string | null;  // For future Stripe integration
  subscriptionStatus: 'active' | 'canceled' | 'past_due';
  updatedAt?: string;      // ISO timestamp
}
```

Key: `user:{userId}`

## Security Considerations

### ✅ Implemented
- Passwords handled by Supabase Auth (hashed and secure)
- JWT-based authentication
- Protected API endpoints require valid access tokens
- Row-level security through user ID checks
- Service role key kept on backend only

### ⚠️ Important for Production
- **Email verification**: Currently disabled (auto-confirmed)
  - Enable email verification in production
  - Configure SMTP server in Supabase
- **Rate limiting**: Add to prevent abuse
- **HTTPS only**: Required for production
- **Environment variables**: Never expose keys in frontend
- **PII compliance**: This prototype is NOT compliant with GDPR/CCPA
  - Add proper privacy policy
  - Add data deletion capabilities
  - Add consent management

## Testing the System

### Create a Test Account
1. Go to the app homepage
2. Click "View Plans"
3. Select any tier (no payment required)
4. Fill in test information:
   - Name: Test User
   - Email: test@example.com
   - Password: test123 (min 6 characters)
5. Click "Create Account"

### Test Feature Access
- **Free tier**: Can access Home Valuation, Resources, Guides
- **Premium/Family**: Can access all features

### Upgrade/Downgrade
Currently, users must be upgraded manually through the backend:
```typescript
// In browser console or via API call
await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/user/update-membership`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    membershipTier: 'premium'
  }),
});
```

Once Stripe is integrated, this will happen automatically when payment is successful.

## Next Steps

### Immediate (Required for Production)
1. **Integrate Stripe** for payment processing
2. **Enable email verification** in Supabase Auth settings
3. **Add password reset** functionality
4. **Add subscription management** (cancel, update payment method)
5. **Add billing history** page

### Future Enhancements
1. **Free trial period** (14 days mentioned in UI)
2. **Annual billing option** (with discount)
3. **Promotional codes/coupons**
4. **Referral program**
5. **Family member invitations** (for Family tier)
6. **Usage analytics** (track feature usage by tier)
7. **Admin dashboard** (manage users, subscriptions)

## Support & Troubleshooting

### Common Issues

**"User profile not found" error**
- User was created in Auth but not in KV store
- Re-run signup process or manually create profile

**"Unauthorized" when accessing features**
- Session expired - user needs to log in again
- Access token not being sent correctly

**Can't access premium features after upgrading**
- User needs to refresh the page
- Call `refreshProfile()` from AuthContext

### Debugging Tips
All errors are logged to console with context. Check:
1. Browser console for frontend errors
2. Supabase Edge Function logs for backend errors
3. Network tab to see API requests/responses

## License & Disclaimer

This is a prototype built with Figma Make. It is NOT production-ready and lacks:
- Real payment processing
- Email verification
- Rate limiting
- Comprehensive error handling
- Data privacy compliance
- Security hardening

For production use, you must add proper security measures and comply with all relevant regulations (PCI-DSS for payments, GDPR/CCPA for data privacy, etc.).
