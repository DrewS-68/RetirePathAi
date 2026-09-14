# 🚀 Google Colab Instructions for Chromebook Users

## ⚠️ HAVING TROUBLE COPYING FILES?

**👉 USE THIS INSTEAD:** `/scrapers/COLAB_CODE_CHUNKS.md`

That file breaks the code into 8 small chunks that are EASY to copy-paste one at a time!

**Much easier than copying one big file!**

---

## 📋 What You Need Before Starting

1. ✅ Your Supabase credentials (see below)
2. ✅ Google Chrome browser
3. ✅ 30 minutes of time

---

## 🔑 STEP 0: Get Your Supabase Credentials FIRST

**Before you start, get these two things:**

1. **Go to:** https://app.supabase.com
2. **Click** your RetirePath project
3. **Click** "Settings" (bottom left sidebar)
4. **Click** "API"

**You'll see this page - copy TWO things:**

### A) Project URL
Look for "Project URL" - it looks like:
```
https://abcdefghijk.supabase.co
```
**Copy this entire URL!**

### B) service_role key
Scroll down to "Project API keys"

You'll see TWO keys:
- `anon` `public` ← DON'T use this one ❌
- `service_role` `secret` ← USE THIS ONE ✅

**Click "Reveal"** next to `service_role`

Copy the LONG key that starts with `eyJ...`

**Example:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTYyNjI3ODQwMCwiZXhwIjoxOTQxODU0NDAwfQ.abcdefghijk1234567890
```

**Save both of these somewhere!** (Notepad, sticky note, etc.)

---

## 🌐 STEP 1: Open Google Colab

1. **Go to:** https://colab.research.google.com
2. **Sign in** with your Google account
3. **Click:** File → New Notebook

**You should see a blank notebook with one empty cell**

---

## 📦 STEP 2: Install Dependencies

**In the first cell, copy and paste this:**

```python
!pip install requests beautifulsoup4 pillow supabase lxml
```

**Click the Play button (▶️)** on the left side of the cell

**Wait 1-2 minutes** while it installs packages. You'll see lots of text scrolling.

**When done, you'll see:** ✓ (green checkmark)

---

## 🔐 STEP 3: Set Your Credentials

**Click "+ Code"** to add a new cell below

**Copy and paste this:**

```python
import os

# REPLACE THESE WITH YOUR ACTUAL CREDENTIALS!
os.environ['SUPABASE_URL'] = 'https://YOUR-PROJECT-ID.supabase.co'
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

print("✓ Credentials set!")
```

**⚠️ IMPORTANT:** Replace the two values with YOUR credentials from Step 0!

**It should look like:**
```python
import os

os.environ['SUPABASE_URL'] = 'https://abcdefghijk.supabase.co'
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTYyNjI3ODQwMCwiZXhwIjoxOTQxODU0NDAwfQ.abcdefghijk1234567890'

print("✓ Credentials set!")
```

**Click the Play button (▶️)**

**You should see:** `✓ Credentials set!`

---

## 🎯 STEP 4: Copy the Scraper Code

**Now you need to get the scraper code into Colab.**

### Option A: Copy-Paste (EASIEST)

1. **On your Chromebook, open the RetirePath project folder**
2. **Navigate to:** `/scrapers/COLAB_SCRAPER.py`
3. **Open it** in a text editor
4. **Select ALL the code** (Ctrl+A or Cmd+A)
5. **Copy it** (Ctrl+C or Cmd+C)
6. **In Google Colab, click "+ Code"** to add a new cell
7. **Paste the code** (Ctrl+V or Cmd+V)
8. **Click the Play button (▶️)**

**You should see:** (nothing - it just defines the scraper class)

### Option B: Upload File

1. **Click the folder icon** 📁 on the left sidebar in Colab
2. **Click the upload button** ⬆️ at the top
3. **Upload** `COLAB_SCRAPER.py` from your Chromebook
4. **In a new code cell, type:**
   ```python
   %run COLAB_SCRAPER.py
   ```
5. **Click Play (▶️)**

---

## 🚀 STEP 5: Run the Scraper!

**Click "+ Code"** to add a new cell

**Choose ONE option below:**

### Option A: Test Run (5 villages - 5 minutes) ⭐ START HERE

```python
scraper = VillageImageScraperColab()
scraper.scrape(limit=5, delay=2.0)
```

**This scrapes just 5 villages to test if everything works!**

### Option B: Scrape Specific Operator (10-30 minutes)

```python
scraper = VillageImageScraperColab()
scraper.scrape(operator='Stockland', delay=2.0)
```

**Replace 'Stockland' with any operator name**

### Option C: Scrape Specific State (30-60 minutes)

```python
scraper = VillageImageScraperColab()
scraper.scrape(state='NSW', limit=50, delay=2.0)
```

**Replace 'NSW' with: VIC, QLD, SA, WA, TAS, ACT, NT**

### Option D: Scrape ALL Top Operators (1-2 hours) ⭐ RECOMMENDED

```python
TOP_OPERATORS = ['Stockland', 'Aveo', 'Lendlease', 'Ingenia', 'Keyton', 
                 'Living Choice', 'Uniting', 'Anglicare', 'The Whiddon Group']

