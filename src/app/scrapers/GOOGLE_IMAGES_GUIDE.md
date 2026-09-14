# Google Images Scraper - Complete Guide

## 🎯 Overview

This is **Option 2** - the Google Images scraper designed to find images for the 763 villages that failed website scraping. This scraper searches Google Images directly and can potentially add images to another 400-500 villages.

## 📊 Current Situation

- **Total villages**: 2,351
- **Villages with images** (after website scraping): 237 (10%)
- **Failed villages**: 763 (need Google Images scraping)
- **Target**: Add images to 50-70% of failed villages (380-535 villages)
- **Final expected coverage**: 60-70% of all villages

## 🔧 How It Works

The Google Images scraper:

1. **Builds smart search queries** like "Stockland Kirrawee retirement village NSW"
2. **Searches Google Images** with filters for large images only
3. **Extracts image URLs** from Google search results
4. **Verifies image quality** (minimum 800x500 pixels)
5. **Updates your database** with 4-6 high-quality images per village
6. **Handles failures gracefully** and exports failed villages for retry

## ⚡ Quick Start (5 Minutes)

### Step 1: Open Google Colab
Go to: https://colab.research.google.com/

### Step 2: Create New Notebook
Click: **File → New Notebook**

### Step 3: Install Dependencies
Paste this in the first cell and run it:

```python
!pip install requests beautifulsoup4 pillow supabase lxml
```

### Step 4: Set Your Credentials
Create a new cell and paste (REPLACE WITH YOUR REAL CREDENTIALS):

```python
import os
os.environ['SUPABASE_URL'] = 'https://YOUR-PROJECT-ID.supabase.co'
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

**Where to get credentials:**
1. Go to your Supabase Dashboard
2. Click **Settings** → **API**
3. Copy **Project URL** (for SUPABASE_URL)
4. Copy **service_role secret** key (NOT the anon key!)

### Step 5: Upload the CSV File
1. Click the **folder icon** 📁 in the left sidebar
2. Click the **upload button**
3. Upload your `failed_villages_20251211_102517.csv` file

### Step 6: Copy the Scraper Code
1. Open `/scrapers/GOOGLE_IMAGES_SCRAPER.py` 
2. Copy the ENTIRE file
3. Paste into a new cell in Colab
4. Run the cell (this loads the class)

### Step 7: Run a Test
Create a new cell and test with 5 villages:

```python
# Test with 5 villages
scraper = GoogleImagesVillageScraper()
villages = scraper.get_villages_from_database(limit=5)
scraper.scrape_batch(villages, delay=3.0)
```

✅ If this works, you're ready to scale up!

## 🚀 Production Run - Process All 763 Failed Villages

### Recommended: Batch Processing

Process your 763 failed villages in batches of 50:

```python
import time

# Create scraper
scraper = GoogleImagesVillageScraper()

# Load all villages from CSV
csv_villages = scraper.load_villages_from_csv('failed_villages_20251211_102517.csv')
print(f"Total villages in CSV: {len(csv_villages)}")

# Get village IDs
village_ids = [v['id'] for v in csv_villages if 'id' in v]

# Fetch from database (to get current state)
all_villages = scraper.get_villages_from_database(village_ids=village_ids)
print(f"Villages still needing images: {len(all_villages)}")

# Process in batches of 50
batch_size = 50
total_batches = (len(all_villages) + batch_size - 1) // batch_size

for batch_num in range(total_batches):
    start_idx = batch_num * batch_size
    end_idx = min(start_idx + batch_size, len(all_villages))
    batch = all_villages[start_idx:end_idx]
    
    print(f"\n\n{'#'*80}")
    print(f"# BATCH {batch_num + 1}/{total_batches}")
    print(f"# Processing villages {start_idx + 1} to {end_idx}")
    print(f"{'#'*80}\n")
    
    # Create fresh scraper for each batch
    batch_scraper = GoogleImagesVillageScraper()
    batch_scraper.scrape_batch(batch, delay=3.0)
    
    # Pause between batches (avoid Google rate limiting)
    if batch_num < total_batches - 1:
        print(f"\n⏸  Pausing 30 seconds before next batch...")
        time.sleep(30)

print("\n\n🎉 ALL BATCHES COMPLETE!")
```

### Expected Timeline

- **763 villages** at 3 seconds per village = ~2,290 seconds = **~38 minutes**
- **Plus batch delays** (30 seconds × 15 batches) = 7.5 minutes
- **Total time**: ~45-50 minutes

### Expected Results

- **Success rate**: 50-70% (380-535 villages)
- **Average images per success**: 4-6 images
- **Total new images**: 1,500-3,200 images

## 📋 Alternative Strategies

### Strategy 1: Process by State
Good for testing or if you want to focus on specific regions first:

```python
# Process NSW first
scraper = GoogleImagesVillageScraper()
nsw_villages = scraper.get_villages_from_database(state='NSW', limit=100)
scraper.scrape_batch(nsw_villages, delay=3.0)
```

### Strategy 2: Process by Operator
Good if certain operators have better Google Images coverage:

```python
# Process Stockland villages
scraper = GoogleImagesVillageScraper()
stockland_villages = scraper.get_villages_from_database(operator='Stockland')
scraper.scrape_batch(stockland_villages, delay=3.0)
```

### Strategy 3: Process Top 100 First
Get quick wins with most popular villages:

```python
scraper = GoogleImagesVillageScraper()
villages = scraper.get_villages_from_database(limit=100)
scraper.scrape_batch(villages, delay=3.0)
```

## 🔍 Monitoring Progress

### Check Current Coverage

Run this anytime to see your progress:

```python
from supabase import create_client
import os

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

