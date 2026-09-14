# Village Rejection Workflow - Complete Flow Diagram

## 📊 Complete Rejection Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     OPERATOR SUBMITS VILLAGE                        │
│                                                                     │
│  Operator Dashboard → "List New Village" → Fill Form → Submit      │
│                                                                     │
│  Backend: POST /villages/submit                                    │
│  Database: INSERT with status = 'pending'                          │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    ADMIN REVIEWS SUBMISSION                         │
│                                                                     │
│  Admin Dashboard → Pending Tab → Click "View" → Review Details     │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
                    ┌───────────┴───────────┐
                    ↓                       ↓
    ┌───────────────────────┐   ┌───────────────────────┐
    │  ADMIN APPROVES       │   │  ADMIN REJECTS        │
    │  (Not tested today)   │   │  (Our test focus!)    │
    └───────────────────────┘   └───────────────────────┘
                                            ↓
            ┌───────────────────────────────────────────────────────┐
            │         REJECTION PROCESS (Step-by-Step)             │
            │                                                       │
            │  1. Admin clicks "Reject" button                     │
            │  2. Rejection modal opens                            │
            │  3. Admin enters rejection reason (textarea)         │
            │  4. Admin clicks "Reject Submission"                 │
            │                                                       │
            │  Frontend Action:                                    │
            │  - Shows loading state on button                     │
            │  - Sends PUT request to backend                      │
            │                                                       │
            │  API Call:                                           │
            │  PUT /villages/admin/{id}/reject                     │
            │  Headers: Authorization: Bearer {admin_token}        │
            │  Body: { "reason": "Rejection text here..." }        │
            └───────────────────────────────────────────────────────┘
                                ↓
            ┌───────────────────────────────────────────────────────┐
            │           BACKEND PROCESSES REJECTION                │
            │                                                       │
            │  File: /supabase/functions/server/villages.ts:384    │
            │                                                       │
            │  1. Verify admin authentication                      │
            │  2. Extract village ID from URL param                │
            │  3. Extract reason from request body                 │
            │  4. Update database:                                 │
            │                                                       │
            │     UPDATE retirement_villages SET                   │
            │       status = 'rejected',                           │
            │       rejected_at = NOW(),                           │
            │       rejected_by = {admin_user_id},                 │
            │       rejection_reason = {reason}                    │
            │     WHERE id = {village_id}                          │
            │                                                       │
            │  5. Return success response                          │
            │  6. [TODO] Send email to operator                    │
            └───────────────────────────────────────────────────────┘
                                ↓
            ┌───────────────────────────────────────────────────────┐
            │         FRONTEND UPDATES (Admin View)                │
            │                                                       │
            │  1. Close rejection modal                            │
            │  2. Close village detail modal                       │
            │  3. Refresh villages list (fetchVillages())          │
            │  4. Village disappears from "Pending" tab            │
            │  5. Village appears in "Rejected" tab with badge     │
            │  6. Clear rejection reason textarea                  │
            └───────────────────────────────────────────────────────┘
                                ↓
            ┌───────────────────────────────────────────────────────┐
            │       OPERATOR SEES REJECTION (Their View)           │
            │                                                       │
            │  Operator Dashboard → Refreshes/Reloads              │
            │                                                       │
            │  API Call:                                           │
            │  GET /villages/my-submissions                        │
            │  Headers: Authorization: Bearer {operator_token}     │
            │                                                       │
            │  Backend Returns:                                    │
            │  {                                                   │
            │    villages: [                                       │
            │      {                                               │
            │        id: "...",                                    │
            │        name: "Test Village",                         │
            │        status: "rejected",                           │
            │        rejected_at: "2024-12-03T14:30:00Z",          │
            │        rejected_by: "admin-uuid-here",               │
            │        rejection_reason: "Incomplete info..."        │
            │      }                                               │
            │    ]                                                 │
            │  }                                                   │
            └───────────────────────────────────────────────────────┘
                                ↓
            ┌───────────────────────────────────────────────────────┐
            │         OPERATOR DASHBOARD DISPLAYS                  │
            │                                                       │
            │  1. Village card shows "Rejected" badge (red)        │
            │  2. Operator clicks "View" to see details            │
            │  3. Modal opens with RED ALERT at top:               │
            │                                                       │
            │     ╔══════════════════════════════════════════╗     │
            │     ║  ⚠️  Submission rejected                 ║     │
            │     ║                                          ║     │
            │     ║  Incomplete information: Missing pricing ║     │
            │     ║  details and village type. Please provide║     │
            │     ║  entry costs and monthly fees before     ║     │
            │     ║  resubmitting.                           ║     │
            │     ║                                          ║     │
            │     ║  You can edit and resubmit this village. ║     │
            │     ╚══════════════════════════════════════════╝     │
            │                                                       │
            │  4. "Edit" button available for corrections          │
            └───────────────────────────────────────────────────────┘
                                ↓
                    ┌───────────┴───────────┐
                    ↓                       ↓
    ┌───────────────────────┐   ┌───────────────────────┐
    │  OPERATOR EDITS       │   │  OPERATOR IGNORES     │
    │  & RESUBMITS          │   │  (Leaves rejected)    │
    └───────────────────────┘   └───────────────────────┘
                ↓
    ┌───────────────────────────────────────────────────┐
    │         EDIT & RESUBMIT WORKFLOW                 │
    │                                                   │
    │  1. Operator clicks "Edit" in detail modal       │
    │  2. Form opens with current data pre-filled      │
    │  3. Operator updates fields (adds pricing, etc)  │
    │  4. Operator clicks "Update Village"             │
    │                                                   │
    │  API Call:                                       │
    │  PUT /villages/operator/{id}                     │
    │                                                   │
    │  Backend Action:                                 │
    │  UPDATE retirement_villages SET                  │
    │    {updated_fields},                             │
    │    status = 'pending',        ← Reset!           │
    │    rejection_reason = NULL,   ← Clear!           │
    │    rejected_at = NULL,        ← Clear!           │
    │    rejected_by = NULL,        ← Clear!           │
    │    submitted_at = NOW()       ← New time         │
    │  WHERE id = {id}                                 │
    │                                                   │
    │  Result: Village back in "Pending" queue!        │
    └───────────────────────────────────────────────────┘
