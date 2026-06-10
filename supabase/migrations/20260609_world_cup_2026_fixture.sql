-- Fixture completo del Mundial 2026: 48 equipos reales en 12 grupos (A-L)
-- y los 72 partidos de la Fase de Grupos con fecha/hora real (UTC).
-- Migración idempotente: se puede volver a correr sin duplicar datos.

BEGIN;

-- 1) Columna flag_emoji en teams (si no existe)
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS flag_emoji TEXT;

-- 2) Upsert de los 48 equipos reales en sus 12 grupos
INSERT INTO public.teams (name, short_name, fifa_code, group_id, flag_emoji)
VALUES
  -- Grupo A
  ('México', 'MEX', 'MEX', (SELECT id FROM public.groups WHERE code = 'A'), '🇲🇽'),
  ('Sudáfrica', 'RSA', 'RSA', (SELECT id FROM public.groups WHERE code = 'A'), '🇿🇦'),
  ('República de Corea', 'KOR', 'KOR', (SELECT id FROM public.groups WHERE code = 'A'), '🇰🇷'),
  ('República Checa', 'CZE', 'CZE', (SELECT id FROM public.groups WHERE code = 'A'), '🇨🇿'),

  -- Grupo B
  ('Canadá', 'CAN', 'CAN', (SELECT id FROM public.groups WHERE code = 'B'), '🇨🇦'),
  ('Bosnia y Herzegovina', 'BIH', 'BIH', (SELECT id FROM public.groups WHERE code = 'B'), '🇧🇦'),
  ('Catar', 'QAT', 'QAT', (SELECT id FROM public.groups WHERE code = 'B'), '🇶🇦'),
  ('Suiza', 'SUI', 'SUI', (SELECT id FROM public.groups WHERE code = 'B'), '🇨🇭'),

  -- Grupo C
  ('Brasil', 'BRA', 'BRA', (SELECT id FROM public.groups WHERE code = 'C'), '🇧🇷'),
  ('Marruecos', 'MAR', 'MAR', (SELECT id FROM public.groups WHERE code = 'C'), '🇲🇦'),
  ('Haití', 'HAI', 'HAI', (SELECT id FROM public.groups WHERE code = 'C'), '🇭🇹'),
  ('Escocia', 'SCO', 'SCO', (SELECT id FROM public.groups WHERE code = 'C'), '🏴'),

  -- Grupo D
  ('Estados Unidos', 'USA', 'USA', (SELECT id FROM public.groups WHERE code = 'D'), '🇺🇸'),
  ('Paraguay', 'PAR', 'PAR', (SELECT id FROM public.groups WHERE code = 'D'), '🇵🇾'),
  ('Australia', 'AUS', 'AUS', (SELECT id FROM public.groups WHERE code = 'D'), '🇦🇺'),
  ('Turquía', 'TUR', 'TUR', (SELECT id FROM public.groups WHERE code = 'D'), '🇹🇷'),

  -- Grupo E
  ('Alemania', 'GER', 'GER', (SELECT id FROM public.groups WHERE code = 'E'), '🇩🇪'),
  ('Curazao', 'CUW', 'CUW', (SELECT id FROM public.groups WHERE code = 'E'), '🇨🇼'),
  ('Costa de Marfil', 'CIV', 'CIV', (SELECT id FROM public.groups WHERE code = 'E'), '🇨🇮'),
  ('Ecuador', 'ECU', 'ECU', (SELECT id FROM public.groups WHERE code = 'E'), '🇪🇨'),

  -- Grupo F
  ('Países Bajos', 'NED', 'NED', (SELECT id FROM public.groups WHERE code = 'F'), '🇳🇱'),
  ('Japón', 'JPN', 'JPN', (SELECT id FROM public.groups WHERE code = 'F'), '🇯🇵'),
  ('Suecia', 'SWE', 'SWE', (SELECT id FROM public.groups WHERE code = 'F'), '🇸🇪'),
  ('Túnez', 'TUN', 'TUN', (SELECT id FROM public.groups WHERE code = 'F'), '🇹🇳'),

  -- Grupo G
  ('Bélgica', 'BEL', 'BEL', (SELECT id FROM public.groups WHERE code = 'G'), '🇧🇪'),
  ('Egipto', 'EGY', 'EGY', (SELECT id FROM public.groups WHERE code = 'G'), '🇪🇬'),
  ('Irán', 'IRN', 'IRN', (SELECT id FROM public.groups WHERE code = 'G'), '🇮🇷'),
  ('Nueva Zelanda', 'NZL', 'NZL', (SELECT id FROM public.groups WHERE code = 'G'), '🇳🇿'),

  -- Grupo H
  ('España', 'ESP', 'ESP', (SELECT id FROM public.groups WHERE code = 'H'), '🇪🇸'),
  ('Cabo Verde', 'CPV', 'CPV', (SELECT id FROM public.groups WHERE code = 'H'), '🇨🇻'),
  ('Arabia Saudí', 'KSA', 'KSA', (SELECT id FROM public.groups WHERE code = 'H'), '🇸🇦'),
  ('Uruguay', 'URY', 'URY', (SELECT id FROM public.groups WHERE code = 'H'), '🇺🇾'),

  -- Grupo I
  ('Francia', 'FRA', 'FRA', (SELECT id FROM public.groups WHERE code = 'I'), '🇫🇷'),
  ('Senegal', 'SEN', 'SEN', (SELECT id FROM public.groups WHERE code = 'I'), '🇸🇳'),
  ('Irak', 'IRQ', 'IRQ', (SELECT id FROM public.groups WHERE code = 'I'), '🇮🇶'),
  ('Noruega', 'NOR', 'NOR', (SELECT id FROM public.groups WHERE code = 'I'), '🇳🇴'),

  -- Grupo J
  ('Argentina', 'ARG', 'ARG', (SELECT id FROM public.groups WHERE code = 'J'), '🇦🇷'),
  ('Argelia', 'ALG', 'ALG', (SELECT id FROM public.groups WHERE code = 'J'), '🇩🇿'),
  ('Austria', 'AUT', 'AUT', (SELECT id FROM public.groups WHERE code = 'J'), '🇦🇹'),
  ('Jordania', 'JOR', 'JOR', (SELECT id FROM public.groups WHERE code = 'J'), '🇯🇴'),

  -- Grupo K
  ('Portugal', 'POR', 'POR', (SELECT id FROM public.groups WHERE code = 'K'), '🇵🇹'),
  ('RD del Congo', 'COD', 'COD', (SELECT id FROM public.groups WHERE code = 'K'), '🇨🇩'),
  ('Uzbekistán', 'UZB', 'UZB', (SELECT id FROM public.groups WHERE code = 'K'), '🇺🇿'),
  ('Colombia', 'COL', 'COL', (SELECT id FROM public.groups WHERE code = 'K'), '🇨🇴'),

  -- Grupo L
  ('Inglaterra', 'ENG', 'ENG', (SELECT id FROM public.groups WHERE code = 'L'), '🏴'),
  ('Croacia', 'CRO', 'CRO', (SELECT id FROM public.groups WHERE code = 'L'), '🇭🇷'),
  ('Ghana', 'GHA', 'GHA', (SELECT id FROM public.groups WHERE code = 'L'), '🇬🇭'),
  ('Panamá', 'PAN', 'PAN', (SELECT id FROM public.groups WHERE code = 'L'), '🇵🇦')
