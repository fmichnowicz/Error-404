import pool from '../config/db.config.js';

const canchaModel = {
  obtenerTodas: async () => {
    const result = await pool.query(
      'SELECT * FROM canchas ORDER BY id'
    );
    return result.rows;
  },

  obtenerPorId: async (id) => {
    const result = await pool.query(
      'SELECT * FROM canchas WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }
};

export default canchaModel;