# Tasks: Improve Appointment Modal UX

**Status**: Implementation Complete - Ready for Testing  
**Estimated Time**: 2-3 hours

## Pre-Implementation

- [x] **0.1** Review proposal.md, specs, and design.md
- [x] **0.2** Ensure backend is running and responsive
- [x] **0.3** Create backup of `AppointmentModal.tsx` (optional)

## Phase 1: Update AppointmentModal Component

### Task 1.1: Add Mode Detection
**File**: `frontend/src/pages/appointments/AppointmentModal.tsx`  
**Estimated**: 15 min

- [x] Add `isEditMode` constant after component props destructuring
  ```typescript
  const isEditMode = appointment !== null;
  ```
- [x] Verify it compiles without errors

### Task 1.2: Remove Status Dropdown from Grid
**File**: `frontend/src/pages/appointments/AppointmentModal.tsx`  
**Estimated**: 15 min

- [x] Locate the `<Select>` component for "Estado" (around line 230-245)
- [x] Remove the entire `<Select>` component
- [x] Update the grid layout from `grid-cols-3` to `grid-cols-2` for the row containing date, duration (and formerly status)
- [x] Test that create mode looks correct (2 columns: date/time and duration)

### Task 1.3: Add Status Radio Buttons Section
**File**: `frontend/src/pages/appointments/AppointmentModal.tsx`  
**Estimated**: 45 min

- [x] After the `<textarea>` for notes, add conditional rendering for edit mode
- [x] Add new section with label "Seleccione el nuevo estado"
- [x] Add radio button group iterating over `APPOINTMENT_STATUSES`
- [x] Each radio button should:
  - Have unique `id` using status value
  - Use `name="status"` 
  - Be checked when `formData.status === status.value`
  - Call `handleChange` on change
  - Be disabled when `loading` is true
- [x] Each label should include colored badge with status label
- [x] Apply styling: border, padding, hover effects, rounded corners
- [x] Wrap entire section in `{isEditMode && ( ... )}`

