# Technical Design: Patient Medical History

**Change**: add-patient-medical-history  
**Date**: 2026-03-10  
**Status**: Ready for Implementation

---

## Architecture Overview

```
Frontend (React)           Backend (Spring WebFlux)        Database (PostgreSQL)
┌──────────────────┐      ┌─────────────────────────┐     ┌──────────────────┐
│ PatientsPage     │      │                         │     │                  │
│  └─ "Ver Detalle"│──┐   │                         │     │  patients        │
└──────────────────┘  │   │                         │     │  medical_history │
                      │   │                         │     │                  │
┌──────────────────┐  │   │  MedicalHistoryController│    └──────────────────┘
│PatientDetailPage │◄─┘   │         ↓               │            ▲
│  ├─ Tabs         │───GET/POST─→ MedicalHistoryService│       │
│  └─ MedicalHistory│      │         ↓               │            │
│     Form         │◄─────────MedicalHistoryRepository├─────R2DBC─┘
└──────────────────┘      │                         │
       │                  │                         │
       ▼                  └─────────────────────────┘
medicalHistoryService
```

---

## Database Design

### Schema: medical_history

```sql
CREATE TABLE medical_history (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Multi-tenancy
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    
    -- Background History (Text Fields)
    family_history TEXT,
    personal_history TEXT,
    additional_comments TEXT,
    
    -- Medical Conditions (Boolean)
    high_blood_pressure BOOLEAN DEFAULT false,
    low_blood_pressure BOOLEAN DEFAULT false,
    hepatitis BOOLEAN DEFAULT false,
    gastritis BOOLEAN DEFAULT false,
    ulcers BOOLEAN DEFAULT false,
    hiv BOOLEAN DEFAULT false,
    diabetes BOOLEAN DEFAULT false,
    asthma BOOLEAN DEFAULT false,
    smoker BOOLEAN DEFAULT false,
    
    -- Conditions with Details (Boolean + Text)
    blood_diseases BOOLEAN DEFAULT false,
    blood_diseases_detail TEXT,
    cardiac_problems BOOLEAN DEFAULT false,
    cardiac_problems_detail TEXT,
    other_disease BOOLEAN DEFAULT false,
    other_disease_detail TEXT,
    
    -- Dental Habits
    daily_brushing INTEGER,
    daily_brushing_detail TEXT,
    bleeding_gums BOOLEAN DEFAULT false,
    bleeding_gums_detail TEXT,
    abnormal_bleeding BOOLEAN DEFAULT false,
    abnormal_bleeding_detail TEXT,
    teeth_grinding BOOLEAN DEFAULT false,
    teeth_grinding_detail TEXT,
    mouth_discomfort BOOLEAN DEFAULT false,
    mouth_discomfort_detail TEXT,
    
    -- Allergies & Medications
    allergies BOOLEAN DEFAULT false,
    allergies_detail TEXT,
    recent_surgery BOOLEAN DEFAULT false,
    recent_surgery_detail TEXT,
    permanent_medication BOOLEAN DEFAULT false,
    permanent_medication_detail TEXT,
    
    -- Timestamps & Soft Delete
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_medical_history_tenant ON medical_history(tenant_id);
CREATE INDEX idx_medical_history_patient ON medical_history(tenant_id, patient_id) 
    WHERE deleted_at IS NULL;

-- Unique Constraint: One active medical history per patient
CREATE UNIQUE INDEX idx_medical_history_unique_patient 
    ON medical_history(tenant_id, patient_id) 
    WHERE deleted_at IS NULL;
```

### Design Decisions

1. **Boolean vs Enum**: Use boolean for yes/no questions (simpler queries)
2. **Separate Detail Fields**: Keep detail text separate from boolean flags
3. **TEXT vs VARCHAR**: Use TEXT for open-ended responses (no arbitrary limits)
4. **INTEGER for brushing**: Daily brushing frequency is numeric
5. **Unique Constraint**: Prevents duplicate active records per patient

