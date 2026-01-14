
import { createClient } from '@supabase/supabase-js'
import puppeteer from 'puppeteer'
import dotenv from 'dotenv'
import { getClassIdFromName, WOW_SPECS, getSpecsByClass } from '../lib/data/wow-classes'

// Load environment variables
dotenv.config()

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
)

const GUILD_URL = 'https://www.wowprogress.com/guild/eu/hyjal/Jet+Set+Club'

async function syncRecruitment() {
    console.log('🚀 Starting WowProgress Recruitment Sync...')

    // Launch browser in headless mode with stealth args to bypass Cloudflare
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled'
        ],
        ignoreDefaultArgs: ['--enable-automation']
    })

    try {
        const page = await browser.newPage()

        // Set a real User-Agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

        console.log(`🌐 Navigating to ${GUILD_URL}...`)
        await page.goto(GUILD_URL, { waitUntil: 'networkidle2' })

        // Handle cookie consent if visible (generic approach)
        try {
            const cookieButton = await page.$('button[mode="primary"]')
            if (cookieButton) {
                console.log('🍪 Checking for cookie consent...')
                await cookieButton.click()
                await new Promise(r => setTimeout(r, 1000))
            }
        } catch (e) {
            // Ignore if no cookie banner
        }

        // Scrape recruitment data
        // WowProgress structure: table with rows, often containing class names and specs
        // We look for elements that indicate recruitment. 
        // Based on typical WowProgress layout, it's often a list or table under "Recruiting:"

        const recruitmentData = await page.evaluate(() => {
            const data: { className: string; specName: string; priority: string }[] = []

            // Find the "Recruiting" section
            // Often it's a list of classes with specs
            // Example selector strategy: find the text "Recruiting" and look at siblings

            // WowProgress usually puts it in a div or table. 
            // We'll target the specific class rows usually colored.

            // Selector strategy based on user feedback
            // Structure: <div class="recruiting"> <div class="recrClasses"> <table class="rating recr">

            const rows = document.querySelectorAll('div.recruiting table.rating.recr tr')

            if (!rows.length) {
                // Fallbacks
                const altRows = document.querySelectorAll('.obsan > table tr')
                if (altRows.length) return []
                return []
            }

            rows.forEach(tr => {
                const tds = tr.querySelectorAll('td')
                if (tds.length < 2) return

                const classCol = tds[0].textContent?.trim() || ''
                const priority = tds[1].textContent?.trim().toLowerCase() || 'medium'

                if (!classCol) return

                let className = classCol
                let specName = ''

                const match = classCol.match(/^([\w\s]+)\s*\((.+)\)$/)
                if (match) {
                    className = match[1].trim()
                    specName = match[2].trim()
                }

                data.push({
                    className,
                    specName,
                    priority
                })
            })

            return data
        })

        if (recruitmentData.length === 0) {
            console.warn('⚠️ No recruitment rows found. Dumping HTML to debug.html...')
            const fs = await import('fs')
            fs.writeFileSync('debug.html', await page.content())
        }

        console.log(`📝 Found ${recruitmentData.length} valid recruitment rows.`)
        if (recruitmentData.length > 0) {
            console.log(`Sample row:`, recruitmentData[0])
        }

        // Fetch reference data from DB to resolve UUIDs
        const { data: dbClasses } = await supabase.from('wow_classes').select('*')
        const { data: dbSpecs } = await supabase.from('wow_specs').select('*')

        if (!dbClasses || !dbSpecs) {
            console.error('❌ Failed to fetch reference data from DB')
            return
        }

        // Reset all needs to 'closed'
        await supabase.from('recruitment_needs').update({ priority: 'closed' }).neq('id', '00000000-0000-0000-0000-000000000000')

        let updatedCount = 0; // Initialize updatedCount here

        for (const row of recruitmentData) {
            // Find class UUID
            // We use our helper to handle variations like "deathknight" -> "Death Knight"
            // But we need to match against DB name or slug?
            // Let's assume DB names are standard English "Warrior", "Death Knight", etc.

            // Standardize row class name using our static helper first to get a normalized "slug"
            const normalizedSlug = getClassIdFromName(row.className)
            if (!normalizedSlug) {
                console.warn(`⚠️ Could not normalize class name: "${row.className}"`)
                continue
            }

            // Now find the DB class entry that matches this slug (or name)
            // Our static file has slugs like 'death-knight' and names "Death Knight"
            // Let's try to match by name first since we don't know if DB has slugs

            // Get standard English name from our static file to match DB "name" column
            const standardName = getClassIdFromName(row.className) ?
                (await import('../lib/data/wow-classes')).getClassNameFromId(getClassIdFromName(row.className)!)
                : row.className

            const dbClass = dbClasses.find(c => c.name.toLowerCase() === standardName.toLowerCase())

            if (!dbClass) {
                console.warn(`⚠️ DB Class not found for: "${row.className}" (standard: ${standardName})`)
                continue
            }

            // Map spec
            const specsToUpdate: string[] = []
            const normalizedSpec = row.specName.toLowerCase()

            const classSpecs = dbSpecs.filter(s => s.class_id === dbClass.id)

            if (normalizedSpec === 'dd' || normalizedSpec === 'dps') {
                const dpsSpecs = classSpecs.filter(s => s.role === 'dps')
                specsToUpdate.push(...dpsSpecs.map(s => s.id))
            } else if (normalizedSpec === 'tank') {
                const tankSpecs = classSpecs.filter(s => s.role === 'tank')
                specsToUpdate.push(...tankSpecs.map(s => s.id))
            } else if (normalizedSpec === 'healer' || normalizedSpec === 'heal') {
                const healSpecs = classSpecs.filter(s => s.role === 'healer')
                specsToUpdate.push(...healSpecs.map(s => s.id))
            } else {
                // Fuzzy match spec name
                const matchedSpec = classSpecs.find(s => {
                    const dbName = s.name.toLowerCase()
                    const dbNameNoSpaces = dbName.replace(/\s/g, '')
                    return normalizedSpec.includes(dbName) ||
                        dbName.includes(normalizedSpec) ||
                        dbNameNoSpaces.includes(normalizedSpec) ||
                        normalizedSpec.includes(dbNameNoSpaces) ||
                        normalizedSpec.replace('-dd', '') === dbName
                })

                if (matchedSpec) {
                    specsToUpdate.push(matchedSpec.id)
                } else {
                    console.warn(`⚠️ Could not map spec "${row.specName}" for class ${dbClass.name}`)
                }
            }

            // Update DB
            for (const specId of specsToUpdate) {
                const { error } = await supabase
                    .from('recruitment_needs')
                    .upsert({
                        spec_id: specId,
                        priority: row.priority,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'spec_id' })

                if (error) {
                    console.error(`❌ DB Error updating ${specId}:`, error.message)
                } else {
                    console.log(`Updated ${specId} -> ${row.priority}`)
                    updatedCount++
                }
            }
        }

        console.log(`✨ Sync Complete! Updated ${updatedCount} records.`)

    } catch (error) {
        console.error('❌ Sync failed:', error)
        process.exit(1)
    } finally {
        await browser.close()
    }
}

syncRecruitment()
