JWT TOKEN EXPIRATION - QUICK FIX GUIDE

Created: January 17, 2026
Issue: JWT authentication tokens expire after ~1 hour during long scraping sessions


THE ERROR YOU SEE:

Search API error (401): {"code":401,"message":"Invalid JWT"}
AUTO-PROCESSOR ERROR: Error: Search failed: 401


QUICK FIX (Takes 30 seconds):

Step 1: Refresh the Page
- Press F5 (or Ctrl+R on Windows, Cmd+R on Mac)
- Or click the browser refresh button
- You'll stay logged in automatically

Step 2: Go Back to Batch Scraping
- Navigate to Admin Dashboard
- Click the "Batch Scraping" tab

Step 3: Your Progress is Restored
- The system will automatically load your saved progress from localStorage
- You'll see a notification showing how many villages were already processed

Step 4: Resume Processing
- Click "Resume Auto-Processor"
- The system will continue where it left off
- Already-processed villages are skipped automatically


WHY THIS HAPPENS:

- Supabase JWT tokens expire after ~1 hour for security
- Long scraping jobs (2-4+ hours) can outlive the token
- The auto-processor doesn't automatically refresh tokens during processing


WHAT I JUST FIXED:

I updated the code to:

1. Detect JWT expiration (401 errors)
2. Show helpful error message with clear instructions
3. Remind you that progress is saved
4. Guide you to refresh and resume

Now when your token expires, you'll see:

SESSION EXPIRED

Your authentication token has expired (this happens after ~1 hour).

Your progress has been saved!

To continue:
1. Press F5 to refresh the page
2. Go back to Batch Scraping tab
3. Click "Resume Auto-Processor"

You'll pick up exactly where you left off!


BEST PRACTICES TO AVOID THIS:

Option 1: Process in Smaller Sessions
- Instead of running for 4 hours straight, break into 45-minute sessions
- After 45 minutes, manually pause
- Refresh the page
- Resume processing

Option 2: Monitor the Time
- Set a 50-minute timer when you start
- When timer goes off, pause the processor
- Refresh the page
- Resume

Option 3: Just Let It Fail
- The system auto-saves after every batch
- When it fails with JWT error, just refresh and resume
- You'll only lose the current batch being processed (~50 villages max)


HOW AUTO-SAVE WORKS:

After every batch (50 villages), the system saves:

1. Found websites → Saved to database immediately
2. Processed village IDs → Saved to localStorage
3. Progress stats → Saved to localStorage
4. Results → Saved to localStorage

So even if the token expires mid-batch, you'll only lose progress on the current batch (50 villages at most).


EXAMPLE TIMELINE:

00:00 - Start auto-processor (442 villages, ~9 batches)
00:05 - Batch 1 complete (50 villages) SAVED
00:10 - Batch 2 complete (100 villages) SAVED
00:15 - Batch 3 complete (150 villages) SAVED
...
01:00 - JWT token expires!
01:05 - Batch 7 fails with 401 error
       Alert shows: "SESSION EXPIRED - Press F5"
       
01:06 - You refresh the page (F5)
01:06 - You go to Batch Scraping tab
01:06 - System restores: "6 batches complete (300 villages)"
01:06 - You click "Resume Auto-Processor"
01:06 - Processing continues from batch 7 (where it failed)
01:30 - All batches complete!

You lost: Maybe 5 minutes of time
You kept: All 300 villages from batches 1-6


EMERGENCY RECOVERY:

If You Close the Browser:
- Your progress is saved to localStorage (browser storage)
- As long as you don't clear browser data, it's safe
- Next time you visit Admin Dashboard → Batch Scraping:
  - Look for "Load Saved Results" button
  - Click it to restore your progress

If You Clear Browser Data:
- The localStorage is gone
- BUT the successfully saved websites are still in the database!
- The system won't re-process villages that already have websites
- Just start a new auto-processor run, it will skip completed villages


WHAT TO DO RIGHT NOW:

Since you saw this error while trying to pause:

1. Press F5 to refresh the page
2. Log back into Admin Dashboard
3. Go to Batch Scraping tab
4. Check the console log to see how many villages were processed before failure
5. Look for saved progress (should auto-restore)
6. Resume the auto-processor

The system should show something like:

AUTO-PROCESSOR: Found 168 villages missing website URLs
Processing batch 1/4 (50 villages)

This means you had 168 villages to process (down from 442!), so you've already made progress!


NEED HELP?

If refresh doesn't work or you lose progress:
1. Check browser console (F12) for errors
2. Look for localStorage data:
   - scraper_results
   - scraper_processed_ids
   - website_finder_results
3. Take a screenshot and let me know!


TL;DR: When you see 401 JWT error → Press F5 → Resume auto-processor → You're good to go!


Created: January 17, 2026
Updated: After detecting JWT expiration issue
Status: Code updated to handle JWT expiration gracefully
