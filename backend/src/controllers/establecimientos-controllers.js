import pool from '../config/db.config.js';

const getAllEstablecimientos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM establecimientos');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener todos los establecimientos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export { getAllEstablecimientos };