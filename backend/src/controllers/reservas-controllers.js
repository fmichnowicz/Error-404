import pool from '../config/db.config.js';
import { formateoFechaHorarioLocal, formateoFechaLocal } from '../utils/dateUtils.js';

const getAllReservas = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM reservas ORDER BY id');

        // Formateamos las fechas antes de enviar
        const reservasFormateadas = result.rows.map(reserva => ({
        ...reserva,
        fecha_reserva: formateoFechaLocal(reserva.fecha_reserva),
        fecha_creacion_reserva: formateoFechaHorarioLocal(reserva.fecha_creacion_reserva),
        fecha_modificacion_reserva: formateoFechaHorarioLocal(reserva.fecha_modificacion_reserva)
        }));

        res.json(reservasFormateadas);
    } catch (error) {
        console.error('Error al obtener todas las reservas', error);
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

        // Formateamos las fechas
        const reservaFormateada = {
        ...result.rows[0],
        fecha_reserva: formateoFechaLocal(result.rows[0].fecha_reserva),
        fecha_creacion_reserva: formateoFechaHorarioLocal(result.rows[0].fecha_creacion_reserva),
        fecha_modificacion_reserva: formateoFechaHorarioLocal(result.rows[0].fecha_modificacion_reserva)
        };

        res.json(reservaFormateada);

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

    // monto_pagado → ahora entero positivo (obligatorio)
    if (monto_pagado === undefined || monto_pagado === null) {
      errores.push('monto_pagado es obligatorio');
    } else {
      const monto = parseInt(monto_pagado, 10);
      if (isNaN(monto) || monto <= 0 || !Number.isInteger(monto)) {
        errores.push('monto_pagado debe ser un número entero positivo');
      }
    }

    if (errores.length > 0) {
      return res.status(400).json({ error: 'Errores de validación', detalles: errores });
    }

    const canchaId = parseInt(cancha_id);
    const usuarioId = parseInt(usuario_id);
    const fecha = fecha_reserva;
    const horaInicio = reserva_hora_inicio;
    const horaFin = reserva_hora_fin;
    const montoCliente = parseInt(monto_pagado, 10); // ya validado como entero positivo

    // === VALIDACIÓN DE FECHA MÍNIMA: MAÑANA O POSTERIOR ===
    const opcionesTZ = { timeZone: 'America/Argentina/Buenos_Aires' };
    const hoyStr = new Date().toLocaleDateString('en-CA', opcionesTZ);
    const mañanaDate = new Date();
    mañanaDate.setDate(mañanaDate.getDate() + 1);
    const mañanaStr = mañanaDate.toLocaleDateString('en-CA', opcionesTZ);

    if (fecha < mañanaStr) {
      errores.push('La reserva debe ser para mañana o fechas posteriores');
    }

    // Validar que la hora de inicio no haya pasado
    const ahora = new Date();
    const inicioReservaStr = `${fecha}T${horaInicio}:00-03:00`;
    const inicioReservaDate = new Date(inicioReservaStr);

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
      'SELECT precio_hora FROM canchas WHERE id = $1',
      [canchaId]
    );

    if (canchaRows.length === 0) {
      return res.status(404).json({
        error: 'Cancha no encontrada',
        detalles: `No existe una cancha con id ${canchaId}`
      });
    }

    const precioPorHora = parseInt(canchaRows[0].precio_hora, 10); // ahora es entero
    const duracionHoras = duracionMin / 60;
    const montoCalculado = duracionHoras * precioPorHora;

    // Validar que el monto enviado coincida exactamente con el calculado
    if (montoCliente !== montoCalculado) {
      return res.status(400).json({
        error: 'Monto incorrecto',
        detalles: `El monto_pagado debe ser exactamente ${montoCalculado} (${duracionHoras}h × ${precioPorHora}/hora)`
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

    // === VALIDAR SUPERPOSICIÓN ===
    const overlapQuery = `
      SELECT 1 
      FROM reservas 
      WHERE cancha_id = $1 
      AND fecha_reserva = $2
      AND (reserva_hora_inicio, reserva_hora_fin) OVERLAPS ($3::time, $4::time)
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

    const reservaCreada = rows[0];

    // Formateamos antes de enviar
    const reservaFormateada = {
      ...reservaCreada,
      fecha_reserva: formateoFechaLocal(reservaCreada.fecha_reserva),
      fecha_creacion_reserva: formateoFechaHorarioLocal(reservaCreada.fecha_creacion_reserva),
      fecha_modificacion_reserva: formateoFechaHorarioLocal(reservaCreada.fecha_modificacion_reserva)
    };

    res.status(201).json({
      message: 'Reserva creada exitosamente',
      reserva: reservaFormateada
    });

  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detalles: error.message
    });
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

    // === usuario_id ES OBLIGATORIO ===
    if (usuario_id === undefined) {
      return res.status(400).json({
        error: 'Campo requerido faltante',
        detalles: 'Debe proporcionar el campo "usuario_id" para modificar una reserva'
      });
    }

    if (!Number.isInteger(Number(usuario_id)) || Number(usuario_id) <= 0) {
      return res.status(400).json({
        error: 'usuario_id inválido',
        detalles: 'usuario_id debe ser un número entero positivo'
      });
    }

    const reservaId = parseInt(id);
    if (isNaN(reservaId) || reservaId <= 0) {
      return res.status(400).json({
        error: 'ID de reserva inválido',
        detalles: 'El ID debe ser un número entero positivo'
      });
    }

    if (Object.keys(req.body).length === 1 && 'usuario_id' in req.body) {
      return res.status(400).json({
        error: 'Nada que actualizar',
        detalles: 'Debe proporcionar al menos un campo para modificar además de usuario_id'
      });
    }

    const errores = [];
    const camposActualizar = {};

    // Validaciones de campos opcionales
    if (cancha_id !== undefined) {
      if (!Number.isInteger(Number(cancha_id)) || Number(cancha_id) <= 0) {
        errores.push('cancha_id debe ser un número entero positivo');
      } else {
        camposActualizar.cancha_id = parseInt(cancha_id);
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

    // monto_pagado → opcional, pero si se envía debe ser entero positivo
    if (monto_pagado !== undefined) {
      const monto = parseInt(monto_pagado, 10);
      if (isNaN(monto) || monto <= 0 || !Number.isInteger(monto)) {
        errores.push('monto_pagado debe ser un número entero positivo');
      } else {
        camposActualizar.monto_pagado_cliente = monto;
      }
    }

    if (errores.length > 0) {
      return res.status(400).json({ error: 'Errores de validación', detalles: errores });
    }

    // === OBTENER RESERVA ACTUAL ===
    const { rows: [reservaActual] } = await pool.query(
      'SELECT * FROM reservas WHERE id = $1',
      [reservaId]
    );

    if (!reservaActual) {
      return res.status(404).json({
        error: 'Reserva no encontrada',
        detalles: `No existe una reserva con id ${reservaId}`
      });
    }

    // === VALIDAR QUE EL USUARIO SEA EL DUEÑO ===
    if (parseInt(usuario_id) !== reservaActual.usuario_id) {
      return res.status(403).json({
        error: 'Acceso denegado',
        detalles: 'No se puede modificar la reserva de otro usuario'
      });
    }

    // === OBTENER DATOS DE LA CANCHA ORIGINAL ===
    const { rows: [canchaOriginal] } = await pool.query(
      'SELECT establecimiento_id, deporte FROM canchas WHERE id = $1',
      [reservaActual.cancha_id]
    );

    if (!canchaOriginal) {
      return res.status(500).json({ error: 'Error interno: cancha original no encontrada' });
    }

    const establecimientoOriginalId = canchaOriginal.establecimiento_id;
    const deporteOriginal = canchaOriginal.deporte.trim();

    // === DETERMINAR LA CANCHA FINAL ===
    const finalCanchaId = camposActualizar.cancha_id ?? reservaActual.cancha_id;

    // Validar nueva cancha si cambia
    if (finalCanchaId !== reservaActual.cancha_id) {
      const { rows: [canchaNueva] } = await pool.query(
        `SELECT establecimiento_id, deporte 
         FROM canchas 
         WHERE id = $1`,
        [finalCanchaId]
      );

      if (!canchaNueva) {
        return res.status(404).json({ error: 'Cancha no encontrada' });
      }

      const establecimientoNuevo = canchaNueva.establecimiento_id;
      const deporteNuevo = canchaNueva.deporte.trim();

      if (establecimientoNuevo !== establecimientoOriginalId) {
        return res.status(403).json({
          error: 'Cancha no permitida',
          detalles: 'Solo se puede cambiar a una cancha del mismo establecimiento'
        });
      }

      if (deporteNuevo !== deporteOriginal) {
        return res.status(403).json({
          error: 'Cancha no permitida',
          detalles: `Solo se puede cambiar a una cancha del mismo deporte (${deporteOriginal})`
        });
      }
    }

    // === OBTENER PRECIO DE LA CANCHA FINAL ===
    const { rows: [canchaFinal] } = await pool.query(
      'SELECT precio_hora FROM canchas WHERE id = $1',
      [finalCanchaId]
    );

    if (!canchaFinal) {
      return res.status(404).json({ error: 'Cancha no encontrada' });
    }

    const precioPorHora = parseInt(canchaFinal.precio_hora, 10); // ahora entero

    // Valores finales
    const finalFecha = camposActualizar.fecha_reserva ?? reservaActual.fecha_reserva.toISOString().split('T')[0];
    const finalHoraInicio = camposActualizar.reserva_hora_inicio ?? reservaActual.reserva_hora_inicio;
    const finalHoraFin = camposActualizar.reserva_hora_fin ?? reservaActual.reserva_hora_fin;

    // === VALIDACIONES DE FECHA, HORARIO Y DURACIÓN ===
    const opcionesTZ = { timeZone: 'America/Argentina/Buenos_Aires' };
    const mañanaDate = new Date();
    mañanaDate.setDate(mañanaDate.getDate() + 1);
    const mañanaStr = mañanaDate.toLocaleDateString('en-CA', opcionesTZ);

    if (finalFecha < mañanaStr) {
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

    // === CÁLCULO DE MONTO ===
    const duracionHoras = duracionMin / 60;
    const montoCalculado = duracionHoras * precioPorHora;

    const montoFinal = camposActualizar.monto_pagado_cliente ?? montoCalculado;
    if (montoFinal !== montoCalculado) {
      return res.status(400).json({
        error: 'Monto incorrecto',
        detalles: `El monto debe ser exactamente ${montoCalculado} (${duracionHoras}h × ${precioPorHora}/h)`
      });
    }

    // === VALIDAR SUPERPOSICIÓN ===
    const overlapQuery = `
      SELECT 1 
      FROM reservas 
      WHERE cancha_id = $1 
      AND fecha_reserva = $2
      AND id != $5
      AND (reserva_hora_inicio, reserva_hora_fin) OVERLAPS ($3::time, $4::time)
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
        detalles: 'El nuevo horario se superpone con otra reserva existente en la misma cancha'
      });
    }

    // === UPDATE DINÁMICO ===
    const campos = [];
    const valores = [];
    let index = 1;

    if (camposActualizar.cancha_id !== undefined) { 
      campos.push(`cancha_id = $${index++}`); 
      valores.push(finalCanchaId); 
    }
    if (camposActualizar.fecha_reserva !== undefined) { 
      campos.push(`fecha_reserva = $${index++}`); 
      valores.push(finalFecha); 
    }
    if (camposActualizar.reserva_hora_inicio !== undefined) { 
      campos.push(`reserva_hora_inicio = $${index++}`); 
      valores.push(finalHoraInicio); 
    }
    if (camposActualizar.reserva_hora_fin !== undefined) { 
      campos.push(`reserva_hora_fin = $${index++}`); 
      valores.push(finalHoraFin); 
    }

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

    const reservaActualizada = rows[0];

    const reservaFormateada = {
      ...reservaActualizada,
      fecha_reserva: formateoFechaLocal(reservaActualizada.fecha_reserva),
      fecha_creacion_reserva: formateoFechaHorarioLocal(reservaActualizada.fecha_creacion_reserva),
      fecha_modificacion_reserva: formateoFechaHorarioLocal(reservaActualizada.fecha_modificacion_reserva)
    };

    res.status(200).json({
      message: 'Reserva actualizada exitosamente',
      reserva: reservaFormateada
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

        // Eliminamos directamente y obtenemos los datos con RETURNING
        const deleteQuery = `
            DELETE FROM reservas
            WHERE id = $1
            RETURNING id, cancha_id, usuario_id, fecha_reserva, 
                      reserva_hora_inicio, reserva_hora_fin, monto_pagado;
        `;

        const { rows } = await pool.query(deleteQuery, [reservaId]);

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
            detalles: `Se eliminó la reserva del ${reservaEliminada.fecha_reserva} de ${reservaEliminada.reserva_hora_inicio} a ${reservaEliminada.reserva_hora_fin}`
        });

    } catch (error) {
        console.error('Error al eliminar reserva:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Endpoint para la grilla de la página crear_reservas.html
const getReservasParaGrilla = async (req, res) => {
    try {
        const { fecha } = req.query;

        if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return res.status(400).json({ 
            error: 'Parámetro fecha obligatorio en formato YYYY-MM-DD' 
        });
        }

        const result = await pool.query(`
        SELECT 
            r.id,
            r.cancha_id,
            r.reserva_hora_inicio,
            r.reserva_hora_fin
        FROM reservas r
        WHERE r.fecha_reserva = $1
        ORDER BY r.reserva_hora_inicio
        `, [fecha]);

        // Normalizar las horas para el frontend (quitar segundos)
        const reservasNormalizadas = result.rows.map(res => ({
        ...res,
        reserva_hora_inicio: res.reserva_hora_inicio ? res.reserva_hora_inicio.toString().slice(0, 5) : null,
        reserva_hora_fin: res.reserva_hora_fin ? res.reserva_hora_fin.toString().slice(0, 5) : null
        }));

        res.json(reservasNormalizadas);
    } catch (error) {
        console.error('Error al obtener reservas para grilla:', error);
        res.status(500).json({ 
        error: 'Error interno del servidor',
        detalles: error.message // ← Esto te va a mostrar el error real
        });
    }
};
// Ejemplo de uso http://localhost:3000/reservas/grilla?fecha=2025-12-18

// Endpoint para el mensaje que aparece cuando se eliminan establecimientos en establecimientos.html
const getReservasByEstablecimiento = async (req, res) => {
    const { establecimiento } = req.query;

    // Validación estricta
    if (!establecimiento || isNaN(parseInt(establecimiento, 10))) {
        return res.status(400).json({ 
        error: 'Parámetro establecimiento requerido y debe ser un número entero válido' 
        });
    }

    const establecimientoId = parseInt(establecimiento, 10);

    try {
        const query = `
        SELECT r.*
        FROM reservas r
        INNER JOIN canchas c ON r.cancha_id = c.id
        WHERE c.establecimiento_id = $1
        ORDER BY r.fecha_reserva, r.reserva_hora_inicio
        `;
        const values = [establecimientoId];

        console.log('Query ejecutada para establecimiento:', establecimientoId);
        console.log('SQL:', query);
        console.log('Values:', values);

        const result = await pool.query(query, values);

        console.log(`Filas devueltas: ${result.rowCount}`);

        // Formatear fechas
        const reservasFormateadas = result.rows.map(r => ({
        ...r,
        fecha_reserva: formateoFechaLocal(r.fecha_reserva),
        fecha_creacion_reserva: formateoFechaHorarioLocal(r.fecha_creacion_reserva),
        fecha_modificacion_reserva: formateoFechaHorarioLocal(r.fecha_modificacion_reserva)
        }));

        res.json(reservasFormateadas);
    } catch (error) {
        console.error('Error en getReservasByEstablecimiento:', error.message, error.stack);
        res.status(500).json({ error: 'Error al obtener reservas', detalles: error.message });
    }
};
// Ejemplo de uso http://localhost:3000/reservas/by-establecimiento?establecimiento=14

// Endpoint para obtener reservas por cancha (usado en confirmar eliminación de cancha)
const getReservasByCancha = async (req, res) => {
    const { cancha } = req.query;

    // Validación estricta del parámetro
    if (!cancha || isNaN(parseInt(cancha, 10))) {
        return res.status(400).json({ 
        error: 'Parámetro "cancha" requerido y debe ser un número entero válido' 
        });
    }

    const canchaId = parseInt(cancha, 10);

    try {
        const query = `
        SELECT r.*
        FROM reservas r
        WHERE r.cancha_id = $1
        ORDER BY r.fecha_reserva, r.reserva_hora_inicio
        `;
        const values = [canchaId];

        console.log('Query ejecutada para cancha:', canchaId);
        console.log('SQL:', query);
        console.log('Values:', values);

        const result = await pool.query(query, values);

        console.log(`Filas devueltas: ${result.rowCount}`);

        // Formatear fechas (igual que en otros endpoints)
        const reservasFormateadas = result.rows.map(r => ({
        ...r,
        fecha_reserva: formateoFechaLocal(r.fecha_reserva),
        fecha_creacion_reserva: formateoFechaHorarioLocal(r.fecha_creacion_reserva),
        fecha_modificacion_reserva: formateoFechaHorarioLocal(r.fecha_modificacion_reserva)
        }));

        res.json(reservasFormateadas);
    } catch (error) {
        console.error('Error en getReservasByCancha:', error.message, error.stack);
        res.status(500).json({ error: 'Error al obtener reservas por cancha', detalles: error.message });
    }
};
// Ejemplo de uso http://localhost:3000/reservas/by-cancha?cancha=2

// Endpoint para contar la cantidad de reservas por usuario (usado en confirmar eliminación de usuario)
const getReservasCountByUsuario = async (req, res) => {
  const { usuario_id } = req.params;

  if (!usuario_id || isNaN(parseInt(usuario_id))) {
    return res.status(400).json({ error: 'usuario_id debe ser un número entero válido' });
  }

  try {
    const result = await pool.query(
      'SELECT COUNT(*) AS count FROM reservas WHERE usuario_id = $1',
      [usuario_id]
    );

    const count = parseInt(result.rows[0].count, 10);

    res.json({ count });
  } catch (error) {
    console.error('Error al contar reservas por usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
// Ejemplo de uso http://localhost:3000/reservas/count/2

export { getAllReservas, getReservaById, createReserva, updateReserva, deleteReserva, getReservasParaGrilla, getReservasByEstablecimiento, getReservasByCancha, getReservasCountByUsuario };