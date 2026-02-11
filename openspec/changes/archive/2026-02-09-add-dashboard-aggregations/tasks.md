# Implementation Tasks: Dashboard Real-Time Statistics

## Phase 1: Backend Implementation

### Task 1.1: Create DTO
- [ ] Create `backend/src/main/java/com/dental/dto/DashboardStatsDTO.java`
- [ ] Add 4 private fields: `totalPatients`, `activeStaff`, `appointmentsToday`, `appointmentsPending` (all `Long`)
- [ ] Add all-args constructor
- [ ] Add getters (no setters - keep immutable)
- [ ] Verify: DTO compiles without errors

**File**: [`backend/src/main/java/com/dental/dto/DashboardStatsDTO.java`](../../../backend/src/main/java/com/dental/dto/DashboardStatsDTO.java) (NEW)

---

### Task 1.2: Create Service Layer
- [ ] Create `backend/src/main/java/com/dental/service/DashboardService.java`
- [ ] Inject `DatabaseClient` via constructor
- [ ] Implement `getStatsForTenant(UUID tenantId)` returning `Mono<DashboardStatsDTO>`
- [ ] Implement private method `countTotalPatients(UUID tenantId)`:
  - SQL: `SELECT COUNT(*) FROM patients WHERE tenant_id = :tenantId AND deleted_at IS NULL`
  - Return: `Mono<Long>` with `.defaultIfEmpty(0L)`
- [ ] Implement private method `countActiveStaff(UUID tenantId)`:
  - SQL: `SELECT COUNT(*) FROM staff WHERE tenant_id = :tenantId AND deleted_at IS NULL`
  - Return: `Mono<Long>` with `.defaultIfEmpty(0L)`
- [ ] Implement private method `countAppointmentsToday(UUID tenantId)`:
  - SQL: `SELECT COUNT(*) FROM appointments WHERE tenant_id = :tenantId AND DATE(appointment_date) = :today`
  - Bind: `LocalDate.now()` as `:today`
  - Return: `Mono<Long>` with `.defaultIfEmpty(0L)`
- [ ] Implement private method `countAppointmentsPending(UUID tenantId)`:
  - SQL: `SELECT COUNT(*) FROM appointments WHERE tenant_id = :tenantId AND status = 'SCHEDULED'`
  - Return: `Mono<Long>` with `.defaultIfEmpty(0L)`
- [ ] In `getStatsForTenant()`, use `Mono.zip()` to combine 4 queries in parallel
- [ ] Map zipped tuple to `DashboardStatsDTO` constructor
- [ ] Verify: Service compiles and follows reactive patterns

**File**: [`backend/src/main/java/com/dental/service/DashboardService.java`](../../../backend/src/main/java/com/dental/service/DashboardService.java) (NEW)

---

### Task 1.3: Create Controller Layer
- [ ] Create `backend/src/main/java/com/dental/controller/DashboardController.java`
- [ ] Add annotations: `@RestController`, `@RequestMapping("/api/dashboard")`, `@CrossOrigin(origins = "http://localhost:5173")`
- [ ] Inject `DashboardService` via constructor
- [ ] Implement `@GetMapping("/stats")` method:
  - Add `@RequestHeader(value = "X-Tenant-ID", required = false) String tenantIdHeader` parameter
  - Parse tenant ID: Use header if present, else default to `"11111111-1111-1111-1111-111111111111"`
  - Call `dashboardService.getStatsForTenant(tenantId)`
  - Return `Mono<DashboardStatsDTO>`
- [ ] Add TODO comment: "Extract tenantId from JWT once SecurityConfig is fixed"
- [ ] Verify: Controller compiles without errors

**File**: [`backend/src/main/java/com/dental/controller/DashboardController.java`](../../../backend/src/main/java/com/dental/controller/DashboardController.java) (NEW)

---

### Task 1.4: Build & Test Backend
- [ ] Run: `./gradlew build` in `backend/` directory
- [ ] Fix any compilation errors
- [ ] Start backend: `./gradlew bootRun`
- [ ] Test endpoint manually:
  ```powershell
  curl http://localhost:8080/api/dashboard/stats
  ```
- [ ] Verify JSON response contains correct structure:
  ```json
  {
    "totalPatients": <number>,
    "activeStaff": <number>,
    "appointmentsToday": <number>,
    "appointmentsPending": <number>
  }
  ```
- [ ] Cross-check counts with database queries:
  ```sql
  SELECT COUNT(*) FROM patients WHERE tenant_id = '11111111-1111-1111-1111-111111111111' AND deleted_at IS NULL;
  SELECT COUNT(*) FROM staff WHERE tenant_id = '11111111-1111-1111-1111-111111111111' AND deleted_at IS NULL;
  SELECT COUNT(*) FROM appointments WHERE tenant_id = '11111111-1111-1111-1111-111111111111' AND DATE(appointment_date) = CURRENT_DATE;
  SELECT COUNT(*) FROM appointments WHERE tenant_id = '11111111-1111-1111-1111-111111111111' AND status = 'SCHEDULED';
  ```
- [ ] Verify: Backend returns accurate counts

---

## Phase 2: Frontend Implementation

### Task 2.1: Create Dashboard Service
- [ ] Create `frontend/src/services/dashboardService.ts`
- [ ] Import `api` from `./api`
- [ ] Define TypeScript interface:
  ```typescript
  export interface DashboardStats {
    totalPatients: number;
    activeStaff: number;
    appointmentsToday: number;
    appointmentsPending: number;
  }
  ```
