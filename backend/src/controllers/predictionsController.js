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

// GET /api/predictions/user/:userId — predicciones de cualquier usuario para
// partidos ya cerrados o finalizados (para verlas en el ranking)
export const getPredictionsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await query(
      `SELECT p.*, m.home_team, m.away_team, m.match_date, m.status, m.home_score, m.away_score, m.stage
       FROM predictions p
       JOIN matches m ON p.match_id = m.id
       WHERE p.user_id = $1
         AND (m.status = 'finished' OR m.match_date <= NOW() + INTERVAL '1 hour')
       ORDER BY m.match_date ASC`,
      [userId]
    );

    res.json({ predictions: result.rows });
  } catch (error) {
    console.error('getPredictionsByUserId Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// GET /api/predictions/history — predicciones de todos los participantes para
// los partidos ya finalizados, agrupadas por partido (para la pestaña de Historial)
export const getMatchHistory = async (req, res) => {
  try {
    const result = await query(
      `SELECT m.id as match_id, m.home_team, m.away_team, m.home_score, m.away_score,
              m.home_penalties, m.away_penalties, m.match_date, m.stage,
              p.user_id, p.predicted_home_score, p.predicted_away_score,
              p.predicted_penalty_winner, p.points, lu.nombre, lu.apellido
       FROM matches m
       JOIN predictions p ON p.match_id = m.id
       JOIN login_users lu ON lu.id = p.user_id
       WHERE m.status = 'finished'
       ORDER BY m.match_date DESC, p.points DESC, lu.nombre ASC`
    );

    const matches = [];
    const matchesById = new Map();

    for (const row of result.rows) {
      let match = matchesById.get(row.match_id);
      if (!match) {
        match = {
          id: row.match_id,
          home_team: row.home_team,
          away_team: row.away_team,
          home_score: row.home_score,
          away_score: row.away_score,
          home_penalties: row.home_penalties,
          away_penalties: row.away_penalties,
          match_date: row.match_date,
          stage: row.stage,
          predictions: [],
        };
        matchesById.set(row.match_id, match);
        matches.push(match);
      }

      match.predictions.push({
        user_id: row.user_id,
        nombre: row.nombre,
        apellido: row.apellido,
        predicted_home_score: row.predicted_home_score,
        predicted_away_score: row.predicted_away_score,
        predicted_penalty_winner: row.predicted_penalty_winner,
        points: row.points,
      });
    }

    res.json({ matches });
  } catch (error) {
    console.error('getMatchHistory Error:', error);
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
