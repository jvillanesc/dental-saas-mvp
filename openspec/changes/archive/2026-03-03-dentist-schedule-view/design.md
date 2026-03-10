# Design: Per-Dentist Schedule View

## Architecture Overview

This feature adds filtering capability to the existing appointment system without modifying the data model.

```
┌─────────────────────────────────────────────┐
│           Frontend (React)                  │
│                                             │
│  ┌──────────────────────────────────┐      │
│  │  Appointments Page               │      │
│  │  ┌────────────────────────┐     │      │
│  │  │ DentistSelector        │     │      │
│  │  │ - Load dentists        │     │      │
│  │  │ - onChange: setFilter  │     │      │
│  │  └────────────────────────┘     │      │
│  │                                  │      │
│  │  ┌────────────────────────┐     │      │
│  │  │ AppointmentCalendar    │     │      │
│  │  │ - Filtered by dentist  │     │      │
│  │  └────────────────────────┘     │      │
│  └──────────────────────────────────┘      │
└─────────────────────────────────────────────┘
                    ↓ HTTP
┌─────────────────────────────────────────────┐
│       Backend (Spring WebFlux)              │
│                                             │
│  GET /api/appointments?dentistId={uuid}    │
│  GET /api/staff?role=DENTIST&active=true   │
│                                             │
│  ┌──────────────────────────────────┐      │
│  │ AppointmentController            │      │
│  │ - Add @RequestParam dentistId    │      │
│  └──────────────────────────────────┘      │
│             ↓                               │
│  ┌──────────────────────────────────┐      │
│  │ AppointmentService               │      │
│  │ - Pass dentistId to repository   │      │
│  └──────────────────────────────────┘      │
│             ↓                               │
│  ┌──────────────────────────────────┐      │
│  │ AppointmentRepository            │      │
│  │ - Add conditional WHERE clause   │      │
│  └──────────────────────────────────┘      │
└─────────────────────────────────────────────┘
                    ↓ SQL
┌─────────────────────────────────────────────┐
│         PostgreSQL Database                 │
│                                             │
│  SELECT * FROM appointments                 │
│  WHERE tenant_id = ?                        │
│    AND (dentist_id = ? OR ? IS NULL)       │
│  ORDER BY start_time                        │
└─────────────────────────────────────────────┘
```

## Technical Decisions

### 1. Backend API Design

**Endpoint Modification:**
```
GET /api/appointments?dentistId={uuid}&startDate={date}&endDate={date}
```

**Query Strategy:**
- Optional `dentistId` parameter (nullable)
- If `dentistId` is provided: filter by that dentist
- If `dentistId` is null: return all appointments (current behavior)
- Always filter by tenantId (existing behavior)

**Implementation:**
```java
// AppointmentController.java
@GetMapping
public Flux<AppointmentDTO> getAllAppointments(
    @RequestParam(required = false) UUID dentistId,
    @RequestParam(required = false) LocalDate startDate,
    @RequestParam(required = false) LocalDate endDate
) {
    return appointmentService.getAppointments(dentistId, startDate, endDate);
}

// AppointmentRepository.java
@Query("""
    SELECT * FROM appointments 
    WHERE tenant_id = :tenantId
      AND (:dentistId IS NULL OR dentist_id = :dentistId)
      AND (:startDate IS NULL OR start_time >= :startDate)
      AND (:endDate IS NULL OR start_time <= :endDate)
    ORDER BY start_time ASC
    """)
Flux<Appointment> findByTenantAndFilters(
    UUID tenantId, 
    UUID dentistId, 
    LocalDateTime startDate, 
    LocalDateTime endDate
);
```

### 2. Frontend State Management

**Component Hierarchy:**
```tsx
<AppointmentsPage>
  <DentistSelector 
    dentists={dentists}
    selectedDentistId={selectedDentistId}
    onChange={setSelectedDentistId}
  />
  <AppointmentCalendar 
    appointments={filteredAppointments}
    isLoading={isLoading}
  />
  <AppointmentStats 
    appointments={filteredAppointments}
  />
</AppointmentsPage>
```

**State Variables:**
```typescript
const [selectedDentistId, setSelectedDentistId] = useState<string | null>(null);
const [dentists, setDentists] = useState<Staff[]>([]);
const [appointments, setAppointments] = useState<Appointment[]>([]);
```

**Data Flow:**
1. Load all active dentists on mount
2. User selects dentist → `setSelectedDentistId()`
3. `useEffect` watches `selectedDentistId` → refetch appointments
4. Calendar rerenders with filtered data

### 3. Dentist Data Source

