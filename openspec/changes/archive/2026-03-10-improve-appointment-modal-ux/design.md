# Design: Improve Appointment Modal UX

**Date**: 2026-03-10  
**Status**: Proposed

## Overview

This design modifies `AppointmentModal.tsx` to conditionally render different UI based on whether the user is creating a new appointment or editing an existing one.

## Architecture Decisions

### AD-1: Conditional Rendering Based on appointment Prop

**Decision**: Use the existing `appointment` prop to determine modal mode.

**Rationale**:
- Already established pattern in the codebase
- `appointment === null` → Create mode
- `appointment !== null` → Edit mode
- No need for additional mode prop

**Implementation**:
```typescript
const isEditMode = appointment !== null;
```

### AD-2: Preserve Existing Form State Management

**Decision**: Keep the current `formData` state structure without modifications.

**Rationale**:
- Existing DTO structure (`CreateAppointmentDTO`) works for both create and update
- No backend changes needed
- Validation logic remains the same
- Only UI rendering changes

### AD-3: Default Status for New Appointments

**Decision**: Hard-code `status: "SCHEDULED"` in initial state for new appointments.

**Rationale**:
- Business requirement: all new appointments start as "SCHEDULED"
- Removes ambiguity and potential user errors
- Simplifies create flow

**Implementation**:
```typescript
// In useEffect when appointment is null
setFormData({
  patientId: '',
  dentistId: '',
  startTime: dateTimeStr,
  durationMinutes: 30,
  status: 'SCHEDULED', // ← Always SCHEDULED for new
  notes: '',
});
```

### AD-4: Radio Button Status Selector

**Decision**: Use radio buttons with colored badges for status selection in edit mode.

**Rationale**:
- Visual consistency with `AppointmentStatusModal` (proven UI pattern)
- Better UX than dropdown for status changes
- Clear visual feedback with colors
- Matches calendar legend

**Component Pattern**:
```tsx
{isEditMode && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-3">
      Seleccione el nuevo estado
    </label>
    <div className="space-y-2">
      {APPOINTMENT_STATUSES.map((status) => (
        <label key={status.value} className="flex items-center p-3 border...">
          <input
            type="radio"
            name="status"
            value={status.value}
            checked={formData.status === status.value}
            onChange={handleChange}
          />
          <span className={`ml-3 ${status.color}`}>
            {status.label}
          </span>
        </label>
      ))}
    </div>
  </div>
)}
```

### AD-5: Deprecate but Don't Delete AppointmentStatusModal

**Decision**: Add deprecation comment but keep file in codebase.

**Rationale**:
- Safe migration path
- May be referenced elsewhere (future discovery)
- Easy to restore if needed
- Can be removed in future major version

## Component Changes

### File: `frontend/src/pages/appointments/AppointmentModal.tsx`

#### Changes Summary:
1. Add `isEditMode` boolean constant
2. Remove `<Select>` for status in create mode
3. Add radio button section for status in edit mode
4. Ensure form submission uses correct status value

#### Detailed Changes:

**1. Add mode detection**
```typescript
const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  initialDateTime,
}) => {
  const isEditMode = appointment !== null; // ← NEW
  // ... rest of component
```

**2. Modify status field rendering (around line 230-240)**

Replace:
```tsx
<Select
  label="Estado"
  name="status"
  value={formData.status}
  onChange={handleChange}
  options={APPOINTMENT_STATUSES.map((s) => ({
    value: s.value,
    label: s.label,
  }))}
  error={errors.status}
  required
/>
```

With:
```tsx
{/* Status field removed - not shown in create mode,
    replaced by radio buttons in edit mode below */}
```

**3. Add radio button section after notes field (before buttons)**

After the `<textarea>` for notes, add:
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

**4. Update validation (optional)**

The `validate()` function can be simplified since status is always set:
- In create mode: always "SCHEDULED"
- In edit mode: always pre-selected from existing appointment

However, keeping the validation as-is provides extra safety.

**5. Form submission remains unchanged**

The `handleSubmit` function already handles both create and update correctly. No changes needed.

### File: `frontend/src/components/appointments/AppointmentStatusModal.tsx`

#### Changes:
Add deprecation notice at the top:
```typescript
/**
 * @deprecated This component is deprecated as of 2026-03-10.
 * Use AppointmentModal in edit mode instead, which now includes
 * status selection functionality.
 * 
 * This file is kept for backward compatibility and may be removed
 * in a future major version.
 */

import React, { useState } from 'react';
// ... rest of file unchanged
```

