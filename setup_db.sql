-- Run this in your Supabase SQL Editor

-- Table to store the overall 30-day campaign plan
CREATE TABLE IF NOT EXISTS campaign_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  brand_id UUID,
  status VARCHAR NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  settings JSONB
);

-- Table to store the daily posts that belong to a campaign plan
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaign_plans(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  post_date DATE NOT NULL,
  format VARCHAR NOT NULL, 
  hook TEXT NOT NULL,
  caption TEXT NOT NULL,
  visual_concept TEXT NOT NULL,
  media_url TEXT, 
  status VARCHAR NOT NULL DEFAULT 'planned', 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
