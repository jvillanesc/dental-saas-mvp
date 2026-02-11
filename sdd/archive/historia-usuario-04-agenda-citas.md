# 📅 HISTORIA DE USUARIO 04 - AGENDA DE CITAS

**Proyecto**: Dental SaaS MVP  
**Historia**: Gestión de Citas con Calendario Semanal  
**Fecha**: 25 de enero de 2026  
**Versión**: 2.0

---

## 📖 Historia de Usuario

**Como** usuario del sistema (ADMIN, DENTIST o ASSISTANT)  
**Quiero** gestionar citas médicas con calendario visual  
**Para** organizar las consultas de los pacientes con los dentistas disponibles

---

## ✅ Criterios de Aceptación

### Backend
- [ ] Endpoint GET /api/appointments retorna citas del tenant
- [ ] Endpoint POST /api/appointments crea nueva cita
- [ ] Endpoint PUT /api/appointments/{id} actualiza cita
- [ ] Endpoint DELETE /api/appointments/{id} elimina cita
- [ ] Validación: no permitir citas con conflicto de horario
- [ ] Endpoint GET /api/dentists retorna solo staff con usuario
- [ ] Multi-tenancy: usuario solo ve/edita citas de su tenant

### Frontend
- [ ] Calendario semanal con vista de lunes a sábado
- [ ] Slots de 15 minutos desde 8:00 AM hasta 8:00 PM
- [ ] Click en slot vacío abre modal para nueva cita
- [ ] Click en cita existente abre modal para editar
- [ ] Dropdown de dentistas con staff que tiene usuario
- [ ] Dropdown de pacientes del tenant
- [ ] Select de duración (15, 30, 45, 60, 90, 120 minutos)
- [ ] Select de estado (SCHEDULED, CONFIRMED, CANCELLED)
- [ ] Colores diferentes por estado de cita

---

## 🏗️ Arquitectura

```
┌──────────────────────────┐
│  AppointmentsPage        │
│  ├─ WeekNavigator        │
│  ├─ Calendar (7 days)    │
│  │  ├─ TimeSlots (15min)│
│  │  └─ Appointments      │
│  └─ AppointmentModal     │
│     ├─ Patient Select    │
│     ├─ Dentist Select    │
│     ├─ DateTime Picker   │
│     ├─ Duration Select   │
│     └─ Status Select     │
└──────────────────────────┘
         ↓
┌────────────────────────────────────┐
│  appointmentService.ts             │
│  ├─ getAppointments()              │
│  ├─ createAppointment()            │
│  ├─ updateAppointment()            │
│  └─ deleteAppointment()            │
└────────────────────────────────────┘
         ↓ HTTP REST (JWT Bearer)
┌────────────────────────────────────┐
│  Backend: AppointmentController    │
│  ├─ GET /api/appointments?date=... │
│  ├─ POST /api/appointments         │
│  ├─ PUT /api/appointments/{id}     │
│  └─ DELETE /api/appointments/{id}  │
└────────────────────────────────────┘
         ↓
┌────────────────────────────────────┐
│  AppointmentService                │
│  └─ Validar conflictos de horario  │
└────────────────────────────────────┘
```

---

## 🔧 IMPLEMENTACIÓN BACKEND

### 1. Entidad Appointment

**Ubicación**: `backend/src/main/java/com/dental/domain/model/Appointment.java`

```java
package com.dental.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Table("appointments")
public class Appointment {
    @Id
    private UUID id;

    @Column("tenant_id")
    private UUID tenantId;

    @Column("patient_id")
    private UUID patientId;

    @Column("dentist_id")
    private UUID dentistId; // FK a users.id (no staff.id)

    @Column("start_time")
    private LocalDateTime startTime;

    @Column("duration_minutes")
    private Integer durationMinutes;

    private String status; // SCHEDULED, CONFIRMED, CANCELLED

    private String notes;

    @Column("created_at")
    private LocalDateTime createdAt;

    @Column("updated_at")
    private LocalDateTime updatedAt;
}
```

---

### 2. Repository

**Ubicación**: `backend/src/main/java/com/dental/repository/AppointmentRepository.java`

