-- Drop the overly permissive "Admins can view all profiles" policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a new admin policy that requires authentication AND admin role
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE admin_roles.user_id = auth.uid()
  )
);

-- Add explicit deny for unauthenticated users (this ensures no anonymous access)
-- The existing "Users can view their own profile" policy already uses auth.uid() = user_id
-- which implicitly requires authentication, but we're making the admin policy explicit too