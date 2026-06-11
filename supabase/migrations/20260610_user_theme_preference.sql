-- Guarda la preferencia de tema (claro/oscuro) de cada usuario para que
-- persista entre sesiones y dispositivos.

ALTER TABLE public.login_users
  ADD COLUMN IF NOT EXISTS theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark'));
