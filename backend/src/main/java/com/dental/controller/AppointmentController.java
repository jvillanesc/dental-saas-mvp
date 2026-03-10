package com.dental.controller;

import com.dental.dto.AppointmentDTO;
import com.dental.dto.UpdateStatusRequest;
import com.dental.security.TenantContext;
import com.dental.service.AppointmentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    
    private static final Logger log = LoggerFactory.getLogger(AppointmentController.class);
    
    private final AppointmentService appointmentService;
    
    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }
    
    @GetMapping
    public Mono<ResponseEntity<Flux<AppointmentDTO>>> getAllAppointments(
            @RequestParam(required = false) UUID dentistId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return TenantContext.getTenantId()
                .map(tenantId -> {
                    if (dentistId != null || startDate != null || endDate != null) {
                        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
                        LocalDateTime endDateTime = endDate != null ? endDate.atTime(LocalTime.MAX) : null;
                        return ResponseEntity.ok(appointmentService.getAppointments(tenantId, dentistId, startDateTime, endDateTime));
                    } else {
                        return ResponseEntity.ok(appointmentService.getAllAppointments(tenantId));
                    }
                });
    }
    
    @GetMapping("/{id}")
    public Mono<ResponseEntity<AppointmentDTO>> getAppointmentById(@PathVariable UUID id) {
        return TenantContext.getTenantId()
                .flatMap(tenantId -> appointmentService.getAppointmentById(id, tenantId)
                        .map(ResponseEntity::ok)
                        .defaultIfEmpty(ResponseEntity.notFound().build()));
    }
    
    @PostMapping
    public Mono<ResponseEntity<AppointmentDTO>> createAppointment(@RequestBody AppointmentDTO dto) {
        return TenantContext.getTenantId()
                .flatMap(tenantId -> appointmentService.createAppointment(tenantId, dto)
                        .map(created -> ResponseEntity.status(HttpStatus.CREATED).body(created))
                        .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().build())));
    }
    
    @PutMapping("/{id}")
    public Mono<ResponseEntity<AppointmentDTO>> updateAppointment(
            @PathVariable UUID id,
            @RequestBody AppointmentDTO dto) {
        return TenantContext.getTenantId()
                .flatMap(tenantId -> appointmentService.updateAppointment(id, tenantId, dto)
                        .map(ResponseEntity::ok)
                        .onErrorResume(e -> Mono.just(ResponseEntity.notFound().build())));
    }
    
    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deleteAppointment(@PathVariable UUID id) {
        return TenantContext.getTenantId()
                .flatMap(tenantId -> appointmentService.deleteAppointment(id, tenantId)
                        .then(Mono.just(ResponseEntity.noContent().<Void>build()))
                        .onErrorResume(e -> Mono.just(ResponseEntity.notFound().build())));
    }
    
    @PatchMapping("/{id}/status")
    public Mono<ResponseEntity<AppointmentDTO>> updateAppointmentStatus(
            @PathVariable UUID id,
            @RequestBody UpdateStatusRequest request) {
        log.info("📝 PATCH /api/appointments/{}/status - newStatus: {}", id, request.getStatus());
        
        return TenantContext.getTenantId()
                .doOnSuccess(tenantId -> log.info("✅ TenantId extracted: {}", tenantId))
                .doOnError(e -> log.error("❌ Failed to extract tenantId: {}", e.getMessage()))
                .flatMap(tenantId -> {
                    log.info("🔍 Finding appointment {} for tenant {}", id, tenantId);
                    return appointmentService.updateStatus(id, request.getStatus(), tenantId)
                        .doOnSuccess(dto -> log.info("✅ Status updated successfully for appointment {}", id))
                        .doOnError(e -> log.error("❌ Service error: {}", e.getMessage(), e));
                })
                .map(dto -> {
                    log.info("✅ Returning 200 OK with updated appointment");
                    return ResponseEntity.ok(dto);
                })
                .onErrorResume(e -> {
                    log.error("❌ ERROR in updateAppointmentStatus", e);
                    log.error("❌ Error type: {}", e.getClass().getName());
                    log.error("❌ Error message: {}", e.getMessage());
                    
                    // Handle specific errors
                    if (e instanceof IllegalStateException && e.getMessage().contains("TenantId not found")) {
                        log.error("❌ Returning 403 - Tenant context not found");
                        return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
                    }
                    
                    if (e.getMessage() != null && e.getMessage().contains("Appointment not found")) {
                        log.error("❌ Returning 404 - Appointment not found");
                        return Mono.just(ResponseEntity.notFound().build());
                    }
                    
                    // Generic server error
                    log.error("❌ Returning 500 - Internal server error");
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
                });
    }
}