```java
package com.dental.repository;

import com.dental.domain.model.Appointment;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends ReactiveCrudRepository<Appointment, UUID> {

    @Query("SELECT * FROM appointments WHERE tenant_id = :tenantId " +
           "AND start_time >= :startDate AND start_time < :endDate " +
           "ORDER BY start_time")
    Flux<Appointment> findByTenantIdAndDateRange(UUID tenantId, LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT * FROM appointments WHERE id = :id AND tenant_id = :tenantId")
    Mono<Appointment> findByIdAndTenantId(UUID id, UUID tenantId);

    @Query("SELECT COUNT(*) FROM appointments WHERE tenant_id = :tenantId " +
           "AND dentist_id = :dentistId " +
           "AND start_time < :endTime " +
           "AND (start_time + (duration_minutes || ' minutes')::interval) > :startTime " +
           "AND status != 'CANCELLED'")
    Mono<Long> countConflictingAppointments(UUID tenantId, UUID dentistId, LocalDateTime startTime, LocalDateTime endTime);
}
```

---

### 3. DTOs

**Ubicación**: `backend/src/main/java/com/dental/dto/AppointmentDTO.java`

```java
package com.dental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDTO {
    private UUID id;
    private UUID patientId;
    private String patientName; // firstName + lastName
    private UUID dentistId;
    private String dentistName; // firstName + lastName
    private LocalDateTime startTime;
    private Integer durationMinutes;
    private String status;
    private String notes;
}
```

**Ubicación**: `backend/src/main/java/com/dental/dto/CreateAppointmentRequest.java`

```java
package com.dental.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CreateAppointmentRequest {
    private UUID patientId;
    private UUID dentistId;
    private LocalDateTime startTime;
    private Integer durationMinutes;
    private String status; // SCHEDULED, CONFIRMED, CANCELLED
    private String notes;
}
```

---

### 4. AppointmentService

**Ubicación**: `backend/src/main/java/com/dental/service/AppointmentService.java`