ON CONFLICT (name) DO UPDATE
SET
  short_name = EXCLUDED.short_name,
  fifa_code = EXCLUDED.fifa_code,
  group_id = EXCLUDED.group_id,
  flag_emoji = EXCLUDED.flag_emoji;

-- 3) Limpieza de los 10 partidos ficticios de prueba (Mexico-Canada, USA-Wales, etc.)
DELETE FROM public.matches
WHERE stage = 'Group Stage'
  AND (home_team, away_team) IN (
    ('Mexico', 'Canada'),
    ('USA', 'Wales'),
    ('Argentina', 'Morocco'),
    ('Brazil', 'Japan'),
    ('Germany', 'Australia'),
    ('Spain', 'Croatia'),
    ('France', 'Denmark'),
    ('England', 'Iran'),
    ('Portugal', 'Ghana'),
    ('Netherlands', 'Senegal')
  );

-- 4) Limpieza de equipos huérfanos (nombres ficticios en inglés y placeholders "Por definir")
DELETE FROM public.teams
WHERE name IN (
  'Mexico', 'Canada', 'USA', 'Wales', 'Morocco', 'Brazil', 'Japan', 'Germany',
  'Spain', 'Croatia', 'France', 'Denmark', 'England', 'Iran', 'Netherlands'
) OR name LIKE 'Por definir (%';

