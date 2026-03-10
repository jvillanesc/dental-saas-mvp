# Delta Specs: Quick Appointment Status Change

This delta describes changes to the appointment management specifications.

## ADDED Requirements

### Requirement: Quick Status Change from Calendar
**Priority**: MUST  
**Applies to**: Staff users viewing appointment calendar

The system MUST provide a quick status change interface when a staff member clicks on an appointment in the calendar.

#### Scenario: Staff clicks appointment and changes status
- GIVEN a staff member is viewing the appointment calendar
- AND there is at least one appointment displayed
- WHEN the staff member clicks on an appointment
- THEN a status change modal SHALL appear
- AND the modal SHALL display the current appointment details (patient name, dentist name, start time)
- AND the modal SHALL display all available appointment statuses as selectable options
- AND each status SHALL be displayed with its corresponding color badge
- AND the current status SHALL be pre-selected
- AND the modal SHALL have "Aceptar" and "Cancelar" buttons

#### Scenario: Staff selects new status and confirms
- GIVEN the status change modal is open
- WHEN the staff member selects a different status
- AND clicks the "Aceptar" button
- THEN the system SHALL send an update request to the backend
- AND the appointment status SHALL be updated in the database
- AND the modal SHALL close
- AND the calendar SHALL refresh automatically
- AND the appointment SHALL display with the new status color

#### Scenario: Staff cancels status change
- GIVEN the status change modal is open
- WHEN the staff member clicks the "Cancelar" button
- THEN the modal SHALL close
- AND NO changes SHALL be made to the appointment
- AND the calendar SHALL remain unchanged

### Requirement: Status Color Consistency
**Priority**: MUST  
**Applies to**: Status display in modal

The system MUST use consistent color coding for appointment statuses across all interfaces.

#### Scenario: Status colors match calendar legend
- GIVEN the status change modal is displayed
- WHEN showing the list of available statuses
- THEN each status SHALL use the same color as displayed in the calendar legend
- AND the colors SHALL be:
  - SCHEDULED (Programada): blue background (bg-blue-100) with blue text (text-blue-800)
  - CONFIRMED (Confirmada): green background (bg-green-100) with green text (text-green-800)
  - IN_PROGRESS (En Progreso): yellow background (bg-yellow-100) with yellow text (text-yellow-800)
  - COMPLETED (Completada): gray background (bg-gray-100) with gray text (text-gray-800)
  - CANCELLED (Cancelada): red background (bg-red-100) with red text (text-red-800)
  - NO_SHOW (No Asistió): orange background (bg-orange-100) with orange text (text-orange-800)

## MODIFIED Requirements

### Requirement: Appointment Calendar Click Behavior
**Priority**: SHALL  
**Applies to**: Calendar interaction

**Previous behavior**: Clicking an appointment opened the full edit modal with all fields.

**New behavior**: The system SHALL open the quick status change modal when a staff member clicks an appointment in the calendar.

#### Scenario: Appointment click opens status modal (Modified)
- GIVEN a staff member is viewing the calendar
- WHEN the staff member clicks on an appointment
- THEN the quick status change modal SHALL open (not the full edit modal)
- AND the modal SHALL focus on status selection only

## Technical Requirements

### Requirement: Backend Status Update Endpoint
**Priority**: MUST  
**Applies to**: Backend API

The system MUST provide an efficient endpoint for updating only the appointment status.

#### Specification
- **Endpoint**: PATCH `/api/appointments/{id}/status`
- **Request Body**: 
  ```json
  {
    "status": "CONFIRMED"
  }
  ```
- **Response**: Updated Appointment object
- **Status Codes**: 
  - 200: Success
  - 400: Invalid status value
  - 404: Appointment not found
  - 403: Forbidden (tenant mismatch)

#### Scenario: Status update validates tenant context
- GIVEN an authenticated staff member with tenantId=1
- WHEN they attempt to update status of an appointment
- THEN the system MUST verify the appointment belongs to tenantId=1
- AND reject the request if tenant IDs don't match

### Requirement: Frontend Status Modal Component
**Priority**: MUST  
**Applies to**: React components

The system MUST implement a new modal component specifically for status changes.

#### Specification
- **Component**: `AppointmentStatusModal.tsx`
- **Props**:
  - `isOpen: boolean` - Modal visibility
  - `onClose: () => void` - Close handler
  - `appointment: Appointment` - Appointment to update
  - `onStatusChanged: () => void` - Success callback to refresh calendar
- **Dependencies**: 
  - Uses existing `Modal` component
  - Uses existing `Button` component
  - Uses `APPOINTMENT_STATUSES` from types
  - Uses `appointmentService.updateStatus()` method

## Non-Functional Requirements

### Performance
- The status change operation SHOULD complete within 500ms under normal conditions
- The calendar refresh SHOULD be optimistic (show new status immediately, revert on error)

### Usability
- The modal MUST be keyboard accessible
- Status selection MUST be possible via keyboard navigation
- The modal MUST be responsive and work on mobile devices

### Multi-Tenancy
- All status update operations MUST filter by tenantId
- The system MUST prevent cross-tenant status modifications

## Out of Scope

The following are explicitly NOT included in this change:

- Full appointment editing (existing modal remains for this purpose)
- Status transition validation rules (e.g., preventing backward transitions)
- Status change audit history
- Patient notifications on status change
- Batch status updates for multiple appointments
