# 🎓 Absolute Beginner's Guide to Image Scraping

## 🤔 What Is This and How Does It Work?

### Simple Explanation

The image scraper is **NOT something you paste into Supabase**.

Instead, it's a **Python program that runs on YOUR computer** (like running Microsoft Word or Chrome).

Here's what happens:

```
┌─────────────────────────────────────────────────────────────┐
│  YOUR COMPUTER                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  You run: python village_image_scraper.py            │  │
│  │                                                       │  │
│  │  The scraper:                                        │  │
│  │  1. Visits village websites                         │  │
│  │  2. Downloads images                                 │  │
│  │  3. Connects to YOUR Supabase database              │  │
│  │  4. Updates the retirement_villages table           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Internet connection
                           │ (using your Supabase credentials)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  SUPABASE (Your Database in the Cloud)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  retirement_villages table                           │  │
│  │  • Gets updated with image URLs                      │  │
│  │  • You don't paste anything here                     │  │
│  │  • The scraper does it automatically                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Super Simple 5-Step Setup

### Step 1: Do You Have Python Installed?

**Check by opening a terminal/command prompt:**

**On Windows:**
1. Press `Windows Key + R`
2. Type `cmd` and press Enter
3. Type: `python --version` and press Enter

**On Mac:**
1. Press `Command + Space`
2. Type `terminal` and press Enter
3. Type: `python3 --version` and press Enter

**What you should see:**
```
Python 3.9.x
```
(or any version 3.9 or higher)

**If you DON'T have Python:**
- Download from: https://www.python.org/downloads/
- Windows: Check "Add Python to PATH" during installation
- Mac: Use Homebrew: `brew install python3`

---

### Step 2: Open Terminal in the Scrapers Folder

**On Windows:**
1. Open File Explorer
2. Navigate to your RetirePath project
3. Go into the `scrapers` folder
4. Click in the address bar (top of window)
5. Type `cmd` and press Enter
6. A black terminal window opens in that folder ✅

**On Mac:**
1. Open Finder
2. Navigate to your RetirePath project
3. Go into the `scrapers` folder
4. Right-click the folder
5. Select "New Terminal at Folder"
6. A terminal opens in that folder ✅

---

### Step 3: Install Required Software

**In the terminal window, type this and press Enter:**

```bash
pip install -r requirements.txt
```

**What this does:**
- Installs the Python libraries the scraper needs
- Takes 1-2 minutes
- You'll see text scrolling - that's normal
- Wait until you see a prompt again

**If you see an error like "pip not found":**
- Try: `pip3 install -r requirements.txt`
- Or: `python -m pip install -r requirements.txt`

---

### Step 4: Create Your .env File (Configuration)

**This is where you put your Supabase credentials.**

**Option A: Manual Creation (Easiest)**

1. In the `scrapers` folder, create a new text file
2. Name it exactly: `.env` (just dot-env, no .txt)
3. Open it in a text editor (Notepad, TextEdit, VS Code)
4. Copy and paste this:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

5. Now you need to replace those with YOUR actual credentials...

**Option B: Copy the Example File**

In terminal:
```bash
cp .env.example .env
```

Then edit `.env` file with a text editor.

---

### Step 5: Get Your Supabase Credentials

**You need TWO things from Supabase:**

1. **Go to Supabase Dashboard:** https://app.supabase.com
2. **Click on your RetirePath project**
3. **Click "Settings" (left sidebar, bottom)**
4. **Click "API" (under Settings)**

**Now you'll see:**

```
┌─────────────────────────────────────────────────────────┐
│  Project URL                                            │
│  ┌───────────────────────────────────────────────────┐ │
│  │ https://abcdefghijk.supabase.co                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  API Keys                                              │
│  ┌───────────────────────────────────────────────────┐ │
│  │ anon public                                       │ │
│  │ eyJhbGc... [REVEAL]                              │ │ ◄── DON'T use this one
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │ service_role secret                               │ │
│  │ eyJhbGc... [REVEAL]                              │ │ ◄── USE THIS ONE!
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Copy these into your .env file:**

