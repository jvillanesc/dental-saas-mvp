# Proposal: Patient Medical History Management

**Created**: 2026-03-10  
**Status**: In Progress  
**Change ID**: add-patient-medical-history

## Why

Currently, the dental clinic system lacks the ability to store and manage comprehensive medical history for patients. Medical history is critical for:
- Safe treatment planning (identifying allergies, medical conditions)
- Legal compliance and documentation
- Better patient care through understanding health background
- Risk assessment before procedures

Dentists need quick access to patient medical information when providing treatment.

## What

Add a comprehensive medical history management feature:

1. **Patient Detail Page**
   - Accessible via "Ver Detalle" button in patient grid
   - Tab-based interface (Historia Clínica, Odontograma, Ortodoncia)
   - Initially implement only "Historia Clínica" tab

2. **Medical History Form**
   - Family and personal medical history (text fields)
   - Medical conditions checklist (pressure, diabetes, hepatitis, etc.)
   - Dental habits (brushing frequency, bleeding gums, grinding)
   - Allergies and medications
   - Surgical history
   - Additional conditions with detail fields

3. **Data Persistence**
   - New `medical_history` table in PostgreSQL
   - UPSERT functionality (create or update single record per patient)
   - Multi-tenant isolation
   - Soft delete support

## Scope

### In Scope
- Database schema for medical history
- Backend REST API (CRUD operations)
- Patient detail page with tab navigation
- Medical history form (full implementation)
- Integration with existing patient list
- "Ver Detalle" button in patient grid

### Out of Scope (Future Iterations)
- Odontograma tab (dental chart)
- Ortodoncia tab (orthodontics)
- File attachments (X-rays, documents)
- Medical history versioning/audit trail
- Printing/PDF export

## Approach

### Database
- Single table `medical_history` with one-to-one relationship to `patient`
- Unique constraint: one active medical history per patient per tenant
- Boolean fields for yes/no conditions
- TEXT fields for detailed information
- Follows existing patterns (tenant_id, soft delete)

### Backend (Spring Boot WebFlux + R2DBC)
- New entity: `MedicalHistory`
- New R2DBC repository with @Query methods
- Service layer with reactive operations (Mono/Flux)
- REST controller `/api/patients/{patientId}/medical-history`
- DTOs for create/update/response

### Frontend (React + TypeScript)
- New route: `/patients/:patientId/detail`
- New components:
  - `PatientDetailPage` (main container with tabs)
  - `MedicalHistoryTab` (form component)
- New service: `medicalHistoryService`
- Form with controlled inputs and validation
- Maintain existing design system (Tailwind CSS)

### Integration
- Add "Ver Detalle" button to patient table in `PatientsPage`
- Navigate to detail page with patient ID
- Preserve existing patient CRUD functionality

## Non-Goals

- No modifications to existing patient entity
- No changes to authentication/authorization
- No API versioning changes
- No breaking changes to existing endpoints

## Success Criteria

1. Dentists can access patient detail page from patient list
2. Medical history form displays all required fields per mockup
3. Form saves/updates correctly (UPSERT behavior)
4. Data persists across sessions
5. Multi-tenant isolation maintained
6. No visual regression in existing patient management
7. Responsive design maintained

## Timeline Estimate

- Database: 30 minutes
- Backend: 2 hours
- Frontend: 3 hours
- Testing: 1 hour
- **Total**: ~6-7 hours

## Dependencies

- Existing patient management system
- PostgreSQL database running in Docker/WSL
- Backend running on port 8080
- Frontend running in development mode

## Risks

- **Database migration**: Need to apply SQL manually to Docker container
- **Form complexity**: Many fields require careful layout and validation
- **State management**: UPSERT logic needs clear handling of new vs. existing records
- **Navigation**: Ensure back navigation doesn't lose patient list state

## Next Steps

1. Generate delta specs for requirements
2. Create technical design document
3. Generate implementation tasks
4. Execute implementation
5. Test and validate
6. Archive change and merge specs
