# Dental SaaS MVP - Project Overview

## Vision

A multi-tenant SaaS platform for dental clinic management with complete patient, staff, and appointment management capabilities.

## Core Features

### Implemented ✅
- **Authentication**: JWT-based login with role-based access (ADMIN, DENTIST, ASSISTANT)
- **Multi-Tenancy**: Complete tenant isolation with dynamic tenant extraction from JWT
- **Tenant Context**: Reactive context propagation for tenant isolation across all endpoints
- **User Management**: Full CRUD with password management, activate/deactivate, staff linking
- **Patient Management**: CRUD operations with soft delete, search by name/email/phone
- **Staff Management**: CRUD operations with soft delete, specialty tracking, user account linking
- **Appointment Management**: Weekly calendar view, CRUD operations, dentist and patient assignment
- **Dashboard**: Real-time statistics from database (patients, staff, appointments)

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TS)                     │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │  Login   │ Patients │  Staff   │  Appts   │ Users    │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
│              ↓ HTTP/REST (JWT Bearer Token)                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Spring Boot + WebFlux)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Controllers (REST API)                              │  │
│  │  ├─ AuthController                                    │  │
│  │  ├─ UserController                                    │  │
│  │  ├─ PatientController                                 │  │
│  │  ├─ StaffController                                   │  │
│  │  ├─ AppointmentController                             │  │
│  │  ├─ DashboardController                               │  │
│  │  └─ DentistController                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Services (Business Logic)                           │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Repositories (R2DBC Reactive)                       │  │
│  └──────────────────────────────────────────────────────┘  │
│              ↓ R2DBC PostgreSQL Driver                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│         PostgreSQL 15 (Docker Container)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tables: tenants, users, staff, patients,            │  │
│  │          appointments                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend
- **Java 21** (LTS)
- **Spring Boot 3.2.1** with Spring 6.1.2
- **Spring WebFlux** (100% reactive with Reactor Netty)
- **Spring Data R2DBC** (reactive PostgreSQL driver)
- **Spring Security** (JWT token-based)
- **Gradle 8.5**
- **BCrypt** for password hashing

### Frontend
- **React 18.2.0**
- **TypeScript 5.3** (strict mode)
- **Vite 5.0** (fast build tool and dev server)
- **Tailwind CSS 3.4** (utility-first styling)
- **Axios 1.6** (HTTP client with interceptors)
- **React Router 6.21** (client-side routing)
- **date-fns 3.0** (date formatting and manipulation)

### Database & Infrastructure
- **PostgreSQL 15** (Alpine Docker image)
- **Docker Compose** (database orchestration)
- **uuid-ossp** extension for UUID generation

## Project Structure

```
Dental2/
├── backend/                    # Spring Boot application
│   ├── src/main/java/com/dental/
│   │   ├── domain/model/       # Entities: Tenant, User, Staff, Patient, Appointment
│   │   ├── repository/         # R2DBC repositories
│   │   ├── service/            # Business logic layer
│   │   ├── controller/         # REST API endpoints
│   │   ├── dto/                # Data transfer objects
│   │   ├── security/           # JWT utilities
│   │   └── config/             # Security and app configuration
│   └── src/main/resources/
│       └── application.yml     # Application configuration
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── pages/              # Page components (Login, Dashboard, etc.)
│   │   ├── components/         # Reusable UI components
│   │   ├── services/           # API service layer
│   │   ├── context/            # React context (AuthContext)
│   │   └── types/              # TypeScript type definitions
│   └── package.json
│
├── docker/                     # Docker configurations
│   ├── docker-compose.yml      # PostgreSQL service
│   └── postgres/
│       └── init.sql            # Database schema and seed data
│
├── openspec/                   # OpenSpec documentation
│   ├── project.md              # This file
│   ├── config.yaml             # OpenSpec configuration
│   ├── specs/                  # Domain specifications
│   └── changes/                # Change history
│
└── sdd/                        # Legacy SDD documentation (archived)
```

## Coding Conventions (Detected from Codebase)

### Backend
- **Naming**: PascalCase for classes, camelCase for methods and variables
- **Entities**: All use UUID primary keys, include createdAt timestamps
- **Multi-tenancy**: Every entity has `tenantId` field for isolation
- **Soft Deletes**: Patient and Staff use `deletedAt` timestamp (not boolean)
- **DTOs**: Separate `CreateXDTO` and `UpdateXDTO` for each entity
- **Reactive**: All repository methods return `Mono<T>` or `Flux<T>`
- **Queries**: Use `@Query` annotation for complex queries (R2DBC limitation)

### Frontend
- **Naming**: PascalCase for components, camelCase for functions/variables
- **File Structure**: One component per file, co-located types
- **State Management**: React Context for global state (auth)
- **API Calls**: Centralized in service files, not in components
- **Error Handling**: Try-catch with user-friendly messages
- **Loading States**: Always show loading indicators during async operations
- **Confirmation**: Confirm dialogs before destructive actions

## Architectural Patterns

### Layered Architecture (Backend)
1. **Controllers**: Handle HTTP requests, validate input, return responses
2. **Services**: Contain business logic, coordinate repositories
3. **Repositories**: Data access layer, R2DBC queries
4. **Security**: JWT validation and tenant context extraction

### Component Composition (Frontend)
- **Pages**: Top-level route components
- **Modals**: Reusable dialog components for forms
- **Common Components**: Button, Input, Select, Modal
- **Layout Components**: MainLayout, Header, Sidebar

### Authentication Flow
1. User submits credentials to `/api/auth/login`
2. Backend validates and returns JWT token
3. Frontend stores token in localStorage
4. Axios interceptor adds token to all requests
5. Backend extracts tenantId from token for data isolation

## Known Technical Debt

### Critical Issues
1. **⚠️ Security Partially Enforced**: JWT validation is active but `SecurityConfig` still has `.permitAll()` for backwards compatibility. All controllers use TenantContext for dynamic tenant isolation. To fully enforce authentication, change `.anyExchange().permitAll()` to `.anyExchange().authenticated()` in SecurityConfig

### Future Enhancements
- Reports and analytics
- File attachments for patients
- Email notifications for appointments
- Role-based UI restrictions (hide features based on user role)
- Audit logging
- Backup and restore functionality

## Environment Configuration

### Development
- Backend: `http://localhost:8080`
- Frontend: `http://localhost:5173` (Vite dev server)
- Database: `localhost:5432` (Docker container)

### Test Credentials

**Clínica ABC (Tenant 1):**
- Email: `admin@clinicaabc.com`
- Password: `password123`
- TenantId: `550e8400-e29b-41d4-a716-446655440000`
- Data: 3 patients, 3 staff, 3 appointments today

**Dental Care Premium (Tenant 2):**
- Email: `admin@dentalcare.com`
- Password: `password123`
- TenantId: `550e8400-e29b-41d4-a716-446655440001`
- Data: 4 patients, 4 staff, 0 appointments today

## Migration Notes

This project was migrated from SDD (Spec-Driven Development) documentation to OpenSpec on February 9, 2026.

The migration used **reverse engineering from actual code** rather than documentation, as the codebase was more complete than the markdown files. The code is the source of truth.

Key migration decisions:
- Preserved all lessons learned in `config.yaml`
- Specs generated from actual implemented code
- SDD files archived for historical reference
- Change history reconstructed from git commits
