# 🧪 Security Testing Guide for RetirePath

Use these tests to verify all security features are working correctly before going live.

---

## 🎯 Test Suite Overview

| Test | What it checks | Expected Result |
|------|---------------|-----------------|
| 1. Weak Password | Password strength validation | ❌ Rejected |
| 2. Rate Limiting | Prevents spam/abuse | ✅ Blocked after limit |
| 3. XSS Protection | Sanitizes malicious input | ✅ Scripts removed |
| 4. Input Validation | Validates all inputs | ❌ Invalid data rejected |
| 5. Admin Access | RBAC enforcement | ❌ Non-admins blocked |
| 6. CORS | Cross-origin restrictions | ✅ Only your domain |
| 7. Duplicate Reviews | Prevents spam reviews | ❌ Duplicate rejected |

---

## TEST 1: Weak Password Rejection ✅

**What:** Ensures weak passwords are rejected

**Test:**
```bash
curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/make-server-3bba8be8/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR-ANON-KEY" \
  -d '{
    "email": "test@example.com",
    "password": "weak",
    "name": "Test User"
  }'
```

**Expected Response:**
```json
{
  "error": "Password does not meet security requirements",
  "details": [
    "Password must be at least 8 characters long",
    "Password must contain at least one uppercase letter",
    "Password must contain at least one number"
  ]
}
```

**Status Code:** 400 Bad Request

**✅ PASS if:** Password rejected with specific errors
**❌ FAIL if:** User created with weak password

---

## TEST 2: Strong Password Acceptance ✅

**What:** Ensures strong passwords are accepted

**Test:**
```bash
curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/make-server-3bba8be8/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR-ANON-KEY" \
  -d '{
    "email": "testuser@example.com",
    "password": "StrongPass123!",
    "name": "Test User"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "testuser@example.com",
    "name": "Test User",
    "membershipTier": "free"
  }
}
```

**Status Code:** 200 OK

**✅ PASS if:** User created successfully
**❌ FAIL if:** Strong password rejected

---

## TEST 3: Rate Limiting - Auth Endpoints ✅

**What:** Ensures rate limiting blocks spam

**Test:** Run this script to make 10 rapid signup attempts
```bash
for i in {1..10}; do
  curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/make-server-3bba8be8/signup \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR-ANON-KEY" \
    -d "{\"email\":\"test$i@example.com\",\"password\":\"StrongPass123\",\"name\":\"Test\"}" &
done
wait
```

**Expected Result:**
- First 5 requests: Should succeed or fail gracefully
- Requests 6-10: Should return 429 error

**Expected Response (after limit):**
```json
{
  "error": "Rate limit exceeded. Please try again later.",
  "retryAfter": 900
}
```

**Status Code:** 429 Too Many Requests

**Headers to check:**
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: <timestamp>
Retry-After: 900
```

**✅ PASS if:** Gets rate limited after 5 attempts
**❌ FAIL if:** All 10 requests go through

---

## TEST 4: XSS Protection - Review Submission ✅

**What:** Ensures malicious scripts are sanitized

**Prerequisites:** You need a valid access token from a logged-in user

**Test:**
```bash
curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/make-server-3bba8be8/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR-ACCESS-TOKEN" \
  -d '{
    "village_id": "VALID-VILLAGE-ID",
    "rating": 5,
    "title": "<script>alert(\"XSS Attack\")</script>Malicious Title",
    "comment": "This is a test with <img src=x onerror=alert(1)> and <iframe src=evil.com></iframe> embedded code"
  }'
```

**Expected Behavior:**
- Review is created
- **BUT** the malicious scripts are removed
- Only plain text remains

**Check the review in database:**
```sql
SELECT title, comment FROM village_reviews_3bba8be8 WHERE id = '...';
```

**Expected Data:**
```
title: "Malicious Title"  (scripts removed)
comment: "This is a test with  and  embedded code"  (tags removed)
```

**✅ PASS if:** Scripts are removed, plain text saved
**❌ FAIL if:** Scripts are stored in database

---

## TEST 5: Input Validation - Invalid Rating ✅

**What:** Ensures invalid inputs are rejected

**Test:**
```bash
curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/make-server-3bba8be8/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR-ACCESS-TOKEN" \
  -d '{
    "village_id": "VALID-VILLAGE-ID",
    "rating": 10,
    "title": "Test Title",
    "comment": "This comment should fail because rating is invalid"
  }'
```

**Expected Response:**
```json
{
  "error": "Invalid input",
  "details": [
    {
      "field": "rating",
      "message": "Rating must be at most 5"
    }
  ]
}
```

**Status Code:** 400 Bad Request

**✅ PASS if:** Request rejected with validation error
**❌ FAIL if:** Invalid rating accepted

---

## TEST 6: Input Validation - Short Comment ✅

**What:** Ensures minimum length requirements

**Test:**
```bash
curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/make-server-3bba8be8/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR-ACCESS-TOKEN" \
  -d '{
    "village_id": "VALID-VILLAGE-ID",
    "rating": 5,
    "title": "Short Title",
    "comment": "Too short"
  }'
```

**Expected Response:**
```json
{
  "error": "Invalid input",
  "details": [
    {
      "field": "comment",
      "message": "Comment must be at least 20 characters"
    }
  ]
}
```

**Status Code:** 400 Bad Request

**✅ PASS if:** Request rejected
**❌ FAIL if:** Short comment accepted

---

## TEST 7: Admin Access Control ✅

**What:** Ensures non-admins can't access admin endpoints

**Test 1:** Without admin role
```bash
curl -X GET https://YOUR-PROJECT.supabase.co/functions/v1/make-server-3bba8be8/reviews/admin/all \
  -H "Authorization: Bearer NON-ADMIN-ACCESS-TOKEN"
