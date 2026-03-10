
ALTER TABLE public.passwords ADD COLUMN category TEXT NOT NULL DEFAULT 'web';
ALTER TABLE public.passwords ADD COLUMN extra_info TEXT;
