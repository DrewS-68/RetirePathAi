# Feature #4: Email Notifications System - Setup Guide

## ✅ What's Been Built

We've successfully integrated a comprehensive email notification system into RetirePath using **Resend** (free email API).

### Email Notifications Implemented:

1. **Agent Referral Leads** 📨
   - Triggered when: Someone submits the agent referral form
   - Sent to: Admin (smith68d@gmail.com)
   - Contains: Lead contact info, property details, timeline

2. **Village Operator Submissions** 📨
   - Triggered when: Operator submits a new village
   - Sent to: Admin (smith68d@gmail.com)
   - Contains: Village details, operator contact info

3. **Village Approval** 📨
   - Triggered when: Admin approves a village submission
   - Sent to: Village operator (contact_email)
   - Contains: Approval confirmation, next steps

4. **Village Rejection** 📨
   - Triggered when: Admin rejects a village submission
   - Sent to: Village operator (contact_email)
   - Contains: Rejection reason, instructions to resubmit

---

## 🔧 Setup Required (YOU MUST DO THIS)

### Step 1: Create Resend Account (FREE)

1. Go to **https://resend.com**
2. Sign up for a free account
   - Free tier includes: **100 emails/day** (plenty for testing)
3. Verify your email address

### Step 2: Get Your API Key

1. Log into Resend dashboard
2. Click **"API Keys"** in left sidebar
3. Click **"Create API Key"**
4. Give it a name: "RetirePath Production"
5. **Copy the API key** (starts with `re_`)
   - ⚠️ Save it somewhere safe! You won't be able to see it again

### Step 3: Add API Key to Supabase

1. Go to your **Supabase Dashboard**
2. Select your RetirePath project
3. Click **"Edge Functions"** in the left sidebar
4. Click the **"Manage secrets"** button (or "Environment Variables")
5. Add a new secret:
   - **Name:** `RESEND_API_KEY`
   - **Value:** Paste your Resend API key (the one starting with `re_`)
6. Click **"Save"** or **"Add Secret"**

### Step 4: Redeploy Edge Functions (Important!)

After adding the environment variable, you need to redeploy:

```bash
# In your terminal/command line:
supabase functions deploy make-server-3bba8be8
```

OR if you're using the Supabase dashboard:
1. Go to Edge Functions
2. Click on "make-server-3bba8be8"
3. Click "Deploy" or "Redeploy"

---

## 📧 Email Configuration Notes

### Current "From" Address:
- Emails are sent **FROM**: `RetirePath <noreply@retirepath.com.au>`
- ⚠️ **This won't work yet** because you don't own the domain

### For Testing (Use Resend Default):
Resend will use their default sending domain for testing until you:
1. Purchase your own domain (e.g., `retirepath.com.au`)
2. Verify it in Resend dashboard
3. Update the `from` address in `/supabase/functions/server/email.tsx`

### Current Admin Email:
- All admin notifications go to: **smith68d@gmail.com**
- You can change this anytime in `/supabase/functions/server/email.tsx` (line 3)

---

## 🧪 Testing the Email System

### Test 1: Agent Referral Email
1. Go to your app's **Home Valuation** page
2. Fill out a property valuation
3. Click **"Get Agent Referral"**
4. Fill out and submit the form
5. ✅ Check your email (smith68d@gmail.com) for the notification

### Test 2: Village Submission Email
1. Go to **Operator Dashboard** → **Submit Village**
2. Fill out and submit a village
3. ✅ Check your email for the new submission notification

### Test 3: Village Approval Email
1. Log into admin dashboard
2. Approve a pending village
3. ✅ The operator should receive an approval email

### Test 4: Village Rejection Email
1. Log into admin dashboard
2. Reject a pending village with a reason
3. ✅ The operator should receive a rejection email with the reason

---

## 🐛 Troubleshooting

### No Emails Arriving?

**Check 1: Is RESEND_API_KEY set?**
- Go to Supabase Dashboard → Edge Functions → Manage Secrets
- Verify `RESEND_API_KEY` exists

**Check 2: Check server logs**
- Go to Supabase Dashboard → Edge Functions → Logs
- Look for email-related errors
- Common error: "Email service not configured" means API key is missing

**Check 3: Check spam folder**
- Resend emails might go to spam initially
- Mark as "Not Spam" to train your email client

**Check 4: Verify Resend account**
- Log into Resend dashboard
- Go to "Logs" to see if emails were sent
- Check for any API errors

### Email Sending But Not Delivering?

- Check Resend dashboard → Logs for delivery status
- Verify the recipient email address is correct
- Make sure you're not exceeding the free tier limit (100/day)

---

## 💰 Resend Pricing (Future)

- **Free Tier**: 100 emails/day, 1 custom domain
- **Pro Plan**: $20/month for 50,000 emails/month
- You're currently on the free tier - upgrade when you need more

---

##  📝 Next Steps After Setup

Once you've completed the setup:

1. **Test all 4 email types** (see Testing section above)
2. **Purchase your domain** (retirepath.com.au or similar)
3. **Verify domain in Resend** (they'll give you DNS records to add)
4. **Update the "from" address** in `/supabase/functions/server/email.tsx`
5. Consider adding more email templates for featured listing purchases

---

## 📄 Files Modified

- ✅ `/supabase/functions/server/email.tsx` (NEW - email templates)
- ✅ `/supabase/functions/server/agent-leads.ts` (added email on submission)
- ✅ `/supabase/functions/server/villages.ts` (added emails for submit/approve/reject)

---

## ✅ Feature #4 Status

**Email System**: ✅ Code Complete
**Resend Setup**: ⏳ Waiting for you to add API key
**Testing**: ⏳ Ready to test after setup

Once you complete the setup steps above, Feature #4 will be FULLY FUNCTIONAL! 🎉
