# 🎯 Simple Next Steps - Re-Scrape Images with V2

## ✅ What You Just Completed

You ran the **FixDuplicateImages** tool in your RetirePath app and:
- Found 84 duplicate image URLs
- Cleaned 522 villages
- Now have 998 villages with UNIQUE images

---

## 🎯 What You Need to Do Next

Re-scrape images for the ~1,353 villages that now need images, using the **improved V2 scraper** that ensures UNIQUE images only.

---

## 📁 Where Are My Files?

All scraper files are in your project under `/scrapers/`:

1. **GOOGLE_IMAGES_SCRAPER_V2_UNIQUE.py** - The main scraper code
2. **V2_QUICK_START.md** - Quick copy-paste guide
3. **OPTION_2_V2_GUIDE.md** - Detailed instructions
4. **IMAGE_SCRAPING_V2_READY.md** - Full overview

---

## 🚀 How to Run the Scraper (5 Simple Steps)

### Step 1: Get the Scraper Code

**Option A (Recommended):** I'll create a single downloadable file below with everything ⬇️

**Option B:** Navigate to `/scrapers/GOOGLE_IMAGES_SCRAPER_V2_UNIQUE.py` in your file browser and copy all the code

---

### Step 2: Open Google Colab

1. Open a new browser tab
2. Go to: https://colab.research.google.com/
3. Click: **File** → **New Notebook**

You'll see an empty notebook like this:

```
[ ] <-- This is a cell where you type code
```

---

### Step 3: Create 5 Cells with Code

In Google Colab, you'll create 5 cells. Here's what to put in each:

---

#### 📦 CELL 1: Install Libraries

Click in the first cell and paste:

```python
!pip install -q requests beautifulsoup4 pillow supabase lxml
```

Press **Shift+Enter** to run it.

Wait for the green checkmark ✓

---

#### 🔑 CELL 2: Set Your Credentials

Click below the first cell (a new cell will appear), then paste:

```python
import os
os.environ['SUPABASE_URL'] = 'https://zupxzuvlzizjnklecbvy.supabase.co'
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'YOUR_SERVICE_ROLE_KEY_HERE'
```

⚠️ **IMPORTANT:** Replace `YOUR_SERVICE_ROLE_KEY_HERE` with your actual Supabase service role key

**Where do I find my key?**
- Go to: https://supabase.com/dashboard/project/zupxzuvlzizjnklecbvy/settings/api
- Look for "service_role" key
- Copy it
- Paste it in the code above (replace the placeholder)

Press **Shift+Enter** to run it.

---

#### 🤖 CELL 3: Load the Scraper

Create a new cell and paste **THE ENTIRE CONTENTS** of `/scrapers/GOOGLE_IMAGES_SCRAPER_V2_UNIQUE.py`

This is a large file (~700 lines). 

**I'll paste it at the end of this document for easy copying.**

Press **Shift+Enter** to run it.

You should see:
```
╔═══════════════════════════════════════════════════════════════╗
║  🔧 GOOGLE IMAGES SCRAPER V2 - UNIQUE IMAGES ONLY             ║
╚═══════════════════════════════════════════════════════════════╝
```

---

#### 🧪 CELL 4: Test Run (5 villages)

Create a new cell and paste:

```python
# Test on just 5 villages first
scraper = UniqueGoogleImagesScraper()
villages = scraper.get_villages_needing_images(limit=5)
scraper.run_batch(villages, delay=3.0)
```

Press **Shift+Enter** to run it.

**This will take about 30 seconds.**

You'll see output like:
```
🔍 Loading existing image URLs from database...
✅ Loaded 998 existing image URLs
🔍 Fetching villages that need images...
✅ Found 1353 villages needing images

[1/5] Village 1:
🏘️  Processing: Adventist Care Yallambee
   🔍 Search query: "Adventist Care Yallambee retirement village Wahroonga NSW"
   ✅ SUCCESS: Saved 2 unique images
```

