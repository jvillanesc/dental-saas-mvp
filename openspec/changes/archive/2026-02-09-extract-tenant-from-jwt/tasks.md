# Tasks: Extract Tenant from JWT

**Change:** extract-tenant-from-jwt  
**Status:** Ready for Implementation

## Task Breakdown

### Phase 1: Core Utilities

#### TASK-1.1: Create TenantContext Utility
**File:** `backend/src/main/java/com/dental/security/TenantContext.java`

- [ ] Create new file in security package
- [ ] Implement `getTenantId()` method returning `Mono<String>`
- [ ] Implement `withTenantId(String)` method returning `Context`
- [ ] Add JavaDoc comments
- [ ] Handle missing context with clear error message

**Estimated Time:** 15 minutes

---

#### TASK-1.2: Enhance JwtUtil
**File:** `backend/src/main/java/com/dental/security/JwtUtil.java`

- [ ] Modify `generateToken()` to accept `tenantId` parameter
- [ ] Add tenantId to claims map: `claims.put("tenantId", tenantId)`
- [ ] Create `extractTenantId(String token)` method
- [ ] Use `extractClaim()` to get tenantId from token
- [ ] Test JWT generation includes tenantId claim

**Estimated Time:** 20 minutes

---

### Phase 2: Security Filter

#### TASK-2.1: Create JWT Authentication Filter
**File:** `backend/src/main/java/com/dental/security/JwtAuthenticationFilter.java`

- [ ] Create new class implementing `WebFilter`
- [ ] Inject `JwtUtil` via constructor
- [ ] Implement `filter(ServerWebExchange, WebFilterChain)` method
- [ ] Skip validation for `/api/auth/login` and `/api/auth/register`
- [ ] Extract Authorization header
- [ ] Validate "Bearer " prefix
- [ ] Extract token substring
- [ ] Call `jwtUtil.validateToken()`
- [ ] Extract email and tenantId from token
- [ ] Create `UsernamePasswordAuthenticationToken`
- [ ] Return chain with context:
  - `.contextWrite(ReactiveSecurityContextHolder.withAuthentication(auth))`
  - `.contextWrite(TenantContext.withTenantId(tenantId))`
- [ ] Return 401 for invalid/missing tokens

**Estimated Time:** 45 minutes

---

### Phase 3: Security Configuration

#### TASK-3.1: Update SecurityConfig
**File:** `backend/src/main/java/com/dental/config/SecurityConfig.java`

- [ ] Add `@Bean` for `JwtAuthenticationFilter`
- [ ] Inject `JwtUtil` into bean method
- [ ] Modify `securityWebFilterChain()` to inject filter
- [ ] Replace `.permitAll()` with `.authenticated()`
- [ ] Add `.pathMatchers("/api/auth/login", "/api/auth/register").permitAll()`
- [ ] Add filter: `.addFilterAt(jwtFilter, SecurityWebFiltersOrder.AUTHENTICATION)`
- [ ] Remove or comment old permitAll configuration

**Estimated Time:** 15 minutes

---

### Phase 4: Authentication Update

#### TASK-4.1: Update AuthController
**File:** `backend/src/main/java/com/dental/controller/AuthController.java`

- [ ] Locate `login()` method
- [ ] Find `jwtUtil.generateToken()` call
- [ ] Add third parameter: `user.getTenantId()`
- [ ] Add tenantId to response map: `response.put("tenantId", user.getTenantId())`
- [ ] Verify User entity has `getTenantId()` method (it should)

**Estimated Time:** 10 minutes

---

### Phase 5: Controller Updates

#### TASK-5.1: Update DashboardController
**File:** `backend/src/main/java/com/dental/controller/DashboardController.java`

- [ ] Import `TenantContext`
- [ ] Locate `getStats()` method
- [ ] Remove hardcoded tenantId line
- [ ] Replace with:
  ```java
  return TenantContext.getTenantId()
      .flatMap(tenantId -> dashboardService.getStats(tenantId));
  ```

**Estimated Time:** 5 minutes

---

#### TASK-5.2: Update UserController
**File:** `backend/src/main/java/com/dental/controller/UserController.java`

- [ ] Import `TenantContext`
- [ ] Update `getAllUsers()`:
  ```java
  return TenantContext.getTenantId()
      .flatMapMany(tenantId -> userService.findByTenantId(tenantId));
  ```
