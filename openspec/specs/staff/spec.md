# Staff Specification

## Purpose

Management of staffs in the dental clinic system.

## Domain Model

### Entity: Staff
- **Table**: `staff`
- **Multi-tenant**: ✅ Yes
- **Soft Delete**: ✅ Yes (deletedAt)

**Fields:**
- id: UUID
- tenantId: UUID
- userId: UUID
- firstName: String
- lastName: String
- phone: String
- email: String
- specialty: String
- licenseNumber: String
- hireDate: LocalDate
- active: Boolean
- createdAt: LocalDateTime
- updatedAt: LocalDateTime
- deletedAt: LocalDateTime

## Requirements

### Requirement: Multi-Tenant Isolation
The system SHALL ensure that staffs are isolated by tenant.

#### Scenario: Tenant data isolation
- GIVEN a user authenticated with tenantId A
- WHEN the user requests staffs
- THEN only staffs belonging to tenant A are returned
- AND staffs from other tenants are never visible

### Requirement: Soft Delete
The system SHALL mark staffs as deleted without removing them from the database.

#### Scenario: Soft delete staff
- GIVEN an existing staff
- WHEN a delete request is made
- THEN the staff's deletedAt field is set to current timestamp
- AND the staff is no longer returned in standard queries
- AND the staff record remains in the database

