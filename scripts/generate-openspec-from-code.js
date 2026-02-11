#!/usr/bin/env node
/**
 * Generate OpenSpec Specs from Code Inventory
 * Creates OpenSpec spec files based on actual implemented code
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

console.log('📝 Generating OpenSpec specs from code inventory...\n');

function loadInventory() {
  const inventoryPath = path.join(PROJECT_ROOT, 'openspec', 'CODE_INVENTORY.json');
  if (!fs.existsSync(inventoryPath)) {
    console.error('❌ CODE_INVENTORY.json not found. Run "npm run inventory" first.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(inventoryPath, 'utf-8'));
}

function httpMethodToVerb(method) {
  const verbs = {
    'GET': 'retrieve',
    'POST': 'create',
    'PUT': 'update',
    'DELETE': 'delete'
  };
  return verbs[method] || method.toLowerCase();
}

function generateEntitySpec(entity) {
  const domainName = entity.name.toLowerCase();
  const plural = domainName + 's';
  
  let spec = `# ${entity.name} Specification\n\n`;
  spec += `## Purpose\n\n`;
  spec += `Management of ${plural} in the dental clinic system.\n\n`;
  
  spec += `## Domain Model\n\n`;
  spec += `### Entity: ${entity.name}\n`;
  spec += `- **Table**: \`${entity.table}\`\n`;
  spec += `- **Multi-tenant**: ${entity.multiTenant ? '✅ Yes' : '❌ No'}\n`;
  spec += `- **Soft Delete**: ${entity.softDelete ? '✅ Yes (deletedAt)' : '❌ No'}\n\n`;
  
  spec += `**Fields:**\n`;
  for (const field of entity.fields) {
    spec += `- ${field}\n`;
  }
  spec += `\n`;
  
  spec += `## Requirements\n\n`;
  
  // Generate requirements based on entity characteristics
  if (entity.multiTenant) {
    spec += `### Requirement: Multi-Tenant Isolation\n`;
    spec += `The system SHALL ensure that ${plural} are isolated by tenant.\n\n`;
    spec += `#### Scenario: Tenant data isolation\n`;
    spec += `- GIVEN a user authenticated with tenantId A\n`;
    spec += `- WHEN the user requests ${plural}\n`;
    spec += `- THEN only ${plural} belonging to tenant A are returned\n`;
    spec += `- AND ${plural} from other tenants are never visible\n\n`;
  }
  
  if (entity.softDelete) {
    spec += `### Requirement: Soft Delete\n`;
    spec += `The system SHALL mark ${plural} as deleted without removing them from the database.\n\n`;
    spec += `#### Scenario: Soft delete ${domainName}\n`;
    spec += `- GIVEN an existing ${domainName}\n`;
    spec += `- WHEN a delete request is made\n`;
    spec += `- THEN the ${domainName}'s deletedAt field is set to current timestamp\n`;
    spec += `- AND the ${domainName} is no longer returned in standard queries\n`;
    spec += `- AND the ${domainName} record remains in the database\n\n`;
  }
  
  return spec;
}

function generateControllerSpec(controller, entities) {
  const controllerName = controller.name.replace('Controller', '');
  const domainName = controllerName.toLowerCase();
  
  let spec = `# ${controllerName} API Specification\n\n`;
  spec += `## Purpose\n\n`;
  spec += `REST API endpoints for ${domainName} management.\n\n`;
  spec += `**Base Path**: \`${controller.basePath}\`\n\n`;
  
  spec += `## Requirements\n\n`;
  
  // Group routes by operation type
  const getRoutes = controller.routes.filter(r => r.method === 'GET');
  const postRoutes = controller.routes.filter(r => r.method === 'POST');
  const putRoutes = controller.routes.filter(r => r.method === 'PUT');
  const deleteRoutes = controller.routes.filter(r => r.method === 'DELETE');
  
  // Generate GET requirements
  if (getRoutes.length > 0) {
    spec += `### Requirement: ${controllerName} Retrieval\n`;
    spec += `The system SHALL provide endpoints to retrieve ${domainName} data.\n\n`;
    
    for (const route of getRoutes) {
      const isCollection = route.path === '/' || route.path === '';
      const isSingle = route.path.includes('{') || route.path.includes(':id');
      
      if (isCollection) {
        spec += `#### Scenario: List all ${domainName}\n`;
        spec += `- GIVEN an authenticated user\n`;
        spec += `- WHEN GET ${controller.basePath}${route.path} is requested\n`;
        spec += `- THEN all ${domainName} for the user's tenant are returned\n`;
        spec += `- AND each item includes complete details\n\n`;
      } else if (isSingle) {
        spec += `#### Scenario: Get single ${domainName} by ID\n`;
        spec += `- GIVEN an authenticated user\n`;
        spec += `- WHEN GET ${controller.basePath}${route.path} is requested\n`;
        spec += `- THEN the specific ${domainName} is returned\n`;
        spec += `- AND only if it belongs to the user's tenant\n\n`;
      }
    }
  }
  
  // Generate POST requirements
  if (postRoutes.length > 0) {
    spec += `### Requirement: ${controllerName} Creation\n`;
    spec += `The system SHALL allow creation of new ${domainName} records.\n\n`;
    
    for (const route of postRoutes) {
      spec += `#### Scenario: Create ${domainName}\n`;
      spec += `- GIVEN an authenticated user with valid ${domainName} data\n`;
      spec += `- WHEN POST ${controller.basePath}${route.path} is requested\n`;
      spec += `- THEN a new ${domainName} is created for the user's tenant\n`;
      spec += `- AND the created ${domainName} is returned with generated ID\n`;
      spec += `- AND timestamps are automatically set\n\n`;
    }
  }
  
  // Generate PUT requirements
  if (putRoutes.length > 0) {
    spec += `### Requirement: ${controllerName} Update\n`;
    spec += `The system SHALL allow modification of existing ${domainName} records.\n\n`;
    
    for (const route of putRoutes) {
      const isPasswordChange = route.path.includes('password');
      const isStatusChange = route.path.includes('activate') || route.path.includes('deactivate');
      
      if (isPasswordChange) {
        spec += `#### Scenario: Change password\n`;
        spec += `- GIVEN an authenticated ADMIN user\n`;
        spec += `- WHEN PUT ${controller.basePath}${route.path} is requested with new password\n`;
        spec += `- THEN the password is updated with BCrypt hash\n`;
        spec += `- AND the user can login with the new password\n\n`;
      } else if (isStatusChange) {
        const action = route.path.includes('activate') ? 'activate' : 'deactivate';
        spec += `#### Scenario: ${action.charAt(0).toUpperCase() + action.slice(1)} ${domainName}\n`;
        spec += `- GIVEN an authenticated ADMIN user\n`;
        spec += `- WHEN PUT ${controller.basePath}${route.path} is requested\n`;
        spec += `- THEN the ${domainName}'s active status is set to ${action === 'activate'}\n`;
        spec += `- AND the change is persisted\n\n`;
      } else {
        spec += `#### Scenario: Update ${domainName}\n`;
        spec += `- GIVEN an authenticated user with updated ${domainName} data\n`;
        spec += `- WHEN PUT ${controller.basePath}${route.path} is requested\n`;
        spec += `- THEN the ${domainName} is updated\n`;
        spec += `- AND only if it belongs to the user's tenant\n`;
        spec += `- AND updatedAt timestamp is automatically updated\n\n`;
      }
    }
  }
  
  // Generate DELETE requirements
  if (deleteRoutes.length > 0) {
    spec += `### Requirement: ${controllerName} Deletion\n`;
    spec += `The system SHALL allow deletion of ${domainName} records.\n\n`;
    
    for (const route of deleteRoutes) {
      // Check if entity has soft delete
      const relatedEntity = entities.find(e => 
        e.name.toLowerCase() === domainName || 
        domainName.includes(e.name.toLowerCase())
      );
      
      if (relatedEntity?.softDelete) {
        spec += `#### Scenario: Soft delete ${domainName}\n`;
        spec += `- GIVEN an authenticated user\n`;
        spec += `- WHEN DELETE ${controller.basePath}${route.path} is requested\n`;
        spec += `- THEN the ${domainName}'s deletedAt is set to current timestamp\n`;
        spec += `- AND the ${domainName} is excluded from standard queries\n`;
        spec += `- AND only if it belongs to the user's tenant\n\n`;
      } else {
        spec += `#### Scenario: Delete ${domainName}\n`;
        spec += `- GIVEN an authenticated user\n`;
        spec += `- WHEN DELETE ${controller.basePath}${route.path} is requested\n`;
        spec += `- THEN the ${domainName} is permanently removed\n`;
        spec += `- AND only if it belongs to the user's tenant\n\n`;
      }
    }
  }
  
  return spec;
}

function generateArchitectureSpec(inventory) {
  let spec = `# Architecture Specification\n\n`;
  spec += `## Purpose\n\n`;
  spec += `Technical architecture and technology stack for the Dental SaaS MVP.\n\n`;
  
  spec += `## Technology Stack\n\n`;
  spec += `### Backend\n`;
  spec += `- **Language**: Java 21 (LTS)\n`;
  spec += `- **Framework**: Spring Boot 3.2.1\n`;
  spec += `- **Web Layer**: Spring WebFlux (Reactive)\n`;
  spec += `- **Data Access**: Spring Data R2DBC\n`;
  spec += `- **Database Driver**: R2DBC PostgreSQL\n`;
  spec += `- **Security**: Spring Security + JWT\n`;
  spec += `- **Build Tool**: Gradle 8.5\n`;
  spec += `- **Password Hashing**: BCrypt\n\n`;
  
  spec += `### Frontend\n`;
  spec += `- **Library**: React 18.2.0\n`;
  spec += `- **Language**: TypeScript 5.3\n`;
  spec += `- **Build Tool**: Vite 5.0\n`;
  spec += `- **Styling**: Tailwind CSS 3.4\n`;
  spec += `- **HTTP Client**: Axios 1.6\n`;
  spec += `- **Routing**: React Router 6.21\n`;
  spec += `- **Date Utilities**: date-fns 3.0\n\n`;
  
  spec += `### Database\n`;
  spec += `- **RDBMS**: PostgreSQL 15\n`;
  spec += `- **Container**: Docker (Alpine)\n`;
  spec += `- **Extensions**: uuid-ossp\n\n`;
  
  spec += `## Architecture Patterns\n\n`;
  spec += `### Backend Layers\n`;
  spec += `The system SHALL follow a layered architecture:\n`;
  spec += `1. **Controllers**: REST endpoints, request/response handling\n`;
  spec += `2. **Services**: Business logic, validation\n`;
  spec += `3. **Repositories**: Data access, R2DBC queries\n`;
  spec += `4. **Entities**: Domain models\n`;
  spec += `5. **DTOs**: Data transfer objects\n\n`;
  
  spec += `### Reactive Programming\n`;
  spec += `The system SHALL use reactive programming patterns:\n`;
  spec += `- All database operations return \`Mono<T>\` or \`Flux<T>\`\n`;
  spec += `- Non-blocking I/O throughout the stack\n`;
  spec += `- Reactor Netty as the web server\n\n`;
  
  spec += `### Security Architecture\n\n`;
  spec += `#### Requirement: JWT Authentication\n`;
  spec += `The system SHALL use JWT tokens for authentication.\n\n`;
  spec += `**Current Implementation Status**: ⚠️ JWT infrastructure exists but is NOT enforced\n\n`;
  spec += `#### Scenario: Token generation\n`;
  spec += `- GIVEN valid user credentials\n`;
  spec += `- WHEN authentication succeeds\n`;
  spec += `- THEN a JWT token is generated with 8-hour expiration\n`;
  spec += `- AND token contains userId, tenantId, email, role claims\n\n`;
  
  spec += `#### Known Issue: Security Not Enforced\n`;
  spec += `**Problem**: SecurityConfig currently has \`.permitAll()\` allowing unauthenticated access to all endpoints.\n`;
  spec += `**Impact**: System is functionally insecure despite JWT infrastructure.\n`;
  spec += `**Required Action**: Implement JWT filter and change to \`.authenticated()\`.\n\n`;
  
  return spec;
}

async function main() {
  try {
    const inventory = loadInventory();
    const specsDir = path.join(PROJECT_ROOT, 'openspec', 'specs');
    
    // Create architecture spec
    console.log('🏗️  Generating architecture spec...');
    const archDir = path.join(specsDir, 'architecture');
    if (!fs.existsSync(archDir)) fs.mkdirSync(archDir, { recursive: true });
    fs.writeFileSync(
      path.join(archDir, 'stack.md'),
      generateArchitectureSpec(inventory)
    );
    
    // Generate spec for each entity
    for (const entity of inventory.backend.entities) {
      const domainName = entity.name.toLowerCase();
      console.log(`📦 Generating spec for ${entity.name}...`);
      
      const domainDir = path.join(specsDir, domainName);
      if (!fs.existsSync(domainDir)) fs.mkdirSync(domainDir, { recursive: true });
      
      fs.writeFileSync(
        path.join(domainDir, 'spec.md'),
        generateEntitySpec(entity)
      );
    }
    
    // Generate API spec for each controller
    for (const controller of inventory.backend.controllers) {
      const controllerName = controller.name.replace('Controller', '').toLowerCase();
      console.log(`🎮 Generating API spec for ${controller.name}...`);
      
      const domainDir = path.join(specsDir, controllerName);
      if (!fs.existsSync(domainDir)) fs.mkdirSync(domainDir, { recursive: true });
      
      fs.writeFileSync(
        path.join(domainDir, 'api.md'),
        generateControllerSpec(controller, inventory.backend.entities)
      );
    }
    
    console.log(`\n✅ OpenSpec specs generated successfully!`);
    console.log(`📁 Location: ${specsDir}`);
    
  } catch (error) {
    console.error('❌ Error generating specs:', error);
    process.exit(1);
  }
}

main();
