package com.dental.service;

import com.dental.dto.DashboardStatsDTO;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.UUID;

@Service
public class DashboardService {

    private final DatabaseClient databaseClient;

    public DashboardService(DatabaseClient databaseClient) {
        this.databaseClient = databaseClient;
    }

    public Mono<DashboardStatsDTO> getStatsForTenant(UUID tenantId) {
        Mono<Long> totalPatients = countTotalPatients(tenantId);
        Mono<Long> activeStaff = countActiveStaff(tenantId);
        Mono<Long> appointmentsToday = countAppointmentsToday(tenantId);
        Mono<Long> appointmentsPending = countAppointmentsPending(tenantId);

        return Mono.zip(totalPatients, activeStaff, appointmentsToday, appointmentsPending)
                .map(tuple -> new DashboardStatsDTO(
                        tuple.getT1(),
                        tuple.getT2(),
                        tuple.getT3(),
                        tuple.getT4()
                ));
    }

    private Mono<Long> countTotalPatients(UUID tenantId) {
        String sql = "SELECT COUNT(*) FROM patients WHERE tenant_id = :tenantId AND deleted_at IS NULL";
        return databaseClient.sql(sql)
                .bind("tenantId", tenantId)
                .map(row -> row.get(0, Long.class))
                .one()
                .defaultIfEmpty(0L);
    }

    private Mono<Long> countActiveStaff(UUID tenantId) {
        String sql = "SELECT COUNT(*) FROM staff WHERE tenant_id = :tenantId AND deleted_at IS NULL";
        return databaseClient.sql(sql)
                .bind("tenantId", tenantId)
                .map(row -> row.get(0, Long.class))
                .one()
                .defaultIfEmpty(0L);
    }

    private Mono<Long> countAppointmentsToday(UUID tenantId) {
        String sql = "SELECT COUNT(*) FROM appointments WHERE tenant_id = :tenantId AND DATE(start_time) = :today";
        return databaseClient.sql(sql)
                .bind("tenantId", tenantId)
                .bind("today", LocalDate.now())
                .map(row -> row.get(0, Long.class))
                .one()
                .defaultIfEmpty(0L);
    }

    private Mono<Long> countAppointmentsPending(UUID tenantId) {
        String sql = "SELECT COUNT(*) FROM appointments WHERE tenant_id = :tenantId AND status = 'SCHEDULED'";
        return databaseClient.sql(sql)
                .bind("tenantId", tenantId)
                .map(row -> row.get(0, Long.class))
                .one()
                .defaultIfEmpty(0L);
    }
}
