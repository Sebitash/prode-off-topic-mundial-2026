import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || '44.238.118.41',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres.uhxhqbqmlurlxtydvqad',
  password: process.env.SUPABASE_DB_PASSWORD,
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  },
  // Mantener conexiones abiertas: reabrir TLS contra el pooler de Supabase
  // (en otra región/nube) en cada request agrega varios cientos de ms.
  max: 10,
  idleTimeoutMillis: 0,
  keepAlive: true,
});

export const query = (text, params) => pool.query(text, params);

export default pool;
