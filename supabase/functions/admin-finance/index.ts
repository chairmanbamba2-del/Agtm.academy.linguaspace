// ============================================================
// EDGE FUNCTION : admin-finance
// API sécurisée (service role uniquement) pour les données
// financières du tableau de bord admin
// ============================================================
import { createClient } from 'npm:@supabase/supabase-js'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, GET',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    // Vérifier l'admin via un header secret
    const adminKey = req.headers.get('X-Admin-Key')
    if (adminKey !== Deno.env.get('ADMIN_SECRET_KEY')) {
      return new Response('Forbidden', { status: 403 })
    }

    const { action, params = {} } = await req.json()

    // ── Résumé financier mensuel ────────────────────────────
    if (action === 'monthly_summary') {
      const { data } = await supabase
        .from('lingua_financial_summary')
        .select('*')
        .limit(12)
      return ok(data)
    }

    // ── Transactions avec filtres ───────────────────────────
    if (action === 'transactions') {
      const { direction, type, month, limit = 50, offset = 0 } = params as any

      let query = supabase
        .from('lingua_transactions')
        .select('*, lingua_users(full_name, email, phone)', { count: 'exact' })
        .order('transaction_date', { ascending: false })
        .range(offset, offset + limit - 1)

      if (direction && direction !== 'all') query = query.eq('direction', direction)
      if (type && type !== 'all')           query = query.eq('type', type)
      if (month) {
        const start = new Date(month + '-01')
        const end   = new Date(start)
        end.setMonth(end.getMonth() + 1)
        query = query
          .gte('transaction_date', start.toISOString())
          .lt('transaction_date', end.toISOString())
      }

      const { data, count } = await query
      return ok({ data, total: count })
    }

    // ── Abonnés actifs ─────────────────────────────────────
    if (action === 'subscribers') {
      const { data } = await supabase
        .from('lingua_active_subscribers')
        .select('*')
      return ok(data)
    }

    // ── Stats certifications ───────────────────────────────
    if (action === 'certification_stats') {
      const [testsRes, certsRes] = await Promise.all([
        supabase.from('lingua_level_tests').select('language, status, score_global, level_obtained, created_at'),
        supabase.from('lingua_certificates').select('language, level_certified, score_global, issued_at'),
      ])

      const tests = testsRes.data || []
      const certs = certsRes.data || []

      const stats = {
        total_tests:        tests.length,
        passed_tests:       tests.filter(t => t.status === 'completed').length,
        failed_tests:       tests.filter(t => t.status === 'failed').length,
        total_certificates: certs.length,
        avg_score:          certs.length ? Math.round(certs.reduce((s, c) => s + (c.score_global || 0), 0) / certs.length) : 0,
        by_language: ['en','fr','es','de'].map(lang => ({
          language:    lang,
          tests:       tests.filter(t => t.language === lang).length,
          certs:       certs.filter(c => c.language === lang).length,
          avg_score:   (() => {
            const lc = certs.filter(c => c.language === lang)
            return lc.length ? Math.round(lc.reduce((s,c) => s + (c.score_global||0), 0) / lc.length) : 0
          })(),
        })),
        by_level: ['A1','A2','B1','B2','C1','C2'].map(level => ({
          level,
          count: certs.filter(c => c.level_certified === level).length,
        })),
      }

      return ok(stats)
    }

    // ── Ajouter une dépense manuelle ───────────────────────
    if (action === 'add_expense') {
      const { category, description, amount_fcfa, amount_usd, exchange_rate, vendor, invoice_ref } = params as any

      // Créer la transaction dépense
      const receiptRes = await supabase.rpc('generate_receipt_number')
      const expenseNum = receiptRes.data || `EXP-${Date.now()}`

      const { data, error } = await supabase
        .from('lingua_transactions')
        .insert({
          type:            'expense',
          direction:       'expense',
          amount_fcfa,
          currency:        'XOF',
          description,
          category,
          receipt_number:  expenseNum,
          status:          'confirmed',
          transaction_date: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      // Aussi dans lingua_expenses pour le détail
      await supabase.from('lingua_expenses').insert({
        category, description, amount_fcfa,
        amount_usd: amount_usd || null,
        exchange_rate: exchange_rate || null,
        vendor: vendor || null,
        invoice_ref: invoice_ref || null,
      })

      return ok(data)
    }

    // ── Export CSV complet ─────────────────────────────────
    if (action === 'export_csv') {
      const { month } = params as any
      let query = supabase
        .from('lingua_transactions')
        .select('*, lingua_users(full_name, email)')
        .order('transaction_date', { ascending: false })

      if (month) {
        const start = new Date(month + '-01')
        const end   = new Date(start)
        end.setMonth(end.getMonth() + 1)
        query = query.gte('transaction_date', start.toISOString()).lt('transaction_date', end.toISOString())
      }

      const { data } = await query
      const rows = (data || []).map(t => [
        new Date(t.transaction_date).toLocaleDateString('fr-FR'),
        t.receipt_number || '',
        (t as any).lingua_users?.full_name || '',
        (t as any).lingua_users?.email || '',
        t.type, t.category || '',
        t.direction,
        t.amount_fcfa,
        t.payment_method || '',
        t.payment_ref || '',
        t.status,
        t.description,
      ])

      const headers = ['Date','Reçu','Nom','Email','Type','Catégorie','Direction','Montant FCFA','Méthode','Référence paiement','Statut','Description']
      const csv = [headers, ...rows].map(r => r.join(';')).join('\n')

      return new Response(csv, {
        headers: {
          ...CORS,
          'Content-Type':        'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="lingua-finance-${month || 'all'}.csv"`,
        }
      })
    }

    return new Response('Unknown action', { status: 400 })

  } catch (error) {
    console.error('admin-finance error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' }
    })
  }
})

function ok(data: any) {
  return new Response(JSON.stringify(data), {
    headers: { ...CORS, 'Content-Type': 'application/json' }
  })
}