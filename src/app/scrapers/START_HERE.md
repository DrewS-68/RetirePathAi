# 🎯 START HERE: Image Scraping for RetirePath

## 📊 Current Situation
- **Total Villages:** 2,351 ✅
- **Villages with Images:** 0 ❌
- **Profile Completion:** 0% (missing images)
- **Target:** 60-70% coverage (1,400-1,600 villages with images)

---

## 🚀 Quick Start (15 minutes to first results)

### 1️⃣ Install Dependencies (5 min)
```bash
cd scrapers
pip install -r requirements.txt
```

### 2️⃣ Configure Supabase (5 min)
```bash
cp .env.example .env
# Edit .env and add your Supabase credentials
```

**Get credentials from:**
- Supabase Dashboard → Settings → API
- Copy `Project URL` → `SUPABASE_URL`
- Copy `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

### 3️⃣ Test Setup (5 min)
```bash
python quick_test.py
```

This scrapes 5 villages to verify everything works.

### 4️⃣ Verify Results
- Go to Supabase Dashboard → `retirement_villages` table
- Filter: `images IS NOT NULL`
- You should see 3-4 villages with image arrays

---

## 📚 Documentation Files

| File | Purpose | When to Use |
|------|---------|-------------|
| **START_HERE.md** | This file - quick overview | First time setup |
| **SETUP_CHECKLIST.md** | Step-by-step setup verification | If having issues |
| **QUICK_START_SCRAPING.md** | Scraping strategies & commands | When ready to scrape |
| **IMAGE_SCRAPER_GUIDE.md** | Complete technical documentation | Advanced usage |
| **QUICK_REFERENCE.md** | Command cheat sheet | Quick reference |

---

## 🎬 Scraping Strategy

### Phase 1: Test (5 minutes) ✅ START HERE
```bash
python quick_test.py
```
**Result:** 3-4 villages with images (test successful)

### Phase 2: Top Operators (1-2 hours) ⭐ RECOMMENDED NEXT
```bash
python village_image_scraper.py
# Choose Option 5: Top operators first
```
**Result:** ~500-600 villages with images (25% coverage)

**Covers:**
- Stockland (50+ villages)
- Aveo Group (40+ villages)
- Lendlease (30+ villages)
- Ingenia Communities (30+ villages)
- Retire Australia (20+ villages)
- Lifestyle Communities (15+ villages)
- Gateway Lifestyle (15+ villages)
- Hometown Australia (10+ villages)
- Living Choice (10+ villages)

### Phase 3: Full Database (Overnight, 8-12 hours)
```bash
python village_image_scraper.py
# Choose Option 1: ALL villages
```
**Result:** ~1,600 villages with images (68% coverage)

---

## 📊 Check Your Progress Anytime

```bash
python check_coverage.py
```

Shows:
- Overall coverage percentage
- Breakdown by state
- Breakdown by operator
- Recommendations for what to scrape next

---

## 🎯 Expected Results

### After Phase 1 (Test)
- ✅ 3-4 villages with images
- ✅ Setup verified working
- ✅ ~15-20 total images in database

### After Phase 2 (Top Operators)
- ✅ ~500-600 villages with images (25% coverage)
- ✅ All major brands represented
- ✅ ~2,500-3,000 total images
- ✅ Launch-ready for marketing materials

### After Phase 3 (Full Scrape)
- ✅ ~1,600 villages with images (68% coverage)
- ✅ ~7,000-8,000 total images
- ✅ Average 4-5 images per village
- ✅ Professional, complete directory

---

## 🛠 Available Scripts

### Main Scraper
```bash
python village_image_scraper.py
```
Interactive script with 5 options:
1. Scrape ALL villages (overnight, ~8-12 hours)
2. Scrape specific state (NSW, VIC, QLD, etc.)
3. Scrape specific operator (Stockland, Aveo, etc.)
4. Limited scrape for testing (specify number)
5. Top operators first ⭐ RECOMMENDED

### Quick Test
```bash
python quick_test.py
```
Scrapes just 5 villages to verify setup.

### Coverage Check
```bash
python check_coverage.py
```
Shows statistics:
- Overall coverage percentage
- Coverage by state
- Coverage by operator
- Recommendations

---

## 📋 Scraping Options Explained

### Option 1: Scrape ALL Villages
- **Time:** 8-12 hours
- **Result:** ~1,600 villages with images (68%)
- **Best for:** Complete database coverage
- **Run:** Overnight or on a server

### Option 2: Scrape by State
- **Example:** NSW (800+ villages), VIC (600+ villages)
- **Time:** 2-4 hours per state
- **Best for:** Regional targeting or testing
- **Use case:** "I want to launch NSW first"

### Option 3: Scrape by Operator
- **Example:** "Stockland" (50+ villages)
- **Time:** 5-30 minutes per operator
- **Best for:** Targeting specific brands
- **Use case:** "I want Stockland villages first"

### Option 4: Limited Scrape
- **Example:** 10, 50, 100 villages
- **Time:** 1-20 minutes
- **Best for:** Testing or gradual rollout
- **Use case:** "Let me test with 20 villages first"

### Option 5: Top Operators ⭐ RECOMMENDED
- **Operators:** Top 9 major brands (see Phase 2 above)
- **Time:** 1-2 hours
- **Result:** ~500-600 villages (25% coverage)
- **Best for:** Quick high-value coverage
- **Use case:** "Give me the best villages fast"

---

## 🎯 Recommended Workflow

```bash
# Day 1: Setup and Test (15 min)
cd scrapers
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials
python quick_test.py

