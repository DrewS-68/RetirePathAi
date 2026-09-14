# 📸 Village Image Scraper Guide

## Overview

The **Village Image Scraper** automatically extracts high-quality images from retirement village websites and populates your database. This solves the critical issue of having **ZERO images across all 2,351 villages**.

---

## 🎯 What It Does

1. ✅ Fetches villages from Supabase that have websites but no images
2. ✅ Visits each village website
3. ✅ Intelligently extracts relevant images using multiple strategies
4. ✅ Filters for high-quality images (min 800x500px)
5. ✅ Updates the database with up to 8 images per village
6. ✅ Logs all activity for monitoring and debugging
7. ✅ Respects rate limits to avoid overloading servers

---

## 📋 Prerequisites

### 1. Python Installation

**Download Python 3.9 or higher:**
- Windows: https://python.org/downloads (check "Add to PATH")
- Mac: `brew install python3`
- Linux: Usually pre-installed

Verify installation:
```bash
python --version
# or
python3 --version
```

### 2. Install Dependencies

Navigate to the `/scrapers` directory:

```bash
cd scrapers
pip install -r requirements.txt
```

Or install manually:
```bash
pip install requests beautifulsoup4 pillow python-dotenv supabase lxml
```

### 3. Set Up Environment Variables

Create a `.env` file in the `/scrapers` directory:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Where to find these:**
1. Go to your Supabase Dashboard
2. Select your RetirePath project
3. Click "Settings" → "API"
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (NOT anon key!) → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **IMPORTANT:** Never commit the `.env` file to git! It contains secret keys.

---

## 🚀 How to Use

### Quick Start (Test Mode)

Start with a small test to verify everything works:

```bash
python village_image_scraper.py
```

Then select option **4** (test mode) and enter `10` to scrape just 10 villages.

### Scraping Options

When you run the scraper, you'll see 5 options:

#### Option 1: Scrape ALL Villages
- Scrapes every village in the database
- **Warning:** Could take 8-12 hours for 2,351 villages
- Best run overnight or on a server

#### Option 2: Scrape by State
- Target a specific state (NSW, VIC, QLD, etc.)
- Useful for testing or prioritizing certain regions
- Example: Scrape all 800+ NSW villages first

#### Option 3: Scrape by Operator
- Target a specific operator (e.g., "Stockland", "Aveo")
- Perfect for getting high-value villages first
- Example: Scrape all Stockland villages (50+ villages)

#### Option 4: Limited Scrape (Testing)
- Scrape a specific number of villages
- **Recommended for first run:** Try 10-20 villages
- Verify images appear correctly before full run

#### Option 5: Top Operators First (⭐ RECOMMENDED)
- Automatically scrapes villages from major operators:
  - Stockland (50+ villages)
  - Aveo Group (40+ villages)
  - Lendlease (30+ villages)
  - Ingenia Communities (30+ villages)
  - Retire Australia (20+ villages)
  - Lifestyle Communities (15+ villages)
  - Gateway Lifestyle (15+ villages)
  - Hometown Australia (10+ villages)
  - Living Choice (10+ villages)
- **Covers ~25% of your database** with high-quality villages
- Estimated time: 1-2 hours

---

## 🎬 Recommended Workflow

### Phase 1: Test (5 minutes)
```bash
python village_image_scraper.py
# Choose option 4: Limited scrape
# Enter: 10
```

**Check Results:**
1. Go to Supabase Dashboard → `retirement_villages` table
2. Look for villages with populated `images` array
3. Visit your Village Directory to see images displayed
4. Verify images are appropriate and high-quality

### Phase 2: Top Operators (1-2 hours)
```bash
python village_image_scraper.py
# Choose option 5: Top operators first
```

This gives you ~500+ villages with images covering major brands.

### Phase 3: State by State (4-8 hours)
```bash
# Scrape NSW (largest state)
python village_image_scraper.py
# Choose option 2: State
# Enter: NSW

# Then repeat for VIC, QLD, SA, WA, etc.
```

### Phase 4: Complete Database (overnight)
```bash
python village_image_scraper.py
# Choose option 1: ALL villages
# Let it run overnight
```

---

## 🔍 How It Works

### Image Extraction Strategies

The scraper uses 4 intelligent strategies to find images:

#### Strategy 1: Gallery/Slider Detection
Looks for common gallery HTML patterns:
- `<div class="gallery">`, `<div class="slider">`
- `<ul class="image-gallery">`, `<section class="photos">`
- Extracts all images from these sections

#### Strategy 2: Hero/Banner Images
Finds prominent images:
- Hero sections, banners, featured images
- Usually the best quality images on the site

