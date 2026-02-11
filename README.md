# 🦷 Dental SaaS MVP

Multi-tenant dental clinic management system built with modern reactive architecture.

## 📋 Overview

A comprehensive Software as a Service (SaaS) platform for dental clinics featuring:

- **Multi-tenant Architecture**: Complete tenant isolation
- **Patient Management**: Full patient records and history
- **Appointment Scheduling**: Calendar-based appointment system
- **Staff Management**: Dentists, assistants, and administrative staff
- **User Administration**: Role-based access control (ADMIN/USER)
- **Authentication**: JWT-based security (infrastructure ready)

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Java 21 (LTS)
- Spring Boot 3.2.1 with WebFlux (Reactive)
- Spring Data R2DBC (Non-blocking database access)
- PostgreSQL 15
- JWT Authentication
- Gradle 8.5

**Frontend:**
- React 18.2.0
- TypeScript 5.3
- Vite 5.0
- Tailwind CSS 3.4
- React Router 6.21
- Axios 1.6

**Infrastructure:**
- Docker & Docker Compose
- PostgreSQL with uuid-ossp extension

### Project Structure

```
dental2/
├── backend/          # Spring Boot reactive backend
│   ├── src/
│   │   ├── main/java/com/dental/
│   │   │   ├── controller/    # REST endpoints
│   │   │   ├── service/       # Business logic
│   │   │   ├── repository/    # R2DBC repositories
│   │   │   ├── entity/        # Domain models
│   │   │   ├── dto/           # Data transfer objects
│   │   │   └── security/      # JWT & Security config
│   │   └── resources/
│   │       └── application.yml
│   └── build.gradle
│
├── frontend/         # React SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/          # API clients
│   │   ├── context/           # React context (Auth)
│   │   └── types/             # TypeScript definitions
│   └── package.json
│
├── docker/           # Docker configuration
│   ├── docker-compose.yml
│   └── postgres/
│       └── init.sql           # Database schema
│
├── openspec/         # OpenSpec specifications (SDD)
│   ├── project.md             # Project overview
│   ├── config.yaml            # Development rules
│   ├── specs/                 # Feature specifications
│   └── changes/               # Change history
│
├── scripts/          # Build & migration tools
│   ├── code-to-inventory.js
│   ├── generate-openspec-from-code.js
│   └── migrate.js
│
└── sdd/archive/      # Legacy documentation
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Java 21 (for local backend development)
- Node.js 18+ (for frontend development)
- Gradle 8.5+ (or use included wrapper)

### 1. Start PostgreSQL Database

```bash
cd docker
docker-compose up -d
```

This will:
- Start PostgreSQL 15 on port `5432`
- Create database `dental_db`
- Initialize schema from `init.sql`
- Load 2 test tenants and users

### 2. Start Backend

**Option A: Using PowerShell script (Windows)**
```powershell
cd backend
.\run-backend.ps1
```

**Option B: Using Shell script (Linux/Mac)**
```bash
cd backend
chmod +x run-backend.sh
./run-backend.sh
```

**Option C: Using Gradle directly**
```bash
cd backend
./gradlew bootRun
```

Backend will start on `http://localhost:8080`

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will start on `http://localhost:5173`

## 🔐 Test Credentials

The system comes with pre-loaded test data:

### Tenant 1: "Clínica Dental 1"
```
Admin User:
  Email: admin@clinica1.com
  Password: password123
  
Regular User:
  Email: user@clinica1.com
  Password: password123
```

### Tenant 2: "Clínica Dental 2"
```
Admin User:
  Email: admin@clinica2.com
  Password: password123
```

> **Note**: All passwords are hashed with BCrypt. The hash for "password123" is: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`

## 🔧 Development

### Backend Development

```bash
cd backend

# Run tests
./gradlew test

# Build JAR
./gradlew build

# Clean build
./gradlew clean build
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

### Database Management

```bash
# Connect to PostgreSQL
docker exec -it dental-postgres psql -U dental_user -d dental_db

# View logs
docker logs dental-postgres

# Stop database
docker-compose down

# Reset database (warning: deletes all data)
docker-compose down -v
docker-compose up -d
```

## 📚 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Endpoints

#### Authentication
- `POST /api/auth/login` - User login (returns JWT token)

#### Patients
- `GET /api/patients` - List all patients (tenant-isolated)
- `GET /api/patients/{id}` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/{id}` - Update patient
- `DELETE /api/patients/{id}` - Soft delete patient

#### Appointments
- `GET /api/appointments` - List all appointments
- `GET /api/appointments/{id}` - Get appointment by ID
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/{id}` - Update appointment
- `DELETE /api/appointments/{id}` - Delete appointment

