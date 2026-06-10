import { query } from '../config/db.js';

// GET /api/matches
export const getMatches = async (req, res) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT * FROM matches ORDER BY match_date ASC';
    const params = [];

    if (status) {
      sql = 'SELECT * FROM matches WHERE status = $1 ORDER BY match_date ASC';
      params.push(status);
    }

    const result = await query(sql, params);
    res.json({ matches: result.rows });
  } catch (error) {
    console.error('getMatches Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// GET /api/matches/:id
export const getMatchById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM matches WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Partido no encontrado' });
    }

    res.json({ match: result.rows[0] });
  } catch (error) {
    console.error('getMatchById Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// GET /api/matches/groups
export const getGroups = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        group_letter,
        json_agg(
          json_build_object(
            'id', id,
            'name', name,
            'code', code,
            'flag_emoji', flag_emoji,
            'played', played,
            'won', won,
            'drawn', drawn,
            'lost', lost,
            'goals_for', goals_for,
            'goals_against', goals_against,
            'points', points
          ) ORDER BY points DESC, (goals_for - goals_against) DESC
        ) as teams
      FROM teams_simple
      GROUP BY group_letter
      ORDER BY group_letter ASC
    `);
    
    // Transformar la respuesta para que sea compatible con el frontend
    const groups = result.rows.map(row => ({
      id: `group-${row.group_letter}`,
      group_letter: row.group_letter,
      name: `Grupo ${row.group_letter}`,
      teams: row.teams || []
    }));
    
    res.json({ groups });
  } catch (error) {
    console.error('getGroups Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// GET /api/groups/teams (alternativa usando teams_simple)
export const getGroupsSimple = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        group_letter,
        json_agg(
          json_build_object(
            'id', id,
            'name', name,
            'code', code,
            'flag_emoji', flag_emoji,
            'played', played,
            'won', won,
            'drawn', drawn,
            'lost', lost,
            'goals_for', goals_for,
            'goals_against', goals_against,
            'points', points
          ) ORDER BY points DESC, (goals_for - goals_against) DESC
        ) as teams
      FROM teams_simple
      GROUP BY group_letter
      ORDER BY group_letter ASC
    `);
    res.json({ groups: result.rows });
  } catch (error) {
    console.error('getGroupsSimple Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// PATCH /api/matches/:id/result (solo admin)
export const updateMatchResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { home_score, away_score, home_penalties, away_penalties } = req.body;

    const matchResult = await query('SELECT * FROM matches WHERE id = $1', [id]);
    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Partido no encontrado' });
    }

    // Sin resultado: volver a 'scheduled' y dejar el partido vacío
    if (home_score === null && away_score === null) {
      const updated = await query(
        `UPDATE matches
         SET home_score = NULL, away_score = NULL, home_penalties = NULL, away_penalties = NULL, status = 'scheduled', updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [id]
      );
      await query('UPDATE predictions SET points = 0, updated_at = NOW() WHERE match_id = $1', [id]);
      return res.json({ match: updated.rows[0] });
    }

    if (
      !Number.isInteger(home_score) || !Number.isInteger(away_score) ||
      home_score < 0 || away_score < 0
    ) {
      return res.status(400).json({ error: 'home_score y away_score deben ser números enteros >= 0' });
    }

    // Penales: solo tienen sentido si el partido terminó empatado y deben tener un ganador
    let penaltiesHome = null;
    let penaltiesAway = null;
    if (home_penalties !== undefined && home_penalties !== null && away_penalties !== undefined && away_penalties !== null) {
      if (home_score !== away_score) {
        return res.status(400).json({ error: 'Los penales solo aplican si el partido terminó empatado' });
      }
      if (
        !Number.isInteger(home_penalties) || !Number.isInteger(away_penalties) ||
        home_penalties < 0 || away_penalties < 0 || home_penalties === away_penalties
      ) {
        return res.status(400).json({ error: 'home_penalties y away_penalties deben ser números enteros >= 0 y distintos entre sí' });
      }
      penaltiesHome = home_penalties;
      penaltiesAway = away_penalties;
    }

    // Guardar resultado y marcar como finalizado: el trigger calcula los puntos
    // (2 pts por acertar el ganador —el de los penales si hubo definición— + 1 pt extra por resultado exacto)
    const updated = await query(
      `UPDATE matches
       SET home_score = $1, away_score = $2, home_penalties = $3, away_penalties = $4, status = 'finished', updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [home_score, away_score, penaltiesHome, penaltiesAway, id]
    );

    res.json({ match: updated.rows[0] });
  } catch (error) {
    console.error('updateMatchResult Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// GET /api/matches/teams
export const getTeams = async (req, res) => {
  try {
    const result = await query('SELECT * FROM teams ORDER BY name ASC');
    res.json({ teams: result.rows });
  } catch (error) {
    console.error('getTeams Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