for operator in TOP_OPERATORS:
    print(f"\n\n{'#'*80}")
    print(f"# SCRAPING: {operator}")
    print(f"{'#'*80}\n")
    scraper = VillageImageScraperColab()
    scraper.scrape(operator=operator, delay=2.0)
    print(f"\nCompleted {operator}. Moving to next...\n")

print("\n🎉 ALL TOP OPERATORS COMPLETE!")
```

**This scrapes ~500-600 villages from major operators**

---

## ✅ STEP 6: Verify It Worked!

**In a new cell, paste this:**

```python
from supabase import create_client
import os

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

# Get statistics
response = supabase.table('retirement_villages')\
    .select('id, images')\
    .eq('status', 'approved')\
    .execute()

total = len(response.data)
with_images = len([v for v in response.data if v.get('images') and len(v['images']) > 0])

print(f"\n{'='*60}")
print(f"COVERAGE STATISTICS")
print(f"{'='*60}")
print(f"Total villages:        {total}")
print(f"Villages with images:  {with_images}")
print(f"Coverage:              {with_images/total*100:.1f}%")
print(f"Still need images:     {total - with_images}")
print(f"{'='*60}\n")
```

**Click Play (▶️)**

**You'll see something like:**
```
============================================================
COVERAGE STATISTICS
============================================================
Total villages:        2351
Villages with images:  568
Coverage:              24.2%
Still need images:     1783
============================================================
```

---

## 🎬 What You'll See While Scraping

```
================================================================================
FETCHING VILLAGES FROM DATABASE
================================================================================
✓ Found 50 villages without images

================================================================================
SCRAPING 50 VILLAGES
================================================================================

[1/50] Sunshine Retirement Village (VIC)
  Visiting: https://sunshinevillage.com.au
  Found 18 potential images
  ✓ Verified 5 high-quality images
  ✓ SUCCESS - Added 5 images
  Waiting 2s...

[2/50] Ocean View Retirement Living (NSW)
  Visiting: https://oceanview.com.au
  Found 12 potential images
  ✓ Verified 6 high-quality images
  ✓ SUCCESS - Added 6 images
  Waiting 2s...

...

================================================================================
SCRAPING COMPLETE - SUMMARY
================================================================================
Villages processed:  50
Successful updates:  38 (76.0%)
Failed:              12
Total images added:  187
Avg images/village:  4.9
================================================================================
```

**This is normal!** Not all villages will have images - 60-70% success rate is expected.

---

## 📊 Check Your RetirePath App

1. **Open your RetirePath app** in another browser tab
2. **Navigate to:** Village Directory
3. **You should see:** Real images instead of blue placeholders! 🎉

---

## ⚠️ Important Notes

### Keep Browser Open
- Don't close the Colab tab while scraping
- Don't close your Chromebook lid
- Keep it plugged in if possible

### Session Timeout
- Google Colab sessions end after 12 hours of inactivity
- If timeout happens, just restart from Step 5
- The scraper skips villages that already have images

### Run in Chunks
Instead of running all 2,351 villages at once, run in chunks:

**Day 1:** Top operators (Option D) → ~500 villages
**Day 2:** NSW by state → Another 200-300 villages  
**Day 3:** VIC by state → Another 200-300 villages

**Result:** 60-70% coverage over a few days!

---

## 🐛 Troubleshooting

### "Missing credentials" error
- Go back to Step 3
- Make sure you REPLACED the example credentials with YOUR actual credentials
- Run that cell again

### "No module named 'requests'" error
- Go back to Step 2
- Run the pip install cell again
- Wait for it to complete

### "No villages found" error
- Your database might already have images!
- Run Step 6 (verify) to check coverage

### Scraper finds no images for many villages
- **This is normal!** 30-40% of village websites don't have extractable images
- Expected success rate: 60-70%

---

## 🎯 Recommended Workflow

### First Time (Today)
1. Complete Steps 1-4 (setup - 10 minutes)
2. Run Option A (test 5 villages - 5 minutes)
3. Run Step 6 (verify it worked)
4. If working, run Option D (top operators - 1-2 hours)

### Tomorrow
- Run by state (NSW, VIC, QLD) - 30-60 min each
- Check coverage after each run

### Day After
- Continue with remaining states
- Target: 60-70% coverage

---

## ✅ Summary Checklist

- [ ] Got Supabase credentials (Step 0)
- [ ] Opened Google Colab (Step 1)
- [ ] Installed dependencies (Step 2)
- [ ] Set credentials (Step 3)
- [ ] Copied scraper code (Step 4)
- [ ] Ran test (5 villages)
- [ ] Verified in Supabase (Step 6)
- [ ] Ran top operators (Option D)
- [ ] Checked Village Directory for real images! 🎉

---

## 🎉 You're Done!

**Congratulations!** You've successfully set up and run the image scraper on your Chromebook using Google Colab!

**What you achieved:**
- ✅ Extracted authentic village images
- ✅ Updated your Supabase database
- ✅ Populated your Village Directory
- ✅ Moved closer to launch readiness!

**Next scraping session:** Just open your Colab notebook and run Step 5 again!

---

## 📞 Quick Reference

**To scrape more villages later:**
1. Open your Colab notebook
2. Run the credentials cell (Step 3)
3. Run the scraper code cell (Step 4)
4. Run your scraping command (Step 5)

**To check progress:**
- Run the verification cell (Step 6)
- Check your Village Directory

**Target:** 60-70% coverage (1,400-1,600 villages)

---

**Good luck! 🚀**