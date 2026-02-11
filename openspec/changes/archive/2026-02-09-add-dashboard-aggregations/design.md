# Technical Design: Dashboard Real-Time Statistics

## Architecture Overview

### Component Diagram

```
┌─────────────────┐
│  Dashboard.tsx  │
│   (Frontend)    │
└────────┬────────┘
         │ HTTP GET /api/dashboard/stats
         ▼
┌─────────────────────────┐
│  DashboardController    │
│  @GetMapping("/stats")  │
└────────┬────────────────┘
         │
         ▼
┌────────────────────────┐
│   DashboardService     │
│ - getStatsForTenant()  │
└────────┬───────────────┘
         │
         ▼
┌───────────────────────────────┐
│  R2DBC DatabaseClient         │
│  (Direct COUNT queries)       │
└───────────────────────────────┘
```

### Data Flow

1. User opens Dashboard → `useEffect` triggers
2. `dashboardService.getStats()` → `GET /api/dashboard/stats`
3. `DashboardController` extracts `tenantId` from JWT (or hardcoded for now)
4. `DashboardService.getStatsForTenant(tenantId)` executes 4 parallel queries
5. Results aggregated into `DashboardStatsDTO`
6. DTO serialized to JSON → 200 OK response
7. Frontend updates state → UI re-renders with real values

---

## Backend Implementation

### 1. Data Transfer Object

**File**: `backend/src/main/java/com/dental/dto/DashboardStatsDTO.java`

```java
package com.dental.dto;

public class DashboardStatsDTO {
    private Long totalPatients;
    private Long activeStaff;
    private Long appointmentsToday;
    private Long appointmentsPending;

    // Constructor
    public DashboardStatsDTO(Long totalPatients, Long activeStaff, 
                             Long appointmentsToday, Long appointmentsPending) {
        this.totalPatients = totalPatients;
        this.activeStaff = activeStaff;
        this.appointmentsToday = appointmentsToday;
        this.appointmentsPending = appointmentsPending;
    }

    // Getters (no setters - immutable)
}
```

**Rationale**: Immutable DTO ensures thread-safety in reactive context.

---

### 2. Service Layer

**File**: `backend/src/main/java/com/dental/service/DashboardService.java`

```java
package com.dental.service;

import com.dental.dto.DashboardStatsDTO;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.UUID;

@Service
public class DashboardService {

    private final DatabaseClient databaseClient;

    public DashboardService(DatabaseClient databaseClient) {
        this.databaseClient = databaseClient;
    }

    public Mono<DashboardStatsDTO> getStatsForTenant(UUID tenantId) {
        Mono<Long> totalPatients = countTotalPatients(tenantId);
        Mono<Long> activeStaff = countActiveStaff(tenantId);
        Mono<Long> appointmentsToday = countAppointmentsToday(tenantId);
        Mono<Long> appointmentsPending = countAppointmentsPending(tenantId);

        return Mono.zip(totalPatients, activeStaff, appointmentsToday, appointmentsPending)
                .map(tuple -> new DashboardStatsDTO(
                        tuple.getT1(),
                        tuple.getT2(),
                        tuple.getT3(),
                        tuple.getT4()
                ));
    }

    private Mono<Long> countTotalPatients(UUID tenantId) {
        String sql = "SELECT COUNT(*) FROM patients WHERE tenant_id = :tenantId AND deleted_at IS NULL";
        return databaseClient.sql(sql)
                .bind("tenantId", tenantId)
                .map(row -> row.get(0, Long.class))
                .one()
                .defaultIfEmpty(0L);
    }

    private Mono<Long> countActiveStaff(UUID tenantId) {
        String sql = "SELECT COUNT(*) FROM staff WHERE tenant_id = :tenantId AND deleted_at IS NULL";
        return databaseClient.sql(sql)
                .bind("tenantId", tenantId)
                .map(row -> row.get(0, Long.class))
                .one()
                .defaultIfEmpty(0L);
    }

    private Mono<Long> countAppointmentsToday(UUID tenantId) {
        String sql = "SELECT COUNT(*) FROM appointments WHERE tenant_id = :tenantId AND DATE(appointment_date) = :today";
        return databaseClient.sql(sql)
                .bind("tenantId", tenantId)
                .bind("today", LocalDate.now())
                .map(row -> row.get(0, Long.class))
                .one()
                .defaultIfEmpty(0L);
    }

    private Mono<Long> countAppointmentsPending(UUID tenantId) {
        String sql = "SELECT COUNT(*) FROM appointments WHERE tenant_id = :tenantId AND status = 'SCHEDULED'";
        return databaseClient.sql(sql)
                .bind("tenantId", tenantId)
                .map(row -> row.get(0, Long.class))
                .one()
                .defaultIfEmpty(0L);
    }
}
```

