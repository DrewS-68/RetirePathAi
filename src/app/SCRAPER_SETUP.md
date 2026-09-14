# Local Scraper Setup Instructions

## Why Use This?

Your Edge Function on Deno Deploy can't make direct HTTP requests to external websites (network restrictions), and ScraperAPI costs $49/month to upgrade. This **free local script** runs on your computer and scrapes all 1,723 remaining villages without any proxy service!

## Requirements

- **Node.js** installed on your computer ([download here](https://nodejs.org/))
- Your **Supabase credentials** (URL and Service Role Key)

## Setup Steps

### 1. Download the Script

Save the `local-scraper.js` file to your computer.

### 2. Get Your Supabase Credentials

You need two values from your Supabase dashboard:

1. **Project URL**: `https://your-project.supabase.co`
2. **Service Role Key**: Found in Settings → API → Project API keys → `service_role` (secret)

### 3. Run the Script

**On Mac/Linux:**
```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
node local-scraper.js
```

**On Windows (Command Prompt):**
```cmd
set SUPABASE_URL=https://your-project.supabase.co
set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
node local-scraper.js
```

**On Windows (PowerShell):**
```powershell
$env:SUPABASE_URL="https://your-project.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
node local-scraper.js
```

## What It Does

1. ✅ Fetches 100 villages at a time from your database that need scraping
2. ✅ Scrapes 5 villages concurrently (2 second delay between batches)
3. ✅ Extracts phone, email, pricing, amenities, care types from each website
4. ✅ Updates your database in real-time with scraped data
5. ✅ Shows progress, ETA, and success/failure counts
6. ✅ Automatically handles errors and continues to next village
7. ✅ Can be stopped and resumed anytime (progress is saved)

## Performance

- **Speed**: Processes ~100 villages in ~10 minutes
- **Total Time**: All 1,723 villages in ~3 hours
- **Cost**: $0 (100% free!)
- **Reliability**: Runs directly from your machine with full network access

## Sample Output

```
🚀 RetirePath Local Scraper Starting...
📊 Configuration:
   - Batch size: 100
   - Delay: 2000ms
   - Concurrent: 5

📡 Fetching villages from database...

📋 Found 100 villages to scrape
⏱️  Estimated time: 7 minutes

─────────────────────────────────────────────────────────

🔍 [1/100] Leisure Lea Gardens - Concord (NSW)
   Website: www.leisurelea.com.au
   📄 HTML fetched: 45231 characters
   ✅ Success: 12 fields found
   ⏱️  Completed in 1834ms
   📊 Progress: 1/100 (1%) | Success: 1 | Failed: 0 | Skipped: 0
   ⏱️  ETA: 7 minutes

🔍 [2/100] Arcare Aged Care - Oatlands (NSW)
   Website: www.arcare.com.au
   📄 HTML fetched: 38492 characters
   ✅ Success: 15 fields found
   ⏱️  Completed in 2103ms
   📊 Progress: 2/100 (2%) | Success: 2 | Failed: 0 | Skipped: 0
   ⏱️  ETA: 7 minutes
...
```

## Tips

1. **Run multiple times**: The script processes 100 villages per run. Just run it 17-18 times to complete all 1,723 villages.
2. **Can stop anytime**: Press Ctrl+C to stop. Progress is saved to database. Run again to resume.
3. **Check progress**: After each run, check your admin dashboard to see updated stats.
4. **Runs in background**: You can minimize the terminal and let it run while you do other work.

## Troubleshooting

**"command not found: node"**
- Install Node.js from https://nodejs.org/

**"Failed to fetch villages"**
- Check your SUPABASE_URL is correct
- Check your SUPABASE_SERVICE_ROLE_KEY is correct
- Make sure there are no extra quotes or spaces

**Slow performance**
- Increase CONCURRENT_SCRAPES (line 27) from 5 to 10
- Decrease DELAY_BETWEEN_REQUESTS (line 26) from 2000 to 1000

**Many failures**
- Some websites may be down or blocking requests
- The script marks them as failed and continues
- You can retry failed ones later by running the script again

## Security Note

⚠️ **IMPORTANT**: Your Service Role Key is powerful - it has full database access. 
- Don't share it with anyone
- Don't commit it to version control
- Don't hardcode it in the script
- Always use environment variables (as shown above)

## Questions?

If you run into any issues, check:
1. Node.js is installed: `node --version`
2. Environment variables are set correctly
3. Your Supabase project is accessible
4. You have internet connection

Happy scraping! 🚀
