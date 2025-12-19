<img width="975" height="297" alt="Image" src="https://github.com/user-attachments/assets/a98c2497-3f96-4645-ac16-148adf3746c7" />

**CanchaYa** Es un sitio web donde podes manejar de forma centralizada reservas de canchas de diferentes deportes: ` Pádel `, ` Fútbol 4 `, ` Fútbol 5 `,  ` Fútbol 6 `,  ` Fútbol 7 `,  ` Fútbol 8 `,  ` Fútbol 9 `,  ` Fútbol 10 `,  ` Fútbol 11 `, 
 ` Tenis `, ` Básquet 3v3 `,  ` Básquet 5v5 `, ` Vóley `,  ` Handball `.

# Funciones principales
- Registro y validacion de usuarios
- Reserva de canchas de distintos deportes
- Filtro para la busqueda de canchas
- Posibilidad de reagendar o eliminar la reserva

 ---

 # Estructura

```
├── backend/
│ ├── init/
│ ├── src/
│ │ ├── config/
│ │ ├── controllers/
│ │ ├── routes/
│ │ ├── utils/
│ │ ├── server.js
│ ├── .env
│ ├── docker-compose.yml
├── frontend/
│ ├── assets/
│ │ ├── css/
│ │ ├── images/
│ │ ├── js/
│ ├── index.html
├── makefile
├── readme.md
```

 ---

# Frontend
El frontend fue desarrollado como una aplicacion multi-page, utiliza una API REST para gestionar las reservas de las canchas

### Tecnologias
- HTML
- CSS
- JS

### Comunicacion con backend
- Utilizacion de API REST mediante fetch
- Manejo de errores y cargas

### Arquitectura
- Separacion por componentes
- Capa de servicios para comunicacion con el backend

 ---

# Backend
El backend fue desarrollado como una API REST encargada de la logica de la administracion de datos, tanto recibirlos, como mandarlos,borrarlos o modificarlos

### Tecnologias
- Node.js
- Express.js
- PostgreSQL

### Arquitectura
- Separacion entre rutas y controladores
- Capa de servicios para comunicacion con el backend

### Endpoints principales
- GET /reservas
- GET /reservas/:id
- POST /reservas
- PUT /reservas/:id
- DELETE /reservas/:id

 ---

# Base de datos

### Tecnologias
- PostgreSQL
- Docker Compose para la inicializacion del entorno

### Modelo de datos

#### Tablas independientes

- Establecimientos

| id          | nombre       | barrio       | torneo |
| ----------- | ------------ | ------------ | ------ |
| SERIAL      | VARCHAR(250) | VARCHAR(250) | TEXT   |
| PRIMARY KEY | NOT NULL     | NOT NULL     |        |
|             | UNIQUE       |              |        |

- Usuarios

| id          | nombre       | email        | telefono    | dni         | domicilio    |
| ----------- | ------------ | ------------ | ----------- | ----------- | ------------ |
| SERIAL      | VARCHAR(250) | VARCHAR(255) | VARCHAR(30) | VARCHAR(20) | VARCHAR(100) |
| PRIMARY KEY | NOT NULL     | NOT NULL     | NOT NULL    | NOT NULL    | NOT NULL     |
|             | UNIQUE       | UNIQUE       | UNIQUE      | UNIQUE      | UNIQUE       |

#### Tablas dependientes

- Canchas

| id          | nombre       | deporte      | establecimiento_id       | precio_hora     | descripcion | superficie   | iluminacion   | cubierta      |
| ----------- | ------------ | ------------ | ------------------------ | --------------- | ----------- | ------------ | ------------- | ------------- |
| SERIAL      | VARCHAR(100) | VARCHAR(100) | INTEGER                  | DECIMAL (10, 2) | TEXT        | VARCHAR(100) | BOOLEAN       | BOOLEAN       |
| PRIMARY KEY | NOT NULL     | NOT NULL     | NOT NULL                 | NOT NULL        |             | NOT NULL     | DEFAULT FALSE | DEFAULT FALSE |
|             |              |              | FK establecimientos(id)  |                 |             |              |               |               |
|             |              |              | ON DELETE CASCADE        |                 |             |              |               |               |

- Reservas

