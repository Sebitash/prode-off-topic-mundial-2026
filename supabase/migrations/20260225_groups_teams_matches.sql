BEGIN;

-- 1) Groups table (A-L for World Cup style groups)
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE CHECK (char_length(code) <= 8),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 2) Teams table with stable IDs
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  short_name TEXT,
  fifa_code TEXT UNIQUE,
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_teams_group_id ON public.teams(group_id);

-- Seed base groups (edit as needed for final tournament draw)
INSERT INTO public.groups (code, name)
VALUES
  ('A', 'Grupo A'),
  ('B', 'Grupo B'),
  ('C', 'Grupo C'),
  ('D', 'Grupo D'),
  ('E', 'Grupo E'),
  ('F', 'Grupo F'),
  ('G', 'Grupo G'),
  ('H', 'Grupo H'),
  ('I', 'Grupo I'),
  ('J', 'Grupo J'),
  ('K', 'Grupo K'),
  ('L', 'Grupo L')
ON CONFLICT (code) DO NOTHING;

-- Seed initial teams for first 4 groups (A-D)
-- This block is idempotent and can be re-run safely.
INSERT INTO public.teams (name, short_name, fifa_code, group_id)
VALUES
  -- Grupo A
  ('México', 'MEX', 'MEX', (SELECT id FROM public.groups WHERE code = 'A')),
  ('Sudáfrica', 'RSA', 'RSA', (SELECT id FROM public.groups WHERE code = 'A')),
  ('República de Corea', 'KOR', 'KOR', (SELECT id FROM public.groups WHERE code = 'A')),
  ('Por definir (A4)', 'TBD_A', 'TBD_A', (SELECT id FROM public.groups WHERE code = 'A')),

  -- Grupo B
  ('Canadá', 'CAN', 'CAN', (SELECT id FROM public.groups WHERE code = 'B')),
  ('Por definir (B4)', 'TBD_B', 'TBD_B', (SELECT id FROM public.groups WHERE code = 'B')),
  ('Catar', 'QAT', 'QAT', (SELECT id FROM public.groups WHERE code = 'B')),
  ('Suiza', 'SUI', 'SUI', (SELECT id FROM public.groups WHERE code = 'B')),

  -- Grupo C
  ('Brasil', 'BRA', 'BRA', (SELECT id FROM public.groups WHERE code = 'C')),
  ('Marruecos', 'MAR', 'MAR', (SELECT id FROM public.groups WHERE code = 'C')),
  ('Haití', 'HAI', 'HAI', (SELECT id FROM public.groups WHERE code = 'C')),
  ('Escocia', 'SCO', 'SCO', (SELECT id FROM public.groups WHERE code = 'C')),

  -- Grupo D
  ('Estados Unidos', 'USA', 'USA', (SELECT id FROM public.groups WHERE code = 'D')),
  ('Paraguay', 'PAR', 'PAR', (SELECT id FROM public.groups WHERE code = 'D')),
  ('Australia', 'AUS', 'AUS', (SELECT id FROM public.groups WHERE code = 'D')),
  ('Por definir (D4)', 'TBD_D', 'TBD_D', (SELECT id FROM public.groups WHERE code = 'D')),

  -- Grupo E
  ('Alemania', 'GER', 'GER', (SELECT id FROM public.groups WHERE code = 'E')),
  ('Curazao', 'CUW', 'CUW', (SELECT id FROM public.groups WHERE code = 'E')),
  ('Costa de Marfil', 'CIV', 'CIV', (SELECT id FROM public.groups WHERE code = 'E')),
  ('Ecuador', 'ECU', 'ECU', (SELECT id FROM public.groups WHERE code = 'E')),

  -- Grupo F
  ('Países Bajos', 'NED', 'NED', (SELECT id FROM public.groups WHERE code = 'F')),
  ('Japón', 'JPN', 'JPN', (SELECT id FROM public.groups WHERE code = 'F')),
  ('Por definir (F4)', 'TBD_F', 'TBD_F', (SELECT id FROM public.groups WHERE code = 'F')),
  ('Túnez', 'TUN', 'TUN', (SELECT id FROM public.groups WHERE code = 'F')),

  -- Grupo G
  ('Bélgica', 'BEL', 'BEL', (SELECT id FROM public.groups WHERE code = 'G')),
  ('Egipto', 'EGY', 'EGY', (SELECT id FROM public.groups WHERE code = 'G')),
  ('Irán', 'IRN', 'IRN', (SELECT id FROM public.groups WHERE code = 'G')),
  ('Nueva Zelanda', 'NZL', 'NZL', (SELECT id FROM public.groups WHERE code = 'G')),

  -- Grupo H
  ('España', 'ESP', 'ESP', (SELECT id FROM public.groups WHERE code = 'H')),
  ('Cabo Verde', 'CPV', 'CPV', (SELECT id FROM public.groups WHERE code = 'H')),
  ('Arabia Saudí', 'KSA', 'KSA', (SELECT id FROM public.groups WHERE code = 'H')),
  ('Uruguay', 'URU', 'URU', (SELECT id FROM public.groups WHERE code = 'H')),

  -- Grupo I
  ('Francia', 'FRA', 'FRA', (SELECT id FROM public.groups WHERE code = 'I')),
  ('Senegal', 'SEN', 'SEN', (SELECT id FROM public.groups WHERE code = 'I')),
  ('Por definir (I4)', 'TBD_I', 'TBD_I', (SELECT id FROM public.groups WHERE code = 'I')),
  ('Noruega', 'NOR', 'NOR', (SELECT id FROM public.groups WHERE code = 'I')),

  -- Grupo J
  ('Argentina', 'ARG', 'ARG', (SELECT id FROM public.groups WHERE code = 'J')),
  ('Argelia', 'ALG', 'ALG', (SELECT id FROM public.groups WHERE code = 'J')),
  ('Austria', 'AUT', 'AUT', (SELECT id FROM public.groups WHERE code = 'J')),
  ('Jordania', 'JOR', 'JOR', (SELECT id FROM public.groups WHERE code = 'J')),

  -- Grupo K
  ('Portugal', 'POR', 'POR', (SELECT id FROM public.groups WHERE code = 'K')),
  ('Por definir (K4)', 'TBD_K', 'TBD_K', (SELECT id FROM public.groups WHERE code = 'K')),
  ('Uzbekistán', 'UZB', 'UZB', (SELECT id FROM public.groups WHERE code = 'K')),
  ('Colombia', 'COL', 'COL', (SELECT id FROM public.groups WHERE code = 'K')),

  -- Grupo L
  ('Inglaterra', 'ENG', 'ENG', (SELECT id FROM public.groups WHERE code = 'L')),
  ('Croacia', 'CRO', 'CRO', (SELECT id FROM public.groups WHERE code = 'L')),
  ('Ghana', 'GHA', 'GHA', (SELECT id FROM public.groups WHERE code = 'L')),
  ('Panamá', 'PAN', 'PAN', (SELECT id FROM public.groups WHERE code = 'L'))