# Check results in Supabase
# Verify images in Village Directory

# Day 1: Top Operators (1-2 hours)
python village_image_scraper.py
# Choose Option 5

# Check progress
python check_coverage.py
# Should show ~25% coverage

# Day 2: Full Scrape (overnight)
python village_image_scraper.py
# Choose Option 1
# Let it run overnight

# Next morning: Check results
python check_coverage.py
# Should show ~68% coverage
```

---

## 📊 Success Metrics

### Minimum Viable Coverage (for launch)
- ✅ 40% of villages have images (~940 villages)
- ✅ Top 10 operators have 80%+ coverage
- ✅ Each state has at least 30% coverage

### Target Coverage (professional launch)
- ✅ 60% of villages have images (~1,400 villages)
- ✅ Top 20 operators have 90%+ coverage
- ✅ Each state has at least 50% coverage

### Optimal Coverage (best-in-class)
- ✅ 70%+ of villages have images (~1,600+ villages)
- ✅ Major operators have 95%+ coverage
- ✅ Average 5+ images per village
- ✅ All states above 60% coverage

---

## 🐛 Troubleshooting

### "No module named 'requests'"
```bash
pip install -r requirements.txt
```

### "Missing SUPABASE_URL"
- Check `.env` file exists in `/scrapers` directory
- Verify credentials are correct
- Use `service_role` key, not `anon` key

### "No images found"
- Normal for 30-40% of villages
- Some sites don't have galleries
- Some require JavaScript (see IMAGE_SCRAPER_GUIDE.md)

### More help
See **SETUP_CHECKLIST.md** for detailed troubleshooting.

---

## 🎉 You're Ready!

### Right Now:
```bash
cd scrapers
python quick_test.py
```

### Then:
```bash
python village_image_scraper.py
# Choose Option 5: Top operators
```

### Monitor Progress:
```bash
python check_coverage.py
```

---

## 📞 Next Steps After Scraping

1. **Verify Quality**
   - Check Village Directory for images
   - Test image galleries on Village Profiles
   - Spot-check random villages for quality

2. **Handle Missing Images**
   - Use `check_coverage.py` to find operators at 0%
   - Contact operators directly for images
   - Use TestImageUpload component for manual adds
   - Consider generic placeholders as last resort

3. **Optimize for Launch**
   - Test image loading performance
   - Verify mobile responsiveness
   - Check image galleries work on all browsers
   - Add image attribution if needed

4. **Track Metrics**
   - Monitor "Book a Tour" conversion rates
   - Track user engagement with image galleries
   - A/B test villages with vs without images
   - Measure time-on-site for complete profiles

---

## ✨ Final Checklist Before Full Scrape

- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] `.env` configured with Supabase credentials
- [ ] `quick_test.py` completed successfully
- [ ] At least 3-4 test villages have images in database
- [ ] Images display in Village Directory
- [ ] Image galleries work on Village Profile pages
- [ ] No critical errors in `image_scraper.log`
- [ ] Ready to run overnight or for several hours

**If all checked, proceed with Phase 2 or Phase 3!** 🚀

---

**Documentation:** See other .md files in this directory for detailed guides.

**Questions?** Check `IMAGE_SCRAPER_GUIDE.md` for comprehensive documentation.

**Good luck! You're about to transform your platform from 0% → 68% image coverage!** 🎉
