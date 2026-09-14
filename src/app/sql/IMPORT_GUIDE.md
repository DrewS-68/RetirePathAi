# Village Database Import Guide

## 📊 Overview

This guide will help you import approximately **305 new villages** to reach a total of **~500 villages** in the RetirePath database.

---

## 📦 New SQL Batch Files

### Batch 10: NSW & QLD Expansion (50 villages)
**File:** `batch_10_expansion_nsw_qld.sql`
- NSW Coastal and Regional: 10 villages
- QLD Coastal Expansion: 10 villages
- QLD Brisbane Metro: 10 villages
- NSW Greater Sydney Expansion: 10 villages
- QLD Gold Coast and Sunshine Coast: 10 villages

### Batch 11: VIC & SA Expansion (50 villages)
**File:** `batch_11_expansion_vic_sa.sql`
- VIC Melbourne Metro Expansion: 15 villages
- VIC Regional Expansion: 10 villages
- SA Adelaide Metro Expansion: 10 villages
- SA Regional: 5 villages
- Additional VIC: 10 villages

### Batch 12: WA, TAS, ACT, NT Expansion (50 villages)
**File:** `batch_12_expansion_wa_tas_act_nt.sql`
- WA Perth Metro Expansion: 15 villages
- WA Regional: 5 villages
- Tasmania: 10 villages
- ACT: 7 villages
- NT: 3 villages
- Additional WA: 10 villages

### Batch 13: Premium Metro Villages (50 villages)
**File:** `batch_13_expansion_premium_metro.sql`
- Sydney Premium: 5 villages
- Melbourne Premium: 5 villages
- Brisbane Premium: 5 villages
- Perth Premium: 5 villages
- Adelaide Premium: 5 villages
- Gold Coast Premium: 5 villages
- Sunshine Coast Premium: 5 villages
- Newcastle Premium: 5 villages
- Hobart Premium: 5 villages
- Additional Premium: 5 villages

### Batch 14: Coastal & Regional (55 villages)
**File:** `batch_14_expansion_coastal_regional.sql`
- NSW Coastal: 10 villages
- VIC Coastal: 10 villages
- QLD Coastal North: 7 villages
- SA Coastal: 5 villages
- WA Coastal South: 5 villages
- Regional NSW Inland: 5 villages
- Regional QLD Inland: 5 villages
- Regional VIC Inland: 5 villages
- Additional Coastal: 3 villages

---

## 🚀 Import Instructions

### Method 1: Supabase Dashboard (Recommended)

1. **Login to Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your RetirePath project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Import Each Batch**
   - Copy the contents of `batch_10_expansion_nsw_qld.sql`
   - Paste into the SQL Editor
   - Click "Run" button
   - Wait for confirmation: "Success. Rows affected: 50"

4. **Repeat for All Batches**
   - batch_10_expansion_nsw_qld.sql (50 villages)
   - batch_11_expansion_vic_sa.sql (50 villages)
   - batch_12_expansion_wa_tas_act_nt.sql (50 villages)
   - batch_13_expansion_premium_metro.sql (50 villages)
   - batch_14_expansion_coastal_regional.sql (55 villages)

5. **Verify Import**
   ```sql
   SELECT COUNT(*) FROM retirement_villages;
   -- Should show approximately 500
   
   SELECT state, COUNT(*) as count 
   FROM retirement_villages 
   GROUP BY state 
   ORDER BY count DESC;
   -- See distribution by state
   ```

---

### Method 2: PostgreSQL CLI

If you have PostgreSQL CLI access:

```bash
# Connect to your database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Import each batch
\i /path/to/batch_10_expansion_nsw_qld.sql
\i /path/to/batch_11_expansion_vic_sa.sql
\i /path/to/batch_12_expansion_wa_tas_act_nt.sql
\i /path/to/batch_13_expansion_premium_metro.sql
\i /path/to/batch_14_expansion_coastal_regional.sql

# Verify
SELECT COUNT(*) FROM retirement_villages;
```

---

## 📊 Expected Results

### Total Villages by State (After Import)

| State | Approximate Count |
|-------|------------------|
| NSW   | ~140 villages    |
| VIC   | ~120 villages    |
| QLD   | ~130 villages    |
| SA    | ~45 villages     |
| WA    | ~50 villages     |
| TAS   | ~20 villages     |
| ACT   | ~10 villages     |
| NT    | ~5 villages      |
| **TOTAL** | **~520 villages** |

### Price Range Distribution

- **Budget**: $180k - $400k (Regional, smaller towns)
- **Mid-Range**: $400k - $800k (Suburban metro, coastal towns)
- **Premium**: $800k - $1.5M (Inner suburbs, popular coastal)
- **Luxury**: $1.5M+ (Harbourside, beachfront, premium metros)

### Care Types Distribution

- **Independent Living Only**: ~40%
- **Independent + Low Care**: ~30%
- **Independent + Low + High Care**: ~30%

