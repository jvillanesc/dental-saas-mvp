# Implementation Tasks: Dentist Schedule View

## Overview
This task list implements per-dentist appointment filtering and calendar view. All changes are additive and backward-compatible.

---

## Phase 1: Backend Implementation

### Task 1.1: Update AppointmentRepository
**File:** `backend/src/main/java/com/dental/clinic/repository/AppointmentRepository.java`

- [ ] Add method signature:
  ```java
  Flux<Appointment> findByTenantAndFilters(
      UUID tenantId, 
      UUID dentistId, 
      LocalDateTime startDate, 
      LocalDateTime endDate
  );
  ```
- [ ] Add @Query annotation with SQL:
  ```sql
  SELECT * FROM appointments 
  WHERE tenant_id = :tenantId
    AND (:dentistId IS NULL OR dentist_id = :dentistId)
    AND (:startDate IS NULL OR start_time >= :startDate)
    AND (:endDate IS NULL OR start_time <= :endDate)
  ORDER BY start_time ASC
  ```
- [ ] Test with null parameters (should return all appointments)
- [ ] Test with dentistId parameter (should filter correctly)

**Acceptance Criteria:**
- Query returns all appointments when filters are null
- Query filters by dentistId when provided
- Query maintains tenant isolation
- Results are ordered by start_time

---

### Task 1.2: Update AppointmentService
**File:** `backend/src/main/java/com/dental/clinic/service/AppointmentService.java`

- [ ] Add method:
  ```java
  public Flux<AppointmentDTO> getAppointments(
      UUID dentistId, 
      LocalDate startDate, 
      LocalDate endDate
  )
  ```
- [ ] Get tenantId from TenantContext
- [ ] Convert LocalDate to LocalDateTime (start of day, end of day)
- [ ] Call repository.findByTenantAndFilters()
- [ ] Map entities to DTOs
- [ ] Add error handling for invalid parameters

**Acceptance Criteria:**
- Service validates input parameters
- Service uses TenantContext for tenant isolation
- Service converts DTOs correctly
- Service handles null parameters gracefully

---

### Task 1.3: Update AppointmentController
**File:** `backend/src/main/java/com/dental/clinic/controller/AppointmentController.java`

- [ ] Modify `getAllAppointments()` method signature:
  ```java
  @GetMapping
  public Flux<AppointmentDTO> getAllAppointments(
      @RequestParam(required = false) UUID dentistId,
      @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate startDate,
      @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate endDate
  )
  ```
- [ ] Call updated service method
- [ ] Add validation for dentistId format
- [ ] Return 400 if parameters are invalid

**Acceptance Criteria:**
- Endpoint accepts query parameters
- Endpoint validates UUID format
- Endpoint returns 400 for invalid input
- Endpoint maintains backward compatibility (works without parameters)

---

### Task 1.4: Update StaffRepository (Optional)
**File:** `backend/src/main/java/com/dental/clinic/repository/StaffRepository.java`

- [ ] Add method if not exists:
  ```java
  @Query("SELECT * FROM staff WHERE tenant_id = :tenantId AND active = :active AND deleted_at IS NULL")
  Flux<Staff> findByTenantAndActive(UUID tenantId, Boolean active);
  ```

**Acceptance Criteria:**
- Query filters by active status
- Query respects soft deletes (deleted_at IS NULL)
- Query maintains tenant isolation

---

### Task 1.5: Update StaffService
**File:** `backend/src/main/java/com/dental/clinic/service/StaffService.java`

- [ ] Add method:
  ```java
  public Flux<StaffDTO> getActiveStaff()
  ```
- [ ] Get tenantId from TenantContext
- [ ] Call repository.findByTenantAndActive(tenantId, true)
- [ ] Map to DTOs

**Acceptance Criteria:**
- Service returns only active staff
- Service respects soft deletes
- Service uses tenant context

---

### Task 1.6: Update StaffController
**File:** `backend/src/main/java/com/dental/clinic/controller/StaffController.java`

- [ ] Modify `getAllStaff()` to accept optional parameters:
  ```java
  @GetMapping
  public Flux<StaffDTO> getAllStaff(
      @RequestParam(required = false) Boolean active
  )
  ```
- [ ] If active=true, call service.getActiveStaff()
- [ ] Otherwise, call existing service.getAllStaff()

**Acceptance Criteria:**
- Endpoint supports active filter
- Endpoint maintains backward compatibility
- Endpoint returns only tenant's staff

---

## Phase 2: Frontend Implementation

### Task 2.1: Create DentistSelector Component
**File:** `frontend/src/components/appointments/DentistSelector.tsx`

- [ ] Create new TypeScript React component
- [ ] Define props interface:
  ```typescript
  interface DentistSelectorProps {
    value: string | null;
    onChange: (dentistId: string | null) => void;
    className?: string;
  }
  ```
- [ ] Fetch staff from API: `GET /api/staff?active=true`
- [ ] Filter for dentists (staff.specialty === 'ODONTÓLOGO' or appropriate role)
- [ ] Render dropdown with:
  - "All Dentists" option (value = null)
  - Each dentist: "Dr. {firstName} {lastName}"
- [ ] Add loading state
- [ ] Add error handling
- [ ] Style with Tailwind (match existing theme)

**Acceptance Criteria:**
- Component fetches dentists on mount
- Component displays loading spinner while fetching
- Component shows error message on failure
- Component triggers onChange when selection changes
- Component includes "All Dentists" option
- Component styling matches existing UI

---

### Task 2.2: Update Appointments Page
**File:** `frontend/src/pages/appointments/Appointments.tsx`

- [ ] Import DentistSelector component
- [ ] Add state:
  ```typescript
  const [selectedDentistId, setSelectedDentistId] = useState<string | null>(null);
  ```
