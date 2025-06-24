
-- Create admin roles table
CREATE TABLE public.admin_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create vendors table for fertilizers and seeds
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_phone TEXT,
  contact_email TEXT,
  location TEXT,
  specialization TEXT[], -- fertilizers, seeds, equipment
  rating DECIMAL(2,1) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vendor products table
CREATE TABLE public.vendor_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL, -- fertilizer, seeds, equipment
  price DECIMAL(10,2),
  unit TEXT, -- kg, liters, pieces
  description TEXT,
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table for farmer purchases
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  vendor_id UUID REFERENCES public.vendors NOT NULL,
  product_id UUID REFERENCES public.vendor_products NOT NULL,
  quantity INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
  delivery_address TEXT,
  order_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily reports table
CREATE TABLE public.daily_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  report_date DATE NOT NULL,
  irrigation_summary JSONB,
  weather_summary JSONB,
  sensor_summary JSONB,
  recommendations TEXT[],
  crop_suggestions TEXT[],
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, report_date)
);

-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable RLS on new tables
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin roles
CREATE POLICY "Users can view their own role" ON public.admin_roles
  FOR SELECT USING (auth.uid() = user_id);

-- RLS policies for vendors (public read)
CREATE POLICY "Anyone can view vendors" ON public.vendors
  FOR SELECT TO public USING (true);

-- RLS policies for vendor products (public read)
CREATE POLICY "Anyone can view vendor products" ON public.vendor_products
  FOR SELECT TO public USING (true);

-- RLS policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for daily reports
CREATE POLICY "Users can view their own reports" ON public.daily_reports
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reports" ON public.daily_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert sample vendors
INSERT INTO public.vendors (name, contact_phone, contact_email, location, specialization, rating) VALUES
('Kenya Seeds Company', '+254700123456', 'sales@kenyaseeds.co.ke', 'Nairobi', ARRAY['seeds'], 4.5),
('Yara Kenya', '+254711234567', 'info@yara.co.ke', 'Nakuru', ARRAY['fertilizers'], 4.8),
('Equator Seeds', '+254722345678', 'orders@equatorseeds.com', 'Eldoret', ARRAY['seeds'], 4.2),
('MEA Fertilizers', '+254733456789', 'sales@mea.co.ke', 'Mombasa', ARRAY['fertilizers'], 4.6),
('Agri-Tech Supplies', '+254744567890', 'info@agritech.co.ke', 'Kisumu', ARRAY['fertilizers', 'seeds', 'equipment'], 4.3);

-- Insert sample products for Kenya Seeds Company
INSERT INTO public.vendor_products (vendor_id, product_name, category, price, unit, description, stock_quantity) 
VALUES 
((SELECT id FROM public.vendors WHERE name = 'Kenya Seeds Company'), 'Hybrid Maize Seeds H614', 'seeds', 850.00, 'kg', 'High yielding drought resistant maize variety', 500),
((SELECT id FROM public.vendors WHERE name = 'Kenya Seeds Company'), 'Bean Seeds KAT B1', 'seeds', 450.00, 'kg', 'Early maturing bean variety suitable for Kenya', 300),
((SELECT id FROM public.vendors WHERE name = 'Yara Kenya'), 'NPK 17:17:17', 'fertilizer', 3200.00, '50kg bag', 'Balanced fertilizer for general crop production', 200),
((SELECT id FROM public.vendors WHERE name = 'Yara Kenya'), 'Urea 46%N', 'fertilizer', 2800.00, '50kg bag', 'Nitrogen fertilizer for leaf growth', 150),
((SELECT id FROM public.vendors WHERE name = 'MEA Fertilizers'), 'DAP 18:46:0', 'fertilizer', 3500.00, '50kg bag', 'Phosphorus rich fertilizer for root development', 180);

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE admin_roles.user_id = $1 AND role = 'admin'
  );
$$;

-- Add admin access policies
CREATE POLICY "Admins can view all data" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all irrigation logs" ON public.irrigation_logs
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all sensor data" ON public.sensor_data
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (public.is_admin(auth.uid()));
