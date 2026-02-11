package com.dental.controller;

import com.dental.dto.DentistDTO;
import com.dental.repository.StaffRepository;
import com.dental.security.TenantContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@RestController
@RequestMapping("/api/dentists")
public class DentistController {
    
    private final StaffRepository staffRepository;
    
    public DentistController(StaffRepository staffRepository) {
        this.staffRepository = staffRepository;
    }
    
    @GetMapping
    public Mono<ResponseEntity<Flux<DentistDTO>>> getDentists() {
        return TenantContext.getTenantId()
                .map(tenantId -> {
                    Flux<DentistDTO> dentists = staffRepository.findByTenantIdAndNotDeleted(tenantId)
                            .filter(staff -> staff.getUserId() != null)
                            .map(staff -> new DentistDTO(
                                    staff.getUserId(),
                                    staff.getFirstName(),
                                    staff.getLastName(),
                                    staff.getFirstName() + " " + staff.getLastName()
                            ));
                    return ResponseEntity.ok(dentists);
                });
    }
}
