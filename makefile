.PHONY: all deps start-db run-db run-backend stop-db start-frontend

# Objetivo por defecto (si se ejecuta solo "make")
all: deps start-db start-frontend

# Instalamos dependencias en el backend
deps:
	cd backend && npm install

# Base de datos
start-db:
	cd backend && docker compose up -d

# Conectar a la base de datos
run-db: start-db
	docker exec -it canchaYa_container psql -U postgres -d dbCanchaYa

# Levantar backend
run-backend: start-db
	cd backend && npm run dev

# Detener la base de datos
stop-db:
	cd backend && docker compose down

# Levantar frontend
start-frontend:
	cd frontend && http-server --cors

# Levantamos todo
up:
	$(MAKE) start-db
	cd backend && npm run dev & 
	cd frontend && http-server --cors &
	@echo "¡Todo levantado! Backend y frontend corriendo en background."
	@echo "Para ver logs del backend: cd backend && npm run dev (en otra terminal)"
	@echo "Para detener: make down o Ctrl+C en las terminales correspondientes"

down: stop-db