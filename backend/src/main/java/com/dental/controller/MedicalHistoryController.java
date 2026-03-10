package com.dental.controller;

import com.dental.dto.CreateMedicalHistoryRequest;
import com.dental.dto.MedicalHistoryDTO;
import com.dental.security.TenantContext;
import com.dental.service.MedicalHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.UUID;

@RestController
@RequestMapping("/api/patients/{patientId}/medical-history")
public class MedicalHistoryController {
    
    private final MedicalHistoryService medicalHistoryService;
    
    public MedicalHistoryController(MedicalHistoryService medicalHistoryService) {
        this.medicalHistoryService = medicalHistoryService;
    }
    
    @GetMapping
    public Mono<ResponseEntity<MedicalHistoryDTO>> get(@PathVariable UUID patientId) {
        return TenantContext.getTenantId()
                .flatMap(tenantId -> medicalHistoryService.getByPatientId(patientId, tenantId)
                        .map(ResponseEntity::ok)
                        .defaultIfEmpty(ResponseEntity.notFound().build()));
    }
    
    @PostMapping
    public Mono<ResponseEntity<MedicalHistoryDTO>> createOrUpdate(
            @PathVariable UUID patientId,
            @RequestBody CreateMedicalHistoryRequest request) {
        System.out.println("🩺 Received medical history save request for patient: " + patientId);
        return TenantContext.getTenantId()
                .doOnNext(tenantId -> System.out.println("🏥 TenantId: " + tenantId))
                .flatMap(tenantId -> medicalHistoryService.createOrUpdate(patientId, tenantId, request)
                        .doOnSuccess(dto -> System.out.println("✅ Medical history saved successfully: " + dto.getId()))
                        .doOnError(e -> System.err.println("❌ ERROR saving medical history: " + e.getClass().getName() + " - " + e.getMessage()))
                        .map(ResponseEntity::ok))
                .onErrorResume(e -> {
                    System.err.println("❌ CONTROLLER ERROR: " + e.getMessage());
                    e.printStackTrace();
                    return Mono.just(ResponseEntity.internalServerError().build());
                });
    }
    
    @DeleteMapping
    public Mono<ResponseEntity<Void>> delete(@PathVariable UUID patientId) {
        return TenantContext.getTenantId()
                .flatMap(tenantId -> medicalHistoryService.delete(patientId, tenantId)
                        .then(Mono.just(ResponseEntity.noContent().<Void>build()))
                        .onErrorResume(e -> Mono.just(ResponseEntity.notFound().build())));
    }
}