```

**Expected Response:**
```json
{
  "error": "Forbidden - Admin access required",
  "message": "You do not have permission to access this resource"
}
```

**Status Code:** 403 Forbidden

**Test 2:** With admin role
```bash
curl -X GET https://YOUR-PROJECT.supabase.co/functions/v1/make-server-3bba8be8/reviews/admin/all \
  -H "Authorization: Bearer ADMIN-ACCESS-TOKEN"
```

**Expected Response:**
```json
{
  "reviews": [ ... ]
}
```

**Status Code:** 200 OK

**✅ PASS if:** Non-admin blocked (403), admin allowed (200)
**❌ FAIL if:** Non-admin can access admin endpoints

---

## TEST 8: Duplicate Review Prevention ✅

**What:** Ensures users can't review same village twice

**Test 1:** Submit first review
```bash
curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/make-server-3bba8be8/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR-ACCESS-TOKEN" \
  -d '{
    "village_id": "SAME-VILLAGE-ID",
    "rating": 5,
    "title": "First Review",
    "comment": "This is my first review of this village and it meets minimum length"
  }'
```

**Expected:** Success (201 Created)

**Test 2:** Submit duplicate review
```bash
curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/make-server-3bba8be8/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR-ACCESS-TOKEN" \
  -d '{
    "village_id": "SAME-VILLAGE-ID",
    "rating": 4,
    "title": "Second Review",
    "comment": "This is my second review of the same village which should be blocked"
  }'
```

**Expected Response:**
```json
{
  "error": "You have already reviewed this village"
}
```

**Status Code:** 400 Bad Request

**✅ PASS if:** Duplicate rejected
**❌ FAIL if:** Duplicate review created

---

## TEST 9: Invalid UUID Format ✅

**What:** Ensures UUID validation works

**Test:**
```bash
curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/make-server-3bba8be8/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR-ACCESS-TOKEN" \
  -d '{
    "village_id": "not-a-valid-uuid",
    "rating": 5,
    "title": "Test Review",
    "comment": "This should fail because village_id is not a valid UUID format"
  }'
```

**Expected Response:**
```json
{
  "error": "Invalid input",
  "details": [
    {
      "field": "village_id",
      "message": "Invalid village ID"
    }
  ]
}
```

**Status Code:** 400 Bad Request

**✅ PASS if:** Invalid UUID rejected
**❌ FAIL if:** Invalid UUID accepted

---

## TEST 10: CORS Check ✅

**What:** Ensures CORS is restricted (after you update it)

**Test from browser console** (different domain):
```javascript
fetch('https://YOUR-PROJECT.supabase.co/functions/v1/make-server-3bba8be8/health', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Before updating CORS (origin: "*"):**
- ✅ Should work from any domain

**After updating CORS (origin: "your-domain.com"):**
- ✅ Should work from your domain
- ❌ Should fail with CORS error from other domains

**✅ PASS if:** Blocked from unauthorized domains
**❌ FAIL if:** Works from all domains (after you restrict it)

---

## TEST 11: Payment Price Validation ✅

**What:** Ensures users can't manipulate prices

**Test:** Try to create checkout with wrong price
```bash
curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/make-server-3bba8be8/create-checkout-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR-ACCESS-TOKEN" \
  -d '{
    "membershipTier": "premium",
    "duration": 1,
    "amount": 1
  }'
```

**Expected Response:**
```json
{
  "error": "Invalid amount for selected tier and duration"
}
```

**Correct prices:**
- Premium 1 month: $19
- Premium 3 months: $51
- Premium 6 months: $95
- Family 1 month: $39
- Family 3 months: $105
- Family 6 months: $195

**✅ PASS if:** Wrong price rejected
**❌ FAIL if:** Wrong price accepted

---

## TEST 12: Security Event Logging ✅

**What:** Ensures security events are logged

**Test:** Trigger a security event (weak password)
```bash
curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/make-server-3bba8be8/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "log-test@example.com",
    "password": "weak",
    "name": "Test"
  }'
```

**Check logs:**
1. Go to Supabase Dashboard → Edge Functions → Logs
2. Look for: `🚨 SECURITY EVENT: invalid_input - /signup`

**Or check KV store:**
```typescript
const events = await kv.getByPrefix('security:log:');
console.log(events);
```

**✅ PASS if:** Event logged with details
**❌ FAIL if:** No log entry created

---

## 📊 Test Results Template

Use this to track your test results:

```
✅ TEST 1: Weak Password Rejection - PASS
✅ TEST 2: Strong Password Acceptance - PASS
✅ TEST 3: Rate Limiting - PASS
✅ TEST 4: XSS Protection - PASS
✅ TEST 5: Invalid Rating - PASS
✅ TEST 6: Short Comment - PASS
✅ TEST 7: Admin Access Control - PASS
✅ TEST 8: Duplicate Review Prevention - PASS
✅ TEST 9: Invalid UUID - PASS
⚠️ TEST 10: CORS - PENDING (update origin first)
✅ TEST 11: Payment Price Validation - PASS
✅ TEST 12: Security Event Logging - PASS

OVERALL: 11/12 PASS (1 pending CORS update)
```

---

## 🚀 Final Security Audit Checklist

Before going live:

- [ ] All 12 tests passing
- [ ] CORS updated to your domain
- [ ] First admin user created
- [ ] Admin setup endpoint deleted
- [ ] RLS policies enabled
- [ ] Reviewed security logs
- [ ] Tested from production environment
- [ ] Verified Stripe webhook signatures
- [ ] Privacy policy created
- [ ] Terms of service created

---

**Once all tests pass, you're ready to launch! 🎉**
