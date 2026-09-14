# TIER 2 PRICING SCRAPING GUIDE
## How to Use Web Scraper Tool for Pricing Data

**Date:** January 18, 2026
**Status:** READY TO USE

---

## QUICK START (3 Simple Steps)

### Step 1: Open Web Scraper Tool
1. Go to **Admin Dashboard**
2. Click **"Web Scraper Tool"** tab
3. You'll see the data completeness overview showing **549 scrapeable villages missing pricing**

### Step 2: Filter for Missing Pricing
1. Look for the **"Filter Mode"** dropdown (near top of page)
2. Select **"Missing Pricing"** from dropdown
3. The tool will show only villages that:
   - Have website URLs ✅
   - Are missing pricing data ❌
   - Are ready to scrape

### Step 3: Start Scraping
You have **2 options**:

#### OPTION A: Select & Scrape Manually (Recommended for testing)
1. Click **"Select All"** checkbox (or select specific villages)
2. Choose how many to scrape (e.g., 50 villages)
3. Click **"Start Scraping"** button
4. Wait for scraping to complete (~5-10 minutes for 50 villages)
5. Click **"Save to Database"** to save results

#### OPTION B: Batch Process All (For bulk scraping)
1. Set **Batch Size** to 50-100 villages
2. Click **"Select All"** (selects first batch)
3. Click **"Start Scraping"**
4. Wait for completion
5. Click **"Save to Database"**
6. Repeat for next batch

---

## WHAT THE SCRAPER EXTRACTS (TIER 2)

The scraper will automatically extract:

### Pricing Data:
- **Entry Price Min/Max** (e.g., $350,000 - $750,000)
- **Monthly Fees Min/Max** (e.g., $500 - $1,200/month)
- **Weekly Fees** (if applicable)

### Amenities:
- Swimming pool
- Gym/fitness center
- Library
- Community center
- Gardens
- Bowling greens
- Workshop/craft room
- etc.

### Care Services:
- Independent living
- Assisted living
- Dementia care
- 24/7 nursing
- etc.

---

## EXPECTED RESULTS

### Success Rate:
- **60-70% success** for pricing (websites vary in structure)
- **70-80% success** for amenities
- Not all websites have structured pricing data

### Processing Time:
- **~10-15 seconds** per village
- **50 villages**: ~10-15 minutes
- **549 villages**: ~2-3 hours total

### What Happens:
1. Tool fetches website HTML
2. Extracts pricing using pattern matching
3. Extracts amenities from lists/keywords
4. Saves data to Tier 2 fields in database
5. Shows results table with success/failure status

---

## AUTO-SAVE FEATURE

**IMPORTANT:** The tool does NOT auto-save by default!

After scraping completes:
1. Review the results table
2. Check **"Success"** count
3. Click **"Save to Database"** button to save all successful results
4. Database will be updated immediately

---

## PROGRESS TRACKING

You'll see real-time updates:
- **Progress bar** showing X / Y villages
- **Success count** (green)
- **Error count** (red)
- **Pending count** (blue)

---

## AFTER SCRAPING

### Review Results:
-Look at the results table
- Green checkmark = Success (pricing found)
- Red X = Error (no pricing found or scraping failed)
- Click village name to see what data was extracted

### Save Results:
- Click **"Save to Database"** button
- All successful results save automatically
- Failed villages can be retried manually later

### Failed Villages:
For villages that failed:
- Website might not have pricing listed
- Website structure might be incompatible
- Manual data entry may be needed

---

## TROUBLESHOOTING

### No villages showing after selecting filter?
- Make sure you selected **"Missing Pricing"** filter
- Check that villages have website URLs
- Try refreshing the page

### Scraping taking too long?
- Reduce batch size to 25-50 villages
- Some websites are slow to load
- Edge function might be rate-limited (wait 1-2 minutes)

### Many villages showing "Error"?
- This is normal! Not all websites have structured pricing
- Expected: 30-40% will fail to find pricing
- These can be manually entered later or scraped with different patterns

### "Worker Limit" or "546" error?
- Edge function is overloaded
- Wait 1-2 minutes
- Try smaller batch sizes (25 instead of 50)
- The system will retry automatically

---

## TIPS FOR BEST RESULTS

### Start Small:
- Test with 10-20 villages first
- Check success rate
- Then scale up to 50-100 per batch

### Process by Operator:
- Large operators (Aveo, Lendlease, Stockland) have consistent website structures
- Scraping by operator = higher success rates
- Filter by operator in the village list

### Review Before Saving:
- Check a few sample results
- Verify pricing looks reasonable
- Ensure amenities are accurate

### Save Frequently:
- Don't scrape 500 villages without saving
- Save after each 50-100 village batch
- Results are stored in localStorage but can be lost

---

## DATABASE IMPACT

After saving:
- **Villages table updated** with pricing data
- **entry_price_min / entry_price_max** fields populated
- **monthly_fees_min / monthly_fees_max** fields populated
- **amenities** array populated
- **care_services** array populated

Database Completeness will improve:
- Before: **70% complete** (pricing)
- After: **~85-90% complete** (pricing)

---

## NEXT STEPS AFTER TIER 2

Once pricing scraping is complete:

### 1. Review & Clean Data
- Spot-check 20-30 random villages
- Verify pricing looks accurate
- Fix any obvious errors

### 2. Handle Failed Villages
- ~150-200 villages may have failed
- Can retry with manual search
- Or enter data manually from operator websites

### 3. Move to Tier 3 (Optional)
- Scrape descriptions
- Scrape additional images
- Extract detailed features
- Lower priority - nice to have

### 4. Prepare for Launch
- Database will be 85-90% complete
- Good enough for launch
- Can continue improving post-launch

---

## SUMMARY CHECKLIST

Before you start:
- [ ] Open Admin Dashboard → Web Scraper Tool
- [ ] Select "Missing Pricing" filter
- [ ] See 549 villages ready to scrape

During scraping:
- [ ] Start with 10-20 villages (test)
- [ ] Review results
- [ ] Scale up to 50-100 per batch
- [ ] Save after each batch
- [ ] Monitor success/error counts

After scraping:
- [ ] Save all successful results
- [ ] Review database completeness stats
- [ ] Note which villages failed
- [ ] Celebrate improved data quality! 🎉

---

## ESTIMATED TIMELINE

**Total Time to Complete:** 3-4 hours

- **Setup:** 5 minutes
- **Test batch (20 villages):** 10 minutes
- **Review results:** 5 minutes
- **Batch 1 (100 villages):** 20 minutes
- **Batch 2 (100 villages):** 20 minutes
- **Batch 3 (100 villages):** 20 minutes
- **Batch 4 (100 villages):** 20 minutes
- **Batch 5 (129 villages):** 25 minutes
- **Final review & save:** 15 minutes

**Result:** 400-450 villages successfully scraped with pricing data!

---

## SUPPORT

If you encounter issues:
1. Check browser console for errors (F12)
2. Verify authentication is still valid (refresh page if needed)
3. Try smaller batch sizes
4. Wait 2-3 minutes if edge function is overloaded
5. Results are saved in localStorage - won't lose progress

---

**Ready to start? Go to Admin Dashboard → Web Scraper Tool → Select "Missing Pricing" → Start Scraping!**

Good luck! 🚀
