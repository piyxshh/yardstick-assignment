const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' }); // Make sure it reads the correct .env file

if (!process.env.POSTGRES_URL) {
  console.error("Error: POSTGRES_URL is not defined in your .env.local file.");
  process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL + "?sslmode=require",
});

async function seed() {
    const client = await pool.connect();
    try {
        console.log('Starting to seed database...');

        
        await client.query('TRUNCATE tenants, users, notes RESTART IDENTITY CASCADE');
        console.log('Cleared existing data.');

       
        const acmeRes = await client.query(
            `INSERT INTO tenants (name, slug, plan) VALUES ('Acme', 'acme', 'free') RETURNING id`
        );
        const globexRes = await client.query(
            `INSERT INTO tenants (name, slug, plan) VALUES ('Globex', 'globex', 'free') RETURNING id`
        );
        const acmeId = acmeRes.rows[0].id;
        const globexId = globexRes.rows[0].id;
        console.log('Created tenants: Acme, Globex');

        
        const passwordHash = await bcrypt.hash('password', 10);

        
        const users = [
            { email: 'admin@acme.test', role: 'admin', tenant_id: acmeId },
            { email: 'user@acme.test', role: 'member', tenant_id: acmeId },
            { email: 'admin@globex.test', role: 'admin', tenant_id: globexId },
            { email: 'user@globex.test', role: 'member', tenant_id: globexId },
        ];

        for (const user of users) {
            await client.query(
                `INSERT INTO users (email, password_hash, role, tenant_id) VALUES ($1, $2, $3, $4)`,
                [user.email, passwordHash, user.role, user.tenant_id]
            );
        }
        console.log('Created 4 test users.');
        console.log('✅ Database seeding complete!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();