1. **Copy "Project URL"**
   - Replace `https://your-project-id.supabase.co` in .env

2. **Click "REVEAL" on "service_role secret"**
   - Copy the long key that starts with `eyJ...`
   - Replace `your_service_role_key_here` in .env

**Your .env file should now look like:**

```
SUPABASE_URL=https://abcdefghijk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

**SAVE the .env file!**

---

## 🎬 Running the Scraper (Finally!)

### Test Run (5 minutes)

**In your terminal (in the scrapers folder), type:**

```bash
python quick_test.py
```

**On Mac, you might need:**
```bash
python3 quick_test.py
```

**What you should see:**

```
╔════════════════════════════════════════════════════════════════╗
║              Image Scraper - Quick Test Mode                   ║
║                                                                ║
║  This will scrape images for just 5 villages to test.        ║
╚════════════════════════════════════════════════════════════════╝

✓ Environment variables found
Initializing scraper...

================================================================================
QUICK TEST: Scraping 5 villages
================================================================================
Found 2351 villages without images

[1/5] Processing Sunshine Retirement Village...
Scraping images from: https://sunshinevillage.com.au
Found 14 potential images
✓ Valid image: https://sunshinevillage.com.au/img1.jpg (1920x1080)
✓ Valid image: https://sunshinevillage.com.au/img2.jpg (1600x900)
Found 5 high-quality images
✓ Successfully updated village 123e4567-e89b-12d3-a456-426614174000
Waiting 2s before next request...

[2/5] Processing ...
```

**This means it's working! 🎉**

---

## ✅ Verify It Worked

### Check Supabase Database

1. Go to Supabase Dashboard
2. Click "Table Editor" (left sidebar)
3. Click on `retirement_villages` table
4. Add a filter: `images` is not null
5. You should see 3-5 villages with image URLs in the `images` column

**Example of what you'll see:**

```
┌──────────────────────┬─────────────────────┬────────────────────────────────┐
│ name                 │ state               │ images                         │
├──────────────────────┼─────────────────────┼────────────────────────────────┤
│ Sunshine Village     │ VIC                 │ ["https://village.com/1.jpg",  │
│                      │                     │  "https://village.com/2.jpg",  │
│                      │                     │  "https://village.com/3.jpg"]  │
└──────────────────────┴─────────────────────┴────────────────────────────────┘
```

### Check Your RetirePath App

1. Start your RetirePath app (if not running)
2. Navigate to Village Directory
3. You should see villages with REAL IMAGES instead of blue placeholders!

---

## 🚀 Full Scraping (After Test Works)

### Option 1: Top Operators (1-2 hours) ⭐ RECOMMENDED FIRST

**In terminal:**

```bash
python village_image_scraper.py
```

**You'll see a menu:**

```
1. Scrape ALL villages (slow, could take hours)
2. Scrape specific state
3. Scrape specific operator
4. Scrape limited number (testing)
5. Scrape top operators first (recommended)

Enter your choice (1-5): 
```

**Type `5` and press Enter**

This scrapes ~500-600 villages from major operators (Stockland, Aveo, etc.)

**Result:** 25% coverage in 1-2 hours ✅ LAUNCH READY!

---

### Option 2: Full Database (Overnight)

**When you're ready for complete coverage:**

```bash
python village_image_scraper.py
```

**Choose option `1` (ALL villages)**

**Warning:** This takes 8-12 hours! Start before bed.

**Result:** 68% coverage (1,600 villages) ✅ PROFESSIONAL PLATFORM!

---

## 📊 Check Your Progress

**Any time, run this:**

```bash
python check_coverage.py
```

**You'll see:**

```
╔════════════════════════════════════════════════════════════════╗
║              Image Coverage Statistics                         ║
╚════════════════════════════════════════════════════════════════╝

Total Approved Villages: 2,351

================================================================================
OVERALL STATISTICS
================================================================================
Villages with images:     568 / 2,351 (24.2%)
Villages without images:  1,783 (75.8%)
Total images:             2,840
Average images/village:   5.0