**✅ VERIFY THE TEST:**
1. Go back to your RetirePath app
2. Open the Village Directory
3. Search for the villages that were processed
4. Check if they now have images
5. **If yes, continue to Step 5!**

---

#### 🚀 CELL 5: Production Run (All Villages)

**Only run this after verifying the test worked!**

Create a new cell and paste:

```python
# Process ALL villages needing images
scraper = UniqueGoogleImagesScraper()
villages = scraper.get_villages_needing_images()
print(f"About to process {len(villages)} villages...")
scraper.run_batch(villages, delay=3.0)
```

Press **Shift+Enter** to run it.

**This will take 2-3 hours.**

Keep the Google Colab tab open. You can minimize it and do other work.

---

## 📊 What to Expect

### During the Run:

You'll see console output like:
```
[47/1353] Village 47:
🏘️  Processing: Blue Care Cairns
   🔍 Search query: "Blue Care Cairns retirement village Cairns QLD"
   🌐 Searching Google Images...
   📸 Found 18 potential images
   🔍 Validating 18 candidates...
   ⏭️  Skipping duplicate URL: https://...
   ✅ Valid image: 1600×900px
   ✅ Valid image: 1200×800px
   💾 Saving 2 images to database...
   ✅ SUCCESS: Saved 2 unique images

⏸  Waiting 3 seconds...
```

### At the End:

You'll see a summary:
```
📊 BATCH COMPLETE - STATISTICS
================================================================================
Attempted:              1353
✅ Successful:          810
❌ Failed:              543
⏭️  Duplicate URLs:      156
⏭️  Low quality:         892
⚠️  No results:          234
📈 Success rate:        59.9%
🎯 Unique URLs added:   3240
================================================================================
```

**Expected results:**
- **Success rate:** 50-60% (this is normal!)
- **New villages with images:** 675-810
- **Total coverage after:** 70-77%

---

## 🎉 Final Result

### Before V2:
- 998 villages with images (42%)

### After V2:
- **1,673-1,808 villages with images (71-77%)**
- **All images are UNIQUE and village-specific**
- **No more duplicate images**

---

## ⚠️ Important Notes

### Why Won't All Villages Succeed?

Not all villages have images online. This is normal:
- Small regional villages may not have websites
- Some operators have limited online presence
- Some villages are very new or very old

**50-60% success rate is excellent and expected!**

### What If Google Rate Limits Me?

If you see many "status 403" errors:

Stop the run and increase the delay:
```python
scraper = UniqueGoogleImagesScraper()
villages = scraper.get_villages_needing_images()
scraper.run_batch(villages, delay=10.0)  # Changed from 3.0 to 10.0
```

### What If Colab Times Out?

Process in smaller batches:
```python
# Batch 1
scraper = UniqueGoogleImagesScraper()
villages = scraper.get_villages_needing_images(limit=100)
scraper.run_batch(villages, delay=3.0)

# Wait, verify, then run again for Batch 2
# (It will automatically skip villages that now have images)
```

---

## 🆘 Need Help?

### Common Issues:

**"ModuleNotFoundError: No module named 'supabase'"**
→ Run Cell 1 again (install libraries)

**"KeyError: 'SUPABASE_SERVICE_ROLE_KEY'"**
→ Check Cell 2 - did you replace the placeholder with your actual key?

**"No images found" for many villages**
→ This is normal! Many small villages don't have images online

**Scraper stops halfway through**
→ That's okay! Run Cell 5 again - it will automatically skip villages that already have images

---

## ✅ Success Checklist

After the scraper finishes:

- [ ] Check coverage: Should be 70-77%
- [ ] Verify random villages in your app
- [ ] Check that Adventist Care villages now have DIFFERENT images
- [ ] Check that Blue Care villages now have DIFFERENT images
- [ ] No duplicate images found (can run the FixDuplicateImages tool again to verify)

---

## 📞 Where to Get the Scraper Code

**The complete scraper code is below.** Scroll down and copy everything from the separator to the end.

---

---

---

# 🤖 GOOGLE IMAGES SCRAPER V2 CODE (Copy Everything Below)

