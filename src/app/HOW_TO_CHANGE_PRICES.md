# 🎯 How to Change Membership Prices (Simple Version)

## The 30-Second Answer

1. **Open file:** `/components/auth/MembershipPlans.tsx`
2. **Find line 43:** Change `price: '$19'` to your Premium price
3. **Find line 65:** Change `price: '$39'` to your Family price
4. **Save** - Done! ✅

## Visual Guide

```
/components/auth/MembershipPlans.tsx
│
├─ Line 22: price: '$0',    ← Free tier (usually leave this)
├─ Line 43: price: '$19',   ← PREMIUM PRICE (currently $19)
└─ Line 65: price: '$39',   ← FAMILY PRICE (currently $39)
```

## Current Pricing (Introductory Rate)

**Premium:** $19/month (introductory pricing)
**Family:** $39/month (introductory pricing)

These are lower starter prices to attract early customers!

## Examples

### Want to charge $29 for Premium?
```tsx
price: '$29',  // Line 43
```

### Want to charge $49 for Family?
```tsx
price: '$49',  // Line 65
```

## That's It!

No other files need to be changed (unless you're using Stripe payments).

The prices will update immediately when you save the file.

## Other Things You Can Change (Optional)

In the same file, you can also change:

- **Plan names** (line 41, 63): `name: 'Premium'`
- **Descriptions** (line 45, 67): `description: 'Full access...'`
- **Button text** (line 59, 78): `buttonText: 'Start Premium'`
- **Features list** (line 47-56, 69-76): Add/remove features

## Questions?

See `PRICING_GUIDE.md` for the complete detailed guide.

---

**Remember:** Keep it simple. Most successful apps use round numbers like $19, $29, $49, or $99.