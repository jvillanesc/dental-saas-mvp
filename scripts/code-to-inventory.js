#!/usr/bin/env node
/**
 * Code to Inventory Script
 * Scans backend and frontend codebases to extract actual implemented features
 * Generates code-inventory.json as source of truth
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

console.log('🔍 Starting code inventory analysis...\n');

// ============================================
// BACKEND ANALYSIS
// ============================================

async function analyzeBackendEntities() {
  console.log('📦 Analyzing backend entities...');
  const entities = [];
  const entityFiles = await glob('backend/src/main/java/com/dental/domain/model/*.java', { 
    cwd: PROJECT_ROOT 
  });

  for (const file of entityFiles) {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, file), 'utf-8');
    const className = path.basename(file, '.java');
    
    // Extract table name
    const tableMatch = content.match(/@Table\("(\w+)"\)/);
    const tableName = tableMatch ? tableMatch[1] : className.toLowerCase() + 's';
    
    // Extract fields
    const fields = [];
    const fieldRegex = /private\s+(\w+(?:<[\w,\s]+>)?)\s+(\w+);/g;
    let match;
    while ((match = fieldRegex.exec(content)) !== null) {
      fields.push(`${match[2]}: ${match[1]}`);
    }
    
    // Check for soft delete
    const hasSoftDelete = content.includes('deletedAt');
    
    // Check for multi-tenancy
    const isMultiTenant = content.includes('tenantId');
    
    entities.push({
      name: className,
      table: tableName,
      file: file.replace(/\\/g, '/'),
      fields,
      softDelete: hasSoftDelete,
      multiTenant: isMultiTenant
    });
  }
  
  console.log(`   ✓ Found ${entities.length} entities`);
  return entities;
}

async function analyzeBackendControllers() {
  console.log('🎮 Analyzing backend controllers...');
  const controllers = [];
  const controllerFiles = await glob('backend/src/main/java/com/dental/controller/*.java', {
    cwd: PROJECT_ROOT
  });

  for (const file of controllerFiles) {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, file), 'utf-8');
    const className = path.basename(file, '.java');
    
    // Extract base path
    const basePathMatch = content.match(/@RequestMapping\("([^"]+)"\)/);
    const basePath = basePathMatch ? basePathMatch[1] : '/api';
    
    // Extract endpoints
    const routes = [];
    
    // Match GET endpoints
    const getMappings = content.matchAll(/@GetMapping(?:\("([^"]*)"\))?\s+public\s+\w+(?:<[\w<>,\s]+>)?\s+(\w+)\(/g);
    for (const match of getMappings) {
      routes.push({
        method: 'GET',
        path: match[1] || '/',
        handler: match[2],
        description: extractJavadoc(content, match[2])
      });
    }
    
    // Match POST endpoints
    const postMappings = content.matchAll(/@PostMapping(?:\("([^"]*)"\))?\s+public\s+\w+(?:<[\w<>,\s]+>)?\s+(\w+)\(/g);
    for (const match of postMappings) {
      routes.push({
        method: 'POST',
        path: match[1] || '/',
        handler: match[2],
        description: extractJavadoc(content, match[2])
      });
    }
    
    // Match PUT endpoints
    const putMappings = content.matchAll(/@PutMapping(?:\("([^"]*)"\))?\s+public\s+\w+(?:<[\w<>,\s]+>)?\s+(\w+)\(/g);
    for (const match of putMappings) {
      routes.push({
        method: 'PUT',
        path: match[1] || '/',
        handler: match[2],
        description: extractJavadoc(content, match[2])
      });
    }
    
    // Match DELETE endpoints
    const deleteMappings = content.matchAll(/@DeleteMapping(?:\("([^"]*)"\))?\s+public\s+\w+(?:<[\w<>,\s]+>)?\s+(\w+)\(/g);
    for (const match of deleteMappings) {
      routes.push({
        method: 'DELETE',
        path: match[1] || '/',
        handler: match[2],
        description: extractJavadoc(content, match[2])
      });
    }
    
    controllers.push({
      name: className,
      basePath,
      file: file.replace(/\\/g, '/'),
      routes
    });
  }
  
  console.log(`   ✓ Found ${controllers.length} controllers with ${controllers.reduce((sum, c) => sum + c.routes.length, 0)} endpoints`);
  return controllers;
}

function extractJavadoc(content, methodName) {
  const methodIndex = content.indexOf(`${methodName}(`);
  if (methodIndex === -1) return '';
  
  const beforeMethod = content.substring(0, methodIndex);
  const javadocMatch = beforeMethod.match(/\/\*\*([\s\S]*?)\*\/\s*$/);
  
  if (javadocMatch) {
    return javadocMatch[1]
      .split('\n')
      .map(line => line.trim().replace(/^\*\s?/, ''))
      .join(' ')
      .trim();
  }
  
  return '';
}

async function analyzeBackendServices() {
  console.log('⚙️  Analyzing backend services...');
  const services = [];
  const serviceFiles = await glob('backend/src/main/java/com/dental/service/*.java', {
    cwd: PROJECT_ROOT
  });

  for (const file of serviceFiles) {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, file), 'utf-8');
    const className = path.basename(file, '.java');
    
    // Extract public methods
    const methods = [];
    const methodRegex = /public\s+(\w+(?:<[\w,\s<>]+>)?)\s+(\w+)\([^)]*\)/g;
    let match;
    while ((match = methodRegex.exec(content)) !== null) {
      methods.push({
        returnType: match[1],
        name: match[2]
      });
    }
    
    services.push({
      name: className,
      file: file.replace(/\\/g, '/'),
      methods
    });
  }
  
  console.log(`   ✓ Found ${services.length} services`);
  return services;
}

// ============================================
// FRONTEND ANALYSIS
// ============================================

async function analyzeFrontendPages() {
  console.log('📄 Analyzing frontend pages...');
  const pages = [];
  
  // Find all .tsx files in pages directory
  const pageFiles = await glob('frontend/src/pages/**/*.tsx', {
    cwd: PROJECT_ROOT
  });

  for (const file of pageFiles) {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, file), 'utf-8');
    const componentName = path.basename(file, '.tsx');
    
    // Detect CRUD operations by looking for service calls
    const hasList = /getAll|fetchAll/i.test(content);
    const hasCreate = /create|add/i.test(content);
    const hasUpdate = /update|edit/i.test(content);
    const hasDelete = /delete|remove/i.test(content);
    
    pages.push({
      name: componentName,
      file: file.replace(/\\/g, '/'),
      operations: {
        list: hasList,
        create: hasCreate,
        update: hasUpdate,
        delete: hasDelete
      }
    });
  }
  
  console.log(`   ✓ Found ${pages.length} pages`);
  return pages;
}

