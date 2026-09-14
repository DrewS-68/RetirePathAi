# 💰 Current Pricing Structure

## ✅ Introductory Pricing (Active Now)

Your RetirePath AI platform is now set to these lower introductory prices to attract early customers:

### Free Tier
- **Price:** $0 forever
- **Access to:** 
  - Home Valuation Calculator
  - Educational Resources
  - Retirement Village Guides
  - Selling Process Guide

### Premium Tier ⭐ Most Popular
- **Price:** $19/month (was $29)
- **Access to:**
  - Everything in Free
  - AI Contract Review & Analysis
  - Risk Scoring & Alerts
  - Village Matcher
  - Progress Tracker
  - Family Communication Guide
  - Lifetime Cost Calculations
  - Inheritance Projections
  - Priority Support

### Family Tier
- **Price:** $39/month (was $49)
- **Access to:**
  - Everything in Premium
  - Up to 5 family member accounts
  - Shared document access
  - Collaborative notes
  - Family decision tracking
  - Dedicated family advisor
  - Video consultation (monthly)

---

## 🎯 Strategy Behind These Prices

**Lower introductory pricing to:**
- ✅ Attract early adopters
- ✅ Get initial customer feedback
- ✅ Build testimonials and case studies
- ✅ Gain market traction
- ✅ Test pricing sensitivity

**You can raise prices later once you have:**
- Proven customer demand
- Positive testimonials
- Established market presence
- Refined features based on feedback

---

## 💡 When to Increase Prices

Consider raising prices when you:

1. **Get your first 10-20 paying customers** (validates the concept)
2. **Have positive testimonials** (social proof)
3. **Add new features** (more value = higher price)
4. **See strong demand** (people signing up regularly)
5. **After 3-6 months** (gradual increase strategy)

**Suggested future pricing:**
- Premium: $19 → $29 → $39
- Family: $39 → $49 → $79

---

## 📝 Where Prices Are Set

### Frontend Display (What users see):
**File:** `/components/auth/MembershipPlans.tsx`
- Line 22: Free = $0
- Line 43: Premium = $19
- Line 65: Family = $39

### Backend Charges (What Stripe charges):
**File:** `/supabase/functions/server/index.tsx`
- Line 238: Premium = 1900 cents ($19.00)
- Line 239: Family = 3900 cents ($39.00)

**Both files are now updated and synced!** ✅

---

## 🔄 How to Change Prices Later

When you're ready to increase prices:

### Option 1: Ask Me
Just say: "Change Premium to $29" and I'll update both files

### Option 2: Manual Update
1. Open `/components/auth/MembershipPlans.tsx`
   - Change line 43: `price: '$29'`
   - Change line 65: `price: '$49'`

2. Open `/supabase/functions/server/index.tsx`
   - Change line 238: `premium: 2900` (cents)
   - Change line 239: `family: 4900` (cents)

3. Save both files

**Important:** Always update BOTH files so the display matches what Stripe charges!

---

## 💳 Stripe Setup Required

**Before you can accept payments:**

1. Create a Stripe account at https://stripe.com
2. Get your API keys from Stripe Dashboard
3. Add keys to Supabase (see `STRIPE_SETUP_COMPLETE.md`)

**Until then:**
- Users can sign up for FREE tier (works now)
- Premium/Family buttons show Stripe setup notice
- All code is ready to go!

---

## 📊 Pricing Psychology Tips

**$19 vs $20:** The "9" makes it feel cheaper (works!)

**$39 vs $40:** Same principle - looks like "30s" not "40s"

**Round numbers ($20, $50):** Feel premium but less friendly

**Odd numbers ($19, $39):** Feel like a deal/discount

**Your current pricing ($19/$39) is perfect for:**
- Introductory offers
- Early adopter pricing
- Testing the market
- Building initial customer base

---

## 🎯 Summary

✅ **Current prices:** $19 Premium / $39 Family
✅ **Previous prices:** $29 Premium / $49 Family
✅ **Strategy:** Lower intro pricing to gain traction
✅ **Both files updated:** Display + Backend charges match
✅ **Ready for Stripe:** Once you add API keys

**Smart move starting with lower prices!** You can always increase them as demand grows. 🚀

---

## Questions?

**Change prices:** Ask me or see `HOW_TO_CHANGE_PRICES.md`
**Setup Stripe:** See `STRIPE_SETUP_COMPLETE.md`
**Understand pricing:** See `PRICING_GUIDE.md`