```java
package com.dental.service;

import com.dental.domain.model.Appointment;
import com.dental.dto.AppointmentDTO;
import com.dental.dto.CreateAppointmentRequest;
import com.dental.repository.AppointmentRepository;
import com.dental.repository.PatientRepository;
import com.dental.repository.UserRepository;
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
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public Flux<AppointmentDTO> getAppointments(UUID tenantId, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting appointments for tenantId: {} from {} to {}", tenantId, startDate, endDate);
        
        return appointmentRepository.findByTenantIdAndDateRange(tenantId, startDate, endDate)
                .flatMap(this::enrichAppointment);
    }

    public Mono<AppointmentDTO> getAppointmentById(UUID id, UUID tenantId) {
        log.info("Getting appointment by id: {} for tenantId: {}", id, tenantId);
        
        return appointmentRepository.findByIdAndTenantId(id, tenantId)
                .flatMap(this::enrichAppointment);
    }

    public Mono<AppointmentDTO> createAppointment(CreateAppointmentRequest request, UUID tenantId) {
        log.info("Creating appointment for tenantId: {}", tenantId);

        LocalDateTime endTime = request.getStartTime().plusMinutes(request.getDurationMinutes());

        // Validar conflictos de horario
        return appointmentRepository.countConflictingAppointments(
                        tenantId,
                        request.getDentistId(),
                        request.getStartTime(),
                        endTime
                )
                .flatMap(count -> {
                    if (count > 0) {
                        return Mono.error(new RuntimeException("Ya existe una cita en ese horario para este dentista"));
                    }

                    Appointment appointment = new Appointment();
                    appointment.setTenantId(tenantId);
                    appointment.setPatientId(request.getPatientId());
                    appointment.setDentistId(request.getDentistId());
                    appointment.setStartTime(request.getStartTime());
                    appointment.setDurationMinutes(request.getDurationMinutes());
                    appointment.setStatus(request.getStatus() != null ? request.getStatus() : "SCHEDULED");
                    appointment.setNotes(request.getNotes());
                    appointment.setCreatedAt(LocalDateTime.now());
                    appointment.setUpdatedAt(LocalDateTime.now());

                    return appointmentRepository.save(appointment);
                })
                .flatMap(this::enrichAppointment)
                .doOnSuccess(a -> log.info("Appointment created with id: {}", a.getId()));
    }

    public Mono<AppointmentDTO> updateAppointment(UUID id, CreateAppointmentRequest request, UUID tenantId) {
        log.info("Updating appointment id: {} for tenantId: {}", id, tenantId);

        return appointmentRepository.findByIdAndTenantId(id, tenantId)
                .switchIfEmpty(Mono.error(new RuntimeException("Cita no encontrada")))
                .flatMap(appointment -> {
                    appointment.setPatientId(request.getPatientId());
                    appointment.setDentistId(request.getDentistId());
                    appointment.setStartTime(request.getStartTime());
                    appointment.setDurationMinutes(request.getDurationMinutes());
                    appointment.setStatus(request.getStatus());
                    appointment.setNotes(request.getNotes());
                    appointment.setUpdatedAt(LocalDateTime.now());

                    return appointmentRepository.save(appointment);
                })
                .flatMap(this::enrichAppointment)
                .doOnSuccess(a -> log.info("Appointment updated: {}", a.getId()));
    }

    public Mono<Void> deleteAppointment(UUID id, UUID tenantId) {
        log.info("Deleting appointment id: {} for tenantId: {}", id, tenantId);

        return appointmentRepository.findByIdAndTenantId(id, tenantId)
                .switchIfEmpty(Mono.error(new RuntimeException("Cita no encontrada")))
                .flatMap(appointmentRepository::delete)
                .doOnSuccess(v -> log.info("Appointment deleted: {}", id));
    }

    private Mono<AppointmentDTO> enrichAppointment(Appointment appointment) {
        Mono<String> patientName = patientRepository.findById(appointment.getPatientId())
                .map(p -> p.getFirstName() + " " + p.getLastName())
                .defaultIfEmpty("Paciente desconocido");

        Mono<String> dentistName = userRepository.findById(appointment.getDentistId())
                .map(u -> u.getFirstName() + " " + u.getLastName())
                .defaultIfEmpty("Dentista desconocido");

        return Mono.zip(patientName, dentistName)
                .map(tuple -> new AppointmentDTO(
                        appointment.getId(),
                        appointment.getPatientId(),
                        tuple.getT1(),
                        appointment.getDentistId(),
                        tuple.getT2(),
                        appointment.getStartTime(),
                        appointment.getDurationMinutes(),
                        appointment.getStatus(),
                        appointment.getNotes()
                ));
    }
}
```

---

### 5. AppointmentController

**Ubicación**: `backend/src/main/java/com/dental/controller/AppointmentController.java`

