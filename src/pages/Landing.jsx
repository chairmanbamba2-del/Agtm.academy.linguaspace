import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import MasterCard, { LevelBadge } from '../components/ui/MasterCard';
import { PulseAvatar, AIVoiceWave, ElasticBubble } from '../components/ui/AIWidgets';
import PricingConfigurator from '../components/ui/PricingConfigurator';
import TopBanner from '../components/ui/TopBanner';

const Landing = () => {
  useEffect(() => {
    // Scroll animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(el => {
        if (el.isIntersecting) el.target.classList.add('visible');
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // CEFR level selection
    document.querySelectorAll('.cefr-level').forEach(el => {
      el.addEventListener('click', function() {
        document.querySelectorAll('.cefr-level').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
      });
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <Navbar />
      <TopBanner />

      {/* HERO SECTION avec grille or & halos radiaux */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 overflow-hidden bg-lingua">
        {/* Grille or subtile animée */}
        <div className="absolute inset-0 bg-grid-gold bg-grid-60 opacity-10 animate-grid-move"></div>
        
        {/* Halos radiaux */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-glow rounded-full blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue/20 rounded-full blur-3xl opacity-15 animate-float" style={{animationDelay: '1s'}}></div>
        
        {/* Contenu Hero */}
        <div className="relative z-10 text-center max-w-4xl mx-auto fade-in">
          <div className="font-mono text-sm tracking-ultra text-gold uppercase mb-6">Programme 100% Digital</div>
          
          <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-white leading-tight mb-6 animate-pop-in">
            <span className="block">Parlez </span>
            <em className="text-gold not-italic relative">
              le monde.
              <span className="absolute -inset-4 bg-gold-glow blur-xl opacity-30 -z-10"></span>
            </em>
          </h1>
          
          <p className="text-xl text-muted mb-10 max-w-2xl mx-auto">Apprenez. Pratiquez. Maîtrisez.</p>
          
          {/* Langues badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {['🇬🇧 English Corner', '🇪🇸 Rincón Español', '🇩🇪 Deutsche Ecke', '🇫🇷 Espace Francophone', '🇸🇦 الركن العربي'].map((lang, i) => (
               <span key={i} className="px-3 py-1.5 bg-card border border-bdr rounded-sm text-white text-xs sm:text-sm font-medium">
                {lang}
              </span>
            ))}
          </div>
          
           {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <a href="#pricing" className="btn-gold px-6 py-3 text-base font-semibold sm:px-8 sm:py-4 sm:text-lg text-center no-underline">Choisir mon forfait →</a>
             <a href="#corners" className="btn-outline px-6 py-3 text-base sm:px-8 sm:py-4 sm:text-lg text-center no-underline">Découvrir les Corners</a>
           </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 text-muted text-xs">
          <div className="w-px h-10 bg-gold/30"></div>
          SCROLL
        </div>
      </section>

      {/* STATS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 px-4 bg-card border-y border-bdr">
        {[
          { number: '5', label: 'Langues disponibles' },
          { number: '500', label: 'Modules A1 → C2' },
          { number: '2000+', label: 'Contenus audio/vidéo' },
          { number: '24/7', label: 'IA Coach disponible' }
        ].map((stat, i) => (
          <div key={i} className="text-center">
            <div className="font-serif text-3xl text-gold mb-1">{stat.number}</div>
            <div className="text-sm text-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* CORNERS SECTION */}
      <section id="corners" className="fade-in py-20 px-4 bg-dark">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <div className="section-label">Vos espaces d'immersion</div>
            <h2 className="section-title">Cinq <em>Corners</em>,<br />une seule ambition.</h2>
            <p className="text-muted max-w-xl">
              Chaque Corner est un univers d'immersion linguistique : flux de contenus authentiques, quiz automatiques, coach IA et 100 modules progressifs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { flag: '🇬🇧', name: 'English Corner', tag: 'British & American English', color: 'en', bgText: 'EN',
                desc: 'Podcasts BBC, extraits de séries, news et culture anglophone. Votre coach IA pratique avec vous le Business English, l\'IELTS et la vie quotidienne.',
                features: ['News & Podcasts authentiques', 'Préparation IELTS / TOEFL', 'Business & Professional English', '100 modules A1 → C2']
              },
              { flag: '🇪🇸', name: 'Rincón Español', tag: 'Español Internacional', color: 'es', bgText: 'ES',
                desc: 'Télévision espagnole, musique latine, culture hispanique. Votre coach IA vous emmène de Madrid à México City, conversation après conversation.',
                features: ['Radio & TV hispanophone', 'Préparation DELE', 'Espagnol des affaires', '100 modules A1 → C2']
              },
              { flag: '🇩🇪', name: 'Deutsche Ecke', tag: 'Deutsch für alle', color: 'de', bgText: 'DE',
                desc: 'Actualité Deutsche Welle, culture germanique et humour allemand. Une porte d\'entrée vers l\'Europe, les études et les opportunités professionnelles.',
                features: ['Deutsche Welle intégré', 'Préparation TestDaF / Goethe', 'Allemand professionnel', '100 modules A1 → C2']
              },
              { flag: '🇫🇷', name: 'Espace Francophone', tag: 'Francophonie mondiale', color: 'fr', bgText: 'FR',
                desc: 'RFI, littérature africaine, culture francophone mondiale. Perfectionnez votre français écrit et oral pour les concours, les examens et le monde professionnel.',
                features: ['RFI Savoirs & culture africaine', 'Préparation DELF / DALF', 'Français des affaires', '100 modules A1 → C2']
              },
              { flag: '🇸🇦', name: 'الركن العربي', tag: 'العربية الفصحى', color: 'ar', bgText: 'AR',
                desc: 'القرآن الكريم، الأدب العربي، الثقافة الإسلامية. انغمس في اللغة العربية الفصحى من خلال محتوى أصلي وتفاعلي.',
                features: ['النصوص القرآنية', 'اختبارات تفاعلية', 'مكتبة رقمية', '100 modules A1 → C2']
              }
            ].map((corner, i) => (
              <MasterCard key={i} variant="corner" padding="lg" className={`corner-${corner.color}`}>
                <div className="relative">
                  <span className="text-3xl">{corner.flag}</span>
                  <div className="text-xl font-serif text-white mt-3">{corner.name}</div>
                  <span className="text-xs text-gold font-mono mt-1 block">{corner.tag}</span>
                  <p className="text-sm text-muted mt-4 leading-relaxed">{corner.desc}</p>
                  <div className="space-y-2 mt-6">
                    {corner.features.map((feat, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm">
                        <span className="text-gold">✓</span>
                        <span className="text-muted-2">{feat}</span>
                      </div>
                    ))}
                  </div>
                  <div className="absolute -bottom-4 -right-4 text-7xl opacity-5 font-bold select-none">{corner.bgText}</div>
                </div>
              </MasterCard>
            ))}
          </div>
        </div>
      </section>

      {/* DÉCOUVREZ VOTRE COACH - Simulation IA */}
      <section id="assistant" className="fade-in py-20 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="section-label">Intelligence Artificielle</div>
              <h2 className="section-title">Votre coach<br /><em>personnel</em> 24h/24.</h2>
              <p className="text-muted mb-8">
                Propulsé par Claude Sonnet & Opus d'Anthropic, votre assistant corrige vos erreurs, reformule naturellement et vous fait progresser conversation après conversation.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: '🗣️', name: 'Free Talk', desc: 'Conversation libre sur tous les sujets', badge: 'STANDARD' },
                  { icon: '💼', name: 'Business Mode', desc: 'Réunions, emails, présentations pro', badge: 'STANDARD' },
                  { icon: '🎭', name: 'Role Play', desc: 'Jeux de rôle immersifs et scénarios', badge: 'PREMIUM' },
                  { icon: '🎯', name: 'Exam Prep', desc: 'IELTS, DELF, DELE, Goethe...', badge: 'PREMIUM' }
                ].map((mode, i) => (
                  <MasterCard key={i} variant="action" padding="sm" className="flex items-center gap-4">
                    <span className="text-2xl">{mode.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-white">{mode.name}</div>
                      <div className="text-xs text-muted">{mode.desc}</div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-mono rounded-sm ${mode.badge === 'PREMIUM' ? 'bg-gold/20 text-gold' : 'bg-blue/20 text-blue'}`}>
                      {mode.badge}
                    </span>
                  </MasterCard>
                ))}
              </div>
            </div>
            
            {/* Mockup conversation IA */}
            <div className="relative">
              <MasterCard variant="content" padding="lg" className="relative z-10">
                {/* En-tête du chat */}
                <div className="flex items-center gap-3 mb-6">
                  <PulseAvatar isThinking={true}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-blue flex items-center justify-center text-white">
                      🤖
                    </div>
                  </PulseAvatar>
                  <div>
                    <div className="font-medium text-white">Lingua AI Coach · English Corner</div>
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      En ligne · Niveau B1 détecté
                      <AIVoiceWave active={true} className="ml-2" />
                    </div>
                  </div>
                </div>
                
                {/* Conversation */}
                <div className="space-y-4">
                  <ElasticBubble>
                    <div className="bg-blue/20 border border-blue/30 rounded-2xl rounded-bl-sm p-4 text-sm text-white">
                      Hello! I'm your English Coach. What would you like to practice today? We can do a free conversation, or maybe prepare for a job interview? 😊
                    </div>
                  </ElasticBubble>
                  
                  <div className="flex justify-end">
                    <ElasticBubble>
                      <div className="bg-gold/10 border border-gold/30 rounded-2xl rounded-br-sm p-4 text-sm text-white">
                        I want to practice for a interview. I'm a little nervous about speak english in front of people.
                      </div>
                    </ElasticBubble>
                  </div>
                  
                  <ElasticBubble>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-2xl rounded-bl-sm p-4 text-sm text-white">
                      <span className="text-green-400">✔️ Quick correction:</span> "…nervous about <em className="font-semibold">speaking</em> English…" — use the gerund after prepositions. Great initiative though!
                    </div>
                  </ElasticBubble>
                  
                  <ElasticBubble>
                    <div className="bg-blue/20 border border-blue/30 rounded-2xl rounded-bl-sm p-4 text-sm text-white">
                      That's completely normal! Let's do a mock interview together. I'll be the interviewer. Ready? <br /><br />
                      <em>"Tell me about yourself and why you applied for this position."</em>
                    </div>
                  </ElasticBubble>
                </div>
              </MasterCard>
              
              {/* Effets décoratifs */}
              <div className="absolute -top-6 -left-6 w-48 h-48 bg-gold-glow rounded-full blur-3xl opacity-20 -z-10"></div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-blue/10 rounded-full blur-3xl opacity-15 -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* MODULES SECTION */}
      <section id="modules" className="fade-in py-20 px-4 bg-dark">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <div className="section-label">Parcours structuré</div>
            <h2 className="section-title">100 modules.<br /><em>6 niveaux</em> CEFR.</h2>
            <p className="text-muted max-w-xl">
              Chaque langue dispose de 100 modules progressifs, de l'alphabet jusqu'à la maîtrise avancée. Un test de niveau automatique vous place dès l'inscription.
            </p>
          </div>
          
          {/* Track CEFR */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 max-w-4xl mx-auto">
            {[
              { code: 'A1', name: 'Découverte', count: '~15 modules' },
              { code: 'A2', name: 'Survie', count: '~18 modules' },
              { code: 'B1', name: 'Seuil', count: '~20 modules' },
              { code: 'B2', name: 'Avancé', count: '~20 modules' },
              { code: 'C1', name: 'Autonome', count: '~15 modules' },
              { code: 'C2', name: 'Maîtrise', count: '~12 modules' }
            ].map((level, i) => (
              <div key={i} className="cefr-level text-center p-4 rounded-sm border border-bdr bg-card cursor-pointer transition-all hover:border-gold">
                <div className="font-serif text-2xl text-gold mb-1">{level.code}</div>
                <div className="font-medium text-white text-sm mb-1">{level.name}</div>
                <div className="text-xs text-muted">{level.count}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION - Configurateur interactif */}
      <section id="pricing" className="fade-in py-20 px-4 bg-card relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-gold bg-grid-60 opacity-5"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="section-label" style={{justifyContent: 'center'}}>Tarifs & Abonnements</div>
            <h2 className="section-title">Choisissez <em>votre</em> formule.</h2>
            <p className="text-muted max-w-lg mx-auto">
              Construisez l'abonnement qui vous correspond. Sans engagement, résiliez en 1 clic.
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-16">
            <PricingConfigurator showTitle={true} />
          </div>

          <div className="text-center mb-8">
            <span className="text-xs text-muted font-mono tracking-[0.2em] uppercase">— OU —</span>
            <p className="text-muted text-sm mt-3 mb-8">Vous préférez l'expérience complète ?</p>
          </div>

          <div className="max-w-lg mx-auto">
            <MasterCard variant="corner" glow={true} padding="xl" className="text-center relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold-glow rounded-full blur-3xl opacity-30"></div>
              <div className="relative z-10">
                <span className="text-3xl">⭐</span>
                <div className="font-serif text-2xl text-white mt-2">ALL ACCESS</div>
                <div className="mt-1 mb-4">
                  <LevelBadge level="PREMIUM" lang="premium" size="sm" />
                </div>

                  <div className="font-serif text-4xl text-gold mb-1">30 000 <span className="text-lg text-muted">FCFA</span></div>
                <div className="text-sm text-muted mb-6">/mois · 5 langues incluses</div>

                <div className="space-y-2 mb-8 text-left max-w-sm mx-auto">
                  {[
                    'Accès aux 5 Corners — Coach Claude Opus',
                    'Sessions IA illimitées',
                    'Role Play & Exam Prep inclus',
                    'Leaderboard & statistiques avancées',
                    'Paiement mensuel ou trimestriel'
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-gold">✓</span>
                      <span className="text-white/90">{f}</span>
                    </div>
                  ))}
                </div>

                <Link to="/subscribe" className="btn-gold px-8 py-3 font-semibold inline-block no-underline">
                  Découvrir All Access →
                </Link>
              </div>
            </MasterCard>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-4 bg-dark border-t border-bdr">
        <div className="max-w-6xl mx-auto text-center">
          <div className="font-serif text-xl text-white mb-4">LINGUA SPACE <span className="font-mono text-sm text-muted">by AGTM</span></div>
          <ul className="flex flex-wrap justify-center gap-6 mb-6 list-none p-0">
            <li><a href="#" className="text-muted hover:text-white transition-colors no-underline">À propos</a></li>
            <li><a href="#" className="text-muted hover:text-white transition-colors no-underline">Conditions</a></li>
            <li><a href="#" className="text-muted hover:text-white transition-colors no-underline">Contact</a></li>
            <li><a href="https://africaglobaltraining.com" className="text-muted hover:text-white transition-colors no-underline">AGTM Academy</a></li>
          </ul>
          <div className="text-xs text-muted">
            © 2026 AGTM Digital Academy · lingua.africaglobaltraining.com
          </div>
        </div>
      </footer>
    </>
  );
};

export default Landing;