# Proposal: Quick Appointment Status Change

**Date**: 2026-03-03  
**Status**: In Progress  
**Type**: Feature Enhancement

## Intent

Enable staff members to quickly change appointment status directly from the calendar view using a simple modal dialog, improving workflow efficiency when managing daily schedules.

## Problem

Currently, when staff need to update an appointment status (e.g., from SCHEDULED to CONFIRMED, or mark as COMPLETED), they must:
1. Click on the appointment in the calendar
2. Open the full edit modal with all fields (patient, dentist, date/time, duration, status, notes)
3. Navigate to the status dropdown
4. Change the status
5. Save the entire form

This is cumbersome for the common task of simply updating appointment status during day-to-day operations.

## Proposed Solution

Create a lightweight status-change modal that appears when clicking an appointment in the calendar:

1. **Modal displays**:
   - Appointment basic info (patient, dentist, time)
   - Vertical list of all available statuses with their distinctive colors
   - Radio button selection for status
   - Accept/Cancel buttons

2. **User interaction**:
   - Click appointment → Status modal opens
   - Select new status (radio button)
   - Click "Aceptar" → Save to database, refresh calendar with new color
   - Click "Cancelar" → Close modal without changes

3. **Visual consistency**:
   - Use the same status colors already displayed in the calendar legend
   - Maintain current color scheme for status badges

## Scope

### In Scope
- New `AppointmentStatusModal` component
- Status update API integration (already exists)
- Calendar refresh after status change
- Visual feedback during save operation

### Out of Scope
- Full appointment editing (keep existing modal for that)
- Status validation rules (e.g., prevent going from COMPLETED back to SCHEDULED)
- Status change history/audit log
- Notifications to patient when status changes

## Technical Approach

1. **Frontend**:
   - Create new `AppointmentStatusModal.tsx` component
   - Add method to `appointmentService.ts` for partial update (PATCH endpoint)
   - Modify `AppointmentsPage.tsx` to open status modal instead of edit modal on appointment click
   - Keep full edit modal accessible via separate action (future enhancement)

2. **Backend**:
   - Add PATCH endpoint `/appointments/{id}/status` to update only status field
   - Validate new status value
   - Return updated appointment

## Success Criteria

- [ ] Staff can change appointment status in 2 clicks (appointment → new status → accept)
- [ ] Calendar updates immediately showing new color
- [ ] Status colors match the legend
- [ ] No regression in existing appointment functionality
- [ ] Works on both desktop and mobile views

## Future Enhancements

- Double-click to open full edit modal
- Context menu with "Change Status" and "Edit Details" options
- Status transition validation (business rules)
- Keyboard shortcuts for common status changes
