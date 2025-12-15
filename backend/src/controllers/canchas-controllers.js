import pool from '../config/db.config.js';

const getAllCanchas = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM canchas');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener todas las canchas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getCanchaById = async (req, res) => {
  try {
    // Extraemos datos del body
    const { id } = req.params;

    // Hacemos la query con parámetros
    const result = await pool.query('SELECT * FROM canchas WHERE id = $1', [id]);

    // Chequeamos que la query devuelva algo
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Cancha no encontrada' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error al obtener la cancha por ID:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createCancha = async (req, res) => {
  try {
    // Extraemos datos del body
    const {
      nombre,
      deporte,
      establecimiento_id,
      precio_hora,
      descripcion,
      superficie,
      iluminacion,
      cubierta
    } = req.body;

    // Validamos campos obligatorios
    if (!nombre || !deporte || !establecimiento_id || !precio_hora || !superficie) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Validamos precio_hora > 0
    const precio = parseFloat(precio_hora);
    if (isNaN(precio) || precio <= 0) {
      return res.status(400).json({ error: 'El precio_hora debe ser un número mayor que 0' });
    }

    // Query segura con parámetros preparados
    const query = `
      INSERT INTO canchas 
      (nombre, deporte, establecimiento_id, precio_hora, descripcion, superficie, iluminacion, cubierta)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const values = [
      nombre,
      deporte,
      establecimiento_id,
      precio,                    // Usamos el valor ya convertido a número
      descripcion || null,
      superficie,
      iluminacion ?? false,
      cubierta ?? false
    ];

    const result = await pool.query(query, values);

    // Respuesta exitosa
    res.status(201).json({
      message: 'Cancha creada exitosamente',
      cancha: result.rows[0]
    });

  } catch (error) {
    console.error('Error al crear cancha:', error);

    // Manejo de error específico: clave foránea inválida (ej: establecimiento_id no existe)
    if (error.code === '23503') {
      return res.status(400).json({ error: 'El establecimiento_id proporcionado no existe' });
    }

    // Error genérico del servidor
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export { getAllCanchas, getCanchaById, createCancha };