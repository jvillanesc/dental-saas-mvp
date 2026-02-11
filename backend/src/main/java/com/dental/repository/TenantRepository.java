package com.dental.repository;

import com.dental.domain.model.Tenant;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface TenantRepository extends ReactiveCrudRepository<Tenant, UUID> {
}
