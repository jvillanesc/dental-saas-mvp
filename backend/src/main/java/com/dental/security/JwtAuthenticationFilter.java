package com.dental.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

/**
 * JWT Authentication Filter for validating and extracting tenant context from JWT tokens.
 * This filter validates JWT tokens and stores the tenantId in the Reactor Context for downstream use.
 */
@Component
public class JwtAuthenticationFilter implements WebFilter {
    
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    
    private final JwtUtil jwtUtil;
    
    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();
        
        // Skip JWT validation for public endpoints
        if (path.startsWith("/api/auth/")) {
            log.debug("Skipping JWT validation for public endpoint: {}", path);
            return chain.filter(exchange);
        }
        
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        
        // For now, allow requests without token (backwards compatibility during migration)
        // TODO: Change to return 401 once all endpoints are updated
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("No JWT token provided for: {}", path);
            return chain.filter(exchange);
        }
        
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        
        try {
            // Validate token
            jwtUtil.validateToken(token);
            
            // Extract claims
            UUID userId = jwtUtil.getUserIdFromToken(token);
            UUID tenantId = jwtUtil.getTenantIdFromToken(token);
            String role = jwtUtil.getRoleFromToken(token);
            
            log.debug("JWT validated - userId: {}, tenantId: {}, role: {}", userId, tenantId, role);
            
            // Create authentication with role
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(
                    userId.toString(), 
                    null, 
                    List.of(new SimpleGrantedAuthority("ROLE_" + role))
                );
            
            // Continue with both security context and tenant context
            return chain.filter(exchange)
                .contextWrite(ReactiveSecurityContextHolder.withAuthentication(authentication))
                .contextWrite(TenantContext.withTenantId(tenantId));
                
        } catch (Exception e) {
            log.error("JWT validation failed for path: {} - Error: {}", path, e.getMessage());
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
    }
}