-- 5) Constraint de idempotencia para los partidos del fixture
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'matches_unique_fixture'
  ) THEN
    ALTER TABLE public.matches
      ADD CONSTRAINT matches_unique_fixture UNIQUE (home_team_id, away_team_id, stage);
  END IF;
END $$;

-- 6) Insertar los 72 partidos de la Fase de Grupos (fechas en UTC)
INSERT INTO public.matches (home_team, away_team, home_team_id, away_team_id, match_date, stage, status)
SELECT v.home_team, v.away_team, ht.id, at.id, v.match_date::timestamptz, 'Group Stage', 'scheduled'
FROM (VALUES
  ('México', 'Sudáfrica', '2026-06-11 19:00:00+00'),
  ('República de Corea', 'República Checa', '2026-06-12 02:00:00+00'),
  ('Canadá', 'Bosnia y Herzegovina', '2026-06-12 19:00:00+00'),
  ('Estados Unidos', 'Paraguay', '2026-06-13 01:00:00+00'),
  ('Catar', 'Suiza', '2026-06-13 19:00:00+00'),
  ('Brasil', 'Marruecos', '2026-06-13 22:00:00+00'),
  ('Haití', 'Escocia', '2026-06-14 01:00:00+00'),
  ('Australia', 'Turquía', '2026-06-14 04:00:00+00'),
  ('Alemania', 'Curazao', '2026-06-14 17:00:00+00'),
  ('Países Bajos', 'Japón', '2026-06-14 20:00:00+00'),
  ('Costa de Marfil', 'Ecuador', '2026-06-14 23:00:00+00'),
  ('Suecia', 'Túnez', '2026-06-15 02:00:00+00'),
  ('España', 'Cabo Verde', '2026-06-15 16:00:00+00'),
  ('Bélgica', 'Egipto', '2026-06-15 19:00:00+00'),
  ('Arabia Saudí', 'Uruguay', '2026-06-15 22:00:00+00'),
  ('Irán', 'Nueva Zelanda', '2026-06-16 01:00:00+00'),
  ('Francia', 'Senegal', '2026-06-16 19:00:00+00'),
  ('Irak', 'Noruega', '2026-06-16 22:00:00+00'),
  ('Argentina', 'Argelia', '2026-06-17 01:00:00+00'),
  ('Austria', 'Jordania', '2026-06-17 04:00:00+00'),
  ('Portugal', 'RD del Congo', '2026-06-17 17:00:00+00'),
  ('Inglaterra', 'Croacia', '2026-06-17 20:00:00+00'),
  ('Ghana', 'Panamá', '2026-06-17 23:00:00+00'),
  ('Uzbekistán', 'Colombia', '2026-06-18 02:00:00+00'),
  ('República Checa', 'Sudáfrica', '2026-06-18 16:00:00+00'),
  ('Suiza', 'Bosnia y Herzegovina', '2026-06-18 19:00:00+00'),
  ('Canadá', 'Catar', '2026-06-18 22:00:00+00'),
  ('México', 'República de Corea', '2026-06-19 01:00:00+00'),
  ('Estados Unidos', 'Australia', '2026-06-19 19:00:00+00'),
  ('Escocia', 'Marruecos', '2026-06-19 22:00:00+00'),
  ('Brasil', 'Haití', '2026-06-20 01:00:00+00'),
  ('Turquía', 'Paraguay', '2026-06-20 04:00:00+00'),
  ('Países Bajos', 'Suecia', '2026-06-20 17:00:00+00'),
  ('Alemania', 'Costa de Marfil', '2026-06-20 20:00:00+00'),
  ('Ecuador', 'Curazao', '2026-06-21 00:00:00+00'),
  ('Túnez', 'Japón', '2026-06-21 04:00:00+00'),
  ('España', 'Arabia Saudí', '2026-06-21 16:00:00+00'),
  ('Bélgica', 'Irán', '2026-06-21 19:00:00+00'),
  ('Uruguay', 'Cabo Verde', '2026-06-21 22:00:00+00'),
  ('Nueva Zelanda', 'Egipto', '2026-06-22 01:00:00+00'),
  ('Argentina', 'Austria', '2026-06-22 17:00:00+00'),
  ('Francia', 'Irak', '2026-06-22 21:00:00+00'),
  ('Noruega', 'Senegal', '2026-06-23 00:00:00+00'),
  ('Jordania', 'Argelia', '2026-06-23 03:00:00+00'),
  ('Portugal', 'Uzbekistán', '2026-06-23 17:00:00+00'),
  ('Inglaterra', 'Ghana', '2026-06-23 20:00:00+00'),
  ('Panamá', 'Croacia', '2026-06-23 23:00:00+00'),
  ('Suiza', 'Canadá', '2026-06-24 19:00:00+00'),
  ('Bosnia y Herzegovina', 'Catar', '2026-06-24 19:00:00+00'),
  ('Escocia', 'Brasil', '2026-06-24 22:00:00+00'),
  ('Marruecos', 'Haití', '2026-06-24 22:00:00+00'),
  ('Colombia', 'RD del Congo', '2026-06-24 02:00:00+00'),
  ('República Checa', 'México', '2026-06-25 01:00:00+00'),
  ('Sudáfrica', 'República de Corea', '2026-06-25 01:00:00+00'),
  ('Curazao', 'Costa de Marfil', '2026-06-25 20:00:00+00'),
  ('Ecuador', 'Alemania', '2026-06-25 20:00:00+00'),
  ('Japón', 'Suecia', '2026-06-25 23:00:00+00'),
  ('Túnez', 'Países Bajos', '2026-06-25 23:00:00+00'),
  ('Turquía', 'Estados Unidos', '2026-06-26 02:00:00+00'),
  ('Paraguay', 'Australia', '2026-06-26 02:00:00+00'),
  ('Noruega', 'Francia', '2026-06-26 19:00:00+00'),
  ('Senegal', 'Irak', '2026-06-26 19:00:00+00'),
  ('Cabo Verde', 'Arabia Saudí', '2026-06-27 00:00:00+00'),
  ('Uruguay', 'España', '2026-06-27 00:00:00+00'),
  ('Egipto', 'Irán', '2026-06-27 03:00:00+00'),
  ('Nueva Zelanda', 'Bélgica', '2026-06-27 03:00:00+00'),
  ('Panamá', 'Inglaterra', '2026-06-27 21:00:00+00'),
  ('Croacia', 'Ghana', '2026-06-27 21:00:00+00'),
  ('Colombia', 'Portugal', '2026-06-27 23:30:00+00'),
  ('RD del Congo', 'Uzbekistán', '2026-06-27 23:30:00+00'),
  ('Argelia', 'Austria', '2026-06-28 02:00:00+00'),
  ('Jordania', 'Argentina', '2026-06-28 02:00:00+00')
) AS v(home_team, away_team, match_date)
JOIN public.teams ht ON ht.name = v.home_team
JOIN public.teams at ON at.name = v.away_team
ON CONFLICT (home_team_id, away_team_id, stage)
DO UPDATE SET match_date = EXCLUDED.match_date;

