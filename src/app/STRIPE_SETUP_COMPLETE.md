# Complete Stripe Setup Guide for RetirePath AI

## What You'll Accomplish

After following this guide, your app will:
- ✅ Accept real credit card payments
- ✅ Automatically charge monthly subscriptions
- ✅ Give users immediate access after payment
- ✅ Handle cancellations and refunds
- ✅ Send payment receipts via email

**Time needed:** 2-4 hours (mostly waiting for approvals)

**Status:** ✅ Backend code is READY - Frontend code is READY - You just need to add your Stripe keys!

---

## Part 1: Create Stripe Account (15 minutes)

### Step 1: Sign Up

1. Go to **https://stripe.com**
2. Click "Start now" or "Sign up"
3. Enter your email, name, and password
4. **Important:** Choose your country carefully (can't change later)

### Step 2: Activate Your Account

Stripe will ask for:
- Business information (even if it's just you)
- Bank account details (where they'll deposit money)
- Tax ID (SSN for individuals, EIN for businesses)
- Personal verification (ID photo)

**Note:** You can start in "Test Mode" without completing this, but you'll need to finish it before accepting real payments.

### Step 3: Get Your API Keys

1. In Stripe Dashboard, click **Developers** in the top menu
2. Click **API keys** in the left sidebar
3. You'll see two keys:
   - **Publishable key** (starts with `pk_test_...`) - Safe to use in frontend
   - **Secret key** (starts with `sk_test_...`) - NEVER share or put in frontend

**Copy both keys** - you'll need them in the next step.

---

## Part 2: Add Stripe Keys to Supabase (5 minutes)

### Step 4: Add Environment Variables

1. Open **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project (RetirePath AI)
3. Go to **Settings** (bottom left)  **Edge Functions** → **Secrets**
4. Click **Add new secret** and add these THREE secrets:

**Secret 1:**
```
Name: STRIPE_SECRET_KEY
Value: sk_test_... (paste your secret key from Stripe)
```

**Secret 2:**
```
Name: STRIPE_PUBLISHABLE_KEY
Value: pk_test_... (paste your publishable key from Stripe)
```

**Secret 3:**
```
Name: APP_URL
Value: http://localhost:5173
(or your deployed app URL if already deployed)
```

**Secret 4** (You'll add this later after Step 7):
```
Name: STRIPE_WEBHOOK_SECRET
Value: whsec_... (you'll get this from Stripe webhook setup)
```

5. Click **Save** for each one

---

## Part 3: Test in Development (10 minutes)

### Step 5: Test a Payment

1. **Refresh your app** (the backend now has Stripe configured!)
2. Click "View Plans"
3. Sign in (or create an account if you haven't)
4. Click "Start Premium" or "Start Family Plan"
5. You'll be redirected to Stripe Checkout

### Step 6: Use Stripe Test Cards

Use these test credit card numbers:

**Success:**
```
Card: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

**Decline:**
```
Card: 4000 0000 0000 0002
(This will simulate a declined payment)
```

**More test cards**: https://stripe.com/docs/testing

### What Should Happen:
1. You fill out the Stripe form
2. Click "Subscribe"
3. Redirected back to your app
4. Your account is automatically upgraded to Premium/Family
5. You can now access all premium features!

---

## Part 4: Set Up Webhooks (20 minutes)

Webhooks tell your app when payments succeed, fail, or subscriptions cancel.

### Step 7: Create Webhook in Stripe

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter this URL:
   ```
   https://luwfbkxjbogfapgkznve.supabase.co/functions/v1/make-server-3bba8be8/stripe-webhook
   ```
4. Click **Select events**
5. Choose these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Click **Add endpoint**

### Step 8: Get Webhook Secret

1. After creating the webhook, you'll see **Signing secret**
2. Click **Reveal** to see it (starts with `whsec_...`)
3. Copy this secret
4. Go back to Supabase → Settings → Edge Functions → Secrets
5. Add a new secret:
   ```
   Name: STRIPE_WEBHOOK_SECRET
   Value: whsec_... (paste the webhook secret)
   ```

---

## Part 5: Update Prices (Optional)

### Step 9: Change Your Pricing

If you want different prices than $29/$49:

**Frontend** - Update display prices:
- File: `/components/auth/MembershipPlans.tsx`
- Line 39: `price: '$29'` ← Premium
- Line 61: `price: '$49'` ← Family

**Backend** - Update actual charges:
- File: `/supabase/functions/server/index.tsx`
- Find the `prices` object (around line 239):
```typescript
const prices = {
  premium: 2900,  // Change to 3900 for $39
  family: 4900,   // Change to 5900 for $59
};
```

**Remember:** Stripe uses cents! $29 = 2900 cents

---

## Part 6: Go Live (Production)

### Step 10: Switch to Live Mode

When you're ready to accept real payments:

1. **Complete Stripe activation** (provide all business info)
2. In Stripe Dashboard, toggle from **Test mode** to **Live mode** (top right)
3. Get your **LIVE API keys**:
   - Publishable key (starts with `pk_live_...`)
   - Secret key (starts with `sk_live_...`)
4. Update Supabase secrets with LIVE keys (replace the test keys)
5. Create a NEW webhook for live mode (repeat Steps 7-8 with live keys)

---

## Troubleshooting

### "No authorization token provided"
- User isn't logged in
- Have them sign in first before trying to pay

### "Failed to create checkout session"
- Check Supabase Edge Function logs
- Make sure STRIPE_SECRET_KEY is set correctly
- Make sure key starts with `sk_test_` (test) or `sk_live_` (production)

### Payment succeeds but user not upgraded
- Check webhook is configured correctly
- Check STRIPE_WEBHOOK_SECRET is set
- Look at Supabase Edge Function logs for webhook errors
- Test webhook manually in Stripe Dashboard

### "Webhook signature verification failed"
- STRIPE_WEBHOOK_SECRET is wrong
- Get the correct secret from Stripe Dashboard → Webhooks → Your endpoint → Signing secret

---

##  What's Already Done

✅ **Backend Stripe Integration** - Complete!
✅ **Checkout Session Creation** - Complete!
✅ **Webhook Handler** - Complete!
✅ **Frontend Checkout Flow** - Complete!
✅ **Automatic Membership Upgrades** - Complete!

## What You Need To Do

1. ⬜ Create Stripe account (15 min)
2. ⬜ Add API keys to Supabase (5 min)
3. ⬜ Test with test card (10 min)
4. ⬜ Set up webhook (20 min)
5. ⬜ Test subscription flow end-to-end (15 min)

**Total time: ~1 hour** (plus waiting for Stripe account approval if needed)

---

## Cost Breakdown

### Stripe Fees
- **2.9% + $0.30** per transaction
- Example: $29 charge = $1.14 fee (you keep $27.86)
- Example: $49 charge = $1.72 fee (you keep $47.28)

### No Monthly Fees
- Stripe is free until you make money
- Only pay per transaction

### First Month Example (10 customers)
- 5 Premium ($29) + 5 Family ($49) = $145 + $245 = $390 revenue
- Stripe fees: ~$11.50
- **Your profit: $378.50**

---

## Testing Checklist

Before going live, test these scenarios:

- [ ] Free tier signup works
- [ ] Premium signup with test card works
- [ ] Family signup with test card works
- [ ] User upgraded immediately after payment
- [ ] Can access premium features after payment
- [ ] Declined card shows error message
- [ ] Can cancel subscription in Stripe Dashboard
- [ ] User downgraded after cancellation
- [ ] Webhook logs show successful events

---

## Need Help?

**Stripe Documentation:**
- Checkout: https://stripe.com/docs/payments/checkout
- Webhooks: https://stripe.com/docs/webhooks
- Testing: https://stripe.com/docs/testing

**Common Questions:**

Q: Can I offer annual billing?
A: Yes! Change `interval: 'month'` to `interval: 'year'` in the backend code.

Q: Can I offer a free trial?
A: Yes! Add `subscription_data: { trial_period_days: 14 }` to the checkout session.

Q: Can users manage their subscription?
A: Yes! Stripe provides a Customer Portal. You'll need to add a "Manage Subscription" button.

Q: What about refunds?
A: Handle refunds through Stripe Dashboard or build a refund endpoint.

---

## 🎉 You're Done!

Once you've added your Stripe keys and set up webhooks, your app will be fully functional for accepting payments!

**Next steps:**
1. Test thoroughly with test cards
2. Deploy your app (Vercel/Netlify)
3. Switch to live mode
4. Start accepting real payments!

Good luck! 🚀