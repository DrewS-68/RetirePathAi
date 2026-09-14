SCRAPING TIERS - PRIORITY ACTION PLAN

Created: January 17, 2026
Status: Ready to execute after Website Finder completes
Database: 2,569 villages total


3-TIER DATA PRIORITY SYSTEM

We've organized all village data fields into 3 tiers based on importance for launch:

TIER 1: Essential (Must Have for Launch)
Priority: HIGHEST
Target: 90%+ completion
These fields are CRITICAL for platform functionality

TIER 2: Important (Critical for Users)
Priority: HIGH
Target: 80%+ completion
Users make decisions based on this data

TIER 3: Nice to Have (Enhances Experience)
Priority: MEDIUM
Target: 60%+ completion
Improves user experience but not essential


TIER 1: ESSENTIAL DATA (MUST HAVE)

9 Fields That Are NON-NEGOTIABLE:

1. Village Name - Already have 100%
2. State - Already have 100%
3. Suburb/City - Already have 100%
4. Postcode - Already have ~95%
5. Street Address - Already have ~90%
6. Website URL - Currently scraping with Website Finder (~442 missing)
7. Contact Phone - NEEDS SCRAPING
8. Contact Email - NEEDS SCRAPING
9. Operator/Management - Already have ~85%

Current Status:
- 5/9 fields have 85%+ coverage
- 1/9 field (Website) currently being scraped
- 2/9 fields (Phone, Email) need immediate scraping
- 1/9 field (Operator) may need cleanup

Action Required:
1. Complete Website Finder (in progress)
2. Scrape Contact Phone numbers - HIGHEST PRIORITY
3. Scrape Contact Emails - HIGHEST PRIORITY


TIER 2: IMPORTANT DATA (CRITICAL FOR USERS)

8 Fields That Users Need to Make Decisions:

1. Number of Units - NEEDS SCRAPING
2. Accommodation Types (Independent, Assisted, etc.) - NEEDS SCRAPING
3. Lease Structure (Freehold, Leasehold, License) - NEEDS SCRAPING
4. Entry Cost Range (Min/Max pricing) - NEEDS SCRAPING - 642 VILLAGES MISSING
5. Ongoing Fees (Monthly fees) - NEEDS SCRAPING
6. Amenities (Pool, gym, library, etc.) - NEEDS SCRAPING
7. Care Services (Aged care, memory care, nursing) - NEEDS SCRAPING
8. Age Restrictions - Already have ~90%

Current Status:
- 7/8 fields need scraping
- 1/8 field (Age) mostly complete
- Pricing data is the most requested by users

Action Required:
1. Scrape Entry Pricing - TOP PRIORITY (642 villages)
2. Scrape Monthly Fees - HIGH PRIORITY
3. Scrape Amenities - HIGH PRIORITY
4. Scrape Care Services - HIGH PRIORITY
5. Scrape Village Types - MEDIUM PRIORITY
6. Scrape Lease Structure - MEDIUM PRIORITY
7. Scrape Number of Units - MEDIUM PRIORITY


TIER 3: NICE TO HAVE (ENHANCES EXPERIENCE)

3 Fields That Improve the Experience:

1. Description/Overview - NEEDS SCRAPING
2. Photos (Gallery) - NEEDS SCRAPING
3. Pet Policy - NEEDS SCRAPING

Current Status:
- 3/3 fields need scraping
- Images are important for top 500 villages
- Descriptions can be AI-generated if scraping fails
- Pet policy is a common filter request

Action Required:
1. Scrape Village Descriptions - DO AFTER TIER 1 & 2
2. Scrape Image Galleries - DO AFTER TIER 1 & 2 (focus on top 500)
3. Scrape Pet Policies - DO AFTER TIER 1 & 2


RECOMMENDED SCRAPING SEQUENCE

PHASE 1: Complete Website Finding (IN PROGRESS)
Status: Currently running
Target: Find ~442 missing website URLs
Time: 2-4 hours (auto-processor running)

