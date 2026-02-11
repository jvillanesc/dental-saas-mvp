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
    
    public Mono<PatientDTO> getPatientById(UUID id, UUID tenantId) {
        return patientRepository.findByIdAndTenantIdAndNotDeleted(id, tenantId)
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
        return patientRepository.findByIdAndTenantIdAndNotDeleted(id, tenantId)
                .switchIfEmpty(Mono.error(new RuntimeException("Patient not found")))
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
        return patientRepository.findByIdAndTenantIdAndNotDeleted(id, tenantId)
                .switchIfEmpty(Mono.error(new RuntimeException("Patient not found")))
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
