ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS vault_salt text NOT NULL DEFAULT encode(gen_random_bytes(16), 'base64');

-- Update handle_new_user so new profiles get a fresh random salt (default already covers it,
-- but be explicit for clarity / future-proofing).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, vault_salt)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    encode(gen_random_bytes(16), 'base64')
  )
  ON CONFLICT (user_id) DO NOTHING;

  IF NEW.email = 'acdigital.app@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;