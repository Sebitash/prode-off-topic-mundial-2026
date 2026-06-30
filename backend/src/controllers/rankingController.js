import { query } from '../config/db.js';

// GET /api/ranking
export const getRanking = async (req, res) => {
  try {
    const result = await query(
      `WITH last_batch AS (
         SELECT id FROM matches
         WHERE status = 'finished'
           AND updated_at >= (SELECT MAX(updated_at) FROM matches WHERE status = 'finished') - INTERVAL '10 minutes'
       ),
       user_points AS (
         SELECT
           lu.id as user_id,
           lu.nombre,
           lu.apellido,
           lu.email,
           COALESCE(SUM(p.points), 0) as total_points,
           COALESCE(SUM(CASE WHEN LOWER(m.stage) LIKE '%group%' OR LOWER(m.stage) LIKE '%grupo%' THEN p.points ELSE 0 END), 0) as group_points,
           COALESCE(SUM(CASE WHEN m.stage IS NOT NULL AND NOT (LOWER(m.stage) LIKE '%group%' OR LOWER(m.stage) LIKE '%grupo%') THEN p.points ELSE 0 END), 0) as knockout_points,
           COUNT(p.id) as total_predictions,
           COALESCE(SUM(CASE WHEN p.points IN (3, 5) THEN 1 ELSE 0 END), 0) as exact_scores,
           COALESCE(SUM(CASE WHEN p.points IN (1, 4) THEN 1 ELSE 0 END), 0) as score_bonus,
           COALESCE(SUM(CASE WHEN p.points >= 2 THEN 1 ELSE 0 END), 0) as correct_results,
           COALESCE(SUM(
             CASE WHEN p.match_id NOT IN (SELECT id FROM last_batch) THEN p.points ELSE 0 END
           ), 0) as prev_total_points,
           COALESCE(SUM(
             CASE WHEN p.match_id NOT IN (SELECT id FROM last_batch)
               THEN CASE WHEN p.points IN (3, 5) THEN 1 ELSE 0 END
             ELSE 0 END
           ), 0) as prev_exact_scores,
           COALESCE(SUM(
             CASE WHEN p.match_id NOT IN (SELECT id FROM last_batch)
               THEN CASE WHEN p.points IN (1, 4) THEN 1 ELSE 0 END
             ELSE 0 END
           ), 0) as prev_score_bonus,
           COUNT(CASE WHEN p.match_id NOT IN (SELECT id FROM last_batch)
             THEN p.id END) as prev_total_predictions
         FROM login_users lu
         LEFT JOIN predictions p ON lu.id = p.user_id
         LEFT JOIN matches m ON p.match_id = m.id
         GROUP BY lu.id, lu.nombre, lu.apellido, lu.email
       ),
       ranked AS (
         SELECT
           *,
           ROW_NUMBER() OVER (
             ORDER BY total_points DESC, exact_scores DESC, score_bonus DESC, total_predictions DESC
           ) as current_rank,
           ROW_NUMBER() OVER (
             ORDER BY prev_total_points DESC, prev_exact_scores DESC, prev_score_bonus DESC, prev_total_predictions DESC
           ) as previous_rank
         FROM user_points
       )
       SELECT
         user_id,
         nombre,
         apellido,
         email,
         total_points,
         group_points,
         knockout_points,
         total_predictions,
         exact_scores,
         score_bonus,
         correct_results,
         (previous_rank - current_rank)::integer as rank_change
       FROM ranked
       ORDER BY current_rank`
    );

    res.json({ ranking: result.rows });
  } catch (error) {
    console.error('getRanking Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
