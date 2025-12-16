import pool from '../config/db.config.js';

const getAllReservas = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reservas');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener todos las reservas', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getReservaById = async (req, res) => {
  try {
    // Extraemos datos del body
    const { id } = req.params;

    // Hacemos la query con parámetros
    const result = await pool.query('SELECT * FROM reservas WHERE id = $1', [id]);

    // Chequeamos que la query devuelva algo
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error al obtener la reserva por ID:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export { getAllReservas, getReservaById };