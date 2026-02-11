package com.dental.security;

import reactor.core.publisher.Mono;
import reactor.util.context.Context;

import java.util.UUID;

/**
 * Utility for accessing tenant context in reactive operations.
 * Uses Reactor Context to propagate tenantId through the reactive chain.
 */
public class TenantContext {
    
    private static final String TENANT_ID_KEY = "tenantId";
    
    /**
     * Retrieve the current tenant ID from reactive context.
     * 
     * @return Mono containing tenantId UUID, or error if not found
     */
    public static Mono<UUID> getTenantId() {
        return Mono.deferContextual(ctx -> {
            if (ctx.hasKey(TENANT_ID_KEY)) {
                return Mono.just(ctx.get(TENANT_ID_KEY));
            }
            return Mono.error(new IllegalStateException("TenantId not found in context. Ensure JWT filter is configured."));
        });
    }
    
    /**
     * Create a context with the given tenantId.
     * Used by security filter to initialize tenant context.
     * 
     * @param tenantId Tenant UUID
     * @return Context with tenantId
     */
    public static Context withTenantId(UUID tenantId) {
        return Context.of(TENANT_ID_KEY, tenantId);
    }
}
