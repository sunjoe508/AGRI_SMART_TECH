-- =====================================================
-- PART 1: FIX RLS SECURITY ISSUES
-- =====================================================

-- Fix orders table - require authentication for admin access
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM admin_roles WHERE admin_roles.user_id = auth.uid())
);

-- Fix sensor_data table - require authentication for admin access
DROP POLICY IF EXISTS "Admins can view all sensor data" ON public.sensor_data;
CREATE POLICY "Admins can view all sensor data" 
ON public.sensor_data 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM admin_roles WHERE admin_roles.user_id = auth.uid())
);

-- Fix irrigation_logs table - require authentication for admin access
DROP POLICY IF EXISTS "Admins can view all irrigation logs" ON public.irrigation_logs;
CREATE POLICY "Admins can view all irrigation logs" 
ON public.irrigation_logs 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM admin_roles WHERE admin_roles.user_id = auth.uid())
);

-- Fix support_tickets table - require authentication for admin access
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;
CREATE POLICY "Admins can view all tickets" 
ON public.support_tickets 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM admin_roles WHERE admin_roles.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can update tickets" ON public.support_tickets;
CREATE POLICY "Admins can update tickets" 
ON public.support_tickets 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM admin_roles WHERE admin_roles.user_id = auth.uid())
);

-- Fix admin_roles table - require admin for viewing/inserting
DROP POLICY IF EXISTS "Admins can view admin roles" ON public.admin_roles;
CREATE POLICY "Admins can view admin roles" 
ON public.admin_roles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM admin_roles ar WHERE ar.user_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Admins can insert admin roles" ON public.admin_roles;
CREATE POLICY "Admins can insert admin roles" 
ON public.admin_roles 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM admin_roles ar WHERE ar.user_id = auth.uid())
);

-- Add missing DELETE policy for admin_roles
CREATE POLICY "Admins can delete admin roles" 
ON public.admin_roles 
FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM admin_roles ar WHERE ar.user_id = auth.uid())
);

-- =====================================================
-- PART 2: CREATE FINANCIAL MANAGEMENT TABLES
-- =====================================================

-- Create financial_transactions table
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT,
  budget_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create budgets table
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  allocated_amount NUMERIC NOT NULL DEFAULT 0,
  spent_amount NUMERIC NOT NULL DEFAULT 0,
  budget_period TEXT NOT NULL DEFAULT 'monthly',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity_logs table for automatic activity tracking
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  activity_description TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for financial_transactions
CREATE POLICY "Users can view their own transactions" 
ON public.financial_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" 
ON public.financial_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
ON public.financial_transactions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
ON public.financial_transactions 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" 
ON public.financial_transactions 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM admin_roles WHERE admin_roles.user_id = auth.uid())
);

-- RLS policies for budgets
CREATE POLICY "Users can view their own budgets" 
ON public.budgets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budgets" 
ON public.budgets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets" 
ON public.budgets 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets" 
ON public.budgets 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all budgets" 
ON public.budgets 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM admin_roles WHERE admin_roles.user_id = auth.uid())
);

-- RLS policies for activity_logs
CREATE POLICY "Users can view their own activity logs" 
ON public.activity_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity logs" 
ON public.activity_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity logs" 
ON public.activity_logs 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM admin_roles WHERE admin_roles.user_id = auth.uid())
);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.financial_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.budgets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;

-- =====================================================
-- PART 3: CREATE TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update budget spent_amount when transactions change
CREATE OR REPLACE FUNCTION public.update_budget_spent()
RETURNS TRIGGER AS $$
BEGIN
  -- Update spent amount for the related budget
  IF NEW.budget_id IS NOT NULL THEN
    UPDATE public.budgets
    SET spent_amount = (
      SELECT COALESCE(SUM(amount), 0)
      FROM public.financial_transactions
      WHERE budget_id = NEW.budget_id AND transaction_type = 'expense'
    ),
    updated_at = now()
    WHERE id = NEW.budget_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_budget_on_transaction
AFTER INSERT OR UPDATE OR DELETE ON public.financial_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_budget_spent();

-- Function to log activities automatically
CREATE OR REPLACE FUNCTION public.log_user_activity()
RETURNS TRIGGER AS $$
DECLARE
  activity_desc TEXT;
  act_type TEXT;
