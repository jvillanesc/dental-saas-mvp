# Implementation Tasks: Patient Medical History

**Change**: add-patient-medical-history  
**Date**: 2026-03-10  
**Status**: Ready for Implementation

---

## Phase 1: Database Setup ✅ COMPLETED

### 1.1 Create Database Migration
- [x] Create SQL migration file: `docker/postgres/migrations/001_add_medical_history.sql`
- [x] Verify SQL syntax (no typos)
- [x] Review indexes and constraints

### 1.2 Apply Database Migration
- [x] Start Docker PostgreSQL container (if not running)
- [x] Connect to PostgreSQL in Docker: `wsl docker exec -i dental-postgres psql -U dental_user -d dental_db`
- [x] Copy SQL migration to Docker container (if needed)
- [x] Execute migration SQL
- [x] Verify table creation: `\d medical_history`
- [x] Verify indexes: Created 3 indexes + unique constraint
- [x] Test unique constraint manually

---

## Phase 2: Backend Development ✅ COMPLETED

### 2.1 Create Entity ✅
- [x] Create `com/dental/domain/model/MedicalHistory.java`
- [x] Add @Table annotation
- [x] Add all fields with proper @Column annotations
- [x] Manual getters/setters (no Lombok in this project)
- [x] Verify field types match database types
- [x] Ensure camelCase field names with snake_case @Column names

### 2.2 Create DTOs ✅
- [x] Create `com/dental/dto/MedicalHistoryDTO.java` (response)
- [x] Create `com/dental/dto/CreateMedicalHistoryRequest.java` (request)
- [x] Add validation annotations (@NotNull, @Size, etc.)
- [x] Ensure DTOs follow camelCase convention

### 2.3 Create Repository ✅
- [x] Create `com/dental/repository/MedicalHistoryRepository.java`
- [x] Extend `ReactiveCrudRepository<MedicalHistory, UUID>`
- [x] Add `findByTenantIdAndPatientIdAndDeletedAtIsNull` query with @Query annotation
- [x] Add `upsert` query with INSERT ... ON CONFLICT DO UPDATE
- [x] Test query syntax (no typos in field names)

### 2.4 Create Service ✅
- [x] Create `com/dental/service/MedicalHistoryService.java`
- [x] Add @Service annotation
- [x] Inject MedicalHistoryRepository
- [x] Implement `getByPatientId(String tenantId, UUID patientId): Mono<MedicalHistoryDTO>`
- [x] Implement `createOrUpdate(String tenantId, UUID patientId, CreateMedicalHistoryRequest): Mono<MedicalHistoryDTO>`
- [x] Implement `delete(String tenantId, UUID patientId): Mono<Void>` (soft delete)
- [x] Add toDTO mapping method

### 2.5 Create Controller ✅
- [x] Create `com/dental/controller/MedicalHistoryController.java`
- [x] Add @RestController annotation
- [x] Add @RequestMapping("/api/patients/{patientId}/medical-history")
- [x] Implement GET endpoint (retrieve medical history)
- [x] Implement POST endpoint (create or update)
- [x] Implement DELETE endpoint (soft delete)
- [x] Add @PathVariable for patientId
- [x] Add @RequestBody @Valid for POST
- [x] Handle 404 Not Found gracefully (returns 404 with empty body)
- [x] Extract tenantId from TenantContext.getTenantId()

### 2.6 Test Backend 🔜 PENDING
- [ ] Start backend: `cd backend && .\run-backend.ps1`
- [ ] Verify application starts without errors
- [ ] Check logs for bean initialization
- [ ] Test GET endpoint (should return 404 initially)
- [ ] Test POST endpoint (create new record)
- [ ] Test GET endpoint again (should return 200 with data)
- [ ] Test POST endpoint again (should update existing record)
- [ ] Verify multi-tenancy (use different JWT tokens)
- [ ] Test soft delete endpoint

---

## Phase 3: Frontend Development ✅ COMPLETED

### 3.1 Create Types ✅
- [x] Create `frontend/src/types/medicalHistory.types.ts`
- [x] Define `MedicalHistory` interface (30+ fields)
- [x] Define `CreateMedicalHistoryDTO` interface
- [x] Ensure field names match backend DTOs (camelCase)

### 3.2 Create Service ✅
- [x] Create `frontend/src/services/medicalHistoryService.ts`
- [x] Import api client from `./api.ts`
- [x] Implement `getByPatientId(patientId: string): Promise<MedicalHistory | null>`
- [x] Implement `createOrUpdate(patientId: string, data: CreateMedicalHistoryDTO): Promise<MedicalHistory>`
- [x] Implement `delete(patientId: string): Promise<void>`
- [x] Handle 404 errors gracefully (return null)
- [x] Add proper TypeScript types