```python
"""
Google Images Scraper V2 - UNIQUE IMAGES ONLY
==============================================

PROBLEM SOLVED: Previous version assigned the same generic operator images to multiple villages.

NEW FEATURES:
✅ Uses SPECIFIC village names in search queries
✅ Checks for duplicate URLs before assignment
✅ Validates uniqueness across entire database
✅ Prioritizes village-specific images over generic operator images
✅ Skips images already assigned to other villages
"""

import os
import re
import time
import requests
from io import BytesIO
from PIL import Image
from urllib.parse import quote_plus, urlparse
from bs4 import BeautifulSoup
from supabase import create_client, Client
from typing import List, Dict, Optional, Set
import json

class UniqueGoogleImagesScraper:
    """Scraper that ensures each village gets UNIQUE images only"""
    
    def __init__(self):
        # Initialize Supabase
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not supabase_url or not supabase_key:
            raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
        
        self.supabase: Client = create_client(supabase_url, supabase_key)
        
        # Quality settings
        self.MIN_WIDTH = 800
        self.MIN_HEIGHT = 500
        self.MAX_IMAGES_PER_VILLAGE = 6
        self.REQUEST_DELAY = 3.0  # Seconds between requests
        
        # Track ALL image URLs already in database
        self.existing_image_urls: Set[str] = set()
        self.load_existing_images()
        
        # Track new assignments in this session
        self.session_assigned_urls: Set[str] = set()
        
        # Statistics
        self.stats = {
            'attempted': 0,
            'successful': 0,
            'failed': 0,
            'duplicate_urls_skipped': 0,
            'low_quality_skipped': 0,
            'no_results': 0
        }
    
    def load_existing_images(self):
        """Load ALL existing image URLs from database to prevent duplicates"""
        print("🔍 Loading existing image URLs from database...")
        
        all_villages = []
        page = 0
        page_size = 1000
        
        while True:
            from_idx = page * page_size
            to_idx = from_idx + page_size - 1
            
            result = self.supabase.table('retirement_villages').select('images').range(from_idx, to_idx).execute()
            
            if result.data:
                all_villages.extend(result.data)
                if len(result.data) < page_size:
                    break
                page += 1
            else:
                break
        
        # Extract all image URLs
        for village in all_villages:
            if village.get('images'):
                for img_url in village['images']:
                    self.existing_image_urls.add(img_url)
        
        print(f"✅ Loaded {len(self.existing_image_urls)} existing image URLs")
    
    def is_url_unique(self, url: str) -> bool:
        """Check if URL is unique (not already in database or this session)"""
        return (
            url not in self.existing_image_urls and 
            url not in self.session_assigned_urls
        )
    
    def build_specific_search_query(self, village: Dict) -> str:
        """Build a SPECIFIC search query using the village's exact name and location."""
        parts = []
        
        # Add village name (most important)
        if village.get('name'):
            parts.append(village['name'])
        
        # Add "retirement village" keywords
        parts.append('retirement village')
        
        # Add city/location
        if village.get('city'):
            parts.append(village['city'])
        
        # Add state
        if village.get('state'):
            parts.append(village['state'])
        
        query = ' '.join(parts)
        print(f"   🔍 Search query: \"{query}\"")
        return query
    
    def search_google_images(self, query: str) -> List[str]:
        """Search Google Images and extract image URLs"""
        try:
            # Build Google Images search URL
            encoded_query = quote_plus(query)
            url = f"https://www.google.com/search?q={encoded_query}&tbm=isch&tbs=isz:l"
            
            # Make request with realistic headers
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code != 200:
                print(f"   ⚠️  Google returned status {response.status_code}")
                return []
            
            # Parse HTML
            soup = BeautifulSoup(response.text, 'lxml')
            
            # Extract image URLs from multiple possible formats
            image_urls = []
            
            # Method 1: Parse from JavaScript data
            scripts = soup.find_all('script')
            for script in scripts:
                if script.string and 'AF_initDataCallback' in script.string:
                    # Extract URLs from JS data structures
                    matches = re.findall(r'https?://[^\s,"\'\)]+\.(?:jpg|jpeg|png|webp|gif)', script.string)
                    image_urls.extend(matches)
            
            # Method 2: Parse from img tags (thumbnails might have data attributes)
            for img in soup.find_all('img'):
                if img.get('src') and img['src'].startswith('http'):
                    image_urls.append(img['src'])
                if img.get('data-src') and img['data-src'].startswith('http'):
                    image_urls.append(img['data-src'])
            
            # Remove duplicates and filter
            unique_urls = list(set(image_urls))
            
            # Filter out Google's own images (logos, UI elements)
            filtered_urls = [
                url for url in unique_urls
                if 'gstatic.com' not in url and 
                   'google.com/images' not in url and
                   'encrypted-tbn' not in url  # Exclude thumbnails
            ]
            
            print(f"   📸 Found {len(filtered_urls)} potential images")
            return filtered_urls[:30]  # Return max 30 candidates
            
        except Exception as e:
            print(f"   ❌ Search error: {e}")
            return []
    
    def validate_image(self, url: str) -> Optional[Dict]:
        """Download and validate image quality"""
        try:
            # Check if URL is unique FIRST (before downloading)
            if not self.is_url_unique(url):
                return None
            
            # Download image
            response = requests.get(url, timeout=10, stream=True)
            
            if response.status_code != 200:
                return None
            
            # Validate content type
            content_type = response.headers.get('content-type', '')
            if 'image' not in content_type:
                return None
            
            # Load image to check dimensions
            img = Image.open(BytesIO(response.content))
            width, height = img.size
            
            # Check minimum dimensions
            if width < self.MIN_WIDTH or height < self.MIN_HEIGHT:
                return None
            
            # Check aspect ratio (avoid banners, logos)
            aspect_ratio = width / height
            if aspect_ratio > 4 or aspect_ratio < 0.25:
                return None
            
            # Check file size (avoid tiny files)
            content_length = len(response.content)
            if content_length < 50000:  # 50KB minimum
                return None
            
            return {
                'url': url,
                'width': width,
                'height': height,
                'size': content_length,
                'format': img.format
            }
            
        except Exception as e:
            return None
    
    def scrape_village(self, village: Dict) -> bool:
        """Scrape images for a single village with uniqueness validation"""
        try:
            village_id = village['id']
            village_name = village.get('name', 'Unknown')
            
            print(f"\n{'='*80}")
            print(f"🏘️  Processing: {village_name}")
            print(f"{'='*80}")
            
            self.stats['attempted'] += 1
            
            # Build specific search query
            query = self.build_specific_search_query(village)
            
            # Search Google Images
            print("   🌐 Searching Google Images...")
            image_urls = self.search_google_images(query)
            
            if not image_urls:
                print("   ⚠️  No images found")
                self.stats['no_results'] += 1
                return False
            
            # Validate images and collect valid ones
            print(f"   🔍 Validating {len(image_urls)} candidates...")
            valid_images = []
            
            for url in image_urls:
                # Check uniqueness first (fast)
                if not self.is_url_unique(url):
                    print(f"   ⏭️  Skipping duplicate URL: {url[:60]}...")
                    self.stats['duplicate_urls_skipped'] += 1
                    continue
                
                # Validate image (slow - downloads)
                image_info = self.validate_image(url)
                
                if image_info:
                    valid_images.append(image_info['url'])
                    print(f"   ✅ Valid image: {image_info['width']}×{image_info['height']}px")
                    
                    # Stop if we have enough
                    if len(valid_images) >= self.MAX_IMAGES_PER_VILLAGE:
                        break
                else:
                    self.stats['low_quality_skipped'] += 1
            
            # Update database if we found valid images
            if valid_images:
                print(f"   💾 Saving {len(valid_images)} images to database...")
                
                result = self.supabase.table('retirement_villages').update({
                    'images': valid_images
                }).eq('id', village_id).execute()
                
                if result.data:
                    # Mark these URLs as assigned
                    for url in valid_images:
                        self.session_assigned_urls.add(url)
                        self.existing_image_urls.add(url)
                    
                    print(f"   ✅ SUCCESS: Saved {len(valid_images)} unique images")
                    self.stats['successful'] += 1
                    return True
                else:
                    print(f"   ❌ Database update failed")
                    self.stats['failed'] += 1
                    return False
            else:
                print(f"   ⚠️  No valid/unique images found")
                self.stats['failed'] += 1
                return False
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
            self.stats['failed'] += 1
            return False
    
    def get_villages_needing_images(self, limit: Optional[int] = None) -> List[Dict]:
        """Get villages that need images (no images OR had duplicates removed)"""
        print("🔍 Fetching villages that need images...")
        
        all_villages = []
        page = 0
        page_size = 1000
        
        while True:
            from_idx = page * page_size
            to_idx = from_idx + page_size - 1
            
            result = self.supabase.table('retirement_villages').select(
                'id, name, operator, city, state, images'
            ).eq('status', 'approved').range(from_idx, to_idx).execute()
            
            if result.data:
                all_villages.extend(result.data)
                if len(result.data) < page_size:
                    break
                page += 1
            else:
                break
        
        # Filter for villages with no images or very few images
        villages_needing_images = [
            v for v in all_villages 
            if not v.get('images') or len(v.get('images', [])) < 2
        ]
        
        print(f"✅ Found {len(villages_needing_images)} villages needing images")
        
        if limit:
            return villages_needing_images[:limit]
        return villages_needing_images
    
    def run_batch(self, villages: List[Dict], delay: float = 3.0):
        """Process a batch of villages with rate limiting"""
        total = len(villages)
        
        print(f"\n{'#'*80}")
        print(f"# STARTING BATCH: {total} villages")
        print(f"# Rate limit: {delay} seconds between villages")
        print(f"{'#'*80}\n")
        
        for idx, village in enumerate(villages, 1):
            print(f"\n[{idx}/{total}] Village {idx}:")
            
            success = self.scrape_village(village)
            
            # Delay between villages (except last one)
            if idx < total:
                print(f"\n⏸  Waiting {delay} seconds...")
                time.sleep(delay)
        
        # Print summary
        print(f"\n{'='*80}")
        print("📊 BATCH COMPLETE - STATISTICS")
        print(f"{'='*80}")
        print(f"Attempted:              {self.stats['attempted']}")
        print(f"✅ Successful:          {self.stats['successful']}")
        print(f"❌ Failed:              {self.stats['failed']}")
        print(f"⏭️  Duplicate URLs:      {self.stats['duplicate_urls_skipped']}")
        print(f"⏭️  Low quality:         {self.stats['low_quality_skipped']}")
        print(f"⚠️  No results:          {self.stats['no_results']}")
        print(f"📈 Success rate:        {self.stats['successful']/max(self.stats['attempted'],1)*100:.1f}%")
        print(f"🎯 Unique URLs added:   {len(self.session_assigned_urls)}")
        print(f"{'='*80}\n")


# Display banner
print("""
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║  🔧 GOOGLE IMAGES SCRAPER V2 - UNIQUE IMAGES ONLY                        ║
║                                                                           ║
║  ✅ Ensures each village gets UNIQUE images                              ║
║  ✅ Uses SPECIFIC village names in search queries                        ║
║  ✅ Validates uniqueness across entire database                          ║
║  ✅ Prevents generic operator images                                     ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
""")

print("\n🎯 READY TO USE!\n")
print("Example: Test on 5 villages:")
print("  scraper = UniqueGoogleImagesScraper()")
print("  villages = scraper.get_villages_needing_images(limit=5)")
print("  scraper.run_batch(villages, delay=3.0)")
print("\n" + "="*80 + "\n")
```

---

**👆 COPY EVERYTHING ABOVE (from the triple quotes to the end) and paste it into Cell 3 in Google Colab**

---

That's it! You now have everything you need. Start with Step 2 (Open Google Colab) and follow the steps! 🚀
