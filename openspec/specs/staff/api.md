# Staff API Specification

## Purpose

REST API endpoints for staff management.

**Base Path**: `/api/staff`

## Requirements

### Requirement: Staff Retrieval
The system SHALL provide endpoints to retrieve staff data.

#### Scenario: List all staff
- GIVEN an authenticated user
- WHEN GET /api/staff/ is requested
- THEN all staff for the user's tenant are returned
- AND each item includes complete details

#### Scenario: Get single staff by ID
- GIVEN an authenticated user
- WHEN GET /api/staff/{id} is requested
- THEN the specific staff is returned
- AND only if it belongs to the user's tenant

### Requirement: Staff Creation
The system SHALL allow creation of new staff records.

#### Scenario: Create staff
- GIVEN an authenticated user with valid staff data
- WHEN POST /api/staff/ is requested
- THEN a new staff is created for the user's tenant
- AND the created staff is returned with generated ID
- AND timestamps are automatically set

### Requirement: Staff Update
The system SHALL allow modification of existing staff records.

#### Scenario: Update staff
- GIVEN an authenticated user with updated staff data
- WHEN PUT /api/staff/{id} is requested
- THEN the staff is updated
- AND only if it belongs to the user's tenant
- AND updatedAt timestamp is automatically updated

### Requirement: Staff Deletion
The system SHALL allow deletion of staff records.

#### Scenario: Soft delete staff
- GIVEN an authenticated user
- WHEN DELETE /api/staff/{id} is requested
- THEN the staff's deletedAt is set to current timestamp
- AND the staff is excluded from standard queries
- AND only if it belongs to the user's tenant

