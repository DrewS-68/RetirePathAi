-- =====================================================
-- COMPREHENSIVE SQL DIAGNOSTICS FOR VIC VILLAGE WEBSITE ISSUE
-- Run these queries in Supabase SQL Editor to diagnose the problem
-- =====================================================

-- QUERY 1: Count total VIC villages by status
SELECT 
  status,
  COUNT(*) as count
FROM retirement_villages
WHERE state = 'VIC'
GROUP BY status
ORDER BY count DESC;

-- Expected result: Should show "approved: 505" if all VIC villages are approved

-- =====================================================

-- QUERY 2: Check if ANY VIC villages have websites
SELECT 
  COUNT(*) as total_vic,
  COUNT(CASE WHEN website IS NOT NULL AND website != '' THEN 1 END) as with_website,
  COUNT(CASE WHEN website IS NULL OR website = '' THEN 1 END) as without_website
FROM retirement_villages
WHERE state = 'VIC';

-- Expected result: Should show breakdown of villages with/without websites

-- =====================================================

-- QUERY 3: Sample of VIC villages to see actual data
SELECT 
  id,
  name,
  state,
  status,
  website,
  created_at,
  updated_at
FROM retirement_villages
WHERE state = 'VIC'
ORDER BY created_at DESC
LIMIT 20;

-- Expected result: Should show recent VIC villages with their website status

-- =====================================================

-- QUERY 4: Check for VIC villages with websites that are approved
SELECT 
  id,
  name,
  website,
  status
FROM retirement_villages
WHERE state = 'VIC'
AND website IS NOT NULL
AND website != ''
AND status = 'approved'
LIMIT 20;

-- Expected result: If this returns 0 rows, websites aren't being saved OR status isn't 'approved'

-- =====================================================

-- QUERY 5: Check for recent website updates
SELECT 
  id,
  name,
  website,
  status,
  updated_at
FROM retirement_villages
WHERE state = 'VIC'
AND updated_at > NOW() - INTERVAL '1 hour'  -- Villages updated in last hour
ORDER BY updated_at DESC;

-- Expected result: Should show villages that were recently updated by AUTO-PROCESSOR

-- =====================================================

-- QUERY 6: Check if there are villages with websites but wrong status
SELECT 
  status,
  COUNT(*) as count
FROM retirement_villages
WHERE state = 'VIC'
AND website IS NOT NULL
AND website != ''
GROUP BY status;

-- Expected result: Shows if websites are being saved to non-approved villages

-- =====================================================

-- QUERY 7: Find all unique statuses in database
SELECT DISTINCT status
FROM retirement_villages
ORDER BY status;

-- Expected result: Should show all possible status values ('approved', 'pending', etc.)

-- =====================================================

-- QUERY 8: Sample village IDs for testing
SELECT id, name, status, website
FROM retirement_villages
WHERE state = 'VIC'
ORDER BY name
LIMIT 10;

-- Use these IDs to manually test the save-websites endpoint

-- =====================================================

-- QUERY 9: Check for duplicate villages (same name)
SELECT 
  name,
  COUNT(*) as count,
  ARRAY_AGG(id) as ids,
  ARRAY_AGG(status) as statuses
FROM retirement_villages
WHERE state = 'VIC'
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Expected result: Should show if there are duplicate villages

-- =====================================================

-- QUERY 10: Full analysis - websites per status
SELECT 
  status,
  COUNT(*) as total,
  COUNT(CASE WHEN website IS NOT NULL AND website != '' THEN 1 END) as with_website,
  ROUND(100.0 * COUNT(CASE WHEN website IS NOT NULL AND website != '' THEN 1 END) / COUNT(*), 2) as percent_with_website
FROM retirement_villages
WHERE state = 'VIC'
GROUP BY status
ORDER BY total DESC;

-- Expected result: Shows what percentage of each status group has websites
