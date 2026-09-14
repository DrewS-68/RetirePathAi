# Fake Detection Tool - Quick Guide

## 🎯 What It Does

Automatically scans your **unclassified villages** and identifies obvious fakes based on:

- ❌ **No contact info** (no website, phone, or email)
- ❌ **Parked domains** (GoDaddy, Namecheap, etc.)
- ❌ **Operator with only 1-2 villages** (likely data errors)
- ❌ **Duplicates** (same name in same suburb)
- ❌ **Very short names** (< 5 characters)
- ❌ **Missing operator**

---

## 📍 How to Use

1. **Admin Dashboard** → **Data Cleanup Tools** → **Fake Detection** tab
2. Click **"Scan Unclassified Villages"**
3. Review the results (sorted by severity: High → Medium → Low)
4. Select villages to delete (High severity auto-selected)
5. Click **"Delete Selected"**
6. ✅ Done!

---

## 🚦 Severity Levels

### 🔴 **High Severity** (Auto-selected for deletion)
- No contact information at all
- Parked/suspended domain
- Duplicate villages
- **Action:** Safe to delete immediately

### 🟡 **Medium Severity** (Review recommended)
- Operator with only 1-2 villages
- Missing operator name
- **Action:** Review manually before deleting

### ⚪ **Low Severity** (Low priority)
- Very short village name
- Minor issues
- **Action:** Review manually

---

## ⚡ Quick Actions

- **Select All High** - Auto-select all high severity items
- **Select All Medium** - Auto-select all medium severity items  
- **Deselect All** - Clear all selections
- **Delete Selected** - Bulk delete all selected villages

---

## 💡 Example Results

```
HIGH SEVERITY (6 villages)
├─ "Test Village" - No contact info, operator only has 1 village
├─ "Adventist Retirement Plus" - Parked domain (dead website)
└─ "Sample" - Name too short (< 5 chars), duplicate found

MEDIUM SEVERITY (12 villages)
├─ "Retirement Home XYZ" - Operator only has 2 villages
└─ "Village Name" - No operator specified

LOW SEVERITY (3 villages)
└─ "Care" - Name very short
```

---

## ✅ Expected Outcome

**Before:** 50 unclassified villages to manually review

**After Scan:**
- 🔴 15 high severity (safe to delete) → **Removes 15 fakes**
- 🟡 10 medium severity (review) → **Removes 5 more after review**
- ⚪ 5 low severity (skip) → **Leave for manual classification**

**Final:** Only **20 real villages** left to manually classify!

**Time Saved: 60% reduction!** 🚀

---

## ⚠️ Important Notes

1. **High severity items are usually safe to delete** - they have multiple red flags
2. **Medium severity needs review** - could be real villages with missing data
3. **Always export a backup before deleting** (use CSV Export in other tools)
4. **Can't undo bulk deletion** - be careful!

---

## 🔄 Recommended Workflow

1. **Run Fake Detection** first
2. **Delete high severity** items (clear obvious fakes)
3. **Review medium severity** individually
4. Use **Manual Village Classifier** for remaining real villages

---

## 🎉 Result

Your 50-village classification workload just became **20 villages** or less!

*Last updated: January 26, 2026*
