-- Tablas independientes (sólo reciben foreign keys)
INSERT INTO establecimientos (nombre, barrio, torneo) VALUES
('Grün FC Núñez', 'Núñez', 'Sólo de fútbol 5'),
('Central Paddle Gym', 'Abasto', 'No'),
('Barrio Parque Fútbol Club', 'Palermo', 'Sí, torneos de fútbol 5 y 7'),
('Distrito Fútbol Belgrano', 'Belgrano', 'Torneos internos de fútbol'),
('Complejo Belaustegui', 'Villa Crespo', 'No'),
('Fútbol Vieytes', 'Barracas', 'Sí, torneos grandes'),
('Justo Fútbol 5', 'Palermo', 'Torneos de fútbol 5 y 6'),
('Racket Club', 'Belgrano', 'Torneos de pádel y fútbol'),
('Open Gallo', 'Almagro', 'No'),
('Villa Malcolm', 'Villa Crespo', 'Torneos comunitarios'),
('Costa Salguero Fútbol', 'Costanera Norte', 'Sí, eventos corporativos'),
('Distrito Fútbol Constitución', 'Constitución', 'Torneos de fútbol 5');

INSERT INTO usuarios (nombre, email, telefono, dni, domicilio) VALUES
('Juan Pérez', 'juan.perez@gmail.com', '11-3456-7890', '30123456', 'Av. Corrientes 1234, CABA'),
('María González', 'maria.gonzalez@hotmail.com', '11-4567-8901', '32123457', 'Callao 567, CABA'),
('Carlos López', 'carlos.lopez@yahoo.com', '11-5678-9012', '28123458', 'Santa Fe 890, CABA'),
('Ana Martínez', 'ana.martinez@gmail.com', '11-6789-0123', '34123459', 'Rivadavia 2345, CABA'),
('Luis Fernando Rodríguez', 'luis.rodriguez@hotmail.com', '11-7890-1234', '29123460', 'Belgrano 678, CABA'),
('Laura Fernández', 'laura.fernandez@yahoo.com', '11-8901-2345', '35123461', 'Libertador 3456, CABA'),
('Fernando Sánchez', 'fernando.sanchez@gmail.com', '11-9012-3456', '31123462', 'Cabildo 901, CABA'),
('Sofía Romero', 'sofia.romero@hotmail.com', '11-0123-4567', '36123463', 'Scalabrini Ortiz 456, CABA'),
('Martín Herrera', 'martin.herrera@yahoo.com', '11-1234-5678', '27123464', 'Medrano 789, CABA'),
('Valentina Castro', 'valentina.castro@gmail.com', '11-2345-6789', '37123465', 'Córdoba 1122, CABA'),
('Facundo Díaz', 'facundo.diaz@hotmail.com', '11-3456-8901', '33123466', 'Juramento 3344, CABA'),
('Camila Ortiz', 'camila.ortiz@yahoo.com', '11-4567-9012', '38123467', 'Las Heras 556, CABA'),
('Joaquín Fernando Morales', 'joaquin.morales@gmail.com', '11-5678-0123', '26123468', 'Pueyrredón 7788, CABA'),
('Lucía Silva', 'lucia.silva@hotmail.com', '11-6789-1234', '39123469', 'Independencia 990, CABA'),
('Mateo Vargas', 'mateo.vargas@yahoo.com', '11-7890-2345', '25123470', '9 de Julio 1010, CABA'),
('Florencia Ramos', 'florencia.ramos@gmail.com', '11-8901-3456', '40123471', 'Montevideo 1212, CABA'),
('Tomás Ruiz', 'tomas.ruiz@hotmail.com', '11-9012-4567', '24123472', 'Florida 1313, CABA'),
('Emilia Navarro', 'emilia.navarro@yahoo.com', '11-0123-5678', '41123473', 'Maipú 1414, CABA'),
('Santiago Mendoza', 'santiago.mendoza@gmail.com', '11-1234-6789', '23123474', 'San Martín 1515, CABA'),
('Agustina Dominguez', 'agustina.dominguez@hotmail.com', '11-2345-7890', '42123475', 'Lavalle 1616, CABA'),
('Fernando M', 'fernando_m@hotmail.com', '11-2341-7890', '42123473', 'Charcas 3274, CABA');

