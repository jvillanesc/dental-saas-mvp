# SDD Documentation (Deprecated)

**⚠️ This directory contains legacy documentation that is NO LONGER MAINTAINED**

## Migration Notice

On **February 9, 2026**, this project migrated from **SDD (Spec-Driven Development)** to **OpenSpec**.

### Why the Migration?

1. **Code was more complete than docs**: User Management feature was fully implemented but never documented
2. **Reverse engineering needed**: Used actual code as source of truth
3. **Better change management**: OpenSpec provides delta specs and change folders
4. **AI-friendly**: Native integration with modern AI coding assistants
5. **Industry standard**: OpenSpec is more widely adopted

### Where is Documentation Now?

**New location**: [`../openspec/`](../openspec/)

```
openspec/
├── project.md           # Project overview (replaces PROMPT-PRINCIPAL.md)
├── config.yaml          # Rules and lessons learned
├── AGENTS.md            # AI assistant instructions
├── WORKFLOW.md          # How to use OpenSpec
├── specs/               # Current specifications (source of truth)
│   ├── architecture/
│   ├── auth/
│   ├── user/
│   ├── patient/
│   ├── staff/
│   └── appointment/
└── changes/             # Change history and in-progress work
```

## What's in This Archive

This `sdd/archive/` directory preserves the original SDD files for historical reference:

- `PROMPT-PRINCIPAL.md` - Original master prompt (now: `openspec/project.md`)
- `specs-tecnicas-*.md` - Technical specs (now: `openspec/specs/architecture/`)
- `historia-usuario-*.md` - User stories (now: domain specs in `openspec/specs/`)
- `integracion-final.md` - Integration guide

## How to Work with New Features

**Don't create new SDD files here!** Use OpenSpec workflow:

```bash
# Start new feature
Tell AI: /opsx:new <feature-name>

# Generate planning artifacts
Tell AI: /opsx:ff

# Implement
Tell AI: /opsx:apply

# Complete
Tell AI: /opsx:archive
```

See [`../openspec/WORKFLOW.md`](../openspec/WORKFLOW.md) for full guide.

## Comparison: SDD vs OpenSpec

| Aspect | Old SDD | New OpenSpec |
|--------|---------|--------------|
| **Location** | `sdd/*.md` | `openspec/specs/` |
| **Format** | Historia de usuario with code | Declarative requirements |
| **Organization** | By feature | By domain |
| **Changes** | Re-edit files | Change folders + delta specs |
| **History** | Git only | `changes/archive/` + Git |
| **AI Integration** | Manual | Native `/opsx` commands |
| **Code in specs** | Yes ❌ | No ✅ |

## Key Lessons Preserved

All critical lessons learned from SDD are preserved in [`../openspec/config.yaml`](../openspec/config.yaml):

1. BCrypt password hash for "password123"
2. Users and Staff separation
3. Database initialization strategy
4. Soft delete implementation
5. Multi-tenancy patterns

## If You Need Something from Old Docs

1. **Check [`../openspec/specs/`](../openspec/specs/) first** - It's more up-to-date
2. **Read [`../openspec/MIGRATION_REPORT.md`](../openspec/MIGRATION_REPORT.md)** - Shows what changed
3. **Then browse [`archive/`](archive/)** if you need historical context

## Questions?

- **"Why can't I just use SDD?"** - You can for reading history, but new work must use OpenSpec
- **"Is my old work lost?"** - No! It's all here in `archive/` and migrated to OpenSpec
- **"Where do I start?"** - Read [`../openspec/project.md`](../openspec/project.md) and [`../openspec/WORKFLOW.md`](../openspec/WORKFLOW.md)

---

**📁 Contents of this Archive**

All files dated pre-2026-02-09 are preserved exactly as they were:

```
sdd/archive/
├── PROMPT-PRINCIPAL.md
├── README.md
├── specs-tecnicas-backend.md
├── specs-tecnicas-frontend.md
├── specs-docker-database.md
├── historia-usuario-01-autenticacion.md
├── historia-usuario-02-gestion-pacientes.md
├── historia-usuario-03-gestion-staff.md
├── historia-usuario-04-agenda-citas.md
├── historia-usuario-05-gestion-usuarios.md
└── integracion-final.md
```

**Last Updated**: February 9, 2026  
**Migration**: SDD → OpenSpec complete ✅
