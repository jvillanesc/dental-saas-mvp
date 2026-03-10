# OpenSpec Change Archive

This directory contains completed changes that have been implemented and archived.

## Archive Structure

Each archived change is stored in a dated directory: `YYYY-MM-DD-change-name/`

### Contents of Each Archived Change

- **`.openspec.yaml`**: Metadata (status, artifacts, implementation files, results)
- **`proposal.md`**: Original problem statement and proposed solution
- **`specs/`**: Delta specifications (requirements added/modified/removed)
- **`design.md`**: Technical design and implementation approach
- **`tasks.md`**: Implementation checklist
- **`SUMMARY.md`**: Post-completion summary with results and lessons learned

---

## Archived Changes

### 2026-02-09: JWT Tenant Extraction & Multi-Tenant Security

**Status**: ✅ Completed  
**Description**: Implemented dynamic tenant extraction from JWT tokens with reactive context propagation

**Impact**:
- ✅ All controllers now use TenantContext for automatic tenant isolation
- ✅ JwtAuthenticationFilter validates tokens and extracts tenant context
- ✅ Multi-tenant isolation verified with 2 tenants (Clínica ABC, Dental Care Premium)
- ✅ Code reduction: -60 lines (33% reduction in controller code)
- ✅ TenantId dynamically extracted from JWT (no more hardcoded values)

**Files Changed**: 3 created, 8 modified  
**Implementation Time**: ~3 hours  

[View Full Summary](2026-02-09-extract-tenant-from-jwt/SUMMARY.md)

---

### 2026-02-09: Dashboard Real-Time Statistics

**Status**: ✅ Completed  
**Description**: Replaced hardcoded dashboard statistics with real database aggregations

**Impact**:
- ✅ Dashboard now shows real patient count (3)
- ✅ Dashboard now shows real staff count (3)
- ✅ Dashboard now shows real appointments today (3)
- ✅ Dashboard now shows real pending appointments (5)

**Files Changed**: 5 created, 2 modified  
**Implementation Time**: ~4 hours  

[View Full Summary](2026-02-09-add-dashboard-aggregations/SUMMARY.md)

---

### 2026-03-03: Quick Appointment Status Change

**Status**: ✅ Completed  
**Description**: Implemented quick status change functionality for appointments in the calendar

**Impact**:
- ✅ Modal UI for quick status updates (click appointment → select status → save)
- ✅ PATCH /api/appointments/{id}/status endpoint with tenant isolation
- ✅ CORS configuration fixed to allow PATCH method
- ✅ Lombok updated to version 1.18.30 (Java 21 compatible)
- ✅ JWT warnings resolved (updated to modern JJWT APIs)
- ✅ Enhanced logging with emoji markers for debugging
- ✅ Color-coded status badges (SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW)

**Files Changed**: 4 created, 6 modified  
**Implementation Time**: ~5 hours  

[View Details](quick-appointment-status-change/)

---

### 2026-03-10: Patient Medical History Registration

**Status**: ✅ Completed  
**Description**: Comprehensive medical history system with 30+ fields, multi-tab interface, and full CRUD operations

**Impact**:
- ✅ "Ver Detalle" button in patient grid (green styled)
- ✅ Tab-based patient detail page (Historia Clínica, Odontograma, Ortodoncia)
- ✅ Complete medical history form with 6 logical sections
- ✅ Multi-tenant isolation with one history per patient per tenant
- ✅ Reactive backend with R2DBC (Spring Boot WebFlux)
- ✅ TypeScript frontend with React 18 and Tailwind CSS
- ✅ Soft delete support with audit timestamps
- ✅ Form reorganization based on user feedback
- ✅ Removed dailyBrushingDetail field completely (all layers)
- ✅ Logging level changed to INFO

**Files Changed**: 11 created, 3 modified  
**Implementation Time**: ~4 hours  

[View Full Summary](add-patient-medical-history/SUMMARY.md)

---

## How to Use Archived Changes

1. **Reference**: Review past changes for patterns and best practices
2. **Rollback**: If needed, use git history to revert specific changes
3. **Audit**: Track what was implemented and when
4. **Learning**: Study lessons learned from each change

---

**Archive Maintained By**: OpenSpec Workflow  
**Last Updated**: 2026-03-10