```java
package com.dental.controller;

import com.dental.dto.AppointmentDTO;
import com.dental.dto.CreateAppointmentRequest;
import com.dental.service.AppointmentService;
import com.dental.util.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping
    public Flux<AppointmentDTO> getAppointments(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            ServerWebExchange exchange
    ) {
        return TenantContext.getTenantId(exchange)
                .flatMapMany(tenantId -> {
                    LocalDateTime start = startDate.atStartOfDay();
                    LocalDateTime end = endDate.plusDays(1).atStartOfDay();
                    log.info("GET /api/appointments - TenantId: {}, Start: {}, End: {}", tenantId, start, end);
                    return appointmentService.getAppointments(tenantId, start, end);
                });
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<AppointmentDTO>> getAppointmentById(
            @PathVariable UUID id,
            ServerWebExchange exchange
    ) {
        return TenantContext.getTenantId(exchange)
                .flatMap(tenantId -> {
                    log.info("GET /api/appointments/{} - TenantId: {}", id, tenantId);
                    return appointmentService.getAppointmentById(id, tenantId)
                            .map(ResponseEntity::ok)
                            .defaultIfEmpty(ResponseEntity.notFound().build());
                });
    }

    @PostMapping
    public Mono<ResponseEntity<AppointmentDTO>> createAppointment(
            @RequestBody CreateAppointmentRequest request,
            ServerWebExchange exchange
    ) {
        return TenantContext.getTenantId(exchange)
                .flatMap(tenantId -> {
                    log.info("POST /api/appointments - TenantId: {}", tenantId);
                    return appointmentService.createAppointment(request, tenantId)
                            .map(appointment -> ResponseEntity.status(HttpStatus.CREATED).body(appointment))
                            .onErrorResume(e -> {
                                log.error("Error creating appointment: {}", e.getMessage());
                                return Mono.just(ResponseEntity.badRequest().build());
                            });
                });
    }

    @PutMapping("/{id}")
    public Mono<ResponseEntity<AppointmentDTO>> updateAppointment(
            @PathVariable UUID id,
            @RequestBody CreateAppointmentRequest request,
            ServerWebExchange exchange
    ) {
        return TenantContext.getTenantId(exchange)
                .flatMap(tenantId -> {
                    log.info("PUT /api/appointments/{} - TenantId: {}", id, tenantId);
                    return appointmentService.updateAppointment(id, request, tenantId)
                            .map(ResponseEntity::ok)
                            .onErrorReturn(ResponseEntity.notFound().build());
                });
    }

    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deleteAppointment(
            @PathVariable UUID id,
            ServerWebExchange exchange
    ) {
        return TenantContext.getTenantId(exchange)
                .flatMap(tenantId -> {
                    log.info("DELETE /api/appointments/{} - TenantId: {}", id, tenantId);
                    return appointmentService.deleteAppointment(id, tenantId)
                            .then(Mono.just(ResponseEntity.noContent().<Void>build()))
                            .onErrorReturn(ResponseEntity.notFound().build());
                });
    }
}
```

---

## ⚛️ IMPLEMENTACIÓN FRONTEND

### 1. Tipos TypeScript

**Ubicación**: `frontend/src/types/appointment.types.ts`

```typescript
export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  dentistId: string;
  dentistName: string;
  startTime: string; // ISO format
  durationMinutes: number;
  status: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED';
  notes: string;
}

export interface CreateAppointmentRequest {
  patientId: string;
  dentistId: string;
  startTime: string; // ISO format
  durationMinutes: number;
  status: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED';
  notes: string;
}

export const APPOINTMENT_STATUSES = [
  { value: 'SCHEDULED', label: 'Programada', color: 'bg-blue-100 text-blue-800' },
  { value: 'CONFIRMED', label: 'Confirmada', color: 'bg-green-100 text-green-800' },
  { value: 'CANCELLED', label: 'Cancelada', color: 'bg-red-100 text-red-800' },
];

export const DURATIONS = [15, 30, 45, 60, 90, 120];
```

---

### 2. Appointment Service

**Ubicación**: `frontend/src/services/appointmentService.ts`

```typescript
import api from './api';
import { Appointment, CreateAppointmentRequest } from '../types/appointment.types';
import { format } from 'date-fns';

export const getAppointments = (startDate: Date, endDate: Date) => {
  const start = format(startDate, 'yyyy-MM-dd');
  const end = format(endDate, 'yyyy-MM-dd');
  return api.get<Appointment[]>('/appointments', {
    params: { startDate: start, endDate: end },
  });
};

export const createAppointment = (data: CreateAppointmentRequest) => {
  return api.post<Appointment>('/appointments', data);
};

export const updateAppointment = (id: string, data: CreateAppointmentRequest) => {
  return api.put<Appointment>(`/appointments/${id}`, data);
};

export const deleteAppointment = (id: string) => {
  return api.delete(`/appointments/${id}`);
};
```

---

### 3. Appointment Modal

