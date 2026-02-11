# OpenSpec Agent Instructions

This project uses **OpenSpec** for specification-driven development. These instructions help AI coding assistants work effectively with the OpenSpec workflow.

## Project Context

**Dental SaaS MVP** - Multi-tenant dental clinic management system

- **Stack**: Java 21 + Spring Boot WebFlux + R2DBC | React 18 + TypeScript + Vite
- **Database**: PostgreSQL 15
- **Focus**: Multi-tenancy, reactive programming, JWT authentication

## Critical Project Knowledge

### Lessons Learned (MUST Remember)
1. **BCrypt Hash**: For password "password123" use: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`
2. **Users ≠ Staff**: Separate entities. User = login account, Staff = medical personnel
3. **Database Init**: Only `docker/postgres/init.sql`, set `spring.sql.init.mode=never`
4. **Soft Deletes**: Use `deletedAt` timestamp, NOT boolean
5. **Multi-Tenancy**: Every query MUST filter by `tenantId`

### Known Issues (Critical)
� **JWT Security Partially Enforced**: JWT validation active via JwtAuthenticationFilter. All controllers use TenantContext for dynamic multi-tenant isolation. SecurityConfig maintains `.permitAll()` for backwards compatibility - change to `.authenticated()` to fully enforce authentication.

## OpenSpec Workflow

### Available Commands

| Command | Purpose |
|---------|---------|
| `/opsx:new <name>` | Start new change (creates folder) |
| `/opsx:ff` | Fast-forward: generate all artifacts at once |
| `/opsx:continue` | Continue working on current change |
| `/opsx:apply` | Implement tasks from tasks.md |
| `/opsx:archive` | Complete change & merge specs |
| `/opsx:onboard` | Learn about OpenSpec |

### Typical Workflow

```
User: /opsx:new add-feature-name
You:  Create openspec/changes/add-feature-name/

User: /opsx:ff
You:  Generate:
      - proposal.md (why, what, scope)
      - specs/ (ADDED/MODIFIED/REMOVED requirements)
      - design.md (technical approach)
      - tasks.md (step-by-step checklist)

User: /opsx:apply  
You:  Implement tasks, checking them off

User: /opsx:archive
You:  Move to archive/, merge delta specs to openspec/specs/
```

## Spec File Structure

### Directory Layout

```
openspec/
├── project.md                 # Project overview
├── config.yaml                # Rules and conventions
├── AGENTS.md                  # This file
├── WORKFLOW.md                # Detailed workflow guide
├── CODE_INVENTORY.json        # Auto-generated code analysis
├── MIGRATION_REPORT.md        # Code vs docs comparison
│
├── specs/                     # SOURCE OF TRUTH
│   ├── architecture/          # Tech stack & patterns
│   ├── auth/                  # Authentication
│   ├── user/                  # User management
│   ├── patient/               # Patient management
│   ├── staff/                 # Staff management
│   └── appointment/           # Appointment scheduling
│
└── changes/                   # In-progress changes
    ├── <active-change-1>/
    ├── <active-change-2>/
    └── archive/               # Completed changes
        └── YYYY-MM-DD-<name>/
```

### Spec Format (RFC 2119)

Use these keywords:
- **SHALL**: API contracts, absolute requirements
- **MUST**: Security, data integrity
- **SHOULD**: UX recommendations, best practices
- **MAY**: Optional features

### Scenario Format

Always use Given/When/Then:

```markdown
### Requirement: User Authentication
The system SHALL validate credentials before issuing tokens.

#### Scenario: Valid login
- GIVEN a user with email "test@example.com" and correct password
- WHEN POST /api/auth/login is called
- THEN a JWT token is returned
- AND the token contains userId, tenantId, role
```

### Delta Spec Format

```markdown
# Delta for Patient Management

## ADDED Requirements

### Requirement: Email Notifications
The system SHALL send confirmation emails for appointments.

## MODIFIED Requirements

### Requirement: Appointment Duration
The system SHALL support 15, 30, 45, 60 minute slots.
(Previously: Only 30 and 60 minutes)

## REMOVED Requirements

### Requirement: Phone Verification
(Removed due to complexity)
```

## Project-Specific Rules

### ALWAYS
- Specify multi-tenant behavior in requirements
- Use reactive types (`Mono<T>`, `Flux<T>`)  
- Hash passwords with BCrypt (never plain text)
- Use DTOs for REST endpoints (never entities)
- Filter by `tenantId` in all queries
- Use `@Query` for R2DBC (derived queries limited)

### NEVER
- Include implementation code in specs
- Use blocking operations
- Expose password hashes
- Skip tenant isolation
- Delete data physically (use soft-delete where applicable)

## Working with Changes

### Starting a Change

When user says `/opsx:new <name>`:
1. Create `openspec/changes/<name>/`
2. Say "Created openspec/changes/<name>/ - Ready to create: proposal"
3. Wait for user to request artifacts

### Fast-Forward (`/opsx:ff`)

Generate all four artifacts:

**proposal.md**:
```markdown
# Proposal: <Feature Name>

## Intent
Why we're doing this

## Scope
What's included and what's not

