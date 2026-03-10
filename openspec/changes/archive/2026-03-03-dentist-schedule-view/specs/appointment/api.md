# Delta Specification: Appointment API

## MODIFIED Requirements

### Requirement: Appointment Retrieval
The system SHALL provide endpoints to retrieve appointment data with optional filtering by dentist.

#### Scenario: List all appointments
- GIVEN an authenticated user
- WHEN GET /api/appointments is requested
- THEN all appointments for the user's tenant are returned
- AND each item includes complete details

#### Scenario: List appointments by dentist (NEW)
- GIVEN an authenticated user
- AND a valid dentistId parameter
- WHEN GET /api/appointments?dentistId={uuid} is requested
- THEN only appointments for that dentist are returned
- AND appointments belong to the user's tenant
- AND results are ordered by start_time ascending

#### Scenario: Filter with date range (NEW)
- GIVEN an authenticated user
- AND optional startDate and endDate parameters
- WHEN GET /api/appointments?startDate={date}&endDate={date} is requested
- THEN only appointments within that date range are returned
- AND results respect tenant isolation

#### Scenario: Combined filters (NEW)
- GIVEN an authenticated user
- AND dentistId, startDate, and endDate parameters
- WHEN GET /api/appointments?dentistId={uuid}&startDate={date}&endDate={date} is requested
- THEN only appointments matching ALL filters are returned
- AND results are ordered by start_time ascending

#### Scenario: Invalid dentistId
- GIVEN an authenticated user
- AND an invalid or malformed dentistId
- WHEN GET /api/appointments?dentistId={invalid} is requested
- THEN HTTP 400 Bad Request is returned
- AND an error message explains the issue

#### Scenario: Dentist from another tenant
- GIVEN an authenticated user from tenant A
- AND a dentistId belonging to tenant B
- WHEN GET /api/appointments?dentistId={uuid} is requested
- THEN an empty list is returned (no appointments match)
- OR HTTP 403 Forbidden is returned
- AND tenant isolation is maintained

---

## Implementation Notes

**Query Parameters (all optional):**
- `dentistId` (UUID) - Filter by dentist
- `startDate` (LocalDate or ISO-8601) - Filter start time >= this date
- `endDate` (LocalDate or ISO-8601) - Filter start time <= this date

**Backward Compatibility:**
All parameters are optional. Existing clients calling GET /api/appointments without parameters will continue to work and receive all appointments for their tenant.
