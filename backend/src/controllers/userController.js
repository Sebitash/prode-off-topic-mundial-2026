import { query } from '../config/db.js';
import { isAdminEmail } from '../middleware/auth.js';

// GET /api/user/me — datos del usuario autenticado + sus stats
export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const userResult = await query(
      `SELECT
         u.id, u.nombre, u.apellido, u.email, u.theme, u.created_at,
         COUNT(p.id) as total_predictions,
         COALESCE(SUM(p.points), 0) as total_points
       FROM login_users u
       LEFT JOIN predictions p ON p.user_id = u.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { total_predictions, total_points, ...user } = userResult.rows[0];

    res.json({
      user: {
        ...user,
        total_predictions: parseInt(total_predictions),
        total_points: parseInt(total_points),
        is_admin: isAdminEmail(user.email),
      }
    });
  } catch (error) {
    console.error('getMe Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// PATCH /api/user/theme — actualiza la preferencia de tema (light/dark) del usuario
export const updateTheme = async (req, res) => {
  try {
    const userId = req.user.id;
    const { theme } = req.body;

    if (theme !== 'light' && theme !== 'dark') {
      return res.status(400).json({ error: 'El tema debe ser "light" o "dark"' });
    }

    await query('UPDATE login_users SET theme = $1 WHERE id = $2', [theme, userId]);

    res.json({ theme });
  } catch (error) {
    console.error('updateTheme Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
