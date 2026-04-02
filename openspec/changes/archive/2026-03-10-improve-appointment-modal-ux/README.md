# Improve Appointment Modal UX

**Created**: 2026-03-10  
**Status**: Implementation Complete - Ready for Testing

## Overview

Mejora de la experiencia de usuario en el modal de citas para diferenciar claramente entre crear nueva cita y editar cita existente:

- **Nueva cita**: Ocultar selector de estado, guardar por defecto como "SCHEDULED"
- **Editar cita**: Mostrar todos los campos editables + sección visual de radio buttons con colores para seleccionar estado

## Implementation Summary

### ✅ Completed Changes

1. **AppointmentModal.tsx**:
   - Added `isEditMode` detection based on `appointment` prop
   - Removed dropdown status selector (changed grid from 3 to 2 columns)
   - Added status radio buttons section with colored badges (only shown in edit mode)
   - Status section displays after "Notas" field with all 6 status options
   - Current status is pre-selected in edit mode
   - Form submission logic maintained (works for both create and update)

2. **AppointmentStatusModal.tsx**:
   - Added deprecation JSDoc comment
   - Component kept for backward compatibility

3. **AppointmentsPage.tsx** (Critical Fix):
   - Removed usage of deprecated `AppointmentStatusModal`
   - Updated `handleEditAppointment` to use `AppointmentModal` in edit mode
   - Clicking existing appointment now opens new modal with all edit capabilities
   - Removed obsolete state variables and handlers

### Next Steps

Testing phase (manual verification required):
- [ ] Test create mode (verify status field is hidden)
- [ ] Test edit mode (verify all fields editable + status radio buttons)
- [ ] Test calendar refresh after save
- [ ] Test validation
- [ ] Verify no console errors

See [tasks.md](tasks.md) for detailed testing checklist.

## Files

- `proposal.md` - Propuesta y justificación
- `specs/` - Especificaciones delta
- `design.md` - Diseño técnico
- `tasks.md` - Tareas de implementación
