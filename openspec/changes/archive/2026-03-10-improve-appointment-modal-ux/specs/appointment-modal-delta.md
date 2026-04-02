# Delta Specs: Appointment Modal UX

## MODIFIED Requirements

### Requirement: Appointment Creation Modal
**Domain**: Appointment Management  
**Priority**: High

The appointment creation modal **SHALL** present a simplified interface when creating new appointments (when `appointment` prop is `null`).

#### Scenario: User creates new appointment from calendar
- **GIVEN** the user clicks an empty slot in the calendar
- **WHEN** the appointment modal opens
- **THEN** the modal title displays "Nueva Cita"
- **AND** the following fields are shown: Paciente, Dentista, Fecha y Hora, Duración, Notas
- **AND** the "Estado" field is NOT visible
- **AND** the date/time field is pre-filled with the selected slot

#### Scenario: User saves new appointment
- **GIVEN** the user fills the new appointment form
- **WHEN** the user clicks "Crear"
- **THEN** the appointment is created with `status: "SCHEDULED"`
- **AND** the modal closes
- **AND** the calendar refreshes to show the new appointment
- **AND** a success message is displayed

---

### Requirement: Appointment Edit Modal
**Domain**: Appointment Management  
**Priority**: High

The appointment edit modal **SHALL** present a comprehensive interface when editing existing appointments (when `appointment` prop is not `null`), allowing modification of all appointment attributes including status.

#### Scenario: User edits existing appointment from calendar
- **GIVEN** the user clicks an existing appointment in the calendar
- **WHEN** the appointment modal opens
- **THEN** the modal title displays "Editar Cita"
- **AND** all current appointment values are pre-filled: Paciente, Dentista, Fecha y Hora, Duración, Notas
- **AND** the "Estado" selector dropdown is NOT shown
- **AND** a new section "Seleccione el nuevo estado" is displayed below the Notas field
- **AND** the status section shows radio buttons for each status option
- **AND** each radio button displays the status label with its corresponding color badge
- **AND** the current appointment status is pre-selected

#### Scenario: User changes only appointment details without changing status
- **GIVEN** an appointment edit modal is open
- **WHEN** the user modifies Paciente, Dentista, Fecha/Hora, Duración, or Notas
- **AND** leaves the status radio button unchanged
- **AND** clicks "Actualizar"
- **THEN** the appointment is updated with the new values
- **AND** the status remains unchanged
- **AND** the modal closes
- **AND** the calendar refreshes
- **AND** a success message is displayed

#### Scenario: User changes appointment status during edit
- **GIVEN** an appointment edit modal is open
- **WHEN** the user selects a different status radio button
- **AND** clicks "Actualizar"
- **THEN** the appointment is updated with the new status
- **AND** the modal closes
- **AND** the calendar refreshes showing the appointment with new status color
- **AND** a success message is displayed

#### Scenario: User changes both details and status
- **GIVEN** an appointment edit modal is open
- **WHEN** the user modifies any appointment fields (Paciente, Dentista, etc.)
- **AND** selects a different status radio button
- **AND** clicks "Actualizar"
- **THEN** all changes including status are saved
- **AND** the modal closes
- **AND** the calendar refreshes
- **AND** a success message is displayed

---

### Requirement: Status Selection UI in Edit Mode
**Domain**: Appointment Management  
**Priority**: High

The status selection in edit mode **SHALL** use radio buttons with visual color indicators matching the existing status color scheme.

#### Technical Details:
- Status section appears after "Notas (opcional)" field
- Section header: "Seleccione el nuevo estado"
- Each status option is a labeled radio button
- Each label includes a colored badge with the status name
- Colors match `APPOINTMENT_STATUSES` definition:
  - SCHEDULED: Blue (bg-blue-100 text-blue-800)
  - CONFIRMED: Green (bg-green-100 text-green-800)
  - IN_PROGRESS: Yellow (bg-yellow-100 text-yellow-800)
  - COMPLETED: Gray (bg-gray-100 text-gray-800)
  - CANCELLED: Red (bg-red-100 text-red-800)
  - NO_SHOW: Orange (bg-orange-100 text-orange-800)
- Layout: Vertical list with hover effects
- Border and padding for each option

#### Scenario: Visual consistency with calendar
- **GIVEN** an appointment edit modal shows status options
- **WHEN** the user views the status radio buttons
- **THEN** each status badge color matches the colors shown in the calendar legend
- **AND** the colors match the appointment colors in the calendar grid

---

## MODIFIED Requirements (Deprecation)

### Requirement: Appointment Status Quick Change Modal
**Domain**: Appointment Management  
**Status**: DEPRECATED  
**Priority**: Low

The standalone `AppointmentStatusModal` component is **DEPRECATED** as of 2026-03-10.

#### Deprecation Notice:
- Component remains in codebase for backward compatibility
- New code SHOULD NOT use this component
- Status changes SHOULD be performed through `AppointmentModal` in edit mode
- Component file includes deprecation comment
- Component MAY be removed in future major version

#### Reason for Deprecation:
The functionality has been integrated into `AppointmentModal` to provide a unified user experience where all appointment attributes (including status) can be modified in a single modal interface.

---

## Implementation Notes

### Multi-Tenancy
- All appointment operations MUST respect tenant context
- Existing tenant filtering is maintained (no changes to backend)

### Security
- JWT authentication remains enforced
- No changes to authorization logic

### Reactive Patterns
- Existing service layer using Mono/Flux remains unchanged
- Only frontend UI components are modified

### Backward Compatibility
- Existing `appointmentService.create()` and `appointmentService.update()` endpoints are unchanged
- Calendar refresh mechanism (passing `true` to `onClose()`) is maintained
- No breaking changes to component props or interfaces
