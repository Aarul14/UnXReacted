#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Setting up your Unreacted project...');

const projectName = process.argv[2];
if (!projectName) {
  console.error('Please specify the project directory:');
  console.log('  npx unreacted <project-directory>');
  console.log();
  console.log('For example:');
  console.log('  npx unreacted my-unreacted-app');
  process.exit(1);
}

const projectPath = path.resolve(process.cwd(), projectName);
const projectNameBase = path.basename(projectPath);
const isCurrentDirectory = projectPath === process.cwd();

if (fs.existsSync(projectPath)) {
    if (isCurrentDirectory) {
        const files = fs.readdirSync(projectPath);
        if (files.length > 0) {
            console.warn(`
Warning: Target directory "${projectNameBase}" is not empty. Files may be overwritten.
`);
        }
    } else {
        console.error(`Directory "${projectName}" already exists!`);
        process.exit(1);
    }
} else {
    if (!isCurrentDirectory) {
        fs.mkdirSync(projectPath);
        console.log(`Created directory: ${projectNameBase}`);
    }
}

const templateDir = path.resolve(__dirname, '../template');

if (!fs.existsSync(templateDir)) {
    console.error(`Template directory not found at ${templateDir}.`);
    console.error('Please ensure a "template" directory exists with your starter files.')
    fs.removeSync(projectPath);
    process.exit(1);
}

try {
  fs.copySync(templateDir, projectPath, { overwrite: true });
  console.log('Copied template files.');

  console.log(`\nSuccess! Your Unreacted project "${projectNameBase}" is ready.`);
  console.log('\nTo get started:');

  if (!isCurrentDirectory) {
    console.log(`  cd ${projectNameBase}`);
  }

  console.log(`  Install dependencies:`);
  console.log(`    npm install or yarn install or pnpm install or bun install`);
  console.log(`  Build the project:`);
  console.log(`    npm run build or yarn build or pnpm build or bun run build`);
  console.log(`  Start the dev server:`);
  console.log(`    npm run dev or yarn dev or pnpm dev or bun run dev`);

} catch (error) {
  console.error('\nError setting up project:', error);
  console.log(`Cleaning up ${projectPath}...`);
  fs.removeSync(projectPath);
  process.exit(1);
}