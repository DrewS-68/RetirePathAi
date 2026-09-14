# Quick Start: Rejection Testing Guide

## 🎯 Goal
Test the complete rejection workflow from Admin → Backend → Operator visibility

---

## 🚀 Quick Test (5 minutes)

### Step 1: Create Test Submission
1. Go to **Operator Dashboard**
2. Click **"List New Village"**
3. Fill in minimal required fields:
   - Village Name: "Test Rejection Village 001"
   - Suburb: "Melbourne"
   - Postcode: "3000"
   - State: "VIC"
   - Contact Email: "test@example.com"
4. Click **Submit for Review**
5. ✅ Confirm: Shows "Pending" status in Operator Dashboard

---

### Step 2: Reject the Submission (Admin)
1. Switch to **Admin Dashboard** tab
2. Go to **"Pending"** tab
3. Find "Test Rejection Village 001"
4. Click **"View"** button
5. In the modal, click **"Reject"** button
6. Enter rejection reason:
   ```
   Incomplete information: Missing pricing details and village type. 
   Please provide entry costs and monthly fees before resubmitting.
   ```
7. Click **"Reject Submission"**
8. ✅ Confirm: Modal closes
9. ✅ Confirm: Village disappears from Pending tab
10. Go to **"Rejected"** tab
11. ✅ Confirm: Village appears with red "Rejected" badge

---

### Step 3: Verify Operator Sees Rejection
1. Switch back to **Operator Dashboard** tab
2. Click **"Refresh"** or reload page
3. Find "Test Rejection Village 001"
4. ✅ Confirm: Status shows "Rejected" badge (red)
5. Click **"View"** on the rejected village
6. ✅ Confirm: Red alert box appears at top showing:
   - **"Submission rejected"**
   - The rejection reason you entered
   - Message: "You can edit and resubmit this village"

---

### Step 4: Test Edit & Resubmit (Optional)
1. In Operator Dashboard, with rejected village detail modal open
2. Click **"Edit"** button
3. Make changes (e.g., add pricing)
4. Click **"Update Village"**
5. ✅ Confirm: Status changes from "Rejected" → "Pending"
6. ✅ Confirm: Rejection reason alert disappears
7. Switch to Admin Dashboard
8. ✅ Confirm: Village is back in "Pending" tab

---

## 🐛 Common Issues to Watch For

### Issue 1: Rejection Reason Not Saving
**Symptoms:** Rejection works but reason doesn't appear
**Check:** 
- Browser console for errors
- Network tab: Response should include `rejection_reason` field
- Database: Query rejected villages to verify reason is stored

### Issue 2: Village Doesn't Move to Rejected Tab
**Symptoms:** Village stays in Pending after rejection
**Check:**
- Network response (should be 200 OK)
- Refresh the page
- Check if `status` was actually updated in database

### Issue 3: Operator Can't See Rejection Reason
**Symptoms:** Operator sees "Rejected" but no reason
**Check:**
- Operator Dashboard is fetching full village object (including `rejection_reason`)
- API endpoint `/villages/my-villages` returns `rejection_reason` field
- Alert component conditional is working: `selectedVillage.rejection_reason && ...`

---

## 📊 What to Test

| ✅ | Test Item | How to Verify |
|----|-----------|---------------|
| ⬜ | Basic rejection flow | Village moves from Pending → Rejected |
| ⬜ | Reason saves properly | View rejected village in admin, see reason |
| ⬜ | Operator sees reason | Operator dashboard shows red alert with reason |
| ⬜ | Timestamps recorded | `rejected_at` has valid date/time |
| ⬜ | Admin ID recorded | `rejected_by` has admin user UUID |
| ⬜ | Reject empty reason | Can submit without reason (currently allowed) |
| ⬜ | Reject long reason (500+ chars) | Long text saves and displays properly |
| ⬜ | Multiple rejections | All rejected villages appear in Rejected tab |
| ⬜ | Edit → Resubmit clears reason | Reason disappears when resubmitted |
| ⬜ | Delete rejected village | Can delete from Rejected tab |

---

## 🔍 Database Verification (Optional)

After rejecting a test village, run this in Supabase SQL editor:

```sql
SELECT 
  id,
  name,
  status,
  rejection_reason,
  rejected_at,
  rejected_by,
  submitted_at
FROM retirement_villages
WHERE name LIKE '%Test Rejection%'
ORDER BY rejected_at DESC;
```

**Expected fields:**
- `status`: 'rejected'
- `rejection_reason`: Your entered text
- `rejected_at`: Recent timestamp (e.g., "2024-12-03T14:32:00Z")
- `rejected_by`: UUID of admin user
- `submitted_at`: Original submission time

---

## 📋 Edge Cases to Test

### 1. Reject without reason
- Leave reason field empty
- Submit
- Check if it saves as `null` or empty string

### 2. Special characters in reason
- Use: `"quotes", 'apostrophes', & symbols, <tags>`
- Verify no XSS or encoding issues

### 3. Very long reason
- Paste 1000+ character text
- Verify it saves and displays without breaking layout

### 4. Cancel rejection
- Open reject modal
- Click outside or press ESC
- Verify village stays in Pending

### 5. Network failure
- Open DevTools → Network → Set to "Offline"
- Try to reject
- Verify error message appears
- Verify village stays in Pending

---

## ✅ Success Criteria

**Test passes if:**
1. ✅ Admin can reject submissions with reason
2. ✅ Village moves to Rejected tab immediately
3. ✅ Operator sees rejection reason in their dashboard
4. ✅ Rejection reason, timestamp, and admin ID are saved
5. ✅ Edit & resubmit clears rejection and moves back to Pending
6. ✅ No console errors during rejection flow
7. ✅ No data corruption or partial updates

---

## 🎉 Next Steps After Testing

Once rejection testing is complete:

1. **Document any bugs** → Create bug report
2. **Note improvements** → Add to feature backlog
3. **Implement email notifications** → Notify operators of rejection
4. **Move to Feature #3** → What's next on the roadmap?

---

**Quick reference:**
- Full testing checklist: `/REJECTION_TESTING_CHECKLIST.md`
- Admin Dashboard: Tab in main app
- Operator Dashboard: Tab in main app
- Backend code: `/supabase/functions/server/villages.ts` (line 384)
- Frontend code: `/components/AdminDashboard.tsx` (line 225)
