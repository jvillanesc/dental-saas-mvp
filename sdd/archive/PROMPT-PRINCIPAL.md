# 🚀 PROMPT PRINCIPAL - Dental SaaS MVP
## Metodología: Spec-Driven Development (SDD)

**Fecha de creación**: 25 de enero de 2026  
**Versión**: 2.0 (Con lecciones aprendidas)

---

## 📋 Índice de Ejecución

Este es el prompt maestro que orquesta la creación completa del sistema Dental SaaS MVP. Ejecuta los siguientes prompts **en orden secuencial**:

### FASE 1: Especificaciones Técnicas Base
```
1. ✅ specs-tecnicas-backend.md    - Arquitectura backend (Spring Boot, R2DBC, JWT)
2. ✅ specs-tecnicas-frontend.md   - Arquitectura frontend (React, TypeScript, Vite)
3. ✅ specs-docker-database.md     - PostgreSQL con Docker + init.sql
```

### FASE 2: Historias de Usuario (Backend + Frontend)
```
4. ✅ historia-usuario-01-autenticacion.md    - Login, JWT, Context
5. ✅ historia-usuario-02-gestion-pacientes.md - CRUD Pacientes
6. ✅ historia-usuario-03-gestion-staff.md     - CRUD Staff + Relación con Users
7. ✅ historia-usuario-04-agenda-citas.md      - Calendario + CRUD Citas
```

### FASE 3: Integración y Despliegue
```
8. ✅ integracion-final.md         - Pruebas E2E y validaciones
```

---

## 🎯 Objetivos del Sistema

Sistema SaaS multitenant para gestión de clínicas dentales con:
- ✅ Autenticación JWT con multi-tenancy
- ✅ Gestión de pacientes
- ✅ Gestión de personal médico (Staff) independiente de usuarios
- ✅ Agenda de citas con calendario semanal
- ✅ Arquitectura 100% reactiva (Spring WebFlux + R2DBC)

---

## 🏗️ Arquitectura Global

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TS)                     │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │  Login   │ Patients │  Staff   │  Appts   │ Dashboard│  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
│              ↓ HTTP/REST (JWT Bearer Token)                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Spring Boot + WebFlux)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Controllers (REST API)                              │  │
│  │  ├─ AuthController                                    │  │
│  │  ├─ PatientController                                 │  │
│  │  ├─ StaffController                                   │  │
│  │  └─ AppointmentController                             │  │
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
│  │  Tablas: tenants, users, staff, patients,            │  │
│  │          appointments                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Lecciones Aprendidas (Errores Corregidos)

### ❌ Error 1: Users y Staff mezclados
**Problema**: Originalmente solo existía tabla `users` con roles.  
**Solución**: Separación clara desde el inicio:
- `users`: Cuentas de acceso (email, password, role)
- `staff`: Personal médico (especialidad, licencia, relación opcional con users)

### ❌ Error 2: schema.sql + init.sql duplicado
**Problema**: Spring Boot buscaba `schema.sql` y Docker usaba `init.sql`.  
**Solución**: 
- Solo `docker/postgres/init.sql` con estructura + datos
- Backend: `spring.sql.init.mode=never`

### ❌ Error 3: BCrypt passwords no coincidían
**Problema**: Hashes generados manualmente no validaban.  
**Solución**: Usar hash consistente: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy` (password: "password123")

### ❌ Error 4: Appointments sin staff
**Problema**: `appointments.dentist_id` referenciaba `users.id`, pero staff sin usuario no podían tener citas.  
**Solución**: Endpoint `/api/dentists` retorna solo `staff` con `user_id` no nulo.

### ❌ Error 5: gradlew no ejecutable en Alpine
**Problema**: Dockerfile usaba `./gradlew` en imagen Alpine sin permisos.  
**Solución**: Instalar Gradle directamente en Dockerfile con `wget`.

### ❌ Error 6: TypeScript compilation errors
**Problema**: Imports de React no usados, tipos ImportMeta faltantes.  
**Solución**: 
- Crear `vite-env.d.ts` con `/// <reference types="vite/client" />`
- Eliminar imports no usados