Image Count Distribution:
      0 images: 1783 villages ( 75.8%)
    1-2 images:  120 villages (  5.1%)
    3-4 images:  280 villages ( 11.9%)
    5-6 images:  145 villages (  6.2%)
      7+ images:   23 villages (  1.0%)
```

---

## 🐛 Common Issues and Fixes

### "No module named 'requests'"

**Problem:** Dependencies not installed

**Fix:**
```bash
pip install -r requirements.txt
```

Or try:
```bash
pip3 install -r requirements.txt
```

---

### "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"

**Problem:** .env file not found or incorrect

**Fix:**
1. Check that `.env` file exists in scrapers folder (not `.env.txt` or `.env.example`)
2. Open `.env` and verify both lines are filled in
3. Make sure there are NO spaces around the `=` sign
4. Make sure you used `service_role` key, NOT `anon` key

**Your .env should look EXACTLY like:**
```
SUPABASE_URL=https://abcdefghijk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

---

### "python: command not found"

**Problem:** Python not installed or not in PATH

**Fix:**

**On Mac:** Use `python3` instead of `python`:
```bash
python3 quick_test.py
```

**On Windows:** Reinstall Python and check "Add to PATH"

---

### Scraper runs but finds no images

**This is NORMAL for some villages!**

Expected success rates:
- Major operators: 90-95%
- Small operators: 40-60%
- Overall: 60-70%

30-40% of village websites simply don't have extractable images (they might use JavaScript, iframes, or just not have galleries).

---

## 📝 Quick Recap

### What You Just Did

1. ✅ Installed Python (if needed)
2. ✅ Installed scraper dependencies
3. ✅ Created .env file with Supabase credentials
4. ✅ Ran test scrape (5 villages)
5. ✅ Verified images in database
6. ✅ Ready to run full scrape!

### What Happens When You Run the Scraper

```
You run: python village_image_scraper.py
    ↓
Scraper connects to Supabase (using your .env credentials)
    ↓
Fetches list of villages without images
    ↓
For each village:
  • Visits village website
  • Downloads images
  • Updates database with image URLs
    ↓
Done! Check Supabase to see updated images
```

### You DON'T Need To:

❌ Paste anything into Supabase SQL editor  
❌ Run SQL queries  
❌ Manually upload images  
❌ Edit the database directly  

**The scraper does EVERYTHING automatically!**

---

## 🎯 Your Next Steps

### Right Now
```bash
# If test worked:
python village_image_scraper.py
# Choose Option 5 (Top Operators)
```

### Check Progress
```bash
python check_coverage.py
```

### Later (Overnight)
```bash
# For complete coverage:
python village_image_scraper.py
# Choose Option 1 (ALL villages)
```

---

## 🎉 You're Done with Setup!

**The scraper is now running on your computer and updating your Supabase database automatically.**

**No SQL to paste, no database queries to run - it just works!** ✨

---

## ❓ Still Confused?

### The KEY Concept

**OLD thinking (wrong):**
"I need to paste a SQL file into Supabase to run the scraper"

**CORRECT thinking:**
"I run a Python program on MY computer, and it connects to Supabase to update the database"

### Think of it Like...

**Email Analogy:**
- Gmail is like Supabase (stores your data in the cloud)
- Outlook on your computer is like the scraper (runs locally, connects to Gmail)
- You don't "paste Outlook into Gmail" - you run Outlook on your computer and it talks to Gmail

**Same thing here:**
- Supabase stores your villages database
- The scraper runs on YOUR computer
- It connects to Supabase and updates the database
- You don't paste the scraper into Supabase

---

## 📞 Need More Help?

If you're still stuck:

1. **Check the error message** - Copy the exact error and read it
2. **Check the log file** - Open `image_scraper.log` in scrapers folder
3. **Verify .env file** - Open it and make sure credentials are correct
4. **Test your Supabase connection** - Can you access your dashboard?

---

**You've got this! The test scrape is the hardest part - if that worked, you're all set!** 🚀
