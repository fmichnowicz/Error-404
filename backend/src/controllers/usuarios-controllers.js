import pool from '../config/db.config.js';

const getAllUsuarios = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener todos los usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getUsuarioById = async (req, res) => {
  try {
    // Extraemos datos del body
    const { id } = req.params;

    // Hacemos la query con parámetros
    const result = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);

    // Chequeamos que la query devuelva algo
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error al obtener el usuario por ID:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createUsuario = async (req, res) => {
  try {
    const { nombre, email, telefono, dni, domicilio } = req.body;

    const errores = [];

    // === VALIDACIÓN DE NOMBRE ===
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      errores.push('El nombre es obligatorio y no puede estar vacío');
    } else if (nombre.trim().length > 250) {
      errores.push('El nombre no puede exceder los 250 caracteres');
    }

    // === VALIDACIÓN DE EMAIL (con formato correcto) ===
    if (!email || typeof email !== 'string' || email.trim() === '') {
      errores.push('El email es obligatorio y no puede estar vacío');
    } else {
      const emailTrim = email.trim().toLowerCase();

      if (emailTrim.length > 255) {
        errores.push('El email no puede exceder los 255 caracteres');
      } else if (!/^[\w.%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailTrim)) {
        errores.push('El formato del email es inválido. Ejemplo válido: usuario@dominio.com');
      }
    }

    // === VALIDACIÓN DE TELÉFONO ===
    if (!telefono || typeof telefono !== 'string' || telefono.trim() === '') {
      errores.push('El teléfono es obligatorio y no puede estar vacío');
    } else if (telefono.trim().length > 30) {
      errores.push('El teléfono no puede exceder los 30 caracteres');
    }

    // === VALIDACIÓN DE DNI ===
    if (!dni || typeof dni !== 'string' || dni.trim() === '') {
      errores.push('El DNI es obligatorio y no puede estar vacío');
    } else if (dni.trim().length > 20) {
      errores.push('El DNI no puede exceder los 20 caracteres');
    }

    // === VALIDACIÓN DE DOMICILIO ===
    if (!domicilio || typeof domicilio !== 'string' || domicilio.trim() === '') {
      errores.push('El domicilio es obligatorio y no puede estar vacío');
    } else if (domicilio.trim().length > 100) {
      errores.push('El domicilio no puede exceder los 100 caracteres');
    }

    // Si hay errores de formato, devolvemos antes de tocar la DB
    if (errores.length > 0) {
      return res.status(400).json({
        error: 'Errores de validación',
        detalles: errores
      });
    }

    // Valores limpios para insertar
    const nombreTrim = nombre.trim();
    const emailTrim = email.trim().toLowerCase();
    const telefonoTrim = telefono.trim();
    const dniTrim = dni.trim();
    const domicilioTrim = domicilio.trim();

    // === VALIDACIÓN DE NOMBRE ÚNICO (insensible a mayúsculas, acentos y espacios) ===
    const checkNombreQuery = `
      SELECT 1 FROM usuarios 
      WHERE unaccent(UPPER(nombre)) = unaccent(UPPER($1))
    `;

    const { rowCount: nombreExiste } = await pool.query(checkNombreQuery, [nombreTrim]);

    if (nombreExiste > 0) {
      return res.status(400).json({
        error: 'Nombre de usuario duplicado',
        detalles: `Ya existe un usuario con nombre similar a "${nombreTrim}"`
      });
    }

    // === INSERCIÓN EN LA BASE DE DATOS ===
    const insertQuery = `
      INSERT INTO usuarios (nombre, email, telefono, dni, domicilio)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const values = [nombreTrim, emailTrim, telefonoTrim, dniTrim, domicilioTrim];

    const { rows } = await pool.query(insertQuery, values);

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      usuario: rows[0]
    });

  } catch (error) {
    console.error('Error al crear usuario:', error);

    // Manejo de violaciones de restricción UNIQUE (email, telefono, dni)
    if (error.code === '23505') {
      let campo = 'desconocido';
      if (error.constraint.includes('email')) campo = 'email';
      else if (error.constraint.includes('telefono')) campo = 'teléfono';
      else if (error.constraint.includes('dni')) campo = 'DNI';

      return res.status(400).json({
        error: 'Valor duplicado',
        detalles: `Ya existe un usuario con este ${campo}`
      });
    }

    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, telefono, dni, domicilio } = req.body;

    // Si no envían ningún campo, devolvemos error temprano
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: 'Nada que actualizar',
        detalles: 'Debe proporcionar al menos un campo para modificar'
      });
    }

    const errores = [];
    const camposALimpiar = {};
    const valoresQuery = [];
    let queryParamsIndex = 1;

    // === VALIDACIÓN Y LIMPIEZA CONDICIONAL DE CADA CAMPO ===

    if (nombre !== undefined) {
      if (typeof nombre !== 'string' || nombre.trim() === '') {
        errores.push('El nombre no puede estar vacío');
      } else if (nombre.trim().length > 250) {
        errores.push('El nombre no puede exceder los 250 caracteres');
      } else {
        camposALimpiar.nombre = nombre.trim();
      }
    }

    if (email !== undefined) {
      if (typeof email !== 'string' || email.trim() === '') {
        errores.push('El email no puede estar vacío');
      } else {
        const emailTrim = email.trim().toLowerCase();
        if (emailTrim.length > 255) {
          errores.push('El email no puede exceder los 255 caracteres');
        } else if (!/^[\w.%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailTrim)) {
          errores.push('El formato del email es inválido. Ejemplo válido: usuario@dominio.com');
        } else {
          camposALimpiar.email = emailTrim;
        }
      }
    }

    if (telefono !== undefined) {
      if (typeof telefono !== 'string' || telefono.trim() === '') {
        errores.push('El teléfono no puede estar vacío');
      } else if (telefono.trim().length > 30) {
        errores.push('El teléfono no puede exceder los 30 caracteres');
      } else {
        camposALimpiar.telefono = telefono.trim();
      }
    }

    if (dni !== undefined) {
      if (typeof dni !== 'string' || dni.trim() === '') {
        errores.push('El DNI no puede estar vacío');
      } else if (dni.trim().length > 20) {
        errores.push('El DNI no puede exceder los 20 caracteres');
      } else {
        camposALimpiar.dni = dni.trim();
      }
    }

    if (domicilio !== undefined) {
      if (typeof domicilio !== 'string' || domicilio.trim() === '') {
        errores.push('El domicilio no puede estar vacío');
      } else if (domicilio.trim().length > 100) {
        errores.push('El domicilio no puede exceder los 100 caracteres');
      } else {
        camposALimpiar.domicilio = domicilio.trim();
      }
    }

    // Si hay errores de formato, devolvemos antes de tocar la DB
    if (errores.length > 0) {
      return res.status(400).json({
        error: 'Errores de validación',
        detalles: errores
      });
    }

    // === COMPROBACIÓN DE UNICIDAD DE NOMBRE (solo si se está modificando) ===
    if (camposALimpiar.nombre) {
      const checkNombreQuery = `
        SELECT 1 FROM usuarios 
        WHERE unaccent(UPPER(nombre)) = unaccent(UPPER($1))
          AND id != $2
      `;
      const { rowCount } = await pool.query(checkNombreQuery, [camposALimpiar.nombre, id]);

      if (rowCount > 0) {
        return res.status(400).json({
          error: 'Nombre de usuario duplicado',
          detalles: `Ya existe otro usuario con nombre similar a "${camposALimpiar.nombre}"`
        });
      }
    }

    // === CONSTRUCCIÓN DINÁMICA DE LA QUERY DE UPDATE ===
    const campos = Object.keys(camposALimpiar);
    const setClause = campos.map(campo => `${campo} = $${queryParamsIndex++}`).join(', ');

    campos.forEach(campo => valoresQuery.push(camposALimpiar[campo]));
    valoresQuery.push(id); // último parámetro: el id del usuario

    const updateQuery = `
      UPDATE usuarios
      SET ${setClause}
      WHERE id = $${queryParamsIndex}
      RETURNING *;
    `;

    const { rows, rowCount } = await pool.query(updateQuery, valoresQuery);

    // Si no se encontró el usuario
    if (rowCount === 0) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        detalles: `No existe un usuario con id ${id}`
      });
    }

    res.status(200).json({
      message: 'Usuario actualizado exitosamente',
      usuario: rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);

    // Manejo de violaciones de restricción UNIQUE (email, telefono, dni)
    if (error.code === '23505') {
      let campo = 'desconocido';
      if (error.constraint.includes('email')) campo = 'email';
      else if (error.constraint.includes('telefono')) campo = 'teléfono';
      else if (error.constraint.includes('dni')) campo = 'DNI';

      return res.status(400).json({
        error: 'Valor duplicado',
        detalles: `Ya existe otro usuario con este ${campo}`
      });
    }

    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Validamos que el id sea un número entero positivo
    if (!id || isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({
        error: 'ID inválido',
        detalles: 'El ID del usuario debe ser un número entero positivo'
      });
    }

    const usuarioId = parseInt(id);

    // Contador de reservas y eliminación de usuario
    // 1. Contamos las reservas del usuario
    // 2. Eliminamos el usuario y por lo tanto sus reservas asociadas
    // 3. Devolvemos el usuario eliminado para confirmar que existía
    const deleteQuery = `
      WITH reservas_eliminadas AS (
        SELECT COUNT(*) AS cantidad
        FROM reservas
        WHERE usuario_id = $1
      ),
      usuario_eliminado AS (
        DELETE FROM usuarios
        WHERE id = $1
        RETURNING *
      )
      SELECT 
        (SELECT cantidad FROM reservas_eliminadas) AS reservas_eliminadas,
        usuario_eliminado.*
      FROM usuario_eliminado;
    `;

    const { rows } = await pool.query(deleteQuery, [usuarioId]);

    // Si no se eliminó ningún usuario → no existía
    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        detalles: `No existe un usuario con id ${usuarioId}`
      });
    }

    const usuarioEliminado = rows[0];
    const reservasEliminadas = parseInt(usuarioEliminado.reservas_eliminadas) || 0;

    res.status(200).json({
      message: 'Usuario eliminado exitosamente',
      usuario: {
        id: usuarioEliminado.id,
        nombre: usuarioEliminado.nombre,
        email: usuarioEliminado.email,
      },
      reservas_eliminadas: reservasEliminadas,
      detalles: `Se eliminaron ${reservasEliminadas} reserva${reservasEliminadas === 1 ? '' : 's'} asociadas al usuario`
    });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Endpoint para el form de usuarios de la página crear_reservas
const buscarUsuariosPorNombre = async (req, res) => {
  try {
    const { q } = req.query; // q = query de búsqueda (ej: "Fer")

    if (!q || q.trim().length < 2) {
      return res.json([]); // Si es muy corto, devolvemos vacío
    }

    const query = q.trim();

    const result = await pool.query(`
      SELECT id, nombre, email, telefono, dni, domicilio
      FROM usuarios
      WHERE nombre ILIKE $1
      ORDER BY nombre
      LIMIT 10
    `, [`%${query}%`]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al buscar usuarios por nombre:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
//Ejemplo de uso http://localhost:3000/usuarios/buscar?q=Fernando

export { getAllUsuarios, getUsuarioById, createUsuario, updateUsuario, deleteUsuario, buscarUsuariosPorNombre };