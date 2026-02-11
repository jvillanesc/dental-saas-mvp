package com.dental.repository;

import com.dental.domain.model.Appointment;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends ReactiveCrudRepository<Appointment, UUID> {
    
    Flux<Appointment> findByTenantId(UUID tenantId);
    
    @Query("SELECT * FROM appointments WHERE id = :id AND tenant_id = :tenantId")
    Mono<Appointment> findByIdAndTenantId(UUID id, UUID tenantId);
    
    @Query("SELECT * FROM appointments WHERE tenant_id = :tenantId AND start_time BETWEEN :startDate AND :endDate")
    Flux<Appointment> findByTenantIdAndDateRange(UUID tenantId, LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT * FROM appointments WHERE dentist_id = :dentistId AND start_time BETWEEN :startDate AND :endDate")
    Flux<Appointment> findByDentistIdAndDateRange(UUID dentistId, LocalDateTime startDate, LocalDateTime endDate);
}
