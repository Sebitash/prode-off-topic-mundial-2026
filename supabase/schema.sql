-- Mundial 2026 Prode Database Schema
-- Run this in your Supabase SQL Editor

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  stage TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  predicted_home_score INTEGER NOT NULL,
  predicted_away_score INTEGER NOT NULL,
  points INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, match_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match_id ON predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

-- Create leaderboard view
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  p.user_id,
  pr.username,
  pr.email,
  COALESCE(SUM(p.points), 0) as total_points,
  COUNT(p.id) as total_predictions
FROM profiles pr
LEFT JOIN predictions p ON pr.id = p.user_id
GROUP BY p.user_id, pr.username, pr.email
ORDER BY total_points DESC;

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Matches policies
CREATE POLICY "Matches are viewable by everyone"
  ON matches FOR SELECT
  USING (true);

-- Predictions policies
CREATE POLICY "Users can view own predictions"
  ON predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own predictions"
  ON predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own predictions before match starts"
  ON predictions FOR UPDATE
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = match_id
      AND matches.match_date > NOW()
      AND matches.status = 'scheduled'
    )
  );

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate points for predictions
CREATE OR REPLACE FUNCTION calculate_prediction_points()
RETURNS TRIGGER AS $$
DECLARE
  pred RECORD;
BEGIN
  -- Only calculate when match is finished and has scores
  IF NEW.status = 'finished' AND NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL THEN
    -- Update all predictions for this match
    FOR pred IN 
      SELECT * FROM predictions WHERE match_id = NEW.id
    LOOP
      UPDATE predictions
      SET points = CASE
        -- Exact score: 3 points
        WHEN pred.predicted_home_score = NEW.home_score 
         AND pred.predicted_away_score = NEW.away_score THEN 3
        -- Correct winner/draw: 1 point
        WHEN (pred.predicted_home_score > pred.predicted_away_score AND NEW.home_score > NEW.away_score)
          OR (pred.predicted_home_score < pred.predicted_away_score AND NEW.home_score < NEW.away_score)
          OR (pred.predicted_home_score = pred.predicted_away_score AND NEW.home_score = NEW.away_score) THEN 1
        -- Incorrect: 0 points
        ELSE 0
      END,
      updated_at = NOW()
      WHERE id = pred.id;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate points when match is updated
DROP TRIGGER IF EXISTS calculate_points_on_match_finish ON matches;
CREATE TRIGGER calculate_points_on_match_finish
  AFTER UPDATE ON matches
  FOR EACH ROW
  WHEN (NEW.status = 'finished')
  EXECUTE FUNCTION calculate_prediction_points();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_predictions_updated_at ON predictions;
CREATE TRIGGER update_predictions_updated_at
  BEFORE UPDATE ON predictions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample matches (you can customize these)
INSERT INTO matches (home_team, away_team, match_date, stage, status) VALUES
  ('Mexico', 'Canada', '2026-06-11 18:00:00+00', 'Group Stage', 'scheduled'),
  ('USA', 'Wales', '2026-06-12 20:00:00+00', 'Group Stage', 'scheduled'),
  ('Argentina', 'Morocco', '2026-06-13 16:00:00+00', 'Group Stage', 'scheduled'),
  ('Brazil', 'Japan', '2026-06-14 18:00:00+00', 'Group Stage', 'scheduled'),
  ('Germany', 'Australia', '2026-06-15 20:00:00+00', 'Group Stage', 'scheduled'),
  ('Spain', 'Croatia', '2026-06-16 18:00:00+00', 'Group Stage', 'scheduled'),
  ('France', 'Denmark', '2026-06-17 20:00:00+00', 'Group Stage', 'scheduled'),
  ('England', 'Iran', '2026-06-18 16:00:00+00', 'Group Stage', 'scheduled')
ON CONFLICT DO NOTHING;
