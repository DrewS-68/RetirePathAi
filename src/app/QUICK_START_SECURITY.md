# ⚡ RetirePath Security - 5 Minute Quick Start

## 🎯 Everything is DONE! Just 3 Quick Steps Before Launch

---

## ✅ STEP 1: Update CORS (2 minutes)

**Open:** `/supabase/functions/server/index.tsx`

**Find line 29** and change:
```typescript
origin: "*",  // ← DELETE THIS
```

**To:**
```typescript
origin: "https://your-actual-domain.com",  // ← YOUR DOMAIN
```

**Where to get your domain:**
- Figma Make deployment URL
- Or your custom domain if you've set one up

**Save the file.** ✅

---

## ✅ STEP 2: Make Yourself Admin (3 minutes)

### **Option A: Simple Way (Recommended)**

1. **Go to Supabase Dashboard:**
   - Your Project → Settings → Edge Functions
   - Click "+ New Secret"
   - Name: `ADMIN_SETUP_SECRET`
   - Value: `make-me-admin-abc123` (use your own random string)
   - Click "Add Secret"

2. **Sign up in your app:**
   - Use your real email
   - Choose a strong password
   - Copy the User ID from the response (or check Supabase → Authentication → Users)

3. **Run this command** (replace placeholders):
   ```bash
   curl -X POST https://YOUR-PROJECT-ID.supabase.co/functions/v1/make-server-3bba8be8/make-admin \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR-SUPABASE-ANON-KEY" \
     -d '{
       "userId": "YOUR-USER-ID-FROM-SIGNUP",
       "secretKey": "make-me-admin-abc123"
     }'
   ```

   **Get these values from:**
   - `YOUR-PROJECT-ID`: Supabase Dashboard → Project URL
   - `YOUR-SUPABASE-ANON-KEY`: Supabase Dashboard → Settings → API → `anon` `public` key
   - `YOUR-USER-ID-FROM-SIGNUP`: Signup response or Supabase → Authentication → Users

4. **Response should be:**
   ```json
   {
     "success": true,
     "message": "User promoted to admin successfully",
     "warning": "DELETE THIS ENDPOINT NOW!"
   }
   ```

5. **IMMEDIATELY delete** `/supabase/functions/server/admin-setup.ts`

**You're now an admin!** ✅

---

### **Option B: Manual Way (If curl doesn't work)**

1. **Open** `/supabase/functions/server/index.tsx`

2. **Add this temporary code** right before the last line (`Deno.serve(...)`):
   ```typescript
   // TEMPORARY - DELETE AFTER USE
   import * as kv from './kv_store.tsx';
   await kv.set('user:YOUR-USER-ID-HERE:role', 'admin');
   console.log('Admin user set!');
   ```

3. **Replace** `YOUR-USER-ID-HERE` with your actual user ID

4. **Deploy** the edge function (it will run once)

5. **Check logs** to see "Admin user set!"

6. **DELETE** that code immediately

**You're now an admin!** ✅

---

## ✅ STEP 3: Enable RLS (Optional but Recommended)

**Go to:** Supabase Dashboard → Database → SQL Editor

**Paste and run:**
```sql
ALTER TABLE kv_store_3bba8be8 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
ON kv_store_3bba8be8 FOR SELECT
USING (
  key LIKE 'user:' || auth.uid()::text || '%'
  OR key LIKE 'village:%'
  OR key LIKE 'review:%'
  OR key LIKE 'analytics:%'
);

CREATE POLICY "Service role full access"
ON kv_store_3bba8be8 FOR ALL
TO service_role
USING (true);
```

**Click "Run"**

**Done!** ✅

---

## 🎉 YOU'RE SECURE!

Your RetirePath platform now has:

✅ **Input Validation** - All inputs are validated
✅ **Rate Limiting** - Prevents abuse
✅ **XSS Protection** - User content is sanitized
✅ **Admin Access Control** - You're the admin
✅ **Security Logging** - All events tracked
✅ **Password Strength** - Strong passwords enforced
✅ **Stripe Security** - Payments are secure
✅ **CORS Protection** - Only your domain allowed (after Step 1)
✅ **Row Level Security** - Users can't access other's data (after Step 3)

---

## 🧪 Quick Test

### **Test your admin access:**

```bash
curl -X GET https://YOUR-PROJECT.supabase.co/functions/v1/make-server-3bba8be8/reviews/admin/all \
  -H "Authorization: Bearer YOUR-ACCESS-TOKEN"
```

**Should return:** List of all reviews (as admin)

Without admin role: Would return `403 Forbidden`

---

## 📚 More Details?

- **Full Guide:** See `/SECURITY_SETUP.md`
- **Summary:** See `/SECURITY_SUMMARY.md`
- **Security Code:** See `/supabase/functions/server/security.ts`

---

## 🚀 Launch Checklist

- [ ] Updated CORS to your domain
- [ ] Made yourself admin
- [ ] Tested admin access
- [ ] (Optional) Enabled RLS
- [ ] Deleted admin-setup.ts file
- [ ] Tested signup with weak password (should fail)
- [ ] Tested rate limiting (try 10 signups fast)
- [ ] Reviewed security logs

---

**That's it! Your platform is production-ready! 🎊**

Any issues? Check the detailed guides in:
- `/SECURITY_SETUP.md` (complete documentation)
- `/SECURITY_SUMMARY.md` (feature overview)
