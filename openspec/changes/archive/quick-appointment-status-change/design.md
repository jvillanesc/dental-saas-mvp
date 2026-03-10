# Design: Quick Appointment Status Change

**Date**: 2026-03-03  
**Status**: Ready for Implementation

## Architecture Overview

This feature adds a lightweight status-change flow to the existing appointment management system without disrupting current functionality.

```
┌─────────────────────────────────────────────────────────────┐
│                    AppointmentsPage.tsx                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         AppointmentCalendar.tsx                     │   │
│  │  ┌────────────────────────────────────────────┐    │   │
│  │  │  Appointment Card (click handler)          │    │   │
│  │  │  onClick → onEditAppointment(appointment)  │    │   │
│  │  └────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │    AppointmentStatusModal.tsx (NEW)                 │   │
│  │  - Display appointment info                         │   │
│  │  - Show status options with colors                  │   │
│  │  - Handle selection & submission                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          ▼                                   │
│         appointmentService.updateStatus() (NEW)             │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼ PATCH /api/appointments/{id}/status
┌─────────────────────────────────────────────────────────────┐
│              AppointmentController.java                      │
│  updateAppointmentStatus() (NEW)                            │
│  - Extract tenantId from context                            │
│  - Validate status value                                     │
│  - Update via service                                        │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│            AppointmentService.java                          │
│  updateStatus() (NEW)                                       │
│  - Verify appointment exists for tenant                     │
│  - Update status field only                                 │
│  - Return updated entity                                     │
└─────────────────────────────────────────────────────────────┘
```

## Component Design

### 1. AppointmentStatusModal Component

**Location**: `frontend/src/components/appointments/AppointmentStatusModal.tsx`

**Rationale**: Create as a separate component in the appointments folder for reusability and maintainability.

#### Props Interface
```typescript
interface AppointmentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  onStatusChanged: () => void;
}
```

#### State Management
```typescript
const [selectedStatus, setSelectedStatus] = useState<string>(appointment.status);
const [loading, setLoading] = useState(false);
```

#### UI Structure
```
┌─────────────────────────────────────────────┐
│ Cambiar Estado de Cita                     │
├─────────────────────────────────────────────┤
│                                             │
│ Paciente: [Juan Pérez]                     │
│ Dentista: [Dr. García]                     │
│ Hora: [10:00 AM - 30 min]                  │
│                                             │
│ Seleccione el nuevo estado:                │
│                                             │
│ ○ Programada     [blue badge]              │
│ ● Confirmada     [green badge] ← selected  │
│ ○ En Progreso    [yellow badge]            │
│ ○ Completada     [gray badge]              │
│ ○ Cancelada      [red badge]               │
│ ○ No Asistió     [orange badge]            │
│                                             │
│         [Cancelar]  [Aceptar]              │
└─────────────────────────────────────────────┘
```

#### Key Implementation Details
- Use radio buttons (`<input type="radio">`) for single selection
- Display each status as a label with colored badge using `APPOINTMENT_STATUSES`
- Disable "Aceptar" button while loading
- Show loading state with spinner on button

### 2. Backend API Endpoint

**Location**: `backend/src/main/java/com/dentalapp/controller/AppointmentController.java`

#### New Method
```java
@PatchMapping("/{id}/status")
public Mono<ResponseEntity<AppointmentDTO>> updateAppointmentStatus(
    @PathVariable String id,
    @RequestBody UpdateStatusRequest request
) {
    String tenantId = TenantContext.getTenantId();
    
    return appointmentService.updateStatus(id, request.getStatus(), tenantId)
        .map(appointment -> appointmentMapper.toDTO(appointment))
        .map(ResponseEntity::ok)
        .defaultIfEmpty(ResponseEntity.notFound().build());
}
```

#### Request DTO
**Location**: `backend/src/main/java/com/dentalapp/dto/UpdateStatusRequest.java`

```java
public class UpdateStatusRequest {
    @NotBlank(message = "Status is required")
    @Pattern(
        regexp = "SCHEDULED|CONFIRMED|IN_PROGRESS|COMPLETED|CANCELLED|NO_SHOW",
        message = "Invalid status value"
    )
    private String status;
    
    // getters/setters
}
```

### 3. Service Layer

**Location**: `backend/src/main/java/com/dentalapp/service/AppointmentService.java`

#### New Method
```java
public Mono<Appointment> updateStatus(String id, String newStatus, String tenantId) {
    return appointmentRepository
        .findByIdAndTenantId(id, tenantId)
        .switchIfEmpty(Mono.error(new ResourceNotFoundException("Appointment not found")))
        .flatMap(appointment -> {
            appointment.setStatus(newStatus);
            appointment.setUpdatedAt(LocalDateTime.now());
            return appointmentRepository.save(appointment);
        });
}
```

**Rationale**: 
- Use specific method instead of full update to:
  - Improve performance (only update status field)
  - Avoid validation of unchanged fields
  - Make intent explicit in code
  - Simplify frontend logic

### 4. Frontend Service

**Location**: `frontend/src/services/appointmentService.ts`

#### New Method
```typescript
updateStatus: async (id: string, status: string): Promise<Appointment> => {
  const response = await api.patch(`/appointments/${id}/status`, { status });
  return response.data;
}
```

## Data Flow

### Happy Path: Status Change Success

```
1. User clicks appointment
   ↓
2. AppointmentsPage opens AppointmentStatusModal
   ↓
3. User selects new status (radio button)
   ↓
4. User clicks "Aceptar"
   ↓
5. Modal calls appointmentService.updateStatus()
   ↓
6. Frontend sends PATCH /api/appointments/{id}/status
   ↓
7. Backend validates tenantId and status value
   ↓
8. Backend updates appointment.status in database
   ↓
9. Backend returns updated appointment
   ↓
10. Frontend closes modal
   ↓
11. Frontend calls onStatusChanged() callback
   ↓
12. AppointmentsPage refreshes appointment list
   ↓
13. Calendar re-renders with new color
```

