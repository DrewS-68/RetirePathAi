# 📋 Image Scraper Setup Checklist

Use this checklist to ensure everything is configured correctly before running the scraper.

---

## ✅ Pre-Flight Checklist

### Step 1: Python Installation
- [ ] Python 3.9 or higher installed
- [ ] Verify with: `python --version` or `python3 --version`
- [ ] If not installed: Download from https://python.org/downloads

### Step 2: Navigate to Scrapers Directory
```bash
cd /path/to/your/RetirePath/scrapers
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

**Verify installation:**
```bash
pip list | grep requests
pip list | grep beautifulsoup4
pip list | grep Pillow
pip list | grep supabase
```

You should see all 4 packages listed.

### Step 4: Configure Environment Variables
- [ ] Copy `.env.example` to `.env`
  ```bash
  cp .env.example .env
  ```
- [ ] Open `.env` in a text editor
- [ ] Get your Supabase credentials:
  1. Go to https://app.supabase.com
  2. Select your RetirePath project
  3. Click **Settings** → **API**
  4. Copy **Project URL** → paste into `SUPABASE_URL`
  5. Copy **service_role secret** → paste into `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Save `.env` file
- [ ] **IMPORTANT:** Add `.env` to `.gitignore` (already done if using our template)

**Your .env should look like:**
```
SUPABASE_URL=https://abcdefghijk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 5: Verify Database Connection
```bash
python quick_test.py
```

**Expected output:**
```
✓ Environment variables found
Initializing scraper...
Found X villages without images
[1/5] Processing Sunshine Retirement Village...
```

If you see errors, see **Troubleshooting** section below.

### Step 6: Check First Results
- [ ] Go to Supabase Dashboard → Table Editor → `retirement_villages`
- [ ] Add filter: `images` is not null
- [ ] Expand `images` array on a row
- [ ] You should see 4-8 image URLs

**Example:**
```
images: [
  "https://villagewebsite.com/images/exterior.jpg",
  "https://villagewebsite.com/images/pool.jpg",
  "https://villagewebsite.com/images/garden.jpg",
  "https://villagewebsite.com/images/lounge.jpg"
]
```

### Step 7: Verify in Your App
- [ ] Start your RetirePath app
- [ ] Navigate to Village Directory
- [ ] Look for villages with images (no longer showing blue placeholder)
- [ ] Click on a village with images
- [ ] Verify image gallery displays correctly
- [ ] Test image lightbox (click image to enlarge)

---

## 🎯 Ready to Scrape!

If all checkboxes above are checked ✅, you're ready to scrape!

### Recommended First Run: Top Operators
```bash
python village_image_scraper.py
# Select Option 5: Top operators first
```

This will scrape ~500-600 villages from major operators (Stockland, Aveo, Lendlease, etc.) in 1-2 hours.

---

## 🐛 Troubleshooting

### ❌ "No module named 'requests'"
**Problem:** Dependencies not installed

**Solution:**
```bash
pip install -r requirements.txt
```

If that doesn't work, try:
```bash
pip3 install -r requirements.txt
# or
python -m pip install -r requirements.txt
```

---

### ❌ "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
**Problem:** .env file not configured or not in correct location

**Solution:**
1. Verify `.env` file exists in `/scrapers` directory (same folder as the script)
2. Open `.env` and check both variables are set
3. Ensure no spaces around the `=` sign
4. Make sure you're using `service_role` key, not `anon` key

**Test:**
```bash
# In /scrapers directory
cat .env
```

Should show:
```
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

### ❌ "Connection timeout" or "403 Forbidden"
**Problem:** Website is blocking the scraper or network issues

**Solution:**
1. Check your internet connection
2. Try accessing the village website manually in a browser
3. Increase delay between requests:
   - Edit `village_image_scraper.py`
   - Find line with `delay=2.0`
   - Change to `delay=5.0`
