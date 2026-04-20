// ============================================================
// Marketing.jsx — Espace Marketing AGTM
// Accessible uniquement aux administrateurs
// Route : /admin/marketing
// ============================================================
import AppLayout from '../../components/layout/AppLayout'

const PDF_BASE_URL = '/marketing/2026'

const BROCHURES = [
  {
    title: 'Brochure principale AGTM 2026',
    pdf: `${PDF_BASE_URL}/agtm-brochure-marketing-2026.pdf`,
    preview: `${PDF_BASE_URL}/agtm-brochure-marketing-2026-hero.jpg`,
    size: '4.8 MB',
  },
  {
    title: 'Fiches 6 Programmes 2026',
    pdf: `${PDF_BASE_URL}/agtm-visuels-programmes-2026.pdf`,
    preview: `${PDF_BASE_URL}/agtm-visuels-programmes-2026-hero.jpg`,
    size: '2.2 MB',
  },
  {
    title: 'Brochure LINGUA SPACE 2026',
    pdf: `${PDF_BASE_URL}/lingua-space-marketing-2026.pdf`,
    preview: `${PDF_BASE_URL}/lingua-space-marketing-2026-hero.jpg`,
    size: '3.9 MB',
  },
]

const SOCIAL_AGTM = [
  { name: 'Instagram / Facebook Post', file: 'social-agtm-instagram-1080x1080.jpg', size: '94 KB' },
  { name: 'Instagram Story', file: 'social-agtm-story-1080x1920.jpg', size: '190 KB' },
  { name: 'LinkedIn / Twitter', file: 'social-agtm-linkedin-1200x627.jpg', size: '76 KB' },
]

const SOCIAL_LINGUA = [
  { name: 'Instagram / Facebook Post', file: 'social-lingua-instagram-1080x1080.jpg', size: '91 KB' },
  { name: 'Instagram Story', file: 'social-lingua-story-1080x1920.jpg', size: '164 KB' },
  { name: 'LinkedIn / Twitter', file: 'social-lingua-linkedin-1200x627.jpg', size: '72 KB' },
]

const TARIFS = [
  { programme: 'Anglais Général', niveaux: 'A1→C1', durée: '3–12 mois', tarif: '40 000 FCFA/mois' },
  { programme: 'Business English', niveaux: 'B1→C1', durée: '2–6 mois', tarif: '50 000 FCFA/mois' },
  { programme: 'Préparation TOEIC', niveaux: 'B1→B2', durée: '2–3 mois', tarif: '70 000 FCFA/mois' },
  { programme: 'Préparation TOEFL', niveaux: 'B2→C1', durée: '3–4 mois', tarif: '70 000 FCFA/mois' },
  { programme: 'Préparation BAC/BEPC', niveaux: 'Collège/Lycée', durée: '1–3 mois', tarif: '30 000 FCFA/mois' },
  { programme: 'Kids & Teens English', niveaux: '6–17 ans', durée: 'Annuel', tarif: '25 000 FCFA/mois' },
]