#### Staff
- `GET /api/staff` - List all staff members
- `GET /api/staff/{id}` - Get staff by ID
- `POST /api/staff` - Create staff member
- `PUT /api/staff/{id}` - Update staff
- `DELETE /api/staff/{id}` - Soft delete staff

#### Users
- `GET /api/users` - List all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `PUT /api/users/{id}/change-password` - Change password (ADMIN only)
- `PUT /api/users/{id}/activate` - Activate user (ADMIN only)
- `PUT /api/users/{id}/deactivate` - Deactivate user (ADMIN only)
- `DELETE /api/users/{id}` - Soft delete user

#### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

> **⚠️ Security Notice**: JWT infrastructure exists but is currently NOT enforced. All endpoints are accessible without authentication. See [Security Status](#-security-status) below.

## 🔒 Security Status

### Current State: ⚠️ Development Mode

**JWT Implementation**: ✅ Complete
- Token generation with BCrypt password validation
- 8-hour token expiration
- Claims: userId, tenantId, email, role

**Security Enforcement**: ❌ Disabled
- `SecurityConfig` currently has `.permitAll()`
- No JWT filter active
- All endpoints publicly accessible

**Multi-tenant Isolation**: ✅ Implemented
- All queries filter by `tenantId`
- Repositories enforce tenant boundaries

### Required for Production

1. **Enable JWT Filter**: Uncomment JWT filter in SecurityConfig
2. **Change to `.authenticated()`**: Replace `.permitAll()` with `.authenticated()`
3. **Test all endpoints**: Verify JWT validation works
4. **Add rate limiting**: Prevent abuse
5. **Enable HTTPS**: Use TLS in production

## 📋 Features

### ✅ Implemented

- [x] Multi-tenant database architecture
- [x] User authentication (JWT infrastructure)
- [x] Patient management (CRUD with soft delete)
- [x] Appointment scheduling (CRUD)
- [x] Staff management (CRUD with soft delete)
- [x] User administration (CRUD with soft delete)
- [x] Role-based access control (ADMIN/USER)
- [x] Dashboard statistics
- [x] Responsive UI with Tailwind CSS
- [x] Reactive backend (Spring WebFlux + R2DBC)

### 🚧 Pending

- [ ] JWT security enforcement
- [ ] Password reset flow
- [ ] Email notifications
- [ ] Appointment reminders
- [ ] Billing/Invoicing
- [ ] Reports & Analytics
- [ ] File attachments
- [ ] Audit logging

## 🧪 Testing

### Backend Tests
```bash
cd backend
./gradlew test
```

### Frontend Tests
```bash
cd frontend
npm run test  # When test suite is configured
```

### Manual API Testing

Test files included:
- `login.json` - Sample login requests
- `login2.json` - Additional test cases

Use with curl, Postman, or any HTTP client.

## 📖 OpenSpec Documentation

This project uses [OpenSpec](https://github.com/Fission-AI/OpenSpec) for specification-driven development.

Key files:
- [`openspec/project.md`](openspec/project.md) - Project overview
- [`openspec/config.yaml`](openspec/config.yaml) - Development conventions
- [`openspec/AGENTS.md`](openspec/AGENTS.md) - AI assistant instructions
- [`openspec/WORKFLOW.md`](openspec/WORKFLOW.md) - Development workflow
- [`openspec/specs/`](openspec/specs/) - Feature specifications

### For AI Assistants

See [`AGENTS.md`](AGENTS.md) for quick start commands.

## 🤝 Contributing

### Development Workflow

1. Read specification in `openspec/specs/`
2. Create feature branch
3. Implement following `openspec/config.yaml` rules
4. Test locally
5. Submit pull request

### Code Conventions

- **Backend**: Follow Spring Boot best practices
- **Frontend**: React hooks, TypeScript strict mode
- **Multi-tenancy**: ALWAYS filter by `tenantId`
- **Soft Delete**: Use `deletedAt` timestamp, never hard delete
- **Reactive**: Use `Mono<T>` / `Flux<T>` for async operations

## 📝 License

[Add your license here]

## 👥 Authors

[Add authors/contributors]

## 🐛 Known Issues

1. **Security Not Enforced**: JWT infrastructure exists but `.permitAll()` allows unauthenticated access
2. **No Password Reset**: Users cannot reset forgotten passwords
3. **Limited Validation**: Frontend form validation needs enhancement
4. **No Audit Trail**: System doesn't log who changed what

## 📞 Support

[Add support contact information]

---

**Built with ❤️ using OpenSpec-driven development**
