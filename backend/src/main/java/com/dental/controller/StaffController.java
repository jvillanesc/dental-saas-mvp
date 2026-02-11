package com.dental.controller;

import com.dental.dto.CreateStaffRequest;
import com.dental.dto.StaffDTO;
import com.dental.security.TenantContext;
import com.dental.service.StaffService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/staff")
public class StaffController {
    
    private final StaffService staffService;
    
    public StaffController(StaffService staffService) {
        this.staffService = staffService;
    }
    
    @GetMapping
    public Mono<ResponseEntity<List<StaffDTO>>> getAllStaff() {
        return TenantContext.getTenantId()
                .flatMapMany(tenantId -> staffService.getAllStaff(tenantId))
                .collectList()
                .map(ResponseEntity::ok);
    }
    
    @GetMapping("/{id}")
    public Mono<ResponseEntity<StaffDTO>> getStaffById(@PathVariable UUID id) {
        return TenantContext.getTenantId()
                .flatMap(tenantId -> staffService.getStaffById(id, tenantId)
                        .map(ResponseEntity::ok)
                        .defaultIfEmpty(ResponseEntity.notFound().build()));
    }
    
    @PostMapping
    public Mono<ResponseEntity<StaffDTO>> createStaff(@RequestBody CreateStaffRequest request) {
        return TenantContext.getTenantId()
                .flatMap(tenantId -> staffService.createStaff(tenantId, request)
                        .map(created -> ResponseEntity.status(HttpStatus.CREATED).body(created))
                        .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().build())));
    }
    
    @PutMapping("/{id}")
    public Mono<ResponseEntity<StaffDTO>> updateStaff(
            @PathVariable UUID id,
            @RequestBody StaffDTO dto) {
        return TenantContext.getTenantId()
                .flatMap(tenantId -> staffService.updateStaff(id, tenantId, dto)
                        .map(ResponseEntity::ok)
                        .onErrorResume(e -> Mono.just(ResponseEntity.notFound().build())));
    }
    
    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deleteStaff(@PathVariable UUID id) {
        return TenantContext.getTenantId()
                .flatMap(tenantId -> staffService.deleteStaff(id, tenantId)
                        .then(Mono.just(ResponseEntity.noContent().<Void>build()))
                        .onErrorResume(e -> Mono.just(ResponseEntity.notFound().build())));
    }
}
