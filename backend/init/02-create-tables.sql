-- Tablas independientes (sólo reciben foreign keys)
CREATE TABLE establecimientos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    barrio VARCHAR(25) NOT NULL,
    torneo VARCHAR(50)
);

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(250) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefono VARCHAR(30) NOT NULL UNIQUE,      -- VARCHAR permite formatos con "-" o espacios
    dni VARCHAR(20) NOT NULL UNIQUE,           -- Igual que teléfono, para DNI con letras/guiones si aplica
    domicilio VARCHAR(100) NOT NULL
);

-- Tablas dependientes (hacen referencia a otras tablas)
CREATE TABLE canchas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(10) NOT NULL,
    deporte VARCHAR(15) NOT NULL,
    establecimiento_id INTEGER NOT NULL,
    precio_hora INTEGER NOT NULL,
    descripcion VARCHAR(100),
    superficie VARCHAR(50) NOT NULL,
    iluminacion BOOLEAN DEFAULT FALSE,
    cubierta BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (establecimiento_id) REFERENCES establecimientos(id) ON DELETE CASCADE  --Elimina las canchas de 1 establecimiento si se lo borra
);

CREATE TABLE reservas (
    id SERIAL PRIMARY KEY,
    cancha_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    fecha_reserva DATE NOT NULL,
    reserva_hora_inicio TIME NOT NULL,
    reserva_hora_fin TIME NOT NULL,
    fecha_creacion_reserva TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion_reserva TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    monto_pagado INTEGER NOT NULL,
    FOREIGN KEY (cancha_id) REFERENCES canchas(id) ON DELETE CASCADE,                   --Elimina las reservas de 1 cancha si se la borra            
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,                 --Elimina las reservas de 1 usuario si se lo borra

    CONSTRAINT check_horas CHECK (reserva_hora_fin > reserva_hora_inicio)
);