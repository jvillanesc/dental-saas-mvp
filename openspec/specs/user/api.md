# User API Specification

## Purpose

REST API endpoints for user management.

**Base Path**: `/api/users`

## Requirements

### Requirement: User Retrieval
The system SHALL provide endpoints to retrieve user data.

#### Scenario: List all user
- GIVEN an authenticated user
- WHEN GET /api/users/ is requested
- THEN all user for the user's tenant are returned
- AND each item includes complete details

### Requirement: User Creation
The system SHALL allow creation of new user records.

#### Scenario: Create user
- GIVEN an authenticated user with valid user data
- WHEN POST /api/users/ is requested
- THEN a new user is created for the user's tenant
- AND the created user is returned with generated ID
- AND timestamps are automatically set

#### Scenario: Create user
- GIVEN an authenticated user with valid user data
- WHEN POST /api/users/{userId}/link-staff/{staffId} is requested
- THEN a new user is created for the user's tenant
- AND the created user is returned with generated ID
- AND timestamps are automatically set

### Requirement: User Update
The system SHALL allow modification of existing user records.

#### Scenario: Update user
- GIVEN an authenticated user with updated user data
- WHEN PUT /api/users/{id} is requested
- THEN the user is updated
- AND only if it belongs to the user's tenant
- AND updatedAt timestamp is automatically updated

#### Scenario: Change password
- GIVEN an authenticated ADMIN user
- WHEN PUT /api/users/{id}/password is requested with new password
- THEN the password is updated with BCrypt hash
- AND the user can login with the new password

#### Scenario: Activate user
- GIVEN an authenticated ADMIN user
- WHEN PUT /api/users/{id}/deactivate is requested
- THEN the user's active status is set to true
- AND the change is persisted

#### Scenario: Activate user
- GIVEN an authenticated ADMIN user
- WHEN PUT /api/users/{id}/activate is requested
- THEN the user's active status is set to true
- AND the change is persisted

### Requirement: User Deletion
The system SHALL allow deletion of user records.

#### Scenario: Delete user
- GIVEN an authenticated user
- WHEN DELETE /api/users/{userId}/unlink-staff is requested
- THEN the user is permanently removed
- AND only if it belongs to the user's tenant