**Option A: Use Staff API with role filter** (Recommended ✅)
- Endpoint: `GET /api/staff?active=true`
- Filter client-side: `staff.specialty === 'ODONTÓLOGO'` or role-based
- Pros: Uses existing data model, no duplication
- Cons: Need to identify dentists vs other staff

**Option B: Use separate Dentist API**
- Endpoint: `GET /api/dentists` (already exists)
- Pros: Cleaner separation
- Cons: May be duplicate of staff data

**Decision: Use Option A** - Staff API with specialty/role filter

### 4. UI Component Details

**DentistSelector Component:**
```tsx
interface DentistSelectorProps {
  dentists: Staff[];
  selectedDentistId: string | null;
  onChange: (dentistId: string | null) => void;
}

// Features:
// - Dropdown with dentist names
// - "All Dentists" option (dentistId = null)
// - Shows specialty badge
// - Avatar/initials icon
```

**Styling:**
- Follow existing Tailwind theme
- Consistent with other dropdowns
- Loading state while fetching dentists
- Empty state if no dentists found

### 5. Database Considerations

**No Schema Changes Required:**
- `appointments.dentist_id` already exists (UUID, nullable)
- `staff.specialty` can identify dentists
- All queries use tenant_id for isolation

**Index Optimization (Optional for future):**
```sql
CREATE INDEX idx_appointments_dentist_time 
ON appointments(tenant_id, dentist_id, start_time);
```

### 6. Error Handling

**Backend:**
- Invalid dentistId: Return 400 Bad Request
- Dentist not in tenant: Return 403 Forbidden or filter out
- Database errors: Return 500 with error message

**Frontend:**
- Failed dentist load: Show error toast, disable selector
- Failed appointment load: Show error message, retry button
- Network timeout: Show loading spinner, timeout after 30s

## Component Specifications

### DentistSelector Component

**File:** `frontend/src/components/appointments/DentistSelector.tsx`

**Props:**
```typescript
interface DentistSelectorProps {
  value: string | null;
  onChange: (dentistId: string | null) => void;
  className?: string;
}
```

**Features:**
- Fetches dentists from `/api/staff?active=true`
- Filters for specialty = 'ODONTÓLOGO' (or DENTIST role)
- Displays dropdown with:
  - "All Dentists" option (value = null)
  - Each dentist: "Dr. {firstName} {lastName} - {specialty}"
- Loading state
- Error handling

### AppointmentsPage Updates

**File:** `frontend/src/pages/appointments/Appointments.tsx`

**Changes:**
1. Add `selectedDentistId` state
2. Add `DentistSelector` component above calendar
3. Modify `fetchAppointments()` to include `dentistId` param
4. Update appointment stats to reflect filtered data

## Testing Strategy

### Backend Tests
- [ ] Test appointments filtered by dentistId
- [ ] Test appointments without dentistId filter (all appointments)
- [ ] Test tenant isolation with dentistId filter
- [ ] Test invalid dentistId (non-existent UUID)
- [ ] Test date range filtering combined with dentistId

### Frontend Tests
- [ ] DentistSelector renders dentist list
- [ ] Selecting dentist triggers appointment reload
- [ ] "All Dentists" option shows all appointments
- [ ] Loading states display correctly
- [ ] Error states display correctly

### Integration Tests
- [ ] End-to-end: Select dentist → See filtered appointments
- [ ] Multi-tenant: Dentist from Tenant A not visible to Tenant B
- [ ] Performance: Large appointment dataset loads in <2s

## Performance Considerations

**Query Optimization:**
- Add `dentist_id` to existing indexes
- Use EXPLAIN ANALYZE to verify query plan
- Consider pagination for large datasets

**Frontend Optimization:**
- Memoize dentist list (rarely changes)
- Debounce filter changes (if adding search)
- Use React.memo for calendar components

## Migration Path

**No data migration required** - feature is additive.

**Deployment Steps:**
1. Deploy backend changes (backward compatible)
2. Deploy frontend changes
3. Verify in staging environment
4. Deploy to production

## Future Enhancements

1. **Working Hours Configuration**
   - Add `dentist_schedules` table
   - Define available hours per day
   - Show unavailable time slots in gray

2. **Multi-Calendar View**
   - Side-by-side dentist schedules
   - Drag-and-drop between dentists
   - Visual conflict detection

3. **Statistics per Dentist**
   - Appointments per dentist
   - Average appointment duration
   - Utilization rate

4. **Smart Scheduling**
   - Suggest next available slot per dentist
   - Auto-assign dentist based on specialty
   - Conflict warnings
