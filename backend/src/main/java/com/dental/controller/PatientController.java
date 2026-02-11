package com.dental.controller;

import com.dental.dto.PatientDTO;
import com.dental.security.TenantContext;
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
        return TenantContext.getTenantId()
                .map(tenantId -> ResponseEntity.ok(patientService.getAllPatients(tenantId)));
    }
    
    @GetMapping("/{id}")
    public Mono<ResponseEntity<PatientDTO>> getPatientById(@PathVariable UUID id) {
        return TenantContext.getTenantId()
                .flatMap(tenantId -> patientService.getPatientById(id, tenantId)
                        .map(ResponseEntity::ok)
                        .defaultIfEmpty(ResponseEntity.notFound().build()));
    }
    
    @PostMapping
    public Mono<ResponseEntity<PatientDTO>> createPatient(@RequestBody PatientDTO dto) {
        return TenantContext.getTenantId()
                .flatMap(tenantId -> patientService.createPatient(tenantId, dto)
                        .map(created -> ResponseEntity.status(HttpStatus.CREATED).body(created)));
    }
    
    @PutMapping("/{id}")
    public Mono<ResponseEntity<PatientDTO>> updatePatient(
            @PathVariable UUID id,
            @RequestBody PatientDTO dto) {
        return TenantContext.getTenantId()
                .flatMap(tenantId -> patientService.updatePatient(id, tenantId, dto)
                        .map(ResponseEntity::ok)
                        .onErrorResume(e -> Mono.just(ResponseEntity.notFound().build())));
    }
    
    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deletePatient(@PathVariable UUID id) {
        return TenantContext.getTenantId()
                .flatMap(tenantId -> patientService.deletePatient(id, tenantId)
                        .then(Mono.just(ResponseEntity.noContent().<Void>build()))
                        .onErrorResume(e -> Mono.just(ResponseEntity.notFound().build())));
    }
}
