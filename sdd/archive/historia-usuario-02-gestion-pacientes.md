# 🏥 HISTORIA DE USUARIO 02 - GESTIÓN DE PACIENTES

**Proyecto**: Dental SaaS MVP  
**Historia**: CRUD completo de Pacientes  
**Fecha**: 25 de enero de 2026  
**Versión**: 2.0

---

## 📖 Historia de Usuario

**Como** usuario del sistema (ADMIN, DENTIST o ASSISTANT)  
**Quiero** gestionar pacientes (crear, listar, editar, eliminar)  
**Para** mantener actualizada la información de los pacientes de mi clínica

---

## ✅ Criterios de Aceptación

### Backend
- [ ] Endpoint GET /api/patients retorna pacientes del tenant logueado
- [ ] Endpoint POST /api/patients crea nuevo paciente
- [ ] Endpoint PUT /api/patients/{id} actualiza paciente
- [ ] Endpoint DELETE /api/patients/{id} hace soft delete
- [ ] Validaciones: firstName, lastName requeridos
- [ ] Multi-tenancy: usuario solo ve/edita pacientes de su tenant
- [ ] Búsqueda por nombre, email o teléfono

### Frontend
- [ ] Página PatientsPage lista todos los pacientes
- [ ] Botón "Nuevo Paciente" abre modal
- [ ] Modal con formulario para crear/editar paciente
- [ ] Botón "Editar" en cada fila abre modal con datos
- [ ] Botón "Eliminar" con confirmación
- [ ] Buscador funcional en tiempo real
- [ ] Tabla responsive con Tailwind CSS

---

## 🏗️ Arquitectura

```
┌──────────────────┐
│  PatientsPage    │
│  ├─ Search       │
│  ├─ Table        │
│  └─ Modal        │
└──────────────────┘
         ↓
┌────────────────────────────────────┐
│  patientService.ts                 │
│  ├─ getPatients()                  │
│  ├─ createPatient()                │
│  ├─ updatePatient()                │
│  └─ deletePatient()                │
└────────────────────────────────────┘
         ↓ HTTP REST (JWT Bearer)
┌────────────────────────────────────┐
│  Backend: PatientController        │
│  ├─ GET /api/patients              │
│  ├─ POST /api/patients             │
│  ├─ PUT /api/patients/{id}         │
│  └─ DELETE /api/patients/{id}      │
└────────────────────────────────────┘
         ↓
┌────────────────────────────────────┐
│  PatientService (Business Logic)   │
└────────────────────────────────────┘
         ↓
┌────────────────────────────────────┐
│  PatientRepository (R2DBC)         │
└────────────────────────────────────┘
         ↓
┌────────────────────────────────────┐
│  PostgreSQL: patients table        │
└────────────────────────────────────┘
```

---

## 🔧 IMPLEMENTACIÓN BACKEND

### 1. Entidad Patient

**Ubicación**: `backend/src/main/java/com/dental/domain/model/Patient.java`

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
@Table("patients")
public class Patient {
    @Id
    private UUID id;

    @Column("tenant_id")
    private UUID tenantId;

    @Column("first_name")
    private String firstName;

    @Column("last_name")
    private String lastName;

    private String phone;
    private String email;

    @Column("birth_date")
    private LocalDate birthDate;

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

**Ubicación**: `backend/src/main/java/com/dental/repository/PatientRepository.java`

```java
package com.dental.repository;

import com.dental.domain.model.Patient;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface PatientRepository extends ReactiveCrudRepository<Patient, UUID> {

    @Query("SELECT * FROM patients WHERE tenant_id = :tenantId AND deleted_at IS NULL ORDER BY first_name, last_name")
    Flux<Patient> findByTenantId(UUID tenantId);

    @Query("SELECT * FROM patients WHERE id = :id AND tenant_id = :tenantId AND deleted_at IS NULL")
    Mono<Patient> findByIdAndTenantId(UUID id, UUID tenantId);

    @Query("SELECT * FROM patients WHERE tenant_id = :tenantId AND deleted_at IS NULL " +
           "AND (LOWER(first_name) LIKE LOWER(:search) " +
           "OR LOWER(last_name) LIKE LOWER(:search) " +
           "OR LOWER(phone) LIKE LOWER(:search) " +
           "OR LOWER(email) LIKE LOWER(:search)) " +
           "ORDER BY first_name, last_name")
    Flux<Patient> searchByTenantId(UUID tenantId, String search);
}
```

---

### 3. DTOs

**Ubicación**: `backend/src/main/java/com/dental/dto/PatientDTO.java`

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
public class PatientDTO {
    private UUID id;
    private String firstName;
    private String lastName;
    private String phone;
    private String email;
    private LocalDate birthDate;
}
```

**Ubicación**: `backend/src/main/java/com/dental/dto/CreatePatientRequest.java`

```java
package com.dental.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class CreatePatientRequest {
    private String firstName;
    private String lastName;
    private String phone;
    private String email;
    private LocalDate birthDate;
}
```

---

### 4. PatientService

**Ubicación**: `backend/src/main/java/com/dental/service/PatientService.java`

```java
package com.dental.service;

import com.dental.domain.model.Patient;
import com.dental.dto.CreatePatientRequest;
import com.dental.dto.PatientDTO;
import com.dental.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;