| id          | cancha_id         | usuario_id        | fecha_reserva | reserva_hora_inicio | reserva_hora_fin | fecha_creacion_reserva    |
| ----------- | ----------------- | ----------------- | ------------- | ------------------- | ---------------- | ------------------------- |
| SERIAL      | INTEGER           | INTEGER           | DATE          | TIME                | TIME             | TIMESTAMPTZ               |
| PRIMARY KEY | NOT NULL          | NOT NULL          | NOT NULL      | NOT NULL            | NOT NULL         | DEFAULT CURRENT_TIMESTAMP |
|             | FK canchas(id)    | FK usuarios(id)   |               |                     |                  |                           |
|             | ON DELETE CASCADE | ON DELETE CASCADE |               |                     |                  |                           |      

Continuación de la tabla Reservas

| fecha_modificacion_reserva | monto_pagado    |
| -------------------------- | --------------- |
| TIMESTAMPTZ                | DECIMAL (10, 2) |   
| DEFAULT CURRENT_TIMESTAMP  | NOT NULL        |  
|                            |                 |      
|                            |                 |

#### Conexión visual entre tablas
<img width="845" height="596" alt="image" src="https://github.com/user-attachments/assets/d5ff9691-3d98-42b3-972b-73a9169abc51" />

### Administracion de datos
- Acceso a la base de datos mediante el backend
- Operaciones CRUD realizadas a traves de los controladores

 ---

# Flujo de usuario

## Pagina principal

<img width="1014" height="1578" alt="Image" src="https://github.com/user-attachments/assets/c90ed2b5-fc82-4ee2-8c9c-1e7c2704de6c" />

## Establecimientos
<img width="1029" height="832" alt="Image" src="https://github.com/user-attachments/assets/dd0b4c7a-b8f6-4995-b67c-e3f423826476" />

## Reservas
<img width="1029" height="832" alt="Image" src="https://github.com/user-attachments/assets/a2c548a8-4129-407f-a1d0-ef902cec2b7b" />

## Crear reservas

<img width="1029" height="832" alt="Image" src="https://github.com/user-attachments/assets/fc856e27-576e-4a5d-855f-dfcb2bf37632" />
<img width="1029" height="832" alt="Image" src="https://github.com/user-attachments/assets/da2636ed-40dd-41ec-b996-8461b2db81f3" />
<img width="1029" height="832" alt="Image" src="https://github.com/user-attachments/assets/8a4f7a3d-824b-425e-9e6b-c08b2f330a1d" />

## Reagendar / Cancelar reservas

<img width="1029" height="832" alt="Image" src="https://github.com/user-attachments/assets/1ee15dd7-0340-4883-acde-a5139d80e396" />
<img width="1029" height="832" alt="Image" src="https://github.com/user-attachments/assets/696b6bb6-53df-4dc6-9036-b68e6b8770c8" />

## Usuarios

<img width="1029" height="832" alt="Image" src="https://github.com/user-attachments/assets/b484bc69-3e14-4867-8182-592367c2be3e" />

# Levantar el proyecto

## Requisitos
- Docker compose
- Node.js
- Express.js

## Pasos a seguir
### 1.Clonar el repositorio
```  
git clone [git@github.com:fmichnowicz/Error-404.git](https://github.com/fmichnowicz/Error-404.git)
```

### 2.Instalamos gestor de paquetes para dependencias. ATENCIÓN: Lo debemos hacer desde el mismo directorio donde se encuentra el archivo makefile y sólo debe ejecutarse 1 vez y debe ser ántes de ejecutar los comandos del paso 3.
```  
make deps
```

### 3.Correr los siguientes comandos dependiendo de lo que se quiera hacer. ATENCIÓN: Todos estos comandos se deben correr desde el mismo directorio donde se encuentra el archivo makefile.

#### Levantar todo el proyecto
```  
make up
```
#### Levantar y ejecutar sólo la base de datos
```  
make run db
```
#### Levantar el backend (y la base de datos)
```  
make run-backend
```
#### Levantar el frontend
```  
make start-frontend
```
#### Cerrar conexión a base de datos
```  
make down
```
# Limitaciones:
- Base de datos inicial no es robusta (pocos datos)
- UX --> se trató de que sea lo más amigable posible pero hay algunas páginas como crear_reservas.html que en modo mobile puede resultar dificultaso su uso. Habría que rediseñar como se ve en modo mobile
- Dificultad para manejar los formatos de horarios / fechas entre el frontend, el backend y la base datos. Algunos muestren UTC, otros hora local lo que dificultó mucho las validaciones que se hacían.
- La web está pensada sólo para los usuarios que buscan crear / reagendar / cancelar reservas. No se pueden crear nuevos establecimientos o nuevas canchas desde la web.
- Manejo muy básico de usuarios. 


# Creditos:
- Fernando Michnowicz
- Leonardo Portocarrero
- Franco D'orazio