---

## 📦 Estructura de Proyecto Final

```
Dental/
├── sdd/                                    # 📁 Prompts SDD
│   ├── PROMPT-PRINCIPAL.md                 # 👈 ESTE ARCHIVO
│   ├── specs-tecnicas-backend.md
│   ├── specs-tecnicas-frontend.md
│   ├── specs-docker-database.md
│   ├── historia-usuario-01-autenticacion.md
│   ├── historia-usuario-02-gestion-pacientes.md
│   ├── historia-usuario-03-gestion-staff.md
│   ├── historia-usuario-04-agenda-citas.md
│   └── integracion-final.md
│
├── backend/                                # ☕ Spring Boot 3.2.1
│   ├── src/main/java/com/dental/
│   │   ├── domain/model/                   # Entidades
│   │   │   ├── Tenant.java
│   │   │   ├── User.java                   # 🔐 Usuarios (login)
│   │   │   ├── Staff.java                  # 👨‍⚕️ Personal médico
│   │   │   ├── Patient.java
│   │   │   └── Appointment.java
│   │   ├── repository/                     # R2DBC Repos
│   │   ├── service/                        # Lógica negocio
│   │   ├── controller/                     # REST Controllers
│   │   ├── dto/                            # DTOs
│   │   └── config/                         # JWT, Security
│   └── src/main/resources/
│       └── application.yml                 # spring.sql.init.mode=never
│
├── frontend/                               # ⚛️ React 18.2 + TypeScript
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── patients/                   # Gestión pacientes
│   │   │   ├── staff/                      # Gestión staff
│   │   │   └── appointments/               # Agenda
│   │   ├── components/
│   │   │   ├── common/                     # Button, Input, Modal
│   │   │   └── layout/                     # Layout, Sidebar
│   │   ├── services/                       # API calls (axios)
│   │   ├── context/                        # AuthContext
│   │   ├── types/                          # TypeScript types
│   │   │   ├── auth.types.ts
│   │   │   ├── patient.types.ts
│   │   │   ├── staff.types.ts              # 👨‍⚕️ Separado de User
│   │   │   └── appointment.types.ts
│   │   └── vite-env.d.ts                   # Vite types
│   └── package.json
│
└── docker/
    ├── docker-compose.yml                  # Solo PostgreSQL
    └── postgres/
        └── init.sql                        # 🗄️ Estructura + datos iniciales
```

---

## 🔧 Stack Tecnológico

### Backend
- **Java 21** (LTS)
- **Spring Boot 3.2.1** (Spring 6.1.2)
- **Spring WebFlux** (Reactor Netty)
- **Spring Data R2DBC** (PostgreSQL driver)
- **Spring Security** (JWT)
- **Gradle 8.5**
- **BCrypt** para passwords

### Frontend
- **React 18.2.0**
- **TypeScript 5.3**
- **Vite 5.0** (build tool)
- **Tailwind CSS 3.4**
- **Axios 1.6** (HTTP client)
- **React Router 6.21**
- **date-fns 3.0** (manejo fechas)

### Base de Datos
- **PostgreSQL 15** (Alpine)
- **Docker Compose** (solo para DB)
- **uuid-ossp** extension

---

## 🚀 Instrucciones de Ejecución

### Paso 1: Preparar el entorno
```bash
# Crear estructura de directorios
mkdir -p Dental/backend Dental/frontend Dental/docker/postgres
cd Dental
```

