-- Migración: Cargar Grupos y Equipos para el fixture de prueba
-- Asegura que los nombres coincidan EXACTAMENTE con los usados en los Inserciones de matches

-- 1. Crear tablas si no existen (por las dudas)
CREATE TABLE IF NOT EXISTS groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  short_name TEXT,
  fifa_code TEXT,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. Insertar Grupos del A al L (Estructura Mundial 2026)
INSERT INTO groups (code, name) VALUES
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

-- 3. Insertar Equipos de prueba (usando los mismos nombres que en la migración de matches)
-- Los asignamos a grupos para que la lógica de Standings del frontend los agrupe
INSERT INTO teams (name, short_name, fifa_code, group_id) VALUES
  ('Mexico', 'MEX', 'MEX', (SELECT id FROM groups WHERE code = 'A')),
  ('Canada', 'CAN', 'CAN', (SELECT id FROM groups WHERE code = 'A')),
  ('USA', 'USA', 'USA', (SELECT id FROM groups WHERE code = 'B')),
  ('Wales', 'WAL', 'WAL', (SELECT id FROM groups WHERE code = 'B')),
  ('Argentina', 'ARG', 'ARG', (SELECT id FROM groups WHERE code = 'C')),
  ('Morocco', 'MAR', 'MAR', (SELECT id FROM groups WHERE code = 'C')),
  ('Brazil', 'BRA', 'BRA', (SELECT id FROM groups WHERE code = 'D')),
  ('Japan', 'JPN', 'JPN', (SELECT id FROM groups WHERE code = 'D')),
  ('Germany', 'GER', 'GER', (SELECT id FROM groups WHERE code = 'E')),
  ('Australia', 'AUS', 'AUS', (SELECT id FROM groups WHERE code = 'E')),
  ('Spain', 'ESP', 'ESP', (SELECT id FROM groups WHERE code = 'F')),
  ('Croatia', 'CRO', 'CRO', (SELECT id FROM groups WHERE code = 'F')),
  ('France', 'FRA', 'FRA', (SELECT id FROM groups WHERE code = 'G')),
  ('Denmark', 'DEN', 'DEN', (SELECT id FROM groups WHERE code = 'G')),
  ('England', 'ENG', 'ENG', (SELECT id FROM groups WHERE code = 'H')),
  ('Iran', 'IRN', 'IRN', (SELECT id FROM groups WHERE code = 'H')),
  ('Portugal', 'POR', 'POR', (SELECT id FROM groups WHERE code = 'I')),
  ('Ghana', 'GHA', 'GHA', (SELECT id FROM groups WHERE code = 'I')),
  ('Netherlands', 'NED', 'NED', (SELECT id FROM groups WHERE code = 'J')),
  ('Senegal', 'SEN', 'SEN', (SELECT id FROM groups WHERE code = 'J'))
ON CONFLICT (name) DO NOTHING;