---

## Backend Design (Spring Boot WebFlux + R2DBC)

### Package Structure

```
com.dentalclinic.backend
├── entity
│   └── MedicalHistory.java
├── repository
│   └── MedicalHistoryRepository.java
├── service
│   └── MedicalHistoryService.java
├── controller
│   └── MedicalHistoryController.java
└── dto
    ├── MedicalHistoryDTO.java
    ├── CreateMedicalHistoryDTO.java
    └── UpdateMedicalHistoryDTO.java
```

### Entity: MedicalHistory.java

```java
@Table("medical_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicalHistory {
    @Id
    private UUID id;
    
    @Column("tenant_id")
    private UUID tenantId;
    
    @Column("patient_id")
    private UUID patientId;
    
    // Background
    @Column("family_history")
    private String familyHistory;
    
    @Column("personal_history")
    private String personalHistory;
    
    @Column("additional_comments")
    private String additionalComments;
    
    // Medical Conditions (20+ boolean fields)
    @Column("high_blood_pressure")
    private Boolean highBloodPressure;
    
    // ... (all other fields following camelCase convention)
    
    // Timestamps
    @Column("created_at")
    private LocalDateTime createdAt;
    
    @Column("updated_at")
    private LocalDateTime updatedAt;
    
    @Column("deleted_at")
    private LocalDateTime deletedAt;
}
```

### Repository: MedicalHistoryRepository.java

```java
public interface MedicalHistoryRepository extends R2dbcRepository<MedicalHistory, UUID> {
    
    @Query("""
        SELECT * FROM medical_history 
        WHERE tenant_id = :tenantId 
        AND patient_id = :patientId 
        AND deleted_at IS NULL
        """)
    Mono<MedicalHistory> findByTenantIdAndPatientId(UUID tenantId, UUID patientId);
    
    @Query("""
        INSERT INTO medical_history (
            id, tenant_id, patient_id, family_history, personal_history,
            high_blood_pressure, low_blood_pressure, hepatitis, gastritis,
            ulcers, hiv, diabetes, asthma, smoker,
            blood_diseases, blood_diseases_detail,
            cardiac_problems, cardiac_problems_detail,
            other_disease, other_disease_detail,
            daily_brushing, daily_brushing_detail,
            bleeding_gums, bleeding_gums_detail,
            abnormal_bleeding, abnormal_bleeding_detail,
            teeth_grinding, teeth_grinding_detail,
            mouth_discomfort, mouth_discomfort_detail,
            allergies, allergies_detail,
            recent_surgery, recent_surgery_detail,
            permanent_medication, permanent_medication_detail,
            additional_comments, created_at, updated_at
        ) VALUES (
            :#{#history.id}, :#{#history.tenantId}, :#{#history.patientId},
            :#{#history.familyHistory}, :#{#history.personalHistory},
            -- ... all other fields ...
            NOW(), NOW()
        )
        ON CONFLICT (tenant_id, patient_id) WHERE deleted_at IS NULL
        DO UPDATE SET
            family_history = EXCLUDED.family_history,
            personal_history = EXCLUDED.personal_history,
            -- ... all other fields ...
            updated_at = NOW()
        RETURNING *
        """)
    Mono<MedicalHistory> upsert(MedicalHistory history);
}
```

**Note**: R2DBC doesn't support derived methods well. Use explicit @Query.

### Service: MedicalHistoryService.java