- [ ] Export `dashboardService` object with method:
  ```typescript
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  }
  ```
- [ ] Verify: TypeScript compiles without errors

**File**: [`frontend/src/services/dashboardService.ts`](../../../frontend/src/services/dashboardService.ts) (NEW)

---

### Task 2.2: Update Dashboard Component
- [ ] Open `frontend/src/pages/Dashboard.tsx`
- [ ] Add imports:
  ```typescript
  import { useState, useEffect } from 'react';
  import { dashboardService, DashboardStats } from '../services/dashboardService';
  ```
- [ ] Add state hooks at top of component:
  ```typescript
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  ```
- [ ] Add `useEffect` hook to fetch stats on mount:
  ```typescript
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
  ```
- [ ] Add error message display (before stats cards):
  ```tsx
  {error && (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
      {error}
    </div>
  )}
  ```
- [ ] Verify: Component compiles without errors

**File**: [`frontend/src/pages/Dashboard.tsx`](../../../frontend/src/pages/Dashboard.tsx) (MODIFIED)

---

### Task 2.3: Replace Hardcoded Values
- [ ] **Total Pacientes Card** (line ~23):
  - Replace `<p className="text-2xl font-bold text-gray-900">248</p>` with:
    ```tsx
    {loading ? (
      <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div>
    ) : (
      <p className="text-2xl font-bold text-gray-900">{stats?.totalPatients ?? 0}</p>
    )}
    ```

- [ ] **Personal Activo Card** (line ~38):
  - Replace `<p className="text-2xl font-bold text-gray-900">12</p>` with:
    ```tsx
    {loading ? (
      <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div>
    ) : (
      <p className="text-2xl font-bold text-gray-900">{stats?.activeStaff ?? 0}</p>
    )}
    ```

- [ ] **Citas Hoy Card** (line ~53):
  - Replace `<p className="text-2xl font-bold text-gray-900">18</p>` with:
    ```tsx
    {loading ? (
      <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div>
    ) : (
      <p className="text-2xl font-bold text-gray-900">{stats?.appointmentsToday ?? 0}</p>
    )}
    ```

- [ ] **Citas Pendientes Card** (line ~68):
  - Replace `<p className="text-2xl font-bold text-gray-900">34</p>` with:
    ```tsx
    {loading ? (
      <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div>
    ) : (
      <p className="text-2xl font-bold text-gray-900">{stats?.appointmentsPending ?? 0}</p>
    )}
    ```

- [ ] Verify: Frontend compiles and runs without errors

**File**: [`frontend/src/pages/Dashboard.tsx`](../../../frontend/src/pages/Dashboard.tsx) (MODIFIED)

---

### Task 2.4: Test Frontend
- [ ] Start frontend: `npm run dev` in `frontend/` directory
- [ ] Open browser: `http://localhost:5173`
- [ ] Login with test credentials
- [ ] Navigate to Dashboard
- [ ] Verify: Loading skeleton appears briefly
- [ ] Verify: Real numbers replace loading state
- [ ] Verify: Numbers match backend API response
- [ ] **Test Error Handling**:
  - Stop backend server
  - Refresh dashboard
  - Verify: Error message appears: "No se pudieron cargar las estadísticas"
  - Restart backend
  - Refresh dashboard
  - Verify: Real numbers appear again

---

## Phase 3: Optional Enhancements (Future)

### Task 3.1: Extract StatCard Component (Optional)
- [ ] Create reusable `StatCard` component to reduce code duplication
- [ ] Accept props: `label`, `value`, `loading`, `icon`, `color`
- [ ] Replace 4 stat card divs with `<StatCard ... />` usage

### Task 3.2: Add Refresh Button (Optional)
- [ ] Add "Refresh" button next to dashboard header
- [ ] On click, re-fetch stats from API
- [ ] Show loading state during refresh

### Task 3.3: Add Auto-Refresh (Optional)
- [ ] Use `setInterval` to auto-refresh stats every 60 seconds
- [ ] Clean up interval in `useEffect` cleanup function

---

## Verification Checklist

### Functional Verification
- [ ] Dashboard loads without errors
- [ ] Total Pacientes shows real count
- [ ] Personal Activo shows real count
- [ ] Citas Hoy shows real count
- [ ] Citas Pendientes shows real count
- [ ] Loading skeletons appear during fetch
- [ ] Error message appears if backend is down
- [ ] Numbers match database queries

### Code Quality Verification
- [ ] No hardcoded values remain in Dashboard.tsx
- [ ] All backend queries filter by `tenantId`
- [ ] Service methods return `Mono<T>` (reactive)
- [ ] Frontend uses TypeScript types
- [ ] No console errors in browser DevTools
- [ ] No compilation warnings in backend or frontend

### Documentation Verification
- [ ] Code comments explain temporary tenant ID handling
- [ ] TODO added for future JWT extraction

---

## Rollback Instructions

If critical issues arise:

1. **Frontend Rollback**:
   ```bash
   git checkout HEAD -- frontend/src/pages/Dashboard.tsx
   git clean -f frontend/src/services/dashboardService.ts
   ```

2. **Backend Rollback**:
   ```bash
   git clean -f backend/src/main/java/com/dental/controller/DashboardController.java
   git clean -f backend/src/main/java/com/dental/service/DashboardService.java
   git clean -f backend/src/main/java/com/dental/dto/DashboardStatsDTO.java
   ./gradlew build
   ```

---

**Task List Created**: 2026-02-09  
**Total Tasks**: 18 backend + frontend tasks  
**Estimated Time**: 4-6 hours