#### Strategy 3: Keyword-Based Detection
Searches image alt/title text for relevant keywords:
- "retirement village", "community", "facility"
- "building", "garden", "pool", "exterior", "interior"
- Avoids logos, icons, staff photos

#### Strategy 4: CSS Background Images
Extracts images set as CSS backgrounds:
- `background-image: url(...)`
- Often used for high-quality hero images

### Image Quality Filtering

Every image is checked for:
- ✅ Minimum size: 800px width × 500px height
- ✅ Valid image format (JPG, PNG, WebP)
- ✅ Accessible URL (not broken links)
- ✅ Appropriate content type (image/jpeg, etc.)

**Result:** Only high-quality, professional images are saved.

---

## 📊 What to Expect

### Success Rates

Based on website quality:
- **Major operators (Stockland, Aveo):** 90-95% success rate, 5-8 images per village
- **Medium operators:** 70-80% success rate, 3-5 images per village
- **Small operators:** 40-60% success rate, 1-3 images per village
- **Overall expected:** 60-70% of villages will get images

### Time Estimates

With 2-second delay between requests (respectful scraping):
- **10 villages:** ~1 minute
- **100 villages:** ~10 minutes
- **500 villages (top operators):** ~1-2 hours
- **2,351 villages (complete):** ~8-12 hours

### Output Files

- `image_scraper.log`: Detailed log of all activity
  - Which villages were processed
  - How many images found per village
  - Any errors or warnings
  - Final statistics

---

## 🐛 Troubleshooting

### "No module named 'requests'"
**Solution:**
```bash
pip install -r requirements.txt
```

### "Missing SUPABASE_URL"
**Solution:**
- Verify `.env` file exists in `/scrapers` directory
- Check that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- No spaces around the `=` sign

### "Connection timeout" or "403 Forbidden"
**Solution:**
- Website may be blocking automated requests
- The scraper already uses realistic browser headers
- Try increasing delay: Edit `village_image_scraper.py` line with `delay=2.0` → `delay=5.0`
- Some sites require JavaScript (see Advanced Options below)

### "No images found" for many villages
**Possible reasons:**
1. Website doesn't have image galleries
2. Images are loaded via JavaScript (requires Selenium)
3. Images are embedded in iframes
4. Website structure doesn't match scraping patterns

**Solution:**
- Check the website manually to see if images exist
- For JavaScript-heavy sites, see Advanced Options below

### Images saved are wrong (logos, icons, etc.)
**Solution:**
- The scraper already filters by size (800x500 minimum)
- You can increase minimum size in the code:
  ```python
  self.MIN_WIDTH = 1200  # Default: 800
  self.MIN_HEIGHT = 800  # Default: 500
  ```

---

## 🔧 Advanced Options

### Increase Image Quality Standards

Edit `village_image_scraper.py`:

```python
class VillageImageScraper:
    def __init__(self):
        # ... existing code ...
        
        self.MIN_WIDTH = 1200  # Increase from 800
        self.MIN_HEIGHT = 800  # Increase from 500
        self.MAX_IMAGES_PER_VILLAGE = 10  # Increase from 8
```

### Handle JavaScript-Heavy Websites

Some modern websites load images via JavaScript. For these, you need Selenium:

1. **Install Selenium:**
```bash
pip install selenium webdriver-manager
```

2. **Create a Selenium version:**
```bash
# I can provide a Selenium-based scraper if needed
# It's slower but works with JavaScript sites
```

### Custom Operator List

Edit the `top_operators` list in `village_image_scraper.py`:

```python
top_operators = [
    'Your Custom Operator 1',
    'Your Custom Operator 2',
    # Add more operators here
]
```

### Adjust Scraping Speed

Edit the `delay` parameter:

```python
# Faster (less respectful - use carefully!)
scraper.run(delay=1.0)

# Slower (more respectful - recommended)
scraper.run(delay=3.0)

# Very slow (for sites that rate-limit)
scraper.run(delay=5.0)
```

---

## 📈 Monitoring Progress

### Real-Time Monitoring

Watch the console output:
```
[1/100] Processing Sunshine Village...
Scraping images from: https://sunshinevillage.com.au
Found 12 potential images
✓ Valid image: https://sunshinevillage.com.au/img1.jpg (1920x1080)
✓ Valid image: https://sunshinevillage.com.au/img2.jpg (1600x900)
Found 5 high-quality images
✓ Successfully updated village abc-123-def
```

### Check Log File

```bash
# View last 50 lines
tail -n 50 image_scraper.log

# Search for errors
grep ERROR image_scraper.log

# Count successful updates
grep "Successfully updated" image_scraper.log | wc -l
```

