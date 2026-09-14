# VIC Government Data Reconciliation Tool

## 🎯 Purpose

Automatically cross-reference and correct the 505 Copilot-imported VIC villages against the **authoritative VIC Government CSV data** to fix incorrect suburbs, operators, and postcodes.

## 📍 Location

**Admin Dashboard → VIC Reconcile Tab**

## 🔧 How It Works

### Step 1: Upload VIC Government CSV
- Upload your VIC Government CSV file containing:
  - **Organisation name**: Official village name
  - **Physical address**: Full street address including suburb, state, and postcode
  
Example format:
```
Organisation name,Physical address
Applewood Retirement Village,"123 Main St, Doncaster VIC 3108"
Example Village,"456 Test Rd, Example Suburb VIC 3000"
```

### Step 2: Fetch Database Villages
- Clicks "Fetch VIC Villages from Database"
- Retrieves all 505 VIC villages currently in the database

### Step 3: Analyze & Match
- Uses **fuzzy matching algorithm** to match village names between:
  - Database (Copilot data - potentially incorrect)
  - Government CSV (authoritative source - 100% correct)
  
- Calculates similarity scores (0-100%)
- Matches with ≥70% similarity are considered valid
- Identifies discrepancies in:
  - ✅ Suburb
  - ✅ Postcode  
  - ✅ Operator (extracted from organisation name)

### Step 4: Review Results
Three categories:
- **✅ Perfect Matches** - Data already matches Gov data
- **⚠️ Mismatches** - Data differs from Gov data (needs correction)
- **❌ Unmatched** - No good match found in Gov data

### Step 5: Bulk Update
- Click "Update XX Mismatches with Gov Data"
- Automatically updates database with correct information from Government CSV
- Shows progress bar during update
- Generates summary report

## 🎨 Features

- **Fuzzy Name Matching**: Handles variations like "Applewood" vs "Applewood Retirement Village"
- **Side-by-Side Comparison**: Shows old vs new values with visual diff
- **Smart Operator Extraction**: Extracts operator name from government organisation name
- **Batch Updates**: Updates multiple villages in one click
- **Progress Tracking**: Real-time progress bars for analysis and updates
- **Detailed Reports**: Shows exactly what changed

## 📊 Example Output

```
Mismatch Found:
Village: Applewood Retirement Village
Match Score: 95%

Differences:
Suburb:   Templestowe → Doncaster ✅
Operator: Wrong Operator → Correct Operator ✅
```

## 🔗 Backend

**Route**: `/make-server-3bba8be8/vic-reconcile/update`

**File**: `/supabase/functions/server/vic-reconcile.ts`

**Endpoints**:
- `POST /vic-reconcile/update` - Update single village
- `POST /vic-reconcile/batch-update` - Batch update multiple villages

## 💡 Why This Matters

The Copilot-imported data had:
- ❌ Incorrect suburbs (e.g., "Templestowe" instead of "Doncaster")
- ❌ Wrong operators
- ❌ Incorrect postcodes

This breaks the scraper's search strategy which relies on accurate location data.

By using the **VIC Government CSV as the source of truth**, we can:
- ✅ Fix all incorrect data automatically
- ✅ Ensure 100% accuracy for VIC villages
- ✅ Enable accurate web scraping with correct search parameters

## 🚀 Next Steps After Reconciliation

Once data is corrected:
1. Run the Web Scraper Tool with correct search parameters
2. Websites will be found using accurate suburb + village name
3. Scrape pricing, amenities, and other details
4. Build complete, accurate VIC village database

## 📝 CSV Template

Download the template from the tool, or create a CSV with:

```csv
Organisation name,Physical address
Your Village Name,"123 Street, Suburb VIC 3000"
```

The tool will automatically extract suburb, state, and postcode from the physical address field.
