# ⚡ V2 Quick Start - Copy & Paste

## 🎯 5-Minute Setup

### 1️⃣ Open Google Colab
https://colab.research.google.com/ → **+ New Notebook**

---

### 2️⃣ Cell 1: Install Libraries
```python
!pip install -q requests beautifulsoup4 pillow supabase lxml
```
**Run:** Shift+Enter

---

### 3️⃣ Cell 2: Set Credentials
```python
import os
os.environ['SUPABASE_URL'] = 'https://zupxzuvlzizjnklecbvy.supabase.co'
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'YOUR_SERVICE_ROLE_KEY_HERE'
```
**⚠️ Replace `YOUR_SERVICE_ROLE_KEY_HERE` with your actual key!**

**Run:** Shift+Enter

---

### 4️⃣ Cell 3: Load Scraper
**Copy ALL code from `/scrapers/GOOGLE_IMAGES_SCRAPER_V2_UNIQUE.py`**

Paste into Cell 3

**Run:** Shift+Enter

You should see:
```
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║  🔧 GOOGLE IMAGES SCRAPER V2 - UNIQUE IMAGES ONLY                        ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

### 5️⃣ Cell 4: Test Run (5 villages)
```python
scraper = UniqueGoogleImagesScraper()
villages = scraper.get_villages_needing_images(limit=5)
scraper.run_batch(villages, delay=3.0)
```
**Run:** Shift+Enter

**Expected time:** ~30 seconds

---

## ✅ Verify Test Results

1. Go to your RetirePath app
2. Navigate to **Village Directory**
3. Search for the 5 test villages
4. **Verify images appear and are unique**

---

## 🚀 Production Runs

### Option 1: Priority Operators First ⭐ (Recommended)
```python
scraper = UniqueGoogleImagesScraper()
all_villages = scraper.get_villages_needing_images()

priority_operators = ['Adventist Care', 'Blue Care', 'Uniting', 'BaptistCare']
priority_villages = [
    v for v in all_villages 
    if any(op in v.get('name', '') for op in priority_operators)
]

print(f"Processing {len(priority_villages)} priority villages")
scraper.run_batch(priority_villages, delay=3.0)
```
**Expected time:** 30-60 minutes

---

### Option 2: Process ALL Villages
```python
scraper = UniqueGoogleImagesScraper()
villages = scraper.get_villages_needing_images()
scraper.run_batch(villages, delay=3.0)
```
**Expected time:** 2-3 hours

---

### Option 3: Process in Batches of 100
```python
# Batch 1
scraper = UniqueGoogleImagesScraper()
villages = scraper.get_villages_needing_images(limit=100)
scraper.run_batch(villages, delay=3.0)

# Wait, verify results in app, then continue...

# Batch 2
scraper = UniqueGoogleImagesScraper()
villages = scraper.get_villages_needing_images(limit=100)
scraper.run_batch(villages, delay=3.0)
```
**Expected time per batch:** 5-7 minutes

---

## 📊 Check Coverage

```python
from supabase import create_client
import os

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

result = supabase.table('retirement_villages').select('id, images').eq('status', 'approved').execute()
total = len(result.data)
with_images = len([v for v in result.data if v.get('images') and len(v['images']) > 0])

print(f"Coverage: {with_images}/{total} = {with_images/total*100:.1f}%")
```

---

## 🎯 Target Specific Operator

### Adventist Care Only:
```python
scraper = UniqueGoogleImagesScraper()
all_villages = scraper.get_villages_needing_images()
target = [v for v in all_villages if 'Adventist Care' in v.get('name', '')]
print(f"Found {len(target)} villages")
scraper.run_batch(target, delay=3.0)
```

### Blue Care Only:
```python
scraper = UniqueGoogleImagesScraper()
all_villages = scraper.get_villages_needing_images()
target = [v for v in all_villages if 'Blue Care' in v.get('name', '')]
print(f"Found {len(target)} villages")
scraper.run_batch(target, delay=3.0)
```

---

## 🔧 Troubleshooting

### If Google rate limits you:
```python
# Increase delay to 5 or 10 seconds
scraper.run_batch(villages, delay=10.0)
```

### If Colab times out:
```python
# Process smaller batches
scraper = UniqueGoogleImagesScraper()
villages = scraper.get_villages_needing_images(limit=25)
scraper.run_batch(villages, delay=3.0)
```

---

## 📈 Expected Results

### Current State:
- **998 villages** with images
- **42.4% coverage**

### After V2 (50% success rate):
- **1,673 villages** with images
- **71% coverage**

### After V2 (60% success rate):
- **1,808 villages** with images
- **77% coverage**

---

## 🎉 You're Ready!

**Start with the test run, verify results, then run production!**

**Files to reference:**
- **This file:** Quick copy-paste commands
- `/scrapers/OPTION_2_V2_GUIDE.md` - Detailed guide
- `/scrapers/GOOGLE_IMAGES_SCRAPER_V2_UNIQUE.py` - The scraper code

**Good luck! 🚀**
