package com.dental.repository;

import com.dental.domain.model.MedicalHistory;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;
import java.util.UUID;

@Repository
public interface MedicalHistoryRepository extends ReactiveCrudRepository<MedicalHistory, UUID> {
    
    @Query("SELECT * FROM medical_history WHERE tenant_id = :tenantId AND patient_id = :patientId AND deleted_at IS NULL")
    Mono<MedicalHistory> findByTenantIdAndPatientIdAndNotDeleted(UUID tenantId, UUID patientId);
}
