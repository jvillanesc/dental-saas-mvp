# 👨‍⚕️ HISTORIA DE USUARIO 03 - GESTIÓN DE STAFF

**Proyecto**: Dental SaaS MVP  
**Historia**: CRUD completo de Personal Médico (Staff)  
**Fecha**: 25 de enero de 2026  
**Versión**: 2.0

---

## 📖 Historia de Usuario

**Como** administrador del sistema  
**Quiero** gestionar personal médico (crear, listar, editar, eliminar)  
**Para** mantener actualizado el registro de doctores, higienistas y asistentes de mi clínica

---

## ✅ Criterios de Aceptación

### Backend
- [ ] Endpoint GET /api/staff retorna staff del tenant logueado
- [ ] Endpoint POST /api/staff crea nuevo staff (con opción de crear usuario)
- [ ] Endpoint PUT /api/staff/{id} actualiza staff
- [ ] Endpoint DELETE /api/staff/{id} hace soft delete
- [ ] Endpoint GET /api/dentists retorna solo staff con userId no nulo
- [ ] Validaciones: firstName, lastName, specialty, licenseNumber requeridos
- [ ] licenseNumber único por tenant
- [ ] Multi-tenancy: usuario solo ve/edita staff de su tenant

### Frontend
- [ ] Página StaffPage lista todo el personal
- [ ] Botón "Nuevo Staff" abre modal
- [ ] Modal con formulario para crear/editar staff
- [ ] Checkbox "Crear cuenta de usuario" al crear staff
- [ ] Select de especialidad con opciones predefinidas
- [ ] Botón "Editar" en cada fila abre modal con datos
- [ ] Botón "Eliminar" con confirmación
- [ ] Badge visual si staff tiene usuario asociado

---

## 🏗️ Arquitectura

```
┌──────────────────┐
│  StaffPage       │
│  ├─ Table        │
│  └─ Modal        │
│     ├─ Checkbox  │ "Crear cuenta de usuario"
│     └─ Select    │ Especialidad
└──────────────────┘
         ↓
┌────────────────────────────────────┐
│  staffService.ts                   │
│  ├─ getStaff()                     │
│  ├─ createStaff()                  │
│  ├─ updateStaff()                  │
│  └─ deleteStaff()                  │
└────────────────────────────────────┘
         ↓ HTTP REST (JWT Bearer)
┌────────────────────────────────────┐
│  Backend: StaffController          │
│  ├─ GET /api/staff                 │
│  ├─ POST /api/staff                │
│  ├─ PUT /api/staff/{id}            │
│  ├─ DELETE /api/staff/{id}         │
│  └─ GET /api/dentists              │
└────────────────────────────────────┘
         ↓
┌────────────────────────────────────┐
│  StaffService (Business Logic)     │
│  ├─ Crear User si createUser=true  │
│  └─ Vincular user_id con staff     │
└────────────────────────────────────┘
```

---

## 🔧 IMPLEMENTACIÓN BACKEND

### 1. Entidad Staff

**Ubicación**: `backend/src/main/java/com/dental/domain/model/Staff.java`

```java
package com.dental.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Table("staff")
public class Staff {
    @Id
    private UUID id;

    @Column("tenant_id")
    private UUID tenantId;

    @Column("user_id")
    private UUID userId; // Relación opcional con Users

    @Column("first_name")
    private String firstName;

    @Column("last_name")
    private String lastName;

    private String phone;
    private String email;

    private String specialty; // Odontología General, Ortodoncista, etc.

    @Column("license_number")
    private String licenseNumber;

    @Column("hire_date")
    private LocalDate hireDate;

    private Boolean active;

    @Column("created_at")
    private LocalDateTime createdAt;

    @Column("updated_at")
    private LocalDateTime updatedAt;

    @Column("deleted_at")
    private LocalDateTime deletedAt;
}
```

---

### 2. Repository

**Ubicación**: `backend/src/main/java/com/dental/repository/StaffRepository.java`

```java
package com.dental.repository;

import com.dental.domain.model.Staff;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface StaffRepository extends ReactiveCrudRepository<Staff, UUID> {

    @Query("SELECT * FROM staff WHERE tenant_id = :tenantId AND deleted_at IS NULL ORDER BY first_name, last_name")
    Flux<Staff> findByTenantId(UUID tenantId);

    @Query("SELECT * FROM staff WHERE id = :id AND tenant_id = :tenantId AND deleted_at IS NULL")
    Mono<Staff> findByIdAndTenantId(UUID id, UUID tenantId);

    @Query("SELECT * FROM staff WHERE tenant_id = :tenantId AND user_id IS NOT NULL AND active = true AND deleted_at IS NULL ORDER BY first_name, last_name")
    Flux<Staff> findDentistsByTenantId(UUID tenantId);

    @Query("SELECT COUNT(*) FROM staff WHERE tenant_id = :tenantId AND license_number = :licenseNumber AND deleted_at IS NULL")
    Mono<Long> countByTenantIdAndLicenseNumber(UUID tenantId, String licenseNumber);
}
```

