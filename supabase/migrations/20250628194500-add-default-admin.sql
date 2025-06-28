
-- Insert the default admin user manually
-- This will create the admin user in the auth.users table
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'joemunga329@gmail.com',
  crypt('joe123', gen_salt('bf')),
  NOW(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Joe Munga", "phone_number": "+254700000000", "county": "Admin", "farm_name": "AgriSmart Administration"}',
  FALSE,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  FALSE,
  NULL
) ON CONFLICT (email) DO NOTHING;

-- Get the user ID for the admin user
WITH admin_user AS (
  SELECT id FROM auth.users WHERE email = 'joemunga329@gmail.com' LIMIT 1
)
-- Insert into profiles table
INSERT INTO public.profiles (id, full_name, phone_number, county, farm_name, created_at, updated_at)
SELECT 
  admin_user.id,
  'Joe Munga',
  '+254700000000',
  'Admin',
  'AgriSmart Administration',
  NOW(),
  NOW()
FROM admin_user
ON CONFLICT (id) DO NOTHING;

-- Insert admin role
WITH admin_user AS (
  SELECT id FROM auth.users WHERE email = 'joemunga329@gmail.com' LIMIT 1
)
INSERT INTO public.admin_roles (user_id, role, created_at)
SELECT 
  admin_user.id,
  'admin',
  NOW()
FROM admin_user
ON CONFLICT (user_id, role) DO NOTHING;
