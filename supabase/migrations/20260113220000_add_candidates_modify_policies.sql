-- Add missing RLS policies for candidates table
-- Issue: DELETE and UPDATE policies were missing, relying on admin client bypass

-- Add UPDATE policy for GM
drop policy if exists "GM can update candidates" on public.candidates;
create policy "GM can update candidates" on public.candidates for update using (
    public.get_my_role() = 'gm'
);

-- Add DELETE policy for GM  
drop policy if exists "GM can delete candidates" on public.candidates;
create policy "GM can delete candidates" on public.candidates for delete using (
    public.get_my_role() = 'gm'
);
