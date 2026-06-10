import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-mundial-2026';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const isAdminEmail = (email) =>
  !!email && ADMIN_EMAILS.includes(email.toLowerCase());

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no provisto' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!isAdminEmail(req.user?.email)) {
    return res.status(403).json({ error: 'Acceso solo para administradores' });
  }
  next();
};