- [ ] Add DentistSelector to UI (above calendar):
  ```tsx
  <DentistSelector 
    value={selectedDentistId}
    onChange={setSelectedDentistId}
  />
  ```
- [ ] Update fetchAppointments() to include dentistId:
  ```typescript
  const params = new URLSearchParams();
  if (selectedDentistId) {
    params.append('dentistId', selectedDentistId);
  }
  const response = await api.get(`/appointments?${params}`);
  ```
- [ ] Add useEffect to refetch when selectedDentistId changes:
  ```typescript
  useEffect(() => {
    fetchAppointments();
  }, [selectedDentistId]);
  ```

**Acceptance Criteria:**
- Page displays dentist selector
- Selecting dentist refetches appointments
- "All Dentists" shows all appointments
- Loading states work correctly
- Error handling displays properly

---

### Task 2.3: Update AppointmentService
**File:** `frontend/src/services/appointmentService.ts`

- [ ] Update `getAppointments()` to accept optional parameters:
  ```typescript
  export const getAppointments = async (filters?: {
    dentistId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Appointment[]>
  ```
- [ ] Build query string from filters
- [ ] Make API call with query parameters

**Acceptance Criteria:**
- Service accepts optional filters
- Service builds correct query string
- Service maintains backward compatibility (works without parameters)

---

### Task 2.4: Update Appointment Types
**File:** `frontend/src/types/appointment.types.ts`

- [ ] Verify Appointment interface includes dentistId:
  ```typescript
  export interface Appointment {
    id: string;
    tenantId: string;
    patientId: string;
    dentistId: string; // Verify this exists
    startTime: string;
    durationMinutes: number;
    status: string;
    notes?: string;
  }
  ```

**Acceptance Criteria:**
- Type definitions match backend DTOs
- All required fields are present

---

### Task 2.5: UI Polish
**Files:** Various component files

- [ ] Add dentist name to appointment cards (if not already shown)
- [ ] Update appointment statistics to reflect filtered data
- [ ] Add visual indicator showing which dentist is selected
- [ ] Ensure responsive design works on mobile
- [ ] Test keyboard navigation

**Acceptance Criteria:**
- UI shows dentist information clearly
- Stats reflect filtered appointments
- Design is responsive
- Accessibility standards met

---

## Phase 3: Testing

### Task 3.1: Backend Tests
**File:** `backend/src/test/java/com/dental/clinic/controller/AppointmentControllerTest.java`

- [ ] Test GET /api/appointments (no filters)
- [ ] Test GET /api/appointments?dentistId={uuid}
- [ ] Test GET /api/appointments?startDate={date}&endDate={date}
- [ ] Test combined filters
- [ ] Test invalid dentistId returns 400
- [ ] Test tenant isolation (dentist from other tenant)

**Acceptance Criteria:**
- All scenarios pass
- Coverage includes edge cases
- Tenant isolation verified

---

### Task 3.2: Frontend Tests
**File:** `frontend/src/components/appointments/DentistSelector.test.tsx`

- [ ] Test component renders
- [ ] Test loading state
- [ ] Test error state
- [ ] Test dentist selection triggers onChange
- [ ] Test "All Dentists" option
- [ ] Mock API responses

**Acceptance Criteria:**
- Component tests pass
- Edge cases covered
- Mocks work correctly

---

### Task 3.3: Integration Tests

- [ ] Start backend and frontend locally
- [ ] Create test dentists in database
- [ ] Create appointments for different dentists
- [ ] Test selecting each dentist
- [ ] Verify calendars filter correctly
- [ ] Test with multiple tenants
- [ ] Test error scenarios

**Acceptance Criteria:**
- End-to-end flow works
- Multi-tenant isolation verified
- No console errors
- Performance acceptable (<2s load time)

---

## Phase 4: Documentation & Deployment

### Task 4.1: Update Documentation

- [ ] Update API documentation with new parameters
- [ ] Add screenshots of dentist selector to docs
- [ ] Document new query parameters in OPENAPI/Swagger
- [ ] Update user guide if exists

**Acceptance Criteria:**
- Documentation is complete
- Examples are clear
- Screenshots are current

---

### Task 4.2: Database Optimization (Optional)

- [ ] Add index on (tenant_id, dentist_id, start_time):
  ```sql
  CREATE INDEX IF NOT EXISTS idx_appointments_dentist_time 
  ON appointments(tenant_id, dentist_id, start_time);
  ```
- [ ] Run EXPLAIN ANALYZE on queries
- [ ] Verify query performance

**Acceptance Criteria:**
- Index improves query performance
- No degradation on other queries

---

### Task 4.3: Deployment

- [ ] Merge changes to main branch
- [ ] Deploy backend to staging
- [ ] Deploy frontend to staging
- [ ] Run smoke tests in staging
- [ ] Deploy to production
- [ ] Monitor for errors

**Acceptance Criteria:**
- Deployment succeeds
- No errors in production logs
- Feature works as expected
- Backward compatibility maintained

---

## Checklist Summary

**Before Implementation:**
- [ ] Review all tasks
- [ ] Estimate time for each phase
- [ ] Set up test data in local database

**During Implementation:**
- [ ] Check off tasks as completed
- [ ] Update design.md if approach changes
- [ ] Add notes for any deviations from plan
- [ ] Test each task before moving to next

**After Implementation:**
- [ ] Verify all acceptance criteria met
- [ ] Run full test suite
- [ ] Update documentation
- [ ] Request code review
- [ ] Archive this change with /opsx:archive

---

## Notes

- All changes are backward-compatible
- No database schema changes required
- Can be implemented incrementally (backend first, then frontend)
- Consider adding date range picker in future enhancement