This will give you ~90% website coverage needed for scraping


PHASE 2: TIER 1 Essential Contact Data - DO THIS NEXT!
Priority: URGENT
Target: 90%+ completion

Step 1: Scrape Contact Emails
- Villages: ~2,400+ missing email addresses
- Time: 2-3 hours
- Filter Button: "Missing Email"
- Expected Success Rate: 70-85%
- Why First: Essential for users to contact villages

How to Do:
1. Go to Admin Dashboard → Batch Scraping tab
2. Click "Missing Email" filter
3. Select all villages (or batch by state)
4. Click "Start Scraping"
5. Review results, save successful ones
6. Repeat until 90%+ have emails

Step 2: Scrape Contact Phone Numbers
- Villages: ~2,300+ missing phone numbers
- Time: 2-3 hours
- Filter Button: Use "Missing Email" (scrapes both)
- Expected Success Rate: 75-90%
- Why Second: Critical contact method

Note: Phone numbers are scraped at the same time as emails (same scraping run)


PHASE 3: TIER 2 Pricing Data - HIGHEST USER VALUE
Priority: HIGH
Target: 80%+ completion

Step 3: Scrape Entry Pricing
- Villages: 642 missing pricing data
- Time: 2-4 hours
- Filter Button: "Incomplete Pricing"
- Expected Success Rate: 60-75%
- Why Third: Most requested data by users

How to Do:
1. Go to Admin Dashboard → Batch Scraping tab
2. Click "Incomplete Pricing" filter
3. Start with 50 villages (test batch)
4. If successful, scrape remaining 592 in batches of 50
5. Review results, save successful ones

What Gets Scraped:
- Entry price minimum
- Entry price maximum
- Monthly fees minimum
- Monthly fees maximum


PHASE 4: TIER 2 Amenities & Services Data
Priority: HIGH
Target: 75%+ completion

Step 4: Scrape Amenities
- Villages: ~2,100+ missing amenities
- Time: 2-3 hours
- Filter Button: "Missing Amenities"
- Expected Success Rate: 50-70%
- Why Fourth: Users filter by amenities (pool, gym, etc.)

How to Do:
1. Click "Missing Amenities" filter
2. Scrape in batches of 50
3. Save results

What Gets Scraped:
- Pool
- Gym/Fitness center
- Library
- Cinema/Theatre
- Bowling green
- Golf course
- Restaurant/Café
- Beauty salon
- Workshop/Craft room
- And 20+ more amenities

Step 5: Scrape Care Services
- Villages: ~2,000+ missing care data
- Time: 2-3 hours
- Filter Button: "Missing Amenities" (scrapes both)
- Expected Success Rate: 40-60%
- Why Fifth: Critical for users needing care

What Gets Scraped:
- Aged care available
- Memory care/Dementia care
- Nursing care
- Home care packages
- Palliative care
- 24-hour emergency care

Note: Care services are scraped at the same time as amenities


PHASE 5: TIER 2 Property Details
Priority: MEDIUM
Target: 70%+ completion

Step 6: Scrape Property Details
- Villages: Most villages missing these details
- Time: 2-3 hours
- Filter Button: Use "Incomplete Pricing" or custom filter
- Expected Success Rate: 40-60%

What Gets Scraped:
- Village type (Independent, Assisted, Mixed)
- Accommodation types (Villas, Apartments, Studios)
- Lease structure (Freehold, Leasehold, License)
- Number of units
- Land size


PHASE 6: TIER 3 Enhanced Content
Priority: LOWER (Do after launch if needed)
Target: 60%+ for top 500 villages

Step 7: Scrape Images
- Villages: Focus on top 500 first
- Time: 4-6 hours
- Expected Success Rate: 70-85%

How to Do:
1. Filter by top 500 villages (by popularity/reviews)
2. Scrape image galleries
3. Aim for 3-5 images minimum per village
4. Save to Supabase Storage

