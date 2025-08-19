-- Create farm_records table for tracking farm activities and records
CREATE TABLE public.farm_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  record_type TEXT NOT NULL, -- 'planting', 'harvesting', 'fertilizing', 'pest_control', 'maintenance', etc.
  crop_type TEXT,
  area_size NUMERIC, -- in acres
  quantity NUMERIC, -- quantity planted/harvested/etc
  unit TEXT, -- kg, bags, liters, etc.
  notes TEXT,
  record_date DATE NOT NULL,
  location_zone TEXT,
  cost NUMERIC DEFAULT 0, -- cost associated with this activity
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create financial_transactions table for tracking farm finances
CREATE TABLE public.financial_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  transaction_type TEXT NOT NULL, -- 'income', 'expense'
  category TEXT NOT NULL, -- 'seeds', 'fertilizer', 'labor', 'equipment', 'sales', 'subsidies', etc.
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'KES',
  description TEXT NOT NULL,
  transaction_date DATE NOT NULL,
  payment_method TEXT, -- 'cash', 'bank_transfer', 'mobile_money', etc.
  receipt_url TEXT, -- link to receipt/invoice image
  related_record_id UUID, -- reference to farm_records if applicable
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create budgets table for financial planning
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL, -- budget name like "Season 2024", "Maize Crop Budget"
  category TEXT NOT NULL,
  allocated_amount NUMERIC NOT NULL,
  spent_amount NUMERIC DEFAULT 0,
  budget_period TEXT NOT NULL, -- 'monthly', 'seasonal', 'yearly'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.farm_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for farm_records
CREATE POLICY "Users can view their own farm records" ON public.farm_records
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own farm records" ON public.farm_records
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farm records" ON public.farm_records
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own farm records" ON public.farm_records
FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all farm records" ON public.farm_records
FOR SELECT USING (is_admin(auth.uid()));

-- Create RLS policies for financial_transactions
CREATE POLICY "Users can view their own financial transactions" ON public.financial_transactions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own financial transactions" ON public.financial_transactions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial transactions" ON public.financial_transactions
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial transactions" ON public.financial_transactions
FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all financial transactions" ON public.financial_transactions
FOR SELECT USING (is_admin(auth.uid()));

-- Create RLS policies for budgets
CREATE POLICY "Users can view their own budgets" ON public.budgets
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budgets" ON public.budgets
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets" ON public.budgets
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets" ON public.budgets
FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all budgets" ON public.budgets
FOR SELECT USING (is_admin(auth.uid()));

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_farm_records_updated_at
  BEFORE UPDATE ON public.farm_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_transactions_updated_at
  BEFORE UPDATE ON public.financial_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();