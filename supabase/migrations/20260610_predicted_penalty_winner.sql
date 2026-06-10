-- Permite pronosticar el ganador de la definición por penales cuando el
-- usuario predice un empate en un partido de eliminatorias. Si el partido
-- real también termina empatado en los 90' y se define por penales, ese
-- pronóstico cuenta como "ganador" a los efectos del puntaje (2 pts).

-- 1) Columna para el pronóstico del ganador de penales (solo aplica a
--    pronósticos de empate en eliminatorias)
ALTER TABLE predictions
  ADD COLUMN IF NOT EXISTS predicted_penalty_winner TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'predictions_penalty_winner_valid'
  ) THEN
    ALTER TABLE predictions
      ADD CONSTRAINT predictions_penalty_winner_valid CHECK (
        predicted_penalty_winner IS NULL OR predicted_penalty_winner IN ('home', 'away')
      );
  END IF;
END $$;

-- 2) Recalcular puntos: si el pronóstico fue empate y el partido real también
--    termina empatado en los 90' y se define por penales, usar
--    predicted_penalty_winner como "ganador" pronosticado.
CREATE OR REPLACE FUNCTION calculate_prediction_points()
RETURNS TRIGGER AS $$
DECLARE
  pred RECORD;
  actual_winner TEXT;
  predicted_winner TEXT;
BEGIN
  IF NEW.status = 'finished' AND NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL THEN
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
        WHEN NEW.home_score = NEW.away_score AND pred.predicted_penalty_winner IS NOT NULL THEN pred.predicted_penalty_winner
        ELSE 'draw'
      END;

      UPDATE predictions
      SET points =
        (CASE WHEN predicted_winner = actual_winner THEN 2 ELSE 0 END)
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
