package com.dental.controller;

import com.dental.dto.AppointmentDTO;
import com.dental.security.TenantContext;
import com.dental.service.AppointmentService;
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
    
    private final AppointmentService appointmentService;
    
    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }
    
    @GetMapping
    public Mono<ResponseEntity<Flux<AppointmentDTO>>> getAllAppointments(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return TenantContext.getTenantId()
                .map(tenantId -> {
                    if (startDate != null && endDate != null) {
                        LocalDateTime startDateTime = startDate.atStartOfDay();
                        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
                        return ResponseEntity.ok(appointmentService.getAppointmentsByDateRange(tenantId, startDateTime, endDateTime));
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
}
