
-- Drop restrictive policies
DROP POLICY IF EXISTS "Users can view their own passwords" ON public.passwords;
DROP POLICY IF EXISTS "Users can create their own passwords" ON public.passwords;
DROP POLICY IF EXISTS "Users can update their own passwords" ON public.passwords;
DROP POLICY IF EXISTS "Users can delete their own passwords" ON public.passwords;

-- Recreate as PERMISSIVE (default)
CREATE POLICY "Users can view their own passwords" ON public.passwords
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own passwords" ON public.passwords
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own passwords" ON public.passwords
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own passwords" ON public.passwords
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
