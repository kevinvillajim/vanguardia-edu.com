#!/usr/bin/env node

/**
 * Migration script to update imports from old duplicated components to new consolidated shared components
 * Usage: node scripts/migrate-imports.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { readdir, readFile, writeFile, stat } = fs.promises;

// Import mappings from old locations to new shared components
const importMappings = {
  // Input component mappings
  'from "./Input/Input"': 'from "@/shared/components/ui"',
  'from "../Input/Input"': 'from "@/shared/components/ui"',
  'from "../../Input/Input"': 'from "@/shared/components/ui"',
  'from "../../../components/ui/Input/Input"': 'from "@/shared/components/ui"',
  
  // ErrorBoundary mappings
  'from "./ErrorBoundary/ErrorBoundary"': 'from "@/shared/components/ErrorBoundary/ErrorBoundary"',
  'from "../ErrorBoundary/ErrorBoundary"': 'from "@/shared/components/ErrorBoundary/ErrorBoundary"',
  'from "../../ErrorBoundary/ErrorBoundary"': 'from "@/shared/components/ErrorBoundary/ErrorBoundary"',
  'from "../../../components/ui/ErrorBoundary/ErrorBoundary"': 'from "@/shared/components/ErrorBoundary/ErrorBoundary"',
  
  // Loading component mappings
  'from "./Loading/LoadingSpinner"': 'from "@/shared/components/ui"',
  'from "../Loading/LoadingSpinner"': 'from "@/shared/components/ui"',
  'from "./Loading/LoadingOverlay"': 'from "@/shared/components/ui"',
  'from "../Loading/LoadingOverlay"': 'from "@/shared/components/ui"',
  'from "./LoadingScreen"': 'from "@/shared/components/ui"',
  'from "../LoadingScreen"': 'from "@/shared/components/ui"',
  'from "../../../components/ui/Loading/LoadingSpinner"': 'from "@/shared/components/ui"',
  'from "../../../components/ui/Loading/LoadingOverlay"': 'from "@/shared/components/ui"',
  'from "../../../components/ui/LoadingScreen"': 'from "@/shared/components/ui"',
  
  // Tabs component mappings
  'from "./Tabs/Tabs"': 'from "@/shared/components/ui"',
  'from "../Tabs/Tabs"': 'from "@/shared/components/ui"',
  'from "./Navigation/Tabs"': 'from "@/shared/components/ui"',
  'from "../Navigation/Tabs"': 'from "@/shared/components/ui"',
  'from "./VTabs/VTabs"': 'from "@/shared/components/ui"',
  'from "../VTabs/VTabs"': 'from "@/shared/components/ui"',
  'from "../../../components/ui/Tabs/Tabs"': 'from "@/shared/components/ui"',
  'from "../../../components/ui/Navigation/Tabs"': 'from "@/shared/components/ui"',
  'from "../../../components/ui/VTabs/VTabs"': 'from "@/shared/components/ui"',
  
  // About component mappings
  'from "./About/About"': 'from "@/shared/components/layout"',
  'from "../About/About"': 'from "@/shared/components/layout"',
  'from "../../About/About"': 'from "@/shared/components/layout"',
  'from "../../../components/layout/About/About"': 'from "@/shared/components/layout"',
  'from "../../../components/layout/About/AboutOld"': 'from "@/shared/components/layout"',
  
  // Button and Card (already consolidated)
  'from "../../../components/ui/Button/Button"': 'from "@/shared/components/ui"',
  'from "../../../components/ui/Card/Card"': 'from "@/shared/components/ui"',
  
  // Import statement replacements for component names
  'import LoadingSpinner from': 'import { LoadingSpinner } from',
  'import LoadingOverlay from': 'import { LoadingOverlay } from',
  'import LoadingScreen from': 'import { LoadingScreen } from',
  'import Tabs from': 'import { Tabs } from',
  'import VerticalTabs from': 'import { VerticalTabs } from',
  'import About from': 'import { About } from',
};

// Component usage replacements (for cases where component usage needs to be updated)
const componentReplacements = {
  // VTabs to VerticalTabs
  '<VTabs': '<VerticalTabs',
  '</VTabs>': '</VerticalTabs>',
  'VTabs.': 'VerticalTabs.',
  
  // AboutOld to About
  '<AboutOld': '<About variant="corporate"',
  '</AboutOld>': '</About>',
  'AboutOld.': 'About.',
  
  // Motion library standardization
  'from "motion/react"': 'from "framer-motion"',
  'from "motion"': 'from "framer-motion"',
};

async function walkDirectory(dir, callback) {
  const files = await readdir(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const fileStat = await stat(filePath);
    
    if (fileStat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      await walkDirectory(filePath, callback);
    } else if (fileStat.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js'))) {
      await callback(filePath);
    }
  }
}

async function migrateFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    let newContent = content;
    let hasChanges = false;
    
    // Apply import mappings
    for (const [oldImport, newImport] of Object.entries(importMappings)) {
      if (newContent.includes(oldImport)) {
        newContent = newContent.replace(new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImport);
        hasChanges = true;
      }
    }
    
    // Apply component replacements
    for (const [oldUsage, newUsage] of Object.entries(componentReplacements)) {
      if (newContent.includes(oldUsage)) {
        newContent = newContent.replace(new RegExp(oldUsage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newUsage);
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      await writeFile(filePath, newContent, 'utf8');
      console.log(`✅ Migrated: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error migrating ${filePath}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting component import migration...\n');
  
  const srcPath = path.join(__dirname, '../src');
  
  try {
    await walkDirectory(srcPath, migrateFile);
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Review the changed files');
    console.log('2. Test your application');
    console.log('3. Remove any remaining unused component files');
    console.log('4. Update your tsconfig.json paths if needed');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (typeof process !== 'undefined') {
      process.exit(1);
    }
  }
}

// Run the migration
main();