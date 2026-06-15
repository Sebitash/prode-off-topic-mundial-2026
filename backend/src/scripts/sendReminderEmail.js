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

const EMAIL_SUBJECT = '⚽ Recordatorio - Prode Mundial 2026: ¡cargá tus pronósticos!';

const EMAIL_BODY = `
El Mundial 2026 ya está en marcha y todavía estás a tiempo de cargar (o
completar) tus pronósticos para los próximos partidos del Prode.

🏆 Ya están definidos los premios para el top 3 del ranking final: mirá los
detalles en la pestaña de Ranking.

🆕 Hay una regla nueva para la fase eliminatoria: vas a sumar un punto extra
si acertás el marcador de uno de los dos equipos. Mirá el detalle completo en
la pestaña de Reglas.

👀 Además, en el Ranking podés tocar a cualquier participante para ver su
historial de pronósticos y el puntaje que sacó en cada partido.

🆕 También hay una nueva pestaña "Historial": ahí podés ver, partido por
partido, qué pronosticó cada participante y cuántos puntos sacó.

⏰ Recordá que las predicciones de cada partido se cierran 1 hora antes de su
inicio, ¡no te quedes sin pronosticar!

Ingresá en: https://prodemundial-2026-sm.up.railway.app

¡Suerte!
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
