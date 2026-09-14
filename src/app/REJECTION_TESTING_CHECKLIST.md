# Feature #2: Village Submission Rejection Testing Checklist

## Overview
This document outlines comprehensive testing procedures for the village submission rejection functionality in the RetirePath admin dashboard.

---

## Test Environment Setup

### Prerequisites
1. ✅ Admin account with access to Admin Dashboard
2. ✅ At least 3-5 test village submissions in "pending" status
3. ✅ Access to browser developer console for error checking
4. ✅ Network tab open to monitor API calls

---

## Test Scenarios

### 1. **Basic Rejection Flow (Happy Path)**

#### Test Steps:
1. Navigate to Admin Dashboard
2. Go to "Pending" tab
3. Click "View" on any pending submission
4. In the modal, click "Reject" button
5. Enter a rejection reason: "Incomplete contact information"
6. Click "Reject Submission"

#### Expected Results:
- ✅ Rejection modal appears with textarea for reason
- ✅ Submit button is disabled if reason is empty
- ✅ Success: Village moves from "Pending" to "Rejected" tab
- ✅ Village detail modal closes
- ✅ Rejected tab shows the village with rejection badge
- ✅ No error messages appear

#### API Verification:
- Check Network tab for: `PUT /villages/admin/{id}/reject`
- Status: `200 OK`
- Response includes: `{ success: true, village: {...} }`

---

### 2. **Rejection Reason Validation**

#### Test 2.1: Empty Rejection Reason
1. Open rejection modal
2. Leave reason field empty
3. Try to submit

**Expected:** 
- ✅ Should allow submission (reason is optional in current implementation)
- OR ✅ Should show validation error if we want to make it required

#### Test 2.2: Long Rejection Reason
1. Open rejection modal
2. Enter 500+ character reason
3. Submit

**Expected:**
- ✅ Should accept and save long reason
- ✅ Reason should be stored in database
- ✅ Should display properly when viewing rejected submission

#### Test 2.3: Special Characters in Reason
1. Enter reason with special chars: `Invalid: can't verify "contact details" & missing info`
2. Submit

**Expected:**
- ✅ Should handle special characters correctly
- ✅ No encoding issues in database or display

---

### 3. **Rejection Data Persistence**

#### Test Steps:
1. Reject a village with reason: "Test rejection - duplicate entry"
2. Navigate away from Admin Dashboard
3. Return to Admin Dashboard
4. Check "Rejected" tab
5. View the rejected village details

#### Expected Results:
- ✅ Village remains in "Rejected" status
- ✅ Rejection reason is displayed
- ✅ `rejected_at` timestamp is present
- ✅ `rejected_by` (admin user ID) is recorded
- ✅ Status badge shows "Rejected" with appropriate styling

---

### 4. **Multiple Rejections**

#### Test Steps:
1. Reject 3 different villages with different reasons:
   - "Incomplete pricing information"
   - "Unable to verify operator details"
   - "Duplicate listing"
2. Check "Rejected" tab

#### Expected Results:
- ✅ All 3 villages appear in Rejected tab
- ✅ Each shows correct rejection reason
- ✅ Sorted by rejection date (most recent first)
- ✅ "Rejected" count in overview stats is accurate

---

### 5. **UI/UX Testing**

#### Test 5.1: Modal Interactions
1. Open rejection modal
2. Click outside modal (or press ESC)

**Expected:**
- ✅ Modal closes without rejecting
- ✅ Village remains in Pending status
- ✅ No data is modified

#### Test 5.2: Button States
1. Click "Reject" in detail modal
2. Observe button states during submission

**Expected:**
- ✅ Button shows loading state during API call
- ✅ Button is disabled during submission
- ✅ Cannot spam-click the button
- ✅ Re-enables after success/failure

#### Test 5.3: Rejection Reason Display
1. View a rejected village in detail modal

**Expected:**
- ✅ Rejection reason is clearly visible
- ✅ Formatted properly (not raw text)
- ✅ Shows who rejected and when
- ✅ Clear visual distinction from pending/approved

---

### 6. **Error Handling**

#### Test 6.1: Network Error Simulation
1. Open DevTools → Network tab
2. Set network to "Offline"
3. Try to reject a village

**Expected:**
- ✅ Shows error message: "Failed to reject village"
- ✅ Village remains in Pending status
- ✅ Modal stays open for retry
- ✅ Error is logged to console

