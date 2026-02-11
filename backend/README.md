# Backend - Dental SaaS

Sistema backend reactivo basado en Spring Boot 3.2.1 + WebFlux + R2DBC + PostgreSQL.

## 📋 Requisitos

- **JDK 21** (Eclipse Adoptium/Temurin recomendado)
- **PostgreSQL 15+** (vía Docker o instalación local)
- **Gradle 8.5** (incluido wrapper)

## 🚀 Inicio Rápido

### Windows (PowerShell)
```powershell
# Build + Run
.\run-backend.ps1

# Solo compilar
.\run-backend.ps1 -Build

# Solo ejecutar
.\run-backend.ps1 -Run
```

### Linux/Mac (Bash)
```bash
# Dar permisos de ejecución (solo primera vez)
chmod +x run-backend.sh

# Build + Run
./run-backend.sh

# Solo compilar
./run-backend.sh build

# Solo ejecutar
./run-backend.sh run
```

### Alternativa (Cualquier plataforma)
```bash
# Build
./gradlew clean build -x test

# Run
./gradlew bootRun

# Windows: usar gradlew.bat en lugar de ./gradlew
```

## 🗄️ Base de Datos

Levantar PostgreSQL con Docker:

```bash
cd ../docker
docker-compose up -d
```

## 🔧 Configuración

El proyecto usa **Gradle Toolchains** para detectar automáticamente JDK 21.

Si necesitas especificar manualmente el JDK, puedes:

1. Configurar `JAVA_HOME`:
   ```bash
   # Windows
   $env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"
   
   # Linux/Mac
   export JAVA_HOME=/path/to/jdk-21
   ```

2. O crear `gradle.properties` (excluido de Git):
   ```properties
   org.gradle.java.home=/path/to/jdk-21
   ```

## 📡 Endpoints

- **URL Base**: `http://localhost:8080`
- **Auth**: `POST /api/auth/login`
- **Pacientes**: `/api/patients`
- **Personal**: `/api/staff`
- **Citas**: `/api/appointments`
- **Usuarios**: `/api/users`

## 🧪 Testing

```bash
./gradlew test

# Windows
.\gradlew.bat test
```

## 📦 Build para Producción

```bash
./gradlew clean build

# JAR generado en: build/libs/dental-saas-backend-0.0.1-SNAPSHOT.jar
```

## 🐛 Solución de Problemas

### "Cannot find java executable"
- Verifica que JDK 21 esté instalado
- Configura `JAVA_HOME` correctamente
- Usa los scripts `run-backend.ps1` o `run-backend.sh`

### "Connection refused" (Base de datos)
- Verifica que PostgreSQL esté corriendo: `docker-compose ps`
- Levanta Docker: `docker-compose up -d`

## 🏗️ Arquitectura

```
backend/
├── src/main/java/com/dental/
│   ├── config/         # Configuraciones (Security, CORS)
│   ├── controller/     # REST Controllers
│   ├── domain/         # Entidades de dominio
│   ├── dto/            # Data Transfer Objects
│   ├── repository/     # Repositories R2DBC
│   ├── security/       # JWT y autenticación
│   └── service/        # Lógica de negocio
└── src/main/resources/
    └── application.yml # Configuración de la aplicación
```

## 📝 Tecnologías

- Spring Boot 3.2.1
- Spring WebFlux (Reactive)
- Spring Data R2DBC
- PostgreSQL + R2DBC Driver
- Spring Security + JWT
- Lombok
- Gradle 8.5
