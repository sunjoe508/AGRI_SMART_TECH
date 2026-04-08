
CREATE TABLE public.registered_sensors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  ip_address text,
  sensor_type text NOT NULL DEFAULT 'soil',
  location_zone text,
  status text DEFAULT 'offline',
  last_ping timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.registered_sensors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sensors" ON public.registered_sensors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sensors" ON public.registered_sensors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sensors" ON public.registered_sensors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sensors" ON public.registered_sensors FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all sensors" ON public.registered_sensors FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete all sensors" ON public.registered_sensors FOR DELETE USING (public.is_admin(auth.uid()));
