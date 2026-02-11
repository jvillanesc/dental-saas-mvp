# Security Specification - JWT Tenant Extraction

**Domain:** Security & Multi-Tenancy  
**Status:** Delta Spec (ADDED requirements)  
**Last Updated:** 2026-02-09

## Overview

This specification defines the requirements for extracting tenant context from JWT tokens and enforcing security across all API endpoints.

## Requirements

### SEC-JWT-001: JWT Payload Enhancement
**Priority:** Critical  
**Status:** ADDED

The JWT payload MUST include:
- `tenantId` (String) - UUID of the user's tenant
- `sub` (String) - User email (existing)
- `role` (String) - User role: ADMIN, DENTIST, or ASSISTANT (existing)
- `exp` (Long) - Expiration timestamp (existing)
- `iat` (Long) - Issued at timestamp (existing)

**Example JWT Claims:**
```json
{
  "sub": "admin@clinicaabc.com",
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "role": "ADMIN",
  "iat": 1707484800,
  "exp": 1707571200
}
```

**Acceptance Criteria:**
- JwtUtil.generateToken() accepts tenantId parameter
- JwtUtil.extractTenantId(token) returns tenantId from claims
- AuthController passes user.tenantId when generating token

---

### SEC-JWT-002: Security Configuration
**Priority:** Critical  
**Status:** ADDED

SecurityConfig MUST enforce JWT validation for all endpoints except public ones.

**Public Endpoints (no auth required):**
- `POST /api/auth/login`
- `POST /api/auth/register` (if exists)

**Protected Endpoints (JWT required):**
- All other `/api/**` endpoints

**Acceptance Criteria:**
- Remove `.permitAll()` from SecurityConfig
- Configure `SecurityWebFilterChain` with JWT authentication
- Return 401 Unauthorized for missing/invalid tokens
- Return 403 Forbidden for valid token but insufficient permissions

---

### SEC-JWT-003: Tenant Context Propagation
**Priority:** Critical  
**Status:** ADDED

Implement reactive context propagation for tenant isolation.

**Components:**
1. **TenantContext** - Utility class to store/retrieve tenantId
   ```java
   public class TenantContext {
       private static final String TENANT_ID_KEY = "tenantId";
       
       public static Mono<String> getTenantId() {
           return Mono.deferContextual(ctx -> 
               Mono.just(ctx.get(TENANT_ID_KEY))
           );
       }
       
       public static Context withTenantId(String tenantId) {
           return Context.of(TENANT_ID_KEY, tenantId);
       }
   }
   ```

2. **JwtAuthenticationFilter** - Extract and store tenantId
   - Validate JWT token
   - Extract tenantId from claims
   - Store in reactor Context
   - Continue filter chain

**Acceptance Criteria:**
- TenantContext.getTenantId() returns Mono<String> with current tenantId
- Filter automatically propagates tenantId to all downstream operations
- Controllers can access tenantId via TenantContext without manual passing

---

### SEC-JWT-004: Controller Integration
**Priority:** Critical  
**Status:** ADDED

All controllers MUST use dynamic tenant extraction instead of hardcoded values.

**Before:**
```java
@GetMapping("/stats")
public Mono<DashboardStatsDTO> getStats() {
    String tenantId = "550e8400-e29b-41d4-a716-446655440000"; // Hardcoded!
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

**Affected Controllers:**
- DashboardController
- UserController
- PatientController
- StaffController
- AppointmentController
- DentistController

**Acceptance Criteria:**
- All controllers use TenantContext.getTenantId()
- No hardcoded tenant IDs remain in controllers
- Each endpoint filters data by authenticated user's tenant

---

## API Changes

### Authentication Endpoint (Modified)

**POST /api/auth/login**

Response now includes tenantId in JWT:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "admin@clinicaabc.com",
  "role": "ADMIN",
  "tenantId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Scenarios

### Scenario 1: Clínica ABC User Login
```
GIVEN user with email "admin@clinicaabc.com"
AND user belongs to tenant "550e8400-e29b-41d4-a716-446655440000"
WHEN user logs in with valid credentials
THEN JWT token includes tenantId claim
AND all subsequent API calls filter by that tenantId
AND user sees only Clínica ABC data (3 patients, 3 staff, etc.)
```

### Scenario 2: Dental Care Premium User Login
```
GIVEN user with email "admin@dentalcare.com"
AND user belongs to tenant "550e8400-e29b-41d4-a716-446655440001"
WHEN user logs in with valid credentials
THEN JWT token includes different tenantId
AND all subsequent API calls filter by that tenantId
AND user sees only Dental Care Premium data (4 patients, 4 staff, etc.)
```

### Scenario 3: Unauthenticated Access Denied
```
GIVEN no JWT token provided
WHEN user tries to access GET /api/dashboard/stats
THEN response returns 401 Unauthorized
AND response includes WWW-Authenticate header
```

### Scenario 4: Invalid Token Rejected
```
GIVEN expired or malformed JWT token
WHEN user tries to access any protected endpoint
THEN response returns 401 Unauthorized
AND user must login again to get new token
```

---

## Implementation Notes

### Reactor Context Best Practices
- Use `Mono.deferContextual()` to access context
- Store context with `.contextWrite(TenantContext.withTenantId(id))`
- Context is immutable and thread-safe
- Propagates automatically through flatMap, map, filter, etc.

### JWT Secret Management
- Use strong secret key (current: dental-app-secret-key-2024)
- Store in environment variable (not hardcoded)
- Consider rotation strategy for production

### Error Handling
- 401 Unauthorized: No token or invalid token
- 403 Forbidden: Valid token but insufficient role permissions (future)
- 500 Internal Server Error: TenantId missing from context (should never happen)

---

## Testing Requirements

### Unit Tests
- [x] JwtUtil.generateToken() includes tenantId claim
- [x] JwtUtil.extractTenantId() retrieves tenantId from token
- [x] TenantContext.getTenantId() returns correct value
- [x] Controllers extract tenantId from context

### Integration Tests
- [x] Login returns token with tenantId
- [x] Dashboard endpoint returns tenant-specific stats
- [x] Patient endpoint returns only tenant's patients
- [x] Different tenant sees different data

### Security Tests
- [x] Accessing protected endpoint without token → 401
- [x] Accessing with expired token → 401
- [x] Accessing with invalid signature → 401

---

## Related Specifications
- [Authentication Spec](../auth/spec.md) - Login flow
- [Tenant Spec](../tenant/spec.md) - Multi-tenancy architecture
- [User Spec](../user/spec.md) - User-tenant relationship
