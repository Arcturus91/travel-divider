/**
 * Lambda TypeScript Build Script
 * 
 * This script compiles TypeScript Lambda functions in the src/functions directory
 * and prepares them for SAM deployment.
 * 
 * Usage: node scripts/build-lambda.js [--function=functionName]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { program } = require('commander');

program
  .option('-f, --function <name>', 'Build a specific function only')
  .option('-v, --verbose', 'Verbose output')
  .parse(process.argv);

const options = program.opts();
const functionsDir = path.join(__dirname, '..', 'src', 'functions');
const verbose = options.verbose;

// Function to check if a directory contains TypeScript files
function hasTypeScriptFiles(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    return files.some(file => file.endsWith('.ts'));
  } catch (err) {
    console.error(`Error reading directory ${dirPath}:`, err);
    return false;
  }
}

// Function to create a tsconfig.json file if it doesn't exist
function ensureTsConfig(functionDir, functionName) {
  const tsConfigPath = path.join(functionDir, 'tsconfig.json');
  
  if (!fs.existsSync(tsConfigPath)) {
    console.log(`Creating tsconfig.json for ${functionName}`);
    
    const tsConfig = {
      "extends": "../../../tsconfig.json",
      "compilerOptions": {
        "outDir": "dist",
        "rootDir": "./",
        "baseUrl": "./",
        "sourceMap": true,
        "resolveJsonModule": true,
        "declaration": false
      },
      "include": [
        "./**/*.ts"
      ],
      "exclude": [
        "node_modules",
        "dist"
      ]
    };
    
    fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));
  }
}

// Function to build a single Lambda function
function buildFunction(functionName) {
  const functionDir = path.join(functionsDir, functionName);
  
  if (!fs.existsSync(functionDir)) {
    console.error(`Function directory "${functionName}" not found`);
    return false;
  }
  
  if (!hasTypeScriptFiles(functionDir)) {
    if (verbose) {
      console.log(`Skipping ${functionName}: No TypeScript files found`);
    }
    return true;
  }
  
  try {
    console.log(`Building function: ${functionName}`);
    
    // Ensure tsconfig.json exists
    ensureTsConfig(functionDir, functionName);
    
    // Compile TypeScript
    const distDir = path.join(functionDir, 'dist');
    
    // Create dist directory if it doesn't exist
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    
    // Run TypeScript compiler
    const tscCommand = `npx tsc -p ${path.join(functionDir, 'tsconfig.json')}`;
    if (verbose) {
      console.log(`Running: ${tscCommand}`);
    }
    
    execSync(tscCommand, { stdio: verbose ? 'inherit' : 'pipe' });
    
    // Copy package.json to dist directory if it exists
    const packageJsonPath = path.join(functionDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      fs.copyFileSync(packageJsonPath, path.join(distDir, 'package.json'));
    }
    
    // Install dependencies in dist directory if package.json exists
    if (fs.existsSync(path.join(distDir, 'package.json'))) {
      console.log(`Installing dependencies for ${functionName}`);
      execSync('npm install --production', { 
        cwd: distDir,
        stdio: verbose ? 'inherit' : 'pipe'
      });
    }
    
    console.log(`Successfully built function: ${functionName}`);
    return true;
  } catch (err) {
    console.error(`Failed to build function ${functionName}:`, err);
    return false;
  }
}

// Main execution
try {
  if (options.function) {
    // Build a specific function
    const success = buildFunction(options.function);
    process.exit(success ? 0 : 1);
  } else {
    // Build all functions
    console.log('Building all Lambda functions...');
    const functionDirs = fs.readdirSync(functionsDir);
    
    const results = functionDirs
      .filter(dir => fs.statSync(path.join(functionsDir, dir)).isDirectory())
      .map(functionName => {
        const success = buildFunction(functionName);
        return { functionName, success };
      });
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`Build complete: ${successful} successful, ${failed} failed`);
    
    if (failed > 0) {
      console.log('Failed functions:');
      results
        .filter(r => !r.success)
        .forEach(r => console.log(`- ${r.functionName}`));
      process.exit(1);
    }
    
    process.exit(0);
  }
} catch (err) {
  console.error('Build failed:', err);
  process.exit(1);
}