```

---

## 🗂️ Database Schema (Relevant Fields)

```sql
retirement_villages
├── id (UUID, primary key)
├── name (TEXT)
├── status (TEXT) -- 'pending' | 'approved' | 'rejected'
│
├── submission tracking
│   ├── submitted_at (TIMESTAMP)
│   ├── submitted_by_user_id (UUID) -- Links to auth.users
│   └── source (TEXT) -- 'operator_submission'
│
├── approval tracking
│   ├── approved_at (TIMESTAMP)
│   └── approved_by (UUID) -- Admin user ID
│
└── rejection tracking ⭐ (Focus of testing)
    ├── rejected_at (TIMESTAMP) -- When rejected
    ├── rejected_by (UUID) -- Admin user ID
    └── rejection_reason (TEXT) -- Why rejected
```

---

## 🔄 Status Transitions

```
                    ┌─────────────────────┐
                    │   STATUS: PENDING   │
                    │  (Initial state)    │
                    └─────────────────────┘
                             │
                ┌────────────┴────────────┐
                ↓                         ↓
    ┌──────────────────────┐  ┌──────────────────────┐
    │  STATUS: APPROVED    │  │  STATUS: REJECTED    │
    │                      │  │                      │
    │  approved_at: ✓      │  │  rejected_at: ✓      │
    │  approved_by: ✓      │  │  rejected_by: ✓      │
    │                      │  │  rejection_reason: ✓ │
    └──────────────────────┘  └──────────────────────┘
                                          │
                                          │ (Edit & Resubmit)
                                          ↓
                              ┌──────────────────────┐
                              │  STATUS: PENDING     │
                              │  (Back to queue)     │
                              │                      │
                              │  Fields cleared:     │
                              │  - rejection_reason  │
                              │  - rejected_at       │
                              │  - rejected_by       │
                              └──────────────────────┘
