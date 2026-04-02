-- ========================================
-- FIX MEDICAL HISTORY TABLE - Add DEFAULT for ID
-- ========================================

-- Agregar DEFAULT para generar UUID automáticamente si no existe
ALTER TABLE medical_history 
ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Agregar constraint único si no existe (ignorar si ya existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_active_medical_history'
    ) THEN
        ALTER TABLE medical_history 
        ADD CONSTRAINT unique_active_medical_history 
        UNIQUE (tenant_id, patient_id, deleted_at);
    END IF;
END $$;

-- Crear índice si no existe
CREATE INDEX IF NOT EXISTS idx_medical_history_tenant_patient 
ON medical_history(tenant_id, patient_id) 
WHERE deleted_at IS NULL;
