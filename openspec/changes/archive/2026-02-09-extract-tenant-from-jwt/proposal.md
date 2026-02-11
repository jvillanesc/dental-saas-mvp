# Proposal: Extract Tenant from JWT

**Status:** Approved  
**Created:** 2026-02-09  
**Priority:** Critical

## Problem Statement

The application currently has **two critical security and multi-tenancy issues**:

### 1. Hardcoded Tenant IDs
All controllers use hardcoded `tenantId` values:
```java
String tenantId = "550e8400-e29b-41d4-a716-446655440000"; // Hardcoded!
```

This prevents:
- Multiple tenants from using the same deployment
- Dynamic tenant switching based on authenticated user
- Proper tenant isolation as intended by the architecture

### 2. JWT Security Not Enforced
`SecurityConfig.java` has `.permitAll()` for all endpoints:
```java
.authorizeExchange(exchanges -> exchanges.anyExchange().permitAll())
```

This means:
- No authentication required for any endpoint
- JWT tokens are generated but never validated
- Anyone can access any tenant's data without credentials

## Proposed Solution

Implement **dynamic tenant extraction from JWT** with proper security enforcement:

### Phase 1: JWT Enhancement
1. **Add tenantId to JWT claims** - Modify `JwtUtil.generateToken()` to include tenantId
2. **Extract tenantId from JWT** - Create method `JwtUtil.extractTenantId(token)`
3. **Update AuthController** - Include user's tenantId when generating token

### Phase 2: Security Enforcement
1. **Enable JWT validation** - Remove `.permitAll()` from SecurityConfig
2. **Configure authentication** - Use `SecurityWebFilterChain` with JWT filter
3. **Public endpoints** - Only `/api/auth/login` and `/api/auth/register` remain public

### Phase 3: Reactive Context Propagation
1. **Create TenantContext** - Utility to store/retrieve tenantId in reactive context
2. **Security filter** - Extract tenantId from validated JWT and store in context
3. **Controller integration** - Replace hardcoded values with context extraction

### Phase 4: Controller Updates
Update all controllers to extract tenantId dynamically:
- DashboardController
- UserController
- PatientController
- StaffController
- AppointmentController
- DentistController

## Benefits

✅ **True Multi-Tenancy** - Each user sees only their tenant's data  
✅ **Security Enforced** - All endpoints require valid JWT  
✅ **Scalable** - Support unlimited tenants without code changes  
✅ **Maintainable** - No hardcoded tenant IDs to manage  
✅ **Testable** - Can test with multiple tenant credentials  

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing API calls | High | Keep backward compatibility with X-Tenant-ID header during transition |
| Session management complexity | Medium | Use Reactor Context for tenant propagation |
| JWT token size increase | Low | TenantId is just a UUID string (36 chars) |
| Frontend token refresh needed | Medium | Current tokens remain valid (frontend already sends them) |

## Testing Strategy

1. **Unit Tests** - Test JWT generation/extraction with tenantId
2. **Integration Tests** - Test each controller with different tenant tokens
3. **Manual Testing**:
   - Login as admin@clinicaabc.com → verify sees Clínica ABC data only
   - Login as admin@dentalcare.com → verify sees Dental Care Premium data only
   - Try accessing without token → verify 401 Unauthorized
   - Try accessing with invalid token → verify 401 Unauthorized

## Implementation Estimate

- **Backend Implementation**: 2-3 hours
- **Testing & Validation**: 1 hour
- **Total**: 3-4 hours

## Decision

**Approved** - This resolves Known Technical Debt Issue #1 and enables proper multi-tenancy.