---

### 3. DTOs

**Ubicación**: `backend/src/main/java/com/dental/dto/StaffDTO.java`

```java
package com.dental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffDTO {
    private UUID id;
    private UUID userId; // Para saber si tiene usuario asociado
    private String firstName;
    private String lastName;
    private String phone;
    private String email;
    private String specialty;
    private String licenseNumber;
    private LocalDate hireDate;
    private Boolean active;
}
```

**Ubicación**: `backend/src/main/java/com/dental/dto/CreateStaffRequest.java`

```java
package com.dental.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateStaffRequest {
    private String firstName;
    private String lastName;
    private String phone;
    private String email;
    private String specialty;
    private String licenseNumber;
    private LocalDate hireDate;
    private Boolean active;
    
    // Si es true, se crea un User asociado
    private Boolean createUser;
    private String password; // Requerido si createUser = true
}
```

---

### 4. StaffService

**Ubicación**: `backend/src/main/java/com/dental/service/StaffService.java`

```java
package com.dental.service;

import com.dental.domain.model.Staff;
import com.dental.domain.model.User;
import com.dental.dto.CreateStaffRequest;
import com.dental.dto.StaffDTO;
import com.dental.repository.StaffRepository;
import com.dental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StaffService {

    private final StaffRepository staffRepository;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public Flux<StaffDTO> getAllStaff(UUID tenantId) {
        log.info("Getting all staff for tenantId: {}", tenantId);
        return staffRepository.findByTenantId(tenantId)
                .map(this::toDTO);
    }

    public Flux<StaffDTO> getDentists(UUID tenantId) {
        log.info("Getting dentists (staff with users) for tenantId: {}", tenantId);
        return staffRepository.findDentistsByTenantId(tenantId)
                .map(this::toDTO);
    }

    public Mono<StaffDTO> getStaffById(UUID id, UUID tenantId) {
        log.info("Getting staff by id: {} for tenantId: {}", id, tenantId);
        return staffRepository.findByIdAndTenantId(id, tenantId)
                .map(this::toDTO);
    }

    public Mono<StaffDTO> createStaff(CreateStaffRequest request, UUID tenantId) {
        log.info("Creating staff for tenantId: {}", tenantId);

        // Validar licencia única
        return staffRepository.countByTenantIdAndLicenseNumber(tenantId, request.getLicenseNumber())
                .flatMap(count -> {
                    if (count > 0) {
                        return Mono.error(new RuntimeException("Ya existe un staff con este número de licencia"));
                    }

                    Staff staff = new Staff();
                    staff.setTenantId(tenantId);
                    staff.setFirstName(request.getFirstName());
                    staff.setLastName(request.getLastName());
                    staff.setPhone(request.getPhone());
                    staff.setEmail(request.getEmail());
                    staff.setSpecialty(request.getSpecialty());
                    staff.setLicenseNumber(request.getLicenseNumber());
                    staff.setHireDate(request.getHireDate());
                    staff.setActive(request.getActive() != null ? request.getActive() : true);
                    staff.setCreatedAt(LocalDateTime.now());

                    // Si se solicita crear usuario
                    if (request.getCreateUser() != null && request.getCreateUser()) {
                        return createUserForStaff(request, tenantId)
                                .flatMap(user -> {
                                    staff.setUserId(user.getId());
                                    return staffRepository.save(staff);
                                });
                    }

                    return staffRepository.save(staff);
                })
                .doOnSuccess(s -> log.info("Staff created with id: {}", s.getId()))
                .map(this::toDTO);
    }

    private Mono<User> createUserForStaff(CreateStaffRequest request, UUID tenantId) {
        log.info("Creating user for staff: {}", request.getEmail());

        User user = new User();
        user.setTenantId(tenantId);
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole("DENTIST");
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());

        return userRepository.save(user)
                .doOnSuccess(u -> log.info("User created for staff with id: {}", u.getId()));
    }

    public Mono<StaffDTO> updateStaff(UUID id, CreateStaffRequest request, UUID tenantId) {
        log.info("Updating staff id: {} for tenantId: {}", id, tenantId);

        return staffRepository.findByIdAndTenantId(id, tenantId)
                .switchIfEmpty(Mono.error(new RuntimeException("Staff no encontrado")))
                .flatMap(staff -> {
                    staff.setFirstName(request.getFirstName());
                    staff.setLastName(request.getLastName());
                    staff.setPhone(request.getPhone());
                    staff.setEmail(request.getEmail());
                    staff.setSpecialty(request.getSpecialty());
                    staff.setLicenseNumber(request.getLicenseNumber());
                    staff.setHireDate(request.getHireDate());
                    staff.setActive(request.getActive());
                    staff.setUpdatedAt(LocalDateTime.now());

                    return staffRepository.save(staff);
                })
                .doOnSuccess(s -> log.info("Staff updated: {}", s.getId()))
                .map(this::toDTO);
    }

    public Mono<Void> deleteStaff(UUID id, UUID tenantId) {
        log.info("Soft deleting staff id: {} for tenantId: {}", id, tenantId);

        return staffRepository.findByIdAndTenantId(id, tenantId)
                .switchIfEmpty(Mono.error(new RuntimeException("Staff no encontrado")))
                .flatMap(staff -> {
                    staff.setDeletedAt(LocalDateTime.now());
                    staff.setActive(false);
                    return staffRepository.save(staff);
                })
                .doOnSuccess(s -> log.info("Staff soft deleted: {}", s.getId()))
                .then();
    }

    private StaffDTO toDTO(Staff staff) {
        return new StaffDTO(
                staff.getId(),
                staff.getUserId(),
                staff.getFirstName(),
                staff.getLastName(),
                staff.getPhone(),
                staff.getEmail(),
                staff.getSpecialty(),
                staff.getLicenseNumber(),
                staff.getHireDate(),
                staff.getActive()
        );
    }
}
```

