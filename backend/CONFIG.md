# E-Hospital Backend Configuration Guide

## Environment Variables

The application uses environment variables for configuration. Create a `.env` file in the project root with the following variables:

### Database Configuration
```
DB_ENGINE=django.db.backends.postgresql
DB_NAME=e_hospital
DB_USER=postgres
DB_PASSWORD=your-secure-password
DB_HOST=localhost  # or 'db' for Docker
DB_PORT=5432
USE_POSTGRES=True
```

### Redis Configuration
```
REDIS_URL=redis://localhost:6379/0  # or redis://redis:6379/0 for Docker
```

### Django Configuration
```
DEBUG=True  # Set to False in production
SECRET_KEY=your-secret-key-here  # Generate with: python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
ALLOWED_HOSTS=localhost,127.0.0.1
```

### CORS Configuration
```
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Email Configuration (Optional - for production)
```
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
DEFAULT_FROM_EMAIL=noreply@e-hospital.com
```

### External Services (Optional)
```
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
```

## Running Migrations

1. Make sure you're in the backend directory:
   ```bash
   cd backend
   ```

2. Create migrations for all apps:
   ```bash
   python manage.py makemigrations users appointments medical_records prescriptions notifications
   ```

3. Apply migrations:
   ```bash
   python manage.py migrate
   ```

4. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

## Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api`

## API Documentation

- Swagger UI: `http://localhost:8000/api/schema/swagger-ui/`
- ReDoc: `http://localhost:8000/api/schema/redoc/`
- OpenAPI Schema: `http://localhost:8000/api/schema/`

## Database Setup

### Using PostgreSQL Locally

1. Install PostgreSQL (if not already installed)

2. Create database and user:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE e_hospital;
   CREATE USER postgres WITH PASSWORD 'postgres';
   ALTER ROLE postgres SET client_encoding TO 'utf8';
   ALTER ROLE postgres SET default_transaction_isolation TO 'read committed';
   ALTER ROLE postgres SET default_transaction_deferrable TO on;
   ALTER ROLE postgres SET default_transaction_level TO 'read committed';
   GRANT ALL PRIVILEGES ON DATABASE e_hospital TO postgres;
   \q
   ```

3. Run migrations:
   ```bash
   python manage.py migrate
   ```

### Using Docker Compose

```bash
docker-compose up -d
```

This will start all services including PostgreSQL and Redis.

## Testing

Run tests with pytest:

```bash
pytest
```

Run with coverage:

```bash
pytest --cov=apps --cov-report=html
```

## Code Quality

### Format Code
```bash
black .
```

### Sort Imports
```bash
isort .
```

### Lint
```bash
flake8 .
```

### Type Checking
```bash
mypy .
```

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check DB_HOST, DB_NAME, DB_USER, DB_PASSWORD in .env
- Verify the database exists: `psql -U postgres -l | grep e_hospital`

### Redis Connection Error
- Ensure Redis is running
- Check REDIS_URL in .env
- Test connection: `redis-cli ping`

### Import Errors
- Ensure all apps are listed in INSTALLED_APPS
- Run `python manage.py makemigrations`
- Run `python manage.py migrate`
