# Migración: Eliminar campo daily_brushing_detail

## ⚠️ IMPORTANTE: Aplicar DESPUÉS de reiniciar el backend

Esta migración elimina la columna `daily_brushing_detail` de la tabla `medical_history`.

## Pasos para aplicar:

### 1. Compilar el backend actualizado
```powershell
cd C:\git_proyectos\dental-saas-mvp\backend
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot"
.\gradlew clean build -x test
```

### 2. Aplicar la migración SQL
```powershell
Get-Content C:\git_proyectos\dental-saas-mvp\docker\postgres\migrations\002_remove_daily_brushing_detail.sql | wsl -e docker exec -i dental-postgres psql -U dental_user -d dental_db
```

### 3. Reiniciar el backend
```powershell
cd C:\git_proyectos\dental-saas-mvp\backend
.\run-backend.ps1
```

### 4. Reiniciar el frontend (si está corriendo)
El frontend debería recargar automáticamente. Si no, hacer Ctrl+C y:
```powershell
cd C:\git_proyectos\dental-saas-mvp\frontend
npm run dev
```

## Verificación

Después de aplicar la migración, verifica que la columna fue eliminada:

```sql
-- Conectar a la base de datos
wsl docker exec -it dental-postgres psql -U dental_user -d dental_db

-- Ver la estructura de la tabla
\d medical_history

-- Deberías ver que ya NO existe la columna daily_brushing_detail
```

## Rollback (si es necesario)

Si necesitas revertir esta migración:

```sql
ALTER TABLE medical_history ADD COLUMN daily_brushing_detail VARCHAR(500);
```

Pero tendrías que revertir también los cambios en el código.

## Cambios realizados:

✅ **Frontend:**
- Eliminado campo del formulario (input de texto adicional)
- Eliminado de types/medicalHistory.types.ts (ambas interfaces)
- Eliminado del estado del componente MedicalHistoryTab

✅ **Backend:**
- Eliminado de MedicalHistory.java (Entity)
- Eliminado de MedicalHistoryDTO.java
- Eliminado de CreateMedicalHistoryRequest.java
- Eliminado de MedicalHistoryService.java (createOrUpdate y toDTO)

✅ **Base de datos:**
- Migración SQL preparada: 002_remove_daily_brushing_detail.sql
