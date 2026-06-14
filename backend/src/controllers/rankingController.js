import { query } from '../config/db.js';

// GET /api/ranking
export const getRanking = async (req, res) => {
  try {
    const result = await query(
      `SELECT
         lu.id as user_id,
         lu.nombre,
         lu.apellido,
         lu.email,
         COALESCE(SUM(p.points), 0) as total_points,
         COUNT(p.id) as total_predictions,
         COALESCE(SUM(CASE WHEN p.points IN (1, 3) THEN 1 ELSE 0 END), 0) as exact_scores,
         COALESCE(SUM(CASE WHEN p.points IN (2, 3) THEN 1 ELSE 0 END), 0) as correct_results
       FROM login_users lu
       LEFT JOIN predictions p ON lu.id = p.user_id
       GROUP BY lu.id, lu.nombre, lu.apellido, lu.email
       ORDER BY total_points DESC, exact_scores DESC, total_predictions DESC
       LIMIT 50`
    );

    res.json({ ranking: result.rows });
  } catch (error) {
    console.error('getRanking Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
