# 🐳 ESPECIFICACIONES - DOCKER DATABASE

**Proyecto**: Dental SaaS MVP  
**Componente**: PostgreSQL con Docker Compose  
**Fecha**: 25 de enero de 2026  
**Versión**: 2.0

---

## 🎯 Objetivos

- ✅ PostgreSQL 15 en contenedor Docker (solo DB, no backend ni frontend)
- ✅ Un solo archivo `init.sql` con estructura completa + datos de prueba
- ✅ 5 tablas: tenants, users, staff, patients, appointments
- ✅ Datos de prueba para 2 tenants con aislamiento completo
- ✅ BCrypt passwords consistentes
- ✅ Relación User ↔ Staff correcta desde el inicio

---

## 📁 Estructura de Archivos

```
docker/
├── docker-compose.yml        # Configuración Docker Compose
└── postgres/
    └── init.sql              # Script de inicialización completo
```

---

## 🐳 docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: dental-postgres
    environment:
      POSTGRES_DB: dental_db
      POSTGRES_USER: dental_user
      POSTGRES_PASSWORD: dental_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - dental-network

volumes:
  postgres_data:

networks:
  dental-network:
    driver: bridge
```

---

## 🗄️ init.sql (Completo)

```sql
-- ========================================
-- DENTAL SAAS MVP - DATABASE INITIALIZATION
-- Versión: 2.0 (Con lecciones aprendidas)
-- Fecha: 25 de enero de 2026
-- ========================================

-- Activar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- TABLA: TENANTS (Clínicas/Organizaciones)
-- ========================================
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    phone VARCHAR(50),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- TABLA: USERS (Usuarios de login)
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- TABLA: PATIENTS (Pacientes)
-- ========================================
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    birth_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- ========================================
-- TABLA: APPOINTMENTS (Citas)
-- ========================================
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    dentist_id UUID NOT NULL REFERENCES users(id),
    start_time TIMESTAMP NOT NULL,
    duration_minutes INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- TABLA: STAFF (Personal médico)
