# Option 2: Google Images Scraper - Complete Execution Plan

## 📊 Mission Brief

**Objective**: Add images to 763 villages that failed website scraping using Google Images  
**Target Success Rate**: 50-70% (380-535 villages)  
**Expected Runtime**: 45-60 minutes  
**Expected Images Added**: 1,500-3,200 images  
**Final Coverage Goal**: 26-33% of all 2,351 villages

## 🎯 Pre-Flight Checklist

Before you start, make sure you have:

- [ ] Google account (for Colab)
- [ ] Supabase credentials (URL + Service Role Key)
- [ ] CSV file: `failed_villages_20251211_102517.csv`
- [ ] 60 minutes of uninterrupted time
- [ ] Stable internet connection
- [ ] Coffee ☕ (optional but recommended)

## 📋 Step-by-Step Execution

### Phase 1: Setup (5 minutes)

#### 1.1 Open Google Colab
- Go to: https://colab.research.google.com/
- Click: **File → New Notebook**
- Rename: "RetirePath Google Images Scraper"

#### 1.2 Install Dependencies (Cell 1)
```python
# This installs all required libraries
!pip install -q requests beautifulsoup4 pillow supabase lxml
print("✓ Dependencies installed!")
```

Click the ▶️ play button. Wait ~30 seconds.

#### 1.3 Set Credentials (Cell 2)
```python
import os

# REPLACE THESE WITH YOUR ACTUAL CREDENTIALS!
os.environ['SUPABASE_URL'] = 'https://zupxzuvlzizjnklecbvy.supabase.co'
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'paste-your-service-role-key-here'

print("✓ Credentials configured!")
```

**Where to get credentials:**
1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Select your RetirePath project
3. Go to: **Settings → API**
4. Copy **Project URL** → paste as SUPABASE_URL
5. Copy **service_role secret** → paste as SUPABASE_SERVICE_ROLE_KEY

⚠️ **Important**: Use service_role key, NOT anon key!

Run the cell (▶️).

#### 1.4 Upload CSV File
1. Click the **📁 Files** icon in left sidebar
2. Click the **↑ Upload** button
3. Select `failed_villages_20251211_102517.csv`
4. Wait for upload to complete (should be ~100KB)

✅ You should see the file appear in the file list.

#### 1.5 Load Scraper Code (Cell 3)
1. Open the file `/scrapers/GOOGLE_IMAGES_SCRAPER.py` from this project
2. Copy **THE ENTIRE FILE** (all ~600 lines)
3. Paste into a new cell in Colab
4. Run the cell (▶️)

You should see: No errors, just the code being loaded.

#### 1.6 Test Connection (Cell 4)
```python
# Quick test to verify everything works
scraper = GoogleImagesVillageScraper()
test_villages = scraper.get_villages_from_database(limit=2)
print(f"\n✓ Found {len(test_villages)} test villages")

if len(test_villages) > 0:
    print(f"✓ Sample: {test_villages[0]['name']} in {test_villages[0]['state']}")
    print("\n🎉 Setup complete! Ready to scrape!")
else:
    print("⚠️  No villages found - check your database")
```

Run this (▶️). You should see 2 villages listed.

**✅ Setup Complete!** Time to start scraping.

---

### Phase 2: Test Run (5 minutes)

Before processing all 763 villages, test with a small batch:

#### 2.1 Test with 5 Villages (Cell 5)
```python
# Test run with 5 villages
print("🧪 TEST RUN - Processing 5 villages\n")

test_scraper = GoogleImagesVillageScraper()
test_villages = test_scraper.get_villages_from_database(limit=5)
test_scraper.scrape_batch(test_villages, delay=3.0)

print("\n✅ Test complete! Check results above.")
```

Run this (▶️). Expected time: ~2 minutes.

**What to look for:**
- ✅ Google searches executing
- ✅ Images being found and verified
- ✅ Database updates succeeding
- ✅ Success rate: 50-80% (2-4 out of 5)

**If you see lots of failures:**
- Check your internet connection
- Increase delay to 5.0 seconds
- Verify Supabase credentials

**✅ If test succeeds**, proceed to production run!

---

### Phase 3: Production Run (45-60 minutes)

#### Option A: Process All 763 Villages (Recommended)

This processes all failed villages in optimal batches:

