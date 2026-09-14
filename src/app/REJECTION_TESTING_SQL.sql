-- ============================================================================
-- REJECTION TESTING - SQL HELPER QUERIES
-- ============================================================================
-- Use these queries in Supabase SQL Editor to verify rejection functionality
-- ============================================================================

-- ============================================================================
-- 1. VIEW ALL REJECTED VILLAGES
-- ============================================================================
-- Shows all rejected villages with full rejection details
-- Use this to verify rejections were saved correctly

SELECT 
  id,
  name,
  suburb,
  state,
  status,
  rejection_reason,
  rejected_at,
  rejected_by,
  submitted_at,
  submitted_by_user_id,
  contact_email
FROM retirement_villages
WHERE status = 'rejected'
ORDER BY rejected_at DESC;


-- ============================================================================
-- 2. VIEW REJECTION DETAILS WITH TIMESTAMPS
-- ============================================================================
-- Human-readable format with nice column names

SELECT 
  name AS "Village Name",
  suburb || ', ' || state AS "Location",
  rejection_reason AS "Rejection Reason",
  TO_CHAR(rejected_at, 'YYYY-MM-DD HH24:MI:SS') AS "Rejected At",
  TO_CHAR(submitted_at, 'YYYY-MM-DD HH24:MI:SS') AS "Originally Submitted",
  contact_email AS "Operator Email"
FROM retirement_villages
WHERE status = 'rejected'
ORDER BY rejected_at DESC;


-- ============================================================================
-- 3. COUNT VILLAGES BY STATUS
-- ============================================================================
-- Quick overview of submission statuses

SELECT 
  status,
  COUNT(*) as count
FROM retirement_villages
GROUP BY status
ORDER BY 
  CASE status 
    WHEN 'pending' THEN 1
    WHEN 'approved' THEN 2
    WHEN 'rejected' THEN 3
  END;


-- ============================================================================
-- 4. FIND TEST REJECTION VILLAGES
-- ============================================================================
-- Finds villages with "test" in the name that have been rejected

SELECT 
  id,
  name,
  rejection_reason,
  rejected_at
FROM retirement_villages
WHERE status = 'rejected'
  AND (LOWER(name) LIKE '%test%' OR LOWER(name) LIKE '%rejection%')
ORDER BY rejected_at DESC;


-- ============================================================================
-- 5. CHECK IF REJECTION REASON IS SAVED
-- ============================================================================
-- Specifically checks for villages rejected without a reason

SELECT 
  id,
  name,
  status,
  rejection_reason,
  CASE 
    WHEN rejection_reason IS NULL THEN '⚠️ Missing'
    WHEN rejection_reason = '' THEN '⚠️ Empty'
    ELSE '✅ Has Reason'
  END as reason_status
FROM retirement_villages
WHERE status = 'rejected'
ORDER BY rejected_at DESC;


-- ============================================================================
-- 6. VIEW REJECTED VILLAGES WITH ADMIN INFO
-- ============================================================================
-- Shows which admin rejected which villages (requires auth schema access)
-- Note: This may require additional permissions

SELECT 
  rv.name AS "Village Name",
  rv.rejection_reason AS "Reason",
  rv.rejected_at AS "Rejected At",
  rv.rejected_by AS "Admin User ID",
  rv.submitted_by_user_id AS "Operator User ID"
FROM retirement_villages rv
WHERE rv.status = 'rejected'
ORDER BY rv.rejected_at DESC;


-- ============================================================================
-- 7. RECENT REJECTION ACTIVITY (Last 24 hours)
-- ============================================================================
-- Shows villages rejected in the last 24 hours (for testing)

SELECT 
  name,
  rejection_reason,
  rejected_at,
  NOW() - rejected_at AS "How Long Ago"
FROM retirement_villages
WHERE status = 'rejected'
  AND rejected_at > NOW() - INTERVAL '24 hours'
ORDER BY rejected_at DESC;


-- ============================================================================
-- 8. VILLAGES WITH LONG REJECTION REASONS
-- ============================================================================
-- Find villages with detailed rejection reasons (testing long text)

SELECT 
  name,
  LENGTH(rejection_reason) AS "Reason Length",
  LEFT(rejection_reason, 100) || '...' AS "Reason Preview",
  rejected_at
FROM retirement_villages
WHERE status = 'rejected'
  AND rejection_reason IS NOT NULL
ORDER BY LENGTH(rejection_reason) DESC;


-- ============================================================================
-- 9. FULL REJECTION HISTORY
-- ============================================================================
-- Complete audit trail with all timestamps

SELECT 
  name AS "Village",
  status AS "Current Status",
  TO_CHAR(submitted_at, 'YYYY-MM-DD HH24:MI') AS "Submitted",
  TO_CHAR(approved_at, 'YYYY-MM-DD HH24:MI') AS "Approved",
  TO_CHAR(rejected_at, 'YYYY-MM-DD HH24:MI') AS "Rejected",
  rejection_reason AS "Rejection Reason"
