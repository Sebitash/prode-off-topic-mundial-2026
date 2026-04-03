import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-mundial-2026';

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
