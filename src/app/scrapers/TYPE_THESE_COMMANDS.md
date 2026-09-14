# ✅ Type These Commands in Google Colab (No Special Symbols!)

## 🎯 Complete List - Just Type These 4 Things

Copy these commands ONE AT A TIME into Google Colab cells.

**After each command, click the Play button and wait for it to finish!**

---

## 📝 CELL 1: Install Packages

**Click "+ Code" in Colab, then type:**

```
!pip install requests beautifulsoup4 pillow supabase lxml
```

**Click Play ▶️ and wait 1-2 minutes**

---

## 📝 CELL 2: Set Your Credentials

**Click "+ Code" again, then type:**

```python
import os
os.environ['SUPABASE_URL'] = 'https://YOUR-PROJECT-ID.supabase.co'
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'eyJ_YOUR_LONG_KEY_HERE'
print("Credentials set")
```

**⚠️ REPLACE the URL and KEY with YOUR real Supabase credentials!**

Get them from: https://app.supabase.com → Your Project → Settings → API

**Click Play ▶️**

You should see: `Credentials set`

---

## 📝 CELL 3: Simple Scraper Test

**Click "+ Code" again, then type:**

```python
from supabase import create_client
import os

# Connect to Supabase
supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

# Get 5 villages without images
response = supabase.table('retirement_villages').select('*').eq('status', 'approved').limit(5).execute()

print(f"Found {len(response.data)} villages")
for village in response.data:
    print(f"- {village['name']}")
```

**Click Play ▶️**

You should see a list of 5 village names from your database!

---

## 📝 CELL 4: Run Full Scraper

**This is the main scraper. Click "+ Code" and type:**

```python
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import time

print("Starting scraper...")

# Get villages without images
villages = supabase.table('retirement_villages').select('*').eq('status', 'approved').not_.is_('website', 'null').limit(10).execute()

villages_list = [v for v in villages.data if not v.get('images') or v.get('images') == []]

print(f"Found {len(villages_list)} villages to scrape")

# Scrape each village
for i, village in enumerate(villages_list, 1):
    print(f"\n[{i}/{len(villages_list)}] {village['name']}")
    
    try:
        # Visit website
        response = requests.get(village['website'], timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find images
        images = []
        for img in soup.find_all('img', limit=20):
            src = img.get('src') or img.get('data-src')
            if src and any(src.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                full_url = urljoin(village['website'], src)
                images.append(full_url)
        
        # Take first 8 images
        images = list(set(images))[:8]
        
        if images:
            # Update database
            supabase.table('retirement_villages').update({'images': images}).eq('id', village['id']).execute()
            print(f"  SUCCESS - Added {len(images)} images")
        else:
            print(f"  No images found")
        
        # Wait 2 seconds
        time.sleep(2)
        
    except Exception as e:
        print(f"  ERROR: {str(e)[:50]}")

print("\nDone!")
```

**Click Play ▶️**

**This will scrape 10 villages as a test!**

---

## 📝 CELL 5: Check Results

**Click "+ Code" and type:**

```python
# Check how many villages now have images
response = supabase.table('retirement_villages').select('id, images').eq('status', 'approved').execute()

total = len(response.data)
with_images = len([v for v in response.data if v.get('images') and len(v['images']) > 0])

print(f"\nTotal villages: {total}")
print(f"Villages with images: {with_images}")
print(f"Coverage: {with_images/total*100:.1f}%")
```

**Click Play ▶️**

**You'll see your image coverage statistics!**

---

## 🎯 Want to Scrape MORE Villages?

**In Cell 4, change this line:**

```python
.limit(10).execute()
```

**To:**

```python
.limit(100).execute()
```

**This will scrape 100 villages instead of 10!**

**Then click Play ▶️ on Cell 4 again.**

---

## ✅ Summary

**You need to create 5 cells total:**

1. **Cell 1:** Install packages (1-2 min)
2. **Cell 2:** Set credentials (instant)
3. **Cell 3:** Test database connection (instant)
4. **Cell 4:** Run scraper (2-20 min depending on limit)
5. **Cell 5:** Check coverage (instant)

**After Cell 4 finishes, check your RetirePath Village Directory - you should see REAL IMAGES!** 🎉

---

## 🆘 Having Issues?

**"Missing credentials" error:**
- Go back to Cell 2
- Make sure you replaced the example URL and KEY with YOUR real ones
- Run Cell 2 again

**"No module named 'requests'" error:**
- Go back to Cell 1
- Run it again
- Wait for it to finish

**"No images found" for all villages:**
- This is normal for some villages (30-40%)
- Try increasing the limit to 50 or 100
- Not all village websites have extractable images

---

**Good luck! You're almost there!** 🚀