FROM retirement_villages
WHERE rejected_at IS NOT NULL
ORDER BY rejected_at DESC;


-- ============================================================================
-- TESTING HELPER QUERIES
-- ============================================================================

-- ============================================================================
-- RESET: Clear rejection for re-testing
-- ============================================================================
-- ⚠️ WARNING: This resets villages back to pending for re-testing
-- Uncomment to use:

/*
UPDATE retirement_villages 
SET 
  status = 'pending',
  rejection_reason = NULL,
  rejected_at = NULL,
  rejected_by = NULL
WHERE status = 'rejected'
  AND LOWER(name) LIKE '%test%';  -- Only test villages
*/


-- ============================================================================
-- RESET: Delete test rejection villages
-- ============================================================================
-- ⚠️ WARNING: This permanently deletes test data
-- Uncomment to use:

/*
DELETE FROM retirement_villages
WHERE LOWER(name) LIKE '%test rejection%'
  AND status = 'rejected';
*/


-- ============================================================================
-- MANUAL: Reject a village (for testing without UI)
-- ============================================================================
-- ⚠️ Replace {village_id} and {admin_user_id} with actual UUIDs
-- Uncomment to use:

/*
UPDATE retirement_villages
SET 
  status = 'rejected',
  rejected_at = NOW(),
  rejected_by = '{admin_user_id}'::uuid,
  rejection_reason = 'Manual test rejection: Incomplete information for testing purposes'
WHERE id = '{village_id}'::uuid;
*/


-- ============================================================================
-- VERIFICATION: Check specific village rejection status
-- ============================================================================
-- Replace {village_id} with the actual UUID
-- Uncomment to use:

/*
SELECT 
  id,
  name,
  status,
  rejection_reason,
  rejected_at,
  rejected_by,
  submitted_at,
  submitted_by_user_id
FROM retirement_villages
WHERE id = '{village_id}'::uuid;
*/


-- ============================================================================
-- DEBUG: Find villages missing expected rejection data
-- ============================================================================
-- Finds inconsistencies (rejected status but missing fields)

SELECT 
  id,
  name,
  status,
  CASE WHEN rejection_reason IS NULL THEN '❌' ELSE '✅' END AS "Has Reason",
  CASE WHEN rejected_at IS NULL THEN '❌' ELSE '✅' END AS "Has Timestamp",
  CASE WHEN rejected_by IS NULL THEN '❌' ELSE '✅' END AS "Has Admin ID"
FROM retirement_villages
WHERE status = 'rejected'
  AND (
    rejection_reason IS NULL 
    OR rejected_at IS NULL 
    OR rejected_by IS NULL
  );


-- ============================================================================
-- STATS: Rejection reasons analysis
-- ============================================================================
-- See common rejection patterns

SELECT 
  LEFT(rejection_reason, 50) AS "Reason Start",
  COUNT(*) AS "Count"
FROM retirement_villages
WHERE status = 'rejected'
  AND rejection_reason IS NOT NULL
GROUP BY LEFT(rejection_reason, 50)
ORDER BY COUNT(*) DESC;


-- ============================================================================
-- AUDIT: Track status changes over time
-- ============================================================================
-- Shows submission → rejection timeline

SELECT 
  name,
  submitted_at AS "Submitted",
  rejected_at AS "Rejected",
  rejected_at - submitted_at AS "Time Until Rejection",
  rejection_reason
FROM retirement_villages
WHERE status = 'rejected'
ORDER BY rejected_at DESC
LIMIT 20;


-- ============================================================================
-- OPERATOR VIEW: Simulate operator seeing their rejections
-- ============================================================================
-- Replace {operator_user_id} with actual UUID
-- Uncomment to use:

/*
SELECT 
  id,
  name,
  status,
  rejection_reason,
  rejected_at,
  submitted_at
FROM retirement_villages
WHERE submitted_by_user_id = '{operator_user_id}'::uuid
  AND status = 'rejected'
ORDER BY rejected_at DESC;
*/


-- ============================================================================
-- QUICK REFERENCE: Field Status
-- ============================================================================
-- Shows which fields should be populated for each status

/*
STATUS = 'pending':
  ✅ submitted_at
  ✅ submitted_by_user_id
  ❌ approved_at, approved_by
  ❌ rejected_at, rejected_by, rejection_reason

STATUS = 'approved':
  ✅ submitted_at, submitted_by_user_id
  ✅ approved_at, approved_by
  ❌ rejected_at, rejected_by, rejection_reason

STATUS = 'rejected':
  ✅ submitted_at, submitted_by_user_id
  ✅ rejected_at, rejected_by, rejection_reason
  ❌ approved_at, approved_by
*/


-- ============================================================================
-- END OF REJECTION TESTING SQL QUERIES
-- ============================================================================
