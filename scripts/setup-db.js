const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read from environment or prompt
const password = process.env.SUPABASE_DB_PASSWORD;
const projectRef = process.env.SUPABASE_PROJECT_REF || 'bbskftjdzwtvrmpbmskd';

if (!password) {
  console.log('Database already migrated. To re-run, provide SUPABASE_DB_PASSWORD environment variable.');
  process.exit(0);
}

const connectionString = `postgres://postgres.${projectRef}:${password}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`;

async function run() {
  const schemaPath = path.resolve(__dirname, '../src/supabase/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  await client.query(schemaSql);
  await client.end();
  console.log('Database updated successfully!');
}

run().catch(console.error);
