# Appointment API Specification

## Purpose

REST API endpoints for appointment management.

**Base Path**: `/api/appointments`

## Requirements

### Requirement: Appointment Retrieval
The system SHALL provide endpoints to retrieve appointment data with optional filtering by dentist.

#### Scenario: List all appointment
- GIVEN an authenticated user
- WHEN GET /api/appointments/ is requested
- THEN all appointment for the user's tenant are returned
- AND each item includes complete details

#### Scenario: List appointments by dentist
- GIVEN an authenticated user
- AND a valid dentistId parameter
- WHEN GET /api/appointments?dentistId={uuid} is requested
- THEN only appointments for that dentist are returned
- AND appointments belong to the user's tenant
- AND results are ordered by start_time ascending

#### Scenario: Filter with date range
- GIVEN an authenticated user
- AND optional startDate and endDate parameters
- WHEN GET /api/appointments?startDate={date}&endDate={date} is requested
- THEN only appointments within that date range are returned
- AND results respect tenant isolation

#### Scenario: Combined filters
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
- AND tenant isolation is maintained

#### Scenario: Get single appointment by ID
- GIVEN an authenticated user
- WHEN GET /api/appointments/{id} is requested
- THEN the specific appointment is returned
- AND only if it belongs to the user's tenant

### Requirement: Appointment Creation
The system SHALL allow creation of new appointment records.

#### Scenario: Create appointment
- GIVEN an authenticated user with valid appointment data
- WHEN POST /api/appointments/ is requested
- THEN a new appointment is created for the user's tenant
- AND the created appointment is returned with generated ID
- AND timestamps are automatically set

### Requirement: Appointment Update
The system SHALL allow modification of existing appointment records.

#### Scenario: Update appointment
- GIVEN an authenticated user with updated appointment data
- WHEN PUT /api/appointments/{id} is requested
- THEN the appointment is updated
- AND only if it belongs to the user's tenant
- AND updatedAt timestamp is automatically updated

### Requirement: Appointment Deletion
The system SHALL allow deletion of appointment records.

#### Scenario: Delete appointment
- GIVEN an authenticated user
- WHEN DELETE /api/appointments/{id} is requested
- THEN the appointment is permanently removed
- AND only if it belongs to the user's tenant

