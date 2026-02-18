<img width="975" height="297" alt="Image" src="https://github.com/user-attachments/assets/a98c2497-3f96-4645-ac16-148adf3746c7" />

**CanchaYa** Es un sitio web donde podes manejar de forma centralizada establecimientos, canchas y reservas de diferentes deportes: ` Básquet 3v3 `, ` Básquet 5v5 `, ` Fútbol 4 `, ` Fútbol 5 `, ` Fútbol 6 `, ` Fútbol 7 `, ` Fútbol 8 `, ` Fútbol 9 `, ` Fútbol 10 `, ` Fútbol 11 `, ` Handball `, ` Pádel `, ` Tenis `, ` Vóley `.

# Funciones principales
- Reserva de canchas de distintos deportes
- Posibilidad de reagendar o eliminar reservas
- Registro, validacion y baja de usuarios
- Administración de establecimientos y canchas

 ---
 
# Levantar el proyecto

## Requisitos
- [Docker compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- PostgreSQL

## Pasos a seguir
### 1.Clonar el repositorio en un nuevo directorio
```  
git clone [git@github.com:fmichnowicz/Error-404.git](https://github.com/fmichnowicz/Error-404.git)
```

### 2.Configurar variables de entorno (`.env`).
Crear un archivo `.env` en la raíz del proyecto (ver estructura) y agregar lo siguiente:
```

# Base de datos
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=dbCanchaYa

# Local host port
PORT=3000
```

### 3.Instalamos gestor de paquetes para dependencias. ATENCIÓN: Lo debemos hacer desde el directorio raiz del proyecto y sólo debe ejecutarse 1 vez y ántes de ejecutar los comandos del paso 4.
```  
make deps
```

### 4.Correr los siguientes comandos dependiendo de lo que se quiera hacer. ATENCIÓN: Todos estos comandos se deben correr desde el directorio raiz del proyecto.

#### Levantar todo el proyecto
```  
make run-all
```
#### Levantar y ejecutar sólo la base de datos
```  
make run-db
```
#### Levantar el backend (y la base de datos)
```  
make run-backend
```
#### Levantar el frontend
```  
make run-frontend
```
#### Dar de baja todos los contenedores Docker (o los que estén corriendo)
```  
make down
```

 ---

 # Estructura general

```
Directorio raiz del proyecto
├── backend/
│ ├── init/
│ ├── src/
│ │ ├── config/
│ │ ├── controllers/
│ │ ├── routes/
│ │ ├── utils/
│ │ ├── server.js
│ ├── Dockerfile
├── frontend/
│ ├── assets/
│ │ ├── css/
│ │ ├── images/
│ │ ├── js/
│ ├── index.html
│ ├── Dockerfile
├── .env
├── dockercompose.yml
├── makefile
├── README.md
```

 ---

# Frontend
El frontend fue desarrollado como una aplicacion multi-page, utiliza una API REST para gestionar establecimientos, canchas, reservas y usuarios.

### Tecnologias
- HTML
- CSS
- JS

### Comunicacion con backend
- Utilizacion de API REST mediante los métodos fetch/post/put/delete
- Manejo de errores y cargas (primer filtro para validar datos)

### Arquitectura
- Separacion por componentes (assets y páginas html)
- Capa de servicios para comunicacion con el backend

 ---

# Backend
El backend fue desarrollado como una API REST encargada de la logica de la administracion de datos, tanto recibirlos, como mandarlos, borrarlos o modificarlos.

### Tecnologias
- Node.js
- PostgreSQL
- JS

### Arquitectura
- Separacion entre rutas y controladores
- Revalidación de datos a ingresar a la base de datos (el primer filtro es el frontend)

 ---

# Base de datos

### Tecnologias
- PostgreSQL

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

<img width="703" height="711" alt="image" src="https://github.com/user-attachments/assets/6ac97cde-f55c-4fe2-9570-8f9c02b1d27d" />
<img width="703" height="711" alt="image" src="https://github.com/user-attachments/assets/6ac97cde-f55c-4fe2-9570-8f9c02b1d27d" />


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