```python
# ============================================================================
# PRODUCTION RUN - ALL 763 FAILED VILLAGES
# ============================================================================
import time

print("🚀 PRODUCTION RUN - PROCESSING ALL FAILED VILLAGES")
print("="*80)

# Load villages from CSV
main_scraper = GoogleImagesVillageScraper()
csv_villages = main_scraper.load_villages_from_csv('failed_villages_20251211_102517.csv')

print(f"\n📊 Loaded {len(csv_villages)} villages from CSV")

# Get village IDs
village_ids = [v['id'] for v in csv_villages if v.get('id')]
print(f"📊 Extracted {len(village_ids)} village IDs")

# Fetch current state from database
all_db_villages = main_scraper.get_villages_from_database(village_ids=village_ids)
print(f"📊 {len(all_db_villages)} villages still need images\n")

# Process in batches of 50
batch_size = 50
total_batches = (len(all_db_villages) + batch_size - 1) // batch_size

print(f"🎯 Will process {total_batches} batches of {batch_size} villages")
print(f"⏱️  Estimated time: {total_batches * 3 + (total_batches - 1) * 0.5:.0f} minutes")
print("="*80 + "\n")

# Track overall stats
overall_stats = {
    'total_processed': 0,
    'total_successful': 0,
    'total_failed': 0,
    'total_images': 0
}

# Process each batch
for batch_num in range(total_batches):
    start_idx = batch_num * batch_size
    end_idx = min(start_idx + batch_size, len(all_db_villages))
    batch = all_db_villages[start_idx:end_idx]
    
    print(f"\n{'#'*80}")
    print(f"# BATCH {batch_num + 1}/{total_batches}")
    print(f"# Processing villages {start_idx + 1} to {end_idx} ({len(batch)} villages)")
    print(f"# Progress: {start_idx/len(all_db_villages)*100:.1f}% complete")
    print(f"{'#'*80}\n")
    
    # Create fresh scraper for each batch
    batch_scraper = GoogleImagesVillageScraper()
    batch_scraper.scrape_batch(batch, delay=3.0)
    
    # Update overall stats
    overall_stats['total_processed'] += batch_scraper.stats['processed']
    overall_stats['total_successful'] += batch_scraper.stats['successful']
    overall_stats['total_failed'] += batch_scraper.stats['failed']
    overall_stats['total_images'] += batch_scraper.stats['total_images']
    
    # Print progress
    print(f"\n📊 BATCH {batch_num + 1} COMPLETE")
    print(f"   Successful: {batch_scraper.stats['successful']}/{batch_scraper.stats['processed']}")
    print(f"   Overall progress: {overall_stats['total_processed']}/{len(all_db_villages)}")
    
    # Pause between batches (except after last batch)
    if batch_num < total_batches - 1:
        print(f"\n⏸️  Pausing 30 seconds before next batch...")
        time.sleep(30)

# Final summary
print(f"\n\n{'='*80}")
print("🎉 ALL BATCHES COMPLETE - FINAL SUMMARY")
print(f"{'='*80}")
print(f"Total villages processed:  {overall_stats['total_processed']}")
print(f"Successful updates:        {overall_stats['total_successful']} ({overall_stats['total_successful']/overall_stats['total_processed']*100:.1f}%)")
print(f"Failed:                    {overall_stats['total_failed']}")
print(f"Total images added:        {overall_stats['total_images']}")
print(f"Average images/village:    {overall_stats['total_images']/max(overall_stats['total_successful'], 1):.1f}")
print(f"{'='*80}\n")

print("✅ Google Images scraping complete!")
print("📊 Run coverage check to see final statistics")
```

**Expected output:**
- 15-16 batches of 50 villages each
- ~50-70% success rate per batch
- Total runtime: 45-60 minutes
- 380-535 villages updated successfully

#### Option B: Process by Priority (Alternative)

If you want to prioritize large operators first:

