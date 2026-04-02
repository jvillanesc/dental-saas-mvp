# Aplicar Migración de Medical History

## Pasos para aplicar la migración

### Opción 1: Desde PowerShell/WSL
```bash
wsl docker exec -i dental-saas-postgres psql -U postgres -d dental_saas < docker/postgres/migrations/001_add_medical_history.sql
```

### Opción 2: Desde la línea de comandos de Docker
```bash
docker exec -i dental-saas-postgres psql -U postgres -d dental_saas -f /docker-entrypoint-initdb.d/migrations/001_add_medical_history.sql
```

### Opción 3: Copiar y pegar directamente en psql
1. Conectarse al contenedor:
```bash
wsl docker exec -it dental-saas-postgres psql -U postgres -d dental_saas
```

2. Copiar y pegar el contenido del archivo `docker/postgres/migrations/001_add_medical_history.sql`

## Verificar la migración

Después de aplicar, verifica la tabla:

```sql
\dt medical_history
```

Verifica los datos de la tabla:
```sql
\d medical_history
```

Verifica el índice:
```sql
\di medical_history*
```

## SQL de la migración

El archivo está en: `docker/postgres/migrations/001_add_medical_history.sql`

Esta migración crea:
- Tabla `medical_history` con 30+ campos para historia clínica
- Índice único para garantizar un solo registro por paciente por tenant
- Campos de auditoría (createdAt, updatedAt, deletedAt)
- Foreign keys a `tenants` y `patients`
