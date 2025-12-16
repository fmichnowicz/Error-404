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

export { getAllUsuarios, getUsuarioById, createUsuario };