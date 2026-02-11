# Design: JWT Tenant Extraction

**Change:** extract-tenant-from-jwt  
**Created:** 2026-02-09

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│  User Login → Store JWT → Send in Authorization header      │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    Authorization: Bearer <JWT>
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Spring WebFlux)                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  1. JwtAuthenticationFilter (NEW)                  │    │
│  │     - Extract JWT from Authorization header         │    │
│  │     - Validate signature & expiration               │    │
│  │     - Extract tenantId from claims                  │    │
│  │     - Store in Reactor Context                      │    │
│  └────────────────────────────────────────────────────┘    │
│                              ↓                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │  2. TenantContext (NEW)                            │    │
│  │     - Provides: Mono<String> getTenantId()         │    │
│  │     - Reads from Reactor Context                    │    │
│  └────────────────────────────────────────────────────┘    │
│                              ↓                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │  3. Controllers (MODIFIED)                         │    │
│  │     - Call TenantContext.getTenantId()             │    │
│  │     - Pass to service layer                         │    │
│  │     - No more hardcoded tenant IDs                  │    │
│  └────────────────────────────────────────────────────┘    │
│                              ↓                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │  4. Services & Repositories (UNCHANGED)            │    │
│  │     - Continue to filter by tenantId parameter      │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Component Design

### 1. JwtUtil Enhancement

**File:** `backend/src/main/java/com/dental/security/JwtUtil.java`

**Modifications:**
```java
public class JwtUtil {
    
    // MODIFIED: Add tenantId parameter
    public String generateToken(String email, String role, String tenantId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("tenantId", tenantId); // NEW CLAIM
        return createToken(claims, email);
    }
    
    // NEW: Extract tenantId from token
    public String extractTenantId(String token) {
        return extractClaim(token, claims -> claims.get("tenantId", String.class));
    }
    
    // Existing methods remain unchanged
    public String extractEmail(String token) { ... }
    public String extractRole(String token) { ... }
    public Boolean validateToken(String token, String email) { ... }
}
```

**Changes:**
- ✅ Add `tenantId` to JWT claims map
- ✅ Create `extractTenantId()` method
- ✅ Keep existing methods compatible

---

### 2. TenantContext Utility (NEW)

**File:** `backend/src/main/java/com/dental/security/TenantContext.java`

**Implementation:**
```java
package com.dental.security;

import reactor.core.publisher.Mono;
import reactor.util.context.Context;

/**
 * Utility for accessing tenant context in reactive operations.
 * Uses Reactor Context to propagate tenantId through the reactive chain.
 */
public class TenantContext {
    
    private static final String TENANT_ID_KEY = "tenantId";
    
    /**
     * Retrieve the current tenant ID from reactive context.
     * 
     * @return Mono containing tenantId, or error if not found
     */
    public static Mono<String> getTenantId() {
        return Mono.deferContextual(ctx -> {
            if (ctx.hasKey(TENANT_ID_KEY)) {
                return Mono.just(ctx.get(TENANT_ID_KEY));
            }
            return Mono.error(new IllegalStateException("TenantId not found in context"));
        });
    }
    
    /**
     * Create a context with the given tenantId.
     * Used by security filter to initialize tenant context.
     * 
     * @param tenantId Tenant UUID
     * @return Context with tenantId
     */
    public static Context withTenantId(String tenantId) {
        return Context.of(TENANT_ID_KEY, tenantId);
    }
}
```

**Key Features:**
- Immutable context propagation
- Type-safe tenant access
- Error handling for missing context
- Compatible with all Reactor operators

---

### 3. JWT Authentication Filter (NEW)

**File:** `backend/src/main/java/com/dental/security/JwtAuthenticationFilter.java`

**Implementation:**
```java
package com.dental.security;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.List;

public class JwtAuthenticationFilter implements WebFilter {
    
    private final JwtUtil jwtUtil;
    
    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getPath().value();
        
        // Skip JWT validation for public endpoints
        if (path.equals("/api/auth/login") || path.equals("/api/auth/register")) {
            return chain.filter(exchange);
        }
        
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        
        String token = authHeader.substring(7);
        
        try {
            String email = jwtUtil.extractEmail(token);
            String tenantId = jwtUtil.extractTenantId(token);
            
            if (jwtUtil.validateToken(token, email)) {
                // Create authentication
                UsernamePasswordAuthenticationToken auth = 
                    new UsernamePasswordAuthenticationToken(email, null, List.of());
                
                // Continue with tenant context
                return chain.filter(exchange)
                    .contextWrite(ReactiveSecurityContextHolder.withAuthentication(auth))
                    .contextWrite(TenantContext.withTenantId(tenantId));
            }
        } catch (Exception e) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }
}
```

