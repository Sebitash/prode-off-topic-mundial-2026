-- Dos cambios al sistema de puntos de eliminatorias:
--
-- 1. FIX ASIMETRÍA: Si predijiste empate + equipo A gana penales, y el partido
--    terminó con equipo A ganando en tiempo regular (sin penales), antes se
--    ignoraba tu pick de penales y quedabas como "empate" (0 pts de ganador).
--    Ahora, el penalty_winner se usa siempre que lo hayas elegido, sin importar
--    si el partido real fue o no a penales. Ejemplo: predijiste 2-2 gana Brasil,
--    partido terminó 2-1 Brasil → +3 pts de ganador.
--
-- 2. BONUS PENALES: +1 punto extra si el partido fue a penales Y vos predijiste
--    empate (con pick de ganador de penales), sin importar si acertaste el
--    ganador de penales o el marcador exacto. Ejemplo: predijiste 2-2 gana
--    Marruecos, partido terminó 1-1 gana Marruecos → +3 (ganador) +1 (bonus
--    penales) = 4 pts. Si predijiste 2-2 gana el perdedor → +0 (ganador) +1
--    (bonus penales) = 1 pt.

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
  penalty_prediction_bonus INT;
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
      -- Fix asimetría: el penalty_winner se usa siempre que esté elegido,
      -- sin requerir que el partido real también haya terminado empatado.
      predicted_winner := CASE
        WHEN pred.predicted_home_score > pred.predicted_away_score THEN 'home'
        WHEN pred.predicted_home_score < pred.predicted_away_score THEN 'away'
        WHEN pred.predicted_penalty_winner IS NOT NULL THEN pred.predicted_penalty_winner
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

      -- Bonus penales: +1 si el partido fue a penales Y predijiste empate con pick
      IF NOT is_group
         AND NEW.home_penalties IS NOT NULL AND NEW.away_penalties IS NOT NULL
         AND pred.predicted_home_score = pred.predicted_away_score
         AND pred.predicted_penalty_winner IS NOT NULL THEN
        penalty_prediction_bonus := 1;
      ELSE
        penalty_prediction_bonus := 0;
      END IF;

      UPDATE predictions
      SET points =
        (CASE WHEN predicted_winner = actual_winner THEN winner_points ELSE 0 END)
        + (CASE
             WHEN pred.predicted_home_score = NEW.home_score
              AND pred.predicted_away_score = NEW.away_score THEN exact_score_points
             ELSE 0
           END)
        + partial_score_bonus
        + penalty_prediction_bonus,
      updated_at = NOW()
      WHERE id = pred.id;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recalcular puntos solo de partidos de eliminatorias (los únicos afectados)
UPDATE matches
SET updated_at = NOW()
WHERE status = 'finished'
  AND home_score IS NOT NULL AND away_score IS NOT NULL
  AND LOWER(stage) NOT LIKE '%group%'
  AND LOWER(stage) NOT LIKE '%grupo%';
