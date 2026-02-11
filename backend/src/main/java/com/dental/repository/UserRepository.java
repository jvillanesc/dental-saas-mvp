package com.dental.repository;

import com.dental.domain.model.User;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.util.UUID;

@Repository
public interface UserRepository extends ReactiveCrudRepository<User, UUID> {
    Mono<User> findByEmail(String email);
    Flux<User> findByTenantId(UUID tenantId);
    Mono<User> findByIdAndTenantId(UUID id, UUID tenantId);
    Mono<User> findByEmailAndTenantId(String email, UUID tenantId);
}
