# Architecture Specification

## Purpose

Technical architecture and technology stack for the Dental SaaS MVP.

## Technology Stack

### Backend
- **Language**: Java 21 (LTS)
- **Framework**: Spring Boot 3.2.1
- **Web Layer**: Spring WebFlux (Reactive)
- **Data Access**: Spring Data R2DBC
- **Database Driver**: R2DBC PostgreSQL
- **Security**: Spring Security + JWT
- **Build Tool**: Gradle 8.5
- **Password Hashing**: BCrypt

### Frontend
- **Library**: React 18.2.0
- **Language**: TypeScript 5.3
- **Build Tool**: Vite 5.0
- **Styling**: Tailwind CSS 3.4
- **HTTP Client**: Axios 1.6
- **Routing**: React Router 6.21
- **Date Utilities**: date-fns 3.0

### Database
- **RDBMS**: PostgreSQL 15
- **Container**: Docker (Alpine)
- **Extensions**: uuid-ossp

## Architecture Patterns

### Backend Layers
The system SHALL follow a layered architecture:
1. **Controllers**: REST endpoints, request/response handling
2. **Services**: Business logic, validation
3. **Repositories**: Data access, R2DBC queries
4. **Entities**: Domain models
5. **DTOs**: Data transfer objects

### Reactive Programming
The system SHALL use reactive programming patterns:
- All database operations return `Mono<T>` or `Flux<T>`
- Non-blocking I/O throughout the stack
- Reactor Netty as the web server

### Security Architecture

#### Requirement: JWT Authentication
The system SHALL use JWT tokens for authentication.

**Current Implementation Status**: ⚠️ JWT infrastructure exists but is NOT enforced

#### Scenario: Token generation
- GIVEN valid user credentials
- WHEN authentication succeeds
- THEN a JWT token is generated with 8-hour expiration
- AND token contains userId, tenantId, email, role claims

#### Known Issue: Security Not Enforced
**Problem**: SecurityConfig currently has `.permitAll()` allowing unauthenticated access to all endpoints.
**Impact**: System is functionally insecure despite JWT infrastructure.
**Required Action**: Implement JWT filter and change to `.authenticated()`.

