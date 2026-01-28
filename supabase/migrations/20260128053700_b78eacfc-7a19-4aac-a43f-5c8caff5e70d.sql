-- First, drop all existing problematic policies that cause recursion
DROP POLICY IF EXISTS "Admins can view admin roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Admins can insert admin roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Admins can delete admin roles" ON public.admin_roles;

DROP POLICY IF EXISTS "Admins can view all transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Admins can view all budgets" ON public.budgets;
DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Admins can view all sensor data" ON public.sensor_data;
DROP POLICY IF EXISTS "Admins can view all irrigation logs" ON public.irrigation_logs;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can update tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update system settings" ON public.system_settings;

-- Create the security definer function to check admin roles (avoids recursion)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_roles
    WHERE user_id = _user_id
  )
$$;

-- Now recreate admin_roles policies using the security definer function
CREATE POLICY "Users can view their own admin role"
ON public.admin_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all admin roles"
ON public.admin_roles FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert admin roles"
ON public.admin_roles FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete admin roles"
ON public.admin_roles FOR DELETE
USING (public.is_admin(auth.uid()));

-- Recreate admin policies for other tables using the security definer function

-- Financial transactions admin policy
CREATE POLICY "Admins can view all transactions"
ON public.financial_transactions FOR SELECT
USING (public.is_admin(auth.uid()));

-- Budgets admin policy
CREATE POLICY "Admins can view all budgets"
ON public.budgets FOR SELECT
USING (public.is_admin(auth.uid()));

-- Activity logs admin policy  
CREATE POLICY "Admins can view all activity logs"
ON public.activity_logs FOR SELECT
USING (public.is_admin(auth.uid()));

-- Sensor data admin policy
CREATE POLICY "Admins can view all sensor data"
ON public.sensor_data FOR SELECT
USING (public.is_admin(auth.uid()));

-- Irrigation logs admin policy
CREATE POLICY "Admins can view all irrigation logs"
ON public.irrigation_logs FOR SELECT
USING (public.is_admin(auth.uid()));

-- Orders admin policy
CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
USING (public.is_admin(auth.uid()));

-- Support tickets admin policies
CREATE POLICY "Admins can view all tickets"
ON public.support_tickets FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update tickets"
ON public.support_tickets FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Profiles admin policy
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.is_admin(auth.uid()));

-- System settings admin policy
CREATE POLICY "Admins can update system settings"
ON public.system_settings FOR UPDATE
USING (public.is_admin(auth.uid()));