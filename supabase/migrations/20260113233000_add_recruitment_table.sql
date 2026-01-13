-- Create recruitment priority enum
DO $$ BEGIN
    CREATE TYPE public.recruitment_priority AS ENUM ('high', 'medium', 'low', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create handle_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create recruitment needs table
create table if not exists public.recruitment_needs (
    id uuid default gen_random_uuid() primary key,
    spec_id uuid references public.wow_specs(id) on delete cascade not null,
    priority public.recruitment_priority default 'closed' not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(spec_id)
);

-- RLS Policies
alter table public.recruitment_needs enable row level security;

-- Policy: Everyone can view recruitment needs
drop policy if exists "Everyone can view recruitment needs" on public.recruitment_needs;
create policy "Everyone can view recruitment needs"
    on public.recruitment_needs for select
    using (true);

-- Policy: Service role can manage recruitment needs
drop policy if exists "GM and Service Role can update recruitment needs" on public.recruitment_needs;
create policy "GM and Service Role can update recruitment needs"
    on public.recruitment_needs for all
    using (
        (auth.uid() is null) OR
        exists (select 1 from public.members where id = auth.uid() and role = 'gm')
    );

-- Trigger for updated_at
drop trigger if exists handle_recruitment_needs_updated_at on public.recruitment_needs;
create trigger handle_recruitment_needs_updated_at
    before update on public.recruitment_needs
    for each row
    execute procedure public.handle_updated_at();
