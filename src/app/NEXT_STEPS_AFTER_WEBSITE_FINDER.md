NEXT STEPS AFTER WEBSITE FINDER COMPLETES

Created: January 17, 2026
Status: Website Finder Auto-Processor currently running
Remaining: ~442 villages missing website URLs


PHASE 1: WEBSITE FINDER (CURRENTLY RUNNING)

What it does: Finds missing website URLs using Google Search API
Status: IN PROGRESS
Target: Find website URLs for ~442 villages with "no website"

When Complete:
- You should have 90%+ villages with website URLs
- Database will be ready for actual data scraping


PHASE 2: WEB SCRAPER TOOL (NEXT - NOT STARTED YET)

What it does: Scrapes actual data FROM the websites we just found

Data We Still Need to Scrape:

1. Pricing Data
   - Entry price minimum
   - Entry price maximum
   - Currently Missing: 642 villages

2. Contact Information
   - Phone numbers
   - Email addresses

3. Amenities
   - Pool, gym, library, cinema, bowling green, etc.
   - Pet-friendly status

4. Images
   - Village photos for galleries
   - Facility images

5. Care Services
   - Aged care available
   - Memory care
   - Nursing


HOW TO USE THE WEB SCRAPER TOOL

Step 1: Access the Tool
1. Go to Admin Dashboard
2. Click the "Batch Scraping" tab (with RefreshCw icon)
3. You'll see the Web Scraper Tool interface

Step 2: Choose Your Filter

You have 6 filter buttons to choose villages to scrape:

"No Website (Find URLs)" (Purple button)
- Shows villages with NO website URL
- Use the Website Finder to get URLs first
- YOU JUST DID THIS!

"Incomplete Pricing" (Red button) (DEFAULT - START HERE!)
- Shows villages WITH websites BUT missing pricing data
- This is your ~642 villages with missing pricing
- USE THIS NEXT!

"Missing Email" (Orange button)
- Shows villages missing email addresses
- Use after pricing scrape

"Missing Amenities" (Yellow button)
- Shows villages missing amenities data
- Use after pricing scrape

"Missing Pricing (Any)" (Blue button)
- Shows ALL villages missing any pricing data
- Broader filter