-- Tablas dependendientes (tienen foreign keys a otras tablas)
-- 1: Grün FC Núñez (solo Fútbol 5, 12 canchas)
INSERT INTO canchas (nombre, deporte, establecimiento_id, precio_hora, descripcion, superficie, iluminacion, cubierta) VALUES
('Cancha 1', 'Fútbol 5', 1, 25000.00, 'Cancha premium de última generación', 'Césped sintético', true, false),
('Cancha 2', 'Fútbol 5', 1, 25000.00, 'Cancha premium de última generación', 'Césped sintético', true, false),
('Cancha 3', 'Fútbol 5', 1, 25000.00, 'Cancha premium de última generación', 'Césped sintético', true, false),
('Cancha 4', 'Fútbol 5', 1, 25000.00, 'Cancha premium de última generación', 'Césped sintético', true, false),
('Cancha 5', 'Fútbol 5', 1, 25000.00, 'Cancha premium de última generación', 'Césped sintético', true, false),
('Cancha 6', 'Fútbol 5', 1, 25000.00, 'Cancha premium de última generación', 'Césped sintético', true, false),
('Cancha 7', 'Fútbol 5', 1, 25000.00, 'Cancha premium de última generación', 'Césped sintético', true, false),
('Cancha 8', 'Fútbol 5', 1, 25000.00, 'Cancha premium de última generación', 'Césped sintético', true, false),
('Cancha 9', 'Fútbol 5', 1, 25000.00, 'Cancha premium de última generación', 'Césped sintético', true, false),
('Cancha 10', 'Fútbol 5', 1, 25000.00, 'Cancha premium de última generación', 'Césped sintético', true, false),
('Cancha 11', 'Fútbol 5', 1, 25000.00, 'Cancha premium de última generación', 'Césped sintético', true, false),
('Cancha 12', 'Fútbol 5', 1, 25000.00, 'Cancha premium de última generación', 'Césped sintético', true, false);

-- 2: Central Paddle Gym (solo Pádel, 4 canchas)
INSERT INTO canchas (nombre, deporte, establecimiento_id, precio_hora, descripcion, superficie, iluminacion, cubierta) VALUES
('Cancha 1', 'Pádel', 2, 20000.00, 'Cancha techada panorámica', 'Césped sintético', true, true),
('Cancha 2', 'Pádel', 2, 20000.00, 'Cancha techada panorámica', 'Césped sintético', true, true),
('Cancha 3', 'Pádel', 2, 20000.00, 'Cancha techada panorámica', 'Césped sintético', true, true),
('Cancha 4', 'Pádel', 2, 20000.00, 'Cancha techada panorámica', 'Césped sintético', true, true);

-- 3: Barrio Parque Fútbol Club (4 Fútbol 5 + 1 Fútbol 7)
INSERT INTO canchas (nombre, deporte, establecimiento_id, precio_hora, descripcion, superficie, iluminacion, cubierta) VALUES
('Cancha 1', 'Fútbol 5', 3, 28000.00, 'Cancha con vista al parque', 'Césped sintético', true, false),
('Cancha 2', 'Fútbol 5', 3, 28000.00, 'Cancha con vista al parque', 'Césped sintético', true, false),
('Cancha 3', 'Fútbol 5', 3, 28000.00, 'Cancha con vista al parque', 'Césped sintético', true, false),
('Cancha 4', 'Fútbol 5', 3, 28000.00, 'Cancha con vista al parque', 'Césped sintético', true, false),
('Cancha 1', 'Fútbol 7', 3, 35000.00, 'Cancha grande para torneos', 'Césped sintético', true, false);

-- 4: Distrito Fútbol Belgrano (solo Fútbol 5, 6 canchas)
INSERT INTO canchas (nombre, deporte, establecimiento_id, precio_hora, descripcion, superficie, iluminacion, cubierta) VALUES
('Cancha 1', 'Fútbol 5', 4, 26000.00, 'Cancha moderna', 'Césped sintético', true, true),
('Cancha 2', 'Fútbol 5', 4, 26000.00, 'Cancha moderna', 'Césped sintético', true, true),
('Cancha 3', 'Fútbol 5', 4, 26000.00, 'Cancha moderna', 'Césped sintético', true, true),
('Cancha 4', 'Fútbol 5', 4, 26000.00, 'Cancha moderna', 'Césped sintético', true, true),
('Cancha 5', 'Fútbol 5', 4, 26000.00, 'Cancha moderna', 'Césped sintético', true, true),
('Cancha 6', 'Fútbol 5', 4, 26000.00, 'Cancha moderna', 'Césped sintético', true, true);

