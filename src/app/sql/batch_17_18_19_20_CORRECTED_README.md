# Corrected Batches 17-20 - Import Instructions

## ⚠️ Important Notice

Due to the size and complexity of batches 17-20, I recommend **one of two approaches**:

---

## Option A: Manual Find & Replace (FASTEST - 30 seconds)

If you have the original batch files locally:

### For Each File (17, 18, 19, 20):
1. Open `seed_batch_XX_50_villages.sql` in your text editor
2. Find: `\"`
3. Replace with: `"`
4. Save the file
5. Import to Supabase

**This fixes the JSON escaping issue instantly.**

---

## Option B: Use My Script (if you prefer)

I can create a Python/Node script that does this automatically, or I can generate each corrected batch individually (though each is ~15-20KB).

---

## Recommendation

**Use Option A (Manual Find & Replace)** - it's the fastest and most reliable way to fix all four batches at once.

### Step-by-Step for Option A:

#### Batch 17
```
1. Open: seed_batch_17_50_villages.sql
2. Find: \"
3. Replace All with: "
4. Save
5. Import via Supabase SQL Editor
```

#### Batch 18
```
1. Open: seed_batch_18_50_villages.sql
2. Find: \"
3. Replace All with: "
4. Save
5. Import via Supabase SQL Editor
```

#### Batch 19
```
1. Open: seed_batch_19_50_villages.sql
2. Find: \"
3. Replace All with: "
4. Save
5. Import via Supabase SQL Editor
```

#### Batch 20
```
1. Open: seed_batch_20_50_villages.sql
2. Find: \"
3. Replace All with: "
4. Save
5. Import via Supabase SQL Editor
```

---

## Verification After Each Import

```sql
SELECT COUNT(*) FROM retirement_villages;
```

**Expected counts:**
- After Batch 17: 755
- After Batch 18: 805  
- After Batch 19: 855
- After Batch 20: 905 ✅

---

## Alternative: Let Me Create Full Corrected Files

If you prefer, I can generate complete corrected versions of all 4 batches, but this will take several messages due to file size limits. Let me know!

---

## Current Status

✅ Batch 13 - Ready (no fix needed)
✅ Batch 14 - Ready (no fix needed)
✅ Batch 15 - CORRECTED version created
✅ Batch 16 - CORRECTED version created
⏳ Batch 17 - Fix with Option A above
⏳ Batch 18 - Fix with Option A above
⏳ Batch 19 - Fix with Option A above
⏳ Batch 20 - Fix with Option A above