- [ ] Update `createUser()`:
  ```java
  return TenantContext.getTenantId()
      .flatMap(tenantId -> {
          dto.setTenantId(tenantId);
          return userService.createUser(dto);
      });
  ```
- [ ] Update all other methods similarly

**Estimated Time:** 15 minutes

---

#### TASK-5.3: Update PatientController
**File:** `backend/src/main/java/com/dental/controller/PatientController.java`

- [ ] Import `TenantContext`
- [ ] Update `getAllPatients()`:
  ```java
  return TenantContext.getTenantId()
      .flatMapMany(tenantId -> patientService.findActiveByTenantId(tenantId));
  ```
- [ ] Update `createPatient()`:
  ```java
  return TenantContext.getTenantId()
      .flatMap(tenantId -> {
          dto.setTenantId(tenantId);
          return patientService.createPatient(dto);
      });
  ```
- [ ] Update `searchPatients()` similarly
- [ ] Update all other methods

**Estimated Time:** 15 minutes

---

#### TASK-5.4: Update StaffController
**File:** `backend/src/main/java/com/dental/controller/StaffController.java`

- [ ] Import `TenantContext`
- [ ] Update `getAllStaff()`:
  ```java
  return TenantContext.getTenantId()
      .flatMapMany(tenantId -> staffService.findActiveByTenantId(tenantId));
  ```
- [ ] Update `createStaff()`:
  ```java
  return TenantContext.getTenantId()
      .flatMap(tenantId -> {
          dto.setTenantId(tenantId);
          return staffService.createStaff(dto);
      });
  ```
- [ ] Update all other methods

**Estimated Time:** 15 minutes

---

#### TASK-5.5: Update AppointmentController
**File:** `backend/src/main/java/com/dental/controller/AppointmentController.java`

- [ ] Import `TenantContext`
- [ ] Update `getAllAppointments()`:
  ```java
  return TenantContext.getTenantId()
      .flatMapMany(tenantId -> appointmentService.findByTenantId(tenantId));
  ```
- [ ] Update `getWeekAppointments()`:
  ```java
  return TenantContext.getTenantId()
      .flatMapMany(tenantId -> 
          appointmentService.findByTenantIdAndDateRange(tenantId, startDate, endDate)
      );
  ```
- [ ] Update `createAppointment()`:
  ```java
  return TenantContext.getTenantId()
      .flatMap(tenantId -> {
          dto.setTenantId(tenantId);
          return appointmentService.createAppointment(dto);
      });
  ```
- [ ] Update all other methods

**Estimated Time:** 20 minutes

---

#### TASK-5.6: Update DentistController
**File:** `backend/src/main/java/com/dental/controller/DentistController.java`

- [ ] Import `TenantContext`
- [ ] Update `getAllDentists()`:
  ```java
  return TenantContext.getTenantId()
      .flatMapMany(tenantId -> dentistService.findByTenantId(tenantId));
  ```
- [ ] Update all other methods

**Estimated Time:** 10 minutes

---

### Phase 6: Testing

#### TASK-6.1: Unit Tests
**Files:** `backend/src/test/java/com/dental/security/`

- [ ] Create `TenantContextTest.java`
  - Test `getTenantId()` with context
  - Test `getTenantId()` without context (error)
  - Test `withTenantId()` creates context

- [ ] Create `JwtUtilTest.java`
  - Test `generateToken()` includes tenantId
  - Test `extractTenantId()` retrieves correct value
  - Test token with missing tenantId

**Estimated Time:** 30 minutes

---

#### TASK-6.2: Integration Tests
**File:** `backend/src/test/java/com/dental/integration/`

- [ ] Create `JwtSecurityIntegrationTest.java`
  - Test login returns token with tenantId
  - Test accessing protected endpoint without token → 401
  - Test accessing with invalid token → 401
  - Test accessing with valid token → 200

- [ ] Create `MultiTenantIsolationTest.java`
  - Test Clínica ABC user sees only Clínica ABC data
  - Test Dental Care Premium user sees only Dental Care data
  - Test dashboard stats differ by tenant
  - Test patient list differs by tenant

**Estimated Time:** 45 minutes

---

#### TASK-6.3: Manual Testing
**Tests to perform:**

- [ ] Stop backend and frontend
- [ ] Rebuild backend: `.\gradlew.bat build -x test`
- [ ] Start backend: `.\run-backend.ps1 -Run`
- [ ] Start frontend: `npm run dev`
- [ ] Test Clínica ABC:
  - Login with `admin@clinicaabc.com` / `password123`
  - Verify dashboard shows: 3 patients, 3 staff, 3 appointments today
  - Verify patient list shows 3 patients
