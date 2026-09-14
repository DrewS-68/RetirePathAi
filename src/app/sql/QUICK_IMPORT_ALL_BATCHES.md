# Quick Import Guide - All Batches to 1,500+ Villages

## Executive Summary
**Target:** 1,505 total villages
**Current database:** 505 villages (Batches 1-12)
**Ready to import:** Batches 13-20 (400 villages)
**Being created:** Batches 21-32 (600 villages)

## Import Order (Recommended)

### Phase 1: Import Corrected Existing Batches
```sql
-- Import from your Supabase SQL Editor
\i /sql/seed_batch_13_50_villages.sql  -- → 555 total
\i /sql/seed_batch_14_50_villages.sql  -- → 605 total
```

### Phase 2: Import New Premium & Regional Batches  
```sql
\i /sql/seed_batch_15_50_villages.sql  -- → 655 total
\i /sql/seed_batch_16_50_villages.sql  -- → 705 total
\i /sql/seed_batch_17_50_villages.sql  -- → 755 total
\i /sql/seed_batch_18_50_villages.sql  -- → 805 total
\i /sql/seed_batch_19_50_villages.sql  -- → 855 total
\i /sql/seed_batch_20_50_villages.sql  -- → 905 total
```

### Phase 3: Import Operator & Geographic Batches (Once Created)
```sql
\i /sql/seed_batch_21_50_villages.sql  -- → 955 total
\i /sql/seed_batch_22_50_villages.sql  -- → 1005 total
\i /sql/seed_batch_23_50_villages.sql  -- → 1055 total
\i /sql/seed_batch_24_50_villages.sql  -- → 1105 total
```

### Phase 4: Import Geographic Deep Dive Batches
```sql
\i /sql/seed_batch_25_50_villages.sql  -- → 1155 total
\i /sql/seed_batch_26_50_villages.sql  -- → 1205 total
\i /sql/seed_batch_27_50_villages.sql  -- → 1255 total
\i /sql/seed_batch_28_50_villages.sql  -- → 1305 total
```

### Phase 5: Import Final Diversity Batches
```sql
\i /sql/seed_batch_29_50_villages.sql  -- → 1355 total
\i /sql/seed_batch_30_50_villages.sql  -- → 1405 total
\i /sql/seed_batch_31_50_villages.sql  -- → 1455 total
\i /sql/seed_batch_32_50_villages.sql  -- → 1505 total ✓
```

## One-Command Import (After All Batches Created)
```bash
# Run all at once
cat /sql/seed_batch_{13..32}_50_villages.sql | psql $DATABASE_URL
```

## Verification Query
```sql
-- Check total count
SELECT COUNT(*) as total_villages FROM retirement_villages;

-- Check by state
SELECT state, COUNT(*) as count 
FROM retirement_villages 
GROUP BY state 
ORDER BY count DESC;

-- Check by operator (top 10)
SELECT operator, COUNT(*) as count 
FROM retirement_villages 
GROUP BY operator 
ORDER BY count DESC 
LIMIT 10;

-- Check by village type
SELECT village_type, COUNT(*) as count 
FROM retirement_villages 
GROUP BY village_type;

-- Check featured villages
SELECT COUNT(*) as featured_count 
FROM retirement_villages 
WHERE featured = true;
```

## Expected Final Distribution

### By State
- NSW: ~450 villages (30%)
- VIC: ~360 villages (24%)
- QLD: ~360 villages (24%)
- SA: ~135 villages (9%)
- WA: ~120 villages (8%)
- TAS: ~30 villages (2%)
- ACT: ~30 villages (2%)
- NT: ~20 villages (1%)

### By Type
- Independent Living: ~750 villages (50%)
- Aged Care: ~700 villages (46%)
- Serviced Apartments: ~55 villages (4%)

### By Price Range
- Budget (<$400K): ~300 villages (20%)
- Mid-range ($400K-$700K): ~750 villages (50%)
- Premium ($700K-$1M): ~350 villages (23%)
- Luxury (>$1M): ~105 villages (7%)

## Database Health Check
```sql
-- Check for duplicates
SELECT name, location, COUNT(*) 
FROM retirement_villages 
GROUP BY name, location 
HAVING COUNT(*) > 1;

-- Check data completeness
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN contact_email IS NOT NULL THEN 1 END) as with_email,
  COUNT(CASE WHEN contact_phone IS NOT NULL THEN 1 END) as with_phone,
  COUNT(CASE WHEN website IS NOT NULL THEN 1 END) as with_website
FROM retirement_villages;
```

## Success Criteria
✓ 1,505 total villages in database
✓ All states represented
✓ Mix of operators (major chains + boutiques)
✓ Realistic pricing ranges
✓ Complete contact information
✓ Varied amenities and services
✓ No duplicate entries

## Rollback (If Needed)
```sql
-- Remove specific batch (example: batch 20)
DELETE FROM retirement_villages 
WHERE source = 'seed_data' 
AND submitted_at > 'YYYY-MM-DD HH:MM:SS' -- timestamp when batch 20 started
LIMIT 50;
```

## Next Steps After Import
1. Update your analytics dashboard
2. Test Village Matcher with larger dataset
3. Review search performance
4. Update homepage stats
5. Test pagination on Public Directory
