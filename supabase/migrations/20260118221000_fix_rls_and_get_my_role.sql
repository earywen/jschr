-- Redefine get_my_role() to use correct column names
CREATE OR REPLACE FUNCTION public.get_my_role()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  user_role TEXT;
BEGIN
  -- Correctly use 'id' which is the UUID linked to auth.uid()
  SELECT role INTO user_role
  FROM public.members
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'pending');
END;
$function$;

-- Drop existing policies on votes to ensure clean re-application
DROP POLICY IF EXISTS "Members can insert votes" ON public.votes;
DROP POLICY IF EXISTS "Members can update own votes" ON public.votes;
DROP POLICY IF EXISTS "Users can view own votes" ON public.votes;
DROP POLICY IF EXISTS "Officers can view all votes" ON public.votes;

-- Re-apply policies
CREATE POLICY "Members can insert votes" ON public.votes FOR INSERT WITH CHECK (
    auth.uid() = voter_id
    AND (
        SELECT role FROM public.members WHERE id = auth.uid()
    ) IN ('member', 'officer', 'gm')
);

CREATE POLICY "Members can update own votes" ON public.votes FOR UPDATE USING (
    auth.uid() = voter_id
);

CREATE POLICY "Users can view own votes" ON public.votes FOR SELECT USING (
    auth.uid() = voter_id
);

CREATE POLICY "Officers can view all votes" ON public.votes FOR SELECT USING (
    (SELECT role FROM public.members WHERE id = auth.uid()) IN ('officer', 'gm')
);
