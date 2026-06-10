-- En la fase eliminatoria, acertar el ganador vale 3 puntos (antes 2) y el
-- bonus por resultado exacto vale 2 puntos (antes 1), para un máximo de 5
-- puntos por partido. La fase de grupos mantiene 2 + 1 = 3 puntos máximo.

CREATE OR REPLACE FUNCTION calculate_prediction_points()
RETURNS TRIGGER AS $$
DECLARE
  pred RECORD;
  actual_winner TEXT;
  predicted_winner TEXT;
  is_group BOOLEAN;
  winner_points INT;
  exact_score_points INT;
BEGIN
  IF NEW.status = 'finished' AND NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL THEN
    is_group := (LOWER(NEW.stage) LIKE '%group%' OR LOWER(NEW.stage) LIKE '%grupo%');

    IF is_group THEN
      winner_points := 2;
      exact_score_points := 1;
    ELSE
      winner_points := 3;
      exact_score_points := 2;
    END IF;

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
        (CASE WHEN predicted_winner = actual_winner THEN winner_points ELSE 0 END)
        + (CASE
             WHEN pred.predicted_home_score = NEW.home_score
              AND pred.predicted_away_score = NEW.away_score THEN exact_score_points
             ELSE 0
           END),
      updated_at = NOW()
      WHERE id = pred.id;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recalcular puntos de partidos ya finalizados con la nueva fórmula
UPDATE matches
SET updated_at = NOW()
WHERE status = 'finished' AND home_score IS NOT NULL AND away_score IS NOT NULL;
