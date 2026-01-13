
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';
import * as dotenv from 'dotenv';

// Load env vars from .env.local
dotenv.config({ path: '.env.local' });

// Types matches our DB enum
type Priority = 'high' | 'medium' | 'low' | 'closed';

interface ScrapedSpec {
    className: string;
    specName: string;
    priority: Priority;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing environment variables (SUPABASE_URL or SUPABASE_SERVICE_KEY)');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const GUILD_URL = 'https://www.wowprogress.com/guild/eu/hyjal/Jet+Set+Club';

async function main() {
    console.log('🚀 Starting WowProgress Recruitment Sync...');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();

    try {
        console.log(`🌐 Navigating to ${GUILD_URL}...`);
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.goto(GUILD_URL, { waitUntil: 'networkidle2', timeout: 60000 });

        // 1. Handle Cookie Consent (Blind Attempt)
        console.log('🍪 Checking for cookie consent...');
        try {
            await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button, a.btn, div[role="button"]'));
                const acceptBtn = buttons.find(b => {
                    const t = (b.textContent || '').toLowerCase();
                    return t.includes('agree') || t.includes('accept') || t.includes('j\'accepte') || t.includes('consent');
                });
                if (acceptBtn) {
                    (acceptBtn as HTMLElement).click();
                    console.log('Clicked consent button:', acceptBtn.textContent);
                }
            });
            await new Promise(r => setTimeout(r, 2000));
        } catch (e) {
            console.log('No obvious consent button clicked or error:', e);
        }

        // 2. Evaluate page content using correct structure (Row per spec)
        // Debug showed: <tr><td>deathknight (dd)</td><td>medium</td></tr>
        const extractedData = await page.evaluate(() => {
            const results: { className: string; specName: string; priority: string }[] = [];
            const wowClasses = ['Death Knight', 'Demon Hunter', 'Druid', 'Hunter', 'Mage', 'Monk', 'Paladin', 'Priest', 'Rogue', 'Shaman', 'Warlock', 'Warrior', 'Evoker'];

            // Selector: .recruiting -> table -> tr
            const rows = Array.from(document.querySelectorAll('.recruiting table.rating.recr tr'));

            rows.forEach(row => {
                const cells = Array.from(row.querySelectorAll('td'));
                if (cells.length < 2) return;

                // Col 1: "deathknight (dd)" OR "mage (arcane)"
                const col1Text = cells[0].textContent?.trim().toLowerCase() || '';
                // Col 2: "medium"
                const col2Text = cells[1].textContent?.trim().toLowerCase() || 'closed';

                // Find matching class name
                // "deathknight" usually matches "Death Knight" loosely
                // "demon hunter" matches "Demon Hunter"
                const matchedClass = wowClasses.find(c => col1Text.includes(c.toLowerCase()));

                if (matchedClass) {
                    // Extract spec from parens: "(dd)" -> "dd"
                    const specMatch = col1Text.match(/\((.*?)\)/);
                    const rawSpec = specMatch ? specMatch[1] : '';

                    results.push({
                        className: matchedClass,
                        specName: rawSpec,
                        priority: col2Text
                    });
                }
            });

            return results;
        });

        console.log(`📝 Found ${extractedData.length} valid recruitment rows.`);
        console.log('Sample row:', extractedData[0]);

        const parsedSpecs: ScrapedSpec[] = [];

        for (const item of extractedData) {
            // Priority Mapping
            let priority: Priority = 'closed';
            if (item.priority.includes('high')) priority = 'high';
            else if (item.priority.includes('medium')) priority = 'medium';
            else if (item.priority.includes('low')) priority = 'low';
            else if (item.priority.includes('open')) priority = 'medium'; // default open

            // Spec Mapping
            let specName = item.specName.trim();

            // Handle generic roles
            if (/dd|dps|damage/i.test(specName)) specName = 'ALL_DPS';
            else if (/tank/i.test(specName)) specName = 'ALL_TANK';
            else if (/heal/i.test(specName)) specName = 'ALL_HEALER';
            else {
                // If specific spec (e.g., "arcane", "beastmastery")
                // We keep it as is, strictly lowercase, to match against DB later
                // DB usually has Title Case "Arcane", "Beast Mastery".
                // We will handle fuzzy match in syncToDb.
            }

            parsedSpecs.push({
                className: item.className,
                specName: specName,
                priority: priority
            });
        }

        console.log('✅ Parsed structured specs:', parsedSpecs);

        if (parsedSpecs.length > 0) {
            await syncToDb(parsedSpecs);
        } else {
            console.log('⚠️ No specs parsed.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await browser.close();
    }
}

async function syncToDb(scrapedData: ScrapedSpec[]) {
    console.log('💾 Syncing to Supabase...');

    // 1. Fetch reference data
    const { data: allSpecs, error: specsError } = await supabase
        .from('wow_specs')
        .select(`
            id,
            name,
            role,
            wow_classes!inner (
                id,
                name
            )
        `);

    if (specsError || !allSpecs) {
        console.error('Failed to fetch specs', specsError);
        return;
    }

    // 2. Reset all
    await supabase.from('recruitment_needs').update({ priority: 'closed' }).neq('priority', 'closed');

    // 3. Upsert found
    let updateCount = 0;

    for (const item of scrapedData) {
        const dbSpecs = allSpecs.filter(s => {
            // @ts-ignore
            if (s.wow_classes.name !== item.className) return false;

            if (item.specName === 'ALL_DPS') return s.role === 'dps';
            if (item.specName === 'ALL_TANK') return s.role === 'tank';
            if (item.specName === 'ALL_HEALER') return s.role === 'healer';

            // Fuzzy match name
            // item.specName is likely lowercase "arcane" or "beastmastery"
            // s.name is "Arcane", "Beast Mastery"
            const dbNameClean = s.name.toLowerCase().replace(/\s/g, '');
            const scrapedNameClean = item.specName.toLowerCase().replace(/\s|-/g, ''); // "beast-mastery" -> "beastmastery"

            return dbNameClean === scrapedNameClean || scrapedNameClean.includes(dbNameClean);
        });

        for (const dbSpec of dbSpecs) {
            const { error } = await supabase
                .from('recruitment_needs')
                .upsert({
                    spec_id: dbSpec.id,
                    priority: item.priority,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'spec_id' });

            if (error) console.error(`Error updating ${dbSpec.name}:`, error.message);
            else {
                console.log(`Updated ${item.className} - ${dbSpec.name} -> ${item.priority}`);
                updateCount++;
            }
        }
    }

    console.log(`✨ Sync Complete! Updated ${updateCount} records.`);
}

main();
