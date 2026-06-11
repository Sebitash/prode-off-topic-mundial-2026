-- Guarda la fecha de nacimiento de cada usuario (requerido para validar
-- que sea mayor de 18 años al registrarse).

ALTER TABLE public.login_users
  ADD COLUMN IF NOT EXISTS birth_date DATE;
