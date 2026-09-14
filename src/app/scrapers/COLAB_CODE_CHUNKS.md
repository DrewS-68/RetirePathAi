# 📋 Google Colab Code - Copy These Chunks One at a Time

**Having trouble copying the big COLAB_SCRAPER.py file?**

**No problem!** Copy and paste these smaller chunks into Google Colab instead.

---

## 🔢 Order of Operations

Create a NEW CODE CELL for each chunk below and run them IN ORDER:

1. ✅ Chunk 1: Install Dependencies
2. ✅ Chunk 2: Set Credentials
3. ✅ Chunk 3: Import Libraries
4. ✅ Chunk 4: Scraper Class (Part 1)
5. ✅ Chunk 5: Scraper Class (Part 2)
6. ✅ Chunk 6: Run Scraper
7. ✅ Chunk 7: Check Coverage

---

## ✅ CHUNK 1: Install Dependencies

**Create a code cell and paste this:**

```python
!pip install requests beautifulsoup4 pillow supabase lxml
```

**Click Play ▶️**

Wait ~1-2 minutes for installation to complete.

---

## ✅ CHUNK 2: Set Credentials

**Create a NEW code cell and paste this:**

```python
import os

# REPLACE THESE WITH YOUR ACTUAL CREDENTIALS!
os.environ['SUPABASE_URL'] = 'https://YOUR-PROJECT-ID.supabase.co'
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

print("✓ Credentials set!")
```

**⚠️ IMPORTANT:** Replace with YOUR Supabase credentials!

Get them from: Supabase Dashboard → Settings → API

- Project URL
- service_role secret (click "Reveal")

**Click Play ▶️**

You should see: `✓ Credentials set!`

---

## ✅ CHUNK 3: Import Libraries

**Create a NEW code cell and paste this:**

```python
import os
import time
import requests
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from supabase import create_client
import re
from io import BytesIO
from PIL import Image

print("✓ Libraries imported!")
```

**Click Play ▶️**

---

## ✅ CHUNK 4: Scraper Class (Part 1 - Setup & Fetching)

**Create a NEW code cell and paste this:**

```python
class VillageImageScraperColab:
    """Simplified scraper for Google Colab"""

    def __init__(self):
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

        if not supabase_url or not supabase_key:
            raise ValueError("Missing credentials!")

        print(f"✓ Connecting to Supabase: {supabase_url}")
        self.supabase = create_client(supabase_url, supabase_key)

        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })

        self.stats = {
            'processed': 0,
            'successful': 0,
            'failed': 0,
            'total_images': 0
        }

    def get_villages_without_images(self, limit=None, operator=None, state=None):
        """Fetch villages that need images"""
        print(f"\n{'='*80}")
        print("FETCHING VILLAGES FROM DATABASE")
        print(f"{'='*80}")

        query = self.supabase.table('retirement_villages').select('*')
        query = query.eq('status', 'approved')
        query = query.not_.is_('website', 'null')

        if operator:
            query = query.ilike('operator', f'%{operator}%')
            print(f"Filtering by operator: {operator}")

        if state:
            query = query.eq('state', state.upper())
            print(f"Filtering by state: {state}")

        if limit:
            query = query.limit(limit * 3)

        response = query.execute()
        villages = [v for v in response.data if not v.get('images') or v.get('images') == []]

        if limit and len(villages) > limit:
            villages = villages[:limit]

        print(f"✓ Found {len(villages)} villages without images")
        return villages

print("✓ Part 1 complete!")
```

**Click Play ▶️**

---

## ✅ CHUNK 5: Scraper Class (Part 2 - Image Processing)

**Create a NEW code cell and paste this:**

