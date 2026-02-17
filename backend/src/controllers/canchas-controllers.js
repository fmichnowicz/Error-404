import pool from '../config/db.config.js';

const getAllCanchas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id, 
        c.nombre AS nombre_cancha, 
        c.deporte, 
        c.superficie, 
        c.precio_hora, 
        c.descripcion, 
        c.iluminacion, 
        c.cubierta, 
        c.establecimiento_id, 
        e.nombre AS nombre_establecimiento, 
        e.barrio 
        FROM canchas c 
        JOIN establecimientos e ON c.establecimiento_id = e.id 
        ORDER BY c.precio_hora, e.nombre, c.deporte, c.nombre
      `);
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
    const {
      nombre,
      deporte,
      establecimiento_id,
      precio_hora,
      descripcion, // opcional
      superficie,
      iluminacion = false,
      cubierta = false
    } = req.body;

    const errores = [];

    // === VALIDACIONES BÁSICAS ===

    // deporte
    if (!deporte || typeof deporte !== 'string' || deporte.trim() === '') {
      errores.push('El deporte es obligatorio y no puede estar vacío');
    } else if (deporte.trim().length > 15) {
      errores.push('El deporte no puede exceder los 15 caracteres');
    }

    // superficie
    if (!superficie || typeof superficie !== 'string' || superficie.trim() === '') {
      errores.push('La superficie es obligatoria y no puede estar vacía');
    } else if (superficie.trim().length > 50) {
      errores.push('El comentario para superficie no puede exceder los 50 caracteres');
    }

    // precio_hora → ahora entero positivo
    if (precio_hora === undefined || precio_hora === null) {
      errores.push('El precio_hora es obligatorio');
    } else {
      const precio = parseInt(precio_hora, 10);
      if (isNaN(precio) || precio <= 0 || !Number.isInteger(precio)) {
        errores.push('El precio_hora debe ser un número entero positivo');
      }
    }

    // establecimiento_id → obligatorio y entero positivo
    if (establecimiento_id === undefined || establecimiento_id === null) {
      errores.push('El establecimiento_id es obligatorio');
    } else {
      const estId = parseInt(establecimiento_id, 10);
      if (isNaN(estId) || estId <= 0 || !Number.isInteger(estId)) {
        errores.push('El establecimiento_id debe ser un número entero positivo');
      }
    }

    // iluminacion y cubierta
    if (iluminacion !== undefined && typeof iluminacion !== 'boolean') {
      errores.push('iluminacion debe ser true o false');
    }
    if (cubierta !== undefined && typeof cubierta !== 'boolean') {
      errores.push('cubierta debe ser true o false');
    }

    // descripcion (opcional)
    if (descripcion !== undefined && descripcion !== null && typeof descripcion !== 'string') {
      errores.push('La descripcion debe ser un texto o null');
    } else if (descripcion !== undefined && descripcion !== null) {
      const descTrim = descripcion.trim();
      if (descTrim.length > 100) {
        errores.push('La descripción no puede exceder los 100 caracteres');
      }
    }

    if (errores.length > 0) {
      return res.status(400).json({
        error: 'Errores de validación',
        detalles: errores
      });
    }

    const deporteTrim = deporte.trim();
    const estId = parseInt(establecimiento_id, 10);
    const precio = parseInt(precio_hora, 10);

    // === VALIDACIÓN: DEPORTE PERMITIDO ===
    const deportesPermitidos = [
      'Pádel', 'Fútbol 4', 'Fútbol 5', 'Fútbol 6', 'Fútbol 7',
      'Fútbol 8', 'Fútbol 9', 'Fútbol 10', 'Fútbol 11',
      'Tenis', 'Básquet 3v3', 'Básquet 5v5', 'Vóley', 'Handball'
    ];

    if (!deportesPermitidos.includes(deporteTrim)) {
      return res.status(400).json({
        error: 'Deporte no permitido',
        detalles: `El deporte debe ser uno de: ${deportesPermitidos.join(', ')}`
      });
    }

    // === VALIDACIÓN Y CÁLCULO DEL NOMBRE ===
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      errores.push('El nombre es obligatorio');
    } else {
      const nombreTrim = nombre.trim();

      const match = nombreTrim.match(/^Cancha (\d+)$/);
      if (!match) {
        errores.push('El nombre debe ser exactamente "Cancha N" donde N es un número entero positivo (ej: Cancha 1, Cancha 15)');
      } else {
        const numeroEnviado = parseInt(match[1], 10);

        const queryUltimoNumero = `
          SELECT MAX(CAST(SUBSTRING(nombre FROM 'Cancha (\\d+)') AS INTEGER)) AS max_num
          FROM canchas
          WHERE establecimiento_id = $1
            AND deporte = $2
            AND nombre LIKE 'Cancha %';
        `;

        const { rows: [row] } = await pool.query(queryUltimoNumero, [estId, deporteTrim]);
        const ultimoNumero = row.max_num ? parseInt(row.max_num, 10) : 0;
        const numeroEsperado = ultimoNumero + 1;

        if (numeroEnviado !== numeroEsperado) {
          errores.push(
            `El nombre debe ser "Cancha ${numeroEsperado}" (el siguiente disponible para ${deporteTrim} en este establecimiento)`
          );
        }
      }
    }

    if (errores.length > 0) {
      return res.status(400).json({
        error: 'Errores de validación',
        detalles: errores
      });
    }

    const nombreFinal = nombre.trim();

    // === Verificamos que el establecimiento exista ===
    const { rowCount: estExiste } = await pool.query(
      'SELECT 1 FROM establecimientos WHERE id = $1',
      [estId]
    );

    if (estExiste === 0) {
      return res.status(400).json({ error: 'El establecimiento_id proporcionado no existe' });
    }

    // === Insert final ===
    const insertQuery = `
      INSERT INTO canchas 
      (nombre, deporte, establecimiento_id, precio_hora, descripcion, superficie, iluminacion, cubierta)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const values = [
      nombreFinal,
      deporteTrim,
      estId,
      precio,
      descripcion ? descripcion.trim() || null : null,
      superficie.trim(),
      iluminacion,
      cubierta
    ];

    const { rows } = await pool.query(insertQuery, values);

    res.status(201).json({
      message: 'Cancha creada exitosamente',
      cancha: rows[0]
    });

  } catch (error) {
    console.error('Error al crear cancha:', error);
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Referencia inválida (foreign key)' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateCancha = async (req, res) => {
  const { id } = req.params;

  const canchaId = parseInt(id, 10);
  if (isNaN(canchaId) || canchaId <= 0) {
    return res.status(400).json({ error: 'ID de cancha inválido' });
  }

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

  const errores = [];

  // === RECHAZAR CAMPOS NO MODIFICABLES ===
  if (nombre !== undefined) {
    errores.push('No se puede modificar el nombre de la cancha');
  }
  if (deporte !== undefined) {
    errores.push('No se puede modificar el deporte de la cancha');
  }
  if (establecimiento_id !== undefined) {
    errores.push('No se puede modificar el establecimiento_id de la cancha');
  }

  if (errores.length > 0) {
    return res.status(400).json({
      error: 'Campos no permitidos para modificación',
      detalles: errores
    });
  }

  const setParts = [];
  const values = [];
  let paramIndex = 1;

  // Helper para validar y agregar campos modificables
  const validarYAgregar = (campo, valor, reglas) => {
    if (valor === undefined) return;

    if (reglas.string && typeof valor !== 'string') {
      errores.push(`El campo ${campo} debe ser texto`);
      return;
    }

    if (reglas.maxLength && valor.length > reglas.maxLength) {
      errores.push(`El campo ${campo} no puede exceder ${reglas.maxLength} caracteres`);
      return;
    }

    let valorProcesado = reglas.trim && typeof valor === 'string' ? valor.trim() : valor;

    if (reglas.number && (isNaN(valor) || typeof valor !== 'number')) {
      errores.push(`El campo ${campo} debe ser un número`);
      return;
    }

    if (reglas.integer && !Number.isInteger(valor)) {
      errores.push(`El campo ${campo} debe ser un número entero`);
      return;
    }

    if (reglas.positive && valor <= 0) {
      errores.push(`El campo ${campo} debe ser mayor a 0`);
      return;
    }

    if (reglas.boolean && typeof valor !== 'boolean') {
      errores.push(`El campo ${campo} debe ser true o false`);
      return;
    }

    setParts.push(`${campo} = $${paramIndex++}`);
    values.push(valorProcesado);
  };

  // Validaciones para campos permitidos
  validarYAgregar('precio_hora', precio_hora, { number: true, integer: true, positive: true });
  validarYAgregar('descripcion', descripcion, { string: true, trim: true, maxLength: 100 });
  validarYAgregar('superficie', superficie, { string: true, trim: true, maxLength: 50 });
  validarYAgregar('iluminacion', iluminacion, { boolean: true });
  validarYAgregar('cubierta', cubierta, { boolean: true });

  // Si hay errores de validación
  if (errores.length > 0) {
    return res.status(400).json({ error: 'Errores de validación', detalles: errores });
  }

  // Si no se envió ningún campo modificable
  if (setParts.length === 0) {
    return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
  }

  // Agregar el WHERE
  values.push(canchaId);

  const query = `
    UPDATE canchas
    SET ${setParts.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *;
  `;

  try {
    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cancha no encontrada' });
    }

    res.json({
      message: 'Cancha actualizada exitosamente',
      cancha: rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar cancha:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deleteCancha = async (req, res) => {
  const { id } = req.params;

  try {
    // Validamos que el ID sea un número entero positivo
    const canchaId = parseInt(id, 10);
    if (isNaN(canchaId) || canchaId <= 0) {
      return res.status(400).json({
        error: 'ID de cancha inválido',
        detalles: 'El ID debe ser un número entero positivo'
      });
    }

    // Contador de reservas y usuarios y delete de cancha
    // 1. Contamos reservas y usuarios afectados antes de borrar
    // 2. Eliminamos la cancha y sus reservas asociadas
    // 3. Devolvemos la cancha eliminada
    const deleteQuery = `
      WITH info_previa AS (
        SELECT 
          COUNT(*) AS total_reservas,
          COUNT(DISTINCT usuario_id) AS usuarios_afectados
        FROM reservas
        WHERE cancha_id = $1
      ),
      cancha_eliminada AS (
        DELETE FROM canchas
        WHERE id = $1
        RETURNING *
      )
      SELECT 
        cancha_eliminada.*,
        COALESCE(info_previa.total_reservas, 0)::INTEGER AS reservas_eliminadas,
        COALESCE(info_previa.usuarios_afectados, 0)::INTEGER AS usuarios_afectados
      FROM cancha_eliminada
      LEFT JOIN info_previa ON true;
    `;

    const { rows } = await pool.query(deleteQuery, [canchaId]);

    // Si no se eliminó ninguna cancha → no existe
    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Cancha no encontrada',
        detalles: `No existe una cancha con id ${canchaId}`
      });
    }

    const canchaEliminada = rows[0];
    const reservasEliminadas = canchaEliminada.reservas_eliminadas;
    const usuariosAfectados = canchaEliminada.usuarios_afectados;

    res.status(200).json({
      message: 'Cancha eliminada exitosamente',
      cancha: {
        id: canchaEliminada.id,
        nombre: canchaEliminada.nombre,
      },
      resumen_eliminacion: {
        reservas_eliminadas: reservasEliminadas,
        usuarios_afectados: usuariosAfectados,
        detalles: `Se eliminaron ${reservasEliminadas} reserva${reservasEliminadas === 1 ? '' : 's'} `
                + `afectando a ${usuariosAfectados} usuario${usuariosAfectados === 1 ? '' : 's'} distinto${usuariosAfectados === 1 ? '' : 's'}`
      }
    });

  } catch (error) {
    console.error('Error al eliminar cancha:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener el próximo número de cancha para un establecimiento y deporte
const getNextCanchaNumber = async (req, res) => {
  const { establecimiento_id, deporte } = req.query;

  if (!establecimiento_id || !deporte) {
    return res.status(400).json({ error: 'Faltan parámetros: establecimiento_id y deporte son requeridos' });
  }

  const estId = parseInt(establecimiento_id, 10);
  if (isNaN(estId) || estId <= 0) {
    return res.status(400).json({ error: 'establecimiento_id debe ser un número entero positivo' });
  }

  try {
    const query = `
      SELECT MAX(CAST(SUBSTRING(nombre FROM 'Cancha (\\d+)') AS INTEGER)) AS max_num
      FROM canchas
      WHERE establecimiento_id = $1
      AND deporte = $2
      AND nombre LIKE 'Cancha %';
    `;

    const { rows: [row] } = await pool.query(query, [estId, deporte.trim()]);
    const ultimoNumero = row.max_num ? parseInt(row.max_num, 10) : 0;
    const nextNumber = ultimoNumero + 1;

    res.json({ nextNumber, nombreSugerido: `Cancha ${nextNumber}` });
  } catch (error) {
    console.error('Error al calcular próximo número de cancha:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
// Ejemplo de uso http://localhost:3000/canchas/next-cancha?establecimiento_id=1&deporte=Fútbol%205

export { getAllCanchas, getCanchaById, createCancha, updateCancha, deleteCancha, getNextCanchaNumber };