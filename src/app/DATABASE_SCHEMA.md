# Retirement Villages Database Schema

## Table: `retirement_villages`

This table needs to be created in your Supabase database before the system can function.

### SQL to Create Table

```sql
-- Create retirement villages table
CREATE TABLE retirement_villages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Information
  name TEXT NOT NULL,
  operator TEXT,
  location TEXT NOT NULL,
  suburb TEXT NOT NULL,
  postcode TEXT NOT NULL,
  state TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Village Type & Care
  village_type TEXT, -- 'Freehold', 'Loan-License', 'Rental', 'Strata'
  care_level TEXT, -- 'Independent', 'Assisted', 'Aged Care', 'Mixed'
  
  -- Pricing
  entry_price_min INTEGER,
  entry_price_max INTEGER,
  monthly_fees_min INTEGER,
  monthly_fees_max INTEGER,
  dmf_structure TEXT,
  dmf_percentage DECIMAL(5, 2),
  dmf_cap DECIMAL(5, 2),
  
  -- Features (JSON arrays for flexibility)
  amenities JSONB DEFAULT '[]'::jsonb,
  care_services JSONB DEFAULT '[]'::jsonb,
  activities JSONB DEFAULT '[]'::jsonb,
  
  -- Attributes
  pet_friendly BOOLEAN DEFAULT false,
  total_units INTEGER,
  bedrooms TEXT[], -- e.g., ['1', '2', '3']
  age_restriction INTEGER DEFAULT 55,
  
  -- Contact Information
  contact_phone TEXT,
  contact_email TEXT,
  website TEXT,
  
  -- Description & Media
  description TEXT,
  images TEXT[], -- Array of image URLs
  
  -- Admin & Status
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  source TEXT DEFAULT 'manual', -- 'manual', 'operator_submission', 'scraper', 'purchased_data'
  verified BOOLEAN DEFAULT false,
  
  -- Approval tracking
  submitted_at TIMESTAMP,
  approved_at TIMESTAMP,
  approved_by UUID,
  rejected_at TIMESTAMP,
  rejected_by UUID,
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_villages_postcode ON retirement_villages(postcode);
CREATE INDEX idx_villages_state ON retirement_villages(state);
CREATE INDEX idx_villages_status ON retirement_villages(status);
CREATE INDEX idx_villages_type ON retirement_villages(village_type);
CREATE INDEX idx_villages_price_min ON retirement_villages(entry_price_min);
CREATE INDEX idx_villages_price_max ON retirement_villages(entry_price_max);
CREATE INDEX idx_villages_pet_friendly ON retirement_villages(pet_friendly);

-- Enable Row Level Security (RLS)
ALTER TABLE retirement_villages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view approved villages
CREATE POLICY "Anyone can view approved villages"
  ON retirement_villages
  FOR SELECT
  USING (status = 'approved');

-- Policy: Authenticated users can submit villages
CREATE POLICY "Authenticated users can submit villages"
  ON retirement_villages
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Only service role can update villages (admin only)
-- This is handled via service role key in backend
```

## How to Set This Up

### Step 1: Create the Table in Supabase

1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy and paste the SQL above
5. Click "Run" to execute

### Step 2: Verify Table Creation

```sql
-- Check if table exists
SELECT * FROM retirement_villages LIMIT 1;
```

### Step 3: (Optional) Add Sample Data for Testing

```sql
-- Insert a sample village
INSERT INTO retirement_villages (
  name,
  operator,
  location,
  suburb,
  postcode,
  state,
  latitude,
  longitude,
  village_type,
  care_level,
  entry_price_min,
  entry_price_max,
  monthly_fees_min,
  monthly_fees_max,
  dmf_structure,
  amenities,
  pet_friendly,
  total_units,
  bedrooms,
  contact_phone,
  contact_email,
  website,
  description,
  status,
  source
) VALUES (
  'Sample Retirement Village',
  'Sample Operator',
  '123 Main Street',
  'Brighton',
  '3186',
  'VIC',
  -37.9104,
  145.0021,
  'Loan-License',
  'Independent',
  400000,
  600000,
  500,
  700,
  '5% per year, capped at 30%',
  '["Swimming pool", "Gym", "Community center", "Library"]'::jsonb,
  true,
  120,
  ARRAY['1', '2', '3'],
  '03 9999 9999',
  'info@samplevillage.com.au',
  'https://samplevillage.com.au',
  'A beautiful retirement village with modern facilities and caring staff.',
  'approved',
  'manual'
);
```

## Data Structure Details

### Village Types
- `Freehold` - Full ownership
- `Loan-License` - No equity, loan agreement
- `Rental` - Regular tenancy
- `Strata` - Strata title ownership

### Care Levels
- `Independent` - Fully independent living
- `Assisted` - Some care services available
- `Aged Care` - Full aged care facility
- `Mixed` - Multiple levels available

### Status Values
- `pending` - Awaiting admin approval
- `approved` - Live on the platform
- `rejected` - Not approved for listing

### Source Values
- `manual` - Manually added by admin
- `operator_submission` - Submitted via operator form
- `scraper` - Collected via web scraping
- `purchased_data` - From commercial data provider

### Amenities (JSON array examples)
```json
[
  "Swimming pool",
  "Gym & fitness center",
  "Community center",
  "Library",
  "Cinema room",
  "Bowling green",
  "Tennis courts",
  "Workshop",
  "Arts & crafts studio",
  "Garden plots",
  "Dog park",
  "BBQ areas",
  "Medical center",
  "Hairdresser",
  "Cafe/restaurant"
]
```

### Care Services (JSON array examples)
```json
[
  "24/7 emergency response",
  "On-site nurse",
  "GP visits",
  "Physio
therapy",
  "Podiatry",
  "Meals service",
  "Cleaning service",
  "Laundry service",
  "Transport service",
  "Home maintenance"
]
```

### Activities (JSON array examples)
```json
[
  "Exercise classes",
  "Arts & crafts",
  "Card games",
  "Movie nights",
  "Excursions",
  "Social events",
  "Dancing",
  "Gardening club",
  "Book club",
  "Cooking classes"
]
```

## Next Steps

After creating the table:

1. ✅ Table is ready to receive village data
2. ✅ API endpoints are configured
3. ✅ Operator submission form will save to this table
4. ✅ Admin dashboard will read from this table
5. ✅ Village Matcher will query this table

The system is now ready to accept village data from:
- Operator submissions
- Web scraping imports
- Manual admin entries
- Purchased database imports