---

### 5. StaffController

**Ubicación**: `backend/src/main/java/com/dental/controller/StaffController.java`

```java
package com.dental.controller;

import com.dental.dto.CreateStaffRequest;
import com.dental.dto.StaffDTO;
import com.dental.service.StaffService;
import com.dental.util.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    @GetMapping
    public Flux<StaffDTO> getAllStaff(ServerWebExchange exchange) {
        return TenantContext.getTenantId(exchange)
                .flatMapMany(tenantId -> {
                    log.info("GET /api/staff - TenantId: {}", tenantId);
                    return staffService.getAllStaff(tenantId);
                });
    }

    @GetMapping("/dentists")
    public Flux<StaffDTO> getDentists(ServerWebExchange exchange) {
        return TenantContext.getTenantId(exchange)
                .flatMapMany(tenantId -> {
                    log.info("GET /api/staff/dentists - TenantId: {}", tenantId);
                    return staffService.getDentists(tenantId);
                });
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<StaffDTO>> getStaffById(
            @PathVariable UUID id,
            ServerWebExchange exchange
    ) {
        return TenantContext.getTenantId(exchange)
                .flatMap(tenantId -> {
                    log.info("GET /api/staff/{} - TenantId: {}", id, tenantId);
                    return staffService.getStaffById(id, tenantId)
                            .map(ResponseEntity::ok)
                            .defaultIfEmpty(ResponseEntity.notFound().build());
                });
    }

    @PostMapping
    public Mono<ResponseEntity<StaffDTO>> createStaff(
            @RequestBody CreateStaffRequest request,
            ServerWebExchange exchange
    ) {
        return TenantContext.getTenantId(exchange)
                .flatMap(tenantId -> {
                    log.info("POST /api/staff - TenantId: {}", tenantId);
                    return staffService.createStaff(request, tenantId)
                            .map(staff -> ResponseEntity.status(HttpStatus.CREATED).body(staff))
                            .onErrorResume(e -> {
                                log.error("Error creating staff: {}", e.getMessage());
                                return Mono.just(ResponseEntity.badRequest().build());
                            });
                });
    }

    @PutMapping("/{id}")
    public Mono<ResponseEntity<StaffDTO>> updateStaff(
            @PathVariable UUID id,
            @RequestBody CreateStaffRequest request,
            ServerWebExchange exchange
    ) {
        return TenantContext.getTenantId(exchange)
                .flatMap(tenantId -> {
                    log.info("PUT /api/staff/{} - TenantId: {}", id, tenantId);
                    return staffService.updateStaff(id, request, tenantId)
                            .map(ResponseEntity::ok)
                            .onErrorReturn(ResponseEntity.notFound().build());
                });
    }

    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deleteStaff(
            @PathVariable UUID id,
            ServerWebExchange exchange
    ) {
        return TenantContext.getTenantId(exchange)
                .flatMap(tenantId -> {
                    log.info("DELETE /api/staff/{} - TenantId: {}", id, tenantId);
                    return staffService.deleteStaff(id, tenantId)
                            .then(Mono.just(ResponseEntity.noContent().<Void>build()))
                            .onErrorReturn(ResponseEntity.notFound().build());
                });
    }
}
```

