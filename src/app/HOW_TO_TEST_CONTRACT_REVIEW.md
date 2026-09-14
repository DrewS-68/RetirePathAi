# 🧪 How to Test the Contract Review Feature

## ✅ What You Have

I've created a **sample retirement village contract** for you to test with!

**File:** `/SAMPLE_RETIREMENT_VILLAGE_CONTRACT.md`

This sample contract includes:
- ✅ Sunnyvale Retirement Village (fictional but realistic)
- ✅ Loan/License model with typical DMF structure
- ✅ $650,000 entry price
- ✅ 30% DMF cap (6% per year for 5 years)
- ✅ 50/50 capital gain split
- ✅ All typical clauses and red flags
- ✅ Realistic costs, fees, and risks

---

## 📝 How to Test (Manual Entry Method)

Since the PDF upload isn't functional yet, use the **Manual Entry** tab:

### **Step 1: Open Contract Review**
1. Sign in to your RetirePath account
2. Click on **"Contract Review"** in the main navigation

### **Step 2: Add Contract Details**
Click **"Add Contract Details"** and enter this information from the sample contract:

**Basic Info:**
- **Village Name:** Sunnyvale Retirement Village
- **Ownership Model:** Loan/License (Most Common - DMF applies)

**Financial Details:**
- **Entry Price:** $650,000
- **Monthly Service Fees:** $650
- **Annual Fee Increase:** 3%

**DMF Details:**
- **DMF Structure:** Annual Accrual with Cap (capped at 30%)
- **DMF Rate:** 6% (per year)
- **DMF Cap:** 5 years (which equals 30% max)

**Other Fees:**
- **Exit Fee:** $0 (no additional exit fee beyond DMF)
- **Capital Gain Share:** 50% (you get 50%, operator gets 50%)
- **Refundable Deposit:** Yes

### **Step 3: Click "Add Contract"**

The system will now analyze and display:
- ✅ Cost projections for 5, 10, and 15 years
- ✅ Inheritance calculations
- ✅ Risk analysis
- ✅ Lifetime cost estimates

---

## 🎯 What the Analysis Should Show

Based on the sample contract, here's what you should see:

### **After 5 Years:**
- **Entry Paid:** $650,000
- **Monthly Fees Paid:** ~$41,000 (5 years of $650/month with increases)
- **DMF Due:** $195,000 (30% cap reached)
- **Total Cost:** ~$236,000
- **Net Refund:** ~$455,000 (if property value unchanged)

### **After 10 Years:**
- **Entry Paid:** $650,000
- **Monthly Fees Paid:** ~$91,000
- **DMF Due:** $195,000 (still 30% cap)
- **Total Cost:** ~$286,000
- **Net Refund:** ~$455,000 (if property value unchanged)

### **Inheritance Impact:**
If you pass away after 5 years and the unit resells for $680,000:
- Capital gain: $30,000
- Your share (50%): $15,000
- DMF: -$195,000
- Selling costs (3%): -$20,400
- Refurbishment: ~-$18,000
- **Family receives:** ~$461,600
- **Loss from original $650k:** ~$188,400

---

## 🧪 Testing Multiple Contracts (Comparison)

To test the **comparison feature**, add a second contract with different terms:

### **Contract 2: "Peaceful Pines" (Better Deal)**

- **Village Name:** Peaceful Pines Retirement Village
- **Ownership Model:** Loan/License
- **Entry Price:** $620,000
- **Monthly Service Fees:** $580
- **Annual Fee Increase:** 2.5%
- **DMF Structure:** Annual Accrual with Cap
- **DMF Rate:** 5% (per year)
- **DMF Cap:** 5 years (25% max - better!)
- **Exit Fee:** $0
- **Capital Gain Share:** 70% (better!)
- **Refundable Deposit:** Yes

### **Contract 3: "Lakeside Village" (Worse Deal)**

- **Village Name:** Lakeside Village
- **Ownership Model:** Loan/License
- **Entry Price:** $700,000
- **Monthly Service Fees:** $750
- **Annual Fee Increase:** 4%
- **DMF Structure:** Annual Accrual with Cap
- **DMF Rate:** 7% (per year)
- **DMF Cap:** 6 years (42% max - worse!)
- **Exit Fee:** $5,000
- **Capital Gain Share:** 30% (worse!)
- **Refundable Deposit:** Yes

---

## ✅ What to Look For in the Analysis

The Contract Review should highlight:

### **Green Checks (Good):**
- Lower entry price
- Lower monthly fees
- Lower DMF rate
- Lower DMF cap
- Higher capital gain share
- Lower exit fees

### **Red Flags (Bad):**
- High DMF (30%+)
- High annual fee increases (4%+)
- Low capital gain share (below 50%)
- High exit fees
- Long waiting periods for refund

### **Comparison Icons:**
- ✅ **Green Check:** Best value among contracts
- 📈 **Red Arrow:** Significantly worse than others
- ➖ **Orange Dash:** Middle ground

---

## 🔍 Key Features to Test

