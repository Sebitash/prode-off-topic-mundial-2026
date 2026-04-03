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
    const result = await query('SELECT * FROM groups ORDER BY code ASC');
    res.json({ groups: result.rows });
  } catch (error) {
    console.error('getGroups Error:', error);
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
