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

const createReserva = async (req, res) => {
  try {
    const {
      cancha_id,
      usuario_id,
      fecha_reserva,
      reserva_hora_inicio,
      reserva_hora_fin,
      monto_pagado
    } = req.body;

    const errores = [];

    // === VALIDACIÓN BÁSICA DE CAMPOS ===
    if (!cancha_id || !Number.isInteger(Number(cancha_id)) || Number(cancha_id) <= 0) {
      errores.push('cancha_id debe ser un número entero positivo');
    }
    if (!usuario_id || !Number.isInteger(Number(usuario_id)) || Number(usuario_id) <= 0) {
      errores.push('usuario_id debe ser un número entero positivo');
    }
    if (!fecha_reserva || isNaN(Date.parse(fecha_reserva))) {
      errores.push('fecha_reserva debe ser una fecha válida (YYYY-MM-DD)');
    }
    if (!reserva_hora_inicio || !/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(reserva_hora_inicio)) {
      errores.push('reserva_hora_inicio debe ser una hora válida (HH:MM:SS)');
    }
    if (!reserva_hora_fin || !/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(reserva_hora_fin)) {
      errores.push('reserva_hora_fin debe ser una hora válida (HH:MM:SS)');
    }
    if (!monto_pagado || isNaN(monto_pagado) || Number(monto_pagado) <= 0) {
      errores.push('monto_pagado debe ser un número positivo');
    }

    if (errores.length > 0) {
      return res.status(400).json({ error: 'Errores de validación', detalles: errores });
    }

    const canchaId = parseInt(cancha_id);
    const usuarioId = parseInt(usuario_id);
    const fecha = fecha_reserva;
    const horaInicio = reserva_hora_inicio;
    const horaFin = reserva_hora_fin;
    const montoCliente = parseFloat(monto_pagado);

    // === 1. FECHA MÍNIMA: MAÑANA O POSTERIOR + HORA DE INICIO NO PASADA ===
    const ahora = new Date(); // Momento actual (fecha + hora)

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const mañana = new Date(hoy);
    mañana.setDate(hoy.getDate() + 1);

    const fechaDate = new Date(fecha);
    fechaDate.setHours(0, 0, 0, 0);

    if (fechaDate < mañana) {
      errores.push('La reserva debe ser para mañana o fechas posteriores');
    }

    // Validar que la hora de inicio no haya pasado ya
    const inicioReservaDate = new Date(`${fecha}T${horaInicio}`);
    if (inicioReservaDate <= ahora) {
      errores.push('No se puede crear una reserva cuya hora de inicio ya haya pasado o esté ocurriendo en este momento');
    }

    // === REGLAS DE HORARIOS Y DURACIÓN ===
    const parseTime = (timeStr) => {
      const [h, m, s] = timeStr.split(':').map(Number);
      return h * 3600 + m * 60 + s;
    };

    const segInicio = parseTime(horaInicio);
    const segFin = parseTime(horaFin);

    if (segInicio < 7 * 3600 || segInicio > 21 * 3600) {
      errores.push('reserva_hora_inicio debe estar entre 07:00 y 21:00');
    }
    if (segFin < 8 * 3600 || segFin > 22 * 3600) {
      errores.push('reserva_hora_fin debe estar entre 08:00 y 22:00');
    }
    if (segFin <= segInicio) {
      errores.push('reserva_hora_fin debe ser posterior a reserva_hora_inicio');
    }

    const duracionMin = (segFin - segInicio) / 60;
    if (![60, 90, 120].includes(duracionMin)) {
      errores.push('La duración debe ser exactamente 1 hora, 1 hora 30 minutos o 2 horas');
    }

    if (errores.length > 0) {
      return res.status(400).json({ error: 'Errores de validación', detalles: errores });
    }

    // === OBTENER PRECIO DE LA CANCHA ===
    const { rows: canchaRows } = await pool.query(
      'SELECT precio_por_hora FROM canchas WHERE id = $1',
      [canchaId]
    );

    if (canchaRows.length === 0) {
      return res.status(404).json({
        error: 'Cancha no encontrada',
        detalles: `No existe una cancha con id ${canchaId}`
      });
    }

    const precioPorHora = parseFloat(canchaRows[0].precio_por_hora);
    const duracionHoras = duracionMin / 60;
    const montoCalculado = duracionHoras * precioPorHora;

    if (Math.abs(montoCalculado - montoCliente) > 0.01) {
      return res.status(400).json({
        error: 'Monto incorrecto',
        detalles: `El monto_pagado debe ser exactamente ${montoCalculado.toFixed(2)} (${duracionHoras}h × ${precioPorHora.toFixed(2)}/hora)`
      });
    }

    // === VERIFICAR USUARIO ===
    const { rowCount: usuarioExiste } = await pool.query(
      'SELECT 1 FROM usuarios WHERE id = $1',
      [usuarioId]
    );
    if (usuarioExiste === 0) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        detalles: `No existe un usuario con id ${usuarioId}`
      });
    }

    // === 2. VALIDAR SUPERPOSICIÓN PARCIAL O TOTAL ===
    const overlapQuery = `
      SELECT 1 FROM reservas
      WHERE cancha_id = $1
        AND fecha_reserva = $2
        AND (
          reserva_hora_inicio < $4  -- otra empieza antes de que termine esta
          AND reserva_hora_fin > $3 -- otra termina después de que empiece esta
        )
    `;

    const { rowCount: overlap } = await pool.query(overlapQuery, [
      canchaId,
      fecha,
      horaInicio,
      horaFin
    ]);

    if (overlap > 0) {
      return res.status(409).json({
        error: 'Horario no disponible',
        detalles: 'El horario solicitado se superpone (total o parcialmente) con otra reserva existente en la misma cancha'
      });
    }

    // === INSERCIÓN ===
    const insertQuery = `
      INSERT INTO reservas (
        cancha_id, usuario_id, fecha_reserva,
        reserva_hora_inicio, reserva_hora_fin, monto_pagado
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const { rows } = await pool.query(insertQuery, [
      canchaId,
      usuarioId,
      fecha,
      horaInicio,
      horaFin,
      montoCalculado
    ]);

    res.status(201).json({
      message: 'Reserva creada exitosamente',
      reserva: rows[0]
    });

  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      cancha_id,
      usuario_id,
      fecha_reserva,
      reserva_hora_inicio,
      reserva_hora_fin,
      monto_pagado
    } = req.body;

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: 'Nada que actualizar',
        detalles: 'Debe proporcionar al menos un campo para modificar'
      });
    }

    const reservaId = parseInt(id);
    if (isNaN(reservaId) || reservaId <= 0) {
      return res.status(400).json({
        error: 'ID de reserva inválido',
        detalles: 'El ID debe ser un número entero positivo'
      });
    }

    const errores = [];
    const camposActualizar = {};

    // Validación condicional de campos enviados
    if (cancha_id !== undefined) {
      if (!Number.isInteger(Number(cancha_id)) || Number(cancha_id) <= 0) {
        errores.push('cancha_id debe ser un número entero positivo');
      } else {
        camposActualizar.cancha_id = parseInt(cancha_id);
      }
    }
    if (usuario_id !== undefined) {
      if (!Number.isInteger(Number(usuario_id)) || Number(usuario_id) <= 0) {
        errores.push('usuario_id debe ser un número entero positivo');
      } else {
        camposActualizar.usuario_id = parseInt(usuario_id);
      }
    }
    if (fecha_reserva !== undefined) {
      if (isNaN(Date.parse(fecha_reserva))) {
        errores.push('fecha_reserva debe ser una fecha válida (YYYY-MM-DD)');
      } else {
        camposActualizar.fecha_reserva = fecha_reserva;
      }
    }
    if (reserva_hora_inicio !== undefined) {
      if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(reserva_hora_inicio)) {
        errores.push('reserva_hora_inicio debe ser una hora válida (HH:MM:SS)');
      } else {
        camposActualizar.reserva_hora_inicio = reserva_hora_inicio;
      }
    }
    if (reserva_hora_fin !== undefined) {
      if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(reserva_hora_fin)) {
        errores.push('reserva_hora_fin debe ser una hora válida (HH:MM:SS)');
      } else {
        camposActualizar.reserva_hora_fin = reserva_hora_fin;
      }
    }
    if (monto_pagado !== undefined) {
      if (isNaN(monto_pagado) || Number(monto_pagado) <= 0) {
        errores.push('monto_pagado debe ser un número positivo');
      } else {
        camposActualizar.monto_pagado_cliente = parseFloat(monto_pagado);
      }
    }

    if (errores.length > 0) {
      return res.status(400).json({ error: 'Errores de validación', detalles: errores });
    }

    // Obtener la reserva actual
    const { rows: reservaActual } = await pool.query(
      'SELECT * FROM reservas WHERE id = $1',
      [reservaId]
    );

    if (reservaActual.length === 0) {
      return res.status(404).json({
        error: 'Reserva no encontrada',
        detalles: `No existe una reserva con id ${reservaId}`
      });
    }

    const actual = reservaActual[0];

    // Valores finales después de la actualización
    const finalCanchaId = camposActualizar.cancha_id ?? actual.cancha_id;
    const finalUsuarioId = camposActualizar.usuario_id ?? actual.usuario_id;
    const finalFecha = camposActualizar.fecha_reserva ?? actual.fecha_reserva.toISOString().split('T')[0];
    const finalHoraInicio = camposActualizar.reserva_hora_inicio ?? actual.reserva_hora_inicio;
    const finalHoraFin = camposActualizar.reserva_hora_fin ?? actual.reserva_hora_fin;

    // === 1. VALIDAR QUE LA RESERVA AÚN NO HAYA COMENZADO ===
    const ahora = new Date(); // Fecha y hora actual del servidor

    const inicioReservaDate = new Date(`${finalFecha}T${finalHoraInicio}`);
    
    if (inicioReservaDate <= ahora) {
      return res.status(403).json({
        error: 'No se puede modificar una reserva que ya comenzó o pasó',
        detalles: 'Solo se permiten modificaciones en reservas cuya hora de inicio sea estrictamente posterior al momento actual'
      });
    }

    // === 2. REGLAS DE NEGOCIO (fecha, horarios, duración) ===
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const mañana = new Date(hoy);
    mañana.setDate(hoy.getDate() + 1);

    const fechaFinalDate = new Date(finalFecha);
    fechaFinalDate.setHours(0, 0, 0, 0);

    if (fechaFinalDate < mañana) {
      errores.push('La fecha_reserva debe ser para mañana o fechas posteriores');
    }

    const parseTime = (timeStr) => {
      const [h, m, s] = timeStr.split(':').map(Number);
      return h * 3600 + m * 60 + s;
    };

    const segInicio = parseTime(finalHoraInicio);
    const segFin = parseTime(finalHoraFin);

    if (segInicio < 7 * 3600 || segInicio > 21 * 3600) {
      errores.push('reserva_hora_inicio debe estar entre 07:00 y 21:00');
    }
    if (segFin < 8 * 3600 || segFin > 22 * 3600) {
      errores.push('reserva_hora_fin debe estar entre 08:00 y 22:00');
    }
    if (segFin <= segInicio) {
      errores.push('reserva_hora_fin debe ser posterior a reserva_hora_inicio');
    }

    const duracionMin = (segFin - segInicio) / 60;
    if (![60, 90, 120].includes(duracionMin)) {
      errores.push('La duración debe ser exactamente 1 hora, 1 hora 30 minutos o 2 horas');
    }

    if (errores.length > 0) {
      return res.status(400).json({ error: 'Errores de validación', detalles: errores });
    }

    // === PRECIO Y MONTO ===
    const { rows: canchaRows } = await pool.query(
      'SELECT precio_por_hora FROM canchas WHERE id = $1',
      [finalCanchaId]
    );
    if (canchaRows.length === 0) {
      return res.status(404).json({ error: 'Cancha no encontrada' });
    }
    const precioPorHora = parseFloat(canchaRows[0].precio_por_hora);
    const duracionHoras = duracionMin / 60;
    const montoCalculado = duracionHoras * precioPorHora;

    const montoFinal = camposActualizar.monto_pagado_cliente ?? montoCalculado;
    if (Math.abs(montoFinal - montoCalculado) > 0.01) {
      return res.status(400).json({
        error: 'Monto incorrecto',
        detalles: `El monto debe ser ${montoCalculado.toFixed(2)} (${duracionHoras}h × ${precioPorHora.toFixed(2)}/h)`
      });
    }

    // === VERIFICAR USUARIO SI SE CAMBIA ===
    if (camposActualizar.usuario_id) {
      const { rowCount } = await pool.query('SELECT 1 FROM usuarios WHERE id = $1', [finalUsuarioId]);
      if (rowCount === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
    }

    // === 3. VALIDAR SUPERPOSICIÓN PARCIAL O TOTAL (excluyendo la propia reserva) ===
    const overlapQuery = `
      SELECT 1 FROM reservas
      WHERE cancha_id = $1
        AND fecha_reserva = $2
        AND id != $5
        AND (
          reserva_hora_inicio < $4  -- otra empieza antes de que termine la nueva
          AND reserva_hora_fin > $3 -- otra termina después de que empiece la nueva
        )
    `;

    const { rowCount: overlap } = await pool.query(overlapQuery, [
      finalCanchaId,
      finalFecha,
      finalHoraInicio,
      finalHoraFin,
      reservaId
    ]);

    if (overlap > 0) {
      return res.status(409).json({
        error: 'Horario no disponible',
        detalles: 'El nuevo horario se superpone (total o parcialmente) con otra reserva existente en la misma cancha'
      });
    }

    // === ARMAR UPDATE DINÁMICO ===
    const campos = [];
    const valores = [];
    let index = 1;

    if (camposActualizar.cancha_id !== undefined) { campos.push(`cancha_id = $${index++}`); valores.push(finalCanchaId); }
    if (camposActualizar.usuario_id !== undefined) { campos.push(`usuario_id = $${index++}`); valores.push(finalUsuarioId); }
    if (camposActualizar.fecha_reserva !== undefined) { campos.push(`fecha_reserva = $${index++}`); valores.push(finalFecha); }
    if (camposActualizar.reserva_hora_inicio !== undefined) { campos.push(`reserva_hora_inicio = $${index++}`); valores.push(finalHoraInicio); }
    if (camposActualizar.reserva_hora_fin !== undefined) { campos.push(`reserva_hora_fin = $${index++}`); valores.push(finalHoraFin); }

    campos.push(`monto_pagado = $${index++}`);
    valores.push(montoCalculado);
    campos.push(`fecha_modificacion_reserva = CURRENT_TIMESTAMP`);

    valores.push(reservaId);

    const updateQuery = `
      UPDATE reservas
      SET ${campos.join(', ')}
      WHERE id = $${index}
      RETURNING *;
    `;

    const { rows } = await pool.query(updateQuery, valores);

    res.status(200).json({
      message: 'Reserva actualizada exitosamente',
      reserva: rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deleteReserva = async (req, res) => {
  try {
    const { id } = req.params;

    const reservaId = parseInt(id);
    if (isNaN(reservaId) || reservaId <= 0) {
      return res.status(400).json({
        error: 'ID de reserva inválido',
        detalles: 'El ID debe ser un número entero positivo'
      });
    }

    // Obtener la reserva para validar fecha/hora y devolver datos
    const { rows: reservaRows } = await pool.query(
      `SELECT 
         id,
         cancha_id,
         usuario_id,
         fecha_reserva,
         reserva_hora_inicio,
         reserva_hora_fin
       FROM reservas 
       WHERE id = $1`,
      [reservaId]
    );

    if (reservaRows.length === 0) {
      return res.status(404).json({
        error: 'Reserva no encontrada',
        detalles: `No existe una reserva con id ${reservaId}`
      });
    }

    const reserva = reservaRows[0];

    // === VALIDAR QUE LA RESERVA AÚN NO HAYA COMENZADO ===
    const ahora = new Date(); // Fecha y hora actual del servidor

    const inicioReservaDate = new Date(
      `${reserva.fecha_reserva.toISOString().split('T')[0]}T${reserva.reserva_hora_inicio}`
    );

    if (inicioReservaDate <= ahora) {
      return res.status(403).json({
        error: 'No se puede eliminar una reserva que ya comenzó o pasó',
        detalles: `La reserva estaba programada para el ${reserva.fecha_reserva} a las ${reserva.reserva_hora_inicio} y ya no se puede cancelar`
      });
    }

    // === ELIMINAR LA RESERVA ===
    const deleteQuery = `
      DELETE FROM reservas
      WHERE id = $1
      RETURNING *;
    `;

    const { rows } = await pool.query(deleteQuery, [reservaId]);

    // (En teoría no debería pasar porque ya validamos existencia, pero por seguridad)
    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Reserva no encontrada',
        detalles: `No existe una reserva con id ${reservaId}`
      });
    }

    const reservaEliminada = rows[0];

    res.status(200).json({
      message: 'Reserva eliminada exitosamente',
      reserva: {
        id: reservaEliminada.id,
        cancha_id: reservaEliminada.cancha_id,
        usuario_id: reservaEliminada.usuario_id,
        fecha_reserva: reservaEliminada.fecha_reserva,
        reserva_hora_inicio: reservaEliminada.reserva_hora_inicio,
        reserva_hora_fin: reservaEliminada.reserva_hora_fin,
        monto_pagado: reservaEliminada.monto_pagado
      },
      detalles: `Se canceló la reserva del ${reservaEliminada.fecha_reserva} de ${reservaEliminada.reserva_hora_inicio} a ${reservaEliminada.reserva_hora_fin}`
    });

  } catch (error) {
    console.error('Error al eliminar reserva:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export { getAllReservas, getReservaById, createReserva, updateReserva, deleteReserva };