## Approach
High-level technical strategy
```

**specs/<domain>/spec.md**:
```markdown
# Delta for <Domain>

## ADDED Requirements
(new requirements)

## MODIFIED Requirements
(changes to existing)

## REMOVED Requirements
(deprecated features)
```

**design.md**:
```markdown
# Design: <Feature Name>

## Technical Approach
How we'll implement this

## Architecture Changes
What components are affected

## Data Model
Database or API changes

## Security Considerations
Authentication, authorization, data validation
```

**tasks.md**:
```markdown
# Tasks: <Feature Name>

## Backend
- [ ] Task 1.1: Description
- [ ] Task 1.2: Description

## Frontend  
- [ ] Task 2.1: Description

## Database
- [ ] Task 3.1: Description

## Testing
- [ ] Task 4.1: Description
```

### Applying Changes (`/opsx:apply`)

1. Read tasks.md
2. Implement each task
3. Update tasks.md checking off [ ] → [x]
4. Report progress as you go

### Archiving (`/opsx:archive`)

1. Move `openspec/changes/<name>/` to `openspec/changes/archive/YYYY-MM-DD-<name>/`
2. Merge delta specs:
   - **ADDED** → Append to main spec
   - **MODIFIED** → Replace in main spec
   - **REMOVED** → Delete from main spec
3. Confirm: "Archived to archive/YYYY-MM-DD-<name>/"

## Coding Conventions (From Codebase)

### Backend (Java)
- **Classes**: PascalCase
- **Methods**: camelCase  
- **Entities**: UUID id, `tenantId`, `createdAt`/`updatedAt`
- **Repos**: Return `Mono<X>` or `Flux<X>`
- **DTOs**: `CreateXDTO`, `UpdateXDTO` (separate from entity)
- **Soft Delete**: `deletedAt: LocalDateTime` (Patient, Staff)

### Frontend (TypeScript)
- **Components**: PascalCase
- **Functions**: camelCase
- **Services**: Centralized API calls, not in components
- **Types**: Defined in `src/types/`
- **State**: React Context for global, local state for component
- **Async**: Always show loading state

## Migration from SDD

This project **migrated from SDD (Spec-Driven Development)** on 2026-02-09.

### Key Changes
- Specs now generated from actual code (reverse engineering)
- Code is source of truth, not docs
- Legacy SDD files in `sdd/archive/` (reference only)
- OpenSpec uses delta specs and change folders

### If User Asks About Old SDD
- Say: "SDD files preserved in sdd/archive/ for reference"
- Say: "Current specs in openspec/specs/ generated from actual code"
- Say: "New features use /opsx workflow"

## FAQs

### "Should I create code or specs first?"
**Specs first** (with /opsx:new + /opsx:ff), then code (with /opsx:apply).  
But if code already exists, update specs to reflect reality.

### "Where do I find requirements?"
In `openspec/specs/<domain>/spec.md` - organized by domain (auth, users, patients, etc.)

### "Can I work on multiple changes simultaneously?"
Yes! Each change has its own folder. Work on whichever is priority.

### "What if specs are outdated?"
Update them! Specs should always reflect current code. Document retroactively if needed.

### "How do I handle the JWT security issue?"
Create `/opsx:new fix-jwt-authentication` and implement JWT filter.  
This is a **critical priority** issue.

## Examples

### Example 1: Add Feature

```
User: /opsx:new add-email-notifications
You:  Created openspec/changes/add-email-notifications/
      Ready to create: proposal

User: /opsx:ff
You:  ✓ proposal.md — why we need email notifications
      ✓ specs/notifications/spec.md — email requirements
      ✓ design.md — JavaMailSender integration
      ✓ tasks.md — 8 implementation steps
      Ready for implementation!

User: /opsx:apply  
You:  Implementing tasks...
      ✓ 1.1 Add spring-boot-starter-mail dependency
      ✓ 1.2 Create EmailService with send method
      ... (continue until all done)
      
User: /opsx:archive
You:  Archived to archive/2026-02-09-add-email-notifications/
      Specs updated with email requirements.
```

### Example 2: Fix Bug

```
User: /opsx:new fix-appointment-timezone-bug
You:  (create change folder)

User: /opsx:ff
You:  (generate artifacts)

User: The design should use ZonedDateTime not LocalDateTime
You:  (update design.md with ZonedDateTime approach)

User: /opsx:apply
You:  (implement fix)

User: /opsx:archive  
You:  (archive completed fix)
```

## Getting More Help

- **Project Overview**: @/openspec/project.md
- **Workflow Guide**: @/openspec/WORKFLOW.md
- **Config & Rules**: @/openspec/config.yaml
- **Migration Report**: @/openspec/MIGRATION_REPORT.md
- **Code Inventory**: @/openspec/CODE_INVENTORY.json

## Remember

1. **Specs = what to build** (declarative)
2. **Code = how to build** (imperative)
3. Keep them separate! 
4. Always consider multi-tenancy 🔑
5. Current code > old docs ✅

---

**Ready to use OpenSpec!** Start with `/opsx:new <feature-name>` or `/opsx:onboard` to learn more.
