# 📚 README - Sistema SDD Dental SaaS

## ✅ Estado de Archivos Creados

### ✓ Archivos Completados
1. **PROMPT-PRINCIPAL.md** - Archivo maestro que orquesta todo
2. **specs-tecnicas-backend.md** - Especificaciones completas del backend
3. **specs-tecnicas-frontend.md** - Especificaciones completas del frontend

### 📋 Archivos Pendientes de Crear
Los siguientes archivos deben crearse según necesidad:

4. **specs-docker-database.md** - Docker compose + init.sql
5. **historia-usuario-01-autenticacion.md** - Login + JWT
6. **historia-usuario-02-gestion-pacientes.md** - CRUD Pacientes
7. **historia-usuario-03-gestion-staff.md** - CRUD Staff
8. **historia-usuario-04-agenda-citas.md** - Calendario + Citas
9. **integracion-final.md** - Testing E2E

---

## 🚀 Cómo Usar Este Sistema SDD

### Paso 1: Leer el Prompt Principal
```bash
# Abrir y leer completamente
sdd/PROMPT-PRINCIPAL.md
```

Este archivo contiene:
- ✅ Arquitectura global del sistema
- ✅ Lecciones aprendidas de errores pasados
- ✅ Orden de ejecución de todos los prompts
- ✅ Troubleshooting común

### Paso 2: Ejecutar Especificaciones Técnicas
```bash
# En orden:
1. sdd/specs-tecnicas-backend.md    # Leer arquitectura backend
2. sdd/specs-tecnicas-frontend.md   # Leer arquitectura frontend
3. sdd/specs-docker-database.md     # Crear Docker + init.sql (pendiente)
```

### Paso 3: Implementar Historias de Usuario
```bash
# Ejecutar en orden secuencial:
4. sdd/historia-usuario-01-autenticacion.md    (pendiente)
5. sdd/historia-usuario-02-gestion-pacientes.md (pendiente)
6. sdd/historia-usuario-03-gestion-staff.md     (pendiente)
7. sdd/historia-usuario-04-agenda-citas.md      (pendiente)
```

### Paso 4: Integración Final
```bash
8. sdd/integracion-final.md (pendiente)
```

---

## 🎯 Metodología SDD

### Principios
1. **Spec-First**: Escribir la especificación completa antes de codificar
2. **Un archivo por historia**: Cada funcionalidad en su propio .md
3. **Separación de concerns**: Backend, Frontend, DB en archivos distintos
4. **Trazabilidad**: Cada cambio documentado y referenciado
5. **Lecciones aprendidas**: Errores documentados para no repetirlos

### Ventajas
- ✅ Documentación siempre actualizada
- ✅ Fácil onboarding de nuevos desarrolladores
- ✅ Trazabilidad de decisiones técnicas
- ✅ Reducción de bugs por especificaciones claras
- ✅ Facilita code reviews

---

## 📁 Estructura Final del Proyecto

```
Dental/
├── sdd/                                    # 📚 Documentación SDD
│   ├── README.md                           # Este archivo
│   ├── PROMPT-PRINCIPAL.md                 # ✅ Prompt maestro
│   ├── specs-tecnicas-backend.md           # ✅ Backend specs
│   ├── specs-tecnicas-frontend.md          # ✅ Frontend specs
│   ├── specs-docker-database.md            # ⏳ Pendiente
│   ├── historia-usuario-01-autenticacion.md # ⏳ Pendiente
│   ├── historia-usuario-02-gestion-pacientes.md # ⏳ Pendiente
│   ├── historia-usuario-03-gestion-staff.md # ⏳ Pendiente
│   ├── historia-usuario-04-agenda-citas.md # ⏳ Pendiente
│   └── integracion-final.md                # ⏳ Pendiente
│
├── backend/                                # ☕ Spring Boot (por crear)
├── frontend/                               # ⚛️ React (por crear)
└── docker/                                 # 🐳 PostgreSQL (por crear)
```

---

