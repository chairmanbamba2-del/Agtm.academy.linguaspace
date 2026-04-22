import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '@/styles/landing/landing.css';

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
      {/* NAV - Améliorée pour meilleure lisibilité */}
      <nav style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 3rem', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)'}}>
        <div className="nav-logo" style={{display: 'flex', flexDirection: 'column', gap: '0.25rem'}}>
          <Link to="/" style={{textDecoration: 'none', color: 'inherit'}}>
            <span className="brand" style={{fontSize: '0.85rem', fontWeight: '500', color: 'var(--muted)'}}>AGTM Digital Academy</span>
            <span className="name" style={{fontSize: '1.5rem', fontWeight: '700', color: 'white', letterSpacing: '0.5px'}}>LINGUA SPACE</span>
          </Link>
        </div>
        <ul className="nav-links" style={{display: 'flex', gap: '2.5rem', alignItems: 'center', margin: 0, padding: 0, listStyle: 'none'}}>
          <li><a href="#corners" style={{textDecoration: 'none', color: 'white', fontWeight: '500', fontSize: '0.95rem', padding: '0.5rem 0', borderBottom: '2px solid transparent', transition: 'all 0.3s ease'}} onMouseOver="this.style.borderBottomColor='var(--primary)'; this.style.color='var(--primary)'" onMouseOut="this.style.borderBottomColor='transparent'; this.style.color='white'">Les Corners</a></li>
          <li><a href="#assistant" style={{textDecoration: 'none', color: 'white', fontWeight: '500', fontSize: '0.95rem', padding: '0.5rem 0', borderBottom: '2px solid transparent', transition: 'all 0.3s ease'}} onMouseOver="this.style.borderBottomColor='var(--primary)'; this.style.color='var(--primary)'" onMouseOut="this.style.borderBottomColor='transparent'; this.style.color='white'">IA Coach</a></li>
          <li><a href="#modules" style={{textDecoration: 'none', color: 'white', fontWeight: '500', fontSize: '0.95rem', padding: '0.5rem 0', borderBottom: '2px solid transparent', transition: 'all 0.3s ease'}} onMouseOver="this.style.borderBottomColor='var(--primary)'; this.style.color='var(--primary)'" onMouseOut="this.style.borderBottomColor='transparent'; this.style.color='white'">Modules</a></li>
          <li><a href="#pricing" style={{textDecoration: 'none', color: 'white', fontWeight: '500', fontSize: '0.95rem', padding: '0.5rem 0', borderBottom: '2px solid transparent', transition: 'all 0.3s ease'}} onMouseOver="this.style.borderBottomColor='var(--primary)'; this.style.color='var(--primary)'" onMouseOut="this.style.borderBottomColor='transparent'; this.style.color='white'">Abonnements</a></li>
          <li><Link to="/signup" className="btn-nav" style={{padding: '0.75rem 2rem', background: 'linear-gradient(135deg, var(--primary), #4a6fff)', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(74, 111, 255, 0.3)', transition: 'all 0.3s ease'}} onMouseOver="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(74, 111, 255, 0.4)'" onMouseOut="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(74, 111, 255, 0.3)'">Commencer</Link></li>
        </ul>
      </nav>

      {/* HERO - Conversion exacte du HTML */}
      <section className="hero" style={{maxWidth: 'none', paddingTop: '8rem', paddingLeft: '0', paddingRight: '0'}}>
        <div className="hero-bg"></div>
        <div className="lang-orbs">
          <div className="orb orb-en"></div>
          <div className="orb orb-es"></div>
          <div className="orb orb-de"></div>
          <div className="orb orb-fr"></div>
        </div>

        <div className="hero-eyebrow">Programme 100% Digital</div>

        <h1 className="hero-title">
          <span>Parlez </span>
          <em>le monde.</em>
        </h1>

        <p className="hero-subtitle">Apprenez. Pratiquez. Maîtrisez.</p>

        <div className="hero-langs">
          <span className="lang-badge"><span className="flag">🇬🇧</span> English Corner</span>
          <span className="lang-badge"><span className="flag">🇪🇸</span> Rincón Español</span>
          <span className="lang-badge"><span className="flag">🇩🇪</span> Deutsche Ecke</span>
          <span className="lang-badge"><span className="flag">🇫🇷</span> Espace Francophone</span>
        </div>

        <div className="hero-cta">
          <a href="#pricing" className="btn-primary">Choisir mon forfait →</a>
          <a href="#corners" className="btn-ghost">Découvrir les Corners</a>
        </div>

        <div className="hero-scroll">
          <div className="scroll-line"></div>
          SCROLL
        </div>
      </section>

      {/* STATS BAR - Conversion exacte du HTML */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">4</span>
          <span className="stat-label">Langues disponibles</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">400</span>
          <span className="stat-label">Modules A1 → C2</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">2000+</span>
          <span className="stat-label">Contenus audio/vidéo</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">24/7</span>
          <span className="stat-label">IA Coach disponible</span>
        </div>
      </div>

      {/* CORNERS - Conversion exacte du HTML */}
      <section id="corners" className="fade-in">
        <span className="section-label">Vos espaces d'immersion</span>
        <h2 className="section-title">Quatre <em>Corners</em>,<br />une seule ambition.</h2>
        <p style={{color: 'var(--muted)', fontSize: '0.9rem', maxWidth: '500px', lineHeight: 1.8}}>
          Chaque Corner est un univers d'immersion linguistique : flux de contenus authentiques, quiz automatiques, coach IA et 100 modules progressifs.
        </p>

        <div className="corners-grid">
          <div className="corner-card corner-en">
            <span className="corner-flag">🇬🇧</span>
            <div className="corner-name">English Corner</div>
            <span className="corner-tag">British & American English</span>
            <p className="corner-desc">Podcasts BBC, extraits de séries, news et culture anglophone. Votre coach IA pratique avec vous le Business English, l'IELTS et la vie quotidienne.</p>
            <div className="corner-features" style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem'}}>
              <span className="corner-feature" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--muted)'}}>
                <span style={{color: 'var(--primary)'}}>✓</span> News & Podcasts authentiques
              </span>
              <span className="corner-feature" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--muted)'}}>
                <span style={{color: 'var(--primary)'}}>✓</span> Préparation IELTS / TOEFL
              </span>
              <span className="corner-feature" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--muted)'}}>
                <span style={{color: 'var(--primary)'}}>✓</span> Business & Professional English
              </span>
              <span className="corner-feature" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--muted)'}}>
                <span style={{color: 'var(--primary)'}}>✓</span> 100 modules A1 → C2
              </span>
            </div>
            <span className="corner-bg-text">EN</span>
          </div>

          <div className="corner-card corner-es">
            <span className="corner-flag">🇪🇸</span>
            <div className="corner-name">Rincón Español</div>
            <span className="corner-tag">Español Internacional</span>
            <p className="corner-desc">Télévision espagnole, musique latine, culture hispanique. Votre coach IA vous emmène de Madrid à México City, conversation après conversation.</p>
            <div className="corner-features" style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem'}}>
              <span className="corner-feature" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--muted)'}}>
                <span style={{color: 'var(--primary)'}}>✓</span> Radio & TV hispanophone
              </span>
              <span className="corner-feature" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--muted)'}}>
                <span style={{color: 'var(--primary)'}}>✓</span> Préparation DELE
              </span>
              <span className="corner-feature" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--muted)'}}>
                <span style={{color: 'var(--primary)'}}>✓</span> Espagnol des affaires
              </span>
              <span className="corner-feature" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--muted)'}}>
                <span style={{color: 'var(--primary)'}}>✓</span> 100 modules A1 → C2
              </span>
            </div>
            <span className="corner-bg-text">ES</span>
          </div>

          <div className="corner-card corner-de">
            <span className="corner-flag">🇩🇪</span>
            <div className="corner-name">Deutsche Ecke</div>
            <span className="corner-tag">Deutsch für alle</span>
            <p className="corner-desc">Actualité Deutsche Welle, culture germanique et humour allemand. Une porte d'entrée vers l'Europe, les études et les opportunités professionnelles.</p>
            <div className="corner-features" style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem'}}>
              <span className="corner-feature" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--muted)'}}>
                <span style={{color: 'var(--primary)'}}>✓</span> Deutsche Welle intégré
              </span>
              <span className="corner-feature" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--muted)'}}>
                <span style={{color: 'var(--primary)'}}>✓</span> Préparation TestDaF / Goethe
              </span>
              <span className="corner-feature" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--muted)'}}>
                <span style={{color: 'var(--primary)'}}>✓</span> Allemand professionnel
              </span>
              <span className="corner-feature" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--muted)'}}>
                <span style={{color: 'var(--primary)'}}>✓</span> 100 modules A1 → C2
              </span>
            </div>
            <span className="corner-bg-text">DE</span>
          </div>

          <div className="corner-card corner-fr">
            <span className="corner-flag">🇫🇷</span>
            <div className="corner-name">Espace Francophone</div>
            <span className="corner-tag">Francophonie mondiale</span>
            <p className="corner-desc">RFI, littérature africaine, culture francophone mondiale. Perfectionnez votre français écrit et oral pour les concours, les examens et le monde professionnel.</p>
            <div className="corner-features" style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem'}}>
              <span className="corner-feature" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--muted)'}}>
                <span style={{color: 'var(--primary)'}}>✓</span> RFI Savoirs & culture africaine
              </span>
              <span className="corner-feature" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--muted)'}}>
                <span style={{color: 'var(--primary)'}}>✓</span> Préparation DELF / DALF
              </span>
              <span className="corner-feature" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--muted)'}}>
                <span style={{color: 'var(--primary)'}}>✓</span> Français des affaires
              </span>
              <span className="corner-feature" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--muted)'}}>
                <span style={{color: 'var(--primary)'}}>✓</span> 100 modules A1 → C2
              </span>
            </div>
            <span className="corner-bg-text">FR</span>
          </div>
        </div>
      </section>

      {/* IA COACH - Conversion exacte du HTML */}
      <div id="assistant" className="ia-section fade-in">
        <div className="ia-grid">
          <div className="ia-content">
            <span className="section-label">Intelligence Artificielle</span>
            <h2 className="section-title" style={{fontSize: '2.5rem'}}>Votre coach<br /><em>personnel</em> 24h/24.</h2>
            <p style={{color: 'var(--muted)', fontSize: '0.88rem', lineHeight: 1.8, marginBottom: '1.5rem'}}>
              Propulsé par Claude Sonnet & Opus d'Anthropic, votre assistant corrige vos erreurs, reformule naturellement et vous fait progresser conversation après conversation.
            </p>

            <div className="ia-modes">
              <div className="ia-mode">
                <span className="ia-mode-icon">🗣️</span>
                <div>
                  <div className="ia-mode-name">Free Talk</div>
                  <div className="ia-mode-desc">Conversation libre sur tous les sujets</div>
                </div>
                <span className="ia-mode-badge badge-std">STANDARD</span>
              </div>
              <div className="ia-mode">
                <span className="ia-mode-icon">💼</span>
                <div>
                  <div className="ia-mode-name">Business Mode</div>
                  <div className="ia-mode-desc">Réunions, emails, présentations pro</div>
                </div>
                <span className="ia-mode-badge badge-std">STANDARD</span>
              </div>
              <div className="ia-mode">
                <span className="ia-mode-icon">🎭</span>
                <div>
                  <div className="ia-mode-name">Role Play</div>
                  <div className="ia-mode-desc">Jeux de rôle immersifs et scénarios</div>
                </div>
                <span className="ia-mode-badge badge-prm">PREMIUM</span>
              </div>
              <div className="ia-mode">
                <span className="ia-mode-icon">🎯</span>
                <div>
                  <div className="ia-mode-name">Exam Prep</div>
                  <div className="ia-mode-desc">IELTS, DELF, DELE, Goethe...</div>
                </div>
                <span className="ia-mode-badge badge-prm">PREMIUM</span>
              </div>
            </div>
          </div>

          <div className="ia-mockup">
            <div className="ia-mockup-header">
              <div className="ia-avatar">🤖</div>
              <div>
                <div className="ia-name">Lingua AI Coach · English Corner</div>
                <div className="ia-status">● En ligne · Niveau B1 détecté</div>
              </div>
            </div>

            <div className="chat-bubble bubble-ai">
              Hello! I'm your English Coach. What would you like to practice today? We can do a free conversation, or maybe prepare for a job interview? 😊
            </div>

            <div className="chat-bubble bubble-user">
              I want to practice for a interview. I'm a little nervous about speak english in front of people.
            </div>

            <div className="chat-bubble bubble-correction">
              ✔️ <strong>Quick correction:</strong> "…nervous about <em>speaking</em> English…" — use the gerund after prepositions. Great initiative though!
            </div>

            <div className="chat-bubble bubble-ai">
              That's completely normal! Let's do a mock interview together. I'll be the interviewer. Ready? <br /><br />
              <em>"Tell me about yourself and why you applied for this position."</em>
            </div>
          </div>
        </div>
      </div>

      {/* MODULES - Conversion exacte du HTML */}
      <section className="modules-section fade-in" id="modules">
        <span className="section-label">Parcours structuré</span>
        <h2 className="section-title">100 modules.<br /><em>6 niveaux</em> CEFR.</h2>
        <p style={{color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.8, maxWidth: '500px'}}>
          Chaque langue dispose de 100 modules progressifs, de l'alphabet jusqu'à la maîtrise avancée. Un test de niveau automatique vous place dès l'inscription.
        </p>

        <div className="cefr-track">
          <div className="cefr-level">
            <span className="cefr-code">A1</span>
            <span className="cefr-name">Découverte</span>
            <span className="cefr-count">~15 modules</span>
          </div>
          <div className="cefr-level">
            <span className="cefr-code">A2</span>
            <span className="cefr-name">Survie</span>
            <span className="cefr-count">~18 modules</span>
          </div>
          <div className="cefr-level active">
            <span className="cefr-code">B1</span>
            <span className="cefr-name">Seuil</span>
            <span className="cefr-count">~20 modules</span>
          </div>
          <div className="cefr-level">
            <span className="cefr-code">B2</span>
            <span className="cefr-name">Avancé</span>
            <span className="cefr-count">~20 modules</span>
          </div>
          <div className="cefr-level">
            <span className="cefr-code">C1</span>
            <span className="cefr-name">Autonome</span>
            <span className="cefr-count">~15 modules</span>
          </div>
          <div className="cefr-level">
            <span className="cefr-code">C2</span>
            <span className="cefr-name">Maîtrise</span>
            <span className="cefr-count">~12 modules</span>
          </div>
        </div>
      </section>

      {/* PRICING - Conversion exacte du HTML */}
      <section className="pricing-section fade-in" id="pricing">
        <div style={{textAlign: 'center'}}>
          <span className="section-label" style={{justifyContent: 'center'}}>Tarifs & Abonnements</span>
          <h2 className="section-title" style={{fontSize: 'clamp(2rem, 5vw, 3rem)'}}>Simple. <em>Transparent.</em> Accessible.</h2>
          <p style={{color: 'var(--muted)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1rem', lineHeight: 1.8}}>
            Aucun engagement à long terme. Résiliez quand vous voulez. Paiement par Mobile Money, Wave ou carte bancaire.
          </p>
        </div>

        <div className="pricing-grid">
          <div className="pricing-card">
            <span className="plan-icon">🟢</span>
            <div className="plan-name">Forfait</div>
            <div className="plan-title">LINGUA UNI</div>
            <div className="plan-price">
              <span className="price-amount">10 000</span>
              <span className="price-currency">FCFA</span>
            </div>
            <div className="plan-period">par mois · 1 langue au choix</div>

            <div className="plan-lang-chips">
              <span className="lang-chip">🇬🇧 EN</span>
              <span className="lang-chip">🇪🇸 ES</span>
              <span className="lang-chip">🇩🇪 DE</span>
              <span className="lang-chip">🇫🇷 FR</span>
            </div>

            <div className="plan-divider"></div>

            <ul className="plan-features">
              <li className="plan-feature">
                <span className="feature-check">✓</span>
                <span>1 Corner au choix parmi les 4 langues</span>
              </li>
              <li className="plan-feature">
                <span className="feature-check">✓</span>
                <span>100 modules A1 → C2 (langue choisie)</span>
              </li>
              <li className="plan-feature">
                <span className="feature-check">✓</span>
                <span>Flux audio/vidéo + quiz IA automatiques</span>
              </li>
              <li className="plan-feature">
                <span className="feature-check">✓</span>
                <span>Coach IA Free Talk & Business Mode</span>
              </li>
            </ul>

            <a href="#pricing" className="btn-primary" style={{width: '100%', marginTop: '1.5rem'}}>Choisir LINGUA UNI</a>
          </div>

          <div className="pricing-card pricing-card-featured">
            <span className="plan-icon">⭐</span>
            <div className="plan-name">Forfait</div>
            <div className="plan-title">LINGUA PRO</div>
            <div className="plan-price">
              <span className="price-amount">15 000</span>
              <span className="price-currency">FCFA</span>
            </div>
            <div className="plan-period">par mois · 4 langues incluses</div>

            <div className="plan-lang-chips">
              <span className="lang-chip">🇬🇧 EN</span>
              <span className="lang-chip">🇪🇸 ES</span>
              <span className="lang-chip">🇩🇪 DE</span>
              <span className="lang-chip">🇫🇷 FR</span>
            </div>

            <div className="plan-divider"></div>

            <ul className="plan-features">
              <li className="plan-feature">
                <span className="feature-check">✓</span>
                <span>Accès aux 4 Corners (EN, ES, DE, FR)</span>
              </li>
              <li className="plan-feature">
                <span className="feature-check">✓</span>
                <span>400 modules A1 → C2 (toutes langues)</span>
              </li>
              <li className="plan-feature">
                <span className="feature-check">✓</span>
                <span>Flux audio/vidéo + quiz IA automatiques</span>
              </li>
              <li className="plan-feature">
                <span className="feature-check">✓</span>
                <span>Coach IA complet (Role Play + Exam Prep)</span>
              </li>
              <li className="plan-feature">
                <span className="feature-check">✓</span>
                <span>Statistiques avancées & progression</span>
              </li>
            </ul>

            <a href="#pricing" className="btn-primary" style={{width: '100%', marginTop: '1.5rem'}}>Choisir LINGUA PRO</a>
          </div>
        </div>
      </section>

      {/* FOOTER - Conversion exacte du HTML */}
      <footer>
        <div className="footer-logo">LINGUA SPACE <span style={{color: 'var(--muted)', fontSize: '0.75rem', fontFamily: "'Space Mono'", fontWeight: '400'}}>by AGTM</span></div>
        <ul className="footer-links">
          <li><a href="#">À propos</a></li>
          <li><a href="#">Conditions</a></li>
          <li><a href="#">Contact</a></li>
          <li><a href="https://africaglobaltraining.com">AGTM Academy</a></li>
        </ul>
        <span className="footer-copy">© 2025 AGTM Digital Academy · lingua.africaglobaltraining.com</span>
      </footer>
    </>
  );
};

export default Landing;
