# 🚀 How to Access the Batch Scraping Dashboard

## ✅ The Good News
**Your Batch Scraping Dashboard is already built and ready to use!** No console scripts needed.

---

## 📍 How to Access It (3 Easy Steps)

### **Step 1: Open Your App**
Click the preview/view button in Figma Make to open your RetirePath app.

### **Step 2: Log In**
- Click "Sign In" in the top right
- Enter your email: `smith68d@gmail.com`
- Enter your password

### **Step 3: Go to Admin Dashboard**
- After logging in, you'll see navigation tabs at the top
- Click on the **"Admin"** tab
- Then click on the **"Batch Scraping"** tab

---

## 🎯 What You'll See

The Batch Scraping Dashboard has:

### **📊 Overall Statistics**
- Total villages with websites
- Already scraped count
- Remaining villages
- Progress percentage

### **⚙️ Batch Controls**
- **State Filter** - Optionally scrape only specific states (VIC, NSW, QLD, etc.)
- **Batch Size** - How many villages to scrape (1-500)
- **Delay** - Time between requests to avoid rate limiting

### **▶️ Action Buttons**
- **Start Batch Scraping** - Begins a new batch
- **Resume Batch** - Continues from where you left off (appears if paused)
- **Pause Batch** - Stops scraping (can resume later)
- **Refresh Status** - Updates the display
- **Reset Batch** - Clears current batch (starts fresh)
- **Skip Stuck Villages** - Marks problematic villages to skip

### **📈 Real-Time Progress**
- Live progress bar
- Success/Failed/Skipped counts
- Recent errors display
- Current village being processed

---

## 🔄 How to Resume Your Interrupted Batch

Your batch was at **14/50 villages** when the token expired. Here's how to continue:

1. **Log in to the app** (this gives you a fresh auth token)
2. **Go to Admin → Batch Scraping**
3. **Click "Resume Batch"** or **"Start Batch Scraping"** (it will continue from where it stopped)

The system automatically tracks:
- ✅ Which villages were already processed
- ✅ Current position in the batch
- ✅ Success/failure counts

---

## ⚠️ Important Notes

### **Authentication**
- The dashboard uses your **active login session** automatically
- No need to copy tokens or run console scripts
- If you stay logged in, it will keep working

### **Token Expiration**
- If scraping stops with "auth" errors, just:
  1. Refresh the page
  2. Log in again if needed
  3. Click "Resume Batch"

### **Progress Tracking**
- All progress is saved in the database
- You can pause and resume anytime
- The system won't re-scrape villages it already processed

---

## 💡 Recommended Settings for Production

For scraping all 2500 villages:

```
State Filter: All States
Batch Size: 50
Delay: 2000ms (2 seconds)
```

This will:
- Process 50 villages at a time
- Wait 2 seconds between each village
- Take about 1-2 minutes per batch
- Avoid rate limiting issues

---

## 🐛 Troubleshooting

### "Failed to fetch batch status"
→ Make sure you're logged in

### "Unauthorized" errors
→ Refresh the page and log in again

### Batch stuck on same village
→ Click "Skip Stuck Villages" to move past problematic villages

### Want to start over
→ Click "Reset Batch" then "Start Batch Scraping"

---

## 📞 Quick Access

**Direct URL Pattern:**
`[your-app-url]#admin` → Then click "Batch Scraping" tab

---

## ✨ Why This is Better Than Console Scripts

✅ **No token management** - Uses your login automatically  
✅ **Visual progress** - See exactly what's happening  
✅ **Pause/Resume** - Stop and continue anytime  
✅ **Error handling** - Shows what failed and why  
✅ **No coding** - Just click buttons  
✅ **Persistent state** - Survives page refreshes  

---

**Ready to try it? Log in to your app and go to Admin → Batch Scraping!** 🚀