**Responsibilities:**
- Extract JWT from Authorization header
- Validate token signature and expiration
- Extract tenantId and email from claims
- Store tenantId in Reactor Context
- Return 401 for invalid/missing tokens

---

### 4. Security Configuration Update

**File:** `backend/src/main/java/com/dental/config/SecurityConfig.java`

**Current State:**
```java
@Bean
public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
    return http
        .csrf(ServerHttpSecurity.CsrfSpec::disable)
        .authorizeExchange(exchanges -> exchanges
            .anyExchange().permitAll() // ❌ PROBLEM: No security!
        )
        .build();
}
```

**New Implementation:**
```java
@Bean
public SecurityWebFilterChain securityWebFilterChain(
        ServerHttpSecurity http, 
        JwtAuthenticationFilter jwtFilter) {
    return http
        .csrf(ServerHttpSecurity.CsrfSpec::disable)
        .authorizeExchange(exchanges -> exchanges
            .pathMatchers("/api/auth/login", "/api/auth/register").permitAll()
            .anyExchange().authenticated() // ✅ Require authentication
        )
        .addFilterAt(jwtFilter, SecurityWebFiltersOrder.AUTHENTICATION)
        .build();
}

@Bean
public JwtAuthenticationFilter jwtAuthenticationFilter(JwtUtil jwtUtil) {
    return new JwtAuthenticationFilter(jwtUtil);
}
```

**Changes:**
- Replace `.permitAll()` with `.authenticated()`
- Allow public access only to login/register
- Add JWT filter to authentication chain

---

### 5. AuthController Update

**File:** `backend/src/main/java/com/dental/controller/AuthController.java`

**Current:**
```java
public Mono<ResponseEntity<Map<String, String>>> login(@RequestBody LoginRequest request) {
    return authService.authenticate(request.getEmail(), request.getPassword())
        .map(user -> {
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
            // ...
        });
}
```

**Modified:**
```java
public Mono<ResponseEntity<Map<String, String>>> login(@RequestBody LoginRequest request) {
    return authService.authenticate(request.getEmail(), request.getPassword())
        .map(user -> {
            // ✅ Include tenantId in token generation
            String token = jwtUtil.generateToken(
                user.getEmail(), 
                user.getRole().name(),
                user.getTenantId() // NEW PARAMETER
            );
            
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            response.put("email", user.getEmail());
            response.put("role", user.getRole().name());
            response.put("tenantId", user.getTenantId()); // Include in response
            return ResponseEntity.ok(response);
        });
}
```

---

### 6. Controller Pattern (All Controllers)

**Example: DashboardController**

**Before:**
```java
@GetMapping("/stats")
public Mono<DashboardStatsDTO> getStats() {
    String tenantId = "550e8400-e29b-41d4-a716-446655440000"; // ❌ Hardcoded
    return dashboardService.getStats(tenantId);
}
```

**After:**
```java
@GetMapping("/stats")
public Mono<DashboardStatsDTO> getStats() {
    return TenantContext.getTenantId()
        .flatMap(tenantId -> dashboardService.getStats(tenantId));
}
```

**Apply to ALL controllers:**
- ✅ DashboardController
- ✅ UserController
- ✅ PatientController
- ✅ StaffController
- ✅ AppointmentController
- ✅ DentistController

---

## Data Flow

### Successful Authentication Flow
```
1. User submits credentials to POST /api/auth/login
2. AuthController validates against database
3. JwtUtil.generateToken(email, role, tenantId) creates JWT
4. Response includes token with embedded tenantId
5. Frontend stores token in localStorage
6. Frontend sends token in Authorization header for all requests
```

### Request Flow with JWT
```
1. Request arrives with Authorization: Bearer <token>
2. JwtAuthenticationFilter intercepts request
3. Filter validates token signature and expiration
4. Filter extracts tenantId from JWT claims
5. Filter stores tenantId in Reactor Context
6. Request proceeds to controller
7. Controller calls TenantContext.getTenantId()
8. Service filters database queries by tenantId
9. Response contains only tenant-specific data
```

