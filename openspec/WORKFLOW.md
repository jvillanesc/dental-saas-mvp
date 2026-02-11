# OpenSpec Workflow & Commands

This guide explains how to work with OpenSpec for this project after the migration from SDD.

## Quick Reference

| Command | Purpose |
|---------|---------|
| `/opsx:new <feature-name>` | Start a new change |
| `/opsx:ff` | Fast-forward: generate all artifacts |
| `/opsx:continue` | Continue working on current change |
| `/opsx:apply` | Implement tasks |
| `/opsx:archive` | Archive completed change |
| `/opsx:onboard` | Learn about OpenSpec |

## The OpenSpec Change Workflow

### 1. Start a New Feature

Tell your AI assistant:
```
/opsx:new add-dashboard-aggregations
```

This creates:
```
openspec/changes/add-dashboard-aggregations/
```

### 2. Generate Planning Artifacts

Tell AI:
```
/opsx:ff
```

This generates:
- `proposal.md` - Why and what (intent, scope, approach)
- `specs/` - What's changing (ADDED/MODIFIED/REMOVED requirements)
- `design.md` - How to implement (technical decisions)
- `tasks.md` - Step-by-step checklist

### 3. Review and Refine

Read the generated artifacts. You can ask AI to refine any of them:
```
Update the design to use Spring Data R2DBC aggregation queries
```

The workflow is **iterative**, not waterfall. You can always go back and update earlier artifacts.

### 4. Implement

Option A - Let AI implement:
```
/opsx:apply
```

Option B - Implement manually:
- Check off tasks in `tasks.md` as you complete them
- AI can help with specific tasks

### 5. Archive the Change

When complete:
```
/opsx:archive
```

This:
- Moves change to `openspec/changes/archive/YYYY-MM-DD-<name>/`
- Merges delta specs into main `openspec/specs/`
- Updates the source of truth

## How Delta Specs Work

Delta specs show what's changing relative to current specs.

### Format

```markdown
# Delta for User Management

## ADDED Requirements

### Requirement: Password Strength Validation
The system MUST enforce strong passwords.

#### Scenario: Weak password rejected
- GIVEN a user attempts to set password "123"
- WHEN the password is validated
- THEN an error is returned
- AND the user must choose a stronger password

## MODIFIED Requirements

### Requirement: JWT Expiration
The system SHALL expire tokens after 4 hours of inactivity.
(Previously: 8 hours)

## REMOVED Requirements

### Requirement: Remember Me
(Deprecated due to security concerns)
```

### On Archive

- **ADDED** → Appended to main spec
- **MODIFIED** → Replaces existing requirement
- **REMOVED** → Deleted from main spec

## Difference from Old SDD

| Old SDD | New OpenSpec |
|---------|--------------|
| Historia de usuario = spec + implementation code | Specs are declarative (what), code is separate (how) |
| One monolithic file per feature | Specs organized by domain, changes in separate folders |
| No versioning of changes | Each change tracked in its own folder |
| Manual documentation | AI-assisted with /opsx commands |
| Code mixed in markdown | Code lives only in backend/frontend/ |
| No historical archive | Complete archive of all changes |

## Working with Multiple Changes

You can have multiple changes in progress:

```
openspec/changes/
├── add-dashboard-aggregations/    # In progress
├── fix-jwt-security/               # In progress
└── archive/
    └── 2026-02-09-user-management/  # Completed
```

Each change is independent. Work on whichever makes sense.

## Best Practices

### Specs
- Use RFC 2119 keywords: **SHALL** (API contracts), **MUST** (security), **SHOULD** (UX)
- Write scenarios as Given/When/Then
- Keep scenarios testable
- Always specify multi-tenant behavior