-- ⚠️ IMPORTANTE: Separada de USERS desde el inicio
-- ========================================
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID REFERENCES users(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    specialty VARCHAR(100) NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    hire_date DATE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- ========================================
-- ÍNDICES
-- ========================================

-- Índices para appointments
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_date ON appointments(tenant_id, start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_dentist ON appointments(dentist_id, start_time);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);

-- Índices para patients
CREATE INDEX IF NOT EXISTS idx_patients_tenant ON patients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_patients_search ON patients(tenant_id, first_name, last_name, phone, email) WHERE deleted_at IS NULL;

-- Índices para staff
CREATE INDEX IF NOT EXISTS idx_staff_tenant ON staff(tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_user ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_license ON staff(tenant_id, license_number) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_staff_specialty ON staff(tenant_id, specialty) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_staff_active ON staff(tenant_id, active) WHERE deleted_at IS NULL;

-- Constraint para licencia única por tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_unique_license 
ON staff(tenant_id, license_number) 
WHERE deleted_at IS NULL;

-- ========================================
-- ALTERACIÓN: Agregar staff_id a users
-- (Relación bidireccional opcional)
-- ========================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES staff(id);

-- ========================================
-- DATOS DE PRUEBA - TENANTS
-- ========================================
INSERT INTO tenants (id, name, contact_email, phone, active) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Clínica Dental ABC', 'contacto@clinicaabc.com', '987654321', true),
  ('550e8400-e29b-41d4-a716-446655440001', 'Dental Care Premium', 'info@dentalcarepremium.com', '912345678', true)
ON CONFLICT DO NOTHING;

-- ========================================
-- DATOS DE PRUEBA - USUARIOS
-- Password: "password123"
-- Hash BCrypt: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- ========================================

-- Usuarios de Clínica Dental ABC
INSERT INTO users (id, tenant_id, email, password, first_name, last_name, role, active) 
VALUES 
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'admin@clinicaabc.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Carlos', 'Administrador', 'ADMIN', true),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'dentist@clinicaabc.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'María', 'Dentista', 'DENTIST', true),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'assistant@clinicaabc.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Juan', 'Asistente', 'ASSISTANT', true),
  -- Usuarios de Dental Care Premium
  ('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'admin@dentalcare.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Laura', 'Directora', 'ADMIN', true),
  ('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'dentist@dentalcare.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Roberto', 'Odontólogo', 'DENTIST', true),
  ('660e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', 'assistant@dentalcare.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Patricia', 'Auxiliar', 'ASSISTANT', true)
ON CONFLICT DO NOTHING;

-- ========================================
-- DATOS DE PRUEBA - STAFF
-- ========================================

-- Staff de Clínica Dental ABC
INSERT INTO staff (id, tenant_id, user_id, first_name, last_name, phone, email, specialty, license_number, hire_date, active) 
VALUES 
  ('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440002', 'María', 'Dentista', '987654301', 'maria.dentista@clinicaabc.com', 'Odontología General', 'LIC-ABC-001', '2023-01-15', true),
  ('990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', NULL, 'Jorge', 'Ramírez', '987654302', 'jorge.ramirez@clinicaabc.com', 'Higienista Dental', 'LIC-ABC-002', '2023-03-20', true),
  ('990e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', NULL, 'Sofia', 'Torres', '987654303', 'sofia.torres@clinicaabc.com', 'Asistente Dental', 'LIC-ABC-003', '2024-06-10', true),
  -- Staff de Dental Care Premium
  ('990e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440012', 'Roberto', 'Odontólogo', '912345601', 'roberto.odontologo@dentalcare.com', 'Implantología', 'LIC-DCP-001', '2022-08-01', true),
  ('990e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', NULL, 'Elena', 'Morales', '912345602', 'elena.morales@dentalcare.com', 'Ortodoncista', 'LIC-DCP-002', '2023-02-14', true),
  ('990e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', NULL, 'Ricardo', 'Vega', '912345603', 'ricardo.vega@dentalcare.com', 'Endodoncista', 'LIC-DCP-003', '2023-09-05', true),
  ('990e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440001', NULL, 'Carmen', 'Silva', '912345604', 'carmen.silva@dentalcare.com', 'Higienista Dental', 'LIC-DCP-004', '2024-01-10', true)
ON CONFLICT DO NOTHING;

-- ========================================
-- DATOS DE PRUEBA - PACIENTES
-- ========================================

-- Pacientes de Clínica Dental ABC
INSERT INTO patients (id, tenant_id, first_name, last_name, phone, email, birth_date) 
VALUES 
  ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Pedro', 'García', '987123456', 'pedro@email.com', '1985-05-15'),
  ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Ana', 'López', '987123457', 'ana@email.com', '1990-08-20'),
  ('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Luis', 'Martínez', '987123458', 'luis@email.com', '1978-03-10'),
  -- Pacientes de Dental Care Premium
  ('770e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'María', 'Rodríguez', '912111111', 'maria@email.com', '1992-11-25'),
  ('770e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'Carlos', 'Sánchez', '912222222', 'carlos@email.com', '1988-06-30'),
  ('770e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', 'Rosa', 'Fernández', '912333333', 'rosa@email.com', '1995-09-15'),
  ('770e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440001', 'Jorge', 'Torres', '912444444', 'jorge@email.com', '1982-12-05')
ON CONFLICT DO NOTHING;

-- ========================================
-- DATOS DE PRUEBA - CITAS
-- ========================================

-- Citas de Clínica Dental ABC
INSERT INTO appointments (id, tenant_id, patient_id, dentist_id, start_time, duration_minutes, status, notes) 
VALUES 
  ('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', '2026-02-01 10:00:00', 60, 'SCHEDULED', 'Limpieza dental y revisión general'),
  ('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '2026-02-01 14:30:00', 45, 'CONFIRMED', 'Control post-tratamiento de conducto'),
  ('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', '2026-02-05 09:00:00', 30, 'SCHEDULED', 'Consulta por sensibilidad dental'),
  -- Citas de Dental Care Premium
  ('880e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440012', '2026-02-02 11:00:00', 60, 'CONFIRMED', 'Blanqueamiento dental profesional'),
  ('880e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440012', '2026-02-03 15:00:00', 90, 'SCHEDULED', 'Colocación de implante dental'),
  ('880e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440012', '2026-02-06 10:30:00', 45, 'CONFIRMED', 'Ortodoncia - ajuste de brackets')
ON CONFLICT DO NOTHING;
```

---

## 🚀 Instrucciones de Ejecución

### 1. Crear estructura de carpetas
```bash
mkdir -p docker/postgres
```

### 2. Crear docker-compose.yml
Copiar el contenido del archivo docker-compose.yml mostrado arriba.

### 3. Crear init.sql
Copiar el contenido completo del script SQL mostrado arriba en `docker/postgres/init.sql`.

### 4. Levantar contenedor
```bash
docker-compose -f docker/docker-compose.yml up -d
```

### 5. Verificar que esté corriendo
```bash
docker ps
```

Deberías ver:
```
CONTAINER ID   IMAGE               COMMAND                  STATUS         PORTS                    NAMES
xxxxx          postgres:15-alpine  "docker-entrypoint.s…"  Up 10 seconds  0.0.0.0:5432->5432/tcp   dental-postgres
```

### 6. Verificar base de datos
```bash
docker exec dental-postgres psql -U dental_user -d dental_db -c "\dt"
```

Deberías ver las 5 tablas:
```
 Schema |     Name     | Type  |    Owner
--------+--------------+-------+-------------
 public | appointments | table | dental_user
 public | patients     | table | dental_user
 public | staff        | table | dental_user
 public | tenants      | table | dental_user
 public | users        | table | dental_user
```

---

## ✅ Validaciones

### Verificar tenants
```bash
docker exec dental-postgres psql -U dental_user -d dental_db -c "SELECT id, name FROM tenants;"
```

### Verificar usuarios por tenant
```bash
docker exec dental-postgres psql -U dental_user -d dental_db -c "
SELECT t.name, COUNT(u.id) as usuarios 
FROM tenants t 
LEFT JOIN users u ON t.id = u.tenant_id 
GROUP BY t.name;"
```

### Verificar staff por tenant
```bash
docker exec dental-postgres psql -U dental_user -d dental_db -c "
SELECT t.name, COUNT(s.id) as staff_count 
FROM tenants t 
LEFT JOIN staff s ON t.id = s.tenant_id 
GROUP BY t.name;"
```

### Verificar staff con y sin usuario
```bash
docker exec dental-postgres psql -U dental_user -d dental_db -c "
SELECT 
  first_name, 
  last_name, 
  specialty, 
  CASE WHEN user_id IS NOT NULL THEN 'Con usuario' ELSE 'Sin usuario' END as estado
FROM staff 
ORDER BY first_name;"
```

### Verificar pacientes por tenant
```bash
docker exec dental-postgres psql -U dental_user -d dental_db -c "
SELECT t.name, COUNT(p.id) as pacientes 
FROM tenants t 
LEFT JOIN patients p ON t.id = p.tenant_id AND p.deleted_at IS NULL
GROUP BY t.name;"
```

### Verificar citas
```bash
docker exec dental-postgres psql -U dental_user -d dental_db -c "
SELECT t.name as tenant, COUNT(a.id) as citas 
FROM tenants t 
LEFT JOIN appointments a ON t.id = a.tenant_id 
GROUP BY t.name;"
```

---

## 🔑 Datos de Prueba

### Tenant 1: Clínica Dental ABC
- **Users**: 3 (Carlos/ADMIN, María/DENTIST, Juan/ASSISTANT)
- **Staff**: 3 (María con usuario, Jorge sin usuario, Sofia sin usuario)
- **Patients**: 3 (Pedro, Ana, Luis)
- **Appointments**: 3 (todas con María como dentista)

### Tenant 2: Dental Care Premium
- **Users**: 3 (Laura/ADMIN, Roberto/DENTIST, Patricia/ASSISTANT)
- **Staff**: 4 (Roberto con usuario, Elena sin usuario, Ricardo sin usuario, Carmen sin usuario)
- **Patients**: 4 (María, Carlos, Rosa, Jorge)
- **Appointments**: 3 (todas con Roberto como dentista)

---

## 🐛 Troubleshooting

### Problema: Puerto 5432 ya en uso
**Solución**: Cambiar el puerto en docker-compose.yml:
```yaml
ports:
  - "5433:5432"  # Usar 5433 en host, 5432 en contenedor
```

### Problema: Init script no se ejecuta
**Solución**: 
1. Detener contenedor: `docker-compose down`
2. Eliminar volumen: `docker volume rm docker_postgres_data`
3. Volver a levantar: `docker-compose up -d`

### Problema: Permisos en init.sql
**Solución**: Verificar que el archivo tenga permisos de lectura:
```bash
chmod 644 docker/postgres/init.sql
```

---

## 🔄 Comandos Útiles

### Detener contenedor
```bash
docker-compose -f docker/docker-compose.yml down
```

### Ver logs
```bash
docker logs dental-postgres
```

### Conectarse a PostgreSQL
```bash
docker exec -it dental-postgres psql -U dental_user -d dental_db
```

### Backup de datos
```bash
docker exec dental-postgres pg_dump -U dental_user dental_db > backup.sql
```

### Restore de datos
```bash
docker exec -i dental-postgres psql -U dental_user dental_db < backup.sql
```

---

**🎯 Siguiente paso**: Ejecutar `sdd/historia-usuario-01-autenticacion.md`
