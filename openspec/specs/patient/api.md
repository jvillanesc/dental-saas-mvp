# Patient API Specification

## Purpose

REST API endpoints for patient management.

**Base Path**: `/api/patients`

## Requirements

### Requirement: Patient Retrieval
The system SHALL provide endpoints to retrieve patient data.

#### Scenario: List all patient
- GIVEN an authenticated user
- WHEN GET /api/patients/ is requested
- THEN all patient for the user's tenant are returned
- AND each item includes complete details

#### Scenario: Get single patient by ID
- GIVEN an authenticated user
- WHEN GET /api/patients/{id} is requested
- THEN the specific patient is returned
- AND only if it belongs to the user's tenant

### Requirement: Patient Creation
The system SHALL allow creation of new patient records.

#### Scenario: Create patient
- GIVEN an authenticated user with valid patient data
- WHEN POST /api/patients/ is requested
- THEN a new patient is created for the user's tenant
- AND the created patient is returned with generated ID
- AND timestamps are automatically set

### Requirement: Patient Update
The system SHALL allow modification of existing patient records.

#### Scenario: Update patient
- GIVEN an authenticated user with updated patient data
- WHEN PUT /api/patients/{id} is requested
- THEN the patient is updated
- AND only if it belongs to the user's tenant
- AND updatedAt timestamp is automatically updated

### Requirement: Patient Deletion
The system SHALL allow deletion of patient records.

#### Scenario: Soft delete patient
- GIVEN an authenticated user
- WHEN DELETE /api/patients/{id} is requested
- THEN the patient's deletedAt is set to current timestamp
- AND the patient is excluded from standard queries
- AND only if it belongs to the user's tenant