### Changes
- Keep changes focused (one feature at a time)
- Review artifacts before implementing
- Update earlier artifacts if you learn something new
- Archive when done (don't leave completed changes unarchived)

### Implementation
- Check off tasks as you complete them
- Add notes to tasks.md if you deviate from the plan
- Update design.md if architecture changes
- Test thoroughly before archiving

## Project-Specific Rules

From [openspec/config.yaml](openspec/config.yaml):

### Always Consider
- **Multi-tenancy**: Every requirement must specify tenant isolation
- **Soft deletes**: Patient and Staff use deletedAt, not hard delete
- **Reactive patterns**: Use Mono<T>/Flux<T>, never blocking operations
- **Security**: JWT must be validated (currently broken - see critical issues)

### Never Do
- Include implementation code in specs
- Expose entities directly via REST (use DTOs)
- Use plain text passwords or manual BCrypt hashes
- Forget tenantId filtering in queries
- Use derived query methods in R2DBC (use @Query instead)

## Critical Known Issues

### � JWT Security Partially Enforced
**Status**: ✅ JWT validation active, ⚠️ `.permitAll()` maintained for backwards compatibility  
**Details**: JwtAuthenticationFilter validates all tokens and extracts tenant context. All controllers use TenantContext for dynamic multi-tenant isolation. To fully enforce authentication, change `.anyExchange().permitAll()` to `.anyExchange().authenticated()` in SecurityConfig.  
**Completed**: 2026-02-09 - [View Implementation](changes/archive/2026-02-09-extract-tenant-from-jwt/)

## Getting Help

### From AI
```
@/openspec/AGENTS.md explain how delta specs work
```

### From Docs
- [OpenSpec concepts](https://github.com/Fission-AI/OpenSpec/blob/main/docs/concepts.md)
- [Commands reference](https://github.com/Fission-AI/OpenSpec/blob/main/docs/commands.md)
- Project overview: [openspec/project.md](openspec/project.md)
- Configuration: [openspec/config.yaml](openspec/config.yaml)

## Examples

### Example 1: Fix JWT Security

```
You: /opsx:new fix-jwt-authentication

AI:  Created openspec/changes/fix-jwt-authentication/
     Ready to create: proposal

You: /opsx:ff

AI:  ✓ proposal.md — Security fix: enforce JWT authentication
     ✓ specs/       — Modified security requirements
     ✓ design.md    — JWT filter implementation approach
     ✓ tasks.md     — Implementation steps
     Ready for implementation!

You: /opsx:apply

AI:  Implementing tasks...
     ✓ 1.1 Create JwtAuthenticationFilter
     ✓ 1.2 Update SecurityConfig to use filter
     ✓ 1.3 Update tests
     All tasks complete!

You: Test the changes manually
     (verify authentication works)

You: /opsx:archive

AI:  Archived to openspec/changes/archive/2026-02-09-fix-jwt-authentication/
     Specs updated. System is now secure!
```

### Example 2: Add New Feature

```
You: /opsx:new add-treatment-records

AI:  Created openspec/changes/add-treatment-records/

You: /opsx:ff

AI:  (generates all artifacts)

You: Update the design to include file attachments for X-rays

AI:  (updates design.md with file storage approach)

You: /opsx:apply

AI:  (implements the feature)

You: /opsx:archive

AI:  (merges to main specs)
```

## Migrating Legacy SDD Work

Old SDD files are preserved in [sdd/archive/](sdd/archive/) for reference.

To add missing documentation from SDD:
1. Read the old SDD file
2. Extract requirements (ignore implementation code)
3. Convert to OpenSpec format in relevant spec file
4. Document as "Retroactive documentation" in commit message

## Maintenance

### Keeping Specs Updated

When you make code changes outside OpenSpec workflow:
1. Update the relevant spec in `openspec/specs/`
2. Document what changed and why
3. Consider creating a retroactive change folder for audit trail

### Spec Review Checklist

Before archiving a change:
- [ ] All requirements use SHALL/MUST/SHOULD appropriately
- [ ] Scenarios are testable
- [ ] Multi-tenancy mentioned where relevant
- [ ] Security implications considered
- [ ] Code implements all requirements
- [ ] Tests verify all scenarios

---

**Remember**: Specs are the "what", code is the "how". Keep them separate!
