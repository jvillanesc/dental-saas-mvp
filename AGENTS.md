# OpenSpec Project

This project uses [OpenSpec](https://github.com/Fission-AI/OpenSpec) for specification-driven development.

## For AI Assistants

👉 **Read full instructions**: [`@/openspec/AGENTS.md`](openspec/AGENTS.md)

### Quick Start

- `/opsx:new <feature>` - Start new change
- `/opsx:ff` - Generate all artifacts
- `/opsx:apply` - Implement
- `/opsx:archive` - Complete & merge

### Critical Context

**Dental SaaS MVP** - Multi-tenant clinic management

- Java 21 + Spring Boot WebFlux + R2DBC | React 18 + TypeScript
- Multi-tenancy: All queries MUST filter by `tenantId`
- ⚠️ **Known Issue**: JWT not enforced (SecurityConfig.permitAll())
- Soft deletes: Use `deletedAt` timestamp
- BCrypt for "password123": `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`

### Project Structure

```
openspec/
├── project.md        # Project overview
├── config.yaml       # Rules & conventions
├── AGENTS.md         # Full AI instructions
├── specs/            # Source of truth
└── changes/          # Work in progress
```

## For Developers

### Documentation

- [Project Overview](openspec/project.md)
- [Workflow Guide](openspec/WORKFLOW.md)
- [Migration Report](openspec/MIGRATION_REPORT.md)

### Getting Started

```bash
# Install OpenSpec CLI
npm install -g @fission-ai/openspec@latest

# Start working
# Just tell your AI: /opsx:new <feature-name>
```

### Migration Notice

This project migrated from SDD to OpenSpec on 2026-02-09. Legacy docs in [`sdd/archive/`](sdd/archive/).

---

**Full documentation**: [`openspec/AGENTS.md`](openspec/AGENTS.md)