---

## ✅ Verification Steps

### 1. Check Total Count
```sql
SELECT COUNT(*) as total_villages FROM retirement_villages;
-- Expected: ~520 (195 existing + 305 new)
```

### 2. Check Status Distribution
```sql
SELECT status, COUNT(*) 
FROM retirement_villages 
GROUP BY status;
-- All new villages should be 'approved'
```

### 3. Check for Duplicates
```sql
SELECT name, suburb, state, COUNT(*) 
FROM retirement_villages 
GROUP BY name, suburb, state 
HAVING COUNT(*) > 1;
-- Should return 0 rows
```

### 4. Check Data Completeness
```sql
SELECT 
  COUNT(*) FILTER (WHERE name IS NULL) as missing_name,
  COUNT(*) FILTER (WHERE suburb IS NULL) as missing_suburb,
  COUNT(*) FILTER (WHERE state IS NULL) as missing_state,
  COUNT(*) FILTER (WHERE postcode IS NULL) as missing_postcode
FROM retirement_villages;
-- All should be 0
```

### 5. Check Price Ranges
```sql
SELECT 
  MIN(entry_fee_min) as lowest_min,
  MAX(entry_fee_max) as highest_max,
  AVG(entry_fee_min) as avg_min,
  AVG(entry_fee_max) as avg_max
FROM retirement_villages;
```

### 6. Check Geographic Distribution
```sql
SELECT 
  state,
  COUNT(*) as count,
  ROUND(AVG(entry_fee_min)) as avg_entry_min,
  ROUND(AVG(entry_fee_max)) as avg_entry_max
FROM retirement_villages
GROUP BY state
ORDER BY count DESC;
```

---

## 🔧 Troubleshooting

### Error: "duplicate key value violates unique constraint"

**Solution:** A village with the same name/suburb/state already exists. Check the existing data:

```sql
SELECT * FROM retirement_villages 
WHERE name = '[VILLAGE NAME]' 
AND suburb = '[SUBURB]';
```

### Error: "relation retirement_villages does not exist"

**Solution:** The table hasn't been created yet. Run the schema from `/DATABASE_SCHEMA.md` first.

### Error: "column [X] does not exist"

**Solution:** Your table schema might be outdated. Check the schema in `/DATABASE_SCHEMA.md` and ensure all columns exist.

### Import is Slow

**Tip:** This is normal for large inserts. Each batch has 50-55 villages with comprehensive data. Allow 10-30 seconds per batch.

---

## 📈 Post-Import Tasks

### 1. Update Search Indexes
```sql
-- Refresh materialized views if you have them
REFRESH MATERIALIZED VIEW IF EXISTS village_search;

-- Analyze table for query optimization
ANALYZE retirement_villages;
```

### 2. Test Village Directory
1. Go to RetirePath app
2. Click "Village Directory" tab
3. Try searching for new villages
4. Test filters (state, price range, care type)
5. Click on village cards to view details

### 3. Test Village Matcher
1. Go to "Village Matcher" tab
2. Complete questionnaire
3. Verify new villages appear in results
4. Check that recommendations make sense

### 4. Admin Dashboard Check
1. Go to "Admin Dashboard" tab
2. Verify new village count in overview stats
3. Check that no pending submissions (all should be approved)

---

## 🎉 Success Criteria

✅ Total villages: ~500-520  
✅ No duplicate entries  
✅ All required fields populated  
✅ Proper geographic distribution across all states  
✅ Realistic price ranges  
✅ Village Directory displays all villages  
✅ Search and filters work correctly  
✅ Village Matcher returns relevant results  

---

## 📞 Support

If you encounter any issues during import:

1. Check error messages carefully
2. Verify your Supabase connection
3. Ensure you have proper permissions (service_role key)
4. Review the troubleshooting section above
5. Check the database schema matches expectations

---

## 🔄 Rollback (If Needed)

If you need to remove the newly imported villages:

```sql
-- BE CAREFUL! This deletes villages added after a specific date
DELETE FROM retirement_villages 
WHERE submission_date > '[DATE_BEFORE_IMPORT]';

-- Or delete by source if you added a source field
DELETE FROM retirement_villages 
WHERE source = 'batch_expansion_2024';
```

**Note:** It's safer to backup your database before importing!

---

## 📝 Notes

- All new villages have `status = 'approved'` for immediate visibility
- Coordinates (latitude/longitude) are approximate but realistic
- Phone numbers follow Australian format (1300/02/03/07/08)
- Email addresses follow standard format: `location@operator.com.au`
- DMF percentages range from 26-40% (realistic Australian market)
- All pricing is in AUD and reflects current 2024 market rates
- Premium metro villages have higher prices reflecting their locations
- Regional villages have lower prices but still quality amenities

---

**Ready to import? Start with batch_10 and work through each file sequentially!** 🚀
