import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../config/db.js';
import { isAdminEmail } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-mundial-2026';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Crea (si no existe) el usuario en Supabase Auth para que pueda usar
// "Olvidé mi contraseña" (Supabase solo manda el mail de recuperación
// a usuarios que existen en auth.users).
const ensureSupabaseAuthUser = async (email) => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return;

  try {
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

    if (!res.ok && res.status !== 422) {
      const body = await res.json().catch(() => ({}));
      console.error('ensureSupabaseAuthUser Error:', body);
    }
  } catch (error) {
    console.error('ensureSupabaseAuthUser Error:', error);
  }
};

// Calcula la edad en años a partir de una fecha de nacimiento (YYYY-MM-DD)
const getAge = (birthDateStr) => {
  const birthDate = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const signup = async (req, res) => {
  const { nombre, apellido, email, password, fecha_nacimiento } = req.body;

  try {
    // 1. Validations
    if (!nombre || !apellido || !email || !password || !fecha_nacimiento) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    if (Number.isNaN(new Date(fecha_nacimiento).getTime())) {
      return res.status(400).json({ error: 'La fecha de nacimiento no es válida' });
    }

    if (getAge(fecha_nacimiento) < 18) {
      return res.status(400).json({ error: 'Debes ser mayor de 18 años para registrarte' });
    }

    // 2. Check if user exists
    const existingUser = await query('SELECT * FROM login_users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Insert user
    const newUser = await query(
      'INSERT INTO login_users (nombre, apellido, email, password, birth_date) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, nombre, apellido',
      [nombre, apellido, email, hashedPassword, fecha_nacimiento]
    );

    // 5. Crear el usuario también en Supabase Auth (para "Olvidé mi contraseña")
    await ensureSupabaseAuthUser(email);

    res.status(201).json({
      message: 'Usuario registrado con éxito',
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user
    const result = await query('SELECT * FROM login_users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        theme: user.theme,
        is_admin: isAdminEmail(user.email),
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const googleAuth = async (req, res) => {
  const { access_token } = req.body;

  if (!access_token) {
    return res.status(400).json({ error: 'access_token requerido' });
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Google Auth Error: falta configurar NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return res.status(500).json({ error: 'Login con Google no está configurado en el servidor' });
  }

  try {
    const supabaseUserRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        apikey: SUPABASE_ANON_KEY,
      },
    });

    if (!supabaseUserRes.ok) {
      return res.status(401).json({ error: 'Token de Google inválido o expirado' });
    }

    const payload = await supabaseUserRes.json();
    const email = payload.email;
    const googleId = payload.id;

    if (!email) {
      return res.status(400).json({ error: 'No se pudo obtener el email de la cuenta de Google' });
    }

    const metadata = payload.user_metadata || {};
    const fullName = (metadata.full_name || metadata.name || '').trim();
    const [first, ...restNames] = fullName.split(/\s+/).filter(Boolean);
    const nombre = first || 'Usuario';
    const apellido = restNames.join(' ') || 'Google';

    const result = await query('SELECT * FROM login_users WHERE email = $1', [email]);
    let user = result.rows[0];

    if (!user) {
      const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);
      const inserted = await query(
        'INSERT INTO login_users (nombre, apellido, email, password, google_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, nombre, apellido, theme',
        [nombre, apellido, email, randomPassword, googleId]
      );
      user = inserted.rows[0];
    } else if (!user.google_id) {
      await query('UPDATE login_users SET google_id = $1 WHERE id = $2', [googleId, user.id]);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login con Google exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        theme: user.theme,
        is_admin: isAdminEmail(user.email),
      },
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// POST /api/auth/reset-password — actualizar la contraseña tras el flujo de
// recuperación de Supabase (recibe el access_token de la sesión de recovery)
export const resetPassword = async (req, res) => {
  const { access_token, new_password } = req.body;

  if (!access_token || !new_password) {
    return res.status(400).json({ error: 'access_token y new_password son obligatorios' });
  }

  if (new_password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Reset Password Error: falta configurar NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return res.status(500).json({ error: 'La recuperación de contraseña no está configurada en el servidor' });
  }

  try {
    const supabaseUserRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        apikey: SUPABASE_ANON_KEY,
      },
    });

    if (!supabaseUserRes.ok) {
      return res.status(401).json({ error: 'La sesión de recuperación es inválida o expiró' });
    }

    const payload = await supabaseUserRes.json();
    const email = payload.email;

    if (!email) {
      return res.status(400).json({ error: 'No se pudo obtener el email de la cuenta' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    const result = await query(
      'UPDATE login_users SET password = $1 WHERE email = $2 RETURNING id, email, nombre, apellido',
      [hashedPassword, email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No existe una cuenta con este email' });
    }

    res.json({ message: 'Contraseña actualizada con éxito' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
