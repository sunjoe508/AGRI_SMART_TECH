-- Create system_settings table for real-time broadcast
CREATE TABLE public.system_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  maintenance_message TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID
);

-- Insert default global settings
INSERT INTO public.system_settings (id, maintenance_mode, maintenance_message)
VALUES ('global', false, 'System is undergoing scheduled maintenance');

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read settings (needed for maintenance mode check)
CREATE POLICY "Anyone can read system settings"
ON public.system_settings
FOR SELECT
USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update system settings"
ON public.system_settings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = auth.uid()
  )
);

-- Enable realtime for instant broadcast
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings;