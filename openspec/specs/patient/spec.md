# Patient Specification

## Purpose

Management of patients in the dental clinic system.

## Domain Model

### Entity: Patient
- **Table**: `patients`
- **Multi-tenant**: ✅ Yes
- **Soft Delete**: ✅ Yes (deletedAt)

**Fields:**
- id: UUID
- tenantId: UUID
- firstName: String
- lastName: String
- phone: String
- email: String
- birthDate: LocalDate
- createdAt: LocalDateTime
- updatedAt: LocalDateTime
- deletedAt: LocalDateTime

## Requirements

### Requirement: Multi-Tenant Isolation
The system SHALL ensure that patients are isolated by tenant.

#### Scenario: Tenant data isolation
- GIVEN a user authenticated with tenantId A
- WHEN the user requests patients
- THEN only patients belonging to tenant A are returned
- AND patients from other tenants are never visible

### Requirement: Soft Delete
The system SHALL mark patients as deleted without removing them from the database.

#### Scenario: Soft delete patient
- GIVEN an existing patient
- WHEN a delete request is made
- THEN the patient's deletedAt field is set to current timestamp
- AND the patient is no longer returned in standard queries
- AND the patient record remains in the database