BEGIN
  -- Determine activity type and description based on table and operation
  CASE TG_TABLE_NAME
    WHEN 'financial_transactions' THEN
      IF TG_OP = 'INSERT' THEN
        act_type := 'transaction_created';
        activity_desc := 'Added ' || NEW.transaction_type || ' transaction: ' || COALESCE(NEW.description, NEW.category) || ' - KES ' || NEW.amount;
      ELSIF TG_OP = 'UPDATE' THEN
        act_type := 'transaction_updated';
        activity_desc := 'Updated transaction: ' || COALESCE(NEW.description, NEW.category);
      ELSE
        act_type := 'transaction_deleted';
        activity_desc := 'Deleted transaction: ' || COALESCE(OLD.description, OLD.category);
      END IF;
    WHEN 'budgets' THEN
      IF TG_OP = 'INSERT' THEN
        act_type := 'budget_created';
        activity_desc := 'Created budget: ' || NEW.name || ' - KES ' || NEW.allocated_amount;
      ELSIF TG_OP = 'UPDATE' THEN
        act_type := 'budget_updated';
        activity_desc := 'Updated budget: ' || NEW.name;
      ELSE
        act_type := 'budget_deleted';
        activity_desc := 'Deleted budget: ' || OLD.name;
      END IF;
    WHEN 'irrigation_logs' THEN
      IF TG_OP = 'INSERT' THEN
        act_type := 'irrigation_started';
        activity_desc := 'Started irrigation in zone: ' || COALESCE(NEW.zone, 'Unknown') || ' for ' || COALESCE(NEW.duration_minutes::TEXT, '0') || ' minutes';
      END IF;
    WHEN 'sensor_data' THEN
      IF TG_OP = 'INSERT' THEN
        act_type := 'sensor_reading';
        activity_desc := 'Sensor reading recorded - Temp: ' || COALESCE(NEW.temperature::TEXT, 'N/A') || '°C, Humidity: ' || COALESCE(NEW.humidity::TEXT, 'N/A') || '%';
      END IF;
    WHEN 'support_tickets' THEN
      IF TG_OP = 'INSERT' THEN
        act_type := 'ticket_created';
        activity_desc := 'Created support ticket: ' || NEW.subject;
      ELSIF TG_OP = 'UPDATE' THEN
        act_type := 'ticket_updated';
        activity_desc := 'Updated ticket status to: ' || NEW.status;
      END IF;
    WHEN 'orders' THEN
      IF TG_OP = 'INSERT' THEN
        act_type := 'order_placed';
        activity_desc := 'Placed order: ' || COALESCE(NEW.product_name, 'Unknown') || ' - KES ' || COALESCE(NEW.total_amount::TEXT, '0');
      END IF;
    ELSE
      act_type := TG_OP;
      activity_desc := TG_TABLE_NAME || ' ' || TG_OP;
  END CASE;

  -- Insert activity log
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.activity_logs (user_id, activity_type, activity_description, entity_type, entity_id)
    VALUES (OLD.user_id, act_type, activity_desc, TG_TABLE_NAME, OLD.id);
    RETURN OLD;
  ELSE
    INSERT INTO public.activity_logs (user_id, activity_type, activity_description, entity_type, entity_id)
    VALUES (NEW.user_id, act_type, activity_desc, TG_TABLE_NAME, NEW.id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic activity logging
CREATE TRIGGER log_financial_transaction_activity
AFTER INSERT OR UPDATE OR DELETE ON public.financial_transactions
FOR EACH ROW
EXECUTE FUNCTION public.log_user_activity();

CREATE TRIGGER log_budget_activity
AFTER INSERT OR UPDATE OR DELETE ON public.budgets
FOR EACH ROW
EXECUTE FUNCTION public.log_user_activity();

CREATE TRIGGER log_irrigation_activity
AFTER INSERT ON public.irrigation_logs
FOR EACH ROW
EXECUTE FUNCTION public.log_user_activity();

CREATE TRIGGER log_sensor_activity
AFTER INSERT ON public.sensor_data
FOR EACH ROW
EXECUTE FUNCTION public.log_user_activity();

CREATE TRIGGER log_ticket_activity
AFTER INSERT OR UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.log_user_activity();

CREATE TRIGGER log_order_activity
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.log_user_activity();

-- Update timestamps trigger for new tables
CREATE TRIGGER update_financial_transactions_updated_at
BEFORE UPDATE ON public.financial_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
BEFORE UPDATE ON public.budgets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();