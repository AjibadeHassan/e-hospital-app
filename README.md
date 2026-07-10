# E-Hospital App

A comprehensive hospital management system built with modern web technologies.

## Technology Stack

### Frontend
- **Next.js 14** - React framework for production
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Server state management
- **Axios** - HTTP client

### Backend
- **Django 4.2** - Python web framework
- **Django REST Framework** - REST API toolkit
- **PostgreSQL** - Primary database
- **Redis** - Caching and task queue
- **Celery** - Distributed task processing

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Python 3.11+

### Running with Docker

```bash
docker-compose up --build
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin

## Project Structure

```
e-hospital-app/
├── frontend/          # Next.js application
├── backend/           # Django DRF application
├── docker-compose.yml # Docker orchestration
├── .env.example       # Environment variables template
└── README.md          # This file
```

## Documentation

- [Frontend Setup](./frontend/README.md)
- [Backend Setup](./backend/README.md)
- [Docker Setup](./DOCKER_SETUP.md)
