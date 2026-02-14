.PHONY: all deps start-db up-all run-db run-backend stop-db start-frontend down

all: deps start-db start-frontend

deps:
	cd backend && npm install

start-db:
	docker compose up -d db

up-all:
	docker compose up -d --build

run-db: start-db
	docker exec -it canchaYa_container psql -U postgres -d dbCanchaYa

run-backend: start-db
	cd backend && npm run dev

stop-db:
	docker compose down

start-frontend:
	cd frontend && http-server --cors

up:
	$(MAKE) start-db
	cd backend && npm run dev & 
	cd frontend && http-server --cors &
	@echo "¡Todo levantado! Backend y frontend corriendo en background."
	@echo "Para ver logs del backend: cd backend && npm run dev (en otra terminal)"
	@echo "Para detener: make down o Ctrl+C en las terminales correspondientes"

down: stop-db