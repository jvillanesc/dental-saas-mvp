# Proposal: Add Dashboard Real-Time Statistics

## Context

The Dashboard currently displays hardcoded statistics:
- **248** Total Pacientes
- **12** Personal Activo  
- **18** Citas Hoy
- **34** Citas Pendientes

These values never change regardless of the actual data in the database, making the dashboard misleading and non-functional for end users.

## User Intent

> "quisiera que esos datos numericos no esten hardcodeados"

The user wants real-time statistics that reflect the actual state of the system.

## Proposed Solution

Replace hardcoded values with real database aggregations:

1. **Backend**: Create `/api/dashboard/stats` endpoint that returns:
   - `totalPatients`: COUNT of all patients for current tenant (excluding soft-deleted)
   - `activeStaff`: COUNT of active staff for current tenant (excluding soft-deleted)
   - `appointmentsToday`: COUNT of appointments scheduled for today
   - `appointmentsPending`: COUNT of appointments with status SCHEDULED

2. **Frontend**: Update Dashboard component to:
   - Fetch statistics on mount using new API endpoint
   - Display loading state while fetching
   - Show real-time data in the 4 stat cards

## Benefits

- ✅ Accurate representation of system state
- ✅ Builds trust with end users
- ✅ Provides actionable insights for clinic management
- ✅ Follows multi-tenant isolation patterns (tenantId filtering)

## Scope

**In Scope:**
- New DashboardController with single endpoint
- New DashboardService with 4 aggregation methods
- New DashboardStatsDTO
- Update Dashboard.tsx component
- Update dashboardService.ts (new file)

**Out of Scope:**
- Historical trend data
- Advanced analytics or reporting
- Real-time updates (websockets)
- Caching strategies

## Risks

- **Performance**: Aggregation queries may be slow on large datasets
  - *Mitigation*: Use R2DBC's reactive pattern; add database indexes if needed
  
- **Multi-tenancy**: Must ensure tenantId filtering on all queries
  - *Mitigation*: Follow existing patterns in PatientRepository/StaffRepository

## Timeline Estimate

- Backend implementation: 2-3 hours
- Frontend implementation: 1-2 hours
- Testing & validation: 1 hour
- **Total**: ~4-6 hours

## Success Criteria

- [ ] Dashboard displays real patient count
- [ ] Dashboard displays real active staff count
- [ ] Dashboard displays today's appointment count
- [ ] Dashboard displays pending appointment count
- [ ] All queries filter by tenantId
- [ ] Loading state shown while fetching
- [ ] Error handling when API fails

---

**Created**: 2026-02-09  
**Status**: ✅ Ready for implementation
