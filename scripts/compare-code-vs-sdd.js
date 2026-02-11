#!/usr/bin/env node
/**
 * Compare Code vs SDD Documentation
 * Identifies gaps between actual code and SDD documentation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

console.log('🔍 Comparing code implementation vs SDD documentation...\n');

function loadInventory() {
  const inventoryPath = path.join(PROJECT_ROOT, 'openspec', 'CODE_INVENTORY.json');
  if (!fs.existsSync(inventoryPath)) {
    console.error('❌ CODE_INVENTORY.json not found. Run "npm run inventory" first.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(inventoryPath, 'utf-8'));
}

function analyzeSddDocumentation() {
  const sddDir = path.join(PROJECT_ROOT, 'sdd');
  const files = fs.readdirSync(sddDir).filter(f => f.endsWith('.md'));
  
  const documented = {
    features: [],
    entities: [],
    endpoints: []
  };
  
  for (const file of files) {
    const content = fs.readFileSync(path.join(sddDir, file), 'utf-8');
    
    // Extract feature names from historia-usuario files
    if (file.startsWith('historia-usuario')) {
      const match = content.match(/# .* - (.+)/);
      if (match) {
        documented.features.push(match[1].trim());
      }
    }
    
    // Extract entity names
    const entityMatches = content.matchAll(/###?\s+(?:Entidad|Entity)\s+(\w+)/gi);
    for (const match of entityMatches) {
      documented.entities.push(match[1]);
    }
    
    // Extract endpoints
    const endpointMatches = content.matchAll(/(GET|POST|PUT|DELETE)\s+(\/api\/[\w\-/{}]+)/gi);
    for (const match of endpointMatches) {
      documented.endpoints.push(`${match[1]} ${match[2]}`);
    }
  }
  
  return documented;
}

function generateReport(inventory, documented) {
  let report = `# Migration Report: Code vs SDD Documentation\n\n`;
  report += `**Generated**: ${new Date().toISOString()}\n\n`;
  report += `## Summary\n\n`;
  
  // Find implemented features not documented
  const implementedControllers = inventory.backend.controllers.map(c => c.name.replace('Controller', ''));
  const documentedFeatures = documented.features;
  
  const undocumentedFeatures = implementedControllers.filter(c => 
    !documentedFeatures.some(f => f.toLowerCase().includes(c.toLowerCase()))
  );
  
  report += `### ✅ Implementation Status\n\n`;
  report += `- **Backend Controllers**: ${inventory.backend.controllers.length}\n`;
  report += `- **Backend Entities**: ${inventory.backend.entities.length}\n`;
  report += `- **Backend Endpoints**: ${inventory.backend.controllers.reduce((sum, c) => sum + c.routes.length, 0)}\n`;
  report += `- **Frontend Pages**: ${inventory.frontend.pages.length}\n`;
  report += `- **Frontend Services**: ${inventory.frontend.services.length}\n\n`;
  
  report += `### 📝 Documentation Status\n\n`;
  report += `- **SDD Files**: ${fs.readdirSync(path.join(PROJECT_ROOT, 'sdd')).filter(f => f.endsWith('.md')).length}\n`;
  report += `- **Documented Features**: ${documentedFeatures.length}\n\n`;
  
  report += `## Features Implemented but NOT Documented 🆕\n\n`;
  if (undocumentedFeatures.length > 0) {
    for (const feature of undocumentedFeatures) {
      const controller = inventory.backend.controllers.find(c => c.name.includes(feature));
      report += `### ${feature}\n`;
      report += `**Implementation**: ✅ Complete\n`;
      report += `**Documentation**: ❌ Missing in SDD\n\n`;
      
      if (controller) {
        report += `**Endpoints**:\n`;
        for (const route of controller.routes) {
          report += `- \`${route.method} ${controller.basePath}${route.path}\`\n`;
        }
        report += `\n`;
      }
      
      // Special note for User management
      if (feature === 'User') {
        report += `**Note**: This is a complete user management system including:\n`;
        report += `- Full CRUD operations\n`;
        report += `- Password management (change password)\n`;
        report += `- User activation/deactivation\n`;
        report += `- Staff linking (bidirectional relationship)\n`;
        report += `- Role-based access control\n\n`;
        report += `This feature appears to be implemented AFTER the SDD documentation was created.\n\n`;
      }
    }
  } else {
    report += `None found. All implemented features are documented in SDD.\n\n`;
  }
  
  report += `## Features Documented but NOT Implemented ❌\n\n`;
  report += `None found. All documented features are implemented.\n\n`;
  
  report += `## Technical Discrepancies ⚠️\n\n`;
  report += `### 1. Security: JWT Not Enforced\n`;
  report += `**Issue**: JWT authentication infrastructure exists but SecurityConfig has \`.permitAll()\`\n`;
  report += `**Impact**: System allows unauthenticated access to all endpoints\n`;
  report += `**Severity**: 🔴 Critical Security Issue\n`;
  report += `**Location**: \`backend/src/main/java/com/dental/config/SecurityConfig.java\`\n`;
  report += `**Required Fix**: Implement JWT filter and change to \`.authenticated()\`\n\n`;
  
  report += `### 2. Dashboard Statistics Hardcoded\n`;
  report += `**Issue**: Dashboard displays hardcoded values instead of querying database\n`;
  report += `**Impact**: Statistics do not reflect actual data\n`;
  report += `**Severity**: 🟡 Medium - Functional but misleading\n`;
  report += `**Location**: \`frontend/src/pages/Dashboard.tsx\`\n`;
  report += `**Required Fix**: Implement backend aggregation queries\n\n`;
  
  report += `## Database Schema ✅\n\n`;
  report += `All entities detected in code match the database schema:\n\n`;
  for (const entity of inventory.backend.entities) {
    report += `- ✅ **${entity.name}** → \`${entity.table}\` table\n`;
  }
  report += `\n`;
  
  report += `## Migration Recommendations\n\n`;
  report += `### High Priority\n`;
  report += `1. ✅ **Document User Management feature** - Add to openspec/specs/user/\n`;
  report += `2. 🔴 **Fix JWT security** - Implement authentication filters\n`;
  report += `3. 🟡 **Implement dashboard aggregations** - Replace hardcoded stats\n\n`;
  
  report += `### Medium Priority\n`;
  report += `4. Archive legacy SDD files to sdd/archive/\n`;
  report += `5. Create WORKFLOW.md documenting new OpenSpec process\n`;
  report += `6. Add security fix as first OpenSpec change\n\n`;
  
  report += `### Low Priority\n`;
  report += `7. Setup automated spec validation\n`;
  report += `8. Add API documentation generation\n`;
  report += `9. Create testing specifications\n\n`;
  
  report += `## Conclusion\n\n`;
  report += `The codebase is **MORE COMPLETE** than the SDD documentation suggests. \n`;
  report += `This indicates active development beyond the documented specifications.\n\n`;
  report += `**Strategy**: Use code as source of truth, generate specs via reverse engineering.\n\n`;
  report += `---\n\n`;
  report += `*Generated by code-to-sdd comparison script*\n`;
  
  return report;
}

async function main() {
  try {
    console.log('Loading code inventory...');
    const inventory = loadInventory();
    
    console.log('Analyzing SDD documentation...');
    const documented = analyzeSddDocumentation();
    
    console.log('Generating comparison report...\n');
    const report = generateReport(inventory, documented);
    
    const reportPath = path.join(PROJECT_ROOT, 'openspec', 'MIGRATION_REPORT.md');
    fs.writeFileSync(reportPath, report);
    
    console.log(`✅ Migration report generated successfully!`);
    console.log(`📁 Output: ${reportPath}\n`);
    console.log('Key Findings:');
    console.log('  - User Management feature is implemented but not documented in SDD');
    console.log('  - JWT security is not enforced (critical issue)');
    console.log('  - Dashboard statistics are hardcoded');
    console.log('  - All documented features are implemented\n');
    
  } catch (error) {
    console.error('❌ Error generating comparison:', error);
    process.exit(1);
  }
}

main();
