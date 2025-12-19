import pool from '../config/db.config.js';

const getAllEstablecimientos = async (req, res) => {
  try {
    const result = await pool.query("" +
      'SELECT id, nombre, barrio, torneo ' +
      'FROM establecimientos ' +
      'ORDER BY nombre'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener todos los establecimientos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getEstablecimientoById = async (req, res) => {
  try {
    // Extraemos datos del body
    const { id } = req.params;

    // Hacemos la query con parámetros
    const result = await pool.query('SELECT * FROM establecimientos WHERE id = $1', [id]);

    // Chequeamos que la query devuelva algo
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Establecimiento no encontrada' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error al obtener el establecimiento por ID:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createEstablecimiento = async (req, res) => {
  try {
    const { nombre, barrio, torneo } = req.body;

    const errores = [];

    // === VALIDACIONES BÁSICAS ===
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      errores.push('El nombre es obligatorio y no puede estar vacío');
    } else if (nombre.trim().length > 250) {
      errores.push('El nombre no puede exceder los 250 caracteres');
    }

    if (!barrio || typeof barrio !== 'string' || barrio.trim() === '') {
      errores.push('El barrio es obligatorio y no puede estar vacío');
    } else if (barrio.trim().length > 250) {
      errores.push('El barrio no puede exceder los 250 caracteres');
    }

    // torneo es opcional, pero si se envía debe ser string o null
    if (torneo !== undefined && torneo !== null && typeof torneo !== 'string') {
      errores.push('El campo torneo debe ser un texto o null');
    }

    if (errores.length > 0) {
      return res.status(400).json({
        error: 'Errores de validación',
        detalles: errores
      });
    }

    const nombreTrim = nombre.trim();
    const barrioTrim = barrio.trim();
    const torneoTrim = (torneo && typeof torneo === 'string') ? torneo.trim() || null : null;

    // === VALIDACIÓN: NOMBRE ÚNICO (insensible a mayúsculas, acentos y espacios) ===
    const checkNombreQuery = `
      SELECT 1 FROM establecimientos 
      WHERE unaccent(UPPER(nombre)) = unaccent(UPPER($1))
    `;

    const { rowCount: nombreExiste } = await pool.query(checkNombreQuery, [nombreTrim]);

    if (nombreExiste > 0) {
      return res.status(400).json({
        error: 'Nombre de establecimiento duplicado',
        detalles: `Ya existe un establecimiento con nombre similar a "${nombreTrim}"`
      });
    }

    // === INSERCIÓN FINAL ===
    const insertQuery = `
      INSERT INTO establecimientos (nombre, barrio, torneo)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    const values = [nombreTrim, barrioTrim, torneoTrim];

    const { rows } = await pool.query(insertQuery, values);

    res.status(201).json({
      message: 'Establecimiento creado exitosamente',
      establecimiento: rows[0]
    });

  } catch (error) {
    console.error('Error al crear establecimiento:', error);

    // Si es error de función unaccent no encontrada (por si alguien no tiene la extensión)
    if (error.message && error.message.includes('unaccent')) {
      return res.status(500).json({
        error: 'Error de configuración: falta extensión unaccent en la base de datos'
      });
    }

    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateEstablecimiento = async (req, res) => {
  const { id } = req.params;

  // Validar ID
  const establecimientoId = parseInt(id, 10);
  if (isNaN(establecimientoId) || establecimientoId <= 0) {
    return res.status(400).json({ error: 'ID de establecimiento inválido' });
  }

  const { nombre, barrio, torneo } = req.body;

  const errores = [];
  const setParts = [];
  const values = [];
  let paramIndex = 1;

  // Helper para validar y agregar campos al UPDATE
  const validarYAgregar = (campo, valor, reglas) => {
    if (valor === undefined) return;

    if (reglas.string && typeof valor !== 'string') {
      errores.push(`El campo ${campo} debe ser una cadena de texto`);
      return;
    }

    if (reglas.maxLength && valor.trim().length > reglas.maxLength) {
      errores.push(`El campo ${campo} no puede exceder los ${reglas.maxLength} caracteres`);
      return;
    }

    if (reglas.trim) {
      valor = valor.trim();
      if (valor === '' && reglas.requiredIfSent) {
        errores.push(`El campo ${campo} no puede quedar vacío`);
        return;
      }
    }

    setParts.push(`${campo} = $${paramIndex++}`);
    values.push(reglas.trim ? valor : valor);
  };

  // Validaciones por campo (solo si se envían)
  validarYAgregar('nombre', nombre, {
    string: true,
    trim: true,
    maxLength: 250,
    requiredIfSent: true  // no permitimos nombre vacío si lo envían
  });

  validarYAgregar('barrio', barrio, {
    string: true,
    trim: true,
    maxLength: 250,
    requiredIfSent: true
  });

  // torneo es opcional (puede ser string, null o no enviado)
  if (torneo !== undefined) {
    if (torneo !== null && typeof torneo !== 'string') {
      errores.push('El campo torneo debe ser un texto o null');
    } else {
      const torneoProcesado = (torneo && typeof torneo === 'string') ? torneo.trim() || null : null;
      setParts.push(`torneo = $${paramIndex++}`);
      values.push(torneoProcesado);
    }
  }

  // === VALIDACIÓN DE NOMBRE ÚNICO (solo si se intenta cambiar el nombre) ===
  if (nombre !== undefined) {
    const nombreFinal = nombre.trim();

    // Obtener el nombre actual para comparar después
    const currentQuery = 'SELECT nombre FROM establecimientos WHERE id = $1';
    let currentNombre = null;

    try {
      const { rows } = await pool.query(currentQuery, [establecimientoId]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Establecimiento no encontrado' });
      }
      currentNombre = rows[0].nombre;
    } catch (err) {
      console.error('Error al obtener establecimiento actual:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    // Si el nombre nuevo es igual al actual (ignorando caso/acentos/espacios), no hay problema
    const checkSameQuery = `
      SELECT 1 
      WHERE unaccent(UPPER($1)) = unaccent(UPPER($2))
    `;
    const sameResult = await pool.query(checkSameQuery, [nombreFinal, currentNombre]);
    if (sameResult.rowCount > 0) {
      // Es el mismo nombre → permitimos (no hay riesgo de duplicado)
    } else {
      // Es un nombre diferente → verificar que no exista otro con nombre similar
      const checkDuplicadoQuery = `
        SELECT 1 FROM establecimientos 
        WHERE unaccent(UPPER(nombre)) = unaccent(UPPER($1))
          AND id != $2
      `;

      const { rowCount: existeOtro } = await pool.query(checkDuplicadoQuery, [
        nombreFinal,
        establecimientoId
      ]);

      if (existeOtro > 0) {
        errores.push(
          `Ya existe un establecimiento con nombre similar a "${nombreFinal}"`
        );
      }
    }
  }

  // Si hay errores de validación
  if (errores.length > 0) {
    return res.status(400).json({
      error: 'Errores de validación',
      detalles: errores
    });
  }

  // Si no hay nada que actualizar
  if (setParts.length === 0) {
    return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
  }

  // Agregar el ID al final para el WHERE
  values.push(establecimientoId);

  const query = `
    UPDATE establecimientos
    SET ${setParts.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *;
  `;

  try {
    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Establecimiento no encontrado' });
    }

    res.json({
      message: 'Establecimiento actualizado exitosamente',
      establecimiento: rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar establecimiento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deleteEstablecimiento = async (req, res) => {
  const { id } = req.params;

  // Validar ID
  const establecimientoId = parseInt(id, 10);
  if (isNaN(establecimientoId) || establecimientoId <= 0) {
    return res.status(400).json({ error: 'ID de establecimiento inválido' });
  }

  try {
    // 1. Verificamos que el establecimiento exista
    const checkQuery = `
      SELECT nombre 
      FROM establecimientos 
      WHERE id = $1
    `;
    const { rows: estRows, rowCount } = await pool.query(checkQuery, [establecimientoId]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Establecimiento no encontrado' });
    }

    const nombreEstablecimiento = estRows[0].nombre;

    // 2. Contar canchas y reservas antes de borrar (para el mensaje)
    const countCanchasQuery = `
      SELECT COUNT(*) AS cantidad 
      FROM canchas 
      WHERE establecimiento_id = $1
    `;
    const { rows: canchasRows } = await pool.query(countCanchasQuery, [establecimientoId]);
    const canchasEliminadas = parseInt(canchasRows[0].cantidad);

    // Opcional: contar reservas (si querés ser más preciso)
    const countReservasQuery = `
      SELECT COUNT(*) AS cantidad 
      FROM reservas r
      JOIN canchas c ON r.cancha_id = c.id
      WHERE c.establecimiento_id = $1
    `;
    const { rows: reservasRows } = await pool.query(countReservasQuery, [establecimientoId]);
    const reservasEliminadas = parseInt(reservasRows[0].cantidad);

    // 3. Eliminar el establecimiento (todo lo demás se borra en cascada)
    const deleteQuery = `
      DELETE FROM establecimientos 
      WHERE id = $1 
      RETURNING *
    `;
    const { rows } = await pool.query(deleteQuery, [establecimientoId]);

    // 4. Mensaje personalizado según lo que se eliminó
    let mensaje = `Establecimiento "${nombreEstablecimiento}" eliminado exitosamente.`;

    if (canchasEliminadas > 0 || reservasEliminadas > 0) {
      mensaje += ` Se eliminaron ${canchasEliminadas} cancha${canchasEliminadas !== 1 ? 's' : ''}`;
      if (reservasEliminadas > 0) {
        mensaje += ` y ${reservasEliminadas} reserva${reservasEliminadas !== 1 ? 's' : ''} asociada${reservasEliminadas !== 1 ? 's' : ''}.`;
      } else {
        mensaje += '.';
      }
    }

    res.json({
      message: mensaje,
      establecimiento: rows[0]
    });

  } catch (error) {
    console.error('Error al eliminar establecimiento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export { getAllEstablecimientos, getEstablecimientoById, createEstablecimiento, updateEstablecimiento, deleteEstablecimiento };