**Ubicación**: `frontend/src/pages/appointments/AppointmentModal.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { Appointment, CreateAppointmentRequest, APPOINTMENT_STATUSES, DURATIONS } from '../../types/appointment.types';
import { Patient } from '../../types/patient.types';
import { Staff } from '../../types/staff.types';
import { format } from 'date-fns';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateAppointmentRequest) => Promise<void>;
  appointment?: Appointment | null;
  patients: Patient[];
  dentists: Staff[];
  selectedDate?: Date;
  selectedTime?: string;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  appointment,
  patients,
  dentists,
  selectedDate,
  selectedTime,
}) => {
  const [formData, setFormData] = useState<CreateAppointmentRequest>({
    patientId: '',
    dentistId: '',
    startTime: '',
    durationMinutes: 60,
    status: 'SCHEDULED',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (appointment) {
      setFormData({
        patientId: appointment.patientId,
        dentistId: appointment.dentistId,
        startTime: appointment.startTime,
        durationMinutes: appointment.durationMinutes,
        status: appointment.status,
        notes: appointment.notes || '',
      });
    } else if (selectedDate && selectedTime) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      setFormData({
        patientId: '',
        dentistId: '',
        startTime: `${dateStr}T${selectedTime}:00`,
        durationMinutes: 60,
        status: 'SCHEDULED',
        notes: '',
      });
    }
  }, [appointment, selectedDate, selectedTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving appointment:', error);
      alert('Error al guardar cita');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {appointment ? 'Editar Cita' : 'Nueva Cita'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paciente *
            </label>
            <select
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar paciente...</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.firstName} {patient.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dentista *
            </label>
            <select
              value={formData.dentistId}
              onChange={(e) => setFormData({ ...formData, dentistId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar dentista...</option>
              {dentists.map((dentist) => (
                <option key={dentist.id} value={dentist.userId}>
                  {dentist.firstName} {dentist.lastName} - {dentist.specialty}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha y Hora *
            </label>
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duración (minutos) *
            </label>
            <select
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {DURATIONS.map((duration) => (
                <option key={duration} value={duration}>
                  {duration} minutos
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {APPOINTMENT_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
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

export default AppointmentModal;
```

---

### 4. Appointments Page (Calendario)

**Ubicación**: `frontend/src/pages/appointments/AppointmentsPage.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { Appointment, CreateAppointmentRequest, APPOINTMENT_STATUSES } from '../../types/appointment.types';
import { Patient } from '../../types/patient.types';
import { Staff } from '../../types/staff.types';
import { getAppointments, createAppointment, updateAppointment, deleteAppointment } from '../../services/appointmentService';
import { getPatients } from '../../services/patientService';
import { getDentists } from '../../services/staffService';
import AppointmentModal from './AppointmentModal';
import { startOfWeek, addDays, format, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [dentists, setDentists] = useState<Staff[]>([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Lunes
  const weekDays = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i)); // Lun-Sáb

  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 4) + 8; // Desde 8:00 AM
    const minute = (i % 4) * 15;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  useEffect(() => {
    loadData();
  }, [currentWeek]);

  const loadData = async () => {
    try {
      const weekEnd = addDays(weekStart, 6);
      const [apptResponse, patientResponse, dentistResponse] = await Promise.all([
        getAppointments(weekStart, weekEnd),
        getPatients(),
        getDentists(),
      ]);
      setAppointments(apptResponse.data);
      setPatients(patientResponse.data);
      setDentists(dentistResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handlePreviousWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const handleNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const handleToday = () => setCurrentWeek(new Date());

  const handleSlotClick = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSelectedDate(undefined);
    setSelectedTime(undefined);
    setIsModalOpen(true);
  };

  const handleSave = async (data: CreateAppointmentRequest) => {
    if (selectedAppointment) {
      await updateAppointment(selectedAppointment.id, data);
    } else {
      await createAppointment(data);
    }
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Está seguro de eliminar esta cita?')) return;
    try {
      await deleteAppointment(id);
      loadData();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Error al eliminar cita');
    }
  };

  const getAppointmentsForSlot = (date: Date, time: string) => {
    return appointments.filter((appt) => {
      const apptDate = parseISO(appt.startTime);
      const apptTime = format(apptDate, 'HH:mm');
      return isSameDay(apptDate, date) && apptTime === time;
    });
  };

  const getStatusColor = (status: string) => {
    return APPOINTMENT_STATUSES.find((s) => s.value === status)?.color || 'bg-gray-100';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Agenda de Citas</h1>
        <div className="flex gap-2">
          <button
            onClick={handlePreviousWeek}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Semana Anterior
          </button>
          <button
            onClick={handleToday}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Hoy
          </button>
          <button
            onClick={handleNextWeek}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Semana Siguiente →
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky top-0 bg-gray-50 border-b border-gray-200 p-2 text-left text-xs font-medium text-gray-500 uppercase w-24">
                Hora
              </th>
              {weekDays.map((day) => (
                <th
                  key={day.toISOString()}
                  className="sticky top-0 bg-gray-50 border-b border-gray-200 p-2 text-center text-xs font-medium text-gray-500 uppercase"
                >
                  <div>{format(day, 'EEEE', { locale: es })}</div>
                  <div className="text-lg font-bold text-gray-800">{format(day, 'd')}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time) => (
              <tr key={time}>
                <td className="border-r border-gray-200 p-2 text-xs text-gray-600">{time}</td>
                {weekDays.map((day) => {
                  const slotAppointments = getAppointmentsForSlot(day, time);
                  return (
                    <td
                      key={`${day.toISOString()}-${time}`}
                      className="border border-gray-200 p-1 hover:bg-gray-50 cursor-pointer h-12"
                      onClick={() => slotAppointments.length === 0 && handleSlotClick(day, time)}
                    >
                      {slotAppointments.map((appt) => (
                        <div
                          key={appt.id}
                          className={`p-1 rounded text-xs ${getStatusColor(appt.status)} cursor-pointer`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAppointmentClick(appt);
                          }}
                        >
                          <div className="font-semibold">{appt.patientName}</div>
                          <div>{appt.dentistName}</div>
                          <div>{appt.durationMinutes} min</div>
                        </div>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        appointment={selectedAppointment}
        patients={patients}
        dentists={dentists}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
      />
    </div>
  );
};

export default AppointmentsPage;
```

