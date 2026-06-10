// Script de backfill: crea en Supabase Auth a los usuarios que ya existen en
// login_users, para que puedan usar "Olvidé mi contraseña" (Supabase solo
// envía el mail de recuperación a usuarios que existen en auth.users).
//
// Uso: node src/scripts/backfillSupabaseAuthUsers.js

import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const main = async () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Falta configurar NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  // Usamos la REST API de Supabase (PostgREST) en vez de una conexión directa
  // a Postgres, para no depender de la conectividad IPv6 al host de la DB.
  const usersRes = await fetch(`${SUPABASE_URL}/rest/v1/login_users?select=email`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  if (!usersRes.ok) {
    console.error('No se pudo obtener la lista de usuarios:', await usersRes.text());
    process.exit(1);
  }

  const rows = await usersRes.json();
  console.log(`Procesando ${rows.length} usuarios...`);

  for (const { email } of rows) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({
        email,
        password: crypto.randomUUID(),
        email_confirm: true,
      }),
    });

    if (res.ok) {
      console.log(`✓ Creado en Supabase Auth: ${email}`);
    } else if (res.status === 422) {
      console.log(`- Ya existía: ${email}`);
    } else {
      const body = await res.json().catch(() => ({}));
      console.error(`✗ Error con ${email}:`, body);
    }
  }

  process.exit(0);
};

main();
