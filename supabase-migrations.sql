-- Migration file for Supabase database optimizations
-- Run these commands in your Supabase SQL Editor

-- 1. Create function to get aggregated review stats (for home page performance)
CREATE OR REPLACE FUNCTION get_review_stats()
RETURNS TABLE (
  club_id TEXT,
  avg_rating NUMERIC,
  review_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.club_id,
    AVG(r.rating)::NUMERIC(3,2) as avg_rating,
    COUNT(*)::BIGINT as review_count
  FROM reviews r
  WHERE r.flagged = FALSE
  GROUP BY r.club_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- 2. Add text length constraints to prevent abuse (skip if already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'text_content_max_length'
  ) THEN
    ALTER TABLE reviews ADD CONSTRAINT text_content_max_length CHECK (length(text_content) <= 500);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_major_max_length'
  ) THEN
    ALTER TABLE reviews ADD CONSTRAINT user_major_max_length CHECK (length(user_major) <= 50);
  END IF;
END $$;

-- 3. Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reviews_club_id ON reviews(club_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_flagged ON reviews(flagged) WHERE flagged = FALSE;

-- 4. Add rate limiting table to prevent spam
CREATE TABLE IF NOT EXISTS review_rate_limit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- Could be IP, fingerprint, etc.
  club_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(identifier, club_id)
);

-- Create index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_rate_limit_created_at ON review_rate_limit(created_at);

-- Enable RLS on rate_limit table
ALTER TABLE review_rate_limit ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate them
DROP POLICY IF EXISTS "Allow public read access" ON review_rate_limit;
DROP POLICY IF EXISTS "Allow public insert access" ON review_rate_limit;
DROP POLICY IF EXISTS "Deny public updates" ON review_rate_limit;
DROP POLICY IF EXISTS "Deny public deletes" ON review_rate_limit;

-- Allow anyone to read rate limits (needed for check_review_rate_limit function)
CREATE POLICY "Allow public read access" ON review_rate_limit
  FOR SELECT USING (true);

-- Allow anyone to insert rate limits (needed for record_review_submission function)
CREATE POLICY "Allow public insert access" ON review_rate_limit
  FOR INSERT WITH CHECK (true);

-- Prevent public updates and deletes (only functions can do this)
CREATE POLICY "Deny public updates" ON review_rate_limit
  FOR UPDATE USING (false);

CREATE POLICY "Deny public deletes" ON review_rate_limit
  FOR DELETE USING (false);

-- Function to check and enforce rate limiting (1 review per club per identifier)
CREATE OR REPLACE FUNCTION check_review_rate_limit(
  p_identifier TEXT,
  p_club_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  existing_count INTEGER;
BEGIN
  -- Check if this identifier has already reviewed this club
  SELECT COUNT(*) INTO existing_count
  FROM review_rate_limit
  WHERE identifier = p_identifier
    AND club_id = p_club_id;

  RETURN existing_count = 0;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to record a review submission (call after successful insert)
CREATE OR REPLACE FUNCTION record_review_submission(
  p_identifier TEXT,
  p_club_id TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO review_rate_limit (identifier, club_id)
  VALUES (p_identifier, p_club_id)
  ON CONFLICT (identifier, club_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Optional: Function to clean up old rate limit entries (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS VOID AS $$
BEGIN
  DELETE FROM review_rate_limit
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
