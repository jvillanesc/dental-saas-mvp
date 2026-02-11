# Tenant Specification

## Purpose

Management of tenants in the dental clinic system.

## Domain Model

### Entity: Tenant
- **Table**: `tenants`
- **Multi-tenant**: ❌ No
- **Soft Delete**: ❌ No

**Fields:**
- id: UUID
- name: String
- contactEmail: String
- phone: String
- active: Boolean
- createdAt: LocalDateTime

## Requirements

