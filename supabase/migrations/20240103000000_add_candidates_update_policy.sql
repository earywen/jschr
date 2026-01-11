-- Add UPDATE and DELETE policies for candidates table
-- Only GM can update candidate status

create policy "GM can update candidates" on public.candidates for update using (
    public.get_my_role() = 'gm'
);

create policy "GM can delete candidates" on public.candidates for delete using (
    public.get_my_role() = 'gm'
);