```java
@Service
@Slf4j
public class MedicalHistoryService {
    
    private final MedicalHistoryRepository repository;
    private final TenantContext tenantContext;
    
    public Mono<MedicalHistory> getByPatientId(UUID patientId) {
        UUID tenantId = tenantContext.getTenantId();
        return repository.findByTenantIdAndPatientId(tenantId, patientId)
            .doOnSuccess(history -> log.info("Retrieved medical history for patient: {}", patientId))
            .switchIfEmpty(Mono.error(new NotFoundException("Medical history not found")));
    }
    
    public Mono<MedicalHistory> createOrUpdate(UUID patientId, CreateMedicalHistoryDTO dto) {
        UUID tenantId = tenantContext.getTenantId();
        
        MedicalHistory history = new MedicalHistory();
        history.setId(UUID.randomUUID());
        history.setTenantId(tenantId);
        history.setPatientId(patientId);
        // Map all fields from DTO
        mapDtoToEntity(dto, history);
        
        return repository.upsert(history)
            .doOnSuccess(saved -> log.info("Saved medical history for patient: {}", patientId));
    }
    
    public Mono<Void> delete(UUID patientId) {
        UUID tenantId = tenantContext.getTenantId();
        return repository.findByTenantIdAndPatientId(tenantId, patientId)
            .flatMap(history -> {
                history.setDeletedAt(LocalDateTime.now());
                return repository.save(history);
            })
            .then();
    }
    
    private void mapDtoToEntity(CreateMedicalHistoryDTO dto, MedicalHistory entity) {
        // Map all 30+ fields from DTO to entity
        entity.setFamilyHistory(dto.getFamilyHistory());
        entity.setPersonalHistory(dto.getPersonalHistory());
        // ... etc
    }
}
```

### Controller: MedicalHistoryController.java

```java
@RestController
@RequestMapping("/api/patients/{patientId}/medical-history")
@Slf4j
public class MedicalHistoryController {
    
    private final MedicalHistoryService service;
    
    @GetMapping
    public Mono<ResponseEntity<MedicalHistoryDTO>> get(@PathVariable UUID patientId) {
        return service.getByPatientId(patientId)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .onErrorResume(NotFoundException.class, e -> Mono.just(ResponseEntity.notFound().build()));
    }
    
    @PostMapping
    public Mono<ResponseEntity<MedicalHistoryDTO>> createOrUpdate(
            @PathVariable UUID patientId,
            @RequestBody @Valid CreateMedicalHistoryDTO dto) {
        
        return service.createOrUpdate(patientId, dto)
            .map(this::toDTO)
            .map(ResponseEntity::ok);
    }
    
    @DeleteMapping
    public Mono<ResponseEntity<Void>> delete(@PathVariable UUID patientId) {
        return service.delete(patientId)
            .then(Mono.just(ResponseEntity.noContent().<Void>build()));
    }
    
    private MedicalHistoryDTO toDTO(MedicalHistory entity) {
        // Map entity to DTO
    }
}
```

### DTOs

All DTOs follow the pattern:
- Use camelCase field names (JavaScript/TypeScript convention)
- Include validation annotations (@NotNull, @Size, etc.)
- Separate Create/Update/Response DTOs if needed

---

## Frontend Design (React + TypeScript)

### Component Structure

```
frontend/src
├── pages/
│   └── patients/
│       ├── PatientsPage.tsx (MODIFIED - add "Ver Detalle" button)
│       ├── PatientDetailPage.tsx (NEW)
│       └── PatientModal.tsx (existing)
├── components/
│   └── patients/
│       ├── MedicalHistoryTab.tsx (NEW)
│       ├── OdontogramTab.tsx (NEW - placeholder)
│       └── OrthodonticsTab.tsx (NEW - placeholder)
├── services/
│   └── medicalHistoryService.ts (NEW)
└── types/
    └── medicalHistory.types.ts (NEW)
```

### Types: medicalHistory.types.ts