### Verify in Supabase

1. Open Supabase Dashboard
2. Go to Table Editor → `retirement_villages`
3. Add filter: `images` is not null
4. See villages with images populated

### Check in Your App

1. Navigate to Village Directory
2. You should see village cards with images
3. Click a village to see the full gallery
4. Verify images are high-quality and relevant

---

## 📝 Legal & Ethical Considerations

### ✅ What's Okay

- Scraping publicly accessible images
- Visiting websites like a normal browser
- Extracting factual information (addresses, phone numbers)
- Using images already on public websites

### ⚠️ Important Guidelines

1. **Respect robots.txt:** The scraper includes delays between requests
2. **Don't overload servers:** Use 2-5 second delays minimum
3. **Public images only:** Only scrapes images accessible to any visitor
4. **No private areas:** Doesn't log in or access password-protected content
5. **Terms of Service:** Check if website ToS prohibits scraping

### 🔒 Best Practices

- ✅ Use reasonable delays (2+ seconds)
- ✅ Respect rate limits
- ✅ Use realistic browser headers (already configured)
- ✅ Only run during off-peak hours for large scrapes
- ✅ Stop if you receive 429 (Too Many Requests) errors

### 🎯 Fair Use

- Images are used to represent the actual retirement villages
- Helps users make informed decisions
- No modification of images
- Links back to original village websites
- Similar to how Google Images or property portals operate

---

## 📊 After Scraping

### 1. Verify Image Quality

Spot-check random villages:
- Are images appropriate?
- Are they high-resolution?
- Do they represent the village well?

### 2. Handle Villages Without Images

For villages where scraping failed:
- Manually add images via Admin Dashboard
- Contact operators asking for images
- Use TestImageUpload tool for quick manual adds
- Consider generic placeholders as last resort

### 3. Optimize Database

```sql
-- Count villages with images
SELECT 
  COUNT(*) FILTER (WHERE images IS NOT NULL AND array_length(images, 1) > 0) as with_images,
  COUNT(*) FILTER (WHERE images IS NULL OR array_length(images, 1) = 0) as without_images,
  COUNT(*) as total
FROM retirement_villages
WHERE status = 'approved';

-- Find operators with best image coverage
SELECT 
  operator,
  COUNT(*) as total_villages,
  COUNT(*) FILTER (WHERE images IS NOT NULL AND array_length(images, 1) > 0) as villages_with_images,
  ROUND(100.0 * COUNT(*) FILTER (WHERE images IS NOT NULL AND array_length(images, 1) > 0) / COUNT(*), 1) as coverage_percent
FROM retirement_villages
WHERE status = 'approved'
GROUP BY operator
ORDER BY coverage_percent DESC
LIMIT 20;
```

---

## 🎯 Success Metrics

After running the scraper, you should achieve:

**Target Goals:**
- ✅ 60-70% of villages have at least 1 image
- ✅ 40-50% have 3+ images  
- ✅ 25-30% have 5+ images (full galleries)
- ✅ Top operators have 90%+ coverage

**This transforms your platform from:**
- ❌ 0% complete profiles (no images)
- ✅ 60-70% complete profiles (with images)

**User Impact:**
- 📈 Higher engagement (users spend more time browsing)
- 📈 Better trust (real images = authentic listings)
- 📈 Improved conversion (image galleries drive inquiries)
- 📈 Professional appearance (ready for marketing/launch)

---

## 🆘 Support

### Common Questions

**Q: How long should I wait between runs?**
A: Wait at least 24 hours. Websites may block repeated access.

**Q: Can I run this on a server?**
A: Yes! Perfect for a cloud server or VPS. Run it in the background:
```bash
nohup python village_image_scraper.py > scraper_output.log 2>&1 &
```

**Q: What if I want to re-scrape villages?**
A: The scraper only processes villages without images. To re-scrape, you'll need to clear existing images first (or modify the query).

**Q: Is this legal?**
A: Generally yes for public images, but always check specific website Terms of Service and consult your legal advisor before launch.

### Next Steps

After scraping images successfully:
1. ✅ Review image quality in Village Directory
2. ✅ Test image galleries on Village Profile pages
3. ✅ Check mobile responsiveness with images
4. ✅ Consider adding image credits/attributions
5. ✅ Continue with other launch preparations

---

## 📞 Need Help?

If the scraper isn't working:
1. Check `image_scraper.log` for error messages
2. Verify `.env` file is configured correctly
3. Test with a small sample (10 villages) first
4. Check if you can manually access the village websites
5. Ensure Python and all dependencies are installed

**Happy scraping! 🎉**
