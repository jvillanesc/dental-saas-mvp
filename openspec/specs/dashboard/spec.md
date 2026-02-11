# Dashboard Specification

> **Status**: ✅ Implemented  
> **Last Updated**: 2026-02-09  
> **Domain**: User Interface / Analytics

## Overview

The dashboard provides real-time statistics for clinic management, displaying key metrics about patients, staff, and appointments.

---

## **DASHBOARD-001**: Real-Time Statistics Display

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

### API Specification

**Endpoint**: `GET /api/dashboard/stats`

**Authentication**: Requires valid JWT token (once security is enabled)

**Response Format**:
```json
{
  "totalPatients": 3,
  "activeStaff": 3,
  "appointmentsToday": 3,
  "appointmentsPending": 5
}
```

**HTTP Status Codes**:
- `200 OK`: Statistics retrieved successfully
- `401 Unauthorized`: Invalid or missing JWT token
- `500 Internal Server Error`: Database error

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
Given a user is authenticated with tenantId "550e8400-e29b-41d4-a716-446655440000"
And the tenant has 3 active patients
And the tenant has 3 active staff members
And there are 3 appointments scheduled for today
And there are 5 appointments with status SCHEDULED

When the user navigates to the Dashboard page
Then the frontend fetches "/api/dashboard/stats"
And the backend queries the database with tenantId filter
And the response contains:
  | Field                | Value |
  |----------------------|-------|
  | totalPatients        | 3     |
  | activeStaff          | 3     |
  | appointmentsToday    | 3     |
  | appointmentsPending  | 5     |
And the Dashboard displays these real-time values
```

### Scenario: Dashboard Handles Empty Tenant

```gherkin
Given a user is authenticated with a new tenant
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
And the network has latency

When the user navigates to the Dashboard page
Then a loading skeleton is displayed
And after the response arrives, the real statistics are shown
```

---

## Technical Implementation

### Backend Components

**DashboardStatsDTO**:
- Immutable DTO with 4 Long fields
- No setters (read-only)
- Used for API response serialization

**DashboardService**:
- Uses `DatabaseClient` for direct SQL queries
- Executes 4 COUNT queries in parallel using `Mono.zip()`
- Returns `Mono<DashboardStatsDTO>`

**DashboardController**:
- Maps `GET /api/dashboard/stats`
- Extracts `tenantId` from JWT (or header for testing)
- Returns reactive `Mono<DashboardStatsDTO>`

### Frontend Components

**dashboardService.ts**:
- Centralized API call to `/dashboard/stats`
- Returns `Promise<DashboardStats>`

**Dashboard.tsx**:
- Uses `useState` for stats, loading, error
- Uses `useEffect` to fetch on mount
- Displays loading skeletons during fetch
- Shows error message if API fails

### Database Queries

```sql
-- Total Patients
SELECT COUNT(*) FROM patients 
WHERE tenant_id = :tenantId AND deleted_at IS NULL;

-- Active Staff
SELECT COUNT(*) FROM staff 
WHERE tenant_id = :tenantId AND deleted_at IS NULL;

-- Appointments Today
SELECT COUNT(*) FROM appointments 
WHERE tenant_id = :tenantId AND DATE(start_time) = CURRENT_DATE;

-- Pending Appointments
SELECT COUNT(*) FROM appointments 
WHERE tenant_id = :tenantId AND status = 'SCHEDULED';
```

---

## Dependencies

- **Requires**: Patient entity, Staff entity, Appointment entity
- **Requires**: R2DBC PostgreSQL driver
- **Requires**: Multi-tenancy infrastructure (tenantId in JWT)

---

## Change History

| Date       | Change                                      | Author          |
|------------|---------------------------------------------|-----------------|
| 2026-02-09 | Initial specification with real-time stats | OpenSpec Agent  |

---

**Specification Status**: ✅ Complete and Implemented  
**Implementation Status**: ✅ Verified with test data
