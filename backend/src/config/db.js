import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || '44.238.118.41',
  port: 5432,
  user: process.env.DB_USER || 'postgres.uhxhqbqmlurlxtydvqad',
  password: process.env.SUPABASE_DB_PASSWORD,
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

export const query = (text, params) => pool.query(text, params);

export default pool;