## UI Layout

### Create Mode Layout:
```
┌─────────────────────────────────────┐
│ Nueva Cita                     [X]  │
├─────────────────────────────────────┤
│ Paciente: [dropdown]                │
│ Dentista: [dropdown]                │
│                                     │
│ Fecha y Hora: [datetime]            │
│ Duración: [number] minutos          │
│                                     │
│ Notas (opcional):                   │
│ [textarea]                          │
│                                     │
│              [Cancelar] [Crear]      │
└─────────────────────────────────────┘
```

### Edit Mode Layout:
```
┌─────────────────────────────────────┐
│ Editar Cita                    [X]  │
├─────────────────────────────────────┤
│ Paciente: [dropdown]                │
│ Dentista: [dropdown]                │
│                                     │
│ Fecha y Hora: [datetime]            │
│ Duración: [number] minutos          │
│                                     │
│ Notas (opcional):                   │
│ [textarea]                          │
│                                     │
│ Seleccione el nuevo estado          │
│ ○ Programada  [blue badge]          │
│ ● Confirmada  [green badge]    ←pre-selected
│ ○ En Progreso [yellow badge]        │
│ ○ Completada  [gray badge]          │
│ ○ Cancelada   [red badge]           │
│ ○ No Asistió  [orange badge]        │
│                                     │
│         [Cancelar] [Actualizar]     │
└─────────────────────────────────────┘
```

## Data Flow

### Create Flow:
```
User clicks empty slot
  → AppointmentCalendar calls onCreateAppointment(dateTime)
  → AppointmentModal opens with appointment=null
  → Modal renders CREATE mode (no status selector)
  → User fills form
  → User clicks "Crear"
  → formData includes status="SCHEDULED"
  → appointmentService.create(formData)
  → onClose(true) triggers calendar refresh
```

### Edit Flow:
```
User clicks existing appointment
  → AppointmentCalendar calls onEditAppointment(appointment)
  → AppointmentModal opens with appointment=<appointment>
  → Modal renders EDIT mode (shows radio buttons)
  → Form pre-filled with appointment data
  → User optionally changes fields and/or status
  → User clicks "Actualizar"
  → appointmentService.update(id, formData)
  → onClose(true) triggers calendar refresh
```

## Testing Strategy

### Manual Testing Checklist:

#### Create Mode:
- [ ] Click empty calendar slot opens modal
- [ ] Modal title is "Nueva Cita"
- [ ] No status selector is visible
- [ ] Date/time is pre-filled with selected slot
- [ ] Can select patient and dentist
- [ ] Can set duration and notes
- [ ] Click "Crear" saves appointment
- [ ] New appointment appears in calendar with blue color (SCHEDULED)
- [ ] Calendar refreshes automatically

#### Edit Mode:
- [ ] Click existing appointment opens modal
- [ ] Modal title is "Editar Cita"
- [ ] All fields pre-filled with current values
- [ ] Radio buttons show all statuses with colors
- [ ] Current status is pre-selected
- [ ] Can change patient, dentist, date/time, duration, notes
- [ ] Can change status by clicking radio button
- [ ] Can update without changing status
- [ ] Click "Actualizar" saves changes
- [ ] Calendar refreshes and shows changes
- [ ] Color changes if status changed

#### Edge Cases:
- [ ] Validation still works (required fields)
- [ ] Loading states work correctly
- [ ] Error messages display properly
- [ ] Cancel button closes without saving
- [ ] Multiple edits in sequence don't cause issues

## Rollback Plan

If issues are discovered:
1. Revert `AppointmentModal.tsx` to previous version
2. Remove deprecation comment from `AppointmentStatusModal.tsx`
3. Existing functionality is fully preserved

## Performance Considerations

- No performance impact expected
- Same number of API calls
- Slightly more DOM elements in edit mode (radio buttons vs dropdown)
- Negligible rendering impact

## Accessibility

- Radio buttons are properly labeled
- Keyboard navigation works
- Color is not the only indicator (text labels present)
- ARIA labels maintained

## Browser Compatibility

- No new browser features used
- Works on all browsers supporting React 18
- Tailwind CSS classes are standard

## Dependencies

No new dependencies required. Uses existing:
- React 18
- Tailwind CSS
- Existing types and services
