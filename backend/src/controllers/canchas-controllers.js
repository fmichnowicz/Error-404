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
    // nombre
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      errores.push('El nombre es obligatorio y no puede estar vacío');
    } else if (nombre.trim().length > 100) {
      errores.push('El nombre no puede exceder los 100 caracteres');
    }

    // deporte
    if (!deporte || typeof deporte !== 'string' || deporte.trim() === '') {
      errores.push('El deporte es obligatorio y no puede estar vacío');
    } else if (deporte.trim().length > 100) {
      errores.push('El deporte no puede exceder los 100 caracteres');
    }

    // superficie
    if (!superficie || typeof superficie !== 'string' || superficie.trim() === '') {
      errores.push('La superficie es obligatoria y no puede estar vacía');
    } else if (superficie.trim().length > 100) {
      errores.push('El comentario para superficie no puede exceder los 100 caracteres');
    }

    // precio_hora
    const precio = parseFloat(precio_hora);
    if (precio_hora === undefined || precio_hora === null || isNaN(precio) || precio <= 0) {
      errores.push('El precio_hora es obligatorio y debe ser un número mayor que 0');
    }
    if (precio_hora !== undefined && !/^\d+(\.\d{1,2})?$/.test(precio_hora.toString())) {
      errores.push('El precio_hora debe tener máximo 2 decimales');
    }

    // establecimiento_id
    const estId = parseInt(establecimiento_id, 10);
    if (isNaN(estId) || estId <= 0) {
      errores.push('El establecimiento_id es obligatorio y debe ser un número entero positivo');
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
    }

    if (errores.length > 0) {
      return res.status(400).json({
        error: 'Errores de validación',
        detalles: errores
      });
    }

    const nombreTrim = nombre.trim();
    const deporteTrim = deporte.trim();

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

    // === VALIDACIÓN: NOMBRE ÚNICO (insensible a mayúsculas, acentos y espacios) ===
    const checkNombreQuery = `
      SELECT 1 FROM canchas 
      WHERE establecimiento_id = $1 
        AND deporte = $2
        AND unaccent(UPPER(nombre)) = unaccent(UPPER($3))
    `;

    const { rowCount: nombreExiste } = await pool.query(checkNombreQuery, [
      estId,
      deporteTrim,
      nombreTrim
    ]);

    if (nombreExiste > 0) {
      return res.status(400).json({
        error: 'Nombre de cancha duplicado',
        detalles: `Ya existe una cancha con nombre similar a "${nombreTrim}" para el deporte "${deporteTrim}" en este establecimiento`
      });
    }

    // === Verificamos que el establecimiento exista ===
    const { rowCount: estExiste } = await pool.query(
      'SELECT 1 FROM establecimientos WHERE id = $1',
      [estId]
    );

    if (estExiste === 0) {
      return res.status(400).json({ error: 'El establecimiento_id proporcionado no existe' });
    }

    // === Insert final (conservamos el casing y acentos originales) ===
    const insertQuery = `
      INSERT INTO canchas 
      (nombre, deporte, establecimiento_id, precio_hora, descripcion, superficie, iluminacion, cubierta)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const values = [
      nombreTrim,
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

  // Validamos ID de la cancha
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

  const setParts = [];
  const values = [];
  let paramIndex = 1;

  // Lista de deportes permitidos
  const deportesPermitidos = [
    'Pádel', 'Fútbol 4', 'Fútbol 5', 'Fútbol 6', 'Fútbol 7',
    'Fútbol 8', 'Fútbol 9', 'Fútbol 10', 'Fútbol 11',
    'Tenis', 'Básquet 3v3', 'Básquet 5v5', 'Vóley', 'Handball'
  ];

  // Helper para validar y agregar un campo al UPDATE
  const validarYAgregar = (campo, valor, reglas) => {
    if (valor === undefined) return;

    if (reglas.required && (valor === null || valor === '' || valor === undefined)) {
      errores.push(`El campo ${campo} es obligatorio y no puede ser vacío o null`);
      return;
    }

    if (reglas.string && typeof valor !== 'string') {
      errores.push(`El campo ${campo} debe ser una cadena de texto`);
      return;
    }

    if (reglas.maxLength && valor.length > reglas.maxLength) {
      errores.push(`El campo ${campo} no puede exceder ${reglas.maxLength} caracteres`);
      return;
    }

    let valorProcesado = valor;
    if (reglas.trim && typeof valor === 'string') {
      valorProcesado = valor.trim();
      if (reglas.required && valorProcesado === '') {
        errores.push(`El campo ${campo} no puede quedar vacío después de recortar espacios`);
        return;
      }
    }

    if (reglas.number && (isNaN(valor) || typeof valor !== 'number')) {
      errores.push(`El campo ${campo} debe ser un número válido`);
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

    if (reglas.integer && !Number.isInteger(valor)) {
      errores.push(`El campo ${campo} debe ser un número entero`);
      return;
    }

    setParts.push(`${campo} = $${paramIndex++}`);
    values.push(valorProcesado);
  };

  // Aplicamos validaciones campo por campo
  validarYAgregar('nombre', nombre, {
    required: true,
    string: true,
    trim: true,
    maxLength: 100
  });

  validarYAgregar('deporte', deporte, {
    required: true,
    string: true,
    trim: true,
    maxLength: 100
  });

  validarYAgregar('superficie', superficie, {
    required: true,
    string: true,
    trim: true,
    maxLength: 100
  });

  validarYAgregar('precio_hora', precio_hora, {
    required: true,
    number: true,
    positive: true
  });

  validarYAgregar('descripcion', descripcion, { string: true, trim: true });
  validarYAgregar('iluminacion', iluminacion, { boolean: true });
  validarYAgregar('cubierta', cubierta, { boolean: true });

  // === Validación de deporte permitido (con valor final) ===
  let deporteFinalParaValidar = deporte !== undefined ? (typeof deporte === 'string' ? deporte.trim() : deporte) : undefined;

  // === Validación especial para establecimiento_id ===
  if (establecimiento_id !== undefined) {
    const estId = parseInt(establecimiento_id, 10);
    if (isNaN(estId) || estId <= 0) {
      errores.push('establecimiento_id debe ser un número entero positivo');
    } else {
      try {
        const { rowCount } = await pool.query(
          'SELECT 1 FROM establecimientos WHERE id = $1',
          [estId]
        );
        if (rowCount === 0) {
          errores.push('El establecimiento_id proporcionado no existe');
        } else {
          setParts.push(`establecimiento_id = $${paramIndex++}`);
          values.push(estId);
        }
      } catch (err) {
        errores.push('Error al verificar el establecimiento');
      }
    }
  }

  // === VALIDACIÓN DE NOMBRE ÚNICO (igual que en createCancha) ===
  if (nombre !== undefined || deporte !== undefined || establecimiento_id !== undefined) {
    let nombreFinal = nombre !== undefined ? nombre.trim() : null;
    let deporteFinal = deporte !== undefined ? (typeof deporte === 'string' ? deporte.trim() : deporte) : null;
    let estIdFinal = establecimiento_id !== undefined ? parseInt(establecimiento_id, 10) : null;

    // Obtener valores actuales de la cancha
    const currentQuery = 'SELECT nombre, deporte, establecimiento_id FROM canchas WHERE id = $1';
    try {
      const { rows: currentRows } = await pool.query(currentQuery, [canchaId]);

      if (currentRows.length === 0) {
        return res.status(404).json({ error: 'Cancha no encontrada' });
      }

      const current = currentRows[0];

      nombreFinal = nombreFinal ?? current.nombre.trim();
      deporteFinal = deporteFinal ?? current.deporte;
      estIdFinal = estIdFinal ?? current.establecimiento_id;

      // Validar deporte permitido con el valor final
      if (!deportesPermitidos.includes(deporteFinal)) {
        errores.push(`Deporte no permitido. Debe ser uno de: ${deportesPermitidos.join(', ')}`);
      }

      // Verificar duplicado usando unaccent + UPPER (igual que en create)
      const checkNombreQuery = `
        SELECT 1 FROM canchas 
        WHERE establecimiento_id = $1 
          AND deporte = $2
          AND unaccent(UPPER(nombre)) = unaccent(UPPER($3))
          AND id != $4
      `;

      const { rowCount: nombreExiste } = await pool.query(checkNombreQuery, [
        estIdFinal,
        deporteFinal,
        nombreFinal,
        canchaId
      ]);

      if (nombreExiste > 0) {
        errores.push(
          `Ya existe una cancha con nombre similar a "${nombreFinal}" para el deporte "${deporteFinal}" en este establecimiento`
        );
      }
    } catch (err) {
      console.error('Error al verificar unicidad del nombre en update:', err);
      errores.push('Error interno al verificar unicidad del nombre');
    }
  }

  // Si hay errores de validación
  if (errores.length > 0) {
    return res.status(400).json({ error: 'Errores de validación', detalles: errores });
  }

  // Si no hay campos para actualizar
  if (setParts.length === 0) {
    return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
  }

  // Agregamos el ID al final para el WHERE
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
      return res.status(400).json({ error: 'ID de cancha inválido' });
    }

    // Eliminamos la cancha y devolverla (RETURNING *)
    const result = await pool.query(
      'DELETE FROM canchas WHERE id = $1 RETURNING *',
      [canchaId]
    );

    // Si no se eliminó ninguna fila → no existe
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Cancha no encontrada' });
    }

    // Respuesta exitosa
    res.status(200).json({
      message: 'Cancha eliminada exitosamente',
      canchaEliminada: result.rows[0]
    });

  } catch (error) {
    console.error('Error al eliminar cancha:', error);

    // Manejo específico si hay reservas asociadas (foreign key violation)
    if (error.code === '23503') {
      return res.status(409).json({
        error: 'No se puede eliminar la cancha porque tiene reservas asociadas'
      });
    }

    // Error genérico
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export { getAllCanchas, getCanchaById, createCancha, updateCancha, deleteCancha };