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
-- Hash BCrypt: $2a$10$k4OHFaIKKNfAzCr7fL8nQuqCHKralTk/ebLjOkMM8x1q6uD0V.ogK
-- ========================================

-- Usuarios de Clínica Dental ABC
INSERT INTO users (id, tenant_id, email, password, first_name, last_name, role, active) 
VALUES 
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'admin@clinicaabc.com', '$2a$10$k4OHFaIKKNfAzCr7fL8nQuqCHKralTk/ebLjOkMM8x1q6uD0V.ogK', 'Carlos', 'Administrador', 'ADMIN', true),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'dentist@clinicaabc.com', '$2a$10$k4OHFaIKKNfAzCr7fL8nQuqCHKralTk/ebLjOkMM8x1q6uD0V.ogK', 'María', 'Dentista', 'DENTIST', true),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'assistant@clinicaabc.com', '$2a$10$k4OHFaIKKNfAzCr7fL8nQuqCHKralTk/ebLjOkMM8x1q6uD0V.ogK', 'Juan', 'Asistente', 'ASSISTANT', true),
  -- Usuarios de Dental Care Premium
  ('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'admin@dentalcare.com', '$2a$10$k4OHFaIKKNfAzCr7fL8nQuqCHKralTk/ebLjOkMM8x1q6uD0V.ogK', 'Laura', 'Directora', 'ADMIN', true),
  ('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'dentist@dentalcare.com', '$2a$10$k4OHFaIKKNfAzCr7fL8nQuqCHKralTk/ebLjOkMM8x1q6uD0V.ogK', 'Roberto', 'Odontólogo', 'DENTIST', true),
  ('660e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', 'assistant@dentalcare.com', '$2a$10$k4OHFaIKKNfAzCr7fL8nQuqCHKralTk/ebLjOkMM8x1q6uD0V.ogK', 'Patricia', 'Auxiliar', 'ASSISTANT', true)
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

-- ========================================
-- CITAS ADICIONALES PARA HOY (2026-02-09)
-- ========================================

-- Citas de hoy para Clínica Dental ABC
INSERT INTO appointments (id, tenant_id, patient_id, dentist_id, start_time, duration_minutes, status, notes) 
VALUES 
  ('880e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', '2026-02-09 09:00:00', 60, 'SCHEDULED', 'Limpieza dental'),
  ('880e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '2026-02-09 11:00:00', 45, 'SCHEDULED', 'Control de ortodoncia'),
  ('880e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', '2026-02-09 14:30:00', 30, 'SCHEDULED', 'Consulta de urgencia'),
  -- Citas de hoy para Dental Care Premium
  ('880e8400-e29b-41d4-a716-446655440111', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440012', '2026-02-09 10:00:00', 60, 'SCHEDULED', 'Implantología - evaluación'),
  ('880e8400-e29b-41d4-a716-446655440112', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440012', '2026-02-09 13:00:00', 90, 'SCHEDULED', 'Tratamiento de conducto')
ON CONFLICT DO NOTHING;
