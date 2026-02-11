# 📘 ESPECIFICACIONES TÉCNICAS - BACKEND

**Proyecto**: Dental SaaS MVP  
**Tecnología**: Spring Boot 3.2.1 + WebFlux + R2DBC  
**Fecha**: 25 de enero de 2026  
**Versión**: 2.0

---

## 🎯 Objetivos

Backend 100% reactivo para sistema SaaS multitenant de gestión de clínicas dentales con:
- ✅ API REST reactiva con Spring WebFlux
- ✅ Persistencia reactiva con R2DBC PostgreSQL
- ✅ Autenticación JWT con multi-tenancy
- ✅ Soft deletes en todas las entidades
- ✅ Validaciones de negocio robustas

---

## 🏗️ Arquitectura Backend

```
┌─────────────────────────────────────────────────────────────┐
│                  SPRING BOOT APPLICATION                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │              REST CONTROLLERS                      │     │
│  │  ┌──────────────────────────────────────────────┐ │     │
│  │  │ @RestController                               │ │     │
│  │  │ - AuthController      (/api/auth/login)      │ │     │
│  │  │ - PatientController   (/api/patients)        │ │     │
│  │  │ - StaffController     (/api/staff)           │ │     │
│  │  │ - AppointmentController (/api/appointments)  │ │     │
│  │  │ - UserController      (/api/dentists)        │ │     │
│  │  └──────────────────────────────────────────────┘ │     │
│  └────────────────────────────────────────────────────┘     │
│                         ↓                                     │
│  ┌────────────────────────────────────────────────────┐     │
│  │              SERVICES (Business Logic)             │     │
│  │  - AuthService        (JWT generation)             │     │
│  │  - PatientService     (CRUD + validations)         │     │
│  │  - StaffService       (CRUD + user creation)       │     │
│  │  - AppointmentService (Schedule management)        │     │
│  └────────────────────────────────────────────────────┘     │
│                         ↓                                     │
│  ┌────────────────────────────────────────────────────┐     │
│  │         REPOSITORIES (R2DBC Reactive)              │     │
│  │  - TenantRepository                                │     │
│  │  - UserRepository                                  │     │
│  │  - StaffRepository                                 │     │
│  │  - PatientRepository                               │     │
│  │  - AppointmentRepository                           │     │
│  └────────────────────────────────────────────────────┘     │
│                         ↓                                     │
│  ┌────────────────────────────────────────────────────┐     │
│  │            R2DBC PostgreSQL Driver                 │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL 15 Database                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Dependencias (build.gradle)

```gradle
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.2.1'
    id 'io.spring.dependency-management' version '1.1.4'
}

group = 'com.dental'
version = '0.0.1-SNAPSHOT'

java {
    sourceCompatibility = '21'
}

repositories {
    mavenCentral()
}

dependencies {
    // Spring Boot WebFlux (Reactive)
    implementation 'org.springframework.boot:spring-boot-starter-webflux'
    
    // Spring Data R2DBC (Reactive Database)
    implementation 'org.springframework.boot:spring-boot-starter-data-r2dbc'
    
    // PostgreSQL R2DBC Driver
    implementation 'org.postgresql:r2dbc-postgresql:1.0.2.RELEASE'
    
    // Spring Security (JWT)
    implementation 'org.springframework.boot:spring-boot-starter-security'
    
    // JWT Token
    implementation 'io.jsonwebtoken:jjwt-api:0.12.3'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.3'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.3'
    
    // Validation
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    
    // Lombok (opcional)
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
    
    // Testing
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'io.projectreactor:reactor-test'
}

