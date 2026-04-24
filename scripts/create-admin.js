// Script pour créer un super_admin via Supabase Service Role
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Variables manquantes dans .env')
  console.error('VITE_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', SERVICE_ROLE_KEY ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
})

async function createSuperAdmin() {
  if (process.argv.length < 5) {
    console.error('Usage: node create-admin.js <email> <password> "<full name>"')
    console.error('Example: node create-admin.js admin@lingua.space admin123 "Super Admin"')
    process.exit(1)
  }
  const email = process.argv[2]
  const password = process.argv[3]
  const fullName = process.argv[4] || 'Super Admin'

  console.log(`📝 Création de ${email}...`)

  try {
    // 1. Créer l'utilisateur dans auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  Utilisateur existe déjà dans auth.users, continuation...')
        // Récupérer l'utilisateur existant
        const { data: existing } = await supabase.auth.admin.listUsers()
        const user = existing.users.find(u => u.email === email)
        if (!user) throw new Error('Utilisateur non trouvé')
        await ensureLinguaUser(user.id, email, fullName)
        return
      }
      throw authError
    }

    console.log('✅ Utilisateur auth créé:', authUser.user.id)

    // 2. Créer/updater l'entrée dans lingua_users
    await ensureLinguaUser(authUser.user.id, email, fullName)

    console.log('🎉 Super admin créé avec succès!')
    console.log('Email:', email)
    console.log('Mot de passe:', password)
    console.log('\n⚠️  Changez le mot de passe après la première connexion.')
    console.log('\nAccès admin:')
    console.log('1. Allez sur', process.env.VITE_APP_URL || 'http://localhost:5173')
    console.log('2. Connectez-vous avec', email)
    console.log('3. Accédez à /admin')

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  }
}

async function ensureLinguaUser(userId, email, fullName) {
  const { data, error } = await supabase
    .from('lingua_users')
    .upsert({
      id: userId,
      email,
      full_name: fullName,
      role: 'super_admin',
      status: 'active'
    }, { onConflict: 'id' })
    .select()

  if (error) {
    console.error('Erreur création lingua_users:', error)
    throw error
  }

  console.log('✅ Entrée lingua_users créée/mise à jour avec rôle super_admin')
  return data
}

// Exécution
createSuperAdmin()