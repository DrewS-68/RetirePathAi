# 🚀 Quick Import Instructions

## One-Page Guide to Adding 305 Villages

---

## Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your RetirePath project
3. Click **"SQL Editor"** in left sidebar
4. Click **"New Query"**

---

## Step 2: Import Each Batch (Copy & Paste)

### Batch 10 (50 villages - NSW & QLD)
1. Open `/sql/batch_10_expansion_nsw_qld.sql`
2. Copy entire contents
3. Paste into SQL Editor
4. Click **"Run"**
5. ✅ Wait for "Success. Rows affected: 50"

### Batch 11 (50 villages - VIC & SA)
1. Open `/sql/batch_11_expansion_vic_sa.sql`
2. Copy entire contents
3. Paste into SQL Editor
4. Click **"Run"**
5. ✅ Wait for "Success. Rows affected: 50"

### Batch 12 (50 villages - WA, TAS, ACT, NT)
1. Open `/sql/batch_12_expansion_wa_tas_act_nt.sql`
2. Copy entire contents
3. Paste into SQL Editor
4. Click **"Run"**
5. ✅ Wait for "Success. Rows affected: 50"

### Batch 13 (50 villages - Premium Metro)
1. Open `/sql/batch_13_expansion_premium_metro.sql`
2. Copy entire contents
3. Paste into SQL Editor
4. Click **"Run"**
5. ✅ Wait for "Success. Rows affected: 50"

### Batch 14 (55 villages - Coastal & Regional)
1. Open `/sql/batch_14_expansion_coastal_regional.sql`
2. Copy entire contents
3. Paste into SQL Editor
4. Click **"Run"**
5. ✅ Wait for "Success. Rows affected: 55"

---

## Step 3: Verify Import

Run this query in SQL Editor:

```sql
SELECT COUNT(*) FROM retirement_villages;
```

**Expected result:** ~520 villages

---

## Step 4: Check Distribution

Run this query:

```sql
SELECT state, COUNT(*) as count 
FROM retirement_villages 
GROUP BY state 
ORDER BY count DESC;
```

**Expected results:**
- NSW: ~140
- QLD: ~130
- VIC: ~120
- WA: ~50
- SA: ~45
- TAS: ~20
- ACT: ~10
- NT: ~5

---

## Step 5: Test in App

1. Open RetirePath app
2. Go to **"Village Directory"** tab
3. Try searching for new villages:
   - Search "Byron Bay"
   - Search "Toorak"
   - Search "Noosa"
   - Filter by state/price
4. Click on village cards - details should display

---

## ✅ Success Checklist

- [ ] All 5 batches imported (255 villages)
- [ ] Total count = ~520 villages
- [ ] State distribution looks correct
- [ ] Village Directory shows new villages
- [ ] Search functionality works
- [ ] Village Matcher returns results
- [ ] Admin Dashboard shows updated count

---

## 🆘 If Something Goes Wrong

### Error: "duplicate key"
- Some villages already exist
- Check which villages conflict
- Skip that batch or remove conflicts

### Error: "relation does not exist"
- Table not created yet
- Run schema from `/DATABASE_SCHEMA.md` first

### Import is slow
- Normal! Each batch takes 10-30 seconds
- Be patient and don't refresh

---

## ⏱️ Total Time: 5-10 minutes

---

## 🎉 Done! Return to Feature #2

Once imported, you're ready to continue with:
**Feature #2: Rejection Testing workflow**

---

**Need more details?** See `/sql/IMPORT_GUIDE.md`
