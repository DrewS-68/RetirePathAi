# Operator Verification Tool - Quick Start Guide

## 🚀 What This Tool Does

The **Operator Verification Tool** helps you rapidly verify and clean up operator data in your database. Instead of manually checking 50+ operators (which could take weeks), you can now process them in **minutes** with keyboard shortcuts and batch processing.

---

## 📍 Where to Find It

1. Go to **Admin Dashboard**
2. Click **Data Cleanup Tools**
3. Select the **"Operator Verification"** tab

---

## ⌨️ Keyboard Shortcuts

The tool is designed for **speed**. Use these shortcuts to fly through operators:

- **`V`** - Mark as Verified (operator is correct)
- **`F`** - Mark as Fake (will delete all villages from this operator)
- **`M`** - Merge into different operator (reassign villages)
- **`S`** - Skip for now
- **`←`** / **`→`** - Navigate between operators

---

## 🔥 Quick Workflow

### For Adventist Senior Living Example:

1. **Start the tool** → You'll see operators one by one
2. When you hit **"Adventist Retirement Plus"**:
   - Press **`F`** (Fake)
   - Confirm deletion
   - Tool moves to next operator automatically
3. When you hit another fake operator:
   - Press **`M`** (Merge)
   - Type the correct name: `Adventist Senior Living`
   - Press Enter
4. Continue through all 50 operators
5. At the end, click **"Process All Actions"**
6. ✅ All changes applied in one batch!

---

## 🎯 Features

### Progress Tracking
- See how many operators you've reviewed (e.g., "12/50")
- Track verified, fake, merged, and skipped counts
- Visual progress bar

### Smart Actions
- **Verified**: Operator name is correct, no action needed
- **Fake**: Delete all villages from this operator (be careful!)
- **Merge**: Reassign villages to the correct operator name
- **Skip**: Review later

### Batch Processing
- All actions are queued (not applied immediately)
- Review your queue before processing
- Apply all changes at once with one click
- Undo last action if you made a mistake

### Export Results
- Download CSV of all your verification decisions
- Share with team or keep for records

---

## 💡 Best Practices

### Before You Start:
1. **Know your operators** - Have a list of correct operator names ready
2. **Google is your friend** - Use the built-in Google Search button to verify
3. **Start small** - Test with 5-10 operators first

### While Verifying:
1. **Use keyboard shortcuts** - Typing is for nerds, shortcuts are for pros 😎
2. **Add notes** - If unsure, add a note before marking as Skip
3. **Merge carefully** - Double-check operator names to avoid typos
4. **Check website** - If operator has a website, open it to verify

### After Verification:
1. **Export CSV** - Keep a record of what you changed
2. **Process actions** - Apply all changes in one batch
3. **Verify results** - Check a few villages to confirm changes worked

---

## ⚠️ Important Warnings

### ❌ Marking as "Fake"
- **This will DELETE all villages** from that operator
- Only use if you're **100% certain** the operator doesn't exist
- For the Adventist Retirement Plus example, this is correct (fake operator with dead website)

### 🔄 Merging Operators
- Make sure you **spell the new operator name correctly**
- All villages will be reassigned to this new operator name
- Cannot be undone easily (but you have the export CSV as backup)

### 💾 Processing Actions
- Changes are **not applied** until you click "Process All Actions"
- You can review and undo actions before processing
- Once processed, changes go to the database immediately

---

## 🧪 Testing It Out

### Safe Test Run:
1. Go to Operator Verification tab
2. Navigate through 5 operators using **`→`**
3. Press **`S`** (Skip) on each one
4. See them appear in your queue
5. **DON'T** click "Process All Actions"
6. Refresh the page to clear your queue
7. Now you know how it works! 🎉

---

## 🐛 Troubleshooting

### "Nothing happens when I press keyboard shortcuts"
- Make sure you're **not** typing in an input field
- Click somewhere on the page first

### "I marked the wrong operator as Fake"
- Click **"Undo Last"** before processing
- If already processed, you'll need to re-add those villages manually

### "Process All Actions" button isn't working
- Check the browser console for errors
- Refresh the page and try again
- Contact support if issue persists

---

## 📊 Example: Your Current Situation

You have:
- **50 operators** to verify
- **~6 fake villages** from "Adventist Retirement Plus"
- **6 real villages** from "Adventist Senior Living" (need to scrape)

### Using This Tool:
1. **Mark "Adventist Retirement Plus" as Fake** → Deletes 6 fake villages
2. **Skip through other operators** or verify them
3. **Process actions** → Fake villages deleted
4. **Use CSV Import or Quick Add** to add the 6 real Adventist Senior Living villages

**Time saved: Hours → Minutes** ⚡

---

## 🎓 Pro Tips

1. **Use two screens**: Have Google open on one screen, verification tool on the other
2. **Work in batches**: Do 10-15 operators, take a break, do more
3. **Export frequently**: Download CSV after each batch for safety
4. **Notes are gold**: Future you will thank present you for clear notes
5. **When in doubt, Skip**: Better to come back later than make a wrong decision

---

## 🚨 Emergency Stop

If something goes wrong:
1. **Don't panic**
2. **Don't click "Process All Actions"**
3. **Refresh the page** (clears all pending actions)
4. **Contact support** with screenshots

---

## ✅ Success Metrics

After using this tool, you should have:
- ✅ All operators verified or marked for action
- ✅ Fake operators identified and deleted
- ✅ Incorrectly named operators merged
- ✅ Clean, standardized operator names
- ✅ CSV export for your records

---

## 🎉 Ready to Go!

You now have a **speed tool** for operator verification. What used to take **weeks** now takes **minutes**.

**Go forth and verify!** 🚀

---

*Last updated: January 26, 2026*