Step 8: Scrape Descriptions
- Villages: Most villages missing descriptions
- Time: 2-3 hours
- Expected Success Rate: 50-70%
- Alternative: AI-generate descriptions for villages without scraped content

Step 9: Scrape Pet Policies
- Villages: Most villages missing pet info
- Time: 1-2 hours
- Expected Success Rate: 30-50%
- Fallback: Mark as "Contact village for pet policy"


TOTAL TIME ESTIMATES

Minimum Viable Launch Data:
- Phase 1: Website Finding (2-4 hours) - IN PROGRESS
- Phase 2: Contact Info (4-6 hours) - TIER 1
- Phase 3: Pricing Data (2-4 hours) - TIER 2
- Phase 4: Amenities/Care (4-6 hours) - TIER 2

TOTAL: 12-20 hours to get 85%+ database completion for launch

Complete Database (All Tiers):
- All above phases: 12-20 hours
- Phase 5: Property Details (2-3 hours) - TIER 2
- Phase 6: Images/Descriptions (6-9 hours) - TIER 3

TOTAL: 20-32 hours for 90%+ complete database


WEEK-BY-WEEK PLAN

Week 1: Essential Data (TIER 1)
Goal: Get to 90% completion on contact info

- Monday: Website Finder completes
- Tuesday: Scrape contact emails (2-3 hours)
- Wednesday: Verify email scraping, handle failures
- Thursday: Check phone number coverage from email scraper
- Friday: Review Tier 1 completion stats

End of Week Target: 90%+ villages have website, email, phone

Week 2: Critical User Data (TIER 2)
Goal: Get to 80% completion on pricing and amenities

- Monday: Scrape entry pricing (2-4 hours) - 642 villages
- Tuesday: Review pricing results, handle failures
- Wednesday: Scrape amenities (2-3 hours)
- Thursday: Scrape care services (2-3 hours)
- Friday: Review Tier 2 completion stats

End of Week Target: 80%+ villages have pricing, 75%+ have amenities

Week 3: Property Details (TIER 2)
Goal: Complete remaining Tier 2 fields

- Monday: Scrape village types and accommodation
- Tuesday: Scrape lease structures
- Wednesday: Scrape unit counts
- Thursday: Manual entry for top 50 villages
- Friday: Review overall Tier 2 completion

End of Week Target: 75%+ completion on all Tier 2 fields

Week 4: Enhanced Content (TIER 3)
Goal: Add descriptions and images for top villages

- Monday: Scrape images for top 200 villages
- Tuesday: Scrape images for top 500 villages
- Wednesday: Scrape descriptions
- Thursday: Scrape pet policies
- Friday: Final database quality review

End of Week Target: 60%+ completion on Tier 3, ready for launch


LAUNCH READINESS CHECKLIST

TIER 1: Essential (Must Have 90%+)
- Website URLs: 90%+ coverage (~2,312 villages)
- Contact Emails: 90%+ coverage (~2,312 villages)
- Contact Phones: 90%+ coverage (~2,312 villages)
- Operator Names: 85%+ coverage (~2,184 villages)

TIER 2: Important (Must Have 80%+)
- Entry Pricing: 80%+ coverage (~2,055 villages)
- Monthly Fees: 75%+ coverage (~1,927 villages)
- Amenities: 75%+ coverage (~1,927 villages)
- Care Services: 70%+ coverage (~1,799 villages)
- Village Types: 70%+ coverage (~1,799 villages)

TIER 3: Nice to Have (Target 60%+)
- Descriptions: 60%+ coverage (~1,541 villages)
- Images (Top 500): 80%+ coverage (400 villages)
- Pet Policies: 50%+ coverage (~1,285 villages)


CRITICAL PATH FOR LAUNCH

BARE MINIMUM FOR LAUNCH (2 WEEKS):

1. Website URLs - 90%+ (Week 1)
2. Contact Emails - 90%+ (Week 1)
3. Contact Phones - 90%+ (Week 1)
4. Entry Pricing - 75%+ (Week 2)
5. Amenities - 70%+ (Week 2)

