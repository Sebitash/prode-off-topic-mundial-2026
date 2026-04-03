import { query } from '../config/db.js';

// GET /api/predictions — predicciones del usuario autenticado
export const getUserPredictions = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT p.*, m.home_team, m.away_team, m.match_date, m.status, m.home_score, m.away_score, m.stage
       FROM predictions p
       JOIN matches m ON p.match_id = m.id
       WHERE p.user_id = $1
       ORDER BY m.match_date ASC`,
      [userId]
    );

    res.json({ predictions: result.rows });
  } catch (error) {
    console.error('getUserPredictions Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// POST /api/predictions — crear o actualizar predicción
export const upsertPrediction = async (req, res) => {
  const userId = req.user.id;
  const { match_id, predicted_home_score, predicted_away_score } = req.body;

  try {
    if (!match_id || predicted_home_score === undefined || predicted_away_score === undefined) {
      return res.status(400).json({ error: 'match_id, predicted_home_score y predicted_away_score son obligatorios' });
    }

    // Verificar que el partido exista y sea predecible (status = scheduled)
    const matchResult = await query(
      'SELECT * FROM matches WHERE id = $1',
      [match_id]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Partido no encontrado' });
    }

    const match = matchResult.rows[0];
    if (match.status !== 'scheduled') {
      return res.status(400).json({ error: 'No se puede modificar la predicción de un partido que ya inició o terminó' });
    }

    // Upsert: insertar o actualizar si ya existe
    const result = await query(
      `INSERT INTO predictions (user_id, match_id, predicted_home_score, predicted_away_score)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, match_id)
       DO UPDATE SET
         predicted_home_score = EXCLUDED.predicted_home_score,
         predicted_away_score = EXCLUDED.predicted_away_score,
         updated_at = NOW()
       RETURNING *`,
      [userId, match_id, predicted_home_score, predicted_away_score]
    );

    res.status(201).json({ prediction: result.rows[0] });
  } catch (error) {
    console.error('upsertPrediction Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
