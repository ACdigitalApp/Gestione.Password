
-- Create passwords table
CREATE TABLE public.passwords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_name TEXT NOT NULL,
  username TEXT NOT NULL,
  password_encrypted TEXT NOT NULL,
  url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.passwords ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own passwords" ON public.passwords FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own passwords" ON public.passwords FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own passwords" ON public.passwords FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own passwords" ON public.passwords FOR DELETE USING (auth.uid() = user_id);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_passwords_updated_at
  BEFORE UPDATE ON public.passwords
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