4. Some sites may require JavaScript (see Advanced section in IMAGE_SCRAPER_GUIDE.md)

---

### ❌ "No images found" for most villages
**Problem:** Could be normal or could indicate scraping issues

**Normal reasons:**
- 30-40% of village websites don't have extractable image galleries
- Some sites use JavaScript to load images (requires Selenium)
- Some sites have unusual HTML structures

**Check:**
1. Visit a few village websites manually
2. Do you see image galleries on their sites?
3. If yes, they may be JavaScript-loaded (see Selenium option)
4. If no, that's normal - not all sites have galleries

**Expected success rates:**
- Major operators: 90-95%
- Medium operators: 70-80%
- Small operators: 40-60%
- **Overall: 60-70% success is normal**

---

### ❌ "Permission denied" or "Database error"
**Problem:** Wrong Supabase key or database permissions

**Solution:**
1. Verify you're using `service_role` key, NOT `anon` key
   - The service_role key starts with `eyJ...` and is much longer
   - Find it in: Supabase Dashboard → Settings → API → service_role secret (click to reveal)
2. Ensure the `retirement_villages` table exists in your database
3. Check table has the `images` column (should be TEXT[] type)

---

### ❌ Python version issues
**Problem:** "SyntaxError" or compatibility issues

**Solution:**
1. Check Python version: `python --version`
2. Must be 3.9 or higher
3. If using older version, upgrade Python or use `python3` command:
   ```bash
   python3 village_image_scraper.py
   ```

---

## 📊 Monitoring Your Scrape

### Real-Time Console Output
Watch for:
- ✅ `✓ Successfully updated village` - good!
- ⚠️ `No suitable images found` - normal for some sites
- ❌ `ERROR` - investigate the log file

### Log File
```bash
# View last 50 lines
tail -n 50 image_scraper.log

# Watch in real-time
tail -f image_scraper.log

# Count successes
grep "Successfully updated" image_scraper.log | wc -l

# View errors only
grep ERROR image_scraper.log
```

### Supabase Dashboard
1. Go to Table Editor → `retirement_villages`
2. Add filter: `images IS NOT NULL`
3. Watch the count grow as scraping progresses
4. Click "Refresh" periodically to see new entries

---

## 🎯 Success Criteria

After running `quick_test.py` with 5 villages, you should have:

- ✅ At least 3-4 villages updated (60-80% success)
- ✅ Average 3-5 images per successful village
- ✅ Images visible in Village Directory
- ✅ Image gallery working on Village Profile pages
- ✅ No critical errors in log file

If you meet these criteria, proceed to full scraping!

If not, check the troubleshooting section or review `image_scraper.log` for specific errors.

---

## 🚀 Next Steps

Once setup is verified:

1. **Test Run (5 minutes)**
   ```bash
   python quick_test.py
   ```

2. **Top Operators (1-2 hours)** ⭐ RECOMMENDED
   ```bash
   python village_image_scraper.py
   # Option 5: Top operators first
   ```

3. **Full Database (overnight)**
   ```bash
   python village_image_scraper.py
   # Option 1: ALL villages
   ```

---

## 📞 Need More Help?

- **Quick reference:** `QUICK_START_SCRAPING.md`
- **Detailed guide:** `IMAGE_SCRAPER_GUIDE.md`
- **Check logs:** `image_scraper.log`
- **Test database:** Run SQL queries in Supabase SQL Editor

---

## ✨ Final Check

Before proceeding to full scrape, verify:

- [x] Python 3.9+ installed
- [x] All dependencies installed (`pip install -r requirements.txt`)
- [x] `.env` file configured with valid Supabase credentials
- [x] `quick_test.py` completed successfully
- [x] At least 1 village has images in database
- [x] Images display in Village Directory
- [x] No critical errors in `image_scraper.log`

**If all checked, you're ready! 🎉**

Run the full scraper and watch your database come to life with authentic village images!
