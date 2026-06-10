-- Reglas de puntaje unificadas para todos los partidos (grupos y eliminatorias):
--   - 2 puntos por acertar el ganador del partido.
--   - +1 punto extra si además acertás el resultado exacto (tiempo reglamentario).
--   - Si el partido termina empatado y se define por penales, el ganador de la
--     definición por penales es el "ganador" del partido a estos efectos.

-- 1) Columnas para registrar el resultado de la definición por penales (si aplica)
ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS home_penalties INTEGER,
  ADD COLUMN IF NOT EXISTS away_penalties INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'matches_penalties_valid'
  ) THEN
    ALTER TABLE matches
      ADD CONSTRAINT matches_penalties_valid CHECK (
        (home_penalties IS NULL AND away_penalties IS NULL)
        OR (
          home_penalties >= 0 AND away_penalties >= 0
          AND home_penalties <> away_penalties
        )
      );
  END IF;
END $$;

-- 2) Recalcular puntos: 2 por ganador (incluye definición por penales) + 1 por resultado exacto
CREATE OR REPLACE FUNCTION calculate_prediction_points()
RETURNS TRIGGER AS $$
DECLARE
  pred RECORD;
  actual_winner TEXT;
  predicted_winner TEXT;
BEGIN
  IF NEW.status = 'finished' AND NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL THEN
    -- Ganador real: resultado del partido, o definición por penales si terminó empatado
    IF NEW.home_score > NEW.away_score THEN
      actual_winner := 'home';
    ELSIF NEW.home_score < NEW.away_score THEN
      actual_winner := 'away';
    ELSIF NEW.home_penalties IS NOT NULL AND NEW.away_penalties IS NOT NULL
          AND NEW.home_penalties <> NEW.away_penalties THEN
      actual_winner := CASE WHEN NEW.home_penalties > NEW.away_penalties THEN 'home' ELSE 'away' END;
    ELSE
      actual_winner := 'draw';
    END IF;

    FOR pred IN
      SELECT * FROM predictions WHERE match_id = NEW.id
    LOOP
      predicted_winner := CASE
        WHEN pred.predicted_home_score > pred.predicted_away_score THEN 'home'
        WHEN pred.predicted_home_score < pred.predicted_away_score THEN 'away'
        ELSE 'draw'
      END;

      UPDATE predictions
      SET points =
        -- 2 puntos por acertar el ganador (o el ganador de la definición por penales)
        (CASE WHEN predicted_winner = actual_winner THEN 2 ELSE 0 END)
        -- +1 punto extra por acertar el resultado exacto del partido
        + (CASE
             WHEN pred.predicted_home_score = NEW.home_score
              AND pred.predicted_away_score = NEW.away_score THEN 1
             ELSE 0
           END),
      updated_at = NOW()
      WHERE id = pred.id;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3) Recalcular puntos de partidos ya finalizados con la nueva fórmula
UPDATE matches
SET updated_at = NOW()
WHERE status = 'finished' AND home_score IS NOT NULL AND away_score IS NOT NULL;
