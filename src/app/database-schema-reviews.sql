-- Reviews Table for RetirePath
-- This table stores user reviews for retirement villages
-- 
-- IMPORTANT: Execute this SQL in your Supabase SQL Editor
-- Go to: Supabase Dashboard > SQL Editor > New Query
-- Paste this code and click "Run"

CREATE TABLE IF NOT EXISTS village_reviews_3bba8be8 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  village_id UUID NOT NULL REFERENCES retirement_villages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  experience_type TEXT, -- 'current_resident', 'past_resident', 'family_member', 'visitor'
  stayed_duration TEXT, -- e.g., '1-2 years', '3-5 years', '5+ years'
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  helpful_count INTEGER DEFAULT 0,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reviews_village_id ON village_reviews_3bba8be8(village_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON village_reviews_3bba8be8(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON village_reviews_3bba8be8(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON village_reviews_3bba8be8(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON village_reviews_3bba8be8(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE village_reviews_3bba8be8 ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow anyone to read approved reviews
CREATE POLICY "Anyone can read approved reviews"
  ON village_reviews_3bba8be8
  FOR SELECT
  USING (status = 'approved');

-- Allow authenticated users to insert reviews
CREATE POLICY "Authenticated users can insert reviews"
  ON village_reviews_3bba8be8
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow users to read their own reviews (any status)
CREATE POLICY "Users can read their own reviews"
  ON village_reviews_3bba8be8
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role has full access (for admin operations)
-- This is automatically handled by Supabase service_role key

-- Comments
COMMENT ON TABLE village_reviews_3bba8be8 IS 'User reviews for retirement villages with moderation';
COMMENT ON COLUMN village_reviews_3bba8be8.status IS 'pending = awaiting moderation, approved = visible to public, rejected = not shown';
COMMENT ON COLUMN village_reviews_3bba8be8.experience_type IS 'Type of experience: current_resident, past_resident, family_member, visitor';
COMMENT ON COLUMN village_reviews_3bba8be8.helpful_count IS 'Number of times users marked this review as helpful';