async function analyzeFrontendServices() {
  console.log('🔌 Analyzing frontend services...');
  const services = [];
  const serviceFiles = await glob('frontend/src/services/*Service.ts', {
    cwd: PROJECT_ROOT
  });

  for (const file of serviceFiles) {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, file), 'utf-8');
    const serviceName = path.basename(file, '.ts');
    
    // Extract API calls
    const apiCalls = [];
    const exportRegex = /export\s+const\s+(\w+)\s*=\s*\([^)]*\)\s*(?::\s*Promise<[^>]+>)?\s*=>\s*{[^}]*api\.(\w+)\([^)]*\)/g;
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      apiCalls.push({
        name: match[1],
        method: match[2].toUpperCase()
      });
    }
    
    services.push({
      name: serviceName,
      file: file.replace(/\\/g, '/'),
      apiCalls
    });
  }
  
  console.log(`   ✓ Found ${services.length} services`);
  return services;
}

async function analyzeFrontendRoutes() {
  console.log('🛣️  Analyzing frontend routes...');
  const appFile = path.join(PROJECT_ROOT, 'frontend/src/App.tsx');
  
  if (!fs.existsSync(appFile)) {
    console.log('   ⚠ App.tsx not found');
    return [];
  }
  
  const content = fs.readFileSync(appFile, 'utf-8');
  const routes = [];
  
  // Extract routes
  const routeRegex = /<Route\s+path="([^"]+)"\s+element={<(\w+)/g;
  let match;
  while ((match = routeRegex.exec(content)) !== null) {
    routes.push({
      path: match[1],
      component: match[2]
    });
  }
  
  console.log(`   ✓ Found ${routes.length} routes`);
  return routes;
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  try {
    const inventory = {
      generated: new Date().toISOString(),
      backend: {
        entities: await analyzeBackendEntities(),
        controllers: await analyzeBackendControllers(),
        services: await analyzeBackendServices()
      },
      frontend: {
        pages: await analyzeFrontendPages(),
        services: await analyzeFrontendServices(),
        routes: await analyzeFrontendRoutes()
      }
    };
    
    // Write to file
    const outputPath = path.join(PROJECT_ROOT, 'openspec', 'CODE_INVENTORY.json');
    fs.writeFileSync(outputPath, JSON.stringify(inventory, null, 2));
    
    console.log(`\n✅ Code inventory generated successfully!`);
    console.log(`📁 Output: ${outputPath}`);
    console.log(`\n📊 Summary:`);
    console.log(`   Backend: ${inventory.backend.entities.length} entities, ${inventory.backend.controllers.length} controllers, ${inventory.backend.services.length} services`);
    console.log(`   Frontend: ${inventory.frontend.pages.length} pages, ${inventory.frontend.services.length} services, ${inventory.frontend.routes.length} routes`);
    
  } catch (error) {
    console.error('❌ Error generating code inventory:', error);
    process.exit(1);
  }
}

main();