---

### 5. Agregar Ruta en App.tsx

```typescript
import AppointmentsPage from './pages/appointments/AppointmentsPage';

// En Routes:
<Route
  path="/appointments"
  element={
    <ProtectedRoute>
      <AppointmentsPage />
    </ProtectedRoute>
  }
/>
```

---

## 🧪 Testing

### Backend - Crear Cita

```bash
curl -X POST http://localhost:8080/api/appointments \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "770e8400-e29b-41d4-a716-446655440001",
    "dentistId": "660e8400-e29b-41d4-a716-446655440002",
    "startTime": "2026-02-10T10:00:00",
    "durationMinutes": 60,
    "status": "SCHEDULED",
    "notes": "Limpieza dental y revisión"
  }'
```

### Backend - Obtener Citas de la Semana

```bash
curl -X GET "http://localhost:8080/api/appointments?startDate=2026-02-10&endDate=2026-02-16" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

## ✅ Checklist de Implementación

### Backend
- [ ] Crear `Appointment.java` entity
- [ ] Crear `AppointmentRepository.java` con query de conflictos
- [ ] Crear DTOs: `AppointmentDTO`, `CreateAppointmentRequest`
- [ ] Crear `AppointmentService.java` con validación de conflictos
- [ ] Crear `AppointmentController.java`
- [ ] Probar validación de conflictos

### Frontend
- [ ] Crear `appointment.types.ts`
- [ ] Crear `appointmentService.ts`
- [ ] Crear `AppointmentModal.tsx`
- [ ] Crear `AppointmentsPage.tsx` con calendario
- [ ] Agregar ruta en `App.tsx`
- [ ] Probar flujo completo

---

## 🐛 Troubleshooting

### Error: "Ya existe una cita en ese horario"
**Causa**: Conflicto de horario para el mismo dentista  
**Solución**: Cambiar hora o seleccionar otro dentista

### Dropdown de dentistas vacío
**Causa**: No hay staff con `user_id` no nulo  
**Solución**: Crear staff con usuario asociado

### Citas no se muestran en calendario
**Causa**: startTime fuera del rango de fechas solicitado  
**Solución**: Verificar que `startDate` y `endDate` cubran la semana

---

**🎯 Siguiente paso**: Ejecutar `sdd/integracion-final.md`