```python
# Load CSV processor
# (First copy CSV_PROCESSOR.py code into a cell and run it)

processor = FailedVillageCSVProcessor('failed_villages_20251211_102517.csv')
priorities = processor.get_villages_by_priority()

# Process HIGH priority first (large operators)
print("🎯 PROCESSING HIGH PRIORITY VILLAGES")
high_ids = [v['id'] for v in priorities['high'] if v.get('id')]
high_scraper = GoogleImagesVillageScraper()
high_db = high_scraper.get_villages_from_database(village_ids=high_ids)
high_scraper.scrape_batch(high_db, delay=3.0)

# Then medium priority
print("\n🎯 PROCESSING MEDIUM PRIORITY VILLAGES")
medium_ids = [v['id'] for v in priorities['medium'] if v.get('id')]
medium_scraper = GoogleImagesVillageScraper()
medium_db = medium_scraper.get_villages_from_database(village_ids=medium_ids)
medium_scraper.scrape_batch(medium_db, delay=3.0)

# Finally low priority
print("\n🎯 PROCESSING LOW PRIORITY VILLAGES")
low_ids = [v['id'] for v in priorities['low'] if v.get('id')]
low_scraper = GoogleImagesVillageScraper()
low_db = low_scraper.get_villages_from_database(village_ids=low_ids)
low_scraper.scrape_batch(low_db, delay=3.0)
```

---

### Phase 4: Verification (5 minutes)

#### 4.1 Check Overall Coverage
```python
# Check final coverage statistics
from supabase import create_client
import os

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

# Get all approved villages
all_villages = supabase.table('retirement_villages')\
    .select('id, name, images, state, operator')\
    .eq('status', 'approved')\
    .execute()

total = len(all_villages.data)
with_images = len([v for v in all_villages.data 
                   if v.get('images') and len(v.get('images', [])) > 0])
total_images = sum(len(v.get('images', [])) for v in all_villages.data)

print(f"\n{'='*80}")
print("📊 FINAL RETIREPATH IMAGE COVERAGE")
print(f"{'='*80}")
print(f"Total approved villages:     {total:,}")
print(f"Villages with images:        {with_images:,} ({with_images/total*100:.1f}%)")
print(f"Villages without images:     {total - with_images:,}")
print(f"Total images in database:    {total_images:,}")
print(f"Average images per village:  {total_images/with_images:.1f}")
print(f"{'='*80}\n")

# Before Google scraping you had: 237 villages (10%)
# Expected after: 620-770 villages (26-33%)
improvement = with_images - 237
print(f"✨ Improvement from Google scraping: +{improvement} villages")
print(f"✨ New images added: ~{improvement * 4}-{improvement * 6}")
```

#### 4.2 Check Coverage by State
```python
# See how each state is doing
states = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT']

print(f"\n{'='*60}")
print("📊 COVERAGE BY STATE")
print(f"{'='*60}")
print(f"{'State':<6} {'Total':<8} {'With Images':<14} {'Coverage':<10}")
print("-" * 60)

for state in states:
    state_villages = [v for v in all_villages.data if v.get('state') == state]
    total_state = len(state_villages)
    with_images_state = len([v for v in state_villages 
                             if v.get('images') and len(v.get('images', [])) > 0])
    
    if total_state > 0:
        coverage = with_images_state / total_state * 100
        print(f"{state:<6} {total_state:<8} {with_images_state:<14} {coverage:>6.1f}%")

print(f"{'='*60}\n")
```

#### 4.3 Sample Quality Check
```python
# Check a few random villages to verify image quality
import random

villages_with_images = [v for v in all_villages.data 
                       if v.get('images') and len(v.get('images', [])) > 0]

sample = random.sample(villages_with_images, min(5, len(villages_with_images)))

print(f"\n{'='*80}")
print("🔍 SAMPLE QUALITY CHECK (Random 5 villages)")
print(f"{'='*80}\n")

for i, village in enumerate(sample, 1):
    print(f"{i}. {village['name']} ({village['state']})")
    print(f"   Operator: {village.get('operator', 'N/A')}")
    print(f"   Images: {len(village.get('images', []))} images")
    
    # Show first image URL
    if village.get('images'):
        print(f"   Sample: {village['images'][0][:80]}...")
    print()

print("✅ Manually check these villages in your app to verify image quality")
```

---

### Phase 5: Export Results (2 minutes)