## 🔑 Decisiones Técnicas Clave

### 1. User vs Staff (SEPARADOS desde el inicio)
- **users**: Cuentas de acceso (email, password, role)
- **staff**: Personal médico (specialty, licenseNumber)
- **Relación**: staff.userId → users.id (opcional)

### 2. Solo Docker para DB
- ✅ PostgreSQL en Docker
- ❌ Backend: ejecutar con ./gradlew bootRun
- ❌ Frontend: ejecutar con npm run dev

### 3. Un solo archivo SQL
- ✅ docker/postgres/init.sql (estructura + datos)
- ❌ NO usar schema.sql en backend
- ⚠️ application.yml: spring.sql.init.mode=never

### 4. BCrypt passwords consistentes
- Hash: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`
- Plaintext: "password123"

### 5. Endpoint /api/dentists
- Retorna solo `staff` con `userId IS NOT NULL`
- Para crear citas (appointments.dentist_id → users.id)

---

## 📝 Próximos Pasos

### Para continuar el desarrollo:

1. **Crear specs-docker-database.md**
   - Docker compose configuration
   - init.sql con estructura completa de 5 tablas
   - Datos de prueba (2 tenants, 6 users, 7 staff, 7 patients, 6 appointments)

2. **Crear historias de usuario** (una por una):
   - HU-01: Autenticación (login, JWT, protected routes)
   - HU-02: Gestión Pacientes (CRUD completo)
   - HU-03: Gestión Staff (CRUD + creación de usuario)
   - HU-04: Agenda Citas (calendario semanal + CRUD)

3. **Implementar cada historia**:
   - Leer el archivo .md de la historia
   - Implementar backend (entity, repo, service, controller)
   - Implementar frontend (page, modal, service, types)
   - Probar manualmente
   - Marcar como completado

4. **Integración final**:
   - Testing E2E
   - Validaciones cruzadas
   - Performance checks
   - Documentación de API

---

## 🎓 Lecciones Aprendidas Aplicadas

### ❌ → ✅ Error 1: Users y Staff mezclados
**Antes**: Solo tabla users con roles  
**Ahora**: users (login) + staff (personal médico) separados desde día 1

### ❌ → ✅ Error 2: schema.sql + init.sql duplicados
**Antes**: Spring Boot buscaba schema.sql  
**Ahora**: Solo init.sql en Docker, backend con mode=never

### ❌ → ✅ Error 3: BCrypt passwords no validaban
**Antes**: Hashes generados manualmente  
**Ahora**: Hash consistente documentado

### ❌ → ✅ Error 4: Staff sin usuario no pueden tener citas
**Antes**: appointments.dentist_id → staff.id  
**Ahora**: appointments.dentist_id → users.id (solo staff con userId)

### ❌ → ✅ Error 5: gradlew no ejecutable en Alpine
**Antes**: ./gradlew en Dockerfile Alpine  
**Ahora**: Instalar Gradle directamente con wget

### ❌ → ✅ Error 6: TypeScript compilation errors
**Antes**: Sin vite-env.d.ts, imports React no usados  
**Ahora**: vite-env.d.ts creado, imports limpios

---

## 📞 Soporte

Si encuentras problemas:
1. Revisar sección "Troubleshooting" en PROMPT-PRINCIPAL.md
2. Revisar sección "Errores Comunes" en specs técnicas
3. Verificar logs (backend: terminal bootRun, frontend: browser console)
4. Consultar archivo de historia de usuario específica

---

## 📚 Referencias

- [PROMPT-PRINCIPAL.md](./PROMPT-PRINCIPAL.md) - Punto de entrada
- [specs-tecnicas-backend.md](./specs-tecnicas-backend.md) - Arquitectura backend
- [specs-tecnicas-frontend.md](./specs-tecnicas-frontend.md) - Arquitectura frontend

---

**Creado**: 25 de enero de 2026  
**Metodología**: Spec-Driven Development (SDD)  
**Estado**: Estructura base lista, historias de usuario pendientes
