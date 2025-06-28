
-- Create a table to store admin creation tokens
CREATE TABLE public.admin_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token text NOT NULL UNIQUE,
  email text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '24 hours'),
  used boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on admin_tokens
ALTER TABLE public.admin_tokens ENABLE ROW LEVEL SECURITY;

-- Only admins can create admin tokens
CREATE POLICY "Only admins can create admin tokens" ON public.admin_tokens
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can view admin tokens
CREATE POLICY "Only admins can view admin tokens" ON public.admin_tokens
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create a function to generate admin invitation tokens
CREATE OR REPLACE FUNCTION public.generate_admin_token(admin_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_token text;
BEGIN
  -- Check if the caller is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can generate admin tokens';
  END IF;
  
  -- Generate a random token
  new_token := encode(gen_random_bytes(32), 'hex');
  
  -- Insert the token
  INSERT INTO public.admin_tokens (token, email, created_by)
  VALUES (new_token, admin_email, auth.uid());
  
  RETURN new_token;
END;
$$;

-- Create a function to validate admin tokens and create admin users
CREATE OR REPLACE FUNCTION public.validate_admin_token(token_value text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token_record public.admin_tokens%ROWTYPE;
BEGIN
  -- Get the token record
  SELECT * INTO token_record
  FROM public.admin_tokens
  WHERE token = token_value
    AND NOT used
    AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Invalid or expired token');
  END IF;
  
  -- Mark token as used
  UPDATE public.admin_tokens
  SET used = true
  WHERE id = token_record.id;
  
  RETURN jsonb_build_object(
    'valid', true, 
    'email', token_record.email,
    'message', 'Token is valid'
  );
END;
$$;