#### 5.1 Export Final Statistics
```python
# Create summary report
summary = f"""
RETIREPATH GOOGLE IMAGES SCRAPING - FINAL REPORT
{'='*80}

Date: {time.strftime('%Y-%m-%d %H:%M:%S')}

INITIAL STATE (Before Google Scraping):
- Total villages: 2,351
- Villages with images: 237 (10.1%)
- Villages without images: 2,114

GOOGLE SCRAPING RESULTS:
- Villages processed: {overall_stats['total_processed']}
- Successful updates: {overall_stats['total_successful']} ({overall_stats['total_successful']/overall_stats['total_processed']*100:.1f}%)
- Failed: {overall_stats['total_failed']}
- New images added: {overall_stats['total_images']}

FINAL STATE (After Google Scraping):
- Total villages: {total}
- Villages with images: {with_images} ({with_images/total*100:.1f}%)
- Villages without images: {total - with_images}
- Total images: {total_images}

IMPROVEMENT:
- Additional villages with images: +{with_images - 237}
- Coverage improvement: +{(with_images/total - 237/total)*100:.1f} percentage points
- Success rate: {(with_images - 237)/overall_stats['total_processed']*100:.1f}%

NEXT STEPS:
- Review sample villages for quality
- Consider manual addition for high-value villages without images
- Update village profiles are now 3x more complete
- Ready for production launch!
"""

print(summary)

# Save to file
with open('scraping_summary_report.txt', 'w') as f:
    f.write(summary)

print("\n✅ Report saved to: scraping_summary_report.txt")
```

#### 5.2 Download Report
In Colab:
1. Click the **📁 Files** icon
2. Find `scraping_summary_report.txt`
3. Click **⋮** (three dots) → **Download**

---

## 🎯 Success Criteria

Your scraping is successful if:

- ✅ **Success rate 50%+**: At least 380 of 763 villages got images
- ✅ **Coverage 25%+**: At least 25% of all villages now have images
- ✅ **Quality**: Images are 800×500+ pixels, relevant to villages
- ✅ **No errors**: Database updates worked without issues
- ✅ **Completion**: All 763 villages were attempted

## ⚠️ Troubleshooting

### Issue: Google Rate Limiting

**Symptoms:**
- Many "Google returned status 403" errors
- Very low success rate (<30%)
- "No images found" repeatedly

**Solution:**
```python
# Increase delay between villages
scraper.scrape_batch(villages, delay=5.0)  # or even 10.0

# Pause for 15 minutes, then resume
import time
print("⏸️  Pausing for 15 minutes...")
time.sleep(900)
```

### Issue: Colab Session Timeout

**Symptoms:**
- "Runtime disconnected" message
- Lost all progress mid-run

**Solution:**
- Run in smaller batches (25 villages)
- Save progress after each batch
- Keep Colab tab active (click occasionally)

### Issue: Low Success Rate

**Symptoms:**
- Only 20-30% success rate

**Explanation:**
- Some villages genuinely don't have online images
- Small operators, regional locations, new villages
- This is normal - don't worry!

**Action:**
- Continue with what you have
- 50-60% is realistic target

### Issue: Database Update Fails

**Symptoms:**
- "Database update failed" errors
- Images found but not saved

**Solution:**
```python
# Check credentials
print(os.getenv('SUPABASE_URL'))
print(os.getenv('SUPABASE_SERVICE_ROLE_KEY')[:20] + "...")

# Test connection
from supabase import create_client
supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)
test = supabase.table('retirement_villages').select('id').limit(1).execute()
print("✓ Connection works!" if test.data else "✗ Connection failed")
```

## 📞 Next Steps After Completion

1. **✅ Verify coverage** - Should be 26-33%
2. **✅ Spot check quality** - Review 10-20 random villages
3. **✅ Update documentation** - Record final statistics
4. **✅ Celebrate!** 🎉 You just added 1,500-3,200 images!
5. **💭 Decide on Option 3** - Manual curation, operator outreach, or accept current coverage

## 📈 Expected Final Results

| Metric | Before | After Google | Improvement |
|--------|--------|--------------|-------------|
| Villages with images | 237 | 620-770 | +383-533 |
| Coverage % | 10% | 26-33% | +16-23pp |
| Total images | ~950 | 2,500-4,500 | +1,550-3,550 |
| Complete profiles | 237 | 620-770 | +383-533 |

## 🎉 You're Ready!

Follow this plan step-by-step and you'll have:
- ✅ 620-770 villages with images (26-33% coverage)
- ✅ 2,500-4,500 total images in database
- ✅ Professional-looking village profiles
- ✅ Ready for production launch

**Time to start!** Open Colab and begin with Phase 1. Good luck! 🚀
