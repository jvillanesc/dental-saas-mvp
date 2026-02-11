package com.dental.repository;

import com.dental.domain.model.Patient;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.util.UUID;

@Repository
public interface PatientRepository extends ReactiveCrudRepository<Patient, UUID> {
    
    @Query("SELECT * FROM patients WHERE tenant_id = :tenantId AND deleted_at IS NULL")
    Flux<Patient> findByTenantIdAndNotDeleted(UUID tenantId);
    
    @Query("SELECT * FROM patients WHERE id = :id AND tenant_id = :tenantId AND deleted_at IS NULL")
    Mono<Patient> findByIdAndTenantIdAndNotDeleted(UUID id, UUID tenantId);
}