```typescript
export interface MedicalHistory {
  id: string;
  patientId: string;
  
  // Background
  familyHistory?: string;
  personalHistory?: string;
  additionalComments?: string;
  
  // Medical Conditions
  highBloodPressure: boolean;
  lowBloodPressure: boolean;
  hepatitis: boolean;
  gastritis: boolean;
  ulcers: boolean;
  hiv: boolean;
  diabetes: boolean;
  asthma: boolean;
  smoker: boolean;
  
  // Conditions with Details
  bloodDiseases: boolean;
  bloodDiseasesDetail?: string;
  cardiacProblems: boolean;
  cardiacProblemsDetail?: string;
  otherDisease: boolean;
  otherDiseaseDetail?: string;
  
  // Dental Habits
  dailyBrushing?: number;
  dailyBrushingDetail?: string;
  bleedingGums: boolean;
  bleedingGumsDetail?: string;
  abnormalBleeding: boolean;
  abnormalBleedingDetail?: string;
  teethGrinding: boolean;
  teethGrindingDetail?: string;
  mouthDiscomfort: boolean;
  mouthDiscomfortDetail?: string;
  
  // Allergies & Medications
  allergies: boolean;
  allergiesDetail?: string;
  recentSurgery: boolean;
  recentSurgeryDetail?: string;
  permanentMedication: boolean;
  permanentMedicationDetail?: string;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMedicalHistoryDTO extends Omit<MedicalHistory, 'id' | 'createdAt' | 'updatedAt'> {}
```

### Service: medicalHistoryService.ts

```typescript
import api from './api';
import { MedicalHistory, CreateMedicalHistoryDTO } from '../types/medicalHistory.types';

export const medicalHistoryService = {
  async getByPatientId(patientId: string): Promise<MedicalHistory | null> {
    try {
      const response = await api.get(`/api/patients/${patientId}/medical-history`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No medical history yet
      }
      throw error;
    }
  },
  
  async createOrUpdate(patientId: string, data: CreateMedicalHistoryDTO): Promise<MedicalHistory> {
    const response = await api.post(`/api/patients/${patientId}/medical-history`, data);
    return response.data;
  },
  
  async delete(patientId: string): Promise<void> {
    await api.delete(`/api/patients/${patientId}/medical-history`);
  }
};
```

### Page: PatientDetailPage.tsx

```typescript
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientService } from '../../services/patientService';
import { Patient } from '../../types/patient.types';
import MedicalHistoryTab from '../../components/patients/MedicalHistoryTab';

const PatientDetailPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<'historia' | 'odontograma' | 'ortodoncia'>('historia');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadPatient();
  }, [patientId]);
  
  const loadPatient = async () => {
    // Load patient info
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <button onClick={() => navigate('/patients')} className="text-blue-600 hover:text-blue-800 mb-2">
                ← Volver a Pacientes
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {patient?.firstName} {patient?.lastName}
              </h1>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-t-lg border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('historia')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'historia'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Historia Clínica
            </button>
            <button
              onClick={() => setActiveTab('odontograma')}
              className="py-4 px-1 border-b-2 border-transparent text-gray-400 font-medium text-sm cursor-not-allowed"
              disabled
            >
              Odontograma
            </button>
            <button
              onClick={() => setActiveTab('ortodoncia')}
              className="py-4 px-1 border-b-2 border-transparent text-gray-400 font-medium text-sm cursor-not-allowed"
              disabled
            >
              Ortodoncia
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="bg-white rounded-b-lg shadow-lg p-6">
          {activeTab === 'historia' && <MedicalHistoryTab patientId={patientId!} />}
          {activeTab === 'odontograma' && <div className="text-gray-500">Próximamente...</div>}
          {activeTab === 'ortodoncia' && <div className="text-gray-500">Próximamente...</div>}
        </div>
      </main>
    </div>
  );
};

export default PatientDetailPage;
```

### Component: MedicalHistoryTab.tsx

Form with sections:
1. **Antecedentes** (2 text areas at top)
2. **Condiciones Médicas** (9 checkboxes)
3. **Condiciones con Detalle** (3 Yes/No + text field pairs)
4. **Hábitos Dentales** (5 questions with Yes/No + details)
5. **Alergias y Medicamentos** (3 Yes/No + text field pairs)
6. **Comentario Adicional** (1 text area at bottom)