### Error Handling

#### Case 1: Network Error
- Show error message: "Error de conexión. Por favor intente nuevamente."
- Keep modal open
- Allow retry

#### Case 2: Validation Error (400)
- Show error message from backend
- Keep modal open

#### Case 3: Not Found (404)
- Show: "La cita no existe o fue eliminada."
- Close modal
- Refresh calendar

#### Case 4: Forbidden (403)
- Show: "No tiene permisos para modificar esta cita."
- Close modal

## UI/UX Decisions

### Color Palette (Existing)
Using Tailwind CSS utility classes already defined:

| Status | Background | Text | Preview |
|--------|-----------|------|---------|
| Programada | bg-blue-100 | text-blue-800 | 🟦 |
| Confirmada | bg-green-100 | text-green-800 | 🟩 |
| En Progreso | bg-yellow-100 | text-yellow-800 | 🟨 |
| Completada | bg-gray-100 | text-gray-800 | ⬜ |
| Cancelada | bg-red-100 | text-red-800 | 🟥 |
| No Asistió | bg-orange-100 | text-orange-800 | 🟧 |

### Responsive Design
- **Desktop**: Modal centered, 500px width
- **Mobile**: Modal full width with padding
- Radio buttons with adequate touch targets (min 44px height)

### Accessibility
- Proper labels for radio inputs
- Keyboard navigation support (Tab, Space, Enter, Escape)
- ARIA labels for screen readers
- Focus management (focus first radio on open)

## Security Considerations

### Multi-Tenancy
- **CRITICAL**: Backend MUST validate `tenantId` from `TenantContext`
- All queries MUST include `AND tenant_id = ?` clause
- Prevent cross-tenant data access

### Input Validation
- Status value validated against enum in backend
- Prevent SQL injection (parameterized queries via R2DBC)
- No additional sanitization needed (status is enum)

## Performance Considerations

### Optimizations
1. **Partial Update**: Only update status field, not entire entity
2. **Optimistic UI**: Could update calendar immediately, revert on error (optional)
3. **Avoid N+1**: Single query for status update

### Expected Performance
- Update operation: ~50-100ms
- Network latency: ~100-200ms
- Total user-perceived time: ~200-300ms

## Testing Strategy

### Frontend Tests
1. **Unit Tests**:
   - Modal renders with correct initial status selected
   - Status selection changes selected value
   - Cancel button closes without API call
   - Accept button calls service with correct params

2. **Integration Tests**:
   - API service method called with correct endpoint
   - Error handling displays appropriate messages

### Backend Tests
1. **Unit Tests**:
   - Service updates only status field
   - Validates tenant context
   - Returns updated appointment

2. **Integration Tests**:
   - PATCH endpoint returns 200 with valid data
   - Returns 404 for non-existent appointment
   - Returns 403 for wrong tenant
   - Returns 400 for invalid status

## Migration Strategy

### Deployment Steps
1. ✅ Deploy backend changes first (new endpoint won't be used yet)
2. ✅ Deploy frontend changes
3. ✅ Test in production
4. ✅ Monitor for errors

### Rollback Plan
If issues arise:
1. Revert frontend to show old edit modal
2. Backend endpoint remains (no harm, just unused)

### Future Enhancements Path
- Keep full edit modal for comprehensive edits
- Add context menu to appointment card:
  - "Cambiar Estado" (quick)
  - "Editar Detalles" (full modal)
- Add keyboard shortcuts (e.g., Ctrl+1-6 for statuses)

## Open Questions & Decisions

### Q1: Should we validate status transitions?
**Decision**: NO - Not in this iteration. Any status can transition to any other status. Business rules can be added later if needed.

### Q2: Should we show confirmation for certain statuses (e.g., CANCELLED)?
**Decision**: NO - The modal itself serves as confirmation. User must actively select and click "Aceptar".

### Q3: Should we preserve the full edit modal?
**Decision**: YES - Keep existing modal, but don't expose in this iteration. Will add multi-action UI in future enhancement.

### Q4: Optimistic UI update?
**Decision**: NO - Wait for server confirmation. More reliable, avoids confusing state if error occurs.

## Dependencies

### Existing Code (No Changes Needed)
- ✅ `Modal` component
- ✅ `Button` component  
- ✅ `APPOINTMENT_STATUSES` definition
- ✅ `TenantContext` for multi-tenancy
- ✅ R2DBC repository infrastructure

### New Files to Create
- `frontend/src/components/appointments/AppointmentStatusModal.tsx`
- `backend/src/main/java/com/dentalapp/dto/UpdateStatusRequest.java`

### Files to Modify
- `frontend/src/services/appointmentService.ts` - Add `updateStatus()` method
- `frontend/src/pages/appointments/AppointmentsPage.tsx` - Add state and handler for new modal
- `backend/src/main/java/com/dentalapp/controller/AppointmentController.java` - Add PATCH endpoint
- `backend/src/main/java/com/dentalapp/service/AppointmentService.java` - Add `updateStatus()` method

## Metrics for Success

Post-deployment, we should see:
- ✅ Reduced time to change appointment status (target: <5 seconds vs ~15 seconds before)
- ✅ No increase in error rates
- ✅ No cross-tenant data leaks (security audit)
- ✅ Positive user feedback from staff

---

**Ready for Implementation**: All technical decisions documented. Proceed to tasks.md.
