# Appointment API Specification

## Purpose

REST API endpoints for appointment management.

**Base Path**: `/api/appointments`

## Requirements

### Requirement: Appointment Retrieval
The system SHALL provide endpoints to retrieve appointment data.

#### Scenario: List all appointment
- GIVEN an authenticated user
- WHEN GET /api/appointments/ is requested
- THEN all appointment for the user's tenant are returned
- AND each item includes complete details

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