```python
# Add these methods to the VillageImageScraperColab class
def is_valid_image_url(self, url):
    """Check if URL looks like an image"""
    try:
        parsed = urlparse(url)
        path = parsed.path.lower()

        if not any(path.endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp']):
            return False

        skip_keywords = ['logo', 'icon', 'button', 'banner', 'badge']
        if any(keyword in path.lower() for keyword in skip_keywords):
            return False

        return True
    except:
        return False

def verify_image(self, url):
    """Verify image is valid and high quality"""
    try:
        response = self.session.get(url, timeout=10, stream=True)

        if response.status_code != 200:
            return False

        img = Image.open(BytesIO(response.content))
        width, height = img.size

        if width < 800 or height < 500:
            return False

        return True
    except:
        return False

def extract_images_from_url(self, url):
    """Extract images from a village website"""
    try:
        print(f"  Visiting: {url}")
        response = self.session.get(url, timeout=15)
        soup = BeautifulSoup(response.content, 'html.parser')

        image_urls = set()

        for img in soup.find_all('img', limit=50):
            src = img.get('src') or img.get('data-src')

            if src:
                full_url = urljoin(url, src)

                if self.is_valid_image_url(full_url):
                    image_urls.add(full_url)

        print(f"  Found {len(image_urls)} potential images")

        verified = []
        for img_url in list(image_urls)[:15]:
            if self.verify_image(img_url):
                verified.append(img_url)
                if len(verified) >= 8:
                    break

        print(f"  ✓ Verified {len(verified)} high-quality images")
        return verified

    except Exception as e:
        print(f"  ✗ Error: {str(e)[:100]}")
        return []

def update_village_images(self, village_id, images):
    """Update village with image URLs"""
    try:
        self.supabase.table('retirement_villages').update({
            'images': images
        }).eq('id', village_id).execute()
        return True
    except Exception as e:
        print(f"  ✗ Database update failed: {e}")
        return False

# Attach these methods to the class
VillageImageScraperColab.is_valid_image_url = is_valid_image_url
VillageImageScraperColab.verify_image = verify_image
VillageImageScraperColab.extract_images_from_url = extract_images_from_url
VillageImageScraperColab.update_village_images = update_village_images

print("✓ Part 2 complete!")
```

**Click Play ▶️**

---

## ✅ CHUNK 6: Scraper Class (Part 3 - Main Scraping Function)

**Create a NEW code cell and paste this:**

```python
def scrape(self, limit=None, operator=None, state=None, delay=2.0):
    """Main scraping function"""
    print(f"\n{'='*80}")
    print("RETIREPATH IMAGE SCRAPER - STARTING")
    print(f"{'='*80}\n")

    villages = self.get_villages_without_images(limit, operator, state)

    if not villages:
        print("✓ No villages need images!")
        return

    print(f"\n{'='*80}")
    print(f"SCRAPING {len(villages)} VILLAGES")
    print(f"{'='*80}\n")

    for i, village in enumerate(villages, 1):
        print(f"[{i}/{len(villages)}] {village['name']} ({village.get('state', 'N/A')})")

        if not village.get('website'):
            print("  ✗ No website")
            self.stats['failed'] += 1
            continue

        images = self.extract_images_from_url(village['website'])

        if images:
            if self.update_village_images(village['id'], images):
                print(f"  ✓ SUCCESS - Added {len(images)} images")
                self.stats['successful'] += 1
                self.stats['total_images'] += len(images)
            else:
                print(f"  ✗ Failed to update database")
                self.stats['failed'] += 1
        else:
            print(f"  ✗ No suitable images found")
            self.stats['failed'] += 1

        self.stats['processed'] += 1

        if i < len(villages):
            print(f"  Waiting {delay}s...\n")
            time.sleep(delay)

    self.print_summary()

def print_summary(self):
    """Print final statistics"""
    print(f"\n{'='*80}")
    print("SCRAPING COMPLETE - SUMMARY")
    print(f"{'='*80}")
    print(f"Villages processed:  {self.stats['processed']}")
    print(f"Successful updates:  {self.stats['successful']} ({self.stats['successful']/self.stats['processed']*100:.1f}%)")
    print(f"Failed:              {self.stats['failed']}")
    print(f"Total images added:  {self.stats['total_images']}")
    if self.stats['successful'] > 0:
        print(f"Avg images/village:  {self.stats['total_images']/self.stats['successful']:.1f}")
    print(f"{'='*80}\n")

# Attach these methods to the class
VillageImageScraperColab.scrape = scrape
VillageImageScraperColab.print_summary = print_summary

print("✓ Scraper class complete! Ready to use!")
```

