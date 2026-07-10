# Docker Setup Guide

## Overview

This project uses Docker and Docker Compose to orchestrate multiple services:

- **PostgreSQL** - Database service
- **Redis** - Cache and message broker
- **Backend** - Django DRF API server
- **Frontend** - Next.js application
- **Nginx** - Reverse proxy

## Prerequisites

- Docker (version 20.10+)
- Docker Compose (version 1.29+)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/AjibadeHassan/e-hospital-app.git
cd e-hospital-app
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your specific configuration.

### 3. Build and Run Services

```bash
docker-compose up --build
```

Services will start in the following order:
1. PostgreSQL
2. Redis
3. Backend (Django)
4. Frontend (Next.js)
5. Nginx

### 4. Initialize the Database

In a new terminal:

```bash
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

## Common Docker Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Stop Services

```bash
docker-compose down
```

### Remove Volumes

```bash
docker-compose down -v
```

### Rebuild Services

```bash
docker-compose build --no-cache
```

## Accessing Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin
- **API Documentation**: http://localhost:8000/api/docs

## Troubleshooting

### Port Already in Use

Change ports in `docker-compose.yml` or stop conflicting services.

### Database Connection Issues

Ensure PostgreSQL container is running:

```bash
docker-compose ps
```

### Redis Connection Issues

Verify Redis is accessible:

```bash
docker-compose exec backend redis-cli -h redis ping
```

## Production Deployment

For production, create a separate `docker-compose.prod.yml` with:
- Environment-specific variables
- Disabled debug mode
- Proper secret management
- SSL/TLS configuration
