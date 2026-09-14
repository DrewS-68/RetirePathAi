# 🔧 Google Images Scraper V2 - Unique Images Guide

## 🎯 What's Different in V2?

### Problem with V1:
- Used generic search queries: `"Adventist Care retirement village NSW"`
- Same image URL assigned to multiple villages
- **Result:** 84 duplicate URLs, 522 villages affected

### Solution in V2:
- ✅ Uses SPECIFIC village names: `"Adventist Care Yallambee retirement village Wahroonga NSW"`
- ✅ Checks if URL already exists in database BEFORE assigning
- ✅ Tracks all assigned URLs in session to prevent duplicates
- ✅ Each village gets truly UNIQUE images

---

## 📊 Current State After Duplicate Fix

After running the duplicate fix:
- **998 villages** with unique images
- **84 duplicate URLs** were removed
- **522 villages** lost their duplicate images
- **~1,349 villages** now need new images

**V2 will re-scrape these 1,349 villages with UNIQUE images only.**

---

## 🚀 Quick Start (Google Colab)

### Step 1: Open Google Colab
Go to: https://colab.research.google.com/

Click: **+ New Notebook**

### Step 2: Install Libraries (Cell 1)
```python
!pip install -q requests beautifulsoup4 pillow supabase lxml
```

Run this cell (Shift+Enter)

### Step 3: Set Credentials (Cell 2)
```python
import os
os.environ['SUPABASE_URL'] = 'https://zupxzuvlzizjnklecbvy.supabase.co'
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'your-service-role-key-here'
```

**⚠️ Replace `'your-service-role-key-here'` with your actual key!**

Run this cell (Shift+Enter)

### Step 4: Upload Scraper Code (Cell 3)

**Option A: Copy from file**
1. Open `/scrapers/GOOGLE_IMAGES_SCRAPER_V2_UNIQUE.py`
2. Copy ALL the code
3. Paste into Cell 3
4. Run the cell

**Option B: Upload file to Colab**
1. Click the 📁 folder icon in left sidebar
2. Click upload button
3. Upload `GOOGLE_IMAGES_SCRAPER_V2_UNIQUE.py`
4. In Cell 3, type:
```python
exec(open('GOOGLE_IMAGES_SCRAPER_V2_UNIQUE.py').read())
```
5. Run the cell

---

## 🧪 Test Run (Recommended)

Before processing all villages, test on 5 villages:

```python
# Test on 5 villages
scraper = UniqueGoogleImagesScraper()
villages = scraper.get_villages_needing_images(limit=5)
scraper.run_batch(villages, delay=3.0)
```

**Expected output:**
```
🔍 Loading existing image URLs from database...
✅ Loaded 998 existing image URLs
🔍 Fetching villages that need images...
✅ Found 1349 villages needing images

################################################################################
# STARTING BATCH: 5 villages
# Rate limit: 3.0 seconds between villages
################################################################################

[1/5] Village 1:
================================================================================
🏘️  Processing: Adventist Care Yallambee
================================================================================
   🔍 Search query: "Adventist Care Yallambee retirement village Wahroonga NSW"
   🌐 Searching Google Images...
   📸 Found 15 potential images
   🔍 Validating 15 candidates...
   ✅ Valid image: 1200×800px
   ✅ Valid image: 1600×900px
   💾 Saving 2 images to database...
   ✅ SUCCESS: Saved 2 unique images
```

**Verify in your app:**
1. Go to Village Directory
2. Search for the test villages
3. Check if images appear
4. Confirm they're UNIQUE (different from other villages)

---

## 🎯 Production Run - All Villages

Once testing is successful:

```python
# Process ALL villages needing images
scraper = UniqueGoogleImagesScraper()
villages = scraper.get_villages_needing_images()
scraper.run_batch(villages, delay=3.0)
```

**Expected duration:** 2-3 hours (1,349 villages × 3 seconds)

**You can also process in smaller batches:**

### Batch 1: First 100 villages
```python
scraper = UniqueGoogleImagesScraper()
villages = scraper.get_villages_needing_images(limit=100)
scraper.run_batch(villages, delay=3.0)
```

### Batch 2: Next 100 villages
```python
# Get fresh list (excludes villages that now have images)
scraper = UniqueGoogleImagesScraper()
villages = scraper.get_villages_needing_images(limit=100)
scraper.run_batch(villages, delay=3.0)
```

---

## 🎯 Target Specific Operators

### Re-scrape all Adventist Care villages:
```python
scraper = UniqueGoogleImagesScraper()
all_villages = scraper.get_villages_needing_images()
adventist_villages = [v for v in all_villages if 'Adventist Care' in v.get('name', '')]
print(f"Found {len(adventist_villages)} Adventist Care villages")
scraper.run_batch(adventist_villages, delay=3.0)
```

### Re-scrape all Blue Care villages:
```python
scraper = UniqueGoogleImagesScraper()
all_villages = scraper.get_villages_needing_images()
blue_care_villages = [v for v in all_villages if 'Blue Care' in v.get('name', '')]
print(f"Found {len(blue_care_villages)} Blue Care villages")
scraper.run_batch(blue_care_villages, delay=3.0)
```

### Re-scrape by state (e.g., NSW):
```python
scraper = UniqueGoogleImagesScraper()
all_villages = scraper.get_villages_needing_images()
nsw_villages = [v for v in all_villages if v.get('state') == 'NSW']
print(f"Found {len(nsw_villages)} NSW villages")
scraper.run_batch(nsw_villages, delay=3.0)
```

---

## 📊 Expected Results

### Success Rate Estimates:
- **Major operators with good websites:** 70-80%
- **Medium operators:** 50-60%
- **Small/regional operators:** 30-40%
- **Overall expected:** 50-60%

