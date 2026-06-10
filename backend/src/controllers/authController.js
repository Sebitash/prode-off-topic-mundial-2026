import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-mundial-2026';
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

export const signup = async (req, res) => {
  const { nombre, apellido, email, password } = req.body;

  try {
    // 1. Validations
    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
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
      'INSERT INTO login_users (nombre, apellido, email, password) VALUES ($1, $2, $3, $4) RETURNING id, email, nombre, apellido',
      [nombre, apellido, email, hashedPassword]
    );

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

  if (!SUPABASE_JWT_SECRET) {
    console.error('Google Auth Error: falta configurar SUPABASE_JWT_SECRET');
    return res.status(500).json({ error: 'Login con Google no está configurado en el servidor' });
  }

  try {
    let payload;
    try {
      payload = jwt.verify(access_token, SUPABASE_JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Token de Google inválido o expirado' });
    }

    const email = payload.email;
    const googleId = payload.sub;

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
        'INSERT INTO login_users (nombre, apellido, email, password, google_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, nombre, apellido',
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
      },
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
