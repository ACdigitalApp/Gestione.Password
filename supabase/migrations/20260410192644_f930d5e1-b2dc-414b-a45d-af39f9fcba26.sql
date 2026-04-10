
-- Table for site-wide stats
CREATE TABLE public.site_stats (
  id TEXT PRIMARY KEY DEFAULT 'global',
  total_visits BIGINT NOT NULL DEFAULT 0
);

-- Seed with initial row
INSERT INTO public.site_stats (id, total_visits) VALUES ('global', 280);

-- Enable RLS
ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;

-- Anyone can read
CREATE POLICY "Anyone can read site stats"
  ON public.site_stats FOR SELECT
  USING (true);

-- Function to increment visits (security definer bypasses RLS for update)
CREATE OR REPLACE FUNCTION public.increment_visits()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_total BIGINT;
BEGIN
  UPDATE public.site_stats
    SET total_visits = total_visits + 1
    WHERE id = 'global'
    RETURNING total_visits INTO new_total;
  RETURN new_total;
END;
$$;
