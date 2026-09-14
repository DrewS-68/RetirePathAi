# COMPREHENSIVE DIAGNOSTIC SCRIPT FOR VIC VILLAGE WEBSITE SCRAPING ISSUE

## Problem Summary
- AUTO-PROCESSOR finds websites successfully ("1 found, 0 not found")  
- Websites are being saved via `/scraper/save-websites` endpoint
- But database queries show "Total approved villages with websites: 0"
- Batch scraping shows "0 / 505" villages processed

## Root Cause Analysis

### Issue 1: Website Saving Not Working
The `/scraper/save-websites` endpoint IS being called and should be updating the database, but the updates aren't persisting or aren't visible.

**Possible Causes:**
1. Database permissions issue (service role not having UPDATE permissions)
2. Villages being updated don't have `status='approved'`
3. Field mismatch (saving to wrong field)
4. Caching issue in Supabase client

### Issue 2: Stats Query Not Finding Websites
The stats query filters for:
- `status = 'approved'` (CORRECT)
- `website IS NOT NULL` (CORRECT)
- `state = 'VIC'` (when filtered)

But returns 0 results.

## Diagnostic Steps

### Step 1: Check Raw Database
Run this query directly in Supabase SQL Editor:

```sql
-- Check total VIC villages
SELECT count(*) FROM retirement_villages WHERE state = 'VIC';

-- Check VIC villages with status
SELECT status, count(*) 
FROM retirement_villages 
WHERE state = 'VIC' 
GROUP BY status;

-- Check VIC villages with websites
SELECT count(*) 
FROM retirement_villages 
WHERE state = 'VIC' 
AND website IS NOT NULL 
AND website != '';

-- Check VIC approved villages with websites
SELECT count(*) 
FROM retirement_villages 
WHERE state = 'VIC' 
AND status = 'approved'
AND website IS NOT NULL 
AND website != '';

-- Sample of VIC villages to see actual data
SELECT id, name, state, status, website
FROM retirement_villages 
WHERE state = 'VIC'
LIMIT 20;
```

### Step 2: Check Backend Logs
Look for these log messages:
- "✅ Updated [village name] with website: [url]" (from save-websites endpoint)
- "✅ Batch 1 saved: X URLs" (from AUTO-PROCESSOR)

### Step 3: Frontend Debug
Add console.log to see what villages are being processed:
- Check `result.villageId` being sent to save-websites
- Check if villages have `status='approved'`

## Fixes to Apply

### Fix 1: Add Debug Logging to save-websites Endpoint
### Fix 2: Ensure Status Filter is Consistent 
### Fix 3: Add Force Refresh After Save
### Fix 4: Fix Batch Scraper to Handle Missing Websites

## Expected Behavior After Fixes
1. AUTO-PROCESSOR finds websites ✅
2. Websites are saved to database ✅
3. Stats show correct count ✅
4. Batch scraper can process villages ✅
