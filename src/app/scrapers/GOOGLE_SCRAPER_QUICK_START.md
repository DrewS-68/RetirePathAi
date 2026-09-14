# Google Images Scraper - Quick Start Guide

## 🎯 Goal
Add images to 763 failed villages using Google Images search

## ⚡ 5-Minute Setup

### 1. Open Google Colab
https://colab.research.google.com/ → **New Notebook**

### 2. Install (Cell 1)
```python
!pip install requests beautifulsoup4 pillow supabase lxml
```

### 3. Credentials (Cell 2)
```python
import os
os.environ['SUPABASE_URL'] = 'https://zupxzuvlzizjnklecbvy.supabase.co'
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'YOUR_SERVICE_ROLE_KEY_HERE'
```
Get from: **Supabase Dashboard → Settings → API**

### 4. Upload CSV (Sidebar)
Click 📁 → Upload `failed_villages_20251211_102517.csv`

### 5. Copy Scraper (Cell 3)
Copy ALL code from `/scrapers/GOOGLE_IMAGES_SCRAPER.py` → Paste → Run

### 6. Test (Cell 4)
```python
scraper = GoogleImagesVillageScraper()
villages = scraper.get_villages_from_database(limit=5)
scraper.scrape_batch(villages, delay=3.0)
```

✅ **If this works, you're ready!**

## 🚀 Production Run - All 763 Villages

### Copy & Paste This (Cell 5)

```python
import time

# Load villages from CSV
scraper = GoogleImagesVillageScraper()
csv_villages = scraper.load_villages_from_csv('failed_villages_20251211_102517.csv')

# Get IDs and fetch from database
village_ids = [v['id'] for v in csv_villages if 'id' in v]
all_villages = scraper.get_villages_from_database(village_ids=village_ids)

print(f"📊 Processing {len(all_villages)} villages in batches of 50")

# Process in batches
batch_size = 50
total_batches = (len(all_villages) + batch_size - 1) // batch_size

for batch_num in range(total_batches):
    start_idx = batch_num * batch_size
    end_idx = min(start_idx + batch_size, len(all_villages))
    batch = all_villages[start_idx:end_idx]
    
    print(f"\n{'#'*80}")
    print(f"# BATCH {batch_num + 1}/{total_batches} - Villages {start_idx + 1} to {end_idx}")
    print(f"{'#'*80}\n")
    
    batch_scraper = GoogleImagesVillageScraper()
    batch_scraper.scrape_batch(batch, delay=3.0)
    
    if batch_num < total_batches - 1:
        print(f"\n⏸  Pausing 30 seconds...")
        time.sleep(30)

print("\n🎉 COMPLETE!")
```

**Expected time:** ~45-50 minutes  
**Expected success:** 380-535 villages (50-70%)

## 📊 Check Progress Anytime

```python
from supabase import create_client
import os

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

all_villages = supabase.table('retirement_villages').select('id, images').eq('status', 'approved').execute()
total = len(all_villages.data)
with_images = len([v for v in all_villages.data if v.get('images') and len(v.get('images', [])) > 0])

print(f"📈 Coverage: {with_images}/{total} = {with_images/total*100:.1f}%")
```

## ⚠️ If Google Blocks You

**Symptoms:**
- "Google returned status 403"
- "No images found" repeatedly
- Very low success rate

**Fix:**
```python
# Increase delay to 5 seconds
scraper.scrape_batch(villages, delay=5.0)

# Or pause and resume later
# Google's rate limiting resets after ~15 minutes
```

## 📋 Alternative Quick Runs

### Just NSW (Testing)
```python
scraper = GoogleImagesVillageScraper()
villages = scraper.get_villages_from_database(state='NSW', limit=50)
scraper.scrape_batch(villages, delay=3.0)
```

### Just one operator
```python
scraper = GoogleImagesVillageScraper()
villages = scraper.get_villages_from_database(operator='Stockland')
scraper.scrape_batch(villages, delay=3.0)
```

### Top 100 villages
```python
scraper = GoogleImagesVillageScraper()
villages = scraper.get_villages_from_database(limit=100)
scraper.scrape_batch(villages, delay=3.0)
```

## 🎯 Success Looks Like

After completion:
- ✅ 380-535 new villages with images (50-70% success rate)
- ✅ 1,500-3,200 new images added
- ✅ Total coverage: ~26-33% of all villages
- ✅ Failed villages exported to CSV

## 📁 Files You Need

1. **Scraper code**: `/scrapers/GOOGLE_IMAGES_SCRAPER.py`
2. **Your CSV**: `failed_villages_20251211_102517.csv`
3. **Credentials**: Supabase URL + Service Role Key

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't find CSV file | Upload again to Colab sidebar |
| Credentials error | Check SUPABASE_URL and key are correct |
| Rate limiting | Increase delay to 5.0 or 10.0 |
| Session timeout | Run in smaller batches (25 villages) |
| Low success rate | Normal! Google coverage varies (50-70%) |

## 📞 Next Steps

After scraping completes:

1. **Check coverage** (run coverage check above)
2. **Export failures** (for manual review later)
3. **Celebrate!** 🎉 You've just added hundreds of images

## 💡 Pro Tips

- ✨ Run during off-peak hours (less rate limiting)
- ✨ Use batch processing (don't run all 763 at once)
- ✨ Increase delay if you see lots of failures
- ✨ Some villages genuinely have no online images (normal)
- ✨ Save your Colab notebook (File → Save) for future runs

---

**Ready?** Open Colab and start with Step 1! 🚀
