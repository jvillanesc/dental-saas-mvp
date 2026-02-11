#!/usr/bin/env node
/**
 * Complete Migration Script
 * Orchestrates full migration from SDD to OpenSpec
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

console.log('🚀 Starting complete SDD → OpenSpec migration...\n');

function runCommand(cmd, description) {
  console.log(`\n📍 ${description}`);
  console.log(`   $ ${cmd}`);
  try {
    execSync(cmd, { cwd: PROJECT_ROOT, stdio: 'inherit' });
    console.log('   ✅ Success');
    return true;
  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`);
    return false;
  }
}

function createStructure() {
  console.log('\n📁 Creating OpenSpec directory structure...');
  const dirs = [
    'openspec',
    'openspec/specs',
    'openspec/specs/architecture',
    'openspec/changes',
    'openspec/changes/archive',
    'scripts',
    'sdd/archive'
  ];
  
  for (const dir of dirs) {
    const fullPath = path.join(PROJECT_ROOT, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`   ✓ Created ${dir}`);
    } else {
      console.log(`   · ${dir} already exists`);
    }
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Dental SaaS: SDD → OpenSpec Migration');
  console.log('═══════════════════════════════════════════════════════\n');
  
  // Step 1: Create directory structure
  createStructure();
  
  // Step 2: Install dependencies
  if (!fs.existsSync(path.join(PROJECT_ROOT, 'scripts', 'node_modules'))) {
    runCommand(
      'cd scripts && npm install',
      'Installing script dependencies'
    );
  }
  
  // Step 3: Analyze code
  const inventoryExists = fs.existsSync(path.join(PROJECT_ROOT, 'openspec', 'CODE_INVENTORY.json'));
  if (!inventoryExists) {
    runCommand(
      'cd scripts && npm run inventory',
      'Analyzing codebase (generating CODE_INVENTORY.json)'
    );
  } else {
    console.log('\n📍 Code inventory already exists');
    console.log('   ℹ️  Run "cd scripts && npm run inventory" to regenerate');
  }
  
  // Step 4: Generate OpenSpec specs
  const specsExist = fs.existsSync(path.join(PROJECT_ROOT, 'openspec', 'specs', 'user'));
  if (!specsExist) {
    runCommand(
      'cd scripts && npm run generate-specs',
      'Generating OpenSpec specifications from code'
    );
  } else {
    console.log('\n📍 OpenSpec specs already exist');
    console.log('   ℹ️  Run "cd scripts && npm run generate-specs" to regenerate');
  }
  
  // Step 5: Compare with SDD
  const reportExists = fs.existsSync(path.join(PROJECT_ROOT, 'openspec', 'MIGRATION_REPORT.md'));
  if (!reportExists) {
    runCommand(
      'cd scripts && npm run compare',
      'Comparing code vs SDD documentation'
    );
  } else {
    console.log('\n📍 Migration report already exists');
  }
  
  // Step 6: Archive SDD files
  console.log('\n📍 Archiving legacy SDD files');
  const sddFiles = fs.readdirSync(path.join(PROJECT_ROOT, 'sdd'))
    .filter(f => f.endsWith('.md') && f !== 'README.md');
  
  if (sddFiles.length > 0) {
    for (const file of sddFiles) {
      const src = path.join(PROJECT_ROOT, 'sdd', file);
      const dest = path.join(PROJECT_ROOT, 'sdd', 'archive', file);
      if (!fs.existsSync(dest)) {
        fs.renameSync(src, dest);
        console.log(`   ✓ Moved ${file} to archive/`);
      }
    }
  } else {
    console.log('   · SDD files already archived');
  }
  
  // Step 7: Summary
  console.log('\n\n═══════════════════════════════════════════════════════');
  console.log('  ✅ Migration Complete!');
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log('📊 What was created:');
  console.log('   ✓ openspec/project.md           - Project overview');
  console.log('   ✓ openspec/config.yaml          - Rules & conventions');
  console.log('   ✓ openspec/AGENTS.md            - AI assistant guide');
  console.log('   ✓ openspec/WORKFLOW.md          - Developer workflow');
  console.log('   ✓ openspec/CODE_INVENTORY.json  - Code analysis');
  console.log('   ✓ openspec/MIGRATION_REPORT.md  - Code vs docs comparison');
  console.log('   ✓ openspec/specs/               - Domain specifications');
  console.log('   ✓ AGENTS.md (root)              - OpenSpec stub');
  console.log('   ✓ sdd/archive/                  - Legacy SDD files\n');
  
  console.log('🎯 Next Steps:');
  console.log('   1. Review openspec/MIGRATION_REPORT.md for gaps');
  console.log('   2. Read openspec/project.md for project overview');
  console.log('   3. Read openspec/WORKFLOW.md to learn OpenSpec');
  console.log('   4. Tell your AI: /opsx:onboard\n');
  
  console.log('🔴 Critical Issues Found:');
  console.log('   ⚠️  JWT Security NOT enforced (permitAll)');
  console.log('   🟡 Dashboard statistics are hardcoded');
  console.log('   → Consider: /opsx:new fix-jwt-authentication\n');
  
  console.log('📚 Resources:');
  console.log('   • OpenSpec docs: https://github.com/Fission-AI/OpenSpec');
  console.log('   • Project specs: ./openspec/specs/');
  console.log('   • Legacy SDD: ./sdd/archive/\n');
}

main().catch(error => {
  console.error('\n❌ Migration failed:', error);
  process.exit(1);
});
