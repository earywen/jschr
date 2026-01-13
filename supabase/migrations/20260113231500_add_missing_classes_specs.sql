-- Add missing WoW Classes and Specs (DK, Monk, DH, Evoker, Shaman)
-- Also fix outdated spec names (Combat -> Outlaw)

DO $$ 
DECLARE 
    shaman_id uuid;
    dk_id uuid;
    monk_id uuid;
    dh_id uuid;
    evoker_id uuid;
    rogue_id uuid;
BEGIN
    -- 1. Update Rogue: Combat -> Outlaw
    -- Get Rogue ID first
    SELECT id INTO rogue_id FROM public.wow_classes WHERE name = 'Rogue';
    
    IF rogue_id IS NOT NULL THEN
        UPDATE public.wow_specs 
        SET name = 'Outlaw' 
        WHERE class_id = rogue_id AND name = 'Combat';
    END IF;

    -- 2. Insert Shaman
    IF NOT EXISTS (SELECT 1 FROM public.wow_classes WHERE name = 'Shaman') THEN
        INSERT INTO public.wow_classes (name, color) VALUES ('Shaman', '#0070DE') RETURNING id INTO shaman_id;
        INSERT INTO public.wow_specs (class_id, name, role) VALUES 
            (shaman_id, 'Elemental', 'dps'),
            (shaman_id, 'Enhancement', 'dps'),
            (shaman_id, 'Restoration', 'healer');
    END IF;

    -- 3. Insert Death Knight
    IF NOT EXISTS (SELECT 1 FROM public.wow_classes WHERE name = 'Death Knight') THEN
        INSERT INTO public.wow_classes (name, color) VALUES ('Death Knight', '#C41F3B') RETURNING id INTO dk_id;
        INSERT INTO public.wow_specs (class_id, name, role) VALUES 
            (dk_id, 'Blood', 'tank'),
            (dk_id, 'Frost', 'dps'),
            (dk_id, 'Unholy', 'dps');
    END IF;

    -- 4. Insert Monk
    IF NOT EXISTS (SELECT 1 FROM public.wow_classes WHERE name = 'Monk') THEN
        INSERT INTO public.wow_classes (name, color) VALUES ('Monk', '#00FF96') RETURNING id INTO monk_id;
        INSERT INTO public.wow_specs (class_id, name, role) VALUES 
            (monk_id, 'Brewmaster', 'tank'),
            (monk_id, 'Mistweaver', 'healer'),
            (monk_id, 'Windwalker', 'dps');
    END IF;

    -- 5. Insert Demon Hunter
    IF NOT EXISTS (SELECT 1 FROM public.wow_classes WHERE name = 'Demon Hunter') THEN
        INSERT INTO public.wow_classes (name, color) VALUES ('Demon Hunter', '#A330C9') RETURNING id INTO dh_id;
        INSERT INTO public.wow_specs (class_id, name, role) VALUES 
            (dh_id, 'Havoc', 'dps'),
            (dh_id, 'Vengeance', 'tank');
    END IF;

    -- 6. Insert Evoker
    IF NOT EXISTS (SELECT 1 FROM public.wow_classes WHERE name = 'Evoker') THEN
        INSERT INTO public.wow_classes (name, color) VALUES ('Evoker', '#33937F') RETURNING id INTO evoker_id;
        INSERT INTO public.wow_specs (class_id, name, role) VALUES 
            (evoker_id, 'Devastation', 'dps'),
            (evoker_id, 'Preservation', 'healer'),
            (evoker_id, 'Augmentation', 'dps');
    END IF;

END $$;
