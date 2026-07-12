# E-Hospital Application

A comprehensive healthcare management system built with Django REST Framework and Next.js.

## Features

- **User Management**: Patient, Doctor, Nurse, and Admin roles with authentication
- **Appointments**: Book and manage medical appointments
- **Medical Records**: Store and retrieve patient medical history
- **Prescriptions**: Manage medication prescriptions
- **Notifications**: Real-time notifications for appointments and updates
- **Department Management**: Organize doctors and services by department
- **Dashboard**: Personalized dashboards for different user roles

## Tech Stack

### Backend
- Django 4.2+
- Django REST Framework
- PostgreSQL
- Redis
- Celery (for async tasks)
- JWT Authentication

### Frontend
- Next.js 14+
- React 18+
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- React Hook Form
- Zod (Schema Validation)

## Installation

### Prerequisites
- Docker and Docker Compose
- Python 3.11+ (for local development)
- Node.js 18+ (for local development)

### Using Docker Compose

1. Clone the repository:
```bash
git clone https://github.com/AjibadeHassan/e-hospital-app.git
cd e-hospital-app
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Start the application:
```bash
docker-compose up -d
```

4. Run migrations:
```bash
docker-compose exec backend python manage.py migrate
```

5. Create a superuser:
```bash
docker-compose exec backend python manage.py createsuperuser
```

6. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Django Admin: http://localhost:8000/admin

### Local Development

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp ../.env.example .env
```

5. Run migrations:
```bash
python manage.py migrate
```

6. Start development server:
```bash
python manage.py runserver
```

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

## Project Structure

```
e-hospital-app/
├── backend/
│   ├── apps/
│   │   ├── users/
│   │   ├── appointments/
│   │   ├── medical_records/
│   │   ├── prescriptions/
│   │   └── notifications/
│   ├── config/
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── store/
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/users/login/` - User login
- `POST /api/users/register/` - User registration
- `POST /api/users/forgot-password/` - Forgot password

### Users
- `GET /api/users/` - List users
- `GET /api/users/{id}/` - Get user details
- `PUT /api/users/{id}/` - Update user

### Appointments
- `GET /api/appointments/` - List appointments
- `POST /api/appointments/` - Create appointment
- `GET /api/appointments/{id}/` - Get appointment details
- `PUT /api/appointments/{id}/` - Update appointment
- `DELETE /api/appointments/{id}/` - Cancel appointment

### Medical Records
- `GET /api/medical-records/` - List medical records
- `POST /api/medical-records/` - Create medical record
- `GET /api/medical-records/{id}/` - Get record details

### Prescriptions
- `GET /api/prescriptions/` - List prescriptions
- `POST /api/prescriptions/` - Create prescription
- `GET /api/prescriptions/{id}/` - Get prescription details

### Notifications
- `GET /api/notifications/` - List notifications
- `POST /api/notifications/{id}/mark_as_read/` - Mark as read
- `POST /api/notifications/mark_all_as_read/` - Mark all as read

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -am 'Add some feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@e-hospital.com or open an issue on GitHub.
