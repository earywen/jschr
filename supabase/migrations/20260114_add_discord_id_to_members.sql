-- Add discord_id to members table
alter table public.members
add column if not exists discord_id text unique;

-- Create function to handle identity creation (link or signup)
create or replace function public.handle_new_identity()
returns trigger as $$
begin
    -- Only care about discord provider
    if new.provider = 'discord' then
        -- Update the member record with the discord ID
        -- new.id in auth.identities IS the provider's user ID (e.g. Discord ID) for the provider
        update public.members
        set discord_id = new.id
        where id = new.user_id;
    end if;
    return new;
end;
$$ language plpgsql security definer;

-- Trigger for new identities (fires when user links discord or signs up with discord)
drop trigger if exists on_auth_identity_created on auth.identities;
create trigger on_auth_identity_created
    after insert on auth.identities
    for each row execute procedure public.handle_new_identity();

-- Backfill existing discord IDs
-- We access auth.identities to find existing discord links
do $$
begin
    update public.members m
    set discord_id = i.id
    from auth.identities i
    where m.id = i.user_id
    and i.provider = 'discord'
    and m.discord_id is null;
end $$;