### 3.3 Create Patient Detail Page ✅
- [x] Create `frontend/src/pages/patients/PatientDetailPage.tsx`
- [x] Add useParams hook to get patientId from URL
- [x] Add useNavigate hook for back navigation
- [x] Load patient data on mount
- [x] Implement tab state management (historia, odontograma, ortodoncia)
- [x] Render tab navigation UI
- [x] Render active tab content
- [x] Add back button to return to patient list
- [x] Add loading state
- [x] Add error handling

### 3.4 Create Medical History Tab Component ✅
- [x] Create `frontend/src/pages/patients/MedicalHistoryTab.tsx`
- [x] Accept patientId prop
- [x] Load medical history data on mount
- [x] Initialize form state (empty or populated)
- [x] Create form sections:
  - [x] Antecedentes familiares (textarea)
  - [x] Antecedentes personales (textarea)
  - [x] Condiciones médicas (9 checkboxes: presión alta/baja, hepatitis, gastritis, úlceras, VIH, diabetes, asma, fuma)
  - [x] Enfermedades sanguíneas (checkbox + detail text)
  - [x] Problemas cardíacos (checkbox + detail text)
  - [x] Otra enfermedad (checkbox + detail text)
  - [x] Cepillado diario (number + detail text)
  - [x] Sangrado de encías (checkbox + detail text)
  - [x] Hemorragias anormales (checkbox + detail text)
  - [x] Rechinar/apretar dientes (checkbox + detail text)
  - [x] Otras molestias en boca (checkbox + detail text)
  - [x] Alergias (checkbox + detail text)
  - [x] Operación reciente (checkbox + detail text)
  - [x] Medicación permanente (checkbox + detail text)
  - [x] Comentario adicional (textarea)
- [x] Implement controlled inputs (useState)
- [x] Add form submission handler
- [x] Call medicalHistoryService.createOrUpdate
- [x] Show success/error alerts
- [x] Add loading state during save
- [x] Add "Guardar" button
- [x] Style form with Tailwind CSS (match existing design)
- [x] Ensure responsive layout (mobile, tablet, desktop)
- [x] Place text areas strategically for better field distribution

### 3.5 Create Placeholder Tabs ✅
- [x] Placeholder content in PatientDetailPage for Odontograma
- [x] Placeholder content in PatientDetailPage for Ortodoncia
- [x] Display "Próximamente..." message

### 3.6 Update Patient List Page ✅
- [x] Open `frontend/src/pages/patients/PatientsPage.tsx`
- [x] Import useNavigate hook
- [x] Add "Ver Detalle" button in table row (before "Editar")
- [x] Style button: `text-green-600 hover:text-green-900`
- [x] Add onClick handler: `navigate(\`/patients/${patient.id}/detail\`)`
- [x] Verify table layout doesn't break

### 3.7 Update Router ✅
- [ ] Open `frontend/src/App.tsx`
- [ ] Import PatientDetailPage component
- [x] Open `frontend/src/App.tsx`
- [x] Import PatientDetailPage component
- [x] Add route: `/patients/:patientId/detail`
- [x] Wrap in ProtectedRoute
- [x] Verify route order (specific routes before general)

### 3.8 Test Frontend 🔜 PENDING
- [ ] Start frontend: `cd frontend && npm run dev`
- [ ] Verify application starts without errors
- [ ] Login with test user
- [ ] Navigate to Patients page
- [ ] Verify "Ver Detalle" button appears in table
- [ ] Click "Ver Detalle" for a patient
- [ ] Verify navigation to patient detail page
- [ ] Verify tabs render correctly
- [ ] Verify "Historia Clínica" tab is active by default
- [ ] Verify form loads (empty or with data)
- [ ] Fill out form fields
- [ ] Click "Guardar"
- [ ] Verify success message
- [ ] Refresh page
- [ ] Verify data persists
- [ ] Test responsive design (resize browser)
- [ ] Test with different patients
- [ ] Test back navigation

---

## Phase 4: Integration Testing 🔜 PENDING

### 4.1 Database Migration ⚠️ ACTION REQUIRED
- [ ] Start PostgreSQL in Docker (if not running)
- [ ] Apply migration using one of these methods:
  ```bash
  # Option 1: From PowerShell/WSL
  wsl docker exec -i dental-saas-postgres psql -U postgres -d dental_saas < docker/postgres/migrations/001_add_medical_history.sql
  
  # Option 2: Direct execution
  docker exec -i dental-saas-postgres psql -U postgres -d dental_saas -f /docker-entrypoint-initdb.d/migrations/001_add_medical_history.sql
  ```
