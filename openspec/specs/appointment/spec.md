# Appointment Specification

## Purpose

Management of appointments in the dental clinic system.

## Domain Model

### Entity: Appointment
- **Table**: `appointments`
- **Multi-tenant**: ✅ Yes
- **Soft Delete**: ❌ No

**Fields:**
- id: UUID
- tenantId: UUID
- patientId: UUID
- dentistId: UUID
- startTime: LocalDateTime
- durationMinutes: Integer
- status: String
- notes: String
- createdAt: LocalDateTime
- updatedAt: LocalDateTime

## Requirements

### Requirement: Multi-Tenant Isolation
The system SHALL ensure that appointments are isolated by tenant.

#### Scenario: Tenant data isolation
- GIVEN a user authenticated with tenantId A
- WHEN the user requests appointments
- THEN only appointments belonging to tenant A are returned
- AND appointments from other tenants are never visible