**Key Design Decisions**:
- **Parallel Queries**: `Mono.zip()` executes 4 COUNT queries concurrently
- **Null Safety**: `.defaultIfEmpty(0L)` prevents NPE if tenant has no data
- **SQL Injection**: R2DBC parameter binding prevents injection attacks

---

### 3. Controller Layer

**File**: `backend/src/main/java/com/dental/controller/DashboardController.java`

```java
package com.dental.controller;

import com.dental.dto.DashboardStatsDTO;
import com.dental.service.DashboardService;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    public Mono<DashboardStatsDTO> getStats(@RequestHeader(value = "X-Tenant-ID", required = false) String tenantIdHeader) {
        // TEMPORARY: Hardcode tenantId since JWT is not enforced yet
        // TODO: Extract tenantId from JWT claims once SecurityConfig is fixed
        UUID tenantId = (tenantIdHeader != null) 
            ? UUID.fromString(tenantIdHeader)
            : UUID.fromString("11111111-1111-1111-1111-111111111111"); // Default test tenant

        return dashboardService.getStatsForTenant(tenantId);
    }
}
```

**Known Limitation**: JWT is not enforced (SecurityConfig has `.permitAll()`), so we use:
1. Optional `X-Tenant-ID` header for testing
2. Fallback to hardcoded tenant ID matching test data

**Future**: Replace with `@AuthenticationPrincipal` once security is enabled.

---

## Frontend Implementation

### 1. API Service

**File**: `frontend/src/services/dashboardService.ts` (NEW)

```typescript
import api from './api';

export interface DashboardStats {
  totalPatients: number;
  activeStaff: number;
  appointmentsToday: number;
  appointmentsPending: number;
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },
};
```

**Rationale**: Centralized API calls follow existing service pattern.

---

### 2. Dashboard Component Updates

**File**: `frontend/src/pages/Dashboard.tsx` (MODIFIED)

```typescript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { dashboardService, DashboardStats } from '../services/dashboardService';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getStats();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        setError('No se pudieron cargar las estadísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      {/* Dashboard Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-sm md:text-base text-gray-600">Resumen general del sistema</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <StatCard
          label="Total Pacientes"
          value={stats?.totalPatients ?? 0}
          loading={loading}
          icon="patients"
          color="blue"
        />
        <StatCard
          label="Personal Activo"
          value={stats?.activeStaff ?? 0}
          loading={loading}
          icon="staff"
          color="green"
        />
        <StatCard
          label="Citas Hoy"
          value={stats?.appointmentsToday ?? 0}
          loading={loading}
          icon="calendar"
          color="purple"
        />
        <StatCard
          label="Citas Pendientes"
          value={stats?.appointmentsPending ?? 0}
          loading={loading}
          icon="clock"
          color="orange"
        />
      </div>

      {/* Quick Actions - unchanged */}
      {/* ... */}
    </div>
  );
};

// New component for reusability
const StatCard: React.FC<{
  label: string;
  value: number;
  loading: boolean;
  icon: string;
  color: string;
}> = ({ label, value, loading, icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          {loading ? (
            <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          )}
        </div>
        {/* Icon rendering logic - same as before */}
      </div>
    </div>
  );
};

export default Dashboard;
```

