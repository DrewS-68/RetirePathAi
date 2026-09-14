# 🚀 Simple Start - No Technical Knowledge Required

## ❓ What Is This?

**The image scraper is a program that:**
1. Runs on YOUR computer (not in Supabase)
2. Visits retirement village websites
3. Downloads images from those websites
4. Saves the image URLs into your Supabase database

**You don't paste anything into Supabase!** The scraper connects to Supabase automatically.

---

## ✅ Do This FIRST

### ✅ Step 1: Check if Python is installed

Open a terminal/command prompt and type:

**Windows:** `python --version`  
**Mac:** `python3 --version`

**If you see:** `Python 3.9.x` or higher → ✅ You're good!  
**If not:** Download Python from https://www.python.org/downloads/

---

### ✅ Step 2: Open terminal in scrapers folder

**Windows:**
- Open the `scrapers` folder in File Explorer
- Click the address bar at top
- Type `cmd` and press Enter

**Mac:**
- Open the `scrapers` folder in Finder
- Right-click → "New Terminal at Folder"

---

### ✅ Step 3: Install dependencies

Type this and press Enter:
```bash
pip install -r requirements.txt
```

Wait 1-2 minutes while it installs.

---

### ✅ Step 4: Create .env file

**Easy way:**

1. Copy the file `.env.example`
2. Rename the copy to just `.env` (remove "example")
3. Open `.env` in Notepad or any text editor

**You'll see:**
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Now replace those with YOUR actual values...

---

### ✅ Step 5: Get your Supabase credentials

1. Go to https://app.supabase.com
2. Click your RetirePath project
3. Click "Settings" (bottom left)
4. Click "API"

**Copy TWO things:**

**A) Project URL**
```
It looks like: https://abcdefgh.supabase.co
```
Paste this into `.env` replacing `https://your-project-id.supabase.co`

**B) service_role secret** (NOT the anon key!)
```
Click "Reveal" next to "service_role secret"
It looks like: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
Paste this into `.env` replacing `your_service_role_key_here`

**Save the .env file!**

---

## 🎬 Run the Test

Type this in your terminal:
```bash
python quick_test.py
```

**On Mac, you might need:**
```bash
python3 quick_test.py
```

**You should see:**
```
✓ Environment variables found
Initializing scraper...
Found 2351 villages without images
[1/5] Processing ...
```

**This means it's working!** 🎉

Let it run for a few minutes. It will scrape 5 villages as a test.

---

## ✅ Check if it worked

### Method 1: Check Supabase

1. Go to Supabase Dashboard
2. Click "Table Editor"
3. Click `retirement_villages`
4. You should see some villages now have URLs in the `images` column

### Method 2: Check Your App

1. Open your RetirePath app
2. Go to Village Directory
3. Some villages should now show real images (not blue placeholders)

**If you see images → SUCCESS!** 🎉

---

## 🚀 Run the Full Scraper

Now that you know it works, run the main scraper:

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

**Type `5` and press Enter** ⭐ RECOMMENDED

This scrapes ~500-600 villages from major operators in 1-2 hours.

---

## 📊 Check Your Progress

Run this any time:
```bash
python check_coverage.py
```

You'll see how many villages now have images!

---

## 🎯 Summary

### What you did:
1. ✅ Installed Python dependencies
2. ✅ Created .env file with Supabase credentials
3. ✅ Ran test scrape (5 villages)
4. ✅ Verified it worked
5. ✅ Ready to run full scrape!

### What happens when you run the scraper:
```
Your Computer                      Supabase Database
     │                                   │
     │  Scraper runs                     │
     │  Downloads images                 │
     │  ────────────────────────────────▶│  Updates database
     │                                   │  with image URLs
     │                                   │
```

### What you DON'T do:
❌ Don't paste SQL into Supabase  
❌ Don't manually upload images  
❌ Don't run database queries  

**The scraper does everything automatically!**

---

## 🆘 Common Problems

### "No module named 'requests'"
```bash
pip install -r requirements.txt
```

### "Missing SUPABASE_URL"
- Check that `.env` file exists (not `.env.txt`)
- Make sure you saved the file after editing
- Verify you copied BOTH the URL and the key

### "python: command not found"
**On Mac, use:**
```bash
python3 quick_test.py
```

---

## 🎉 You're Done!

**Next command:**
```bash
python village_image_scraper.py
```

Choose option 5, let it run for 1-2 hours, and you'll have 500-600 villages with images!

**For complete coverage (overnight):**
```bash
python village_image_scraper.py
```
Choose option 1, let it run overnight, wake up to 1,600 villages with images!

---

**Questions?** Read [ABSOLUTE_BEGINNER_GUIDE.md](ABSOLUTE_BEGINNER_GUIDE.md) for more details.

**Good luck! 🚀**