"All Villages" (White button)
- Shows all villages (use with caution - that's 2,569!)


RECOMMENDED SCRAPING SEQUENCE

STEP 1: Scrape Pricing Data (HIGHEST PRIORITY)

Why First?
- Most important data for users
- 642 villages need this
- Pricing is on most websites

How to Do It:

1. Go to Admin Dashboard → Batch Scraping tab

2. Click the "Incomplete Pricing" filter button
   - This shows ~642 villages with websites BUT missing pricing

3. Select villages to scrape:
   - Option A: Click "Select All" (scrape all 642)
   - Option B: Select by state (e.g., just VIC first)
   - Recommended: Start with 50-100 villages to test

4. Click "Start Scraping"
   - Scraper will process in batches
   - Shows real-time progress
   - Auto-saves results every batch

5. Review Results:
   - Green checkmark = Success (data found)
   - Red X = Failed (no data found or error)
   - Yellow clock = Partial (some data found)

6. Save Successful Results:
   - Click "Save All Successful"
   - This writes data to the database

7. Repeat until all pricing data is scraped


STEP 2: Scrape Contact Info

After pricing is done:

1. Click "Missing Email" filter
2. Select villages
3. Scrape for email addresses and phone numbers
4. Save results


STEP 3: Scrape Amenities

After contact info:

1. Click "Missing Amenities" filter
2. Select villages
3. Scrape for amenities (pool, gym, etc.)
4. Save results


STEP 4: Scrape Images

Last priority:

1. Use the Image Scraper (separate tool)
2. Or use the Web Scraper to find image URLs
3. Top 500 villages should have 3+ images


SCRAPER SETTINGS & FEATURES

Batch Size
- Default: 50 villages per batch
- Range: 10-200
- Recommendation: Keep at 50 to avoid timeouts

Auto-Save Feature
- Results are saved to localStorage automatically
- If scraper crashes, you can resume where you left off
- Check "Load Saved Results" button

Progress Tracking
- Real-time progress bar
- Current village being scraped
- Success/failure counts
- Estimated time remaining

Pause/Resume
- Can pause scraping at any time
- Resume where you left off
- Useful for long scraping sessions


SCRAPING ESTIMATES

Pricing Scraper (642 villages):
- Time: 2-4 hours total
- Success Rate: 60-80% (some websites don't list pricing)
- Expected Results: 385-513 villages with pricing data

Email/Phone Scraper:
- Time: 1-2 hours
- Success Rate: 70-90%

Amenities Scraper:
- Time: 2-3 hours
- Success Rate: 50-70% (not all sites list amenities clearly)

Images Scraper:
- Time: 4-6 hours (larger files)
- Success Rate: 80-90%

TOTAL SCRAPING TIME: 9-15 hours

You can break this into sessions:
- Day 1: Pricing (2-4 hours)
- Day 2: Contact info (1-2 hours)
- Day 3: Amenities (2-3 hours)
- Day 4: Images (4-6 hours)


IMPORTANT NOTES

API Limits
You're using ScraperAPI which has limits:
- Check your plan's monthly request limit
- Each village = 1-3 API calls
- Monitor usage in ScraperAPI dashboard

Rate Limiting
- Built-in delays between requests (5 seconds)
- Prevents overwhelming target websites
- Prevents API throttling

Data Quality
- Not all scraped data will be perfect
- Always review results before saving
- Some manual cleanup may be needed

Manual Fallback
- For villages where scraper fails, you can:
  - Click "Manual Entry" button
  - Enter data manually
  - Or mark as "not available"


EXPECTED FINAL DATABASE QUALITY

After all scraping is complete, you should have:

- Website URLs: 90%+ coverage (2,312+ villages)
- Pricing Data: 75-85% coverage (1,927-2,184 villages)
- Contact Info: 80-90% coverage (2,055-2,312 villages)
- Amenities: 60-75% coverage (1,541-1,927 villages)
- Images: 70-85% coverage for top 500 villages

This is excellent for launch! You'll never have 100% - some operators don't publish data online.


SCRAPING COMPLETION CHECKLIST

Before Launch, Complete:
- Website Finder: 90%+ villages have URLs
- Pricing Scraper: At least 75% have pricing
- Contact Scraper: At least 80% have phone/email
- Amenities Scraper: At least 60% have amenities
- Image Scraper: Top 500 villages have 3+ images

Optional (Can Do Post-Launch):
- Scrape remaining villages in batches
- Manual data entry for top 100 villages
- Reach out to operators for missing data
- User submissions for missing data


IMMEDIATE NEXT STEPS (TODAY)

Wait for Website Finder to Complete:
1. Let auto-processor finish (you started it today)
2. Check results when done
3. Verify success rate

Then Start Pricing Scraper:
1. Go to Admin Dashboard → Batch Scraping
2. Click "Incomplete Pricing" filter
3. Select 50 villages (test batch)
4. Click "Start Scraping"
5. Review results
6. If successful, scrape remaining 592 villages in batches

This Week's Goal:
- Complete Website Finder
- Complete Pricing Scraper (642 villages)
- Complete Contact Info Scraper
- Target: 85%+ database completion


PRO TIPS

Tip 1: Test First
Always test with 10-50 villages before running full batch

Tip 2: Scrape by State
Break large scraping jobs by state for easier management

Tip 3: Review Before Saving
Don't blindly save all results - review for quality

Tip 4: Monitor API Usage
Check ScraperAPI dashboard to avoid hitting limits

Tip 5: Save Frequently
Use the auto-save feature and "Download CSV" for backups

Tip 6: Manual Entry for VIPs
For top 50 villages, consider manual data entry for accuracy

Tip 7: Operator Outreach
After scraping, email operators with "Claim Your Listing" - they'll fill in missing data for you!


TROUBLESHOOTING

"Scraper timed out"
- Reduce batch size to 25
- Wait 5 minutes and try again
- Check ScraperAPI status

"No data found"
- Website might not list that data
- Try manual website visit to verify
- Mark as "not available" and move on

"API limit reached"
- Wait until next billing cycle
- Upgrade ScraperAPI plan
- Use manual entry for critical villages

"401 JWT Error" (like before)
- Refresh the page
- Log back in
- Try again


NEED HELP?

If you run into issues:
1. Check the browser console (F12) for error messages
2. Take a screenshot of the error
3. Let me know and I can help debug!


Remember: Database completion is CRITICAL before launch. Aim for 85%+ coverage on pricing and contact info!


Created: January 17, 2026
Status: Website Finder running, Web Scraper ready to use
Next Update: After Website Finder completes
