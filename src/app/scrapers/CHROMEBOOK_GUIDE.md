# 💻 Chromebook Users - How to Run the Image Scraper

## ⚠️ Important: Chromebooks Are Different

**Bad news:** Chromebooks can't run Python programs natively like Windows/Mac computers.

**Good news:** You have 4 options to run the scraper!

---

## 🎯 Your Options (Ranked by Easiest to Hardest)

### ✅ Option 1: Use Google Colab (FREE, EASIEST) ⭐ RECOMMENDED

Google Colab lets you run Python in your browser for FREE!

**Pros:**
- ✅ Works on Chromebook
- ✅ Completely free
- ✅ No installation needed
- ✅ Runs in browser

**Cons:**
- ⚠️ Sessions timeout after ~12 hours (so full scrape needs supervision)
- ⚠️ Requires some setup each time

**→ Jump to: [Option 1 Instructions](#option-1-google-colab-detailed-steps)**

---

### ✅ Option 2: Enable Linux on Chromebook (FREE, Medium Difficulty)

Newer Chromebooks (2019+) can run Linux and Python!

**Pros:**
- ✅ Free
- ✅ Works like a normal computer once set up
- ✅ Can run overnight
- ✅ Your Chromebook becomes more powerful

**Cons:**
- ⚠️ Only works on newer Chromebooks
- ⚠️ Setup takes 20-30 minutes
- ⚠️ Uses extra storage

**→ Jump to: [Option 2 Instructions](#option-2-linux-on-chromebook-detailed-steps)**

---

### ✅ Option 3: Use a Friend's Computer (FREE, Easiest)

Borrow a Windows/Mac computer for 2 hours.

**Pros:**
- ✅ Free
- ✅ Easiest if you have access
- ✅ Works exactly as documented

**Cons:**
- ⚠️ Need access to another computer
- ⚠️ Need to be present for 2 hours (for top operators scrape)

**→ Jump to: [Option 3 Instructions](#option-3-use-another-computer)**

---

### ✅ Option 4: Cloud Server (COSTS MONEY, Advanced)

Rent a cloud server for a few hours.

**Pros:**
- ✅ Professional solution
- ✅ Can run 24/7
- ✅ Fast

**Cons:**
- ⚠️ Costs $5-10
- ⚠️ Requires technical knowledge
- ⚠️ More complex setup

**→ Jump to: [Option 4 Instructions](#option-4-cloud-server-advanced)**

---

## 🌟 OPTION 1: Google Colab (Detailed Steps)

### What is Google Colab?

Google Colab is a FREE Python environment that runs in your browser. Perfect for Chromebooks!

### ⚠️ EASIER WAY: Use the Step-by-Step Guide

I've created a complete, detailed guide for Google Colab:

**📄 READ THIS: `/scrapers/GOOGLE_COLAB_INSTRUCTIONS.md`**

This guide has:
- ✅ Screenshots and examples
- ✅ Every single step explained
- ✅ Copy-paste ready code
- ✅ Troubleshooting tips

**Just open that file and follow along!**

### Quick Overview (Full details in GOOGLE_COLAB_INSTRUCTIONS.md)

### Step 1: Create a Google Colab Notebook

1. **Go to:** https://colab.research.google.com
2. **Sign in** with your Google account
3. **Click:** File → New Notebook
4. **You'll see** a blank notebook

### Step 2: Install Dependencies

**In the first cell, paste this code:**

```python
# Install required packages
!pip install requests beautifulsoup4 pillow python-dotenv supabase lxml
```

**Click the Play button (▶️)** on the left of the cell.

Wait ~1 minute while packages install.

### Step 3: Set Your Supabase Credentials

**In a new cell, paste this code:**

```python
import os

# Replace these with YOUR actual credentials
os.environ['SUPABASE_URL'] = 'https://your-project-id.supabase.co'
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

**IMPORTANT:** Replace the URLs with YOUR credentials from Supabase:
- Supabase Dashboard → Settings → API
- Copy "Project URL" and "service_role secret"

**Run this cell** (click ▶️)

### Step 4: Upload the Scraper Code

**Option A: Copy-Paste**

Create a new cell and paste the ENTIRE contents of `village_image_scraper.py` (I'll create a simplified version below).

**Option B: Upload File**

1. Click the folder icon on the left sidebar
2. Click the upload button
3. Upload `village_image_scraper.py` from your downloads

### Step 5: Run the Scraper

**In a new cell, paste:**

```python
# For simplified version (see below)
from village_image_scraper import VillageImageScraper

# Create scraper instance
scraper = VillageImageScraper()

# Run test scrape (5 villages)
scraper.run(limit=5, delay=2.0)

# OR run top operators (500-600 villages)
# scraper.run(operator='Stockland', delay=2.0)
# scraper.run(operator='Aveo', delay=2.0)
# scraper.run(operator='Lendlease', delay=2.0)
```

**Run the cell** and watch it scrape!

### Step 6: Monitor Progress

You'll see output in real-time showing progress.

### ⚠️ Important Notes for Colab:

- **Session timeout:** Colab sessions end after 12 hours of inactivity
- **Keep browser open:** Don't close the tab while scraping
- **Save progress:** The scraper skips villages that already have images, so you can restart if needed

---

## 🐧 OPTION 2: Linux on Chromebook (Detailed Steps)

### Check if Your Chromebook Supports Linux

1. Click the **time** in the bottom right
2. Click the **gear icon** (Settings)
3. Look for **"Linux (Beta)"** in the left sidebar

**If you see "Linux (Beta)":** ✅ Your Chromebook supports it!  
**If you DON'T see it:** ❌ Your Chromebook is too old - use Option 1 instead

### Step 1: Enable Linux

1. **Settings → Linux (Beta)**
2. **Click "Turn On"**
3. **Wait 5-10 minutes** while Linux installs
4. **A terminal window** will open when done

### Step 2: Install Python

**In the Linux terminal, type:**

```bash
sudo apt update
sudo apt install python3 python3-pip git -y
```

Press Enter and wait ~5 minutes.

### Step 3: Download the Scraper

**In terminal:**

```bash
cd ~
mkdir retirepath-scraper
cd retirepath-scraper
```

**Then either:**

**Option A: If scraper is in a git repo:**
```bash
git clone [your-repo-url]
cd scrapers
```

**Option B: Manual upload:**
1. Download the `/scrapers` folder to your Chromebook Downloads
2. In Chromebook Files app, find the Downloads folder
3. Right-click `/scrapers` folder → Share with Linux
4. In terminal:
```bash
cp -r /mnt/chromeos/MyFiles/Downloads/scrapers ~/retirepath-scraper/
cd ~/retirepath-scraper/scrapers
```

### Step 4: Install Dependencies

```bash
pip3 install -r requirements.txt
```

### Step 5: Create .env File

```bash
nano .env
```

**Paste:**
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Replace with your actual credentials!**

**Save:** Press Ctrl+X, then Y, then Enter

### Step 6: Run the Scraper

```bash
python3 quick_test.py
```

**If that works:**
```bash
python3 village_image_scraper.py
# Choose Option 5
```

### ✅ Advantages:

- Works just like a regular computer
- Can run overnight
- Keeps working even if you close the lid (with settings adjustment)

---

## 💻 OPTION 3: Use Another Computer

### Simple Instructions:

1. **Borrow a Windows/Mac computer** for 2-3 hours
2. **Follow the normal guide:** `/scrapers/SIMPLE_START.md`
3. **Run the scraper** (Option 5 - Top Operators)
4. **Let it complete** (~1-2 hours)
5. **Done!** Your database now has images

**For overnight full scrape:**
- Leave the computer on overnight
- Let the scraper run Option 1 (ALL villages)
- Wake up to 1,600 villages with images

---

## ☁️ OPTION 4: Cloud Server (Advanced)

### Use a Cloud Provider

**Services:**
- Google Cloud Platform (has free tier)
- AWS (has free tier)
- DigitalOcean ($5/month)
- Replit (free for basic use)

### Replit Option (EASIEST Cloud Option)

1. **Go to:** https://replit.com
2. **Sign up** for free
3. **Create new Repl** → Python
4. **Upload your scraper files**
5. **Add secrets** for SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
6. **Run** the scraper

**Replit Instructions:**
- Click "Secrets" (lock icon on left sidebar)
- Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Upload all files from `/scrapers`
- Click "Run"

---

## 🎯 My Recommendation for YOU

### Best Option: Google Colab (Option 1)

**Why:**
- ✅ FREE
- ✅ Works on Chromebook right now
- ✅ No installation needed
- ✅ You can start in 5 minutes

**Downside:**
- Can't run overnight in one session
- Need to run in chunks

**Strategy:**
```
Day 1: Run top operators (1-2 hours in Colab) → Get 25% coverage
Day 2: Run by state (NSW, 2 hours) → Add more coverage
Day 3: Run by state (VIC, 2 hours) → Add more coverage
etc.
```

**This way you avoid the 12-hour timeout and still get full coverage!**

---

## 📝 Simplified Scraper for Google Colab

I'll create a single-file version you can copy-paste into Colab:

**Save this as a cell in Google Colab:**

```python
import os
import time
import requests
from urllib.parse import urljoin
from bs4 import BeautifulSoup
from supabase import create_client
import re
from io import BytesIO
from PIL import Image

class SimpleVillageImageScraper:
    def __init__(self):
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        self.supabase = create_client(supabase_url, supabase_key)
        
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def get_villages_without_images(self, limit=None, operator=None):
        query = self.supabase.table('retirement_villages').select('*')
        query = query.eq('status', 'approved')
        query = query.not_.is_('website', 'null')
        
        if operator:
            query = query.ilike('operator', f'%{operator}%')
        if limit:
            query = query.limit(limit)
        
        response = query.execute()
        villages = [v for v in response.data if not v.get('images') or v.get('images') == []]
        
        print(f"Found {len(villages)} villages without images")
        return villages
    
    def extract_images(self, url):
        try:
            response = self.session.get(url, timeout=15)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            image_urls = []
            for img in soup.find_all('img')[:20]:
                src = img.get('src') or img.get('data-src')
                if src:
                    full_url = urljoin(url, src)
                    if any(full_url.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                        image_urls.append(full_url)
            
            return list(set(image_urls))[:8]
        except:
            return []
    
    def update_village(self, village_id, images):
        self.supabase.table('retirement_villages').update({
            'images': images
        }).eq('id', village_id).execute()
    
    def run(self, limit=None, operator=None):
        villages = self.get_villages_without_images(limit, operator)
        
        for i, village in enumerate(villages, 1):
            print(f"\n[{i}/{len(villages)}] {village['name']}")
            images = self.extract_images(village['website'])
            
            if images:
                self.update_village(village['id'], images)
                print(f"  ✓ Added {len(images)} images")
            else:
                print(f"  ✗ No images found")
            
            time.sleep(2)
        
        print(f"\n✓ Complete! Updated {len([v for v in villages if self.extract_images(v['website'])])} villages")

# Usage:
# scraper = SimpleVillageImageScraper()
# scraper.run(limit=5)  # Test with 5 villages
# scraper.run(operator='Stockland')  # Scrape Stockland villages
```

---

## ✅ Your Action Plan

### If you have a newer Chromebook (2019+):
1. **Try Option 2** (Enable Linux) - 30 min setup, then works forever
2. **Fallback to Option 1** (Google Colab) if Linux doesn't work

### If you have an older Chromebook:
1. **Use Option 1** (Google Colab) - Start right now, works immediately
2. **Run in chunks** to avoid timeout (top operators, then by state)

### If you have access to another computer:
1. **Use Option 3** - Borrow it for 2 hours, easiest solution

---

## 🎯 Next Steps

1. **Decide which option** works best for you
2. **Follow the detailed steps** above
3. **Start with a small test** (5-10 villages)
4. **Verify it works** (check Supabase)
5. **Run full scrape** in chunks or overnight

---

## 🆘 Need Help?

**Chromebook-specific issues:**
- Can't enable Linux → Use Google Colab (Option 1)
- Colab session timeout → Run in smaller chunks (by operator or state)
- Don't have another computer → Stick with Google Colab

**General scraper issues:**
- Read: `ABSOLUTE_BEGINNER_GUIDE.md`
- Read: `SETUP_CHECKLIST.md` → Troubleshooting

---

**Good luck! Chromebooks make this a bit harder, but Google Colab (Option 1) is a great free solution! 🚀**