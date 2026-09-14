# 🗄️ Supabase Storage Setup & Image Scraping Guide

## Overview
This guide walks you through setting up Supabase Storage for village images and running the corrected Google Images scraping script.

---

## 📋 Prerequisites

1. ✅ **Supabase Project** with Service Role Key
2. ✅ **Google Colab Account** (free)
3. ✅ **CSV File** of villages without images (generated from Village Directory)

---

## Step 1: Initialize Storage Bucket

### Option A: Via RetirePath UI (Recommended)

1. **Navigate** to the **Storage Setup** tab in your RetirePath dashboard
2. Click **"Initialize Storage"** button
3. Wait for success message: ✅ "Storage bucket initialized successfully"
4. Verify the bucket status shows: **Exists: ✓**

### Option B: Via Supabase Dashboard (Manual)

1. Go to **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Name it: `village-images`
4. Set as **Public bucket** ✓
5. **File size limit**: 5MB
6. **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
7. Click **"Create bucket"**

---

## Step 2: Get Your Supabase Credentials

### Where to Find Them:

1. Go to **Supabase Dashboard**
2. Click **Settings** (left sidebar)
3. Click **API** tab
4. Copy these values:

#### Project URL:
```
https://YOUR_PROJECT_ID.supabase.co
```

#### Service Role Key (⚠️ Keep Secret!):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 3: Generate CSV of Villages Without Images

1. In RetirePath, go to **Village Directory** tab
2. Scroll to bottom and click **"Generate CSV for Scraping"**
3. Download the CSV file: `villages_without_images_YYYYMMDD.csv`
4. **Note the filename** for Step 4

---

## Step 4: Run the Google Colab Scraping Script

### A. Open Google Colab

1. Go to https://colab.research.google.com
2. Click **File** → **New notebook**
3. Name it: `RetirePath_Image_Scraper`

### B. Copy the Python Script

```python
# Install required packages
!pip install requests beautifulsoup4 pillow supabase

import pandas as pd
import requests
from bs4 import BeautifulSoup
import time
from io import BytesIO
from PIL import Image
from supabase import create_client, Client

# ============================================
# CONFIGURATION - UPDATE THESE VALUES!
# ============================================
SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co"  # Replace with your URL
SUPABASE_KEY = "YOUR_SERVICE_ROLE_KEY_HERE"          # Replace with your Service Role Key
CSV_FILE = "villages_without_images.csv"              # Replace with your CSV filename

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def search_google_images(query, max_results=3):
    """Search Google Images and return image URLs"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        search_url = f"https://www.google.com/search?q={query}&tbm=isch"
        response = requests.get(search_url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            return []
        
        soup = BeautifulSoup(response.content, 'html.parser')
        images = soup.find_all('img')
        
        urls = []
        for img in images[1:max_results+1]:  # Skip first (Google logo)
            src = img.get('src') or img.get('data-src')
            if src and src.startswith('http'):
                urls.append(src)
        
        return urls
        
    except Exception as e:
        print(f"Error searching images: {e}")
        return []

def download_and_upload_image(image_url, village_id, index):
    """Download image and upload to Supabase Storage"""
    try:
        # Download image
        response = requests.get(image_url, timeout=10)
        if response.status_code != 200:
            return None
        
        # Convert to PIL Image
        img = Image.open(BytesIO(response.content))
        
        # Convert to RGB if needed
        if img.mode in ('RGBA', 'LA', 'P'):
            img = img.convert('RGB')
        
        # Resize if too large (max 1200x800)
        if img.width > 1200 or img.height > 800:
            img.thumbnail((1200, 800), Image.Resampling.LANCZOS)
        
        # Save to BytesIO
        buffer = BytesIO()
        img.save(buffer, format='JPEG', quality=85)
        buffer.seek(0)
        
        # Upload to Supabase Storage
        file_path = f"{village_id}/{int(time.time())}_{index}.jpg"
        
        result = supabase.storage.from_('village-images').upload(
            file_path,
            buffer.read(),
            file_options={"content-type": "image/jpeg"}
        )
        
        # Get public URL
        public_url = supabase.storage.from_('village-images').get_public_url(file_path)
        
        return public_url
        
    except Exception as e:
        print(f"Error uploading image: {e}")
        return None

def update_village_images(village_id, image_urls):
    """Update village images in database"""
    try:
        # Get existing images
        result = supabase.table('retirement_villages').select('images').eq('id', village_id).execute()
        
        if not result.data:
            return False
        
        existing_images = result.data[0].get('images', []) or []
        
        # Merge with new images (avoid duplicates)
        all_images = list(set(existing_images + image_urls))
        
        # Update database
        supabase.table('retirement_villages').update({
            'images': all_images
        }).eq('id', village_id).execute()
        
        return True
        
    except Exception as e:
        print(f"Error updating database: {e}")
        return False

# ============================================
# MAIN SCRAPING LOOP
# ============================================
df = pd.read_csv(CSV_FILE)
print(f"Found {len(df)} villages to process\n")

success_count = 0
fail_count = 0

for index, row in df.iterrows():
    village_id = row['id']
    name = row['name']
    suburb = row['suburb']
    state = row['state']
    
    print(f"[{index+1}/{len(df)}] Processing: {name}, {suburb}, {state}")
    
    # Search Google Images
    query = f"retirement village {name} {suburb} {state} australia"
    image_urls = search_google_images(query, max_results=3)
    
    if not image_urls:
        print(f"  ❌ No images found")
        fail_count += 1
        time.sleep(2)
        continue
    
    print(f"  📷 Found {len(image_urls)} images")
    
    # Download and upload images
    uploaded_urls = []
    for i, img_url in enumerate(image_urls):
        print(f"    Uploading image {i+1}...", end=' ')
        public_url = download_and_upload_image(img_url, village_id, i)
        
        if public_url:
            uploaded_urls.append(public_url)
            print("✅")
        else:
            print("❌")
    
    if uploaded_urls:
        # Update database
        if update_village_images(village_id, uploaded_urls):
            print(f"  ✅ Updated village with {len(uploaded_urls)} images")
            success_count += 1
        else:
            print(f"  ❌ Failed to update database")
            fail_count += 1
    else:
        print(f"  ❌ No images uploaded")
        fail_count += 1
    
    # Rate limiting (be nice to Google!)
    time.sleep(3)
    
    # Progress update every 10 villages
    if (index + 1) % 10 == 0:
        print(f"\n--- Progress: {success_count} success, {fail_count} failed ---\n")

print(f"\n{'='*50}")
print(f"COMPLETE!")
print(f"Success: {success_count}")
print(f"Failed: {fail_count}")
print(f"Success Rate: {(success_count / len(df) * 100):.1f}%")
print(f"{'='*50}")
```

