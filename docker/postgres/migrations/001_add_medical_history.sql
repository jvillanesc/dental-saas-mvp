-- ========================================
-- MEDICAL HISTORY (Historia Clínica)
-- Versión: 1.0
-- Fecha: 10 de marzo de 2026
-- ========================================

-- ========================================
-- TABLA: MEDICAL_HISTORY
-- ========================================
CREATE TABLE IF NOT EXISTS medical_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    
    -- Antecedentes
    family_history TEXT,
    personal_history TEXT,
    additional_comments TEXT,
    
    -- Condiciones médicas (Si/No)
    high_blood_pressure BOOLEAN DEFAULT false,
    low_blood_pressure BOOLEAN DEFAULT false,
    hepatitis BOOLEAN DEFAULT false,
    gastritis BOOLEAN DEFAULT false,
    ulcers BOOLEAN DEFAULT false,
    hiv BOOLEAN DEFAULT false,
    diabetes BOOLEAN DEFAULT false,
    asthma BOOLEAN DEFAULT false,
    smoker BOOLEAN DEFAULT false,
    
    -- Enfermedades y condiciones adicionales
    blood_diseases BOOLEAN DEFAULT false,
    blood_diseases_detail TEXT,
    
    cardiac_problems BOOLEAN DEFAULT false,
    cardiac_problems_detail TEXT,
    
    other_disease BOOLEAN DEFAULT false,
    other_disease_detail TEXT,
    
    -- Hábitos dentales
    daily_brushing INTEGER,
    daily_brushing_detail TEXT,
    
    bleeding_gums BOOLEAN DEFAULT false,
    bleeding_gums_detail TEXT,
    
    abnormal_bleeding BOOLEAN DEFAULT false,
    abnormal_bleeding_detail TEXT,
    
    teeth_grinding BOOLEAN DEFAULT false,
    teeth_grinding_detail TEXT,
    
    mouth_discomfort BOOLEAN DEFAULT false,
    mouth_discomfort_detail TEXT,
    
    -- Alergias y cirugías
    allergies BOOLEAN DEFAULT false,
    allergies_detail TEXT,
    
    recent_surgery BOOLEAN DEFAULT false,
    recent_surgery_detail TEXT,
    
    permanent_medication BOOLEAN DEFAULT false,
    permanent_medication_detail TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- ========================================
-- ÍNDICES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_medical_history_tenant ON medical_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_medical_history_patient ON medical_history(tenant_id, patient_id) WHERE deleted_at IS NULL;

-- Un paciente solo puede tener un historial clínico activo
CREATE UNIQUE INDEX IF NOT EXISTS idx_medical_history_unique_patient 
ON medical_history(tenant_id, patient_id) 
WHERE deleted_at IS NULL;

-- ========================================
-- COMENTARIOS
-- ========================================
COMMENT ON TABLE medical_history IS 'Historia clínica de pacientes';
COMMENT ON COLUMN medical_history.family_history IS 'Antecedentes familiares';
COMMENT ON COLUMN medical_history.personal_history IS 'Antecedentes personales';
COMMENT ON COLUMN medical_history.daily_brushing IS 'Número de veces que se cepilla los dientes al día';
