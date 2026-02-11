package com.dental.repository;

import com.dental.domain.model.Staff;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.util.UUID;

@Repository
public interface StaffRepository extends ReactiveCrudRepository<Staff, UUID> {
    
    @Query("SELECT * FROM staff WHERE tenant_id = :tenantId AND deleted_at IS NULL")
    Flux<Staff> findByTenantIdAndNotDeleted(UUID tenantId);
    
    @Query("SELECT * FROM staff WHERE id = :id AND tenant_id = :tenantId AND deleted_at IS NULL")
    Mono<Staff> findByIdAndTenantIdAndNotDeleted(UUID id, UUID tenantId);
    
    @Query("SELECT * FROM staff WHERE id = :id AND tenant_id = :tenantId")
    Mono<Staff> findByIdAndTenantId(UUID id, UUID tenantId);
    
    @Query("SELECT * FROM staff WHERE tenant_id = :tenantId AND license_number = :licenseNumber AND deleted_at IS NULL")
    Mono<Staff> findByTenantIdAndLicenseNumber(UUID tenantId, String licenseNumber);
}