**Click Play ▶️**

---

## ✅ CHUNK 7: Run the Scraper!

**Now choose ONE option below:**

### Option A: Test with 5 Villages (RECOMMENDED FIRST)

**Create a NEW code cell and paste:**

```python
print("🎬 Starting test scrape...\n")

scraper = VillageImageScraperColab()
scraper.scrape(limit=5, delay=2.0)

print("\n✅ Test complete! Check the output above.")
```

**Click Play ▶️**

**This tests if everything works!**

---

### Option B: Scrape Specific Operator

**Create a NEW code cell and paste:**

```python
print("🎬 Scraping Stockland villages...\n")

scraper = VillageImageScraperColab()
scraper.scrape(operator='Stockland', delay=2.0)
```

**Replace 'Stockland' with any operator:**

- Stockland
- Aveo
- Lendlease
- Ingenia
- Keyton
- Living Choice

**Click Play ▶️**

---

### Option C: Scrape ALL Top Operators (1-2 hours)

**Create a NEW code cell and paste:**

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

**Click Play ▶️**

**This runs for 1-2 hours and scrapes ~500-600 villages!**

---

### Option D: Scrape by State

**Create a NEW code cell and paste:**

```python
# Choose your state: NSW, VIC, QLD, SA, WA, TAS, ACT, NT
STATE = 'NSW'

print(f"🎬 Scraping {STATE} villages...\n")

scraper = VillageImageScraperColab()
scraper.scrape(state=STATE, limit=100, delay=2.0)
```

**Change 'NSW' to your desired state**

**Click Play ▶️**

---

## ✅ CHUNK 8: Check Coverage Statistics

**After scraping, create a NEW code cell and paste:**

```python
print("📊 Checking coverage...\n")

from supabase import create_client
import os

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

# Get all approved villages
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

if with_images/total < 0.25:
    print("🟡 Recommendation: Run top operators scrape (Option C)")
elif with_images/total < 0.60:
    print("🟢 Good progress! Run more states or operators to increase coverage.")
else:
    print("🎉 Excellent coverage! You're launch-ready!")
```

**Click Play ▶️**

---

## ✅ Summary: What You Just Did

### You created 8 code cells:

1. ✅ Installed Python packages
2. ✅ Set your Supabase credentials
3. ✅ Imported libraries
4. ✅ Created scraper class (part 1)
5. ✅ Created scraper class (part 2)
6. ✅ Created scraper class (part 3)
7. ✅ Ran the scraper
8. ✅ Checked coverage statistics

### Result:

**Your Supabase database now has authentic images for hundreds of villages!**

---

## 🎯 Next Steps

1. **Verify in Supabase:**
   - Go to Supabase Dashboard
   - Table Editor → retirement_villages
   - Filter: `images` is not null
   - You should see villages with image URLs!

2. **Check your app:**
   - Open RetirePath Village Directory
   - Villages should show REAL IMAGES instead of blue placeholders! 🎉

3. **Run more scraping:**
   - If coverage < 25%: Run Option C (all top operators)
   - If coverage < 60%: Run Option D (scrape by state)
   - Target: 60-70% coverage

---

## 🐛 Troubleshooting

### "Missing credentials" error

- Go back to Chunk 2
- Make sure you REPLACED the example credentials with YOUR real ones
- Run that cell again

### "No module named 'requests'" error

- Go back to Chunk 1
- Run it again
- Wait for completion

### Scraper finds no images

- This is NORMAL for 30-40% of villages
- Expected success rate: 60-70%

---

## 🎉 You Did It!

**You've successfully run the RetirePath image scraper on your Chromebook using Google Colab!**

**Keep scraping until you hit 60-70% coverage, then you're launch-ready! 🚀**