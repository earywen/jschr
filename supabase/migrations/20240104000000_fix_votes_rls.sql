-- Fix RLS policies for votes table
-- Members can insert and update their own votes

-- Drop existing restrictive policies if they exist
drop policy if exists "Members can insert votes" on public.votes;
drop policy if exists "Members can update own votes" on public.votes;

-- Allow members to insert votes (only for themselves)
create policy "Members can insert votes" on public.votes for insert with check (
    auth.uid() = voter_id
    and public.get_my_role() in ('member', 'officer', 'gm')
);

-- Allow members to update their own votes
create policy "Members can update own votes" on public.votes for update using (
    auth.uid() = voter_id
);

-- Allow users to select their own votes (blind voting)
create policy "Users can view own votes" on public.votes for select using (
    auth.uid() = voter_id
);

-- Officers and GM can view all votes (for synthesis)
create policy "Officers can view all votes" on public.votes for select using (
    public.get_my_role() in ('officer', 'gm')
);
