import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// Données des programmes
const PROGRAMMES = [
  { icone: '🌍', nom: 'Anglais Général', niveaux: 'A1→C1', duree: '3–12 mois', tarif: '40 000 FCFA/mois', mode: 'Présentiel / En ligne / Hybride' },
  { icone: '💼', nom: 'Business English', niveaux: 'B1→C1', duree: '2–6 mois', tarif: '50 000 FCFA/mois', mode: 'Présentiel / En ligne' },
  { icone: '🏆', nom: 'Préparation TOEIC', niveaux: 'B1→B2', duree: '2–3 mois', tarif: '70 000 FCFA/mois', mode: 'En ligne' },
  { icone: '🎓', nom: 'Préparation TOEFL', niveaux: 'B2→C1', duree: '3–4 mois', tarif: '70 000 FCFA/mois', mode: 'En ligne' },
  { icone: '📚', nom: 'Préparation BAC/BEPC', niveaux: 'Collège/Lycée', duree: '1–3 mois', tarif: '30 000 FCFA/mois', mode: 'Présentiel / En ligne' },
  { icone: '⭐', nom: 'Kids & Teens English', niveaux: '6–17 ans', duree: 'Annuel', tarif: '25 000 FCFA/mois', mode: 'Présentiel / En ligne' },
]

// Données technologie
const TECHNOLOGIES = [
  { icone: '🤖', titre: 'Assistant IA Claude 24h/24', desc: 'Coach personnel IA avec reconnaissance vocale, correction d\'écrits et score de prononciation. 3 tiers : Essentiel, Recommandé, Premium' },
  { icone: '🎥', titre: 'Live Class intégrée', desc: 'Google Meet synchronisé, quiz formateur en direct, pointage automatique, enregistrement mobile' },
  { icone: '📊', titre: 'Dashboard temps réel', desc: 'Notes, assiduité, progression, bulletins PDF — visible par l\'apprenant et ses parents' },
  { icone: '📱', titre: 'Application PWA mobile', desc: 'Installable sans App Store sur Android et iPhone. L\'académie dans votre poche' },
  { icone: '📋', titre: 'Pointage QR Code', desc: 'Présences 100% numériques, alertes absences automatiques, zéro papier' },
  { icone: '📄', titre: 'Génération PDF automatique', desc: 'Certificats, bulletins, contrats, brochures — générés en un clic à en-tête officielle' },
]

// Données espaces utilisateurs
const ESPACES = [
  { icone: '👑', role: 'Administrateur', desc: 'Gestion complète : étudiants, finance, RH, paramètres, marketing' },
  { icone: '👨‍🏫', role: 'Formateur', desc: 'Planning, présences, rapports PDF, tests, honoraires temps réel' },
  { icone: '🎓', role: 'Apprenant', desc: 'Notes, quiz, emploi du temps, English Corner, IA Coach, messagerie' },
  { icone: '📋', role: 'Secrétaire', desc: 'Inscriptions, classes, emplois du temps, messagerie administrative' },
]

