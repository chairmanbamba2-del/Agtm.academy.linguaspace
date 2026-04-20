import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const features = [
    {
      icon: '🤖',
      title: 'Assistant IA Claude',
      description: 'Coach personnel IA 24h/24 avec reconnaissance vocale, correction d\'écrits et score de prononciation.'
    },
    {
      icon: '📊',
      title: 'Apprentissage personnalisé',
      description: 'Programmes adaptés à votre niveau avec suivi de progression en temps réel.'
    },
    {
      icon: '🌍',
      title: '4 langues disponibles',
      description: 'Anglais, Français, Espagnol, Allemand avec contenus natifs et culturels.'
    },
    {
      icon: '📱',
      title: 'Application PWA mobile',
      description: 'Installez l\'application sur votre téléphone sans passer par l\'App Store.'
    },
    {
      icon: '🎓',
      title: 'Certification officielle',
      description: 'Tests de niveau CEFR et certificats reconnus avec QR code de vérification.'
    },
    {
      icon: '💬',
      title: 'English Corner',
      description: 'Espace communautaire pour pratiquer avec d\'autres apprenants du monde entier.'
    }
  ]

  const languages = [
    { code: 'en', name: 'Anglais', flag: '🇬🇧', levels: 'A1 à C2' },
    { code: 'es', name: 'Espagnol', flag: '🇪🇸', levels: 'A1 à C2' },
    { code: 'de', name: 'Allemand', flag: '🇩🇪', levels: 'A1 à B2' },
    { code: 'fr', name: 'Français', flag: '🇫🇷', levels: 'A1 à C2' }
  ]

  const plans = [
    {
      name: 'Uni Langue',
      price: '25 000 FCFA/mois',
      description: 'Accès complet à une langue de votre choix',
      features: ['Tous les niveaux', 'Assistant IA', 'English Corner', 'Certification']
    },
    {
      name: 'All Access',
      price: '40 000 FCFA/mois',
      description: 'Accès illimité à toutes les langues',
      features: ['4 langues', 'Tous les niveaux', 'Assistant IA Premium', 'Certification illimitée', 'Support prioritaire'],
      highlighted: true
    }
  ]

  return (
    <div className="min-h-screen bg-dark text-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-dark/90 backdrop-blur-sm border-b border-bdr">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center">
                <span className="text-dark font-bold">LS</span>
              </div>
              <div>
                <h1 className="font-serif text-xl text-white">Lingua <span className="text-gold">Space</span></h1>
                <p className="text-xs text-muted font-mono">by AGTM Digital Academy</p>
              </div>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-white hover:text-gold transition-colors">Fonctionnalités</a>
              <a href="#languages" className="text-sm text-white hover:text-gold transition-colors">Langues</a>
              <a href="#pricing" className="text-sm text-white hover:text-gold transition-colors">Tarifs</a>
              <Link to="/login" className="text-sm text-white hover:text-gold transition-colors">Connexion</Link>
              <Link to="/signup" className="px-4 py-2 bg-gold text-dark text-sm font-semibold rounded-sm hover:bg-gold-lt transition-all">
                Commencer gratuitement
              </Link>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-bdr pt-4">
              <div className="flex flex-col gap-4">
                <a href="#features" className="text-sm text-white hover:text-gold transition-colors">Fonctionnalités</a>
                <a href="#languages" className="text-sm text-white hover:text-gold transition-colors">Langues</a>
                <a href="#pricing" className="text-sm text-white hover:text-gold transition-colors">Tarifs</a>
                <Link to="/login" className="text-sm text-white hover:text-gold transition-colors">Connexion</Link>
                <Link to="/signup" className="px-4 py-2 bg-gold text-dark text-sm font-semibold rounded-sm hover:bg-gold-lt transition-all text-center">
                  Commencer gratuitement
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue/20 rounded-full mb-6">
                <span className="text-gold">✨</span>
                <span className="text-sm font-mono text-gold">Nouvelle génération</span>
              </div>
              <h1 className="font-serif text-5xl md:text-6xl text-white mb-6 leading-tight">
                Apprenez les langues avec l'<span className="text-gold italic">IA</span>
              </h1>
              <p className="text-xl text-muted mb-8 max-w-2xl">
                Lingua Space révolutionne l'apprentissage des langues avec un assistant IA personnel, 
                des programmes adaptés et une certification reconnue à l'international.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/signup" 
                  className="px-8 py-4 bg-gold text-dark text-lg font-semibold rounded-sm hover:bg-gold-lt transition-all text-center"
                >
                  Essai gratuit 7 jours
                </Link>
                <a 
                  href="#features" 
                  className="px-8 py-4 border border-bdr text-white text-lg rounded-sm hover:border-gold hover:text-gold transition-all text-center"
                >
                  Découvrir les fonctionnalités
                </a>
              </div>
              <div className="mt-8 flex items-center gap-4 text-sm text-muted">
                <div className="flex items-center gap-2">
                  <span className="text-green">✓</span>
                  <span>Aucune carte bancaire requise</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green">✓</span>
                  <span>Annulation à tout moment</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-gold/10 to-blue/10 rounded-2xl blur-3xl"></div>
              <div className="relative bg-card border border-bdr rounded-2xl p-8">
                <div className="aspect-video bg-gradient-to-br from-blue/20 to-gold/10 rounded-xl mb-6 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🌍</div>
                    <h3 className="font-serif text-2xl text-white">Lingua Space</h3>
                    <p className="text-muted">Votre passeport linguistique</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {languages.map(lang => (
                    <div key={lang.code} className="text-center p-3 bg-dark/50 rounded-lg">
                      <div className="text-2xl mb-2">{lang.flag}</div>
                      <div className="font-semibold">{lang.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card/30">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl text-white mb-4">Pourquoi choisir Lingua Space ?</h2>
            <p className="text-xl text-muted max-w-3xl mx-auto">
              Une plateforme complète qui combine technologie de pointe et pédagogie éprouvée
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-dark border border-bdr rounded-xl p-6 hover:border-gold/40 transition-colors">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="font-serif text-xl text-white mb-3">{feature.title}</h3>
                <p className="text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Languages Section */}
      <section id="languages" className="py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl text-white mb-4">4 langues, des milliers de possibilités</h2>
            <p className="text-xl text-muted max-w-3xl mx-auto">
              Des programmes complets du niveau débutant (A1) au niveau expert (C2)
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {languages.map(lang => (
              <div key={lang.code} className="bg-card border border-bdr rounded-xl p-6 text-center hover:border-gold/40 transition-colors">
                <div className="text-5xl mb-4">{lang.flag}</div>
                <h3 className="font-serif text-2xl text-white mb-2">{lang.name}</h3>
                <p className="text-muted mb-4">Niveaux {lang.levels}</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue/20 rounded-full">
                  <span className="text-gold text-sm">✓</span>
                  <span className="text-sm text-white">Disponible</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-card/30">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl text-white mb-4">Des tarifs adaptés à vos besoins</h2>
            <p className="text-xl text-muted max-w-3xl mx-auto">
              Choisissez la formule qui correspond à vos objectifs linguistiques
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative border rounded-xl p-8 ${plan.highlighted ? 'border-gold bg-dark' : 'border-bdr bg-card'}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="px-4 py-1 bg-gold text-dark text-sm font-semibold rounded-full">
                      Le plus populaire
                    </div>
                  </div>
                )}
                <h3 className="font-serif text-2xl text-white mb-2">{plan.name}</h3>
                <p className="text-muted mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="font-serif text-4xl text-white">{plan.price}</span>
                  <span className="text-muted">/mois</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <span className="text-green">✓</span>
                      <span className="text-white">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  to="/signup" 
                  className={`block w-full text-center py-3 rounded-sm font-semibold transition-all ${
                    plan.highlighted 
                      ? 'bg-gold text-dark hover:bg-gold-lt' 
                      : 'bg-blue text-white hover:bg-blue/80'
                  }`}
                >
                  Commencer maintenant
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-muted">
              Essai gratuit de 7 jours · Aucun engagement · Annulation à tout moment
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="bg-gradient-to-r from-blue/20 to-gold/10 border border-bdr rounded-2xl p-12">
            <h2 className="font-serif text-4xl text-white mb-6">
              Prêt à parler couramment ?
            </h2>
            <p className="text-xl text-muted mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers d'apprenants qui ont transformé leur vie avec Lingua Space
            </p>
            <Link 
              to="/signup" 
              className="inline-flex items-center gap-3 px-8 py-4 bg-gold text-dark text-lg font-semibold rounded-sm hover:bg-gold-lt transition-all"
            >
              <span>Commencer gratuitement</span>
              <span>→</span>
            </Link>
            <div className="mt-8 text-sm text-muted">
              <p>Une question ? Contactez-nous : contact@agtm-education.com · +225 07 07 96 72 50</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-bdr py-8">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center">
                  <span className="text-dark font-bold">LS</span>
                </div>
                <div>
                  <h3 className="font-serif text-xl text-white">Lingua Space</h3>
                  <p className="text-xs text-muted font-mono">by AGTM Digital Academy</p>
                </div>
              </div>
              <p className="text-sm text-muted max-w-md">
                Plateforme d'apprentissage des langues avec IA. 
                Certifications reconnues à l'international.
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted mb-2">© 2024 AGTM Digital Academy. Tous droits réservés.</p>
              <p className="text-xs text-muted">
                Abidjan, Côte d'Ivoire · 
                <a href="https://lingua.africaglobaltraining.com" className="text-gold hover:underline ml-1">
                  lingua.africaglobaltraining.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}