tasks.named('test') {
    useJUnitPlatform()
}
```

---

## 📁 Estructura de Proyecto

```
backend/
├── src/main/java/com/dental/
│   ├── DentalApplication.java                    # Main class
│   │
│   ├── config/                                   # Configuraciones
│   │   ├── SecurityConfig.java                   # Security + JWT
│   │   ├── R2dbcConfig.java                      # R2DBC config
│   │   └── WebConfig.java                        # CORS, etc.
│   │
│   ├── domain/                                   # Capa de dominio
│   │   ├── model/                                # Entidades
│   │   │   ├── Tenant.java                       # Clínica/tenant
│   │   │   ├── User.java                         # 🔐 Usuario login
│   │   │   ├── Staff.java                        # 👨‍⚕️ Personal médico
│   │   │   ├── Patient.java                      # Pacientes
│   │   │   └── Appointment.java                  # Citas
│   │   │
│   │   └── enums/                                # Enumeraciones
│   │       ├── Role.java                         # ADMIN, DENTIST, ASSISTANT
│   │       ├── AppointmentStatus.java            # SCHEDULED, CONFIRMED, etc.
│   │       └── Specialty.java                    # Especialidades médicas
│   │
│   ├── repository/                               # Repositorios R2DBC
│   │   ├── TenantRepository.java
│   │   ├── UserRepository.java
│   │   ├── StaffRepository.java
│   │   ├── PatientRepository.java
│   │   └── AppointmentRepository.java
│   │
│   ├── service/                                  # Servicios (lógica negocio)
│   │   ├── AuthService.java                      # Autenticación + JWT
│   │   ├── UserService.java
│   │   ├── StaffService.java
│   │   ├── PatientService.java
│   │   └── AppointmentService.java
│   │
│   ├── controller/                               # Controllers REST
│   │   ├── AuthController.java                   # POST /api/auth/login
│   │   ├── PatientController.java                # CRUD /api/patients
│   │   ├── StaffController.java                  # CRUD /api/staff
│   │   ├── AppointmentController.java            # CRUD /api/appointments
│   │   └── UserController.java                   # GET /api/dentists
│   │
│   ├── dto/                                      # Data Transfer Objects
│   │   ├── LoginRequest.java
│   │   ├── LoginResponse.java
│   │   ├── UserDTO.java
│   │   ├── StaffDTO.java
│   │   ├── PatientDTO.java
│   │   ├── AppointmentDTO.java
│   │   ├── CreateStaffRequest.java
│   │   └── UpdateStaffRequest.java
│   │
│   ├── security/                                 # Seguridad y JWT
│   │   ├── JwtUtil.java                          # Generación/validación JWT
│   │   ├── JwtAuthenticationFilter.java          # Filtro JWT
│   │   └── SecurityContextRepository.java        # Contexto reactivo
│   │
│   ├── exception/                                # Manejo de excepciones
│   │   ├── GlobalExceptionHandler.java
│   │   ├── ResourceNotFoundException.java
│   │   └── BusinessException.java
│   │
│   └── util/                                     # Utilidades
│       └── TenantContextHolder.java              # Contexto tenant reactivo
│
└── src/main/resources/
    ├── application.yml                           # Configuración principal
    └── logback-spring.xml                        # Logs (opcional)
```

---

## ⚙️ Configuración (application.yml)

```yaml
spring:
  application:
    name: dental-saas-backend
  
  r2dbc:
    url: r2dbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:dental_db}
    username: ${DB_USER:dental_user}
    password: ${DB_PASSWORD:dental_pass}
    properties:
      schema: public
  
  sql:
    init:
      mode: never  # ⚠️ IMPORTANTE: Docker init.sql maneja la DB
  
  security:
    user:
      name: admin
      password: admin

server:
  port: 8080

jwt:
  secret: ${JWT_SECRET:mySecretKeyForJWTTokenGenerationThatShouldBeAtLeast256BitsLongForHS256Algorithm}
  expiration: 28800000  # 8 horas en milisegundos

logging:
  level:
    root: INFO
    com.dental: DEBUG
    io.r2dbc.postgresql: DEBUG
```

---

## 🗄️ Modelo de Datos (Entidades)

### 1. Tenant.java
```java
package com.dental.domain.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import java.time.LocalDateTime;
import java.util.UUID;

@Table("tenants")
public class Tenant {
    @Id
    private UUID id;
    private String name;
    private String contactEmail;
    private String phone;
    private Boolean active;
    private LocalDateTime createdAt;
    
    // Getters y Setters
}
```

### 2. User.java (Usuarios de login)
```java
package com.dental.domain.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import java.time.LocalDateTime;
import java.util.UUID;

@Table("users")
public class User {
    @Id
    private UUID id;
    private UUID tenantId;
    private UUID staffId;           // Relación opcional con Staff
    private String email;
    private String password;        // BCrypt hash
    private String firstName;
    private String lastName;
    private String role;            // ADMIN, DENTIST, ASSISTANT
    private Boolean active;
    private LocalDateTime createdAt;
    
