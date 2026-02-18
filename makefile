.PHONY: deps run-all start-db run-db run-backend run-frontend build down

# Instalación de dependencias en el backend
deps:
	cd backend && npm install

# Ejecución completa del sitio web (base de datos + backend + frontend)
run-all: build
	docker compose up -d

# BASE DE DATOS
# Levantar la base de datos
start-db:
	docker compose up -d db

# Correr la base de datos en terminal
run-db: start-db
	docker exec -it canchaYa_container psql -U postgres -d dbCanchaYa

# BACKEND
# Levantar y correr sólo el backend con base de datos
run-backend:
	docker compose up -d backend

# FRONTEND
# Levantar y correr sólo el frontend
run-frontend:
	docker compose up -d frontend

# Construye las imágenes de backend y frontend
build:
	docker compose build --no-cache=false

# Damos de baja todos los contenedores
down:
	docker compose down