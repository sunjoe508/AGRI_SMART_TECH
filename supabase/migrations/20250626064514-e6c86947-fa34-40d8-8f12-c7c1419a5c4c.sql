
-- Create the registered_sensors table to store sensor registration information
CREATE TABLE public.registered_sensors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  sensor_type TEXT NOT NULL CHECK (sensor_type IN ('moisture', 'temperature', 'ph', 'humidity')),
  location_zone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline')),
  last_ping TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own sensors
ALTER TABLE public.registered_sensors ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own sensors
CREATE POLICY "Users can view their own sensors" 
  ON public.registered_sensors 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own sensors
CREATE POLICY "Users can create their own sensors" 
  ON public.registered_sensors 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own sensors
CREATE POLICY "Users can update their own sensors" 
  ON public.registered_sensors 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own sensors
CREATE POLICY "Users can delete their own sensors" 
  ON public.registered_sensors 
  FOR DELETE 
  USING (auth.uid() = user_id);
