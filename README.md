<img width="975" height="297" alt="Image" src="https://github.com/user-attachments/assets/a98c2497-3f96-4645-ac16-148adf3746c7" />

**CanchaYa** Es un sitio web donde podes manejar de forma centralizada reservas de canchas de diferentes deportes: ` Pádel `, ` Fútbol 4 `, ` Fútbol 5 `,  ` Fútbol 6 `,  ` Fútbol 7 `,  ` Fútbol 8 `,  ` Fútbol 9 `,  ` Fútbol 10 `,  ` Fútbol 11 `, 
 ` Tenis 4 `, ` Básquet 3v3 `,  ` Básquet 5v5 `, ` Vóley `,  ` Handball `.

 ---

 ## Estructura

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

## Frontend
    El frontend fue desarrollado como una aplicacion multi-page, utiliza una API REST para gestionar las reservas de las canchas

### Tecnologias
    * HTML
    * CSS
    * JS

### Comunicacion con backend
    * Utilizacion de API REST mediante fetch
    * Manejo de errores y cargas

## Arquitectura
    * Separacion por componentes
    * Capa de servicios para comunicacion con el backend