// Données modes de formation
const MODES = [
  { icone: '💻', nom: '100% En Ligne', desc: 'Cours via Zoom & Google Meet depuis chez vous' },
  { icone: '🏫', nom: 'Présentiel', desc: 'En classe à Abidjan avec formateurs certifiés' },
  { icone: '🔄', nom: 'Hybride', desc: 'Combinez en ligne et présentiel selon votre agenda' },
  { icone: '🤖', nom: 'IA Coaching', desc: 'Pratique 24h/24 avec l\'assistant IA Claude' },
]

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Animation fade-in au scroll
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(el => {
        if (el.isIntersecting) {
          el.target.classList.add('visible')
          observer.unobserve(el.target)
        }
      })
    }, { threshold: 0.1 })

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-dark text-white overflow-hidden">
      {/* ============================================================ */}
      {/* SECTION 1 — NAVBAR fixe */}
      {/* ============================================================ */}
      <nav className="navbar fixed top-0 left-0 right-0 z-100 flex items-center justify-between px-6 md:px-10 py-4"
           style={{ background: 'rgba(8,15,26,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(232,148,26,0.12)' }}>
        {/* Logo AGTM + nom */}
        <Link to="/" className="nav-brand flex items-center gap-3">
          <div className="nav-logo w-10 h-10 bg-gold rounded-md flex items-center justify-center font-mono font-bold text-dark text-lg">AG</div>
          <div>
            <span className="brand-name block font-serif text-lg text-white">AGTM Digital Academy</span>
            <span className="brand-sub block font-mono text-[9px] tracking-[0.2em] text-muted uppercase">EIP English In Practice · Abidjan 🇨🇮</span>
          </div>
        </Link>

        {/* Liens desktop */}
        <ul className="nav-links hidden md:flex items-center gap-8">
          <li><a href="#formations" className="text-sm text-muted hover:text-white transition-colors">Formations</a></li>
          <li><a href="#technologie" className="text-sm text-muted hover:text-white transition-colors">Technologie</a></li>
          <li><a href="#corner" className="text-sm text-muted hover:text-white transition-colors">English Corner</a></li>
          <li><a href="#contact" className="text-sm text-muted hover:text-white transition-colors">Contact</a></li>
        </ul>

        {/* CTA */}
        <Link to="/login" className="btn-gold hidden md:flex items-center gap-2 text-sm py-2 px-5">
          <span>🔑</span> Se connecter
        </Link>

        {/* Burger menu mobile */}
        <button className="md:hidden text-white text-2xl" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Sidebar mobile */}
        {mobileMenuOpen && (
          <div className="mobile-menu absolute top-full left-0 right-0 bg-[rgba(8,15,26,0.98)] backdrop-blur-xl border-t border-gold/20 p-6 flex flex-col gap-4">
            <a href="#formations" onClick={() => setMobileMenuOpen(false)} className="text-white text-lg py-2 border-b border-white/10">Formations</a>
            <a href="#technologie" onClick={() => setMobileMenuOpen(false)} className="text-white text-lg py-2 border-b border-white/10">Technologie</a>
            <a href="#corner" onClick={() => setMobileMenuOpen(false)} className="text-white text-lg py-2 border-b border-white/10">English Corner</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="text-white text-lg py-2 border-b border-white/10">Contact</a>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-gold mt-4 text-center py-3">🔑 Se connecter</Link>
          </div>
        )}
      </nav>

      {/* ============================================================ */}
      {/* SECTION 2 — HERO (plein écran) */}
      {/* ============================================================ */}
      <section className="hero min-h-screen relative flex flex-col items-center justify-center text-center px-4 pt-24 pb-16 overflow-hidden">
        {/* Fond grille animée */}
        <div className="hero-grid absolute inset-0 opacity-30" />
        
        {/* Glow radial */}
        <div className="hero-glow absolute inset-0 bg-radial-gradient" />

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Badge pill */}
          <p className="font-mono text-xs tracking-[0.3em] text-gold uppercase mb-6 flex items-center justify-center gap-2">
            <span className="w-6 h-px bg-gold/50" />
            ✦ Abidjan, Côte d'Ivoire · Depuis 2020 ✦
            <span className="w-6 h-px bg-gold/50" />
          </p>

          {/* Label */}
          <p className="font-mono text-[10px] tracking-[0.35em] text-muted uppercase mb-2">AGTM GLOBAL ACADEMY · EIP ENGLISH IN PRACTICE</p>

          {/* Titre H1 */}
          <h1 className="font-serif font-light leading-none mb-6">
            <span className="block text-5xl md:text-7xl lg:text-8xl">L'anglais qui</span>
            <em className="block text-5xl md:text-7xl lg:text-8xl text-gold italic mt-2">transforme votre avenir</em>
          </h1>

          {/* Sous-titre */}
          <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            La première académie digitale d'anglais en Côte d'Ivoire alliant pédagogie certifiée, technologie IA et immersion quotidienne.
          </p>

          {/* 4 stats avec séparateurs */}
          <div className="hero-stats flex flex-wrap justify-center items-center gap-6 md:gap-0 mb-10">
            {[
              { nombre: '6', label: 'Programmes' },
              { nombre: '100', label: 'Modules A1→C2' },
              { nombre: '2 000+', label: 'Ressources/jour' },
              { nombre: '5', label: 'Espaces dédiés' },
            ].map((stat, idx) => (
              <div key={stat.label} className="h-stat relative px-6 md:px-10 text-center">
                <span className="h-stat-num block font-serif text-4xl md:text-5xl text-gold">{stat.nombre}</span>
                <span className="h-stat-lbl block font-mono text-xs tracking-[0.2em] text-muted uppercase mt-2">{stat.label}</span>
                {idx < 3 && <div className="hidden md:block separator absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-12 bg-gold/30" />}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="https://meet.google.com/ouv-jemj-kbp" target="_blank" rel="noreferrer"
               className="btn-gold flex items-center gap-2 text-sm py-3 px-8">
              🎓 Séance découverte GRATUITE
            </a>
            <a href="#formations" className="btn-outline flex items-center gap-2 text-sm py-3 px-8">
              Découvrir la plateforme →
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3 — BARRE TICKER (annonces défilantes) */}
      {/* ============================================================ */}
      <div className="ticker bg-[rgba(232,148,26,0.08)] border-y border-gold/15 py-2 overflow-hidden">
        <div className="ticker-inner flex whitespace-nowrap">
          {[
            '📚 Inscriptions ouvertes',
            '📞 Contactez-nous dès aujourd\'hui',
            '🏆 Niveaux A1 → C1 CECRL',
            '💻 Cours en ligne & présentiel',
            '🤖 Assistant IA Claude intégré',
            '🎓 Première séance GRATUITE',
          ].map((item, idx) => (
            <span key={idx} className="ticker-item font-mono text-xs tracking-[0.15em] text-gold uppercase px-8">
              {item}
            </span>
          ))}
          {/* Duplication pour effet boucle */}
          {[
            '📚 Inscriptions ouvertes',
            '📞 Contactez-nous dès aujourd\'hui',
            '🏆 Niveaux A1 → C1 CECRL',
            '💻 Cours en ligne & présentiel',
            '🤖 Assistant IA Claude intégré',
            '🎓 Première séance GRATUITE',
          ].map((item, idx) => (
            <span key={`dup-${idx}`} className="ticker-item font-mono text-xs tracking-[0.15em] text-gold uppercase px-8">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 4 — TECHNOLOGIE & IA */}
      {/* ============================================================ */}
      <section id="technologie" className="section py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="section-label">Innovation pédagogique</p>
          <h2 className="section-title">La pédagogie réinventée par <em className="text-gold italic">l'IA</em></h2>
          <p className="text-muted text-sm mt-4 max-w-2xl mx-auto">
            Une plateforme unique en Afrique de l'Ouest intégrant les dernières avancées en intelligence artificielle pour un apprentissage sur mesure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TECHNOLOGIES.map((tech, idx) => (
            <div key={idx} className="inno-card card p-6 hover:border-gold/40 transition-all duration-300 relative">
              <div className="text-3xl mb-4">{tech.icone}</div>
              <h3 className="font-serif text-xl text-white mb-3">{tech.titre}</h3>
              <p className="text-sm text-muted leading-relaxed">{tech.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5 — ENGLISH CORNER */}
      {/* ============================================================ */}
      <section id="corner" className="section py-20 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Gauche : Aperçu visuel */}
          <div className="card p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center text-gold text-xl">🎧</div>
              <h3 className="font-serif text-2xl text-white">English Corner</h3>
            </div>
            <p className="text-muted text-sm mb-8">2 000+ ressources renouvelées chaque jour</p>
            
            {/* Skill chips */}
            <div className="flex flex-wrap gap-2 mb-8">
              {[
                { label: 'Vidéos', color: 'chip-video' },
                { label: 'Écoute', color: 'chip-listen' },
                { label: 'Lecture', color: 'chip-read' },
                { label: 'Grammaire', color: 'chip-grammar' },
                { label: 'Vocabulaire', color: 'chip-vocab' },
                { label: 'Écriture', color: 'chip-writing' },
              ].map((chip) => (
                <span key={chip.label} className={`${chip.color} text-xs font-medium px-3 py-1.5 rounded-full border`}>
                  {chip.label}
                </span>
              ))}
            </div>

            {/* Compteurs */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { nombre: '794+', label: 'Playlists vidéo' },
                { nombre: '2 706', label: 'Épisodes audio' },
                { nombre: '140+', label: 'Thèmes vocabulaire' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-serif text-2xl text-gold">{stat.nombre}</div>
                  <div className="font-mono text-[10px] text-muted uppercase tracking-wider mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Droite : Points forts */}
          <div>
            <p className="section-label">Immersion totale</p>
            <h2 className="section-title mb-8">La plus grande bibliothèque d'anglais <em className="text-gold italic">d'Afrique francophone</em></h2>
            <ul className="space-y-6">
              {[
                'Contenu authentique (BBC, CNN, TED, podcasts, séries)',
                'Quiz IA après chaque ressource avec score de compréhension',
                'Exercices de prononciation avec feedback en temps réel',
                'Parcours personnalisés selon votre niveau CECRL',
                'Mises à jour quotidiennes pour rester en phase avec l\'actualité',
              ].map((point, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-gold text-lg">→</span>
                  <span className="text-white text-sm">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6 — NOS 6 PROGRAMMES */}
      {/* ============================================================ */}
      <section id="formations" className="section py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="section-label">Notre offre académique</p>
          <h2 className="section-title">Une formation pour <em className="text-gold italic">chaque objectif</em></h2>
          <p className="text-muted text-sm mt-4 max-w-2xl mx-auto">
            Du débutant complet au professionnel confirmé, nos 6 programmes couvrent tous les besoins en anglais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROGRAMMES.map((prog, idx) => (
            <div key={idx} className="prog-card card p-6 hover:border-gold/40 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{prog.icone}</span>
                <span className="font-mono text-xs px-2 py-1 rounded border border-gold/30 text-gold bg-gold/10">
                  {prog.niveaux}
                </span>
              </div>
              <h3 className="font-serif text-xl text-white mb-2">{prog.nom}</h3>
              <p className="text-sm text-muted mb-4">Durée : {prog.duree}</p>
              <ul className="space-y-2 mb-6">
                {[
                  'Suivi personnalisé avec formateur certifié',
                  'Accès à l\'English Corner illimité',
                  'Tests de niveau et certificats officiels',
                  'Support technique dédié 6j/7',
                ].map((avantage, i) => (
                  <li key={i} className="text-xs text-muted flex items-center gap-2">
                    <span className="text-gold text-xs">→</span> {avantage}
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
                <span className="font-serif text-2xl text-gold">{prog.tarif}</span>
                <a href="https://meet.google.com/ouv-jemj-kbp" target="_blank" rel="noreferrer"
                   className="text-xs text-white bg-blue px-3 py-1.5 rounded hover:bg-blue/80 transition-colors">
                  Séance découverte
                </a>
              </div>
              <div className="mt-3 font-mono text-[10px] text-muted uppercase tracking-wider">
                {prog.mode}
              </div>
            </div>
          ))}
        </div>

        {/* Note tarifaire */}
        <div className="mt-12 text-center p-6 bg-blue/5 border border-blue/20 rounded-sm max-w-2xl mx-auto">
          <p className="font-mono text-sm text-white">
            <span className="text-gold">💡 Remises :</span> −10% pour les inscriptions trimestrielles · −20% pour les inscriptions annuelles
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 7 — ESPACES UTILISATEURS */}
      {/* ============================================================ */}
      <section className="section py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="section-label">Écosystème complet</p>
          <h2 className="section-title">Un compte personnel pour <em className="text-gold italic">chaque acteur</em></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ESPACES.map((espace, idx) => (
            <div key={idx} className="card p-6 text-center">
              <div className="text-4xl mb-4">{espace.icone}</div>
              <h3 className="font-serif text-xl text-white mb-2">{espace.role}</h3>
              <p className="text-sm text-muted">{espace.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 8 — MODES DE FORMATION */}
      {/* ============================================================ */}
      <section className="section py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="section-label">Flexibilité</p>
          <h2 className="section-title">Apprenez selon <em className="text-gold italic">votre rythme</em></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MODES.map((mode, idx) => (
            <div key={idx} className="card p-6 hover:border-gold/30 transition-all">
              <div className="text-3xl mb-4">{mode.icone}</div>
              <h3 className="font-serif text-xl text-white mb-2">{mode.nom}</h3>
              <p className="text-sm text-muted">{mode.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 9 — CTA FINAL + CONTACT DG */}
      {/* ============================================================ */}
      <section id="contact" className="section py-20 px-4 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Bloc CTA */}
          <div className="card p-8">
            <h2 className="font-serif text-3xl text-white mb-4">Votre première séance est <em className="text-gold italic">offerte</em></h2>
            <p className="text-muted text-sm mb-6 leading-relaxed">
              45 minutes avec un formateur certifié + accès à la plateforme + diagnostic de niveau — GRATUIT, sans engagement.
            </p>
            <div className="space-y-4">
              <a href="https://meet.google.com/ouv-jemj-kbp" target="_blank" rel="noreferrer"
                 className="btn-gold flex items-center justify-center gap-2 text-sm py-3">
                🎓 Réserver ma séance gratuite →
              </a>
              <a href="https://africaglobaltraining.com" target="_blank" rel="noreferrer"
                 className="btn-outline flex items-center justify-center gap-2 text-sm py-3">
                Découvrir la plateforme →
              </a>
            </div>
          </div>

          {/* Bloc contact DG */}
          <div className="contact-dg card p-8 border border-gold/20 bg-[rgba(232,148,26,0.06)]">
            <div className="dg-title font-mono text-xs tracking-[0.25em] text-gold uppercase mb-2">DIRECTEUR GÉNÉRAL</div>
            <div className="dg-name font-serif text-3xl text-white mb-6">ISSA BAMBA</div>
            <div className="space-y-4">
              <div>
                <div className="font-mono text-xs text-muted uppercase mb-1">Téléphone</div>
                <a href="tel:+2250707967250" className="dg-phone font-serif text-2xl text-gold hover:text-gold-lt transition-colors">
                  07 07 96 72 50
                </a>
              </div>
              <div>
                <div className="font-mono text-xs text-muted uppercase mb-1">Emails</div>
                <a href="mailto:contact.eipservices@gmail.com" className="dg-email block text-sm text-white hover:text-gold transition-colors">
                  contact.eipservices@gmail.com
                </a>
                <a href="mailto:chairmanbamba2@gmail.com" className="dg-email block text-sm text-white hover:text-gold transition-colors">
                  chairmanbamba2@gmail.com
                </a>
              </div>
              <div>
                <div className="font-mono text-xs text-muted uppercase mb-1">Localisation</div>
                <p className="text-white text-sm">Abidjan, Côte d'Ivoire 🇨🇮</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FOOTER */}
      {/* ============================================================ */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            <div>
              <div className="footer-brand font-serif text-lg text-white">AGTM Digital Academy · EIP English In Practice</div>
              <div className="footer-sub font-mono text-xs text-muted mt-1">Propriété de ISSA BAMBA · Abidjan, Côte d'Ivoire</div>
            </div>
            <div className="footer-links flex flex-wrap gap-6">
              <a href="#formations" className="text-sm text-muted hover:text-white transition-colors">Formations</a>
              <a href="#technologie" className="text-sm text-muted hover:text-white transition-colors">Technologie</a>
              <a href="/login" className="text-sm text-muted hover:text-white transition-colors">Espace membres</a>
              <a href="https://lingua.africaglobaltraining.com" className="text-sm text-muted hover:text-white transition-colors">LINGUA SPACE</a>
            </div>
          </div>
          <div className="footer-copy text-center font-mono text-xs text-white/30 pt-6 border-t border-white/5">
            © 2026 · Tous droits réservés · AGTM Digital Academy
          </div>
        </div>
      </footer>

      {/* ============================================================ */}
      {/* BOUTON FLOTTANT */}
      {/* ============================================================ */}
      <a href="https://meet.google.com/ouv-jemj-kbp" target="_blank" rel="noreferrer"
         className="float-cta fixed bottom-8 right-8 bg-gold text-dark font-bold py-3 px-6 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all z-90">
        💬 Parler à un conseiller
      </a>
    </div>
  )
}