### C. Upload CSV File

1. In Colab, click the **📁 Files** icon (left sidebar)
2. Click **Upload** button
3. Select your `villages_without_images_YYYYMMDD.csv` file
4. Wait for upload to complete

### D. Update Configuration

In the script, update these 3 values:

```python
SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co"  # Your Supabase URL
SUPABASE_KEY = "YOUR_SERVICE_ROLE_KEY_HERE"          # Your Service Role Key
CSV_FILE = "villages_without_images_20241214.csv"    # Your CSV filename
```

### E. Run the Script

1. Click **Runtime** → **Run all**
2. Watch the progress in real-time
3. Scraping will take **30-45 minutes** for ~763 villages

---

## Step 5: Monitor Progress

### Real-Time Console Output:

```
Found 763 villages to process

[1/763] Processing: Anglicare Sydney Retirement Village, Camden, NSW
  📷 Found 3 images
    Uploading image 1... ✅
    Uploading image 2... ✅
    Uploading image 3... ✅
  ✅ Updated village with 3 images

[2/763] Processing: Barossa Village, Nuriootpa, SA
  📷 Found 2 images
    Uploading image 1... ✅
    Uploading image 2... ✅
  ✅ Updated village with 2 images

--- Progress: 2 success, 0 failed ---
```

### Final Summary:

```
==================================================
COMPLETE!
Success: 685
Failed: 78
Success Rate: 89.8%
==================================================
```

---

## ⚠️ Troubleshooting

### Error: "Storage bucket not found"
**Solution:** Run **Initialize Storage** in the Storage Setup tab

### Error: "Unauthorized" or "401"
**Solution:** Double-check your Service Role Key (not Anon Key!)

### Error: "No images found"
**Solution:** Google Images may be blocking requests. Try:
- Reduce `max_results` from 3 to 2
- Increase `time.sleep()` from 3 to 5 seconds
- Run script in smaller batches

### Error: "Failed to update database"
**Solution:** Check village ID exists in `retirement_villages` table

### Script Stops Midway
**Solution:** Google Colab has a timeout. To resume:
1. Note the last successful village ID
2. Filter CSV to start from that village
3. Re-run script with filtered CSV

---

## 📊 Expected Results

### What You'll Get:

- ✅ **2-3 images per village** (most villages)
- ✅ **Public URLs** from your Supabase Storage
- ✅ **Permanent hosting** (no broken links!)
- ✅ **Fast CDN delivery** via Supabase
- ✅ **Full control** over all images

### Success Rate:

- **Target:** 85-95% success rate
- **Common failures:** Very small villages with no online presence
- **Can retry** failed villages with different search terms

---

## 🎯 After Scraping

1. **Check your Supabase Storage:**
   - Go to **Storage** → **village-images** bucket
   - You should see folders named by village IDs
   - Each folder contains 1-3 .jpg files

2. **Verify in RetirePath:**
   - Go to **Village Directory** tab
   - Images should now appear on village cards
   - Click any village to see full image gallery

3. **Missing images?**
   - Some villages may still show placeholders
   - You can manually add images via **Test Image Upload** tab
   - Or retry scraping with modified search queries

---

## 🔐 Security Notes

- ⚠️ **Service Role Key** bypasses all security rules - keep it secret!
- ✅ **Storage bucket is public** - images are viewable by anyone (intended)
- ✅ **Database updates** require Service Role Key (secure)
- ❌ **Never commit keys** to version control

---

## 💡 Tips for Better Results

1. **Custom Search Queries:**
   - Modify the query string for specific villages
   - Example: Include operator name for better matches

2. **Batch Processing:**
   - Process by state (NSW first, then VIC, etc.)
   - Easier to monitor and troubleshoot

3. **Rate Limiting:**
   - Don't reduce `time.sleep()` below 2 seconds
   - Google may temporarily block your IP

4. **Image Quality:**
   - Script automatically resizes to 1200x800px
   - Converts all formats to JPEG (85% quality)
   - Optimizes file sizes for fast loading

---

## 📞 Support

If you encounter issues:
1. Check the **troubleshooting section** above
2. Review error messages in Colab console
3. Verify Supabase Storage bucket exists and is public
4. Test with 1-2 villages first before running full batch

---

**Happy Scraping! 🚀**
