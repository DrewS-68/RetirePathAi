# 🎛️ Admin Dashboard Guide

## Overview

The Admin Dashboard is your control center for managing retirement village submissions. You can review, approve, reject, and edit village listings.

---

## 🔐 Access Requirements

**Authentication Required:** You must be logged in to access the Admin Dashboard.

### How to Access:

1. **Log in** to your RetirePath account
2. Click on the **"Admin Dashboard"** tab in the navigation bar
3. The dashboard will load with all village data

---

## 📊 Dashboard Sections

### 1. **Overview Tab**

Displays key statistics:
- ✅ **Total Villages** - All villages in database
- ✅ **Approved** - Live on Village Matcher
- ⏳ **Pending** - Awaiting review
- ❌ **Rejected** - Declined submissions

**Recent Submissions:** Shows the 5 most recent submissions with quick actions.

---

### 2. **Pending Tab**

Review new village submissions:

**Actions Available:**
- 👁️ **View Details** - See full village information
- ✅ **Approve** - Make village live on Village Matcher
- ❌ **Reject** - Decline submission with reason

**Approval Process:**
1. Click "View" to see full details
2. Review all information (pricing, contact, amenities)
3. Click "Approve" if information is accurate
4. Click "Reject" if information is incomplete/incorrect
   - Provide rejection reason
   - Operator will be notified (future feature)

---

### 3. **Approved Tab**

Manage live villages:

**Actions Available:**
- 👁️ **View Details** - See full information
- 🗑️ **Delete** - Remove from database

**These villages are:**
- ✅ Visible in Village Matcher
- ✅ Included in search results
- ✅ Available to all users

---

### 4. **Rejected Tab**

View declined submissions:

**Actions Available:**
- 👁️ **View Details** - See submission + rejection reason
- 🗑️ **Delete** - Permanently remove

---

## 🔄 Common Workflows

### **Approving a New Submission**

1. Go to **Pending** tab
2. Click **"View"** on a village
3. Review all fields:
   - Name, operator, location
   - Pricing (entry + monthly fees)
   - Contact information (phone, email, website)
   - Amenities and features
4. Click **"Approve"** button
5. Village instantly appears in Village Matcher

---

### **Rejecting a Submission**

1. Go to **Pending** tab
2. Click **"View"** on a village
3. Click **"Reject"** button
4. Enter reason (e.g., "Missing contact information")
5. Click **"Reject Submission"**
6. Village moves to Rejected tab

**Common Rejection Reasons:**
- Incomplete information
- Invalid/fake contact details
- Duplicate entry
- Not a retirement village
- Suspicious submission

---

### **Editing a Village**

Currently, editing is done through rejection + resubmission. Future update will add inline editing.

**Workaround:**
1. Delete the village
2. Manually add corrected information via SQL or operator form

---

### **Deleting a Village**

1. Open village details
2. Click **"Delete"** button
3. Confirm deletion
4. Village is permanently removed

⚠️ **Warning:** Deletion is permanent and cannot be undone!

---

## 📋 Village Detail View

When you click "View" on any village, you see:

### **Basic Information**
- Village name
- Operator
- Full address
- Village type (Freehold, Loan-License, Rental, Strata)
- Care level (Independent, Assisted, Mixed)

### **Pricing**
- Entry price range
- Monthly fees range
- DMF structure
- Pet-friendly status

### **Contact Information**
- Phone number
- Email address
- Website (clickable link)

### **Description**
- Full text description of the village

### **Amenities**
- List of all facilities and features

### **Metadata**
- Source (operator_submission, manual, scraper)
- Submission date
- Approval/rejection dates
- Rejection reason (if applicable)

---

## 🎯 Best Practices

### **Approval Guidelines:**

✅ **Approve if:**
- All required fields are filled
- Contact information looks legitimate
- Pricing is realistic
- Description is professional
- No obvious spam/fake entry

❌ **Reject if:**
- Missing critical information (name, location, contact)
- Contact details seem fake
- Duplicate of existing village
- Pricing is clearly incorrect
- Suspicious or spam content

---

### **Quality Control:**

1. **Verify Contact Info:** Spot-check websites/phone numbers
2. **Check for Duplicates:** Search for existing entries
3. **Validate Pricing:** Ensure realistic ranges
4. **Review Descriptions:** Look for professionalism

---

## 🔔 Operator Submission Sources

Villages can come from:

1. **Operator Submission Form** (yoursite.com#list-village)
   - Source: `operator_submission`
   - Status: `pending`
   - Requires approval

2. **Manual Entry** (You add via SQL)
   - Source: `manual`
   - Status: `approved`
   - Already verified

3. **Web Scraping** (Python scripts)
   - Source: `scraper`
   - Status: `pending`
   - Requires review

---

## 📊 Statistics

The dashboard automatically calculates:
- Total villages across all statuses
- Breakdown by status (approved, pending, rejected)
- Real-time updates when you approve/reject

**Click "Refresh"** to reload latest data.

---

## 🚀 Future Features

Coming soon:
- 📧 Email notifications to operators
- ✏️ Inline editing of villages
- 🔍 Advanced search and filtering
- 📈 Analytics and reporting
- 👥 Multi-admin support
- 📸 Image upload and management

---

## 🐛 Troubleshooting

### **"Unauthorized" Error**
- **Solution:** Log in to your account
- The dashboard requires authentication

### **No Villages Showing**
- **Solution:** Check if database has data
- Run SQL query: `SELECT COUNT(*) FROM retirement_villages;`

### **Approve/Reject Not Working**
- **Solution:** Check browser console for errors
- Ensure you're logged in
- Try refreshing the page

### **Slow Loading**
- **Solution:** Normal if you have 100+ villages
- Click "Refresh" to reload data

---

## 📞 Support

**Questions?** Check:
- `/DATABASE_SCHEMA.md` - Database structure
- `/VILLAGE_DATA_SYSTEM_README.md` - Complete system docs
- Browser console for error messages

---

## ✅ Quick Reference

| Action | Tab | Button | Result |
|--------|-----|--------|--------|
| Review new submission | Pending | View | See details |
| Approve village | Pending | Approve | Goes live |
| Reject submission | Pending | Reject | Moves to Rejected |
| Delete village | Any | Delete | Permanently removed |
| Refresh data | Overview | Refresh | Reload from database |

---

**You're all set! Start reviewing submissions and building your retirement village database.** 🎉
