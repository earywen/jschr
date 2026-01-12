
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

const connectionString = 'postgresql://postgres:zEdrBRoeCj30gec0@db.axlffpogfqxnlqhbenef.supabase.co:5432/postgres';

async function applyMigration() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        const sqlPath = path.resolve(process.cwd(), 'supabase/migrations/20240112000001_add_ilvl_and_progress.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing SQL:', sql);
        await client.query(sql);
        console.log('Migration applied successfully!');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

applyMigration();