### Unauthenticated Request Flow
```
1. Request arrives without Authorization header
2. JwtAuthenticationFilter intercepts request
3. Filter returns 401 Unauthorized immediately
4. Response: { "error": "Unauthorized" }
5. Frontend redirects to login page
```

---

## Database Queries (Unchanged)

Services and repositories already filter by `tenantId`:

```java
// Example: PatientRepository
@Query("SELECT * FROM patients WHERE tenant_id = :tenantId AND deleted_at IS NULL")
Flux<Patient> findByTenantId(String tenantId);
```

**No changes needed** - they continue to receive tenantId from controllers.

---

## Error Handling

| Scenario | HTTP Status | Response | Frontend Action |
|----------|-------------|----------|-----------------|
| No token provided | 401 | `Unauthorized` | Redirect to login |
| Invalid token signature | 401 | `Unauthorized` | Clear token, redirect to login |
| Expired token | 401 | `Unauthorized` | Clear token, redirect to login |
| Valid token, wrong role | 403 | `Forbidden` | Show "Access Denied" message |
| TenantId not in context | 500 | `Internal Server Error` | Log error, show generic message |

---

## Testing Strategy

### Unit Tests

**JwtUtilTest.java:**
```java
@Test
void generateToken_shouldIncludeTenantId() {
    String token = jwtUtil.generateToken("test@example.com", "ADMIN", "tenant-123");
    String extractedTenantId = jwtUtil.extractTenantId(token);
    assertEquals("tenant-123", extractedTenantId);
}
```

**TenantContextTest.java:**
```java
@Test
void getTenantId_shouldReturnValueFromContext() {
    StepVerifier.create(
        Mono.just("test")
            .flatMap(val -> TenantContext.getTenantId())
            .contextWrite(TenantContext.withTenantId("tenant-123"))
    )
    .expectNext("tenant-123")
    .verifyComplete();
}
```

---

### Integration Tests

**DashboardControllerIntegrationTest.java:**
```java
@Test
void getStats_withClinicaABCToken_returnsClinicaABCData() {
    String token = generateTokenForTenant("550e8400-e29b-41d4-a716-446655440000");
    
    webTestClient.get()
        .uri("/api/dashboard/stats")
        .header("Authorization", "Bearer " + token)
        .exchange()
        .expectStatus().isOk()
        .expectBody()
        .jsonPath("$.totalPatients").isEqualTo(3)
        .jsonPath("$.activeStaff").isEqualTo(3);
}

@Test
void getStats_withDentalCareToken_returnsDentalCareData() {
    String token = generateTokenForTenant("550e8400-e29b-41d4-a716-446655440001");
    
    webTestClient.get()
        .uri("/api/dashboard/stats")
        .header("Authorization", "Bearer " + token)
        .exchange()
        .expectStatus().isOk()
        .expectBody()
        .jsonPath("$.totalPatients").isEqualTo(4)
        .jsonPath("$.activeStaff").isEqualTo(4);
}

@Test
void getStats_withoutToken_returns401() {
    webTestClient.get()
        .uri("/api/dashboard/stats")
        .exchange()
        .expectStatus().isUnauthorized();
}
```

---

## Rollback Plan

If issues arise:

1. **Revert SecurityConfig** - Change back to `.permitAll()`
2. **Keep TenantContext** - Useful utility even without security
3. **Gradual Rollout** - Can enable security per-controller using `@PreAuthorize`

---

## Performance Considerations

- **Reactor Context**: Negligible overhead, immutable data structure
- **JWT Validation**: ~1-2ms per request (signature check)
- **Context Propagation**: Automatic, no performance impact
- **Memory**: Each context holds one UUID string (~36 bytes)

**Expected Impact:** < 5ms added latency per request

---

## Security Considerations

- **JWT Secret**: Use environment variable in production
- **Token Expiration**: Current: 24 hours (consider reducing to 1-2 hours)
- **Refresh Tokens**: Consider implementing for better UX
- **HTTPS Only**: Enforce in production to protect tokens in transit
- **Token Revocation**: Consider implementing blacklist for logged-out tokens

---

## Migration Path

1. ✅ Phase 1: Implement TenantContext and JwtUtil changes
2. ✅ Phase 2: Update AuthController to include tenantId in JWT
3. ✅ Phase 3: Update all controllers to use TenantContext
4. ✅ Phase 4: Enable security in SecurityConfig
5. ✅ Phase 5: Test with both tenants
6. ✅ Phase 6: Deploy and monitor

**Estimated Total Time:** 3-4 hours
