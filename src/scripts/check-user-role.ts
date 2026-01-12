
import { Client } from 'pg';

const connectionString = 'postgresql://postgres:zEdrBRoeCj30gec0@db.axlffpogfqxnlqhbenef.supabase.co:5432/postgres';

async function checkUserRole() {
    const client = new Client({
        connectionString,
    });

    try {
        await client.connect();
        console.log('Connected to database');

        const email = 'brigaud.laurent@gmail.com';
        console.log(`Checking for user: ${email}`);

        // Query the members table
        const res = await client.query('SELECT * FROM public.members WHERE email = $1', [email]);

        if (res.rows.length === 0) {
            console.log('No user found in public.members with this email.');
        } else {
            console.log('User found. Role is:', res.rows[0].role);
            console.log('Full user record:', JSON.stringify(res.rows[0], null, 2));
        }

        // Also list all members just in case
        console.log('--- All Members ---');
        const allMembers = await client.query('SELECT email, role, id FROM public.members');
        console.log(JSON.stringify(allMembers.rows, null, 2));

    } catch (err) {
        console.error('Database error:', err);
    } finally {
        await client.end();
    }
}

checkUserRole();