### Paso 2: Ejecutar prompts en orden
```bash
# FASE 1: Especificaciones (leer y entender arquitectura)
1. Leer sdd/specs-tecnicas-backend.md
2. Leer sdd/specs-tecnicas-frontend.md
3. Ejecutar sdd/specs-docker-database.md
   └─> Crea docker-compose.yml + init.sql
   └─> Ejecuta: docker-compose -f docker/docker-compose.yml up -d

# FASE 2: Implementar historias de usuario
4. Ejecutar sdd/historia-usuario-01-autenticacion.md
   └─> Backend: AuthController, JWT, User entity
   └─> Frontend: Login, AuthContext
   
5. Ejecutar sdd/historia-usuario-02-gestion-pacientes.md
   └─> Backend: PatientController + Service + Repo
   └─> Frontend: PatientsPage + Modal + Service
   
6. Ejecutar sdd/historia-usuario-03-gestion-staff.md
   └─> Backend: StaffController + Service + Repo + Staff entity
   └─> Frontend: StaffPage + Modal + types/staff.types.ts
   
7. Ejecutar sdd/historia-usuario-04-agenda-citas.md
   └─> Backend: AppointmentController + Service
   └─> Frontend: AppointmentsPage + Calendar + Modal

# FASE 3: Integración
8. Ejecutar sdd/integracion-final.md
   └─> Pruebas E2E + Validaciones + Ajustes finales
```

### Paso 3: Levantar servicios
```bash
# Terminal 1: Base de datos (ya levantada)
docker-compose -f docker/docker-compose.yml up -d

# Terminal 2: Backend
cd backend
./gradlew bootRun

# Terminal 3: Frontend  
cd frontend
npm install
npm run dev
```

### Paso 4: Acceder al sistema
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- PostgreSQL: localhost:5432

**Credenciales de prueba**:
- Email: `admin@clinicaabc.com`
- Password: `password123`

---

## ✅ Criterios de Aceptación Global

### Backend
- [ ] Todos los endpoints responden con status 200/201/204
- [ ] JWT funciona correctamente (login + protected routes)
- [ ] Multi-tenancy funciona (tenantId en contexto reactivo)
- [ ] Validaciones de negocio implementadas
- [ ] Soft deletes funcionan (deleted_at)
- [ ] Logs debug activados para troubleshooting

### Frontend
- [ ] Login funcional con redirección a dashboard
- [ ] CRUD completo para pacientes
- [ ] CRUD completo para staff
- [ ] Calendario de citas muestra slots de 15 min
- [ ] Modales abren/cierran correctamente
- [ ] No hay errores de TypeScript
- [ ] Tailwind CSS aplicado correctamente

### Base de Datos
- [ ] 5 tablas creadas: tenants, users, staff, patients, appointments
- [ ] 2 tenants de prueba insertados
- [ ] 6 usuarios de prueba (3 por tenant)
- [ ] 7 staff de prueba (3 + 4 por tenant)
- [ ] 7 pacientes de prueba
- [ ] 6 citas de prueba
- [ ] Índices creados correctamente
- [ ] Foreign keys funcionan

---

## 🐛 Troubleshooting

### Problema: Backend no inicia - "schema.sql not found"
**Solución**: Verificar que `application.yml` tenga:
```yaml
spring:
  sql:
    init:
      mode: never
```

### Problema: Login falla - "Invalid password"
**Solución**: Usar hash BCrypt correcto en init.sql:
```sql
-- Password: "password123"
'$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
```

### Problema: Dropdown de dentistas vacío en Nueva Cita
**Solución**: Verificar que endpoint `/api/dentists` retorne solo staff con `user_id IS NOT NULL`

### Problema: TypeScript error en vite imports
**Solución**: Crear `src/vite-env.d.ts` con:
```typescript
/// <reference types="vite/client" />
```

---

## 📞 Soporte

Para dudas o problemas durante la ejecución:
1. Revisar logs del backend (terminal con `./gradlew bootRun`)
2. Revisar console del navegador (F12)
3. Verificar que PostgreSQL esté corriendo: `docker ps`
4. Consultar sección de troubleshooting en cada prompt específico

---

## 📚 Referencias

- [Spring Boot Docs](https://docs.spring.io/spring-boot/docs/3.2.1/reference/)
- [Spring WebFlux](https://docs.spring.io/spring-framework/reference/web/webflux.html)
- [R2DBC PostgreSQL](https://github.com/pgjdbc/r2dbc-postgresql)
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**🎯 Siguiente paso**: Ejecutar `sdd/specs-tecnicas-backend.md`
