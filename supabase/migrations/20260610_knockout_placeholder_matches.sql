-- Agrega los 32 partidos "Por definir" de la fase eliminatoria del Mundial 2026:
-- 16 Dieciseisavos de Final, 8 Octavos de Final, 4 Cuartos de Final, 2 Semifinales,
-- 1 partido por el Tercer Puesto y 1 Final.
--
-- Estos partidos se cargan sin equipos asignados (home_team_id / away_team_id en NULL)
-- y se identifican por home_team = away_team = 'Por definir'. El frontend los muestra
-- en Resultados y Predicciones, pero no permite cargar pronósticos hasta que se
-- conozcan los equipos de cada cruce.
--
-- Migración idempotente: cada bloque se inserta solo si todavía no existen partidos
-- "Por definir" para esa instancia.

BEGIN;

-- 1) Dieciseisavos de Final (16 partidos)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.matches WHERE stage = 'Dieciseisavos de Final' AND home_team = 'Por definir'
  ) THEN
    INSERT INTO public.matches (home_team, away_team, match_date, stage, status) VALUES
      ('Por definir', 'Por definir', '2026-06-28 17:00:00+00', 'Dieciseisavos de Final', 'scheduled'),
      ('Por definir', 'Por definir', '2026-06-28 21:00:00+00', 'Dieciseisavos de Final', 'scheduled'),
      ('Por definir', 'Por definir', '2026-06-29 00:00:00+00', 'Dieciseisavos de Final', 'scheduled'),
      ('Por definir', 'Por definir', '2026-06-29 17:00:00+00', 'Dieciseisavos de Final', 'scheduled'),
      ('Por definir', 'Por definir', '2026-06-29 21:00:00+00', 'Dieciseisavos de Final', 'scheduled'),
      ('Por definir', 'Por definir', '2026-06-30 00:00:00+00', 'Dieciseisavos de Final', 'scheduled'),
      ('Por definir', 'Por definir', '2026-06-30 17:00:00+00', 'Dieciseisavos de Final', 'scheduled'),
      ('Por definir', 'Por definir', '2026-06-30 21:00:00+00', 'Dieciseisavos de Final', 'scheduled'),
      ('Por definir', 'Por definir', '2026-07-01 00:00:00+00', 'Dieciseisavos de Final', 'scheduled'),
      ('Por definir', 'Por definir', '2026-07-01 17:00:00+00', 'Dieciseisavos de Final', 'scheduled'),
      ('Por definir', 'Por definir', '2026-07-01 21:00:00+00', 'Dieciseisavos de Final', 'scheduled'),
      ('Por definir', 'Por definir', '2026-07-02 00:00:00+00', 'Dieciseisavos de Final', 'scheduled'),
      ('Por definir', 'Por definir', '2026-07-02 17:00:00+00', 'Dieciseisavos de Final', 'scheduled'),
      ('Por definir', 'Por definir', '2026-07-02 21:00:00+00', 'Dieciseisavos de Final', 'scheduled'),
      ('Por definir', 'Por definir', '2026-07-03 00:00:00+00', 'Dieciseisavos de Final', 'scheduled'),
      ('Por definir', 'Por definir', '2026-07-03 17:00:00+00', 'Dieciseisavos de Final', 'scheduled');
  END IF;
END $$;

-- 2) Octavos de Final (8 partidos)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.matches WHERE stage = 'Octavos de Final' AND home_team = 'Por definir'
  ) THEN
    INSERT INTO public.matches (home_team, away_team, match_date, stage, status) VALUES
      ('Por definir', 'Por definir', '2026-07-04 17:00:00+00', 'Octavos de Final', 'scheduled'),
      ('Por definir', 'Por definir', '2026-07-04 21:00:00+00', 'Octavos de Final', 'scheduled'),
      ('Por definir', 'Por definir', '2026-07-05 17:00:00+00', 'Octavos de Final', 'scheduled'),
      ('Por definir', 'Por definir', '2026-07-05 21:00:00+00', 'Octavos de Final', 'scheduled'),
      ('Por definir', 'Por definir', '2026-07-06 17:00:00+00', 'Octavos de Final', 'scheduled'),
      ('Por definir', 'Por definir', '2026-07-06 21:00:00+00', 'Octavos de Final', 'scheduled'),
      ('Por definir', 'Por definir', '2026-07-07 17:00:00+00', 'Octavos de Final', 'scheduled'),
      ('Por definir', 'Por definir', '2026-07-07 21:00:00+00', 'Octavos de Final', 'scheduled');
  END IF;
END $$;

-- 3) Cuartos de Final (4 partidos)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.matches WHERE stage = 'Cuartos de Final' AND home_team = 'Por definir'
  ) THEN
    INSERT INTO public.matches (home_team, away_team, match_date, stage, status) VALUES
      ('Por definir', 'Por definir', '2026-07-09 21:00:00+00', 'Cuartos de Final', 'scheduled'),
      ('Por definir', 'Por definir', '2026-07-10 17:00:00+00', 'Cuartos de Final', 'scheduled'),
      ('Por definir', 'Por definir', '2026-07-10 21:00:00+00', 'Cuartos de Final', 'scheduled'),
      ('Por definir', 'Por definir', '2026-07-11 21:00:00+00', 'Cuartos de Final', 'scheduled');
  END IF;
END $$;

-- 4) Semifinales (2 partidos)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.matches WHERE stage = 'Semifinales' AND home_team = 'Por definir'
  ) THEN
    INSERT INTO public.matches (home_team, away_team, match_date, stage, status) VALUES
      ('Por definir', 'Por definir', '2026-07-14 21:00:00+00', 'Semifinales', 'scheduled'),
      ('Por definir', 'Por definir', '2026-07-15 21:00:00+00', 'Semifinales', 'scheduled');
  END IF;
END $$;

-- 5) Partido por el Tercer Puesto (1 partido)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.matches WHERE stage = 'Tercer Puesto' AND home_team = 'Por definir'
  ) THEN
    INSERT INTO public.matches (home_team, away_team, match_date, stage, status) VALUES
      ('Por definir', 'Por definir', '2026-07-18 21:00:00+00', 'Tercer Puesto', 'scheduled');
  END IF;
END $$;

-- 6) Final (1 partido)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.matches WHERE stage = 'Final' AND home_team = 'Por definir'
  ) THEN
    INSERT INTO public.matches (home_team, away_team, match_date, stage, status) VALUES
      ('Por definir', 'Por definir', '2026-07-19 19:00:00+00', 'Final', 'scheduled');
  END IF;
END $$;

COMMIT;
