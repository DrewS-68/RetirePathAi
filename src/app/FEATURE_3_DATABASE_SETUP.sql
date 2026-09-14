-- ============================================
-- Feature #3: Revenue Engine - Database Setup
-- ============================================

-- Part A: Add 'featured' flag to retirement_villages
-- This allows villages to pay for premium placement
ALTER TABLE retirement_villages 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Add index for faster featured village queries
CREATE INDEX IF NOT EXISTS idx_villages_featured 
ON retirement_villages(featured) 
WHERE featured = true;

-- Part B: Create agent_leads table
-- Stores leads from users who need help selling their homes
CREATE TABLE IF NOT EXISTS agent_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- User reference (optional - some may submit before creating account)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Contact Information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Property Location
  postcode TEXT NOT NULL,
  suburb TEXT,
  state TEXT,
  
  -- Property Details
  home_type TEXT, -- 'house', 'apartment', 'townhouse', 'unit'
  estimated_value INTEGER,
  property_address TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  
  -- Timeline & Preferences
  timeline TEXT, -- 'asap', '1-3 months', '3-6 months', '6-12 months', '12+ months'
  reason_for_selling TEXT DEFAULT 'Moving to retirement village',
  additional_notes TEXT,
  
  -- Lead Management
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted', 'lost'
  lead_source TEXT DEFAULT 'home_valuation', -- where they submitted from
  
  -- Agent Assignment & Tracking
  assigned_agent_name TEXT,
  assigned_agent_email TEXT,
  assigned_agent_phone TEXT,
  contacted_at TIMESTAMP,
  
  -- Revenue Tracking
  commission_amount DECIMAL(10, 2),
  commission_paid BOOLEAN DEFAULT false,
  commission_paid_at TIMESTAMP,
  sale_completed_at TIMESTAMP,
  
  -- Admin Notes
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agent_leads_status ON agent_leads(status);
CREATE INDEX IF NOT EXISTS idx_agent_leads_user_id ON agent_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_leads_postcode ON agent_leads(postcode);
CREATE INDEX IF NOT EXISTS idx_agent_leads_created_at ON agent_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_leads_timeline ON agent_leads(timeline);

-- Enable Row Level Security (RLS)
ALTER TABLE agent_leads ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own leads
CREATE POLICY "Users can view their own leads"
  ON agent_leads
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Anyone can insert leads (for non-authenticated submissions)
CREATE POLICY "Anyone can submit leads"
  ON agent_leads
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update their own leads (to add notes, etc)
CREATE POLICY "Users can update their own leads"
  ON agent_leads
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Note: Admin access handled via service role key in backend

-- ============================================
-- Verification Queries (optional - run to check)
-- ============================================

-- Check if featured column was added
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'retirement_villages' AND column_name = 'featured';

-- Check if agent_leads table was created
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_name = 'agent_leads';

-- Show sample of featured villages
-- SELECT id, name, featured, status 
-- FROM retirement_villages 
-- WHERE featured = true 
-- LIMIT 10;
