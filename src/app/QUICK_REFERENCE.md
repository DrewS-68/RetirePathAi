# RetirePath AI - Quick Reference Card

## 🚀 Instant Start

**The app is ready to use right now!** Just open it and click "View Plans" to create an account.

## 🔑 Test Credentials

Use these for testing:
```
Name: Test User
Email: test@example.com
Password: test123456
```

## 💳 Membership Tiers

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Home Valuation, Resources, Guides |
| **Premium** | $29/month | ↑ + Contract Review, Village Matcher, Progress Tracker |
| **Family** | $49/month | ↑ + Multi-user, Shared access, Priority support |

## 📁 Key Files

### Want to understand the code?
- `contexts/AuthContext.tsx` - Authentication logic
- `components/auth/` - All auth UI components
- `supabase/functions/server/index.tsx` - Backend API

### Want to add payments?
- `components/auth/StripeIntegrationGuide.tsx` - Step-by-step Stripe setup

### Want to deploy?
- `SETUP_GUIDE.md` - Deployment instructions

### Want full documentation?
- `MEMBERSHIP_SYSTEM.md` - Complete system docs

## 🎯 Common Tasks

### Add a new feature
1. Create the component
2. Add to `App.tsx` navigation
3. Wrap in `<FeatureGate feature="feature-name">`
4. Add feature to access rules in `AuthContext.tsx`

### Change pricing
Edit the `plans` array in `components/auth/MembershipPlans.tsx`

### Add a new membership tier
1. Update `plans` in `MembershipPlans.tsx`
2. Update `accessRules` in `AuthContext.tsx`
3. Update backend `accessRules` in `server/index.tsx`

### Manually upgrade a user
```javascript
// In browser console
await fetch(`https://luwfbkxjbogfapgkznve.supabase.co/functions/v1/make-server-3bba8be8/user/update-membership`, {
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

## 🐛 Troubleshooting

### "User profile not found"
→ Re-create the account

### Can't access premium features
→ Check membership tier in user menu
→ Try refreshing the page

### "Unauthorized" errors
→ Sign out and sign in again
→ Access token may have expired

### Sign up not working
→ Check browser console for errors
→ Verify Supabase is connected
→ Check server logs in Supabase dashboard

## 🔗 API Endpoints

Base URL: `https://luwfbkxjbogfapgkznve.supabase.co/functions/v1/make-server-3bba8be8`

- `POST /signup` - Create account
- `GET /user/profile` - Get user data (requires auth)
- `POST /user/update-membership` - Change tier (requires auth)
- `POST /user/check-access` - Verify feature access (requires auth)

## 🎨 Customization Points

### Colors
Brand colors defined in:
- Primary: `#2D6A4F`
- Dark: `#1B4332`
- Light: `#74C69D`

### Membership Features
Edit feature access in:
- `contexts/AuthContext.tsx` (line 119)
- `supabase/functions/server/index.tsx` (line 139)

### Pricing Display
Edit plans in:
- `components/auth/MembershipPlans.tsx` (line 14)

## 📊 Monitoring

### Check user signups
→ Supabase Dashboard → Authentication → Users

### Check API logs
→ Supabase Dashboard → Edge Functions → Logs

### Check errors
→ Browser console (F12)

## ⚡ Quick Commands

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

### View Supabase logs
```bash
supabase functions logs server
```

## ⚠️ Remember

- ❌ **NO payment processing yet** - Requires Stripe integration
- ❌ **NOT production-ready** - Missing security features
- ✅ **Perfect for demos** - Fully functional for testing
- ✅ **Easy to extend** - Well-documented code

## 📞 Support

Questions? Check:
1. `IMPLEMENTATION_SUMMARY.md` - What was built
2. `MEMBERSHIP_SYSTEM.md` - How it works
3. `SETUP_GUIDE.md` - How to deploy
4. `StripeIntegrationGuide.tsx` - How to add payments

## 🎓 Next Steps

**For Testing:**
1. Test the signup flow
2. Try different tiers
3. Test feature access
4. Get user feedback

**For Production:**
1. Integrate Stripe (2-4 hours)
2. Deploy to Vercel/Netlify (30 minutes)
3. Configure custom domain (1 hour)
4. Add monitoring (1 hour)
5. Launch! 🚀

---

**Quick Tip:** The fastest way to see everything working is to create a Free account, try to access Contract Review, and you'll see the upgrade prompt!
