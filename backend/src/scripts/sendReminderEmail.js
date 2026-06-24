// Script para enviar un mail recordatorio a todos los usuarios registrados.
// Usa Gmail SMTP (necesita una "contraseña de aplicación" de Google, no la
// contraseña normal de la cuenta: https://myaccount.google.com/apppasswords).
//
// Variables de entorno necesarias en backend/.env:
//   GMAIL_USER=tu-cuenta@gmail.com
//   GMAIL_APP_PASSWORD=contraseña-de-aplicación-de-16-caracteres
//
// Editá EMAIL_SUBJECT y EMAIL_BODY más abajo con el mensaje que quieras enviar.
//
// Uso: npm run send-reminder
//
// Para probarlo mandando el mail solo a una dirección (sin tocar a los
// demás usuarios), seteá TEST_EMAIL con el mail de un usuario registrado: se
// busca su nombre y apellido en la base para armar el saludo igual que en un
// envío real.
//   TEST_EMAIL=tu-mail@gmail.com npm run send-reminder

import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

const EMAIL_SUBJECT = '⚽ Prode Mundial 2026 - ¡Hoy arranca la última fecha de la fase de grupos!';

const EMAIL_BODY = `
¡Hoy arranca la última fecha de la fase de grupos! Después de estos partidos
ya se definen los clasificados a la fase eliminatoria, así que es tu última
chance de sumar puntos antes de que empiece la eliminación directa.

Si todavía no completaste tus pronósticos para esta fecha, hacelo ya: cada
partido cierra 1 hora antes de su inicio.

🆕 Ahora podés cambiar tu nombre y apellido como aparecen en el Ranking:
tocá el ícono de lápiz que está al lado de tu nombre, arriba a la derecha.

📊 Con esta fecha se cierra la fase de grupos: revisá el Ranking para ver
cómo quedás antes de que arranque la fase eliminatoria.

Ingresá en: https://prodemundial-2026-sm.up.railway.app

¡Vamos que se puede!
`.trim();

const main = async () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Falta configurar NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.error('Falta configurar GMAIL_USER y GMAIL_APP_PASSWORD');
    process.exit(1);
  }

  const TEST_EMAIL = process.env.TEST_EMAIL;

  // Usamos la REST API de Supabase (PostgREST) en vez de una conexión directa
  // a Postgres, para no depender de la conectividad IPv6 al host de la DB.
  const filter = TEST_EMAIL ? `&email=eq.${encodeURIComponent(TEST_EMAIL)}` : '';
  const usersRes = await fetch(`${SUPABASE_URL}/rest/v1/login_users?select=email,nombre,apellido${filter}`, {
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

  if (TEST_EMAIL && rows.length === 0) {
    console.error(`No se encontró ningún usuario registrado con el mail ${TEST_EMAIL}`);
    process.exit(1);
  }

  console.log(`Enviando recordatorio a ${rows.length} usuario(s)...`);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });

  for (const { email, nombre, apellido } of rows) {
    try {
      const fullName = [nombre, apellido].filter(Boolean).join(' ');
      await transporter.sendMail({
        from: `Prode Mundial 2026 <${GMAIL_USER}>`,
        to: email,
        subject: EMAIL_SUBJECT,
        text: `${fullName ? `¡Hola ${fullName}!\n\n` : ''}${EMAIL_BODY}`,
      });
      console.log(`✓ Enviado a: ${email}`);
    } catch (error) {
      console.error(`✗ Error con ${email}:`, error.message);
    }

    // Pequeña pausa para no saturar el SMTP de Gmail
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  process.exit(0);
};

main();
