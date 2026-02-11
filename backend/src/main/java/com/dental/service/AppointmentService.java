package com.dental.service;

import com.dental.domain.model.Appointment;
import com.dental.domain.model.Patient;
import com.dental.domain.model.User;
import com.dental.dto.AppointmentDTO;
import com.dental.repository.AppointmentRepository;
import com.dental.repository.PatientRepository;
import com.dental.repository.UserRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AppointmentService {
    
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    
    public AppointmentService(AppointmentRepository appointmentRepository, PatientRepository patientRepository, UserRepository userRepository) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }
    
    public Flux<AppointmentDTO> getAllAppointments(UUID tenantId) {
        return appointmentRepository.findByTenantId(tenantId)
                .flatMap(this::toDTOWithRelations);
    }
    
    public Flux<AppointmentDTO> getAppointmentsByDateRange(UUID tenantId, LocalDateTime startDate, LocalDateTime endDate) {
        return appointmentRepository.findByTenantIdAndDateRange(tenantId, startDate, endDate)
                .flatMap(this::toDTOWithRelations);
    }
    
    public Mono<AppointmentDTO> getAppointmentById(UUID id, UUID tenantId) {
        return appointmentRepository.findByIdAndTenantId(id, tenantId)
                .flatMap(this::toDTOWithRelations);
    }
    
    public Mono<AppointmentDTO> createAppointment(UUID tenantId, AppointmentDTO dto) {
        Appointment appointment = new Appointment();
        appointment.setTenantId(tenantId);
        appointment.setPatientId(dto.getPatientId());
        appointment.setDentistId(dto.getDentistId());
        appointment.setStartTime(dto.getStartTime());
        appointment.setDurationMinutes(dto.getDurationMinutes());
        appointment.setStatus(dto.getStatus());
        appointment.setNotes(dto.getNotes());
        appointment.setCreatedAt(LocalDateTime.now());
        appointment.setUpdatedAt(LocalDateTime.now());
        
        return appointmentRepository.save(appointment)
                .flatMap(this::toDTOWithRelations);
    }
    
    public Mono<AppointmentDTO> updateAppointment(UUID id, UUID tenantId, AppointmentDTO dto) {
        return appointmentRepository.findByIdAndTenantId(id, tenantId)
                .switchIfEmpty(Mono.error(new RuntimeException("Appointment not found")))
                .flatMap(appointment -> {
                    appointment.setPatientId(dto.getPatientId());
                    appointment.setDentistId(dto.getDentistId());
                    appointment.setStartTime(dto.getStartTime());
                    appointment.setDurationMinutes(dto.getDurationMinutes());
                    appointment.setStatus(dto.getStatus());
                    appointment.setNotes(dto.getNotes());
                    appointment.setUpdatedAt(LocalDateTime.now());
                    return appointmentRepository.save(appointment);
                })
                .flatMap(this::toDTOWithRelations);
    }
    
    public Mono<Void> deleteAppointment(UUID id, UUID tenantId) {
        return appointmentRepository.findByIdAndTenantId(id, tenantId)
                .switchIfEmpty(Mono.error(new RuntimeException("Appointment not found")))
                .flatMap(appointmentRepository::delete);
    }
    
    private Mono<AppointmentDTO> toDTOWithRelations(Appointment appointment) {
        Mono<Patient> patientMono = patientRepository.findById(appointment.getPatientId()).defaultIfEmpty(new Patient());
        Mono<User> dentistMono = userRepository.findById(appointment.getDentistId()).defaultIfEmpty(new User());
        
        return Mono.zip(patientMono, dentistMono)
                .map(tuple -> {
                    Patient patient = tuple.getT1();
                    User dentist = tuple.getT2();
                    
                    AppointmentDTO dto = new AppointmentDTO();
                    dto.setId(appointment.getId());
                    dto.setPatientId(appointment.getPatientId());
                    dto.setPatientName(patient.getFirstName() != null ? patient.getFirstName() + " " + patient.getLastName() : "");
                    dto.setDentistId(appointment.getDentistId());
                    dto.setDentistName(dentist.getFirstName() != null ? dentist.getFirstName() + " " + dentist.getLastName() : "");
                    dto.setStartTime(appointment.getStartTime());
                    dto.setDurationMinutes(appointment.getDurationMinutes());
                    dto.setStatus(appointment.getStatus());
                    dto.setNotes(appointment.getNotes());
                    return dto;
                });
    }
}