-- 7) Vista teams_simple: standings dinámicos por grupo a partir de matches finalizados
CREATE OR REPLACE VIEW public.teams_simple AS
SELECT
  t.id,
  t.name,
  t.fifa_code AS code,
  t.flag_emoji,
  g.code AS group_letter,
  COALESCE(stats.played, 0) AS played,
  COALESCE(stats.won, 0) AS won,
  COALESCE(stats.drawn, 0) AS drawn,
  COALESCE(stats.lost, 0) AS lost,
  COALESCE(stats.goals_for, 0) AS goals_for,
  COALESCE(stats.goals_against, 0) AS goals_against,
  COALESCE(stats.points, 0) AS points
FROM public.teams t
JOIN public.groups g ON g.id = t.group_id
LEFT JOIN LATERAL (
  SELECT
    COUNT(*)::int AS played,
    SUM(CASE WHEN gf > ga THEN 1 ELSE 0 END)::int AS won,
    SUM(CASE WHEN gf = ga THEN 1 ELSE 0 END)::int AS drawn,
    SUM(CASE WHEN gf < ga THEN 1 ELSE 0 END)::int AS lost,
    SUM(gf)::int AS goals_for,
    SUM(ga)::int AS goals_against,
    SUM(CASE WHEN gf > ga THEN 3 WHEN gf = ga THEN 1 ELSE 0 END)::int AS points
  FROM (
    SELECT m.home_score AS gf, m.away_score AS ga
    FROM public.matches m
    WHERE m.home_team_id = t.id AND m.status = 'finished' AND m.stage = 'Group Stage'
    UNION ALL
    SELECT m.away_score AS gf, m.home_score AS ga
    FROM public.matches m
    WHERE m.away_team_id = t.id AND m.status = 'finished' AND m.stage = 'Group Stage'
  ) results
) stats ON true;

COMMIT;