**⚠️ IMPORTANTE**: Agregar también endpoint `/api/dentists` para dropdown de citas:

```java
// Agregar a cualquier controller (puede ser StaffController o crear DentistController)
@GetMapping("/dentists")
public Flux<StaffDTO> getDentists(ServerWebExchange exchange) {
    return TenantContext.getTenantId(exchange)
            .flatMapMany(tenantId -> {
                log.info("GET /api/dentists - TenantId: {}", tenantId);
                return staffService.getDentists(tenantId);
            });
}
```

---

## ⚛️ IMPLEMENTACIÓN FRONTEND

### 1. Tipos TypeScript

**Ubicación**: `frontend/src/types/staff.types.ts`

```typescript
export interface Staff {
  id: string;
  userId: string | null; // Indica si tiene usuario asociado
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  specialty: string;
  licenseNumber: string;
  hireDate: string;
  active: boolean;
}

export interface CreateStaffRequest {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  specialty: string;
  licenseNumber: string;
  hireDate: string;
  active: boolean;
  createUser?: boolean; // Checkbox para crear usuario
  password?: string; // Requerido si createUser = true
}

export const SPECIALTIES = [
  'Odontología General',
  'Ortodoncista',
  'Endodoncista',
  'Periodoncista',
  'Implantología',
  'Cirugía Oral',
  'Odontopediatría',
  'Prostodoncista',
  'Higienista Dental',
  'Asistente Dental',
];
```

---

### 2. Staff Service

**Ubicación**: `frontend/src/services/staffService.ts`

```typescript
import api from './api';
import { Staff, CreateStaffRequest } from '../types/staff.types';

export const getStaff = () => {
  return api.get<Staff[]>('/staff');
};

export const getDentists = () => {
  return api.get<Staff[]>('/staff/dentists');
};

export const getStaffById = (id: string) => {
  return api.get<Staff>(`/staff/${id}`);
};

export const createStaff = (data: CreateStaffRequest) => {
  return api.post<Staff>('/staff', data);
};

export const updateStaff = (id: string, data: CreateStaffRequest) => {
  return api.put<Staff>(`/staff/${id}`, data);
};

export const deleteStaff = (id: string) => {
  return api.delete(`/staff/${id}`);
};
```

---

### 3. Staff Modal Component

**Ubicación**: `frontend/src/pages/staff/StaffModal.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { Staff, CreateStaffRequest, SPECIALTIES } from '../../types/staff.types';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateStaffRequest) => Promise<void>;
  staff?: Staff | null;
}

const StaffModal: React.FC<StaffModalProps> = ({ isOpen, onClose, onSave, staff }) => {
  const [formData, setFormData] = useState<CreateStaffRequest>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    specialty: '',
    licenseNumber: '',
    hireDate: '',
    active: true,
    createUser: false,
    password: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (staff) {
      setFormData({
        firstName: staff.firstName,
        lastName: staff.lastName,
        phone: staff.phone || '',
        email: staff.email || '',
        specialty: staff.specialty,
        licenseNumber: staff.licenseNumber,
        hireDate: staff.hireDate || '',
        active: staff.active,
        createUser: false,
        password: '',
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        specialty: '',
        licenseNumber: '',
        hireDate: '',
        active: true,
        createUser: false,
        password: '',
      });
    }
  }, [staff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.createUser && !formData.password) {
      alert('Debe ingresar una contraseña para crear el usuario');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving staff:', error);
      alert('Error al guardar staff');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {staff ? 'Editar Staff' : 'Nuevo Staff'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especialidad *
              </label>
              <select
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar...</option>
                {SPECIALTIES.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Licencia *
              </label>
              <input
                type="text"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Contratación
            </label>
            <input
              type="date"
              value={formData.hireDate}
              onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {!staff && (
            <>
              <div className="border-t pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.createUser}
                    onChange={(e) => setFormData({ ...formData, createUser: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Crear cuenta de usuario para este staff
                  </span>
                </label>
              </div>

              {formData.createUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={formData.createUser}
                  />
                </div>
              )}
            </>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4"
            />
            <label className="text-sm font-medium text-gray-700">Activo</label>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffModal;
```

