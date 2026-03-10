# Delta Spec: Patient Medical History

**Domain**: Patient Management  
**Change**: add-patient-medical-history  
**Date**: 2026-03-10

---

## ADDED Requirements

### Requirement: Medical History Data Model
The system SHALL store comprehensive medical history for each patient with the following information:
- Family medical history (free text)
- Personal medical history (free text)
- Medical conditions (boolean flags with optional details)
- Dental habits and behaviors
- Allergies and medications
- Surgical history

#### Scenario: Create medical history for new patient
- GIVEN a patient exists in the system
- AND the patient has no medical history record
- WHEN a user submits medical history information
- THEN the system creates a new medical history record
- AND associates it with the patient
- AND applies tenant isolation

#### Scenario: Update existing medical history
- GIVEN a patient has an existing medical history record
- WHEN a user submits updated medical history information
- THEN the system updates the existing record
- AND preserves the creation timestamp
- AND updates the modification timestamp

---

### Requirement: Medical History Data Persistence
The system MUST enforce the following data persistence rules:
- One active medical history record per patient per tenant
- Multi-tenant isolation on all queries
- Soft delete support (deleted_at timestamp)
- Automatic timestamp management (created_at, updated_at)

#### Scenario: Prevent duplicate medical history records
- GIVEN a patient already has an active medical history record
- WHEN a user attempts to create a new medical history record
- THEN the system updates the existing record instead
- AND does not create a duplicate

#### Scenario: Tenant isolation maintained
- GIVEN two patients with the same name in different tenants
- WHEN tenant A queries medical history
- THEN only tenant A's medical history records are returned
- AND tenant B's records are not visible

---

### Requirement: Medical History REST API
The system SHALL expose a REST API for medical history management:
- `GET /api/patients/{patientId}/medical-history` - Retrieve medical history
- `POST /api/patients/{patientId}/medical-history` - Create or update medical history
- `DELETE /api/patients/{patientId}/medical-history` - Soft delete medical history

#### Scenario: Retrieve existing medical history
- GIVEN a patient has medical history
- WHEN GET /api/patients/{patientId}/medical-history is called
- THEN the system returns 200 OK
- AND the response contains complete medical history data

#### Scenario: Retrieve non-existent medical history
- GIVEN a patient has no medical history
- WHEN GET /api/patients/{patientId}/medical-history is called
- THEN the system returns 404 Not Found

#### Scenario: Create or update medical history
- GIVEN valid medical history data
- WHEN POST /api/patients/{patientId}/medical-history is called
- THEN the system performs UPSERT operation
- AND returns 200 OK with updated data

---

### Requirement: Patient Detail Navigation
The system SHALL provide navigation from patient list to patient detail page:
- A "Ver Detalle" button in each patient row
- Clicking the button navigates to patient detail page
- Patient detail page displays patient information in context

#### Scenario: Access patient detail page
- GIVEN a user is viewing the patient list
- WHEN the user clicks "Ver Detalle" for a patient
- THEN the system navigates to /patients/{patientId}/detail
- AND displays the patient detail page
- AND preserves authentication context

---

### Requirement: Tab-Based Patient Detail Interface
The system SHALL display patient detail in a tabbed interface with:
- "Historia Clínica" tab (medical history)
- "Odontograma" tab (placeholder for future implementation)
- "Ortodoncia" tab (placeholder for future implementation)
- Only "Historia Clínica" tab initially functional

#### Scenario: Display medical history tab
- GIVEN a user is on the patient detail page
- WHEN the page loads
- THEN "Historia Clínica" tab is active by default
- AND the medical history form is displayed

#### Scenario: Navigate between tabs
- GIVEN a user is on the patient detail page
- WHEN the user clicks on a different tab
- THEN the corresponding tab content is displayed
- AND the previous tab content is hidden

---

### Requirement: Medical History Form Fields
The system SHALL provide a form with the following fields organized in sections:

**Antecedentes (Background)**
- Antecedentes familiares (text)
- Antecedentes personales (text)

**Condiciones Médicas (Medical Conditions) - Yes/No**
- Presión alta (High blood pressure)
- Presión baja (Low blood pressure)
- Hepatitis
- Gastritis
- Úlceras (Ulcers)
- VIH (HIV)
- Diabetes
- Asma (Asthma)
- ¿Fuma? (Smoker)

