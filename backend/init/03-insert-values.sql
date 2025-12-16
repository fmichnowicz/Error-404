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