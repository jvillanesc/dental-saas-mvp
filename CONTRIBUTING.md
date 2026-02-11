# Contributing to Dental SaaS MVP

Thank you for your interest in contributing! This project uses [OpenSpec](https://github.com/Fission-AI/OpenSpec) for specification-driven development.

## 🚀 Getting Started

1. **Read the documentation**
   - [`README.md`](README.md) - Project overview
   - [`openspec/project.md`](openspec/project.md) - Detailed specifications
   - [`openspec/WORKFLOW.md`](openspec/WORKFLOW.md) - Development workflow
   - [`openspec/config.yaml`](openspec/config.yaml) - Code conventions

2. **Set up your environment**
   ```bash
   # Start database
   cd docker && docker-compose up -d
   
   # Start backend
   cd backend && ./gradlew bootRun
   
   # Start frontend
   cd frontend && npm install && npm run dev
   ```

3. **Find an issue or feature**
   - Check existing issues
   - Review `openspec/specs/` for planned features
   - Propose new features via issues first

## 📋 Development Workflow

### For New Features

```bash
# 1. Create a feature branch
git checkout -b feature/your-feature-name

# 2. Read relevant specifications
# Check openspec/specs/[domain]/ for existing specs

# 3. Implement following conventions
# See openspec/config.yaml for:
# - Multi-tenancy rules
# - Security patterns
# - Code style
# - Testing requirements

# 4. Test your changes
cd backend && ./gradlew test
cd frontend && npm run build

# 5. Commit with conventional commits
git commit -m "feat(patients): add search by phone number"

# 6. Push and create PR
git push origin feature/your-feature-name
```

### For Bug Fixes

```bash
git checkout -b fix/issue-description
# Fix the bug
git commit -m "fix(auth): resolve JWT token expiration issue"
git push origin fix/issue-description
```

## 💻 Code Conventions

### Backend (Java/Spring Boot)

**Multi-Tenancy** (CRITICAL):
```java
// ✅ ALWAYS filter by tenantId
public Flux<Patient> findAllByTenantId(Long tenantId) {
    return repository.findAllByTenantIdAndDeletedAtIsNull(tenantId);
}

// ❌ NEVER query without tenant filtering
public Flux<Patient> findAll() {
    return repository.findAll(); // Security risk!
}
```

**Soft Delete**:
```java
// ✅ Use deletedAt timestamp
public Mono<Void> softDelete(Long id, Long tenantId) {
    return repository.findByIdAndTenantId(id, tenantId)
        .flatMap(entity -> {
            entity.setDeletedAt(LocalDateTime.now());
            return repository.save(entity);
        })
        .then();
}

// ❌ Don't hard delete
public Mono<Void> delete(Long id) {
    return repository.deleteById(id); // Data loss!
}
```

**Reactive Programming**:
```java
// ✅ Return Mono/Flux
public Mono<Patient> createPatient(PatientDTO dto, Long tenantId) {
    Patient patient = new Patient();
    patient.setTenantId(tenantId);
    // ... set other fields
    return repository.save(patient);
}

// ❌ Don't block
public Patient createPatient(PatientDTO dto) {
    return repository.save(patient).block(); // Defeats reactive purpose!
}
```

**Naming Conventions**:
- Controllers: `*Controller` (e.g., `PatientController`)
- Services: `*Service` and `*ServiceImpl`
- Repositories: `*Repository`
- DTOs: `*DTO`, `*Request`, `*Response`
- Entities: Plain nouns (e.g., `Patient`, `User`)

### Frontend (React/TypeScript)

**Component Structure**:
```typescript
// ✅ Functional components with TypeScript
interface PatientListProps {
  tenantId: number;
}

export const PatientList: React.FC<PatientListProps> = ({ tenantId }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  
  // Component logic
  
  return (
    // JSX
  );
};

// ❌ Class components (unless necessary)
export class PatientList extends React.Component { ... }
```

**API Services**:
```typescript
// ✅ Centralized service with proper typing
export const patientService = {
  async getAll(): Promise<Patient[]> {
    const response = await api.get<Patient[]>('/patients');
    return response.data;
  }
};

// ❌ Inline fetch calls
fetch('/api/patients').then(r => r.json()).then(data => ...);
```

**Naming Conventions**:
- Components: PascalCase (`PatientList.tsx`)
- Hooks: camelCase starting with `use` (`useAuth.tsx`)
- Types: PascalCase (`patient.types.ts`)
- Services: camelCase (`patientService.ts`)

## 🧪 Testing Requirements

### Backend Tests

All services and repositories must have tests:

```java
@Test
void testCreatePatient_WithValidData_Success() {
    // Given
    PatientDTO dto = createValidPatientDTO();
    Long tenantId = 1L;
    
    // When
    Mono<Patient> result = service.createPatient(dto, tenantId);
    
    // Then
    StepVerifier.create(result)
        .assertNext(patient -> {
            assertNotNull(patient.getId());
            assertEquals(tenantId, patient.getTenantId());
        })
        .verifyComplete();
}

@Test
void testFindAll_OnlyReturnsTenantData() {
    // Test tenant isolation
}
```

### Frontend Tests

Add tests for critical components (when test suite is set up):
```typescript
describe('PatientList', () => {
  it('should fetch and display patients', async () => {
    // Test implementation
  });
  
  it('should handle errors gracefully', async () => {
    // Test error handling
  });
});
```

## 📝 Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples**:
```bash
feat(patients): add search by phone number
fix(auth): resolve JWT token expiration issue
docs(readme): update setup instructions
refactor(appointments): simplify date validation logic
test(users): add tests for password change
chore(deps): update Spring Boot to 3.2.2
```

## 🔍 Code Review Process

### Before Submitting PR

- [ ] Code follows project conventions
- [ ] Multi-tenancy rules respected
- [ ] Tests added/updated
- [ ] Backend tests pass: `./gradlew test`
- [ ] Frontend builds: `npm run build`
- [ ] No `console.log` or debug statements
- [ ] Specification updated (if applicable)
- [ ] CHANGELOG updated (for significant changes)

### PR Template

When creating a PR, fill out the template completely:
- Link to related specification
- Describe changes clearly
- List test scenarios
- Note any breaking changes
- Add screenshots for UI changes

### Review Criteria

Reviewers will check:
1. **Security**: Multi-tenant isolation, no SQL injection, input validation
2. **Functionality**: Code works as specified
3. **Tests**: Adequate test coverage
4. **Code Quality**: Readable, maintainable, follows conventions
5. **Documentation**: Updated as needed

## 🚨 Critical Rules

### NEVER DO THIS:

❌ Query without `tenantId` filter
❌ Hard delete records (use soft delete)
❌ Block reactive chains (`.block()`)
❌ Commit sensitive data (passwords, tokens, API keys)
❌ Skip multi-tenant testing
❌ Leave debug/console statements
❌ Commit `node_modules/`, `build/`, or `dist/`

### ALWAYS DO THIS:

✅ Filter all queries by `tenantId`
✅ Use soft delete (`deletedAt` timestamp)
✅ Return `Mono<T>` or `Flux<T>` in backend
✅ Test tenant isolation
✅ Hash passwords with BCrypt
✅ Validate user input
✅ Update documentation
✅ Follow commit conventions

## 🆘 Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Create an issue with reproduction steps
- **Features**: Propose via issue first, then implement
- **Documentation**: Check `openspec/` directory

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing! 🦷✨