    public Flux<PatientDTO> getAllPatients(UUID tenantId) {
        log.info("Getting all patients for tenantId: {}", tenantId);
        return patientRepository.findByTenantId(tenantId)
                .map(this::toDTO);
    }

    public Flux<PatientDTO> searchPatients(UUID tenantId, String search) {
        log.info("Searching patients for tenantId: {} with search: {}", tenantId, search);
        String searchPattern = "%" + search + "%";
        return patientRepository.searchByTenantId(tenantId, searchPattern)
                .map(this::toDTO);
    }

    public Mono<PatientDTO> getPatientById(UUID id, UUID tenantId) {
        log.info("Getting patient by id: {} for tenantId: {}", id, tenantId);
        return patientRepository.findByIdAndTenantId(id, tenantId)
                .map(this::toDTO);
    }

    public Mono<PatientDTO> createPatient(CreatePatientRequest request, UUID tenantId) {
        log.info("Creating patient for tenantId: {}", tenantId);

        Patient patient = new Patient();
        patient.setTenantId(tenantId);
        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setPhone(request.getPhone());
        patient.setEmail(request.getEmail());
        patient.setBirthDate(request.getBirthDate());
        patient.setCreatedAt(LocalDateTime.now());

        return patientRepository.save(patient)
                .doOnSuccess(p -> log.info("Patient created with id: {}", p.getId()))
                .map(this::toDTO);
    }

    public Mono<PatientDTO> updatePatient(UUID id, CreatePatientRequest request, UUID tenantId) {
        log.info("Updating patient id: {} for tenantId: {}", id, tenantId);

        return patientRepository.findByIdAndTenantId(id, tenantId)
                .switchIfEmpty(Mono.error(new RuntimeException("Paciente no encontrado")))
                .flatMap(patient -> {
                    patient.setFirstName(request.getFirstName());
                    patient.setLastName(request.getLastName());
                    patient.setPhone(request.getPhone());
                    patient.setEmail(request.getEmail());
                    patient.setBirthDate(request.getBirthDate());
                    patient.setUpdatedAt(LocalDateTime.now());

                    return patientRepository.save(patient);
                })
                .doOnSuccess(p -> log.info("Patient updated: {}", p.getId()))
                .map(this::toDTO);
    }

    public Mono<Void> deletePatient(UUID id, UUID tenantId) {
        log.info("Soft deleting patient id: {} for tenantId: {}", id, tenantId);

        return patientRepository.findByIdAndTenantId(id, tenantId)
                .switchIfEmpty(Mono.error(new RuntimeException("Paciente no encontrado")))
                .flatMap(patient -> {
                    patient.setDeletedAt(LocalDateTime.now());
                    return patientRepository.save(patient);
                })
                .doOnSuccess(p -> log.info("Patient soft deleted: {}", p.getId()))
                .then();
    }

    private PatientDTO toDTO(Patient patient) {
        return new PatientDTO(
                patient.getId(),
                patient.getFirstName(),
                patient.getLastName(),
                patient.getPhone(),
                patient.getEmail(),
                patient.getBirthDate()
        );
    }
}
```

---

### 5. PatientController

**Ubicación**: `backend/src/main/java/com/dental/controller/PatientController.java`

```java
package com.dental.controller;

