# Makefile for E-Hospital App

.PHONY: help build up down logs migrate createsuperuser shell test clean

.DEFAULT_GOAL := help

help: ## Display help message
	@echo "E-Hospital App - Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Build all Docker images
	docker-compose build

up: ## Start all services
	docker-compose up -d
	echo "Services started. Access:"
	echo "  Frontend: http://localhost:3000"
	echo "  Backend: http://localhost:8000"
	echo "  Admin: http://localhost:8000/admin"

down: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

logs: ## View logs from all services
	docker-compose logs -f

logs-backend: ## View backend logs
	docker-compose logs -f backend

logs-frontend: ## View frontend logs
	docker-compose logs -f frontend

migrate: ## Run Django migrations
	docker-compose exec backend python manage.py migrate

makemigrations: ## Create Django migrations
	docker-compose exec backend python manage.py makemigrations

createsuperuser: ## Create Django superuser
	docker-compose exec backend python manage.py createsuperuser

shell: ## Access Django shell
	docker-compose exec backend python manage.py shell

shell-plus: ## Access Django shell with models
	docker-compose exec backend python manage.py shell_plus

test: ## Run Django tests
	docker-compose exec backend python manage.py test

test-coverage: ## Run tests with coverage
	docker-compose exec backend coverage run --source='.' manage.py test
	docker-compose exec backend coverage report

clean: ## Remove Docker containers and volumes
	docker-compose down -v

ps: ## Show running containers
	docker-compose ps

static: ## Collect static files
	docker-compose exec backend python manage.py collectstatic --noinput

format: ## Format backend code with black
	docker-compose exec backend black .

lint: ## Lint backend code with flake8
	docker-compose exec backend flake8 .
