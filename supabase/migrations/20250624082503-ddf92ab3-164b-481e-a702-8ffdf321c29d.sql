
-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  phone_number TEXT,
  county TEXT,
  sub_county TEXT,
  ward TEXT,
  farm_name TEXT,
  farm_size_acres DECIMAL,
  crop_types TEXT[],
  profile_picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create Kenyan locations table
CREATE TABLE public.kenyan_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  county TEXT NOT NULL,
  sub_county TEXT NOT NULL,
  ward TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create irrigation logs table for real data
CREATE TABLE public.irrigation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  zone TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  water_amount_liters DECIMAL NOT NULL,
  soil_moisture_before DECIMAL,
  soil_moisture_after DECIMAL,
  temperature DECIMAL,
  humidity DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sensor data table
CREATE TABLE public.sensor_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  sensor_type TEXT NOT NULL,
  value DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  location_zone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create OTP messages table
CREATE TABLE public.otp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  phone_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  message_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create customer support table
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert sample Kenyan locations
INSERT INTO public.kenyan_locations (county, sub_county, ward, latitude, longitude) VALUES
('Nairobi', 'Westlands', 'Kitisuru', -1.2521, 36.8055),
('Kiambu', 'Kikuyu', 'Kinoo', -1.2167, 36.7167),
('Nakuru', 'Nakuru East', 'Biashara', -0.3031, 36.0800),
('Meru', 'Imenti North', 'Municipality', 0.0474, 37.6496),
('Kisumu', 'Kisumu East', 'Railways', -0.0917, 34.7680),
('Mombasa', 'Mvita', 'Mji wa Kale/Makadara', -4.0435, 39.6682),
('Eldoret', 'Kapseret', 'Simat/Kapseret', 0.5143, 35.2697),
('Thika', 'Thika Town', 'Township', -1.0332, 37.0690),
('Nyeri', 'Nyeri Central', 'Rware', -0.4169, 36.9483),
('Machakos', 'Machakos Town', 'Machakos Central', -1.5177, 37.2634);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for irrigation logs
CREATE POLICY "Users can view their own irrigation logs" ON public.irrigation_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own irrigation logs" ON public.irrigation_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for sensor data
CREATE POLICY "Users can view their own sensor data" ON public.sensor_data
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sensor data" ON public.sensor_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for OTP messages
CREATE POLICY "Users can view their own OTP messages" ON public.otp_messages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own OTP messages" ON public.otp_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for support tickets
CREATE POLICY "Users can view their own support tickets" ON public.support_tickets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own support tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own support tickets" ON public.support_tickets
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow public read access to Kenyan locations
ALTER TABLE public.kenyan_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view Kenyan locations" ON public.kenyan_locations
  FOR SELECT TO public USING (true);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone_number)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone_number'
  );
  RETURN new;
END;
$$;

-- Create trigger for new user profile creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