import com.dental.dto.CreatePatientRequest;
import com.dental.dto.PatientDTO;
import com.dental.service.PatientService;
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
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping
    public Flux<PatientDTO> getAllPatients(
            @RequestParam(required = false) String search,
            ServerWebExchange exchange
    ) {
        return TenantContext.getTenantId(exchange)
                .flatMapMany(tenantId -> {
                    log.info("GET /api/patients - TenantId: {}, Search: {}", tenantId, search);
                    if (search != null && !search.isEmpty()) {
                        return patientService.searchPatients(tenantId, search);
                    }
                    return patientService.getAllPatients(tenantId);
                });
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<PatientDTO>> getPatientById(
            @PathVariable UUID id,
            ServerWebExchange exchange
    ) {
        return TenantContext.getTenantId(exchange)
                .flatMap(tenantId -> {
                    log.info("GET /api/patients/{} - TenantId: {}", id, tenantId);
                    return patientService.getPatientById(id, tenantId)
                            .map(ResponseEntity::ok)
                            .defaultIfEmpty(ResponseEntity.notFound().build());
                });
    }

    @PostMapping
    public Mono<ResponseEntity<PatientDTO>> createPatient(
            @RequestBody CreatePatientRequest request,
            ServerWebExchange exchange
    ) {
        return TenantContext.getTenantId(exchange)
                .flatMap(tenantId -> {
                    log.info("POST /api/patients - TenantId: {}", tenantId);
                    return patientService.createPatient(request, tenantId)
                            .map(patient -> ResponseEntity.status(HttpStatus.CREATED).body(patient));
                });
    }

    @PutMapping("/{id}")
    public Mono<ResponseEntity<PatientDTO>> updatePatient(
            @PathVariable UUID id,
            @RequestBody CreatePatientRequest request,
            ServerWebExchange exchange
    ) {
        return TenantContext.getTenantId(exchange)
                .flatMap(tenantId -> {
                    log.info("PUT /api/patients/{} - TenantId: {}", id, tenantId);
                    return patientService.updatePatient(id, request, tenantId)
                            .map(ResponseEntity::ok)
                            .onErrorReturn(ResponseEntity.notFound().build());
                });
    }

    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deletePatient(
            @PathVariable UUID id,
            ServerWebExchange exchange
    ) {
        return TenantContext.getTenantId(exchange)
                .flatMap(tenantId -> {
                    log.info("DELETE /api/patients/{} - TenantId: {}", id, tenantId);
                    return patientService.deletePatient(id, tenantId)
                            .then(Mono.just(ResponseEntity.noContent().<Void>build()))
                            .onErrorReturn(ResponseEntity.notFound().build());
                });
    }
}
```

---

## ⚛️ IMPLEMENTACIÓN FRONTEND

### 1. Tipos TypeScript

**Ubicación**: `frontend/src/types/patient.types.ts`

```typescript
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthDate: string; // ISO format "YYYY-MM-DD"
}

export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthDate: string;
}
```

---

### 2. Patient Service

**Ubicación**: `frontend/src/services/patientService.ts`

```typescript
import api from './api';
import { Patient, CreatePatientRequest } from '../types/patient.types';

export const getPatients = (search?: string) => {
  const params = search ? { search } : {};
  return api.get<Patient[]>('/patients', { params });
};

export const getPatientById = (id: string) => {
  return api.get<Patient>(`/patients/${id}`);
};

export const createPatient = (data: CreatePatientRequest) => {
  return api.post<Patient>('/patients', data);
};

export const updatePatient = (id: string, data: CreatePatientRequest) => {
  return api.put<Patient>(`/patients/${id}`, data);
};

export const deletePatient = (id: string) => {
  return api.delete(`/patients/${id}`);
};
```

---

### 3. Patient Modal Component

**Ubicación**: `frontend/src/pages/patients/PatientModal.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { Patient, CreatePatientRequest } from '../../types/patient.types';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreatePatientRequest) => Promise<void>;
  patient?: Patient | null;
}

