import { query } from '../config/db.js';

// GET /api/user/me — datos del usuario autenticado + sus stats
export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const userResult = await query(
      'SELECT id, nombre, apellido, email, created_at FROM login_users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = userResult.rows[0];

    // Stats del usuario
    const statsResult = await query(
      `SELECT
         COUNT(p.id) as total_predictions,
         COALESCE(SUM(p.points), 0) as total_points
       FROM predictions p
       WHERE p.user_id = $1`,
      [userId]
    );

    const stats = statsResult.rows[0];

    res.json({
      user: {
        ...user,
        total_predictions: parseInt(stats.total_predictions),
        total_points: parseInt(stats.total_points),
      }
    });
  } catch (error) {
    console.error('getMe Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