**Condiciones con Detalle (Conditions with Details) - Yes/No + Text**
- Enfermedades sanguíneas (Blood diseases)
- Problemas cardíacos (Cardiac problems)
- ¿Padece de alguna otra enfermedad? (Other disease)

**Hábitos Dentales (Dental Habits)**
- ¿Cuántas veces al día se cepilla los dientes? (number + text)
- ¿Le sangra las encías? (Bleeding gums - Yes/No + text)
- ¿Ha tenido hemorragias anormales después de una extracción? (Yes/No + text)
- ¿Hace rechinar o aprieta los dientes? (Teeth grinding - Yes/No + text)
- Otras molestias en la boca (Other mouth discomfort - Yes/No + text)

**Alergias y Medicamentos (Allergies and Medications)**
- Alergias (Yes/No + text)
- ¿Ha tenido alguna operación grande en los últimos años? (Recent surgery - Yes/No + text)
- ¿Toma alguna medicación de manera permanente? (Permanent medication - Yes/No + text)

**Comentario Adicional (Additional Comments)**
- Comentario adicional (text)

#### Scenario: Display empty form for new medical history
- GIVEN a patient has no medical history
- WHEN the user opens the medical history tab
- THEN all form fields are empty/unchecked
- AND the form is ready for input

#### Scenario: Display populated form for existing medical history
- GIVEN a patient has existing medical history
- WHEN the user opens the medical history tab
- THEN all form fields are populated with saved data
- AND the form is ready for editing

---

### Requirement: Medical History Form Submission
The system MUST handle form submission with the following behavior:
- Validate required fields (if any)
- Submit data to backend API
- Show success/error feedback
- Remain on the same page after save

#### Scenario: Successfully save medical history
- GIVEN a user has filled out the medical history form
- WHEN the user clicks "Guardar" (Save)
- THEN the system validates the form
- AND sends data to the backend
- AND displays success message
- AND updates the form with saved data

#### Scenario: Handle save error
- GIVEN a user submits the medical history form
- WHEN the backend returns an error
- THEN the system displays an error message
- AND preserves the user's form input
- AND allows the user to retry

---

### Requirement: Responsive Form Layout
The system SHOULD organize form fields for optimal user experience:
- Group related fields visually
- Place text fields at the end for better distribution
- Use clear labels in Spanish
- Maintain consistent spacing and alignment
- Support responsive design (mobile, tablet, desktop)

#### Scenario: Form displays correctly on desktop
- GIVEN a user accesses the form on desktop
- WHEN the medical history tab loads
- THEN all fields are properly aligned
- AND labels are clearly visible
- AND the form is easy to navigate

---

## MODIFIED Requirements

_None - This is a new feature with no modifications to existing requirements._

---

## REMOVED Requirements

_None - This is a new feature with no removals._

---

## Technical Notes

### Multi-Tenancy
All medical history operations MUST:
- Filter by tenant_id from JWT context
- Never expose data across tenants
- Include tenant_id in all database queries

### Reactive Patterns
All backend operations MUST:
- Use Mono&lt;MedicalHistory&gt; for single records
- Use Flux&lt;MedicalHistory&gt; if multiple records needed in future
- Never block threads
- Follow existing R2DBC patterns

### Data Validation
- Email format validation (if collecting in future extensions)
- Date format validation (if collecting dates)
- Text field length limits (prevent SQL injection, DoS)

### Security Considerations
- Medical data is sensitive (HIPAA-like considerations)
- Ensure proper authentication on all endpoints
- Log access to medical history for audit purposes
- Consider encryption at rest (future enhancement)

---

## Migration Path

1. Apply SQL migration to create `medical_history` table
2. Deploy backend with new endpoints
3. Deploy frontend with new components
4. No data migration needed (new feature)
5. No breaking changes to existing functionality

---

## Future Enhancements

- Odontograma (dental chart) implementation
- Ortodoncia (orthodontics) tracking
- File attachments for X-rays and documents
- Medical history version tracking
- PDF export for printing
- Medical history templates by specialty
- Integration with appointment notes