const PatientModal: React.FC<PatientModalProps> = ({ isOpen, onClose, onSave, patient }) => {
  const [formData, setFormData] = useState<CreatePatientRequest>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    birthDate: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patient) {
      setFormData({
        firstName: patient.firstName,
        lastName: patient.lastName,
        phone: patient.phone || '',
        email: patient.email || '',
        birthDate: patient.birthDate || '',
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        birthDate: '',
      });
    }
  }, [patient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Error al guardar paciente');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {patient ? 'Editar Paciente' : 'Nuevo Paciente'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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

export default PatientModal;
```

---

### 4. Patients Page

**Ubicación**: `frontend/src/pages/patients/PatientsPage.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { Patient, CreatePatientRequest } from '../../types/patient.types';
import { getPatients, createPatient, updatePatient, deletePatient } from '../../services/patientService';
import PatientModal from './PatientModal';
import { format } from 'date-fns';

const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPatients(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadPatients = async (searchTerm?: string) => {
    try {
      const response = await getPatients(searchTerm);
      setPatients(response.data);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedPatient(null);
    setIsModalOpen(true);
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const handleSave = async (data: CreatePatientRequest) => {
    if (selectedPatient) {
      await updatePatient(selectedPatient.id, data);
    } else {
      await createPatient(data);
    }
    loadPatients(search);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Está seguro de eliminar este paciente?')) return;
    
    try {
      await deletePatient(id);
      loadPatients(search);
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert('Error al eliminar paciente');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Cargando pacientes...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pacientes</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Nuevo Paciente
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre, email o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Nacimiento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {patients.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No se encontraron pacientes
                </td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {patient.firstName} {patient.lastName}
                  </td>
                  <td className="px-6 py-4">{patient.phone || '-'}</td>
                  <td className="px-6 py-4">{patient.email || '-'}</td>
                  <td className="px-6 py-4">
                    {patient.birthDate ? format(new Date(patient.birthDate), 'dd/MM/yyyy') : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(patient)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(patient.id)}
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

      <PatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        patient={selectedPatient}
      />
    </div>
  );
};

export default PatientsPage;
```

---

### 5. Agregar Ruta en App.tsx

```typescript
import PatientsPage from './pages/patients/PatientsPage';

// En Routes:
<Route
  path="/patients"
  element={
    <ProtectedRoute>
      <PatientsPage />
    </ProtectedRoute>
  }
/>
```

---

## 🧪 Testing

### Backend - Listar Pacientes

```bash
curl -X GET http://localhost:8080/api/patients \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Backend - Crear Paciente

```bash
curl -X POST http://localhost:8080/api/patients \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez",
    "phone": "987654321",
    "email": "juan@email.com",
    "birthDate": "1990-05-15"
  }'
```

### Backend - Actualizar Paciente

```bash
curl -X PUT http://localhost:8080/api/patients/<PATIENT_ID> \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan Carlos",
    "lastName": "Pérez García",
    "phone": "987654321",
    "email": "juancarlos@email.com",
    "birthDate": "1990-05-15"
  }'
```

### Backend - Eliminar Paciente

```bash
curl -X DELETE http://localhost:8080/api/patients/<PATIENT_ID> \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Backend - Buscar Pacientes

```bash
curl -X GET "http://localhost:8080/api/patients?search=juan" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

## ✅ Checklist de Implementación

### Backend
- [ ] Crear `Patient.java` entity
- [ ] Crear `PatientRepository.java` con queries de búsqueda
- [ ] Crear DTOs: `PatientDTO`, `CreatePatientRequest`
- [ ] Crear `PatientService.java` con CRUD + search
- [ ] Crear `PatientController.java` con 5 endpoints
- [ ] Probar todos los endpoints con curl

### Frontend
- [ ] Crear `patient.types.ts`
- [ ] Crear `patientService.ts`
- [ ] Crear `PatientModal.tsx`
- [ ] Crear `PatientsPage.tsx`
- [ ] Agregar ruta en `App.tsx`
- [ ] Probar flujo completo: crear, editar, eliminar, buscar

---

## 🐛 Troubleshooting

### Error: "Paciente no encontrado"
**Causa**: ID no existe o pertenece a otro tenant  
**Solución**: Verificar que el paciente exista y pertenezca al tenant del usuario logueado

### Búsqueda no funciona
**Causa**: Query SQL incorrecta o search pattern mal formado  
**Solución**: Verificar que se use `LOWER()` y `LIKE` con `%` en PatientRepository

### Soft delete no funciona
**Causa**: `deleted_at IS NULL` falta en queries  
**Solución**: Agregar `AND deleted_at IS NULL` en todos los queries de lectura

---

**🎯 Siguiente paso**: Ejecutar `sdd/historia-usuario-03-gestion-staff.md`
