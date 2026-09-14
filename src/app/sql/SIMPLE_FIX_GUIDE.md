# ⚡ SIMPLEST FIX - 60 Seconds Total

## The Problem
Batches 17-20 have `\"` in JSON which causes PostgreSQL errors.

## The Solution  
Replace `\"` with `"` in each file

## How To Fix (Choose One Method)

### Method 1: Text Editor (Recommended - 60 seconds)
For each file (17, 18, 19, 20):
1. Open the file
2. CTRL+H (or CMD+H on Mac)  
3. Find: `\"`
4. Replace: `"`
5. Replace All
6. Save
7. Done!

### Method 2: Command Line (Mac/Linux - 10 seconds)
```bash
cd sql/

# Fix all at once
sed -i '' 's/\\"/"/g' seed_batch_17_50_villages.sql
sed -i '' 's/\\"/"/g' seed_batch_18_50_villages.sql  
sed -i '' 's/\\"/"/g' seed_batch_19_50_villages.sql
sed -i '' 's/\\"/"/g' seed_batch_20_50_villages.sql
```

### Method 3: Online Tool  
1. Go to https://www.textfixer.com/tools/remove-text.php
2. Paste file contents
3. Find/Replace `\"` with `"`
4. Copy result
5. Save as new file

## Then Import As Normal

```
Supabase → SQL Editor → Paste Fixed File → Run
```

---

## OR - I Can Generate Corrected Files

If these methods don't work for you, let me know and I'll create complete corrected versions of all 4 files for you (will take a few minutes due to size).

What would you prefer?