# Get all approved villages
all_villages = supabase.table('retirement_villages').select('id, name, images, state').eq('status', 'approved').execute()

total = len(all_villages.data)
with_images = len([v for v in all_villages.data if v.get('images') and len(v.get('images', [])) > 0])

print(f"\n{'='*60}")
print("IMAGE COVERAGE STATISTICS")
print(f"{'='*60}")
print(f"Total approved villages: {total}")
print(f"Villages with images:    {with_images}")
print(f"Coverage:                {with_images/total*100:.1f}%")
print(f"Still need images:       {total - with_images}")
print(f"{'='*60}\n")
```

### Check Coverage by State

```python
states = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT']

for state in states:
    state_villages = supabase.table('retirement_villages').select('id, images').eq('status', 'approved').eq('state', state).execute()
    
    total = len(state_villages.data)
    with_images = len([v for v in state_villages.data if v.get('images') and len(v.get('images', [])) > 0])
    
    print(f"{state}: {with_images}/{total} ({with_images/total*100:.0f}%)")
```

## ⚠️ Important Notes

### Rate Limiting
- **Google may rate limit** if you scrape too fast
- **Use delay=3.0** minimum (3 seconds between villages)
- **If blocked**: Increase to delay=5.0 or delay=10.0
- **Process in batches**: Don't run all 763 at once

### Success Rate Expectations
- **Best case**: 70% success (535 villages)
- **Expected**: 50-60% success (380-460 villages)
- **Worst case**: 40% success (305 villages)

Some villages genuinely don't have online images:
- Very small operators
- Recently opened villages
- Private/family-run facilities
- Regional/remote locations

### Image Quality
The scraper filters for:
- ✅ Minimum 800×500 pixels
- ✅ Valid image formats (JPG, PNG, WebP)
- ❌ Excludes logos, icons, banners
- ❌ Excludes social media images
- ❌ Excludes advertisements

### Failed Villages
If villages still fail after Google Images scraping:
1. Export the failed villages CSV
2. These may need manual image addition
3. Or can be left without images (showing placeholder)

## 🎯 After Completion

### Export Failed Villages
```python
scraper.export_failed_villages_csv('failed_after_google_scrape.csv')
```

### Calculate Final Stats
```python
# Your final coverage statistics
initial_coverage = 237  # from website scraping
google_successes = scraper.stats['successful']
total_with_images = initial_coverage + google_successes
total_villages = 2351

print(f"\n{'='*60}")
print("FINAL RETIREPATH IMAGE COVERAGE")
print(f"{'='*60}")
print(f"Initial (website scraping):  {initial_coverage} villages")
print(f"Added (Google scraping):     {google_successes} villages")
print(f"Total villages with images:  {total_with_images} villages")
print(f"Total villages in database:  {total_villages} villages")
print(f"Final coverage:              {total_with_images/total_villages*100:.1f}%")
print(f"{'='*60}\n")
```

## 🛠️ Troubleshooting

### "No images found on Google"
**Cause**: Village doesn't have online images or search query isn't effective  
**Solution**: Normal - some villages genuinely have no images

### "Google returned status 403" or "429"
**Cause**: Google rate limiting  
**Solution**: Increase delay to 5-10 seconds, pause for 5 minutes, then resume

### "Database update failed"
**Cause**: Supabase connection issue  
**Solution**: Check credentials, check internet connection

### Images are low quality
**Cause**: Google returned smaller images than expected  
**Solution**: Scraper already filters for 800×500 minimum - this is expected

### Colab session timeout
**Cause**: Google Colab free tier has runtime limits  
**Solution**: Run in batches, save progress, resume with new session

## 📈 Expected Final Results

After completing both website scraping AND Google Images scraping:

| Metric | Value |
|--------|-------|
| **Total villages** | 2,351 |
| **Villages with images** | 620-770 |
| **Final coverage** | 26-33% |
| **Total images in database** | 2,500-4,500 |

This is a **realistic target** for automated scraping. Remaining villages can:
- Show placeholder images
- Be manually added over time
- Request images from operators
- Use street view/map images

## 🎉 Success Criteria

You've succeeded if:
- ✅ 50%+ of the 763 failed villages now have images
- ✅ Overall coverage reaches 25-30%
- ✅ No duplicate/incorrect images
- ✅ All images meet quality standards (800×500+)
- ✅ Database updates are successful

## 📞 Next Steps After Google Scraping

1. **Check coverage** - Run coverage statistics
2. **Export failures** - Save villages that still failed
3. **Manual review** - Spot check some villages for image quality
4. **Plan Option 3** (if needed) - Street View API, operator outreach, or accept current coverage

Good luck! 🚀
