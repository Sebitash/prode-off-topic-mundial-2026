import { query } from '../config/db.js';

function isGroupStage(stage) {
  const value = (stage || '').toLowerCase();
  return value.includes('group') || value.includes('grupo');
}

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
  const { match_id, predicted_home_score, predicted_away_score, predicted_penalty_winner } = req.body;

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
    const kickoff = new Date(match.match_date).getTime();
    const oneHourBeforeMs = kickoff - 60 * 60 * 1000;
    if (match.status !== 'scheduled' || Date.now() >= oneHourBeforeMs) {
      return res.status(400).json({ error: 'Las predicciones para este partido están cerradas (cierran 1 hora antes del inicio)' });
    }

    // El ganador de penales solo se pronostica si el resultado predicho es
    // empate en un partido de eliminatorias (en grupos no hay penales).
    let penaltyWinner = null;
    if (predicted_home_score === predicted_away_score && !isGroupStage(match.stage)) {
      if (predicted_penalty_winner !== 'home' && predicted_penalty_winner !== 'away') {
        return res.status(400).json({ error: 'Si predecís un empate en un partido de eliminatorias, elegí el ganador de la definición por penales' });
      }
      penaltyWinner = predicted_penalty_winner;
    }

    // Upsert: insertar o actualizar si ya existe
    const result = await query(
      `INSERT INTO predictions (user_id, match_id, predicted_home_score, predicted_away_score, predicted_penalty_winner)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, match_id)
       DO UPDATE SET
         predicted_home_score = EXCLUDED.predicted_home_score,
         predicted_away_score = EXCLUDED.predicted_away_score,
         predicted_penalty_winner = EXCLUDED.predicted_penalty_winner,
         updated_at = NOW()
       RETURNING *`,
      [userId, match_id, predicted_home_score, predicted_away_score, penaltyWinner]
    );

    res.status(201).json({ prediction: result.rows[0] });
  } catch (error) {
    console.error('upsertPrediction Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// DELETE /api/predictions/:matchId — borrar la predicción del usuario para un partido
export const deletePrediction = async (req, res) => {
  const userId = req.user.id;
  const { matchId } = req.params;

  try {
    const matchResult = await query('SELECT * FROM matches WHERE id = $1', [matchId]);

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Partido no encontrado' });
    }

    const match = matchResult.rows[0];
    const kickoff = new Date(match.match_date).getTime();
    const oneHourBeforeMs = kickoff - 60 * 60 * 1000;
    if (match.status !== 'scheduled' || Date.now() >= oneHourBeforeMs) {
      return res.status(400).json({ error: 'Las predicciones para este partido están cerradas (cierran 1 hora antes del inicio)' });
    }

    await query('DELETE FROM predictions WHERE user_id = $1 AND match_id = $2', [userId, matchId]);

    res.json({ success: true });
  } catch (error) {
    console.error('deletePrediction Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
