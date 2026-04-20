// ============================================================
// lib/certification.js
// Helpers pour les appels Edge Functions certification/finance
// ============================================================
import { supabase } from './supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

async function getAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession()
  return { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' }
}

// ─── Tests de niveau ────────────────────────────────────────

/** Générer un test de niveau (appel Edge Function) */
export async function generateLevelTest(language) {
  const headers = await getAuthHeader()
  const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-level-test`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ language, action: 'generate' }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

/** Soumettre les réponses du test */
export async function submitLevelTest(testId, language, answers) {
  const headers = await getAuthHeader()
  const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-level-test`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ language, action: 'submit', testId, answers }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

/** Récupérer tous les tests de l'utilisateur */
export async function getUserTests(userId) {
  const { data, error } = await supabase
    .from('lingua_level_tests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

// ─── Certificats ────────────────────────────────────────────

/** Générer un certificat après un test réussi */
export async function generateCertificate(testId) {
  const headers = await getAuthHeader()
  const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-certificate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ testId }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

/** Récupérer les certificats de l'utilisateur */
export async function getUserCertificates(userId) {
  const { data, error } = await supabase
    .from('lingua_certificates')
    .select('*')
    .eq('user_id', userId)
    .order('issued_at', { ascending: false })
  if (error) throw error
  return data || []
}

/** Vérifier un certificat par code (public) */
export async function verifyCertificate(verificationCode) {
  const { data, error } = await supabase
    .from('lingua_certificates')
    .select('*')
    .eq('verification_code', verificationCode.trim().toUpperCase())
    .single()
  if (error) return null
  return data
}

/** Récupérer un certificat spécifique */
export async function getCertificate(certId, userId) {
  const { data, error } = await supabase
    .from('lingua_certificates')
    .select('*')
    .eq('id', certId)
    .eq('user_id', userId)
    .single()
  if (error) throw error
  return data
}

// ─── Finance (admin) ────────────────────────────────────────

const ADMIN_KEY = import.meta.env.VITE_ADMIN_SECRET_KEY

async function adminFetch(action, params = {}) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-finance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Key': ADMIN_KEY },
    body: JSON.stringify({ action, params }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const finance = {
  getMonthlySummary:    ()             => adminFetch('monthly_summary'),
  getTransactions:      (params)       => adminFetch('transactions', params),
  getSubscribers:       ()             => adminFetch('subscribers'),
  getCertificationStats:()             => adminFetch('certification_stats'),
  addExpense:           (params)       => adminFetch('add_expense', params),
  exportCSV:            async (month) => {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-finance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': ADMIN_KEY },
      body: JSON.stringify({ action: 'export_csv', params: { month } }),
    })
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `lingua-finance-${month || 'all'}.csv`
    a.click()
  },
}

// ─── Reçus ──────────────────────────────────────────────────

/** Déclencher la génération d'un reçu pour un abonnement */
export async function generateReceipt(subscriptionId, userId) {
  const headers = await getAuthHeader()
  const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-receipt`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ subscriptionId, userId }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

/** Récupérer les reçus de l'utilisateur */
export async function getUserReceipts(userId) {
  const { data, error } = await supabase
    .from('lingua_transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('direction', 'income')
    .not('receipt_number', 'is', null)
    .order('transaction_date', { ascending: false })
  if (error) throw error
  return data || []
}

// ─── Constantes utiles ───────────────────────────────────────
export const CERT_PRICES = {
  test:      5000,  // FCFA — premier test
  retake:    3000,  // FCFA — repassage (après 3 mois)
  duplicate: 1000,  // FCFA — duplicata PDF
}

export const LEVEL_DESCRIPTIONS = {
  A1: { label: 'Découverte',            desc: 'Peut comprendre et utiliser des expressions familières.' },
  A2: { label: 'Élémentaire',           desc: 'Peut communiquer lors de tâches simples et habituelles.' },
  B1: { label: 'Intermédiaire',         desc: 'Peut se débrouiller dans la plupart des situations.' },
  B2: { label: 'Intermédiaire avancé',  desc: 'Peut comprendre des textes complexes et interagir spontanément.' },
  C1: { label: 'Autonome',              desc: 'Peut utiliser la langue de façon efficace et flexible.' },
  C2: { label: 'Maîtrise',              desc: 'Peut comprendre pratiquement tout ce qu\'il entend ou lit.' },
}

export const SCORE_WEIGHTS = {
  listening: 0.35,
  reading:   0.30,
  grammar:   0.25,
  writing:   0.10,
}

export function calculateGlobalScore(scores) {
  return Math.round(
    (scores.listening || 0) * SCORE_WEIGHTS.listening +
    (scores.reading   || 0) * SCORE_WEIGHTS.reading   +
    (scores.grammar   || 0) * SCORE_WEIGHTS.grammar   +
    (scores.writing   || 0) * SCORE_WEIGHTS.writing
  )
}

export function scoreToLevel(score) {
  if (score >= 90) return 'C2'
  if (score >= 75) return 'C1'
  if (score >= 60) return 'B2'
  if (score >= 45) return 'B1'
  if (score >= 25) return 'A2'
  return 'A1'
}