export default function Marketing() {
  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="font-mono text-[10px] tracking-widest text-gold uppercase mb-1">Administration</div>
          <h1 className="font-serif text-3xl text-white">Espace <em className="text-gold italic">Marketing</em></h1>
          <p className="text-sm text-muted mt-1">Supports de communication 2026 · Grille tarifaire officielle</p>
        </div>
      </div>

      {/* Section 1 : Brochures PDF */}
      <div className="card p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded bg-gold/15 flex items-center justify-center">
            <span className="text-gold">📘</span>
          </div>
          <h2 className="font-serif text-xl text-white">Brochures PDF</h2>
        </div>
        <p className="text-sm text-muted mb-6">Documents officiels AGTM Digital Academy · Téléchargement direct</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BROCHURES.map(b => (
            <div key={b.title} className="border border-[#1E3A5F] rounded-sm overflow-hidden hover:border-gold/40 transition-colors">
              <a href={b.preview} target="_blank" rel="noreferrer" className="block relative">
                <img src={b.preview} alt={b.title} className="w-full h-48 object-cover" />
                <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-mono px-2 py-1 rounded">
                  {b.size}
                </div>
              </a>
              <div className="p-4">
                <h3 className="font-serif text-white text-lg mb-2">{b.title}</h3>
                <div className="flex items-center justify-between">
                  <a href={b.pdf} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gold text-dark text-sm font-semibold rounded-sm hover:bg-gold-lt transition-all">
                    ⬇ Télécharger PDF
                  </a>
                  <span className="font-mono text-xs text-muted">PDF</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2 : Visuels réseaux sociaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* AGTM */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded bg-blue/15 flex items-center justify-center">
              <span className="text-blue">🏢</span>
            </div>
            <h2 className="font-serif text-xl text-white">Visuels AGTM</h2>
          </div>
          <p className="text-sm text-muted mb-4">Réseaux sociaux · Format prêt à poster</p>
          <div className="space-y-3">
            {SOCIAL_AGTM.map(s => (
              <div key={s.file} className="flex items-center justify-between p-3 border border-white/5 rounded-sm hover:bg-white/2 transition-colors">
                <div>
                  <div className="font-medium text-white">{s.name}</div>
                  <div className="font-mono text-[10px] text-muted">{s.size} · JPG</div>
                </div>
                <a href={`${PDF_BASE_URL}/${s.file}`} download
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/10 text-white text-sm rounded-sm hover:bg-white/20 transition-colors">
                  <span>⬇</span> Télécharger
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* LINGUA SPACE */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded bg-green/15 flex items-center justify-center">
              <span className="text-green">🌐</span>
            </div>
            <h2 className="font-serif text-xl text-white">Visuels LINGUA SPACE</h2>
          </div>
          <p className="text-sm text-muted mb-4">Réseaux sociaux · Format prêt à poster</p>
          <div className="space-y-3">
            {SOCIAL_LINGUA.map(s => (
              <div key={s.file} className="flex items-center justify-between p-3 border border-white/5 rounded-sm hover:bg-white/2 transition-colors">
                <div>
                  <div className="font-medium text-white">{s.name}</div>
                  <div className="font-mono text-[10px] text-muted">{s.size} · JPG</div>
                </div>
                <a href={`${PDF_BASE_URL}/${s.file}`} download
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/10 text-white text-sm rounded-sm hover:bg-white/20 transition-colors">
                  <span>⬇</span> Télécharger
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3 : Grille tarifaire */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded bg-gold/15 flex items-center justify-center">
            <span className="text-gold">💰</span>
          </div>
          <h2 className="font-serif text-xl text-white">Grille tarifaire officielle 2026</h2>
        </div>
        <p className="text-sm text-muted mb-6">Tarifs mensuels pour chaque programme · Abonnements trimestriel (–10%) et annuel (–20%)</p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: 'rgba(27,79,138,0.12)' }}>
                <th className="px-4 py-3 text-left text-[10px] font-mono tracking-widest text-muted uppercase">Programme</th>
                <th className="px-4 py-3 text-left text-[10px] font-mono tracking-widest text-muted uppercase">Niveaux</th>
                <th className="px-4 py-3 text-left text-[10px] font-mono tracking-widest text-muted uppercase">Durée</th>
                <th className="px-4 py-3 text-left text-[10px] font-mono tracking-widest text-muted uppercase">Tarif/mois</th>
              </tr>
            </thead>
            <tbody>
              {TARIFS.map((t, idx) => (
                <tr key={idx} className="border-b border-white/4 hover:bg-white/2">
                  <td className="px-4 py-4 font-medium text-white">{t.programme}</td>
                  <td className="px-4 py-4">
                    <span className="font-mono text-xs px-2 py-1 rounded border border-gold/30 text-gold bg-gold/10">
                      {t.niveaux}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">{t.durée}</td>
                  <td className="px-4 py-4">
                    <span className="font-serif text-lg text-gold">{t.tarif}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-blue/5 border border-blue/20 rounded-sm">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gold">💡</span>
            <span className="text-white">Remises :</span>
            <span className="font-mono text-xs text-muted">–10% pour les inscriptions trimestrielles · –20% pour les inscriptions annuelles</span>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-muted font-mono tracking-widest">
        Dernière mise à jour : avril 2026 · AGTM Digital Academy · Directeur Général ISSA BAMBA
      </div>
    </AppLayout>
  )
}