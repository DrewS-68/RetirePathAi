# 🚀 Quick Reference Card

## Setup Commands
```bash
# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Test setup
python quick_test.py

# Check coverage
python check_coverage.py
```

## Scraping Commands

```bash
# Interactive scraper (recommended)
python village_image_scraper.py

# Quick test (5 villages)
python quick_test.py
```

## Scraper Options

| Option | Purpose | Time | Result |
|--------|---------|------|--------|
| **1** | ALL villages | 8-12 hours | ~1,600 villages (68%) |
| **2** | By state | 2-4 hours | One state complete |
| **3** | By operator | 5-30 min | One operator complete |
| **4** | Limited test | 1-20 min | N villages |
| **5** | Top operators ⭐ | 1-2 hours | ~500 villages (25%) |

## Monitoring

```bash
# Check progress
python check_coverage.py

# View recent logs
tail -n 50 image_scraper.log

# Watch logs in real-time
tail -f image_scraper.log

# Count successes
grep "Successfully updated" image_scraper.log | wc -l

# View errors only
grep ERROR image_scraper.log
```

## Supabase Queries

```sql
-- Count villages with images
SELECT COUNT(*) FROM retirement_villages 
WHERE images IS NOT NULL 
AND array_length(images, 1) > 0
AND status = 'approved';

-- Coverage by state
SELECT 
  state,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE images IS NOT NULL AND array_length(images, 1) > 0) as with_images,
  ROUND(100.0 * COUNT(*) FILTER (WHERE images IS NOT NULL AND array_length(images, 1) > 0) / COUNT(*), 1) as coverage_pct
FROM retirement_villages
WHERE status = 'approved'
GROUP BY state
ORDER BY coverage_pct DESC;

-- Villages without images
SELECT id, name, operator, state, website
FROM retirement_villages
WHERE status = 'approved'
AND (images IS NULL OR array_length(images, 1) = 0)
ORDER BY operator, name;

-- Top operators by coverage
SELECT 
  operator,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE images IS NOT NULL AND array_length(images, 1) > 0) as with_images,
  ROUND(100.0 * COUNT(*) FILTER (WHERE images IS NOT NULL AND array_length(images, 1) > 0) / COUNT(*), 1) as coverage_pct
FROM retirement_villages
WHERE status = 'approved'
GROUP BY operator
ORDER BY coverage_pct DESC
LIMIT 20;
```

## Recommended Workflow

```bash
# 1. Setup (5 min)
cd scrapers
pip install -r requirements.txt
cp .env.example .env
# Edit .env

# 2. Test (5 min)
python quick_test.py

# 3. Check results
python check_coverage.py

# 4. Top operators (1-2 hours) ⭐ RECOMMENDED
python village_image_scraper.py
# Choose Option 5

# 5. Full scrape (overnight)
python village_image_scraper.py
# Choose Option 1

# 6. Final check
python check_coverage.py
```

## Expected Success Rates

| Operator Type | Success Rate | Images/Village |
|---------------|--------------|----------------|
| Major (Stockland, Aveo) | 90-95% | 5-8 |
| Medium | 70-80% | 3-5 |
| Small | 40-60% | 1-3 |
| **Overall** | **60-70%** | **4-5** |

## File Locations

```
/scrapers/
├── village_image_scraper.py  # Main scraper
├── quick_test.py              # Test script
├── check_coverage.py          # Coverage stats
├── requirements.txt           # Dependencies
├── .env                       # Your credentials (create this)
├── .env.example              # Template
├── image_scraper.log         # Auto-generated log
├── START_HERE.md             # Overview
├── QUICK_START_SCRAPING.md   # Scraping guide
├── SETUP_CHECKLIST.md        # Setup verification
├── IMAGE_SCRAPER_GUIDE.md    # Full documentation
└── QUICK_REFERENCE.md        # This file
```

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| "No module named 'requests'" | `pip install -r requirements.txt` |
| "Missing SUPABASE_URL" | Check `.env` file exists and is configured |
| "Connection timeout" | Increase delay in scraper (edit delay=2.0 to 5.0) |
| "No images found" | Normal for 30-40% of sites |
| "Permission denied" | Use service_role key, not anon key |

## Key Metrics to Track

```bash
# Before scraping
python check_coverage.py
# Coverage: 0%

# After top operators (Phase 2)
python check_coverage.py
# Coverage: ~25% (500-600 villages)

# After full scrape (Phase 3)
python check_coverage.py
# Coverage: ~68% (1,600 villages)
```

## Environment Variables

```bash
# Required in .env file:
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...
```

## Scraper Configuration

Default settings in `village_image_scraper.py`:
- **Minimum image size:** 800px × 500px
- **Maximum images per village:** 8
- **Delay between requests:** 2.0 seconds
- **Request timeout:** 15 seconds

Edit these in the `__init__` method if needed.

## Support Resources

| Question | Resource |
|----------|----------|
| First time setup? | `START_HERE.md` |
| Setup not working? | `SETUP_CHECKLIST.md` |
| Ready to scrape? | `QUICK_START_SCRAPING.md` |
| Advanced features? | `IMAGE_SCRAPER_GUIDE.md` |
| Quick commands? | `QUICK_REFERENCE.md` (this file) |

## Success Checklist

- [ ] Dependencies installed
- [ ] .env configured
- [ ] quick_test.py successful
- [ ] Images visible in database
- [ ] Images display in app
- [ ] Ready for full scrape

## Launch Readiness

| Coverage | Status | Action |
|----------|--------|--------|
| 0-10% | 🟥 Not ready | Run scraper ASAP |
| 10-40% | 🟧 Minimum viable | Continue scraping |
| 40-60% | 🟨 Launch ready | Optional: scrape more |
| 60%+ | 🟩 Excellent | Ready to launch! |

---

**Quick Start:** `python quick_test.py` → `python village_image_scraper.py` (Option 5) → `python check_coverage.py`