    // Getters y Setters
}
```

### 3. Staff.java (Personal médico)
```java
package com.dental.domain.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Table("staff")
public class Staff {
    @Id
    private UUID id;
    private UUID tenantId;
    private UUID userId;            // Relación opcional con User
    private String firstName;
    private String lastName;
    private String phone;
    private String email;
    private String specialty;       // Odontología General, etc.
    private String licenseNumber;   // Número de licencia única
    private LocalDate hireDate;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt; // Soft delete
    
    // Getters y Setters
}
```

### 4. Patient.java
```java
package com.dental.domain.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Table("patients")
public class Patient {
    @Id
    private UUID id;
    private UUID tenantId;
    private String firstName;
    private String lastName;
    private String phone;
    private String email;
    private LocalDate birthDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt; // Soft delete
    
    // Getters y Setters
}
```

### 5. Appointment.java
```java
package com.dental.domain.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import java.time.LocalDateTime;
import java.util.UUID;

@Table("appointments")
public class Appointment {
    @Id
    private UUID id;
    private UUID tenantId;
    private UUID patientId;
    private UUID dentistId;         // FK a users.id (solo usuarios con rol DENTIST)
    private LocalDateTime startTime;
    private Integer durationMinutes;
    private String status;          // SCHEDULED, CONFIRMED, COMPLETED, CANCELLED
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Getters y Setters
}
```

---

## 🔐 Seguridad y JWT

### JwtUtil.java (Generación y validación de tokens)
```java
package com.dental.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {
    
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration}")
    private Long expiration;
    
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
    
    public String generateToken(UUID userId, UUID tenantId, String email, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);
        
        return Jwts.builder()
                .setSubject(userId.toString())
                .claim("tenantId", tenantId.toString())
                .claim("email", email)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    
    public Claims validateToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
```

### SecurityConfig.java
```java
package com.dental.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .csrf().disable()
                .authorizeExchange()
                    .pathMatchers("/api/auth/**").permitAll()
                    .anyExchange().authenticated()
                .and()
                .httpBasic().disable()
                .formLogin().disable()
                .build();
    }
}
```

---

## 🔄 Patrón Reactivo

### Ejemplo de Service (PatientService.java)
```java
package com.dental.service;

import com.dental.domain.model.Patient;
import com.dental.dto.PatientDTO;
import com.dental.repository.PatientRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PatientService {
    
    private final PatientRepository patientRepository;
    
    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }
    
    public Flux<PatientDTO> getAllPatients(UUID tenantId) {
        return patientRepository.findByTenantIdAndNotDeleted(tenantId)
                .map(this::toDTO);
    }
    
    public Mono<PatientDTO> createPatient(UUID tenantId, PatientDTO dto) {
        Patient patient = new Patient();
        patient.setTenantId(tenantId);
        patient.setFirstName(dto.getFirstName());
        patient.setLastName(dto.getLastName());
        patient.setPhone(dto.getPhone());
        patient.setEmail(dto.getEmail());
        patient.setBirthDate(dto.getBirthDate());
        patient.setCreatedAt(LocalDateTime.now());
        
        return patientRepository.save(patient)
                .map(this::toDTO);
    }
    
    public Mono<PatientDTO> updatePatient(UUID id, UUID tenantId, PatientDTO dto) {
        return patientRepository.findByIdAndTenantId(id, tenantId)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Patient not found")))
                .flatMap(patient -> {
                    patient.setFirstName(dto.getFirstName());
                    patient.setLastName(dto.getLastName());
                    patient.setPhone(dto.getPhone());
                    patient.setEmail(dto.getEmail());
                    patient.setBirthDate(dto.getBirthDate());
                    patient.setUpdatedAt(LocalDateTime.now());
                    return patientRepository.save(patient);
                })
                .map(this::toDTO);
    }
    
    public Mono<Void> deletePatient(UUID id, UUID tenantId) {
        return patientRepository.findByIdAndTenantId(id, tenantId)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Patient not found")))
                .flatMap(patient -> {
                    patient.setDeletedAt(LocalDateTime.now());
                    return patientRepository.save(patient);
                })
                .then();
    }
    
    private PatientDTO toDTO(Patient patient) {
        PatientDTO dto = new PatientDTO();
        dto.setId(patient.getId());
        dto.setFirstName(patient.getFirstName());
        dto.setLastName(patient.getLastName());
        dto.setFullName(patient.getFirstName() + " " + patient.getLastName());
        dto.setPhone(patient.getPhone());
        dto.setEmail(patient.getEmail());
        dto.setBirthDate(patient.getBirthDate());
        return dto;
    }
}
```

---

## 🌐 Controladores REST

### Ejemplo de Controller (PatientController.java)
```java
package com.dental.controller;

