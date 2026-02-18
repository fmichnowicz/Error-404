<img width="975" height="297" alt="Image" src="https://github.com/user-attachments/assets/a98c2497-3f96-4645-ac16-148adf3746c7" />

**CanchaYa** Es un sitio web donde podes manejar de forma centralizada establecimientos, canchas y reservas de diferentes deportes: ` Básquet 3v3 `, ` Básquet 5v5 `, ` Fútbol 4 `, ` Fútbol 5 `, ` Fútbol 6 `, ` Fútbol 7 `, ` Fútbol 8 `, ` Fútbol 9 `, ` Fútbol 10 `, ` Fútbol 11 `, ` Handball `, ` Pádel `, ` Tenis `, ` Vóley `.

---

# Contenidos

- [Funciones principales](#funciones-principales)
- [Levantar el proyecto](#levantar-el-proyecto)
- [Estructura general](#estructura-general)
- [Frontend](#frontend)
- [Backend](#backend)
- [Base de datos](#base-de-datos)
- [Flujo de usuario](#flujo-de-usuario)
- [Limitaciones](#limitaciones)
- [Créditos](#creditos)

---

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

## Establecimientos

<img width="1905" height="1033" alt="image" src="https://github.com/user-attachments/assets/340cd0fe-885b-4001-985a-7569bbbd0587" />

## Canchas

<img width="1919" height="1030" alt="image" src="https://github.com/user-attachments/assets/d58529be-c321-4764-9308-1f425cea7269" />

## Reservas

<img width="1918" height="1033" alt="image" src="https://github.com/user-attachments/assets/db729c5d-0ff4-45cf-a688-0e8c8496f3d4" />

## Crear reservas

<img width="1903" height="1033" alt="image" src="https://github.com/user-attachments/assets/bca503bd-4d90-4c01-ae2c-b4e83ec5105b" />
<img width="1905" height="866" alt="image" src="https://github.com/user-attachments/assets/1e6a633b-1dfc-46af-ad58-8404b1da3217" />
<img width="1916" height="860" alt="image" src="https://github.com/user-attachments/assets/59caacd6-13eb-42b9-ad36-b80dc747b32b" />

## Reagendar / Cancelar reservas

<img width="1919" height="1033" alt="image" src="https://github.com/user-attachments/assets/820e0534-a63a-4625-95a1-d80d3fd2c707" />

## Usuarios

<img width="1918" height="1032" alt="image" src="https://github.com/user-attachments/assets/c8260cbe-32a2-4746-a572-c1ad5b3f026f" />

## Ver Usuarios

<img width="1919" height="1038" alt="image" src="https://github.com/user-attachments/assets/00a0c622-16b1-4732-9d51-43f325172b1b" />

---

# Limitaciones:

- Base de datos inicial no es robusta (pocos datos)
- UX --> se trató de que sea lo más responsive y amigable posible pero hay algunas páginas como crear_reservas.html que en modo mobile puede resultar dificultoso su uso. Habría que rediseñar como se ve en modo mobile
- Dificultad para manejar los formatos de horarios / fechas entre el frontend, el backend y la base datos. Formato local vs extranjero llevó a que se hagan validaciones excesivas. No está garantizado que si se accede con 1 VPN desde un país que no sea Argentina funcione bien.

---

# Creditos:
- Fernando Michnowicz
- Leonardo Portocarrero
- Franco D'orazio
