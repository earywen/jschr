-- Fix infinite recursion in members RLS policy
-- The issue: "Officers/GM can see all members" policy queries public.members, 
-- which triggers RLS check, causing infinite loop.

-- Solution: Use a security definer function to bypass RLS when checking role

-- Drop the problematic policy
drop policy if exists "Officers/GM can see all members" on public.members;

-- Create a security definer function to get user role without RLS
create or replace function public.get_my_role()
returns public.user_role as $$
  select role from public.members where id = auth.uid()
$$ language sql security definer stable;

-- Recreate the policy using the function
create policy "Officers/GM can see all members" on public.members for select using (
    public.get_my_role() in ('officer', 'gm')
);

-- Also fix candidates policy that has similar issue
drop policy if exists "Officers view all candidates" on public.candidates;
drop policy if exists "Members view candidates" on public.candidates;

create policy "Officers view all candidates" on public.candidates for select using (
    public.get_my_role() in ('officer', 'gm')
);

create policy "Members view candidates" on public.candidates for select using (
    public.get_my_role() = 'member'
);

-- Fix officer_notes policies
drop policy if exists "Officers view notes" on public.officer_notes;
drop policy if exists "Officers create notes" on public.officer_notes;

create policy "Officers view notes" on public.officer_notes for select using (
    public.get_my_role() in ('officer', 'gm')
);

create policy "Officers create notes" on public.officer_notes for insert with check (
    public.get_my_role() in ('officer', 'gm')
);

-- Fix votes policies
drop policy if exists "Members can vote" on public.votes;
drop policy if exists "Officers view all votes" on public.votes;

create policy "Members can vote" on public.votes for insert with check (
    public.get_my_role() = 'member' and auth.uid() = voter_id
);

create policy "Officers view all votes" on public.votes for select using (
    public.get_my_role() in ('officer', 'gm')
);
