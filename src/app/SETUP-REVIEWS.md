# Reviews System Setup Instructions

## ✅ Features #6 & #7 Implementation Complete!

You've successfully built:
- **Feature #7: User Reviews System** - Full review submission, moderation, and display
- **Feature #6: Enhanced Village Profiles** - Coming next!

---

## 🔧 Required: Database Setup

To enable the reviews system, you need to create the `village_reviews_3bba8be8` table in your Supabase database.

### **Step 1: Access Supabase SQL Editor**

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **RetirePath**
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### **Step 2: Execute the SQL Script**

Copy the entire contents of `/database-schema-reviews.sql` and paste it into the SQL editor, then click **Run**.

Alternatively, copy this SQL directly:

```sql
CREATE TABLE IF NOT EXISTS village_reviews_3bba8be8 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  village_id UUID NOT NULL REFERENCES retirement_villages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  experience_type TEXT,
  stayed_duration TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  helpful_count INTEGER DEFAULT 0,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_village_id ON village_reviews_3bba8be8(village_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON village_reviews_3bba8be8(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON village_reviews_3bba8be8(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON village_reviews_3bba8be8(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON village_reviews_3bba8be8(created_at DESC);

ALTER TABLE village_reviews_3bba8be8 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved reviews"
  ON village_reviews_3bba8be8
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Authenticated users can insert reviews"
  ON village_reviews_3bba8be8
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can read their own reviews"
  ON village_reviews_3bba8be8
  FOR SELECT
  USING (auth.uid() = user_id);
```

### **Step 3: Verify Installation**

After running the SQL, verify the table was created:
1. In Supabase Dashboard, go to **Table Editor**
2. Look for `village_reviews_3bba8be8` in the tables list
3. Confirm it has all the expected columns

---

## 🎯 What's Been Built

### **Feature #7: User Reviews System** ✅

#### **Backend API** (`/supabase/functions/server/reviews.ts`)
- ✅ POST `/reviews` - Submit a new review (authenticated users only)
- ✅ GET `/reviews/village/:villageId` - Get all approved reviews for a village
- ✅ GET `/reviews/user` - Get user's own reviews
- ✅ PUT `/reviews/:reviewId/helpful` - Mark review as helpful
- ✅ GET `/reviews/admin/all` - Admin: Get all reviews
- ✅ PUT `/reviews/admin/:reviewId/approve` - Admin: Approve review
- ✅ PUT `/reviews/admin/:reviewId/reject` - Admin: Reject review
- ✅ DELETE `/reviews/admin/:reviewId` - Admin: Delete review

#### **Frontend Components**
- ✅ `ReviewSubmissionForm.tsx` - User-facing review submission form with:
  - Star rating selector (1-5 stars)
  - Review title and comment
  - Experience type selection (resident, family member, visitor)
  - Duration selection for residents
  - Character limits and validation
  - Success messaging

- ✅ `VillageReviews.tsx` - Display reviews with:
  - Average rating calculation
  - Rating distribution chart
  - Individual review cards
  - "Helpful" voting functionality
  - User badges (experience type, duration)
  - Responsive design

- ✅ `ReviewsManager.tsx` - Admin dashboard tab with:
  - Stats cards (total, pending, approved, rejected)
  - Three tabs for different statuses
  - Approve/Reject/Delete actions
  - Review detail modal
  - Rejection reason input
  - Real-time refresh

#### **Key Features**
- 🔒 **Authentication Required** - Must be logged in to submit reviews
- ⭐ **Star Ratings** - 1-5 star system with visual feedback
- ✅ **Moderation System** - All reviews start as "pending" and require admin approval
- 👥 **User Context** - Reviews show experience type (resident, family, visitor)
- 📊 **Analytics** - Average ratings and distribution charts
- 👍 **Helpful Votes** - Users can mark reviews as helpful
- 🚫 **One Review Per User Per Village** - Prevents spam

---

## 🚀 Next: Feature #6 - Enhanced Village Profiles

Now that reviews are complete, we'll build enhanced village detail pages with:
- **Tabbed layout** (Overview, Pricing, Amenities, Location, Reviews)
- **Image gallery** with lightbox
- **Interactive map**
- **Better pricing breakdown**
- **Comprehensive amenities display**
- **Integrated reviews section**

---

## 📝 Notes

- Reviews are stored in Supabase (not KV store) for better querying and relational data
- Row Level Security (RLS) ensures:
  - Anyone can read approved reviews
  - Only authenticated users can submit reviews
  - Users can always see their own reviews (any status)
  - Admin (service_role) has full access

- All review submissions go through moderation to ensure quality
- Admins can approve, reject, or delete reviews from the dashboard