ON CONFLICT (name) DO UPDATE
SET
  short_name = EXCLUDED.short_name,
  fifa_code = EXCLUDED.fifa_code,
  group_id = EXCLUDED.group_id;

-- 3) Extend matches to reference teams by ID
ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS home_team_id UUID REFERENCES public.teams(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS away_team_id UUID REFERENCES public.teams(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_matches_home_team_id ON public.matches(home_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_away_team_id ON public.matches(away_team_id);

-- Ensure a team cannot play against itself
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'matches_home_away_different'
  ) THEN
    ALTER TABLE public.matches
      ADD CONSTRAINT matches_home_away_different CHECK (home_team_id IS NULL OR away_team_id IS NULL OR home_team_id <> away_team_id);
  END IF;
END $$;

-- 4) Backfill teams from existing text columns in matches
-- If a team does not have assigned group yet, keep group_id as NULL.
INSERT INTO public.teams (name, group_id)
SELECT DISTINCT t.team_name, NULL::UUID
FROM (
  SELECT trim(home_team) AS team_name FROM public.matches WHERE home_team IS NOT NULL AND trim(home_team) <> ''
  UNION
  SELECT trim(away_team) AS team_name FROM public.matches WHERE away_team IS NOT NULL AND trim(away_team) <> ''
) t
ON CONFLICT (name) DO NOTHING;

-- 4.1) Cleanup for existing databases that already used group code 'TBD'
UPDATE public.matches
SET home_team_id = NULL
WHERE home_team_id IN (
  SELECT t.id
  FROM public.teams t
  JOIN public.groups g ON g.id = t.group_id
  WHERE g.code = 'TBD'
);

UPDATE public.matches
SET away_team_id = NULL
WHERE away_team_id IN (
  SELECT t.id
  FROM public.teams t
  JOIN public.groups g ON g.id = t.group_id
  WHERE g.code = 'TBD'
);

DELETE FROM public.teams
WHERE group_id IN (
  SELECT id FROM public.groups WHERE code = 'TBD'
);

DELETE FROM public.groups
WHERE code = 'TBD';

-- 5) Backfill match team IDs using current home_team / away_team text
UPDATE public.matches m
SET home_team_id = t.id
FROM public.teams t
WHERE m.home_team_id IS NULL
  AND m.home_team IS NOT NULL
  AND trim(m.home_team) <> ''
  AND t.name = trim(m.home_team);

UPDATE public.matches m
SET away_team_id = t.id
FROM public.teams t
WHERE m.away_team_id IS NULL
  AND m.away_team IS NOT NULL
  AND trim(m.away_team) <> ''
  AND t.name = trim(m.away_team);

-- 6) Optional strictness: enforce IDs as required once all rows are migrated
-- Uncomment only after validating no NULLs remain.
-- ALTER TABLE public.matches
--   ALTER COLUMN home_team_id SET NOT NULL,
--   ALTER COLUMN away_team_id SET NOT NULL;

-- 7) RLS for new tables
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'groups' AND policyname = 'Groups are viewable by everyone'
  ) THEN
    CREATE POLICY "Groups are viewable by everyone"
      ON public.groups FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'teams' AND policyname = 'Teams are viewable by everyone'
  ) THEN
    CREATE POLICY "Teams are viewable by everyone"
      ON public.teams FOR SELECT
      USING (true);
  END IF;
END $$;

COMMIT;
