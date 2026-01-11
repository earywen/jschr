-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create custom types/enums
create type public.user_role as enum ('pending', 'member', 'officer', 'gm');
create type public.candidate_status as enum ('pending', 'accepted', 'rejected', 'waitlist');
create type public.vote_type as enum ('yes', 'no', 'neutral');

-- Create 'public.members' table (Mapping to Auth Users)
create table public.members (
    id uuid references auth.users(id) on delete cascade not null primary key,
    email text not null,
    role public.user_role default 'pending'::public.user_role not null,
    created_at timestamptz default timezone('utc'::text, now()) not null,
    last_seen timestamptz default timezone('utc'::text, now()) not null
);

-- Create 'public.wow_classes' table (Static Data)
create table public.wow_classes (
    id uuid default uuid_generate_v4() primary key,
    name text not null unique,
    color text not null, -- Hex code
    icon_url text -- Optional icon
);

-- Create 'public.wow_specs' table (Static Data)
create table public.wow_specs (
    id uuid default uuid_generate_v4() primary key,
    class_id uuid references public.wow_classes(id) on delete cascade not null,
    name text not null,
    role text check (role in ('tank', 'healer', 'dps')) not null,
    unique(class_id, name)
);

-- Create 'public.candidates' table (The Core)
create table public.candidates (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete set null, -- Nullable if guest applies? Or must be auth? Assuming guest for now or auth via Bnet in V3. Let's make it nullable for standard flow but linked if auth exists.
    -- Vague 1: Basic Info
    name text not null,
    class_id uuid references public.wow_classes(id) not null,
    spec_id uuid references public.wow_specs(id) not null,
    race text, -- V3 auto-fill
    realm text, -- V3 auto-fill
    level int, -- V3 auto-fill
    battle_tag text, -- V3
    warcraftlogs_link text,
    screenshot_url text, -- Storage link
    motivation text,
    
    -- Status
    status public.candidate_status default 'pending'::public.candidate_status not null,
    
    -- Vague 2: Metadata
    created_at timestamptz default timezone('utc'::text, now()) not null,
    updated_at timestamptz default timezone('utc'::text, now()) not null,
    
    -- Vague 3: Computed Data
    wlogs_score numeric, -- Cached score
    wlogs_color text -- Cached color
);

-- Create 'public.officer_notes' table
create table public.officer_notes (
    id uuid default uuid_generate_v4() primary key,
    candidate_id uuid references public.candidates(id) on delete cascade not null,
    author_id uuid references public.members(id) not null,
    content text not null,
    created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Create 'public.votes' table (Vague 2)
create table public.votes (
    id uuid default uuid_generate_v4() primary key,
    candidate_id uuid references public.candidates(id) on delete cascade not null,
    voter_id uuid references public.members(id) not null,
    vote public.vote_type not null,
    created_at timestamptz default timezone('utc'::text, now()) not null,
    unique(candidate_id, voter_id) -- One vote per member per candidate
);

-- Row Level Security (RLS)

-- Enable RLS
alter table public.members enable row level security;
alter table public.wow_classes enable row level security;
alter table public.wow_specs enable row level security;
alter table public.candidates enable row level security;
alter table public.officer_notes enable row level security;
alter table public.votes enable row level security;

-- Policies

-- WOW CLASSES / SPECS (Public Read)
create policy "Classes are viewable by everyone" on public.wow_classes for select using (true);
create policy "Specs are viewable by everyone" on public.wow_specs for select using (true);

-- MEMBERS (Read own, Officers read all)
create policy "Users can see their own member profile" on public.members for select using (auth.uid() = id);
create policy "Officers/GM can see all members" on public.members for select using (
    exists (select 1 from public.members where id = auth.uid() and role in ('officer', 'gm'))
);

-- CANDIDATES
-- Everyone can create (Apply)
create policy "Anyone can insert candidate" on public.candidates for insert with check (true);
-- Officers/GM can view all
create policy "Officers view all candidates" on public.candidates for select using (
    exists (select 1 from public.members where id = auth.uid() and role in ('officer', 'gm'))
);
-- Members can view candidates (Restricted view handling in API/Frontend, but RLS allows row access)
-- Note: You might want to restrict columns, but Supabase RLS is row-based.
create policy "Members view candidates" on public.candidates for select using (
    exists (select 1 from public.members where id = auth.uid() and role = 'member')
);

-- OFFICER NOTES
-- Only officers view and create
create policy "Officers view notes" on public.officer_notes for select using (
    exists (select 1 from public.members where id = auth.uid() and role in ('officer', 'gm'))
);
create policy "Officers create notes" on public.officer_notes for insert with check (
    exists (select 1 from public.members where id = auth.uid() and role in ('officer', 'gm'))
);

-- VOTES
-- Members can vote
create policy "Members can vote" on public.votes for insert with check (
    exists (select 1 from public.members where id = auth.uid() and role = 'member') and
    auth.uid() = voter_id
);
-- Members can update their own vote
create policy "Members can update own vote" on public.votes for update using (
    auth.uid() = voter_id
);
-- Blind Vote: Members can ONLY see their own vote
create policy "Members view own vote" on public.votes for select using (
    auth.uid() = voter_id
);
-- Officers can see ALL votes (Consensus transparency)
create policy "Officers view all votes" on public.votes for select using (
    exists (select 1 from public.members where id = auth.uid() and role in ('officer', 'gm'))
);

-- Triggers for User Management
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.members (id, email, role)
  values (new.id, new.email, 'pending');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Storage Bucket Setup (Safe check)
insert into storage.buckets (id, name, public)
values ('candidates-screenshots', 'candidates-screenshots', true)
on conflict (id) do nothing;

create policy "Images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'candidates-screenshots' );

create policy "Anyone can upload an image"
  on storage.objects for insert
  with check ( bucket_id = 'candidates-screenshots' );
