# Dashboard Specification (Delta)

> **Change Type**: ADDED  
> **Date**: 2026-02-09  
> **Related To**: [openspec/specs/architecture/spec.md](../../../../specs/architecture/spec.md)

## Overview

This delta spec introduces real-time dashboard statistics aggregation functionality.

---

## **ADDED**: Dashboard Statistics

### Functional Requirements

**DASH-STAT-001**: Real-Time Patient Count
- The system SHALL display the total count of non-deleted patients for the current tenant
- The count MUST exclude patients where `deletedAt IS NOT NULL`
- The count MUST filter by the authenticated user's `tenantId`

**DASH-STAT-002**: Active Staff Count  
- The system SHALL display the count of active staff members for the current tenant
- The count MUST exclude staff where `deletedAt IS NOT NULL`
- The count MUST filter by the authenticated user's `tenantId`

**DASH-STAT-003**: Today's Appointments Count
- The system SHALL display the count of appointments scheduled for today
- "Today" is defined as the current date in the system's timezone
- The count MUST filter by the authenticated user's `tenantId`

**DASH-STAT-004**: Pending Appointments Count
- The system SHALL display the count of appointments with status `SCHEDULED`
- The count MUST exclude appointments with status `COMPLETED` or `CANCELLED`
- The count MUST filter by the authenticated user's `tenantId`

### API Requirements

**DASH-API-001**: Dashboard Stats Endpoint
- Endpoint: `GET /api/dashboard/stats`
- Authentication: MUST require valid JWT token (once security is enabled)
- Response format:
  ```json
  {
    "totalPatients": 248,
    "activeStaff": 12,
    "appointmentsToday": 18,
    "appointmentsPending": 34
  }
  ```
- HTTP Status: `200 OK` on success
- HTTP Status: `401 Unauthorized` if not authenticated
- HTTP Status: `500 Internal Server Error` on failure

### Non-Functional Requirements

**DASH-NFR-001**: Performance
- The statistics endpoint SHOULD respond within 500ms under normal load
- Aggregation queries SHOULD use database indexes where applicable

**DASH-NFR-002**: Multi-Tenancy
- All aggregation queries MUST include `WHERE tenantId = :tenantId` clause
- Tenant isolation MUST be enforced at the database query level

**DASH-NFR-003**: Reactive Programming
- All service methods MUST return `Mono<DashboardStatsDTO>`
- All repository methods MUST use R2DBC reactive patterns

---

## Scenarios

### Scenario: User Views Dashboard with Real Statistics

```gherkin
Given a user is authenticated with tenantId "tenant-123"
And the tenant has 150 patients (10 soft-deleted)
And the tenant has 8 active staff members (2 soft-deleted)
And there are 5 appointments scheduled for today
And there are 12 appointments with status SCHEDULED

When the user navigates to the Dashboard page
Then the frontend fetches "/api/dashboard/stats"
And the backend queries the database with tenantId filter
And the response contains:
  | Field                | Value |
  |----------------------|-------|
  | totalPatients        | 140   |
  | activeStaff          | 6     |
  | appointmentsToday    | 5     |
  | appointmentsPending  | 12    |
And the Dashboard displays these real-time values
```

### Scenario: Dashboard Handles Empty Tenant

```gherkin
Given a user is authenticated with tenantId "new-tenant"
And the tenant has 0 patients
And the tenant has 0 staff
And there are 0 appointments

When the user navigates to the Dashboard page
Then all statistics display "0"
And no error is shown
```

### Scenario: Dashboard Shows Loading State

```gherkin
Given a user is authenticated
And the network is slow (2-second delay)

When the user navigates to the Dashboard page
Then a loading indicator is displayed
And after 2 seconds, the real statistics are shown
```

---

## Technical Constraints

1. **Database Queries**: Use R2DBC's `DatabaseClient` for COUNT aggregations
2. **DTO Structure**: Create `DashboardStatsDTO` with read-only fields
3. **Service Layer**: Implement `DashboardService` following existing service patterns
4. **Controller**: Implement `DashboardController` following existing controller patterns
5. **Frontend**: Use React hooks (`useState`, `useEffect`) for data fetching

---

## Dependencies

- Requires: Patient entity, Staff entity, Appointment entity
- Requires: R2DBC PostgreSQL driver
- Requires: Existing multi-tenancy infrastructure (tenantId in JWT)

---

## Out of Scope

- Historical trend data (e.g., "Patients added this month")
- Real-time updates via WebSocket
- Caching layer for statistics
- Advanced filtering or date range selection

---

**Change Status**: 🟢 ADDED  
**Supersedes**: None (new functionality)
