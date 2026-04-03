-- 1. Crear tabla matches (si no existe)
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

-- 2. Crear tabla predictions referenciando login_users (NO profiles)
CREATE TABLE IF NOT EXISTS predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES login_users(id) ON DELETE CASCADE NOT NULL,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  predicted_home_score INTEGER NOT NULL,
  predicted_away_score INTEGER NOT NULL,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, match_id)
);

-- 3. Índices de performance
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match_id ON predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

-- 4. Función para calcular puntos cuando un partido termina
CREATE OR REPLACE FUNCTION calculate_prediction_points()
RETURNS TRIGGER AS $$
DECLARE
  pred RECORD;
BEGIN
  IF NEW.status = 'finished' AND NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL THEN
    FOR pred IN
      SELECT * FROM predictions WHERE match_id = NEW.id
    LOOP
      UPDATE predictions
      SET points = CASE
        -- Exacto: 3 puntos
        WHEN pred.predicted_home_score = NEW.home_score
         AND pred.predicted_away_score = NEW.away_score THEN 3
        -- Ganador correcto: 1 punto
        WHEN (pred.predicted_home_score > pred.predicted_away_score AND NEW.home_score > NEW.away_score)
          OR (pred.predicted_home_score < pred.predicted_away_score AND NEW.home_score < NEW.away_score)
          OR (pred.predicted_home_score = pred.predicted_away_score AND NEW.home_score = NEW.away_score) THEN 1
        ELSE 0
      END,
      updated_at = NOW()
      WHERE id = pred.id;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger para calcular puntos al finalizar partido
DROP TRIGGER IF EXISTS calculate_points_on_match_finish ON matches;
CREATE TRIGGER calculate_points_on_match_finish
  AFTER UPDATE ON matches
  FOR EACH ROW
  WHEN (NEW.status = 'finished')
  EXECUTE FUNCTION calculate_prediction_points();

-- 6. Partidos de muestra Mundial 2026
INSERT INTO matches (home_team, away_team, match_date, stage, status) VALUES
  ('Mexico', 'Canada', '2026-06-11 18:00:00+00', 'Group Stage', 'scheduled'),
  ('USA', 'Wales', '2026-06-12 20:00:00+00', 'Group Stage', 'scheduled'),
  ('Argentina', 'Morocco', '2026-06-13 16:00:00+00', 'Group Stage', 'scheduled'),
  ('Brazil', 'Japan', '2026-06-14 18:00:00+00', 'Group Stage', 'scheduled'),
  ('Germany', 'Australia', '2026-06-15 20:00:00+00', 'Group Stage', 'scheduled'),
  ('Spain', 'Croatia', '2026-06-16 18:00:00+00', 'Group Stage', 'scheduled'),
  ('France', 'Denmark', '2026-06-17 20:00:00+00', 'Group Stage', 'scheduled'),
  ('England', 'Iran', '2026-06-18 16:00:00+00', 'Group Stage', 'scheduled'),
  ('Portugal', 'Ghana', '2026-06-19 16:00:00+00', 'Group Stage', 'scheduled'),
  ('Netherlands', 'Senegal', '2026-06-20 18:00:00+00', 'Group Stage', 'scheduled')
ON CONFLICT DO NOTHING;
