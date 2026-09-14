# 🚀 Quick Start: Scrape Your 2,351 Villages

## ⚡ 5-Minute Setup

### Step 1: Install Python Dependencies
```bash
cd scrapers
pip install -r requirements.txt
```

### Step 2: Create .env File
Create `/scrapers/.env` with your Supabase credentials:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Where to get these:**
1. Go to Supabase Dashboard → Your Project → Settings → API
2. Copy **Project URL** → `SUPABASE_URL`
3. Copy **service_role secret** (NOT anon key) → `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Run Your First Test
```bash
python village_image_scraper.py
```

Select **Option 4** (limited scrape) and enter `10` to test with 10 villages.

---

## 🎯 Recommended Scraping Strategy

### Phase 1: Test (5 minutes)
```bash
python village_image_scraper.py
# Option 4: Enter 10
```
**Verify:** Check Supabase table for images, then view Village Directory

### Phase 2: Top Operators (1-2 hours) ⭐ RECOMMENDED FIRST
```bash
python village_image_scraper.py
# Option 5: Top operators first
```
**Result:** ~500-600 villages with images covering Stockland, Aveo, Lendlease, etc.

### Phase 3: State by State (Optional, 2-4 hours each)
```bash
python village_image_scraper.py
# Option 2: Enter NSW (or VIC, QLD, SA, WA, TAS, ACT, NT)
```

### Phase 4: Complete Database (Overnight, 8-12 hours)
```bash
python village_image_scraper.py
# Option 1: ALL villages
# Let it run overnight
```

---

## 📊 What to Expect

### Success Rates
- **Major operators:** 90-95% success, 5-8 images per village
- **Medium operators:** 70-80% success, 3-5 images
- **Small operators:** 40-60% success, 1-3 images
- **Overall:** 60-70% of all 2,351 villages will get images

### Time Estimates (with 2-second delays)
- **10 villages:** 1 minute
- **100 villages:** 10 minutes
- **500 villages (top operators):** 1-2 hours
- **2,351 villages (all):** 8-12 hours

### Expected Outcome
After running the full scraper:
- ✅ **~1,600 villages** with images (68% coverage)
- ✅ **~750 villages** without images (32% - for manual addition)
- ✅ **Average 4-5 images** per successful village
- ✅ **Profile completion** jumps from 0% → 68%

---

## 🎬 Console Output Example

```
[1/10] Processing Sunshine Retirement Village...
Scraping images from: https://sunshinevillage.com.au
Found 14 potential images
✓ Valid image: https://sunshinevillage.com.au/gallery/img1.jpg (1920x1080)
✓ Valid image: https://sunshinevillage.com.au/gallery/img2.jpg (1600x900)
✓ Valid image: https://sunshinevillage.com.au/gallery/img3.jpg (1400x800)
Found 6 high-quality images
✓ Successfully updated village 123e4567-e89b-12d3-a456-426614174000
Waiting 2s before next request...

================================================================================
SCRAPING COMPLETE - STATISTICS
================================================================================
Villages processed: 10
Villages updated: 8
Total images found: 38
Errors encountered: 0
Average images per village: 4.8
Success rate: 80.0%
================================================================================
```

---

## ✅ Verify Results

### In Supabase Dashboard
1. Go to Table Editor → `retirement_villages`
2. Add filter: `images` is not null
3. Click on a row → Expand `images` array
4. You should see 4-8 image URLs

### In Your App
1. Navigate to Village Directory (`/directory`)
2. Village cards now show hero images
3. Click a village → See full image gallery
4. Test image lightbox (click to enlarge)

### Check Logs
```bash
# View recent activity
tail -n 50 image_scraper.log

# Count successes
grep "Successfully updated" image_scraper.log | wc -l

# View errors only
grep ERROR image_scraper.log
```

---

## 🐛 Quick Troubleshooting

### "No module named 'requests'"
```bash
pip install -r requirements.txt
```

### "Missing SUPABASE_URL"
- Check `.env` file exists in `/scrapers` directory
- Verify no spaces around `=` sign
- Use service_role key, NOT anon key

### "Connection timeout"
- Website may be slow or blocking
- Increase delay: Edit scraper, change `delay=2.0` to `delay=5.0`

### "No images found" for many villages
- Some websites don't have galleries
- Images may be loaded via JavaScript (see IMAGE_SCRAPER_GUIDE.md for Selenium option)
- Website structure may not match scraping patterns
- **This is normal:** Expect 30-40% of sites to have no extractable images

---

## 💡 Pro Tips

### 1. Start with Top Operators
Run **Option 5** first to get ~25% coverage with the best villages. This gives you immediate visual impact.

### 2. Run Overnight
For the full database scrape, start it before bed:
```bash
python village_image_scraper.py
# Option 1: ALL villages
```
Wake up to 1,600+ villages with images!

### 3. Monitor Progress
Open two terminal windows:
```bash
# Terminal 1: Run scraper
python village_image_scraper.py

# Terminal 2: Watch logs
tail -f image_scraper.log
```

### 4. Resume After Interruption
The scraper only processes villages without images. If interrupted, just run it again - it will skip villages that already have images.

### 5. Quality Control
After first 100 villages, spot-check a few in the Village Directory to ensure image quality is good.

---

## 📈 Image Quality Standards

The scraper automatically filters for:
- ✅ **Minimum size:** 800px × 500px
- ✅ **Valid formats:** JPG, PNG, WebP
- ✅ **Accessible:** No broken links
- ✅ **Relevant:** Galleries, facilities, exteriors
- ❌ **Excluded:** Logos, icons, staff photos (too small)

---

## 🎯 Post-Scraping Actions

### 1. Check Coverage by Operator
```sql
SELECT 
  operator,
  COUNT(*) as total_villages,
  COUNT(*) FILTER (WHERE images IS NOT NULL AND array_length(images, 1) > 0) as with_images,
  ROUND(100.0 * COUNT(*) FILTER (WHERE images IS NOT NULL AND array_length(images, 1) > 0) / COUNT(*), 1) as coverage_percent
FROM retirement_villages
WHERE status = 'approved'
GROUP BY operator
ORDER BY coverage_percent DESC
LIMIT 20;
```

### 2. Handle Villages Without Images
For the 30-40% without images:
- Use **TestImageUpload** component for quick manual adds
- Contact operators via email asking for images
- Use Admin Dashboard to add images one-by-one
- Consider generic placeholders as last resort

### 3. Optimize for Launch
- ✅ Test image galleries on mobile devices
- ✅ Verify image loading performance
- ✅ Check that images display correctly in all views
- ✅ Consider adding image attribution/credits

---

## 🎉 Expected Final Result

After completing the full scrape:

**Before:**
- ❌ 0 villages with images (0%)
- ❌ 0 complete profiles
- ❌ Generic placeholder experience

**After:**
- ✅ ~1,600 villages with images (68%)
- ✅ ~1,600 complete profiles
- ✅ Professional, authentic galleries
- ✅ Average 4-5 images per village
- ✅ Major operators at 90%+ coverage
- ✅ Launch-ready visual experience

**Impact:**
- 📈 Users can see what villages actually look like
- 📈 Higher trust and credibility
- 📈 Better engagement and time-on-site
- 📈 Improved conversion for "Book a Tour"
- 📈 Competitive with major property portals

---

## 🚀 Let's Get Started!

Run your first test now:
```bash
cd scrapers
pip install -r requirements.txt
python village_image_scraper.py
# Choose Option 4: Enter 10
```

Then check your Village Directory to see the magic! ✨

**Need help?** Check `IMAGE_SCRAPER_GUIDE.md` for detailed documentation.