#### Test 6.2: Invalid Village ID
1. Open browser console
2. Manually call reject with invalid ID
3. Check response

**Expected:**
- ✅ Returns 404 or 500 error
- ✅ Error message displayed to user
- ✅ No partial data corruption

#### Test 6.3: Unauthorized Access
1. Sign out or use expired token
2. Try to access rejection endpoint directly

**Expected:**
- ✅ Returns 401 Unauthorized
- ✅ User is redirected to login
- ✅ No data is modified

---

### 7. **Workflow Integration Testing**

#### Test 7.1: Reject → Resubmit Flow
1. Reject a village with reason
2. Operator resubmits (if operator dashboard allows)
3. Check if village returns to Pending
4. Verify rejection reason is cleared

**Expected:**
- ✅ Village moves back to Pending
- ✅ `rejection_reason` field is cleared
- ✅ `rejected_at` and `rejected_by` are cleared
- ✅ New `submitted_at` timestamp

#### Test 7.2: Reject → Delete Flow
1. Reject a village
2. Go to Rejected tab
3. Delete the rejected village

**Expected:**
- ✅ Delete works on rejected villages
- ✅ Village is permanently removed
- ✅ Count updates correctly

---

### 8. **Database Verification (Manual)**

After performing rejections, check Supabase directly:

```sql
-- Check rejected villages
SELECT 
  id, 
  name, 
  status, 
  rejection_reason,
  rejected_at,
  rejected_by,
  submitted_at
FROM retirement_villages
WHERE status = 'rejected'
ORDER BY rejected_at DESC;
```

#### Verify:
- ✅ `status` = 'rejected'
- ✅ `rejection_reason` contains your test text
- ✅ `rejected_at` has valid timestamp
- ✅ `rejected_by` has admin user ID (UUID)
- ✅ Original submission data is preserved

---

## Known Issues / Future Enhancements

### Current Limitations:
- [ ] **Email Notification**: TODO comment in code - rejection emails not yet implemented
- [ ] **Rejection History**: No audit trail if village is resubmitted multiple times
- [ ] **Operator Dashboard**: Operators may not see rejection reasons (needs verification)

### Potential Improvements:
- [ ] Make rejection reason required (add validation)
- [ ] Add character limit to rejection reason (e.g., 500 chars)
- [ ] Implement email notifications to operators
- [ ] Add rejection reason templates/quick picks
- [ ] Show rejection history in admin dashboard
- [ ] Allow operators to view rejection reasons in their dashboard
- [ ] Add "Appeal" functionality for operators

---

## Test Results Template

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Basic Rejection Flow | ⬜ | |
| 2.1 | Empty Rejection Reason | ⬜ | |
| 2.2 | Long Rejection Reason | ⬜ | |
| 2.3 | Special Characters | ⬜ | |
| 3 | Data Persistence | ⬜ | |
| 4 | Multiple Rejections | ⬜ | |
| 5.1 | Modal Interactions | ⬜ | |
| 5.2 | Button States | ⬜ | |
| 5.3 | Rejection Display | ⬜ | |
| 6.1 | Network Error | ⬜ | |
| 6.2 | Invalid ID | ⬜ | |
| 6.3 | Unauthorized Access | ⬜ | |
| 7.1 | Reject → Resubmit | ⬜ | |
| 7.2 | Reject → Delete | ⬜ | |
| 8 | Database Verification | ⬜ | |

---

## Quick Test Commands

### Create Test Submissions (if needed):
Use the "List Your Village" form to create 3-5 test submissions with minimal data.

### Reset Test Data (Supabase SQL):
```sql
-- WARNING: This will delete all test data!
-- Set villages back to pending for re-testing
UPDATE retirement_villages 
SET status = 'pending',
    rejection_reason = NULL,
    rejected_at = NULL,
    rejected_by = NULL
WHERE status = 'rejected';
```

---

## Next Steps After Testing

1. ✅ Document any bugs found
2. ✅ Create enhancement tickets for future improvements
3. ✅ Update operator dashboard to show rejection reasons
4. ✅ Implement email notification system
5. ✅ Move to Feature #3 (next planned enhancement)

---

**Testing Date:** _____________  
**Tested By:** _____________  
**Environment:** Production / Staging / Local  
**Overall Status:** ⬜ Pass / ⬜ Fail / ⬜ Needs Work
