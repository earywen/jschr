-- Seed Data

-- Classes
DO $$ 
DECLARE 
    warrior_id uuid;
    paladin_id uuid;
    hunter_id uuid;
    rogue_id uuid;
    priest_id uuid;
    mage_id uuid;
    warlock_id uuid;
    druid_id uuid;
BEGIN

    -- Warrior
    INSERT INTO public.wow_classes (name, color) VALUES ('Warrior', '#C79C6E') RETURNING id INTO warrior_id;
    INSERT INTO public.wow_specs (class_id, name, role) VALUES 
        (warrior_id, 'Arms', 'dps'),
        (warrior_id, 'Fury', 'dps'),
        (warrior_id, 'Protection', 'tank');

    -- Paladin
    INSERT INTO public.wow_classes (name, color) VALUES ('Paladin', '#F58CBA') RETURNING id INTO paladin_id;
    INSERT INTO public.wow_specs (class_id, name, role) VALUES 
        (paladin_id, 'Holy', 'healer'),
        (paladin_id, 'Protection', 'tank'),
        (paladin_id, 'Retribution', 'dps');

    -- Hunter
    INSERT INTO public.wow_classes (name, color) VALUES ('Hunter', '#ABD473') RETURNING id INTO hunter_id;
    INSERT INTO public.wow_specs (class_id, name, role) VALUES 
        (hunter_id, 'Beast Mastery', 'dps'),
        (hunter_id, 'Marksmanship', 'dps'),
        (hunter_id, 'Survival', 'dps');

    -- Rogue
    INSERT INTO public.wow_classes (name, color) VALUES ('Rogue', '#FFF569') RETURNING id INTO rogue_id;
    INSERT INTO public.wow_specs (class_id, name, role) VALUES 
        (rogue_id, 'Assassination', 'dps'),
        (rogue_id, 'Combat', 'dps'),
        (rogue_id, 'Subtlety', 'dps');

    -- Priest
    INSERT INTO public.wow_classes (name, color) VALUES ('Priest', '#FFFFFF') RETURNING id INTO priest_id;
    INSERT INTO public.wow_specs (class_id, name, role) VALUES 
        (priest_id, 'Discipline', 'healer'),
        (priest_id, 'Holy', 'healer'),
        (priest_id, 'Shadow', 'dps');

    -- Mage
    INSERT INTO public.wow_classes (name, color) VALUES ('Mage', '#40C7EB') RETURNING id INTO mage_id;
    INSERT INTO public.wow_specs (class_id, name, role) VALUES 
        (mage_id, 'Arcane', 'dps'),
        (mage_id, 'Fire', 'dps'),
        (mage_id, 'Frost', 'dps');

    -- Warlock
    INSERT INTO public.wow_classes (name, color) VALUES ('Warlock', '#8787ED') RETURNING id INTO warlock_id;
    INSERT INTO public.wow_specs (class_id, name, role) VALUES 
        (warlock_id, 'Affliction', 'dps'),
        (warlock_id, 'Demonology', 'dps'),
        (warlock_id, 'Destruction', 'dps');

    -- Druid
    INSERT INTO public.wow_classes (name, color) VALUES ('Druid', '#FF7D0A') RETURNING id INTO druid_id;
    INSERT INTO public.wow_specs (class_id, name, role) VALUES 
        (druid_id, 'Balance', 'dps'),
        (druid_id, 'Feral', 'dps'),
        (druid_id, 'Guardian', 'tank'),
        (druid_id, 'Restoration', 'healer');

END $$;

-- Initial GM (Placeholder removed - create user via Auth first)
-- INSERT INTO public.members ... skipped to avoid FK violation
