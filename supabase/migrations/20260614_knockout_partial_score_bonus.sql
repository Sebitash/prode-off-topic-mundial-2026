-- Nueva regla para fase eliminatoria: además de los puntos por ganador (3) y
-- resultado exacto (+2), se suma +1 punto extra si el pronóstico acierta el
-- marcador final de UNO de los dos equipos (por ejemplo, predijiste 2-1 y el
-- resultado real fue 2-0: acertaste el "2" del local). Este bonus no se suma
-- si ya se acertó el resultado exacto completo (ya cubierto por el bonus de +2).
--
-- De paso, se restablece la diferenciación de puntaje por fase (grupos: 2+1,
-- eliminatorias: 3+2), que había quedado unificada en 2+1 para todas las fases
-- por la migración 20260610_predicted_penalty_winner.sql (aplicada después de
-- 20260610_knockout_points_3_2.sql).

CREATE OR REPLACE FUNCTION calculate_prediction_points()
RETURNS TRIGGER AS $$
DECLARE
  pred RECORD;
  actual_winner TEXT;
  predicted_winner TEXT;
  is_group BOOLEAN;
  winner_points INT;
  exact_score_points INT;
  partial_score_bonus INT;
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

      -- Bonus de eliminatorias: +1 si se acierta el marcador de UNO de los
      -- dos equipos, pero no el resultado exacto completo (ya cubierto arriba)
      IF NOT is_group
         AND NOT (pred.predicted_home_score = NEW.home_score AND pred.predicted_away_score = NEW.away_score)
         AND (pred.predicted_home_score = NEW.home_score OR pred.predicted_away_score = NEW.away_score) THEN
        partial_score_bonus := 1;
      ELSE
        partial_score_bonus := 0;
      END IF;

      UPDATE predictions
      SET points =
        (CASE WHEN predicted_winner = actual_winner THEN winner_points ELSE 0 END)
        + (CASE
             WHEN pred.predicted_home_score = NEW.home_score
              AND pred.predicted_away_score = NEW.away_score THEN exact_score_points
             ELSE 0
           END)
        + partial_score_bonus,
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
