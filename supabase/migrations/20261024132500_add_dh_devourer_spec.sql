-- Add Devourer specialization for Demon Hunter
DO $$ 
DECLARE 
    dh_id uuid;
BEGIN
    SELECT id INTO dh_id FROM public.wow_classes WHERE name = 'Demon Hunter';
    
    IF dh_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM public.wow_specs WHERE class_id = dh_id AND name = 'Devourer') THEN
            INSERT INTO public.wow_specs (class_id, name, role) VALUES 
                (dh_id, 'Devourer', 'dps');
        END IF;
    END IF;
END $$;
