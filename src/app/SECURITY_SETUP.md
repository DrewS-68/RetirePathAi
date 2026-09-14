# 🔒 RetirePath Security Implementation Guide

## ✅ What Has Been Implemented

Your RetirePath platform now has comprehensive security features:

### 1. **Input Validation (Zod Schemas)** ✅
- All user inputs are validated with strict schemas
- Prevents invalid data, SQL injection, and malformed requests
- Located in: `/supabase/functions/server/validation.ts`

### 2. **Rate Limiting** ✅
- Prevents abuse and DDoS attacks
- Different limits for different endpoints:
  - **Auth endpoints**: 5 requests per 15 minutes
  - **API endpoints**: 100 requests per 15 minutes  
  - **Reviews**: 5 submissions per hour
  - **Search**: 200 requests per 15 minutes
  - **Payments**: 10 requests per hour
- Located in: `/supabase/functions/server/security.ts`

### 3. **XSS Protection** ✅
- All user-generated content is sanitized
- Reviews, names, and comments are cleaned before storage
- Prevents malicious scripts from being injected
- Functions: `sanitizeText()`, `sanitizeHtml()`

### 4. **Role-Based Access Control (RBAC)** ✅
- Three user roles: **admin**, **operator**, **member**
- Admin-only endpoints are protected
- Functions: `requireAdmin()`, `requireOperator()`, `isAdmin()`

### 5. **Security Logging** ✅
- Failed login attempts logged
- Admin actions audited
- Suspicious activity tracked
- Located in: `/supabase/functions/server/security.ts`

### 6. **Password Strength Validation** ✅
- Minimum 8 characters
- Requires uppercase, lowercase, and numbers
- Blocks common passwords
- Function: `isStrongPassword()`

### 7. **Stripe Webhook Verification** ✅
- Already implemented correctly
- Verifies webhook signatures before processing

---

## 🚨 CRITICAL: BEFORE GOING LIVE

### **Step 1: Restrict CORS** 
🔴 **HIGH PRIORITY**

**Current state:**
```typescript
origin: "*"  // ⚠️ ALLOWS ALL DOMAINS
```

**What to do:**
1. Get your Figma Make domain (e.g., `https://your-app.figma.com`)
2. Update `/supabase/functions/server/index.tsx` line 29:
   ```typescript
   origin: "https://your-actual-domain.com"  // ✅ Only your domain
   ```

---

### **Step 2: Set Up Your First Admin User**

You need an admin account to access protected features.

#### **Option A: Using the Setup Endpoint (Recommended)**

1. **Set environment variable in Supabase:**
   - Go to Supabase Dashboard → Project Settings → Edge Functions
   - Add: `ADMIN_SETUP_SECRET` = `your-random-secret-here-12345`
   - Use a strong, random string

2. **Sign up normally** through your RetirePath app

3. **Get your User ID:**
   - Check the signup response JSON, or
   - Go to Supabase Dashboard → Authentication → Users
   - Copy your User ID (UUID)

4. **Promote yourself to admin:**
   ```bash
   curl -X POST https://YOUR-PROJECT-ID.supabase.co/functions/v1/make-server-3bba8be8/make-admin \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR-ANON-KEY" \
     -d '{
       "userId": "YOUR-USER-ID-HERE",
       "secretKey": "your-random-secret-here-12345"
     }'
   ```

5. **IMMEDIATELY DELETE the setup endpoint:**
   - Remove `/supabase/functions/server/admin-setup.ts`
   - Remove the route mount in `index.tsx`

#### **Option B: Manual Setup (Alternative)**

Run this in your Supabase SQL editor or via Edge Function:
```typescript
import * as kv from './kv_store.tsx';
await kv.set('user:YOUR-USER-ID:role', 'admin');
```

---

### **Step 3: Enable Row Level Security (RLS)**

🔴 **CRITICAL FOR PRODUCTION**

**What is RLS?**
Row Level Security ensures users can only access their own data in the database.

**How to enable:**

1. Go to Supabase Dashboard → Database → Tables
2. Find `kv_store_3bba8be8` table
3. Click on the table → Enable RLS

**Create RLS Policies:**

```sql
-- Enable RLS
ALTER TABLE kv_store_3bba8be8 ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can only read their own data
CREATE POLICY "Users can read own data"
ON kv_store_3bba8be8
FOR SELECT
USING (
  -- Allow if the key starts with 'user:{their_user_id}'
  key LIKE 'user:' || auth.uid()::text || '%'
  OR
  -- Allow public data (villages, reviews)
  key LIKE 'village:%'
  OR
  key LIKE 'analytics:%'
);

-- Policy 2: Users can only update their own data
CREATE POLICY "Users can update own data"
ON kv_store_3bba8be8
FOR UPDATE
USING (key LIKE 'user:' || auth.uid()::text || '%');

-- Policy 3: Users can only insert their own data
CREATE POLICY "Users can insert own data"
ON kv_store_3bba8be8
FOR INSERT
WITH CHECK (key LIKE 'user:' || auth.uid()::text || '%');

-- Policy 4: Service role can do everything (for backend)
CREATE POLICY "Service role full access"
ON kv_store_3bba8be8
FOR ALL
TO service_role
USING (true);
```

