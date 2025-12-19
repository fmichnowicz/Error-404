<img width="975" height="297" alt="Image" src="https://github.com/user-attachments/assets/a98c2497-3f96-4645-ac16-148adf3746c7" />

**CanchaYa** Es un sitio web donde podes manejar de forma centralizada reservas de canchas de diferentes deportes: ` Pádel `, ` Fútbol 4 `, ` Fútbol 5 `,  ` Fútbol 6 `,  ` Fútbol 7 `,  ` Fútbol 8 `,  ` Fútbol 9 `,  ` Fútbol 10 `,  ` Fútbol 11 `, 
 ` Tenis 4 `, ` Básquet 3v3 `,  ` Básquet 5v5 `, ` Vóley `,  ` Handball `.

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

# Base de datos

### Tecnologias
- PostgreSQL
- Docker Compose para la inicializacion del entorno

### Modelo de datos
- Establecimientos
- Canchas
  - Asociadas a un establecimiento
- Usuarios
- Reservas
  - Asociadas a una cancha y a un usuario

### Administracion de datos
- Acceso a la base de datos mediante el backend
- Operaciones CRUD realizadas a traves de los controladores

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

## Editar/Eliminar reservas

<img width="1029" height="832" alt="Image" src="https://github.com/user-attachments/assets/1ee15dd7-0340-4883-acde-a5139d80e396" />
<img width="1029" height="832" alt="Image" src="https://github.com/user-attachments/assets/696b6bb6-53df-4dc6-9036-b68e6b8770c8" />

## Usuarios

<img width="1029" height="832" alt="Image" src="https://github.com/user-attachments/assets/b484bc69-3e14-4867-8182-592367c2be3e" />