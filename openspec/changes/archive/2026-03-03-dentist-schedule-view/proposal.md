# Proposal: Per-Dentist Schedule View

## Intent

Enable clinic staff to view appointments organized by individual dentist schedules, allowing better resource management and appointment planning.

## Problem Statement

Currently, the appointments page shows all appointments in a single unified view. This makes it difficult to:
- See which dentist is available at specific times
- Manage schedules for individual dentists
- Identify scheduling conflicts per dentist
- Plan new appointments based on dentist availability

The system has a `dentistId` field in appointments but lacks a UI to filter and visualize appointments by dentist.

## Proposed Solution

Add a dentist-selector component to the appointments page that:
1. Lists all active dentists for the current tenant
2. Allows selecting a specific dentist
3. Filters the appointment calendar to show only that dentist's appointments
4. Displays dentist-specific information (name, specialty)

### Scope

**In Scope:**
- Backend endpoint to filter appointments by dentistId
- Dentist selector dropdown in appointments UI
- Calendar view filtered by selected dentist
- Multi-dentist support (ability to switch between dentists)

**Out of Scope (Future Work):**
- Dentist availability/working hours configuration
- Multi-calendar view (showing multiple dentists simultaneously)
- Appointment conflict detection
- Automated scheduling suggestions

## Approach

### Backend Changes
1. Add query parameter `dentistId` to GET `/api/appointments` endpoint
2. Modify repository to support filtering by dentistId
3. Ensure tenant isolation is maintained

### Frontend Changes
1. Create `DentistSelector` component
2. Fetch active dentists (staff with DENTIST role)
3. Add dentist filter state to appointments page
4. Filter appointments display based on selected dentist

### Database Impact
**No schema changes required** - `appointments.dentist_id` already exists

## Benefits

- **Better Resource Visibility**: Clinic staff can easily see each dentist's schedule
- **Improved Planning**: Easier to schedule appointments with specific dentists
- **Reduced Conflicts**: Clear view of each dentist's availability
- **User Experience**: Matches common clinic management workflow (referencing attached UI)

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Performance with large appointment datasets | Use pagination and date range filtering |
| Dentist list becomes too long | Add search/filter capability (future) |
| Missing dentistId on legacy appointments | Show "Unassigned" group for null dentistId |

## Success Criteria

- ✅ User can select a dentist from dropdown
- ✅ Calendar displays only selected dentist's appointments
- ✅ Appointment counts update based on selected dentist
- ✅ Multi-tenant isolation maintained
- ✅ No hardcoded data (all loaded from API)
