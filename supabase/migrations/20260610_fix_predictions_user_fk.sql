-- La tabla predictions quedó con una FK vieja apuntando a "profiles" (tabla que
-- esta app no usa). Los usuarios reales viven en login_users, lo que rompe
-- cada INSERT/UPDATE de predicciones con:
--   "Key (user_id)=(...) is not present in table "profiles"."
-- Recreamos la constraint apuntando a login_users.

ALTER TABLE predictions DROP CONSTRAINT IF EXISTS predictions_user_id_fkey;

ALTER TABLE predictions
  ADD CONSTRAINT predictions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES login_users(id) ON DELETE CASCADE;
