
-- First, let's create the admin user in auth.users (this simulates what would happen during signup)
-- Note: In production, this would be done through the Supabase dashboard or auth API
-- For now, we'll update our existing auth system to handle the admin case

-- Update the handle_new_user function to handle admin creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, full_name, phone_number, county, farm_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', 'User'),
    COALESCE(new.raw_user_meta_data ->> 'phone_number', ''),
    COALESCE(new.raw_user_meta_data ->> 'county', ''),
    COALESCE(new.raw_user_meta_data ->> 'farm_name', '')
  );
  
  -- Check if this is the admin email and assign admin role
  IF new.email = 'admin@agrismart.co.ke' THEN
    INSERT INTO public.admin_roles (user_id, role)
    VALUES (new.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN new;
END;
$$;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies to allow users to see their own data
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Allow public read access to vendors and products for marketplace
CREATE POLICY "Public can view vendors" ON public.vendors
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Public can view vendor products" ON public.vendor_products
  FOR SELECT TO authenticated
  USING (true);

-- Allow users to place orders
CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