-- 5: Complejo Belaustegui (solo Fútbol 5, 3 canchas)
INSERT INTO canchas (nombre, deporte, establecimiento_id, precio_hora, descripcion, superficie, iluminacion, cubierta) VALUES
('Cancha 1', 'Fútbol 5', 5, 22000.00, 'Cancha clásica de barrio', 'Césped sintético', true, false),
('Cancha 2', 'Fútbol 5', 5, 22000.00, 'Cancha clásica de barrio', 'Césped sintético', true, false),
('Cancha 3', 'Fútbol 5', 5, 22000.00, 'Cancha clásica de barrio', 'Césped sintético', true, false);

-- 6: Fútbol Vieytes (varios formatos)
INSERT INTO canchas (nombre, deporte, establecimiento_id, precio_hora, descripcion, superficie, iluminacion, cubierta) VALUES
('Cancha 1', 'Fútbol 5', 6, 30000.00, 'Cancha techada premium', 'Césped sintético', true, true),
('Cancha 2', 'Fútbol 5', 6, 30000.00, 'Cancha techada premium', 'Césped sintético', true, true),
('Cancha 3', 'Fútbol 5', 6, 30000.00, 'Cancha techada premium', 'Césped sintético', true, true),
('Cancha 4', 'Fútbol 5', 6, 30000.00, 'Cancha techada premium', 'Césped sintético', true, true),
('Cancha 5', 'Fútbol 5', 6, 30000.00, 'Cancha techada premium', 'Césped sintético', true, true),
('Cancha 1', 'Fútbol 6', 6, 32000.00, 'Cancha adaptable', 'Césped sintético', true, true),
('Cancha 1', 'Fútbol 7', 6, 35000.00, 'Cancha grande', 'Césped sintético', true, true),
('Cancha 1', 'Fútbol 8', 6, 38000.00, 'Para partidos grandes', 'Césped sintético', true, true);

-- 7: Justo Fútbol 5 (4 Fútbol 5 + 1 Fútbol 6 → numeración separada)
INSERT INTO canchas (nombre, deporte, establecimiento_id, precio_hora, descripcion, superficie, iluminacion, cubierta) VALUES
('Cancha 1', 'Fútbol 5', 7, 27000.00, 'Cancha en Palermo', 'Césped sintético', true, false),
('Cancha 2', 'Fútbol 5', 7, 27000.00, 'Cancha en Palermo', 'Césped sintético', true, false),
('Cancha 3', 'Fútbol 5', 7, 27000.00, 'Cancha en Palermo', 'Césped sintético', true, false),
('Cancha 4', 'Fútbol 5', 7, 27000.00, 'Cancha en Palermo', 'Césped sintético', true, false),
('Cancha 1', 'Fútbol 6', 7, 30000.00, 'Cancha versátil', 'Césped sintético', true, false);

-- 8: Racket Club (6 Pádel + 1 Fútbol 5)
INSERT INTO canchas (nombre, deporte, establecimiento_id, precio_hora, descripcion, superficie, iluminacion, cubierta) VALUES
('Cancha 1', 'Pádel', 8, 22000.00, 'Panorámica cubierta', 'Blindex', true, true),
('Cancha 2', 'Pádel', 8, 22000.00, 'Panorámica cubierta', 'Blindex', true, true),
('Cancha 3', 'Pádel', 8, 22000.00, 'Descubierta', 'Césped sintético', true, false),
('Cancha 4', 'Pádel', 8, 22000.00, 'Descubierta', 'Césped sintético', true, false),
('Cancha 5', 'Pádel', 8, 22000.00, 'Panorámica cubierta', 'Blindex', true, true),
('Cancha 6', 'Pádel', 8, 22000.00, 'Panorámica cubierta', 'Blindex', true, true),
('Cancha 1', 'Fútbol 5', 8, 28000.00, 'Cancha de Fútbol adicional', 'Césped sintético', true, false);

