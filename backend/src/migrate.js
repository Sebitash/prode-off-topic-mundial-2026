import pg from 'pg';
const { Client } = pg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const sql = fs.readFileSync(path.join(__dirname, '../../supabase/migrations/20260323_login_users.sql'), 'utf8');

async function runMigration() {
  const client = new Client({
    host: '44.238.118.41',
    port: 5432,
    user: 'postgres.uhxhqbqmlurlxtydvqad',
    password: process.env.SUPABASE_DB_PASSWORD || 'p$7vj%xxw/58FT$',
    database: 'postgres',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Conectado a la base de datos...');
    await client.query(sql);
    console.log('Migración completada con éxito.');
  } catch (err) {
    console.error('Error en la migración:', err);
  } finally {
    await client.end();
  }
}

runMigration();
