// Quick integration test script
const fs = require('fs');
const path = require('path');

console.log('🔍 CALMe Integration Test\n');

// Check required files
const requiredFiles = [
  'src/App.tsx',
  'src/parser/semanticParser.ts',
  'src/components/ChatMessage.tsx',
  'src/components/ChatInput.tsx',
  'src/activities/breathing_module/BreathingExercise.tsx',
  'src/activities/MatchingGame.tsx',
  'src/conversation/ConversationController.ts',
  'src/appsContextApi.tsx',
  'package.json',
  'vite.config.ts',
  'tailwind.config.js'
];

console.log('📁 Checking required files:');
let allFilesExist = true;
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

console.log('\n📦 Checking dependencies:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = ['react', 'compromise', 'lucide-react', 'sonner', 'tailwindcss'];
requiredDeps.forEach(dep => {
  const hasDep = packageJson.dependencies[dep] || packageJson.devDependencies[dep];
  console.log(`  ${hasDep ? '✅' : '❌'} ${dep}`);
});

console.log('\n🏗️  Architecture structure:');
const dirs = ['src/parser', 'src/components', 'src/activities', 'src/conversation'];
dirs.forEach(dir => {
  const exists = fs.existsSync(dir);
  console.log(`  ${exists ? '✅' : '❌'} ${dir}/`);
});

console.log('\n' + (allFilesExist ? '✅ All files present!' : '❌ Some files missing!'));