- [ ] Logout and test Dental Care Premium:
  - Login with `admin@dentalcare.com` / `password123`
  - Verify dashboard shows: 4 patients, 4 staff, 2 appointments today
  - Verify patient list shows 4 patients
- [ ] Test security:
  - Clear localStorage and try accessing dashboard → should redirect to login
  - Use invalid token in Postman → should return 401

**Estimated Time:** 30 minutes

---

### Phase 7: Documentation

#### TASK-7.1: Update project.md
**File:** `openspec/project.md`

- [ ] Update "Known Technical Debt" section
- [ ] Remove "JWT Security Not Enforced" from Critical Issues
- [ ] Add to "Implemented Features":
  - "JWT Security: Full authentication enforcement with tenant context"
  - "Dynamic Multi-Tenancy: Tenant isolation based on JWT claims"
- [ ] Update test credentials section to include both tenants

**Estimated Time:** 10 minutes

---

#### TASK-7.2: Update WORKFLOW.md
**File:** `openspec/WORKFLOW.md`

- [ ] Remove JWT security from Known Issues
- [ ] Add security testing section
- [ ] Document how to test with multiple tenants

**Estimated Time:** 5 minutes

---

#### TASK-7.3: Create Security Spec
**File:** `openspec/specs/security/spec.md`

- [ ] Copy from change folder: `changes/extract-tenant-from-jwt/specs/security/spec.md`
- [ ] Mark all requirements as IMPLEMENTED
- [ ] Add implementation notes

**Estimated Time:** 5 minutes

---

## Task Summary

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| 1. Core Utilities | 2 | 35 min |
| 2. Security Filter | 1 | 45 min |
| 3. Security Config | 1 | 15 min |
| 4. Auth Update | 1 | 10 min |
| 5. Controller Updates | 6 | 80 min |
| 6. Testing | 3 | 105 min |
| 7. Documentation | 3 | 20 min |
| **TOTAL** | **17 tasks** | **310 min (~5 hours)** |

---

## Implementation Order

**Recommended sequence:**

1. ✅ Phase 1: Core Utilities (foundational)
2. ✅ Phase 2: Security Filter (authentication layer)
3. ✅ Phase 4: Auth Update (enable JWT with tenantId)
4. ✅ Phase 5: Controller Updates (use tenant context)
5. ✅ Manual Testing (verify no errors before enabling security)
6. ✅ Phase 3: Security Config (enable enforcement - do this last!)
7. ✅ Phase 6: Testing (comprehensive validation)
8. ✅ Phase 7: Documentation (finalize)

**Why Security Config is second-to-last?**
- Allows testing controllers with TenantContext in "permissive mode"
- Easier to debug issues without 401 errors blocking requests
- Once everything works, flip the security switch

---

## Rollback Commands

If issues arise during implementation:

```bash
# Revert SecurityConfig changes
git checkout backend/src/main/java/com/dental/config/SecurityConfig.java

# Rebuild without tests
cd C:\Users\alex.saenz\Downloads\Projects\Dental2\backend
.\gradlew.bat build -x test

# Restart backend
.\run-backend.ps1 -Run
```

---

## Pre-Implementation Checklist

- [x] All artifacts generated (proposal, spec, design, tasks)
- [x] Backend is currently running without errors
- [x] Frontend is currently running without errors
- [x] Database has test data for both tenants
- [x] Both tenant credentials are documented
- [ ] Ready to begin implementation

---

## Post-Implementation Validation

**Must verify:**
- [ ] No compilation errors
- [ ] Backend starts successfully
- [ ] Login works for both tenants
- [ ] Dashboard shows different data per tenant
- [ ] Patients page shows different data per tenant
- [ ] Accessing without token returns 401
- [ ] Frontend remains functional (JWT interceptor already sends tokens)

---

## Notes

- **Minimal Frontend Changes:** Frontend already sends JWT in Authorization header (api.ts interceptor)
- **Backward Compatibility:** X-Tenant-ID header support can remain for testing/debugging
- **Zero Downtime:** Can deploy to production without frontend changes
- **Database Unchanged:** No schema changes required

---

**Ready to proceed with implementation? Use `/opsx:apply` to begin!**
