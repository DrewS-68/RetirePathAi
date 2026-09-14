# RetirePath - Stripe Payment Setup Instructions

## Overview
This document provides step-by-step instructions for setting up Stripe payments for the RetirePath platform. Follow these steps when you're ready to accept live payments from customers.

---

## PART 1: BUSINESS PREREQUISITES

### Before Setting Up Stripe, You Need:

1. **Registered Business Name**
   - Register "RetirePath" (or your chosen business name) with ASIC
   - Obtain your ABN (Australian Business Number)
   - Obtain your ACN (Australian Company Number) if registering as a company

2. **Business Bank Account**
   - Open a dedicated business bank account
   - Have the following details ready:
     - BSB number
     - Account number
     - Account holder name (must match business name)

3. **Business Documentation**
   - Business registration certificate
   - ABN certificate
   - Director/owner identification (Driver's license or passport)
   - Proof of business address

---

## PART 2: STRIPE ACCOUNT SETUP

### Step 1: Create Stripe Account

1. Go to **https://stripe.com**
2. Click "Start now" or "Sign up"
3. Choose "Australia" as your country
4. Enter your email address and create a password
5. Verify your email address

### Step 2: Complete Business Profile

Stripe will ask you to provide:

**Business Information:**
- Legal business name: RetirePath (or your registered name)
- Business type: Company / Sole Trader / Partnership
- ABN (Australian Business Number)
- Business address
- Phone number
- Website: Your RetirePath domain
- Business description: "Software platform for retirees transitioning to retirement villages"
- Industry category: Software / SaaS

**Personal Information (Business Owner/Director):**
- Full legal name
- Date of birth
- Home address
- Phone number
- Email address

**Identification Verification:**
- Upload photo ID (Driver's license or passport)
- May require selfie verification
- Sometimes requires proof of address (utility bill, bank statement)

### Step 3: Connect Bank Account

1. In Stripe Dashboard, go to **Settings** → **Bank accounts and scheduling**
2. Click **Add bank account**
3. Enter your business bank account details:
   - BSB number
   - Account number
   - Account holder name (must match business name)
4. Stripe will send **two small test deposits** (usually within 2-3 business days)
5. Verify the amounts in your Stripe dashboard to confirm the account

### Step 4: Set Payout Schedule

1. Go to **Settings** → **Bank accounts and scheduling**
2. Choose your payout frequency:
   - **Daily** (recommended for regular cash flow)
   - **Weekly** (every Monday, Tuesday, etc.)
   - **Monthly** (on a specific day of the month)
3. Note: First payout typically takes 7-14 days for security verification

---

## PART 3: GET YOUR API KEYS

### Locate Your API Keys

1. In Stripe Dashboard, go to **Developers** → **API keys**
2. You'll see two types of keys:

**LIVE MODE KEYS** (for production)
- Publishable key (starts with `pk_live_...`)
- Secret key (starts with `sk_live_...`)

**TEST MODE KEYS** (for testing)
- Publishable key (starts with `pk_test_...`)
- Secret key (starts with `sk_test_...`)

### Important Security Notes:

⚠️ **SECRET KEY SECURITY:**
- NEVER share your secret key publicly
- NEVER commit it to GitHub or public repositories
- NEVER use it in frontend/client-side code
- Store it securely in environment variables only

✅ **PUBLISHABLE KEY:**
- Safe to use in frontend code
- Can be visible in browser
- No security risk if exposed

---

## PART 4: WEBHOOK SETUP

Webhooks allow Stripe to notify your app when payments succeed or fail.

### Create Webhook Endpoint

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL:
   ```
   https://YOUR_SUPABASE_PROJECT_ID.supabase.co/functions/v1/make-server-3bba8be8/stripe/webhook
   ```
   Replace `YOUR_SUPABASE_PROJECT_ID` with your actual Supabase project ID

4. Select events to listen for:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`

5. Click **Add endpoint**

6. **Copy the Webhook Signing Secret** (starts with `whsec_...`)
   - You'll need this for your environment variables

---

## PART 5: ADD KEYS TO RETIREPATH

### Environment Variables to Update

You need to add the following to your Supabase environment:

1. **STRIPE_SECRET_KEY**
   - Value: Your Stripe secret key (sk_live_... or sk_test_...)
   
2. **STRIPE_PUBLISHABLE_KEY**
   - Value: Your Stripe publishable key (pk_live_... or pk_test_...)
   
3. **STRIPE_WEBHOOK_SECRET**
   - Value: Your webhook signing secret (whsec_...)

### How to Add Environment Variables in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** → **Edge Functions**
3. Scroll to **Secrets**
4. Add each environment variable:
   - Name: `STRIPE_SECRET_KEY`
   - Value: (paste your secret key)
   - Click **Add secret**
5. Repeat for `STRIPE_WEBHOOK_SECRET`

---

## PART 6: UPDATE PAYMENT REDIRECT URLS

### Update Success and Cancel URLs

In the file `/supabase/functions/server/stripe.tsx`, update the following URLs:

**Success URL:**
```
success_url: 'https://YOUR_DOMAIN.com?payment=success'
```

**Cancel URL:**
```
cancel_url: 'https://YOUR_DOMAIN.com?payment=cancelled'
```

Replace `YOUR_DOMAIN.com` with your actual RetirePath domain.

---

## PART 7: TESTING BEFORE GOING LIVE

### Test Mode (No Business Setup Required)

Before registering your business, you can test everything:

1. Use **Test Mode** API keys from Stripe
2. No bank account verification needed
3. Use Stripe test card numbers:

**Test Card Numbers:**
- ✅ **Success**: 4242 4242 4242 4242
- ❌ **Decline**: 4000 0000 0000 0002
- 🔄 **Requires Auth**: 4000 0025 0000 3155

**Test Card Details:**
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- Postal code: Any 5 digits (e.g., 12345)

### Testing Checklist

Test the following scenarios:

- ✅ Create Premium 1-month subscription
- ✅ Create Premium 3-month subscription  
- ✅ Create Premium 6-month subscription
- ✅ Create Family 1-month subscription
- ✅ Create Family 3-month subscription
- ✅ Create Family 6-month subscription
- ✅ Verify payment success message
- ✅ Verify user membership tier updated
- ✅ Verify expiration date calculated correctly
- ✅ Test payment cancellation
- ✅ Test declined card
- ✅ Check webhook received in Stripe dashboard

---

## PART 8: GO LIVE CHECKLIST

### Before Switching to Live Mode:

- ✅ Business registered and ABN obtained
- ✅ Business bank account opened and verified
- ✅ Stripe account fully verified
- ✅ Bank account connected to Stripe
- ✅ Test deposits verified
- ✅ All features tested in Test Mode
- ✅ Live API keys obtained
- ✅ Webhook endpoint configured
- ✅ Environment variables updated with LIVE keys
- ✅ Success/Cancel URLs updated to production domain
- ✅ Terms and conditions updated on website
- ✅ Privacy policy includes payment processing information
- ✅ Refund policy documented

### Switching to Live Mode:

1. In Stripe Dashboard, toggle from **Test Mode** to **Live Mode** (top right)
2. Get your **Live API keys** (Developers → API keys)
3. Update environment variables with **Live keys**
4. Update webhook endpoint with production URL
5. Update redirect URLs to production domain
6. Test with a real $1 payment to yourself
7. Refund the test payment
8. Monitor first few real transactions closely

---

## PART 9: STRIPE FEES & PAYOUTS

### Australian Pricing

**Domestic Cards (Australian issued):**
- 1.75% + 30¢ per successful transaction

**International Cards:**
- 2.9% + 30¢ per successful transaction

**Additional Fees:**
- No monthly fees
- No setup fees
- No cancellation fees

### Examples:

**Premium - 1 Month ($19.00):**
- Stripe fee: $0.63 (domestic) or $0.85 (international)
- You receive: $18.37 or $18.15

**Premium - 6 Months ($94.86 with 17% discount):**
- Stripe fee: $1.96 (domestic) or $3.05 (international)
- You receive: $92.90 or $91.81

**Family - 6 Months ($194.22 with 17% discount):**
- Stripe fee: $3.70 (domestic) or $5.93 (international)
- You receive: $190.52 or $188.29

### Payout Schedule

- **First payout**: 7-14 days after first payment (security measure)
- **Subsequent payouts**: According to your schedule (daily/weekly/monthly)
- **Standard payout time**: 2 business days to reach your bank account
- **Instant payouts**: Available for 1.5% additional fee (optional)

---

## PART 10: ONGOING MANAGEMENT

### Stripe Dashboard Features

**Monitor Payments:**
- View all transactions in real-time
- Filter by date, amount, status
- Search for specific customers
- Export transaction data

**Handle Refunds:**
- Full or partial refunds
- Processed within 5-10 business days
- Customer sees refund on their statement

**Dispute Management:**
- Customer disputes (chargebacks) handled in dashboard
- Provide evidence if customer claims unauthorized payment
- Stripe deducts disputed amount until resolved

**Reports:**
- Daily/weekly/monthly summaries
- Download statements for accounting
- Tax reports for end of financial year

### Important Dashboard Locations

**View Payments:**
Dashboard → Payments

**Issue Refunds:**
Dashboard → Payments → Click transaction → Refund

**View Payouts:**
Dashboard → Balance → Payouts

**Customer Management:**
Dashboard → Customers

**Download Reports:**
Dashboard → Reports

---

## PART 11: TROUBLESHOOTING

### Common Issues

**Payment Declined:**
- Customer's bank declined the card
- Insufficient funds
- Card expired or invalid
- International card restrictions
- Customer should contact their bank

**Webhook Not Received:**
- Check webhook URL is correct
- Verify webhook signing secret is correct
- Check Stripe webhook logs (Developers → Webhooks → Click endpoint)
- Ensure your server endpoint is accessible

**Customer Didn't Get Access:**
- Check if payment succeeded in Stripe dashboard
- Check webhook was received
- Check server logs for errors
- Verify database was updated
- Manually grant access if needed

**Bank Transfer Delayed:**
- First payout takes 7-14 days
- Subsequent payouts take 2 business days
- Check payout schedule in Stripe settings
- Verify bank account details are correct

### Getting Help

**Stripe Support:**
- Email: support@stripe.com
- Chat: Available in Stripe dashboard
- Phone: Available for verified accounts
- Documentation: https://stripe.com/docs

**Stripe Status Page:**
- https://status.stripe.com
- Check for service outages

---

## PART 12: COMPLIANCE & LEGAL

### PCI Compliance

✅ **Good News:** You're automatically PCI compliant because:
- Stripe Checkout handles all card details
- No card data touches your servers
- Stripe is PCI Level 1 certified

### What You Need to Do:

**Privacy Policy:**
- State that you use Stripe for payment processing
- Link to Stripe's privacy policy
- Explain what payment data is collected

**Terms & Conditions:**
- Clearly state pricing
- Explain subscription terms (one-time payment, expiration)
- Define refund policy
- State that payments are processed by Stripe

**Refund Policy:**
- Define circumstances for refunds (if any)
- State timeframe for refund requests
- Explain refund processing time

### Data Retention

**Stripe Stores:**
- Customer name and email
- Payment method details (securely tokenized)
- Transaction history
- Billing address (if collected)

**You Store:**
- User ID
- Membership tier
- Expiration date
- Payment status

---

## PART 13: OPTIONAL ENHANCEMENTS

### Features You Can Add Later:

**Email Receipts:**
- Stripe sends automatic receipts
- Can customize email template in Stripe settings

**Subscription Expiration Reminders:**
- Can be implemented with scheduled functions
- Email users 7 days before expiration
- Encourage renewal

**Discount Codes:**
- Create promo codes in Stripe dashboard
- Apply percentage or fixed amount discounts
- Set expiration dates and usage limits

**Payment Links:**
- Create shareable payment links
- No website needed
- Good for special offers

**Customer Portal:**
- Let customers view payment history
- Download invoices
- Update billing information

---

## PART 14: QUICK REFERENCE

### Essential Stripe URLs

**Dashboard:** https://dashboard.stripe.com
**API Keys:** https://dashboard.stripe.com/apikeys
**Webhooks:** https://dashboard.stripe.com/webhooks
**Customers:** https://dashboard.stripe.com/customers
**Payments:** https://dashboard.stripe.com/payments
**Documentation:** https://stripe.com/docs
**Support:** https://support.stripe.com

### Test Cards

| Scenario | Card Number | Result |
|----------|-------------|--------|
| Success | 4242 4242 4242 4242 | Payment succeeds |
| Decline | 4000 0000 0000 0002 | Card declined |
| Insufficient Funds | 4000 0000 0000 9995 | Insufficient funds |
| Auth Required | 4000 0025 0000 3155 | Requires authentication |

### RetirePath Pricing

| Tier | 1 Month | 3 Months | 6 Months |
|------|---------|----------|----------|
| Premium | $19.00 | $50.73 (11% off) | $94.86 (17% off) |
| Family | $39.00 | $105.30 (10% off) | $194.22 (17% off) |

### Support Contacts

**Stripe Issues:**
- Email: support@stripe.com
- Dashboard chat support

**RetirePath Technical Issues:**
- Check server logs in Supabase
- Review webhook logs in Stripe
- Check database for user updates

---

## FINAL CHECKLIST

### Before Launch:
- [ ] Business registered with ASIC
- [ ] ABN obtained
- [ ] Business bank account opened
- [ ] Stripe account created
- [ ] Business verification completed
- [ ] Bank account connected and verified
- [ ] Live API keys obtained
- [ ] Webhook endpoint configured
- [ ] Environment variables updated
- [ ] Test mode fully tested
- [ ] Live mode tested with $1 transaction
- [ ] Privacy policy updated
- [ ] Terms & conditions updated
- [ ] Refund policy documented

### Post-Launch:
- [ ] Monitor first 10 transactions closely
- [ ] Verify webhooks are received
- [ ] Check user accounts are updated correctly
- [ ] Confirm payouts arrive in bank account
- [ ] Set up accounting software integration (Xero, MYOB, etc.)
- [ ] Create monthly reporting process
- [ ] Document refund process for customer service
- [ ] Train team on Stripe dashboard

---

## SUMMARY

**Total Setup Time:** 2-4 weeks (mostly waiting for business registration)

**Active Setup Time:** 2-3 hours

**Testing Time:** 1-2 hours

**Ongoing Management:** 15-30 minutes per week

**Cost:** No upfront costs, only transaction fees (1.75% + 30¢)

---

## Questions or Issues?

**Stripe Support:**
- Available 24/7 via email and chat
- Extensive documentation library
- Active developer community

**Common First-Timer Questions:**

**Q: Do I need a developer to set up Stripe?**
A: No, the RetirePath integration is already complete. You just need to add your API keys.

**Q: How long until I get my first payout?**
A: 7-14 days for first payout, then 2 business days for subsequent payouts.

**Q: What if a customer disputes a payment?**
A: Handle it through Stripe's dispute center. Provide evidence of service delivery.

**Q: Can I change my pricing later?**
A: Yes, update prices in your RetirePath code and redeploy.

**Q: What happens if Stripe goes down?**
A: Rare, but payments would fail temporarily. Check status.stripe.com.

---

**Document Version:** 1.0
**Last Updated:** December 2024
**Platform:** RetirePath
**Payment Processor:** Stripe

---

END OF DOCUMENT