-- 9: Open Gallo - Fútbol 5 (4 canchas)
INSERT INTO canchas (nombre, deporte, establecimiento_id, precio_hora, descripcion, superficie, iluminacion, cubierta) VALUES
('Cancha 1', 'Fútbol 5', 9, 24000.00, 'Cancha urbana techada', 'Césped sintético', true, true),
('Cancha 2', 'Fútbol 5', 9, 24000.00, 'Cancha urbana techada', 'Césped sintético', true, true),
('Cancha 3', 'Fútbol 5', 9, 24000.00, 'Cancha urbana techada', 'Césped sintético', true, true),
('Cancha 4', 'Fútbol 5', 9, 24000.00, 'Cancha urbana techada', 'Césped sintético', true, true);

-- 10: Villa Malcolm - Fútbol 5 (5 canchas)
INSERT INTO canchas (nombre, deporte, establecimiento_id, precio_hora, descripcion, superficie, iluminacion, cubierta) VALUES
('Cancha 1', 'Fútbol 5', 10, 23000.00, 'Cancha comunitaria', 'Césped sintético', true, false),
('Cancha 2', 'Fútbol 5', 10, 23000.00, 'Cancha comunitaria', 'Césped sintético', true, false),
('Cancha 3', 'Fútbol 5', 10, 23000.00, 'Cancha comunitaria', 'Césped sintético', true, false),
('Cancha 4', 'Fútbol 5', 10, 23000.00, 'Cancha comunitaria', 'Césped sintético', true, false),
('Cancha 5', 'Fútbol 5', 10, 23000.00, 'Cancha comunitaria', 'Césped sintético', true, false);

-- 11: Costa Salguero Fútbol
INSERT INTO canchas (nombre, deporte, establecimiento_id, precio_hora, descripcion, superficie, iluminacion, cubierta) VALUES
('Cancha 1', 'Fútbol 5', 11, 32000.00, 'Cancha con vista al río', 'Césped sintético', true, false),
('Cancha 2', 'Fútbol 5', 11, 32000.00, 'Cancha con vista al río', 'Césped sintético', true, false),
('Cancha 3', 'Fútbol 5', 11, 32000.00, 'Cancha con vista al río', 'Césped sintético', true, false),
('Cancha 4', 'Fútbol 5', 11, 32000.00, 'Cancha con vista al río', 'Césped sintético', true, false),
('Cancha 5', 'Fútbol 7', 11, 38000.00, 'Cancha grande', 'Césped sintético', true, false);

-- 12: Distrito Fútbol Constitución
INSERT INTO canchas (nombre, deporte, establecimiento_id, precio_hora, descripcion, superficie, iluminacion, cubierta) VALUES
('Cancha 1', 'Fútbol 5', 12, 21000.00, 'Cancha accesible', 'Césped sintético', true, true),
('Cancha 2', 'Fútbol 5', 12, 21000.00, 'Cancha accesible', 'Césped sintético', true, true),
('Cancha 3', 'Fútbol 5', 12, 21000.00, 'Cancha accesible', 'Césped sintético', true, true);

-- 10 reservas de ejemplo
INSERT INTO reservas (cancha_id, usuario_id, fecha_reserva, reserva_hora_inicio, reserva_hora_fin, monto_pagado)
VALUES
(1, 3, '2025-12-18', '10:00:00', '11:30:00', 4500.00),  -- Cancha 1, usuario 3, 1.5 hs
(2, 1, '2025-12-18', '14:00:00', '15:00:00', 3200.00),  -- Cancha 2, usuario 1, 1 hs
(1, 5, '2025-12-19', '18:00:00', '20:00:00', 9000.00),  -- Cancha 1, usuario 5, 2 hs
(3, 2, '2025-12-20', '09:00:00', '10:30:00', 4800.00),  -- Cancha 3, usuario 2, 1.5 hs
(2, 7, '2025-12-20', '16:30:00', '18:00:00', 6000.00),  -- Cancha 2, usuario 7, 1.5 hs
(4, 4, '2025-12-21', '11:00:00', '12:00:00', 3500.00),  -- Cancha 4, usuario 4, 1 hs
(1, 8, '2025-12-22', '20:00:00', '22:00:00', 9500.00),  -- Cancha 1, usuario 8, 2 hs
(3, 6, '2025-12-23', '15:00:00', '16:30:00', 5000.00),  -- Cancha 3, usuario 6, 1.5 hs
(2, 9, '2025-12-24', '19:00:00', '20:30:00', 6500.00),  -- Cancha 2, usuario 9, 1.5 hs
(4, 10, '2025-12-25', '17:00:00', '19:00:00', 8000.00); -- Cancha 4, usuario 10, 2 hs