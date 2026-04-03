-- Create login_users table for custom authentication
CREATE TABLE IF NOT EXISTS public.login_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  google_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.login_users ENABLE ROW LEVEL SECURITY;

-- Basic policy: users can only see/edit their own data (though this will be handled by the backend)
CREATE POLICY "Users can view own data" ON public.login_users
  FOR SELECT USING (false); -- Only accessible via service role/backend

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_login_users_updated_at ON public.login_users;
CREATE TRIGGER update_login_users_updated_at
  BEFORE UPDATE ON public.login_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