---

### 4. Staff Page

**Ubicación**: `frontend/src/pages/staff/StaffPage.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { Staff, CreateStaffRequest } from '../../types/staff.types';
import { getStaff, createStaff, updateStaff, deleteStaff } from '../../services/staffService';
import StaffModal from './StaffModal';
import { format } from 'date-fns';

const StaffPage: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      const response = await getStaff();
      setStaff(response.data);
    } catch (error) {
      console.error('Error loading staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedStaff(null);
    setIsModalOpen(true);
  };

  const handleEdit = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsModalOpen(true);
  };

  const handleSave = async (data: CreateStaffRequest) => {
    if (selectedStaff) {
      await updateStaff(selectedStaff.id, data);
    } else {
      await createStaff(data);
    }
    loadStaff();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Está seguro de eliminar este miembro del staff?')) return;

    try {
      await deleteStaff(id);
      loadStaff();
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('Error al eliminar staff');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Cargando staff...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Personal Médico</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Nuevo Staff
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Especialidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Licencia</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {staff.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No se encontró personal médico
                </td>
              </tr>
            ) : (
              staff.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      {s.firstName} {s.lastName}
                      {s.userId && (
                        <span className="ml-2 inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          Con usuario
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">{s.specialty}</td>
                  <td className="px-6 py-4">{s.email}</td>
                  <td className="px-6 py-4">{s.licenseNumber}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        s.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {s.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(s)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <StaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        staff={selectedStaff}
      />
    </div>
  );
};

export default StaffPage;
```

---

### 5. Agregar Ruta en App.tsx

```typescript
import StaffPage from './pages/staff/StaffPage';

// En Routes:
<Route
  path="/staff"
  element={
    <ProtectedRoute>
      <StaffPage />
    </ProtectedRoute>
  }
/>
```

---

## 🧪 Testing

### Backend - Crear Staff sin Usuario

```bash
curl -X POST http://localhost:8080/api/staff \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Carlos",
    "lastName": "Gómez",
    "phone": "987654321",
    "email": "carlos@clinica.com",
    "specialty": "Ortodoncista",
    "licenseNumber": "LIC-001",
    "hireDate": "2024-01-15",
    "active": true,
    "createUser": false
  }'
```

### Backend - Crear Staff con Usuario

```bash
curl -X POST http://localhost:8080/api/staff \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "María",
    "lastName": "Pérez",
    "phone": "987654322",
    "email": "maria@clinica.com",
    "specialty": "Odontología General",
    "licenseNumber": "LIC-002",
    "hireDate": "2024-02-01",
    "active": true,
    "createUser": true,
    "password": "password123"
  }'
```

### Backend - Obtener Dentistas (staff con usuario)

```bash
curl -X GET http://localhost:8080/api/dentists \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

## ✅ Checklist de Implementación

### Backend
- [ ] Crear `Staff.java` entity
- [ ] Crear `StaffRepository.java` con query para dentistas
- [ ] Crear DTOs: `StaffDTO`, `CreateStaffRequest`
- [ ] Crear `StaffService.java` con lógica de crear usuario
- [ ] Crear `StaffController.java` con endpoints
- [ ] Agregar endpoint `/api/dentists`
- [ ] Probar creación con y sin usuario

### Frontend
- [ ] Crear `staff.types.ts` con SPECIALTIES
- [ ] Crear `staffService.ts`
- [ ] Crear `StaffModal.tsx` con checkbox de crear usuario
- [ ] Crear `StaffPage.tsx`
- [ ] Agregar ruta en `App.tsx`
- [ ] Probar flujo completo

---

## 🐛 Troubleshooting

### Error: "Ya existe un staff con este número de licencia"
**Causa**: licenseNumber duplicado en el mismo tenant  
**Solución**: Cambiar el número de licencia

### Dropdown de dentistas vacío en Citas
**Causa**: Endpoint `/api/dentists` no retorna staff con userId  
**Solución**: Verificar query `user_id IS NOT NULL AND active = true`

### Usuario no se crea al crear staff
**Causa**: `createUser` = false o password vacío  
**Solución**: Marcar checkbox y proporcionar password

---

**🎯 Siguiente paso**: Ejecutar `sdd/historia-usuario-04-agenda-citas.md`