```

---

## 🎯 Critical Test Points

| # | Test Point | Location | What to Verify |
|---|------------|----------|----------------|
| 1 | Admin can reject | Admin Dashboard | Click reject → modal opens |
| 2 | Reason saved | Backend/DB | Check `rejection_reason` field |
| 3 | Status updated | Backend/DB | Status = 'rejected' |
| 4 | Timestamps saved | Backend/DB | `rejected_at` has value |
| 5 | Admin ID saved | Backend/DB | `rejected_by` = admin UUID |
| 6 | Village moves tabs | Admin UI | Pending → Rejected tab |
| 7 | Operator sees reason | Operator Dashboard | Red alert with reason text |
| 8 | Edit clears rejection | Backend/DB | Fields null when resubmitted |
| 9 | Resubmit → Pending | Backend/DB | Status back to 'pending' |
| 10 | No console errors | Browser DevTools | Clean execution |

---

## 📝 API Endpoints Reference

### Admin Endpoints
```
PUT /make-server-3bba8be8/villages/admin/{id}/reject
├── Auth: Required (Bearer token)
├── Body: { "reason": "text here" }
├── Response: { "success": true, "village": {...} }
└── File: /supabase/functions/server/villages.ts:384
```

### Operator Endpoints
```
GET /make-server-3bba8be8/villages/my-submissions
├── Auth: Required (Bearer token)
├── Returns: { "villages": [...] }
└── File: /supabase/functions/server/villages.ts:95

PUT /make-server-3bba8be8/villages/operator/{id}
├── Auth: Required (Bearer token)
├── Body: { ...updated fields }
├── Clears rejection when status = 'rejected'
└── File: /supabase/functions/server/villages.ts:515
```

---

## 🐛 Common Bugs to Watch For

1. **Rejection reason not saving**
   - Check: Body parsing in backend
   - Verify: `body.reason` is accessed correctly
   
2. **Village stays in Pending**
   - Check: Status update in SQL
   - Verify: fetchVillages() is called after rejection

3. **Operator can't see reason**
   - Check: API returns `rejection_reason` field
   - Verify: Frontend displays `selectedVillage.rejection_reason`

4. **Resubmit doesn't clear rejection**
   - Check: Update statement includes NULL for rejection fields
   - Verify: Status changes to 'pending'

5. **Timestamps wrong timezone**
   - Check: Using `new Date().toISOString()`
   - Verify: Stored as UTC in database

---

## ✅ Success Criteria Checklist

- [ ] Admin can open rejection modal
- [ ] Admin can enter rejection reason
- [ ] Rejection saves to database correctly
- [ ] All rejection fields populated (reason, timestamp, admin ID)
- [ ] Village moves from Pending → Rejected tab
- [ ] Operator sees rejection in their dashboard
- [ ] Rejection reason displays in red alert
- [ ] Edit & resubmit clears rejection data
- [ ] Resubmitted village returns to Pending
- [ ] No errors in browser console
- [ ] No errors in server logs
- [ ] Works with empty reason (if allowed)
- [ ] Works with long reason (500+ chars)
- [ ] Works with special characters

---

**Quick Links:**
- 📋 Full Testing Checklist: `/REJECTION_TESTING_CHECKLIST.md`
- 🚀 Quick Start Guide: `/REJECTION_TESTING_QUICK_START.md`
- 💻 Backend Code: `/supabase/functions/server/villages.ts`
- 🎨 Admin UI: `/components/AdminDashboard.tsx`
- 👤 Operator UI: `/components/OperatorDashboard.tsx`
