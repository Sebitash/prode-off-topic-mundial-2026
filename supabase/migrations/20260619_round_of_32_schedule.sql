-- Actualiza los 16 partidos de Dieciseisavos de Final ("Round of 32") con el
-- fixture real (fechas/horas confirmadas, convertidas de ART a UTC sumando 3h)
-- y marca como local a los equipos ya confirmados: México (Tue 30/06 22:00 ART
-- = 01:00 UTC del 01/07), Alemania (Mon 29/06 17:30 ART = 20:30 UTC) y Estados
-- Unidos (Wed 01/07 17:00 ART = 20:00 UTC). El resto de los equipos sigue "Por
-- definir" hasta que se conozcan, según se vayan jugando los últimos partidos
-- de grupos / terceros.
--
-- Los partidos se identifican por orden cronológico (ROW_NUMBER sobre
-- match_date) ya que se insertaron en ese mismo orden en
-- 20260610_knockout_placeholder_matches.sql y todavía no tienen predicciones
-- cargadas (el frontend no permite predecir partidos "Por definir").

BEGIN;

WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY match_date ASC) AS rn
  FROM matches
  WHERE stage = 'Dieciseisavos de Final'
),
new_data AS (
  SELECT * FROM (VALUES
    (1, '2026-06-28 19:00:00+00'::timestamptz, NULL::text),
    (2, '2026-06-29 17:00:00+00'::timestamptz, NULL::text),
    (3, '2026-06-29 20:30:00+00'::timestamptz, 'Alemania'),
    (4, '2026-06-30 01:00:00+00'::timestamptz, NULL::text),
    (5, '2026-06-30 17:00:00+00'::timestamptz, NULL::text),
    (6, '2026-06-30 21:00:00+00'::timestamptz, NULL::text),
    (7, '2026-07-01 01:00:00+00'::timestamptz, 'México'),
    (8, '2026-07-01 16:00:00+00'::timestamptz, NULL::text),
    (9, '2026-07-01 20:00:00+00'::timestamptz, NULL::text),
    (10, '2026-07-02 00:00:00+00'::timestamptz, 'Estados Unidos'),
    (11, '2026-07-02 19:00:00+00'::timestamptz, NULL::text),
    (12, '2026-07-02 23:00:00+00'::timestamptz, NULL::text),
    (13, '2026-07-03 03:00:00+00'::timestamptz, NULL::text),
    (14, '2026-07-03 18:00:00+00'::timestamptz, NULL::text),
    (15, '2026-07-03 22:00:00+00'::timestamptz, NULL::text),
    (16, '2026-07-04 01:30:00+00'::timestamptz, NULL::text)
  ) AS t(rn, new_date, home_team_name)
)
UPDATE matches m
SET match_date = nd.new_date,
    home_team = COALESCE(nd.home_team_name, m.home_team),
    home_team_id = COALESCE((SELECT id FROM teams WHERE name = nd.home_team_name), m.home_team_id),
    updated_at = NOW()
FROM ordered o
JOIN new_data nd ON nd.rn = o.rn
WHERE m.id = o.id;

COMMIT;