import com.dental.dto.PatientDTO;
import com.dental.service.PatientService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.util.UUID;

@RestController
@RequestMapping("/api/patients")
public class PatientController {
    
    private final PatientService patientService;
    
    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }
    
    @GetMapping
    public Mono<ResponseEntity<Flux<PatientDTO>>> getAllPatients() {
        return Mono.deferContextual(ctx -> {
            UUID tenantId = ctx.get("tenantId");
            return Mono.just(ResponseEntity.ok(patientService.getAllPatients(tenantId)));
        });
    }
    
    @PostMapping
    public Mono<ResponseEntity<PatientDTO>> createPatient(@RequestBody PatientDTO dto) {
        return Mono.deferContextual(ctx -> {
            UUID tenantId = ctx.get("tenantId");
            return patientService.createPatient(tenantId, dto)
                    .map(created -> ResponseEntity.status(HttpStatus.CREATED).body(created));
        });
    }
    
    @PutMapping("/{id}")
    public Mono<ResponseEntity<PatientDTO>> updatePatient(
            @PathVariable UUID id,
            @RequestBody PatientDTO dto) {
        return Mono.deferContextual(ctx -> {
            UUID tenantId = ctx.get("tenantId");
            return patientService.updatePatient(id, tenantId, dto)
                    .map(ResponseEntity::ok);
        });
    }
    
    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deletePatient(@PathVariable UUID id) {
        return Mono.deferContextual(ctx -> {
            UUID tenantId = ctx.get("tenantId");
            return patientService.deletePatient(id, tenantId)
                    .then(Mono.just(ResponseEntity.noContent().<Void>build()));
        });
    }
}
```

---

## ✅ Checklist de Implementación

### Configuración Inicial
- [ ] Crear proyecto Spring Boot con Spring Initializr
- [ ] Configurar build.gradle con todas las dependencias
- [ ] Crear application.yml con configuración R2DBC
- [ ] ⚠️ **IMPORTANTE**: `spring.sql.init.mode=never`

### Dominio
- [ ] Crear todas las entidades (Tenant, User, Staff, Patient, Appointment)
- [ ] Crear enums (Role, AppointmentStatus, Specialty)
- [ ] ⚠️ **CRÍTICO**: User y Staff son entidades SEPARADAS

### Repositorios
- [ ] Crear interfaces que extiendan ReactiveCrudRepository
- [ ] Agregar queries personalizadas con @Query
- [ ] Incluir soft delete en queries (WHERE deleted_at IS NULL)

### Servicios
- [ ] Implementar lógica de negocio en services
- [ ] Manejar contexto de tenant (tenantId)
- [ ] Validaciones de negocio

### Controladores
- [ ] Crear REST controllers con @RestController
- [ ] Mapear endpoints (/api/patients, /api/staff, etc.)
- [ ] Extraer tenantId del contexto reactivo

### Seguridad
- [ ] Implementar JwtUtil para generar/validar tokens
- [ ] Configurar SecurityConfig
- [ ] Crear filtro JWT para autenticar requests
- [ ] AuthService para login

### Testing
- [ ] Probar endpoints con Postman/curl
- [ ] Verificar multi-tenancy (tenantId en queries)
- [ ] Validar soft deletes

---

## 🐛 Errores Comunes y Soluciones

### Error: "No schema scripts found at location 'classpath:schema.sql'"
**Solución**: Configurar en application.yml:
```yaml
spring:
  sql:
    init:
      mode: never
```

### Error: BCrypt password validation fails
**Solución**: Usar hash consistente en init.sql:
```sql
-- Password: "password123"
'$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
```

### Error: Queries no filtran por tenant
**Solución**: Siempre incluir tenantId en queries:
```java
@Query("SELECT * FROM patients WHERE tenant_id = :tenantId AND deleted_at IS NULL")
Flux<Patient> findByTenantIdAndNotDeleted(UUID tenantId);
```

---

## 📞 Testing

### Probar Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinicaabc.com","password":"password123"}'
```

### Probar Endpoint Protegido
```bash
curl http://localhost:8080/api/patients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

**🎯 Siguiente paso**: Ejecutar `sdd/specs-tecnicas-frontend.md`
