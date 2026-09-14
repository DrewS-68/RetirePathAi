# How to Change Membership Pricing

## Quick Answer

**File to Edit:** `/components/auth/MembershipPlans.tsx`

**What to Change:** Lines 39 and 61 (the `price` fields)

## Step-by-Step Instructions

### 1. Open the File
Navigate to: `/components/auth/MembershipPlans.tsx`

### 2. Find the Plans Array
Look for the `plans` array around line 15. You'll see three plan objects:

```tsx
const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',           // ← Free tier price
    period: 'forever',
    // ... more settings
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$29',          // ← CHANGE THIS for Premium
    period: 'per month',   // ← And optionally this
    // ... more settings
  },
  {
    id: 'family',
    name: 'Family',
    price: '$49',          // ← CHANGE THIS for Family
    period: 'per month',   // ← And optionally this
    // ... more settings
  },
];
```

### 3. Change the Prices

Simply update the numbers in the `price` field:

**Examples:**
```tsx
// Make Premium $39/month
price: '$39',

// Make Family $59/month
price: '$59',

// Make Premium annual pricing
price: '$299',
period: 'per year',

// Make a one-time payment
price: '$499',
period: 'one-time',

// Different currency
price: '€29',
period: 'per month',
```

### 4. Save the File

That's it! The changes will appear immediately on the pricing page.

## What Else Can You Customize?

### Change Plan Names
```tsx
name: 'Premium Plus',  // Instead of 'Premium'
name: 'Enterprise',    // Instead of 'Family'
```

### Change Descriptions
```tsx
description: 'Perfect for power users',
```

### Change Button Text
```tsx
buttonText: 'Try Premium Now',
buttonText: 'Contact Sales',
```

### Change the "Most Popular" Badge
```tsx
popular: true,  // Shows badge
popular: false, // Hides badge
```

Move it to a different tier by changing which plan has `popular: true`.

### Add/Remove Features
```tsx
features: [
  'Everything in Free',
  'AI Contract Review',
  'NEW FEATURE HERE',  // Add this line
],
```

### Change Trial Period Text
Scroll to the bottom of the file (around line 186):
```tsx
<p>
  All plans include a 14-day free trial. No credit card required.
</p>
```

Change "14-day" to whatever you want.

## Advanced: Different Pricing Models

### Annual Discount Option
You can add annual billing by duplicating plans:

```tsx
{
  id: 'premium-annual',
  name: 'Premium',
  price: '$249',
  period: 'per year',
  description: 'Save $99 with annual billing',
  // ... same features
},
```

### Tiered Pricing Based on Users
```tsx
{
  id: 'enterprise',
  name: 'Enterprise',
  price: 'Custom',
  period: 'contact us',
  buttonText: 'Contact Sales',
  // ... enterprise features
},
```

### Free Trial Period Display
```tsx
price: '$29',
period: 'per month (first 14 days free)',
```

## Important Notes

### ⚠️ If Using Stripe (Real Payments)

When you integrate Stripe, you'll also need to update the prices in the backend:

**File:** `/supabase/functions/server/index.tsx`

Look for the Stripe checkout session creation and update:
```tsx
const prices = {
  premium: 2900,  // $29.00 in cents ← Change this
  family: 4900,   // $49.00 in cents ← Change this
};
```

**IMPORTANT:** Stripe uses cents, not dollars!
- $29 = 2900 cents
- $49 = 4900 cents
- $39 = 3900 cents

### Currency Considerations

If changing currency from USD:
1. Update the `price` display: `'€29'` or `'£29'`
2. Update Stripe currency in backend: `currency: 'eur'` or `currency: 'gbp'`

## Testing Your Changes

After changing prices:
1. Refresh your browser
2. Click "View Plans"
3. Verify the new prices display correctly
4. Test the signup flow
5. Check that everything looks good

## Examples of Common Pricing Strategies

### Budget-Friendly
```tsx
price: '$19',  // Premium
price: '$39',  // Family
```

### Premium Positioning
```tsx
price: '$49',  // Premium
price: '$99',  // Family
```

### Annual Only
```tsx
price: '$290',     // Premium
period: 'per year',
```

### Freemium (Keep Free Forever)
```tsx
// Free tier stays at $0
// Make money on Premium/Family tiers
```

### Launch Special
```tsx
description: 'Launch special: 50% off first 3 months',
price: '$14.50',  // Half of $29
```

## Quick Price Change Checklist

- [ ] Update `price` in MembershipPlans.tsx
- [ ] Update `period` if changing billing cycle
- [ ] If using Stripe, update backend prices (in cents)
- [ ] Update any marketing materials
- [ ] Test the signup flow
- [ ] Update pricing documentation/FAQ

## Need Help?

Common issues:
- **Price not updating**: Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
- **Stripe prices don't match**: Remember to convert to cents and update backend
- **Currency symbol wrong**: Make sure it's in quotes: `'$29'` not `$29`

---

**Pro Tip:** Keep your prices simple and easy to understand. Avoid too many decimal places or complex billing cycles that confuse users.
