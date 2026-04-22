#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
const envPath = join(__dirname, '..', '.env');
let envContent;
try {
  envContent = readFileSync(envPath, 'utf8');
} catch (error) {
  console.error('❌ Impossible de lire le fichier .env');
  process.exit(1);
}

// Extract Supabase service role key
const serviceRoleMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
const serviceRoleKey = serviceRoleMatch ? serviceRoleMatch[1].trim() : null;
if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY non trouvée dans .env');
  process.exit(1);
}

// Extract Supabase URL and project ref
const urlMatch = envContent.match(/VITE_SUPABASE_URL=(https?:\/\/[^\/]+)/);
const supabaseUrl = urlMatch ? urlMatch[1] : null;
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL non trouvée dans .env');
  process.exit(1);
}
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

console.log(`🔗 Project ref: ${projectRef}`);
console.log(`🔗 Supabase URL: ${supabaseUrl}`);

try {
  // Set environment variable for supabase CLI
  process.env.SUPABASE_SERVICE_ROLE_KEY = serviceRoleKey;
  
  // Change to supabase directory
  const supabaseDir = join(__dirname, '..', 'supabase');
  
  // Link project (if not already linked)
  console.log('🔗 Liaison du projet Supabase...');
  try {
    execSync(`supabase link --project-ref ${projectRef} --password "${serviceRoleKey}"`, {
      cwd: supabaseDir,
      stdio: 'inherit',
      shell: true
    });
  } catch (linkError) {
    // If already linked, ignore error
    console.log('⚠️  Le projet est peut-être déjà lié, continuation...');
  }
  
  // Push migrations
  console.log('🚀 Poussage des migrations vers Supabase...');
  execSync('supabase db push --linked', {
    cwd: supabaseDir,
    stdio: 'inherit',
    shell: true
  });
  
  console.log('✅ Migrations appliquées avec succès !');
} catch (error) {
  console.error('❌ Erreur lors de l\'application des migrations :', error.message);
  process.exit(1);
}