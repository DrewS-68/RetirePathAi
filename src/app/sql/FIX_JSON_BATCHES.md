# Fixing JSON Escaping Issue in Batches 15-20

## ⚠️ The Problem

Batches 15-20 have incorrect JSON escaping:
- ❌ Wrong: `'[\"pool\", \"gym\"]'::jsonb`
- ✅ Correct: `'["pool", "gym"]'::jsonb`

## ✅ Already Fixed

I've created corrected versions:
- ✅ `/sql/seed_batch_15_50_villages_CORRECTED.sql`
- ✅ `/sql/seed_batch_16_50_villages_CORRECTED.sql`

## 🔧 Fix Remaining Batches (17-20)

You have two options:

### Option A: I'll Create Corrected Versions (Recommended)

Let me know and I'll create:
- `seed_batch_17_50_villages_CORRECTED.sql`
- `seed_batch_18_50_villages_CORRECTED.sql`
- `seed_batch_19_50_villages_CORRECTED.sql`
- `seed_batch_20_50_villages_CORRECTED.sql`

### Option B: Fix Manually

If you have access to the files locally, you can use find/replace:

**Find:** `\\\"`  
**Replace with:** `"`

Or use this command in terminal (if on Mac/Linux):
```bash
cd sql/

# Batch 17
sed -i.bak 's/\\\\"/"/g' seed_batch_17_50_villages.sql

# Batch 18
sed -i.bak 's/\\\\"/"/g' seed_batch_18_50_villages.sql

# Batch 19
sed -i.bak 's/\\\\"/"/g' seed_batch_19_50_villages.sql

# Batch 20
sed -i.bak 's/\\\\"/"/g' seed_batch_20_50_villages.sql
```

## 📋 Updated Import Order

Use these files:
1. ✅ Batch 13 - `seed_batch_13_50_villages.sql` (already correct)
2. ✅ Batch 14 - `seed_batch_14_50_villages.sql` (already correct)
3. ✅ Batch 15 - `seed_batch_15_50_villages_CORRECTED.sql` ⬅️ **Use CORRECTED**
4. ✅ Batch 16 - `seed_batch_16_50_villages_CORRECTED.sql` ⬅️ **Use CORRECTED**
5. ⏳ Batch 17 - Needs fix
6. ⏳ Batch 18 - Needs fix
7. ⏳ Batch 19 - Needs fix
8. ⏳ Batch 20 - Needs fix

## 🚀 What to Do Now

**Immediate:**
- Import Batch 15 CORRECTED ✅
- Import Batch 16 CORRECTED ✅

**Next:**
- Let me know if you want me to create corrected versions of Batches 17-20, or
- Fix them yourself using Option B above

---

**Note:** Batches 13-14 are already correct and don't need fixing. They were created before this JSON escaping issue was introduced.