Form Layout Strategy:
- Use CSS Grid (3 columns on desktop, 1 on mobile)
- Group related fields visually with borders/backgrounds
- Place text areas (family, personal, additional comments) at strategic positions for balance
- Save button at bottom right

---

## Integration Points

### PatientsPage.tsx Modifications

Add "Ver Detalle" button in table row:

```typescript
<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
  <button
    onClick={() => navigate(`/patients/${patient.id}/detail`)}
    className="text-green-600 hover:text-green-900 mr-4"
  >
    Ver Detalle
  </button>
  <button
    onClick={() => handleEdit(patient)}
    className="text-blue-600 hover:text-blue-900 mr-4"
  >
    Editar
  </button>
  <button
    onClick={() => handleDelete(patient)}
    className="text-red-600 hover:text-red-900"
  >
    Eliminar
  </button>
</td>
```

### App.tsx Route Addition

```typescript
{
  path: '/patients/:patientId/detail',
  element: (
    <ProtectedRoute>
      <PatientDetailPage />
    </ProtectedRoute>
  ),
}
```

---

## Data Flow

### Load Medical History
```
User clicks "Ver Detalle" 
  → Navigate to /patients/:id/detail
  → PatientDetailPage loads
  → MedicalHistoryTab mounts
  → GET /api/patients/:id/medical-history
  → Display form (empty if 404, populated if 200)
```

### Save Medical History
```
User fills form and clicks "Guardar"
  → Validate form data
  → POST /api/patients/:id/medical-history
  → Backend performs UPSERT
  → Return saved data
  → Show success message
  → Update form with saved data (including timestamps)
```

---

## Error Handling

### Backend
- 404 Not Found: Medical history doesn't exist (expected on first load)
- 400 Bad Request: Invalid data format
- 401 Unauthorized: Token missing/invalid
- 403 Forbidden: User cannot access this patient (wrong tenant)
- 500 Internal Server Error: Database/server issues

### Frontend
- Network errors: Show "Error de conexión" message
- 404 on GET: Initialize empty form (not an error)
- 400 on POST: Show validation errors
- Other errors: Show generic "Error al guardar" message

---

## Testing Strategy

### Database
- Verify unique constraint works (one record per patient)
- Verify tenant isolation (query filtering)
- Verify soft delete (deleted_at timestamp)

### Backend
- Unit tests for service methods
- Integration tests for repository queries
- Controller tests for API endpoints
- Test UPSERT behavior (create vs. update)

### Frontend
- Component rendering tests
- Form validation tests
- API integration tests
- Navigation tests

---

## Performance Considerations

1. **Single Query**: Fetch medical history in one query (all fields)
2. **No N+1**: Patient load is separate, medical history is separate
3. **Indexes**: Proper indexes on tenant_id + patient_id
4. **Form Optimization**: Use controlled inputs with debouncing if needed
5. **Lazy Loading**: Tabs load content only when activated

---

## Security Considerations

1. **Multi-Tenancy**: All queries filtered by tenant_id from JWT
2. **Authentication**: Endpoints protected by JWT filter
3. **Authorization**: Verify user belongs to same tenant as patient
4. **Input Validation**: Sanitize all user inputs
5. **SQL Injection**: Use parameterized queries (@Query with named params)
6. **XSS Prevention**: React escapes by default, but be careful with dangerouslySetInnerHTML

---

## Deployment Steps

1. **Database**: Apply SQL migration manually to Docker container
2. **Backend**: Build and restart Spring Boot application
3. **Frontend**: No build needed (dev mode), just refresh
4. **Verification**: Test complete workflow end-to-end

---

## Rollback Plan

1. If backend fails: Revert to previous Docker image
2. If database fails: Drop medical_history table (no data loss)
3. If frontend fails: Revert Git commit
4. No breaking changes to existing features

---

## Maintenance Notes

- Medical history table will grow over time (one record per patient)
- Consider archiving deleted records after 7 years (legal retention)
- Monitor query performance as data grows
- Consider adding full-text search on text fields in future