**Key Changes**:
1. Added `useState` for stats, loading, error
2. Added `useEffect` to fetch on mount
3. Extracted `StatCard` component for loading state
4. Display error message if API fails

---

## Testing Strategy

### Backend Tests

**File**: `backend/src/test/java/com/dental/service/DashboardServiceTest.java`

```java
@SpringBootTest
class DashboardServiceTest {

    @Autowired
    private DashboardService dashboardService;

    @Test
    void getStatsForTenant_withData_returnsCorrectCounts() {
        // Given: tenant with test data
        UUID tenantId = UUID.fromString("11111111-1111-1111-1111-111111111111");

        // When: get stats
        DashboardStatsDTO stats = dashboardService.getStatsForTenant(tenantId).block();

        // Then: verify counts
        assertThat(stats.getTotalPatients()).isGreaterThan(0);
        assertThat(stats.getActiveStaff()).isGreaterThan(0);
    }

    @Test
    void getStatsForTenant_withEmptyTenant_returnsZeros() {
        // Given: tenant with no data
        UUID emptyTenantId = UUID.randomUUID();

        // When: get stats
        DashboardStatsDTO stats = dashboardService.getStatsForTenant(emptyTenantId).block();

        // Then: all counts are 0
        assertThat(stats.getTotalPatients()).isEqualTo(0L);
        assertThat(stats.getActiveStaff()).isEqualTo(0L);
        assertThat(stats.getAppointmentsToday()).isEqualTo(0L);
        assertThat(stats.getAppointmentsPending()).isEqualTo(0L);
    }
}
```

### Manual Testing

1. **Setup**: Ensure database has test data with `tenant_id = 11111111-1111-1111-1111-111111111111`
2. **Test**: Open browser → `http://localhost:5173/dashboard`
3. **Verify**: Numbers match database counts (use pgAdmin or SQL queries)
4. **Test Loading**: Throttle network in DevTools → verify skeleton loaders appear
5. **Test Error**: Stop backend → verify error message displays

---

## Performance Considerations

### Database Indexes

Recommended indexes for optimal COUNT performance:

```sql
CREATE INDEX idx_patients_tenant_deleted ON patients(tenant_id, deleted_at);
CREATE INDEX idx_staff_tenant_deleted ON staff(tenant_id, deleted_at);
CREATE INDEX idx_appointments_tenant_date ON appointments(tenant_id, appointment_date);
CREATE INDEX idx_appointments_tenant_status ON appointments(tenant_id, status);
```

**Note**: Check if these indexes already exist before creating.

### Query Optimization

- **Soft Deletes**: `deleted_at IS NULL` is index-friendly
- **Date Filtering**: `DATE(appointment_date) = :today` may not use index efficiently
  - Alternative: `appointment_date >= :todayStart AND appointment_date < :tomorrowStart`

---

## Security Notes

⚠️ **Critical**: This design assumes JWT will be enforced in the future.

**Current State**:
- `SecurityConfig` has `.permitAll()` → No authentication required
- Controller uses hardcoded tenant ID as fallback

**Future State**:
- Remove `.permitAll()` from SecurityConfig
- Extract `tenantId` from JWT claims:
  ```java
  @GetMapping("/stats")
  public Mono<DashboardStatsDTO> getStats(@AuthenticationPrincipal Jwt jwt) {
      UUID tenantId = UUID.fromString(jwt.getClaimAsString("tenantId"));
      return dashboardService.getStatsForTenant(tenantId);
  }
  ```

---

## Rollback Plan

If issues arise:
1. **Frontend**: Revert Dashboard.tsx to previous hardcoded version
2. **Backend**: Remove `DashboardController` and `DashboardService`
3. **Database**: No schema changes, so no rollback needed

---

**Design Status**: ✅ Ready for implementation  
**Estimated Complexity**: Medium (4-6 hours)