### **1. Cost Projections**
- Check the 5, 10, and 15-year projections
- Verify DMF caps correctly at max percentage
- Confirm monthly fees increase annually

### **2. Inheritance Calculator**
- Test different scenarios:
  - Property value unchanged
  - Property value increases 10%
  - Property value decreases 10%
- Verify family receives correct amount after DMF and fees

### **3. Comparison Table**
- Add 2-3 contracts
- Check that best values get green checkmarks
- Verify worst values get red flags

### **4. Risk Scoring**
The app should identify:
- High DMF percentages
- Long payment waiting periods
- Poor capital gain sharing
- High total lifetime costs

---

## 📊 Expected Results for Sample Contract

**Overall Assessment: MODERATE-HIGH RISK**

**Why:**
- ❌ DMF capped at 30% (high)
- ❌ 50/50 capital gain split (you only get half)
- ❌ 100% capital loss risk (you bear all losses)
- ❌ No payment until resale (could wait 6-12+ months)
- ❌ Ongoing charges even after vacating
- ⚠️ Exit costs total 35-45% of entry price
- ✅ 14-day cooling-off period (good)
- ✅ DMF is capped (not unlimited)
- ✅ Clear fee structure

**Recommendation:**
"Consider comparing with other villages. DMF and exit costs are relatively high. Ensure you understand the inheritance impact on your family."

---

## 🎯 Key Questions the Tool Should Help Answer

After entering the sample contract, the tool should help you answer:

1. **"How much will this REALLY cost me?"**
   - Answer: ~$236k over 5 years (DMF + monthly fees)

2. **"What will my family inherit?"**
   - Answer: ~$461k (if sold for $680k after 5 years)
   - That's a **$188k loss** from original $650k

3. **"Is this a good deal compared to others?"**
   - Answer: Need to compare - enter other contracts to see

4. **"What are the biggest risks?"**
   - Answer: High DMF, 50/50 capital gain split, waiting for payment

---

## 🚀 Next Steps After Testing

Once you've tested the manual entry:

### **Working Features:**
- ✅ Manual contract entry
- ✅ Cost projections (5, 10, 15 years)
- ✅ Inheritance calculations
- ✅ Multi-contract comparison
- ✅ Risk indicators
- ✅ Lifetime cost analysis

### **Not Yet Working:**
- ❌ PDF upload (placeholder only)
- ❌ Automated text extraction from PDFs
- ❌ AI natural language analysis

### **To Make PDF Upload Work:**
You would need to:
1. Add file upload backend endpoint
2. Integrate PDF parsing library
3. Add AI to extract key terms
4. Map extracted data to contract fields

**For now:** Manual entry is fully functional and very powerful!

---

## 💡 Pro Tips

### **Tip 1: Test Edge Cases**
Try extreme values:
- 100% DMF
- 0% DMF
- Negative monthly fees (shouldn't work)
- Very long stays (20+ years)

### **Tip 2: Test All 4 Models**
- Loan/License (most common)
- Freehold (you own it)
- Leasehold (fixed term)
- Rental (no ownership)

### **Tip 3: Compare Apples to Apples**
When comparing contracts, use similar:
- Entry prices
- Village amenities
- Locations
- Unit sizes

### **Tip 4: Factor in Capital Growth**
Property might appreciate:
- 2-3% per year (conservative)
- 4-5% per year (moderate)
- 6%+ per year (optimistic)

But remember: In Loan/License, you only get 50% of gains!

---

## 📋 Sample Test Checklist

Use this to ensure everything works:

- [ ] Can add contract via manual entry
- [ ] All fields save correctly
- [ ] DMF calculation is accurate
- [ ] Monthly fees compound annually
- [ ] Cost projections show for 5, 10, 15 years
- [ ] Inheritance calculator works
- [ ] Can add multiple contracts
- [ ] Comparison table appears
- [ ] Best/worst indicators show correctly
- [ ] Can remove contracts
- [ ] Different tenure types work
- [ ] Risk warnings display appropriately

---

## 🎉 You're Ready!

**You now have:**
1. ✅ Sample contract with realistic terms
2. ✅ Manual entry instructions
3. ✅ Expected results to verify against
4. ✅ Multiple test scenarios
5. ✅ Full testing checklist

**Go test it out!** The Contract Review feature is one of your most powerful tools for helping retirees make informed decisions.

---

## ❓ Questions While Testing?

**Issue:** Numbers don't match expected results
- Check: DMF structure (annual vs fixed)
- Check: DMF cap years setting
- Check: Annual fee increase percentage

**Issue:** Comparison icons not showing
- Need: At least 2 contracts added
- Check: Different values entered (not all the same)

**Issue:** Inheritance calculation seems wrong
- Check: Capital gain/loss percentage entered
- Check: Tenure type selected
- Verify: Property appreciation rate

---

**Happy Testing!** 🧪

The sample contract in `/SAMPLE_RETIREMENT_VILLAGE_CONTRACT.md` is ready for you to reference while entering data.
