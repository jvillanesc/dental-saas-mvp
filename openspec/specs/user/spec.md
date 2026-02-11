# User Specification

## Purpose

Management of users in the dental clinic system.

## Domain Model

### Entity: User
- **Table**: `users`
- **Multi-tenant**: ✅ Yes
- **Soft Delete**: ❌ No

**Fields:**
- id: UUID
- tenantId: UUID
- staffId: UUID
- email: String
- password: String
- firstName: String
- lastName: String
- role: String
- active: Boolean
- createdAt: LocalDateTime

## Requirements

### Requirement: Multi-Tenant Isolation
The system SHALL ensure that users are isolated by tenant.

#### Scenario: Tenant data isolation
- GIVEN a user authenticated with tenantId A
- WHEN the user requests users
- THEN only users belonging to tenant A are returned
- AND users from other tenants are never visible