If you have these 5 fields at 75%+, you can launch!

Everything else can be added post-launch.


SUCCESS METRICS

Tier 1 Success = LAUNCHABLE
- 90%+ villages have full contact info (email, phone, website)
- Users can contact any village easily
- Status: NOT READY (need to scrape contact info)

Tier 2 Success = COMPETITIVE
- 80%+ villages have pricing and amenities
- Users can compare and filter effectively
- Status: NOT READY (need to scrape pricing + amenities)

Tier 3 Success = EXCELLENT
- 60%+ villages have descriptions and images
- Premium user experience
- Status: NOT READY (need to scrape content)


TOOLS YOU'LL USE

1. Web Scraper Tool
- Location: Admin Dashboard → Batch Scraping tab
- Used for: Scraping ALL data types
- Features: Tier-based scraping, batch processing, auto-save

2. Website Finder Tool
- Location: Same tab, purple "No Website" button
- Used for: Finding missing website URLs
- Status: Currently running (auto-processor)

3. Data Quality Dashboard
- Location: Admin Dashboard → Data Quality tab
- Used for: Monitoring completion % by tier
- Features: Field-by-field analysis, tier stats, bottom-10 villages


PRO TIPS

Tip 1: Scrape in Priority Order
Don't skip ahead! Complete Tier 1 before moving to Tier 2.

Tip 2: Test with Small Batches
Always test with 10-50 villages before running 500+

Tip 3: Monitor API Usage
ScraperAPI has limits - check dashboard regularly

Tip 4: Save Frequently
Use auto-save and export CSV backups

Tip 5: Manual Entry for VIPs
For top 50 villages, consider manual data entry for accuracy

Tip 6: Operator Outreach
After scraping, send "Claim Your Listing" emails - operators will fill in missing data!

Tip 7: Focus on Success Rate
If scraper has <50% success rate, the website structure may be incompatible. Move on.


WHICH FIELDS CAN BE SCRAPED TOGETHER?

Single Scrape Run Can Get:

Contact Info Scrape (use "Missing Email"):
- Email
- Phone
- Physical address
- Operator/Management company

Pricing Scrape (use "Incomplete Pricing"):
- Entry price min/max
- Monthly fee min/max
- Lease structure
- DMF structure

Amenities Scrape (use "Missing Amenities"):
- All amenities (pool, gym, etc.)
- All care services
- Pet policy
- Age restrictions

Property Details Scrape (use custom filter):
- Village type
- Accommodation types
- Number of units
- Land size

Content Scrape (use custom filter):
- Descriptions
- Image URLs
- Facility details


IMMEDIATE NEXT STEPS

Today (Saturday, Jan 17):
1. Let Website Finder complete (currently running)
2. Monitor auto-processor progress
3. Check success rate when done

Tomorrow (Sunday, Jan 18):
1. Go to Admin Dashboard → Batch Scraping
2. Click "Missing Email" filter
3. Test scrape 50 villages
4. If successful, scrape remaining ~2,350 villages in batches

Monday (Jan 19):
1. Review Tier 1 completion (should be 90%+)
2. Click "Incomplete Pricing" filter
3. Start scraping 642 villages with missing pricing

Target: Jan 31 Launch
- Week 1: Complete Tier 1 (contact info)
- Week 2: Complete Tier 2 (pricing + amenities)
- Week 3: Buffer for issues + manual cleanup
- Week 4: Final testing + launch prep


NEED HELP?

If scraping fails or you get stuck:
1. Check browser console for errors
2. Verify ScraperAPI has remaining credits
3. Try reducing batch size to 25
4. Ask me for help!


Remember: You don't need 100% completion. Aim for 85%+ on Tiers 1 & 2, and you're ready to launch!


Created: January 17, 2026
Next Review: After Website Finder completes
Status: Ready to execute Tier 1 scraping
