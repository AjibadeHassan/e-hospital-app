# Deployment Guide

## Production Deployment

### Prerequisites
- Server with Ubuntu 22.04 LTS
- Docker and Docker Compose installed
- Domain name
- SSL certificate (Let's Encrypt)

### Step 1: Set Up Production Environment

1. SSH into your server:
```bash
ssh user@your-server-ip
```

2. Clone the repository:
```bash
git clone https://github.com/AjibadeHassan/e-hospital-app.git
cd e-hospital-app
```

3. Create production environment file:
```bash
cp .env.example .env.production
```

4. Update `.env.production` with production values:
```bash
DEBUG=False
SECRET_KEY=your-production-secret-key
DB_NAME=e_hospital_prod
DB_USER=prod_user
DB_PASSWORD=strong-password-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Step 2: Configure Docker Compose for Production

Create `docker-compose.prod.yml`:

```yaml
version: '3.9'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: e_hospital_prod
      POSTGRES_USER: prod_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
    restart: always

  redis:
    image: redis:7-alpine
    restart: always

  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    env_file: .env.production
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis
    restart: always
    command: >
      sh -c "python manage.py migrate &&
             python manage.py collectstatic --noinput &&
             gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4"

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    env_file: .env.production
    ports:
      - "3000:3000"
    depends_on:
      - backend
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
      - frontend
    restart: always

volumes:
  postgres_prod_data:
```

### Step 3: Set Up Nginx

Create `nginx.conf` for reverse proxy:

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    upstream backend {
        server backend:8000;
    }

    upstream frontend {
        server frontend:3000;
    }

    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### Step 4: SSL Certificate Setup

Set up Let's Encrypt with Certbot:

```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

### Step 5: Start Production Services

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Step 6: Verify Deployment

1. Check if services are running:
```bash
docker-compose -f docker-compose.prod.yml ps
```

2. Check logs:
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

3. Access your application at https://yourdomain.com

## Monitoring and Maintenance

### Regular Backups

Create a backup script `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups/e-hospital"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U prod_user e_hospital_prod | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete
```

Schedule with cron:
```bash
0 2 * * * /path/to/backup.sh
```

### Monitoring

Set up monitoring for your application health and performance.

## Troubleshooting

### Database Connection Issues

```bash
docker-compose -f docker-compose.prod.yml exec backend python manage.py dbshell
```

### Clear Cache

```bash
docker-compose -f docker-compose.prod.yml exec redis redis-cli FLUSHALL
```

### View Logs

```bash
docker-compose -f docker-compose.prod.yml logs -f [service-name]
```