### After Full Run:
- **Starting:** 998 villages with unique images
- **Expected additions:** 675-810 villages (50-60% of 1,349)
- **Final total:** 1,673-1,808 villages with images
- **Final coverage:** 71-77%

---

## 🔍 Understanding the V2 Improvements

### Search Query Comparison:

**V1 (Generic):**
```
"Adventist Care retirement village NSW"
```
**Problem:** Returns generic Adventist Care website images

**V2 (Specific):**
```
"Adventist Care Yallambee retirement village Wahroonga NSW"
```
**Solution:** Returns images specific to that exact village

### URL Uniqueness Validation:

**V1:** No validation
```python
images = validate_images(found_urls)
save_to_database(images)  # Same URL could be saved to multiple villages
```

**V2:** Triple validation
```python
# 1. Load all existing URLs from database
existing_urls = load_all_image_urls_from_database()

# 2. Check before validation (fast)
if url in existing_urls:
    skip_this_url()

# 3. Track assignments in this session
session_assigned_urls = set()
if url in session_assigned_urls:
    skip_this_url()

# 4. Mark as assigned immediately
session_assigned_urls.add(url)
existing_urls.add(url)
```

---

## 📈 Monitoring Progress

### Check statistics during run:
The scraper prints real-time stats:
```
📊 BATCH COMPLETE - STATISTICS
================================================================================
Attempted:              100
✅ Successful:          62
❌ Failed:              38
⏭️  Duplicate URLs:      15
⏭️  Low quality:         45
⚠️  No results:          12
📈 Success rate:        62.0%
🎯 Unique URLs added:   248
================================================================================
```

### Check coverage in database:
```python
from supabase import create_client
import os

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

# Count villages with images
result = supabase.table('retirement_villages').select('id, images').eq('status', 'approved').execute()
total = len(result.data)
with_images = len([v for v in result.data if v.get('images') and len(v['images']) > 0])

print(f"Coverage: {with_images}/{total} = {with_images/total*100:.1f}%")
```

---

## ⚠️ Troubleshooting

### Issue: Google Rate Limiting
**Symptoms:** Many "Google returned status 403" errors

**Solution:** Increase delay
```python
scraper.run_batch(villages, delay=5.0)  # or 10.0
```

### Issue: Low Success Rate (<30%)
**Cause:** Some villages genuinely don't have online images

**Action:** 
- Continue with other batches
- Focus on major operators first
- Manual upload for priority villages

### Issue: Colab Session Timeout
**Solution:** Process in smaller batches (50 villages at a time)
```python
scraper = UniqueGoogleImagesScraper()
villages = scraper.get_villages_needing_images(limit=50)
scraper.run_batch(villages, delay=3.0)
```

### Issue: "No images found" for many villages
**Cause:** Village might have limited online presence

**Check:** Manual Google search for that village to verify

---

## 🎯 Recommended Execution Plan

### Phase 1: Test (5 minutes)
```python
scraper = UniqueGoogleImagesScraper()
villages = scraper.get_villages_needing_images(limit=5)
scraper.run_batch(villages, delay=3.0)
```
**Verify in app before continuing.**

### Phase 2: Major Operators First (30-45 minutes)
```python
scraper = UniqueGoogleImagesScraper()
all_villages = scraper.get_villages_needing_images()

# Target operators that had duplicates
priority_operators = ['Adventist Care', 'Blue Care', 'Uniting', 'BaptistCare', 'Presbyterian']
priority_villages = [
    v for v in all_villages 
    if any(op in v.get('name', '') for op in priority_operators)
]

print(f"Processing {len(priority_villages)} priority villages")
scraper.run_batch(priority_villages, delay=3.0)
```

### Phase 3: All Remaining Villages (2-3 hours)
```python
# Get updated list (excludes villages that now have images)
scraper = UniqueGoogleImagesScraper()
remaining_villages = scraper.get_villages_needing_images()
print(f"Processing {len(remaining_villages)} remaining villages")
scraper.run_batch(remaining_villages, delay=3.0)
```

---

## ✅ Success Checklist

- [ ] V1 duplicates removed (522 villages cleaned)
- [ ] V2 scraper tested on 5 villages
- [ ] Test images verified as unique in app
- [ ] Priority operators re-scraped (Adventist, Blue Care, etc.)
- [ ] Priority images verified in app
- [ ] Full production run completed
- [ ] Final coverage check (target: 70%+)
- [ ] Sample villages manually verified
- [ ] No more duplicate URLs found

---

## 🎉 Expected Final Results

### Before V2:
- **998 villages** with images (some may have duplicates)
- **42.4% coverage**

### After V2:
- **1,673-1,808 villages** with UNIQUE images
- **71-77% coverage**
- **All images are unique** (no duplicates)
- **Village-specific images** (not generic operator photos)

---

## 📞 Next Steps After Completion

1. **Verify results** in Village Directory
2. **Check specific villages** that had duplicates
3. **Manual upload** for high-priority villages that still failed
4. **Document coverage** by state and operator
5. **Ready for launch!** 🚀

---

## 🚀 Ready to Run?

Open Google Colab and start with the test run:

```python
# 1. Install libraries
!pip install -q requests beautifulsoup4 pillow supabase lxml

# 2. Set credentials
import os
os.environ['SUPABASE_URL'] = 'https://zupxzuvlzizjnklecbvy.supabase.co'
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'your-key-here'

# 3. Load scraper (paste entire GOOGLE_IMAGES_SCRAPER_V2_UNIQUE.py)
# ... paste code here ...

# 4. TEST RUN (5 villages)
scraper = UniqueGoogleImagesScraper()
villages = scraper.get_villages_needing_images(limit=5)
scraper.run_batch(villages, delay=3.0)
```

**Good luck! You've got this! 🎉**