**Code Template**:
```tsx
{isEditMode && (
  <div className="mt-4">
    <label className="block text-sm font-medium text-gray-700 mb-3">
      Seleccione el nuevo estado
    </label>
    <div className="space-y-2">
      {APPOINTMENT_STATUSES.map((status) => (
        <label
          key={status.value}
          className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          htmlFor={`status-${status.value}`}
        >
          <input
            id={`status-${status.value}`}
            type="radio"
            name="status"
            value={status.value}
            checked={formData.status === status.value}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            disabled={loading}
          />
          <span className="ml-3">
            <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${status.color}`}>
              {status.label}
            </span>
          </span>
        </label>
      ))}
    </div>
  </div>
)}
```

### Task 1.4: Verify Form Submission Logic
**File**: `frontend/src/pages/appointments/AppointmentModal.tsx`  
**Estimated**: 15 min

- [x] Review `handleSubmit` function - confirm it works for both modes
- [x] Verify that `formData.status` is always set correctly:
  - Create mode: "SCHEDULED" (from initial state)
  - Edit mode: selected radio button value
- [x] Confirm `onClose(true)` is called to trigger calendar refresh
- [x] No changes needed (just verification)

## Phase 2: Deprecate AppointmentStatusModal

### Task 2.1: Add Deprecation Comment
**File**: `frontend/src/components/appointments/AppointmentStatusModal.tsx`  
**Estimated**: 5 min

- [x] Add JSDoc deprecation comment at the top of the file:
  ```typescript
  /**
   * @deprecated This component is deprecated as of 2026-03-10.
   * Use AppointmentModal in edit mode instead, which now includes
   * status selection functionality.
   * 
   * This file is kept for backward compatibility and may be removed
   * in a future major version.
   */
  ```
- [x] Save file (no functional changes)

### Task 2.2: Update AppointmentsPage to Use New Modal
**File**: `frontend/src/pages/appointments/AppointmentsPage.tsx`  
**Estimated**: 15 min

- [x] Remove import of `AppointmentStatusModal`
- [x] Remove state variables: `isStatusModalOpen`, `appointmentForStatusChange`
- [x] Update `handleEditAppointment` to use `AppointmentModal` instead
- [x] Remove `handleCloseStatusModal` and `handleStatusChanged` functions
- [x] Remove conditional render of `AppointmentStatusModal` from JSX
- [x] Verify no TypeScript errors

## Phase 3: Testing

### Task 3.1: Test Create Mode
**Estimated**: 20 min

- [ ] Open application in browser
- [ ] Navigate to appointment calendar
- [ ] Click an empty time slot
- [ ] Verify modal opens with title "Nueva Cita"
- [ ] Verify status selector is NOT visible
- [ ] Verify fields shown: Paciente, Dentista, Fecha y Hora, Duración, Notas
- [ ] Verify date/time is pre-filled with selected slot
- [ ] Fill all required fields
- [ ] Click "Crear"
- [ ] Verify appointment is created
- [ ] Verify appointment appears in calendar with blue color (SCHEDULED status)
- [ ] Verify calendar refreshes automatically

### Task 3.2: Test Edit Mode - Status Change
**Estimated**: 20 min

- [ ] Click on an existing appointment in calendar
- [ ] Verify modal opens with title "Editar Cita"
- [ ] Verify all fields are pre-filled with current values
- [ ] Verify "Seleccione el nuevo estado" section is visible
- [ ] Verify radio buttons show all 6 statuses with colors
- [ ] Verify current status is pre-selected
- [ ] Select a different status (e.g., CONFIRMED)
- [ ] Click "Actualizar"
- [ ] Verify appointment updates
- [ ] Verify appointment color changes in calendar
- [ ] Verify calendar refreshes

### Task 3.3: Test Edit Mode - Field Changes Only
**Estimated**: 15 min

- [ ] Click on an existing appointment
- [ ] Change dentist or duration (not status)
- [ ] Leave status radio button unchanged
- [ ] Click "Actualizar"
- [ ] Verify changes are saved
- [ ] Verify status remains unchanged
- [ ] Verify calendar refreshes

### Task 3.4: Test Edit Mode - Multiple Changes
**Estimated**: 15 min

- [ ] Click on an existing appointment
- [ ] Change patient, dentist, duration, and notes
- [ ] Change status to different value
- [ ] Click "Actualizar"
- [ ] Verify all changes are saved
- [ ] Verify calendar reflects all changes

### Task 3.5: Test Validation
**Estimated**: 15 min

- [ ] Test create mode with empty required fields
- [ ] Verify validation errors appear
- [ ] Test edit mode with invalid data
- [ ] Verify validation works correctly
- [ ] Test duration < 15 minutes
- [ ] Verify error message

### Task 3.6: Test Cancel Behavior
**Estimated**: 10 min

- [ ] Open modal in create mode
- [ ] Fill some fields
- [ ] Click "Cancelar"
- [ ] Verify modal closes without saving
- [ ] Verify calendar doesn't refresh
- [ ] Repeat for edit mode

### Task 3.7: Test Edge Cases
**Estimated**: 15 min

- [ ] Create appointment with maximum duration
- [ ] Create appointment with long notes
- [ ] Edit appointment and click Cancel (no refresh)
- [ ] Edit appointment multiple times in sequence
- [ ] Create appointment, then immediately edit it
- [ ] Verify no console errors throughout

## Phase 4: Build & Verification

### Task 4.1: Build Backend (if needed)
**Estimated**: 10 min

- [ ] Navigate to backend directory
- [ ] Run: 
  ```powershell
  $env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot"
  $env:PATH="$env:JAVA_HOME\bin;$env:PATH"
  .\gradlew --stop
  .\gradlew clean compileJava --no-daemon
  ```
- [ ] Verify build succeeds
- [ ] Start backend if not already running

### Task 4.2: Build Frontend
**Estimated**: 10 min

- [ ] Navigate to frontend directory
- [ ] Run: `npm run build` (optional, for production build verification)
- [ ] Verify build succeeds with no TypeScript errors
- [ ] Verify dev server is running (`npm run dev`)

## Phase 5: Documentation

### Task 5.1: Update Session Notes
**Estimated**: 10 min

- [ ] Document any issues encountered
- [ ] Document any deviations from design
- [ ] Note any unexpected behaviors

## Completion Checklist

Before marking as complete:

- [ ] All create mode tests pass
- [ ] All edit mode tests pass
- [ ] Validation works correctly
- [ ] Calendar refresh works after save
- [ ] No console errors
- [ ] No TypeScript compilation errors
- [ ] AppointmentStatusModal is marked as deprecated
- [ ] Code is clean and follows project conventions
- [ ] Ready for `/opsx:archive`

## Rollback Procedure

If critical issues are found:

1. Restore `AppointmentModal.tsx` from backup or git
2. Remove deprecation comment from `AppointmentStatusModal.tsx`
3. Test that original functionality is restored

## Notes

- The backend requires no changes - all endpoints remain the same
- The `appointmentService.update()` method already handles full appointment updates
- The design maintains backward compatibility
- Calendar refresh mechanism (`onClose(true)`) is already implemented