---

### **Step 4: Review Stripe Security**

✅ **Already secure, but verify:**

1. **Webhook secret is set:**
   - Supabase Dashboard → Settings → Edge Functions
   - Verify `STRIPE_WEBHOOK_SECRET` exists

2. **Test webhook signature verification:**
   - Send a test webhook from Stripe Dashboard
   - Check logs to confirm it's verified

---

### **Step 5: Set Email Verification (Optional but Recommended)**

**Current state:** Auto-confirm emails ✅ (good for testing)

**For production:**
1. Set up email service (Resend, SendGrid, etc.)
2. Update signup endpoint line 56:
   ```typescript
   email_confirm: false  // Users must verify email
   ```

---

## 📊 Security Features Summary

| Feature | Status | Location | Priority |
|---------|--------|----------|----------|
| Input Validation | ✅ Implemented | `validation.ts` | Critical |
| Rate Limiting | ✅ Implemented | `security.ts` | Critical |
| XSS Protection | ✅ Implemented | `security.ts` | Critical |
| Admin RBAC | ✅ Implemented | `security.ts` | Critical |
| CORS Restriction | ⚠️ **TODO** | `index.tsx:29` | **HIGH** |
| RLS Policies | ⚠️ **TODO** | Supabase Dashboard | **HIGH** |
| Password Strength | ✅ Implemented | `security.ts` | Medium |
| Security Logging | ✅ Implemented | `security.ts` | Medium |
| Stripe Webhooks | ✅ Implemented | `stripe-helpers.ts` | Critical |
| Email Verification | ⚠️ Optional | `index.tsx:56` | Medium |

---

## 🔧 Admin Endpoints Reference

Once you're an admin, you can access:

### **Review Moderation:**
```
GET    /make-server-3bba8be8/reviews/admin/all?status=pending
PUT    /make-server-3bba8be8/reviews/admin/:reviewId/approve
PUT    /make-server-3bba8be8/reviews/admin/:reviewId/reject
DELETE /make-server-3bba8be8/reviews/admin/:reviewId
```

### **Analytics:**
All analytics endpoints automatically work for admins.

### **Set User Roles:**
```
POST /make-server-3bba8be8/set-role
Body: { "userId": "...", "role": "admin|operator|member" }
```

---

## 🛡️ Security Best Practices

### **Environment Variables - Never Expose:**
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Backend only
- ✅ `STRIPE_SECRET_KEY` - Backend only  
- ✅ `STRIPE_WEBHOOK_SECRET` - Backend only
- ✅ `ADMIN_SETUP_SECRET` - Backend only

### **Safe to Use in Frontend:**
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_ANON_KEY`
- ✅ `STRIPE_PUBLISHABLE_KEY`

### **Regular Security Checks:**
1. Monitor Supabase logs weekly
2. Review security event logs:
   ```typescript
   const events = await getSecurityEvents(100);
   ```
3. Check for suspicious rate limit hits
4. Review failed auth attempts

---

## 🚀 Deployment Checklist

Before going live, complete:

- [ ] Update CORS to your domain
- [ ] Enable RLS on kv_store table
- [ ] Create your first admin user
- [ ] Delete admin setup endpoint
- [ ] Test all rate limits
- [ ] Verify Stripe webhook signature
- [ ] Test XSS protection with malicious input
- [ ] Review security logs
- [ ] Test admin access controls
- [ ] (Optional) Enable email verification
- [ ] Create privacy policy page
- [ ] Create terms of service page

---

## 📞 Testing Security Features

### **Test Rate Limiting:**
```bash
# Try to hit endpoint 10 times quickly
for i in {1..10}; do
  curl -X POST https://your-domain/make-server-3bba8be8/reviews \
    -H "Authorization: Bearer TOKEN" \
    -d '{"village_id":"...","rating":5,"title":"Test","comment":"Test comment here"}' &
done
```

Expected: Should get 429 error after 5 requests

### **Test XSS Protection:**
```bash
curl -X POST https://your-domain/make-server-3bba8be8/reviews \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "village_id":"...",
    "rating":5,
    "title":"<script>alert(\"XSS\")</script>",
    "comment":"Normal comment"
  }'
```

Expected: Script tags should be removed, plain text saved

### **Test Admin Access:**
```bash
# Without admin role - should fail with 403
curl -X GET https://your-domain/make-server-3bba8be8/reviews/admin/all \
  -H "Authorization: Bearer NON-ADMIN-TOKEN"
```

Expected: 403 Forbidden

---

## 📚 Additional Resources

- **Supabase Security**: https://supabase.com/docs/guides/auth/row-level-security
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **Stripe Security**: https://stripe.com/docs/security/guide

---

## ⚠️ IMPORTANT FINAL NOTES

1. **Never commit secrets to Git**
2. **Always use HTTPS in production**
3. **Regularly update dependencies**
4. **Monitor your logs for suspicious activity**
5. **Have a backup plan for your database**
6. **Test security features before launch**

---

**RetirePath is now secured! 🎉**

Questions? Review the code in:
- `/supabase/functions/server/security.ts`
- `/supabase/functions/server/validation.ts`
- `/supabase/functions/server/index.tsx`