- [ ] Verify table creation: `\d medical_history`
- [ ] Verify indexes: `\di medical_history*`

### 4.2 End-to-End Testing
- [ ] Start PostgreSQL in Docker
- [ ] Start backend application
- [ ] Start frontend application
- [ ] Login as admin@clinicaabc.com / password123
- [ ] Navigate to Patients page
- [ ] Click "Ver Detalle" for patient "Pedro García"
- [ ] Fill out complete medical history form
- [ ] Save form
- [ ] Verify success message
- [ ] Navigate back to patient list
- [ ] Click "Ver Detalle" again
- [ ] Verify data is loaded correctly
- [ ] Update some fields
- [ ] Save again
- [ ] Verify update worked (check timestamps)

### 4.2 Multi-Tenancy Testing
- [ ] Logout
- [ ] Login as admin@dentalcare.com / password123 (different tenant)
- [ ] Navigate to Patients page
- [ ] Click "Ver Detalle" for a patient
- [ ] Fill out medical history
- [ ] Save
- [ ] Logout
- [ ] Login as admin@clinicaabc.com again (first tenant)
- [ ] Verify you cannot see the other tenant's medical history
- [ ] Verify your own tenant's data is intact

### 4.3 Edge Case Testing
- [ ] Test with patient that has no medical history (should show empty form)
- [ ] Test saving with all fields empty (should work)
- [ ] Test saving with all fields filled (should work)
- [ ] Test very long text in text areas (should not break)
- [ ] Test special characters in text fields (quotes, apostrophes, etc.)
- [ ] Test concurrent saves (two users editing same patient)
- [ ] Test network error handling (disconnect network during save)
- [ ] Test invalid JWT token (should redirect to login)

---

## Phase 5: Code Quality & Documentation

### 5.1 Code Review
- [ ] Review all backend code for best practices
- [ ] Review all frontend code for best practices
- [ ] Check for console.log statements (remove debugging logs)
- [ ] Check for commented-out code (remove)
- [ ] Verify proper error handling everywhere
- [ ] Verify proper TypeScript types (no `any`)
- [ ] Verify Lombok annotations used correctly
- [ ] Verify reactive patterns (no blocking calls)

### 5.2 Code Formatting
- [ ] Format backend code (IntelliJ: Ctrl+Alt+L)
- [ ] Format frontend code (Prettier)
- [ ] Ensure consistent indentation
- [ ] Ensure consistent naming conventions

### 5.3 Performance Check
- [ ] Check database query performance (EXPLAIN)
- [ ] Check frontend bundle size (no significant increase)
- [ ] Check page load time
- [ ] Check form responsiveness (no lag)

### 5.4 Security Review
- [ ] Verify all backend endpoints check tenantId
- [ ] Verify JWT authentication on all endpoints
- [ ] Verify no SQL injection vulnerabilities
- [ ] Verify no XSS vulnerabilities
- [ ] Verify sensitive data not logged

---

## Phase 6: Finalization

### 6.1 Clean Up
- [ ] Remove .gitkeep file from change folder
- [ ] Remove unused imports
- [ ] Remove debug console.logs
- [ ] Update any TODO comments

### 6.2 Validation
- [ ] All tasks above are checked off
- [ ] No errors in browser console
- [ ] No errors in backend logs
- [ ] Application runs smoothly end-to-end
- [ ] All requirements from specs are implemented
- [ ] All scenarios from specs are tested

### 6.3 Prepare for Archive
- [ ] Review proposal.md (update if needed)
- [ ] Review specs (update if deviated from plan)
- [ ] Review design.md (update if architecture changed)
- [ ] This tasks.md file is complete and accurate

---

## Ready for /opsx:archive

Once all checkboxes above are complete, run:
```
/opsx:archive
```

This will:
1. Move change to `openspec/changes/archive/2026-03-10-add-patient-medical-history/`
2. Merge delta specs into `openspec/specs/patient/`
3. Update the source of truth

---

## Notes & Deviations

_Document any deviations from the original plan here:_

- 

---

## Estimated Time

- Phase 1 (Database): 30 minutes
- Phase 2 (Backend): 2 hours
- Phase 3 (Frontend): 3 hours
- Phase 4 (Testing): 1 hour
- Phase 5 (Quality): 30 minutes
- Phase 6 (Finalization): 30 minutes
- **Total**: ~7.5 hours

---

## Risks Encountered

_Document any risks or issues encountered during implementation:_

-
