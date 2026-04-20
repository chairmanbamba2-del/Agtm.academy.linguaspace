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
      
<nav>
  <div className="nav-logo">
    <Link to="/">
      <span className="name">LINGUA SPACE</span>
    </Link>
  </div>
  <ul className="nav-links">
    <li><a href="#corners">Les Corners</a></li>
    <li><a href="#assistant">IA Coach</a></li>
    <li><a href="#modules">Modules</a></li>
    <li><a href="#pricing">Abonnements</a></li>
    <li><Link to="/login">Se connecter</Link></li>
    <li><Link to="/signup" className="btn-nav">S'inscrire</Link></li>
  </ul>
</nav>


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
    <span>Parlez</span>
    <em>le monde.</em>
  </h1>

  <p className="hero-subtitle">Apprenez. Pratiquez. MaÃ®trisez.</p>

  <div className="hero-langs">
    <span className="lang-badge"><span className="flag">ðŸ‡¬ðŸ‡§</span> English Corner</span>
    <span className="lang-badge"><span className="flag">ðŸ‡ªðŸ‡¸</span> RincÃ³n EspaÃ±ol</span>
    <span className="lang-badge"><span className="flag">ðŸ‡©ðŸ‡ª</span> Deutsche Ecke</span>
    <span className="lang-badge"><span className="flag">ðŸ‡«ðŸ‡·</span> Espace Francophone</span>
  </div>

  <div className="hero-cta">
    <a href="#pricing" className="btn-primary">Choisir mon forfait â†’</a>
    <a href="#corners" className="btn-ghost">DÃ©couvrir les Corners</a>
  </div>

  <div className="hero-scroll">
    <div className="scroll-line"></div>
    SCROLL
  </div>
</section>


<div className="stats-bar">
  <div className="stat-item">
    <span className="stat-number">4</span>
    <span className="stat-label">Langues disponibles</span>
  </div>
  <div className="stat-item">
    <span className="stat-number">400</span>
    <span className="stat-label">Modules A1 â†’ C2</span>
  </div>
  <div className="stat-item">
    <span className="stat-number">2000+</span>
    <span className="stat-label">Contenus audio/vidÃ©o</span>
  </div>
  <div className="stat-item">
    <span className="stat-number">24/7</span>
    <span className="stat-label">IA Coach disponible</span>
  </div>
</div>


<section id="corners" className="fade-in">
  <span className="section-label">Vos espaces d'immersion</span>
  <h2 className="section-title">Quatre <em>Corners</em>,<br />une seule ambition.</h2>
  <p style={{color: 'var(--muted)', fontSize: '0.9rem', maxWidth: '500px', lineHeight: 1.8}}>
    Chaque Corner est un univers d'immersion linguistique : flux de contenus authentiques, quiz automatiques, coach IA et 100 modules progressifs.
  </p>

  <div className="corners-grid">
    <div className="corner-card corner-en">
      <span className="corner-flag">ðŸ‡¬ðŸ‡§</span>
      <div className="corner-name">English Corner</div>
      <span className="corner-tag">British & American English</span>
      <p className="corner-desc">Podcasts BBC, extraits de sÃ©ries, news et culture anglophone. Votre coach IA pratique avec vous le Business English, l'IELTS et la vie quotidienne.</p>
      <div className="corner-features">
        <span className="corner-feature">News & Podcasts authentiques</span>
        <span className="corner-feature">PrÃ©paration IELTS / TOEFL</span>
        <span className="corner-feature">Business & Professional English</span>
        <span className="corner-feature">100 modules A1 â†’ C2</span>
      </div>
      <span className="corner-bg-text">EN</span>
    </div>

    <div className="corner-card corner-es">
      <span className="corner-flag">ðŸ‡ªðŸ‡¸</span>
      <div className="corner-name">RincÃ³n EspaÃ±ol</div>
      <span className="corner-tag">EspaÃ±ol Internacional</span>
      <p className="corner-desc">TÃ©lÃ©vision espagnole, musique latine, culture hispanique. Votre coach IA vous emmÃ¨ne de Madrid Ã  MÃ©xico City, conversation aprÃ¨s conversation.</p>
      <div className="corner-features">
        <span className="corner-feature">Radio & TV hispanophone</span>
        <span className="corner-feature">PrÃ©paration DELE</span>
        <span className="corner-feature">Espagnol des affaires</span>
        <span className="corner-feature">100 modules A1 â†’ C2</span>
      </div>
      <span className="corner-bg-text">ES</span>
    </div>

    <div className="corner-card corner-de">
      <span className="corner-flag">ðŸ‡©ðŸ‡ª</span>
      <div className="corner-name">Deutsche Ecke</div>
      <span className="corner-tag">Deutsch fÃ¼r alle</span>
      <p className="corner-desc">ActualitÃ© Deutsche Welle, culture germanique et humour allemand. Une porte d'entrÃ©e vers l'Europe, les Ã©tudes et les opportunitÃ©s professionnelles.</p>
      <div className="corner-features">
        <span className="corner-feature">Deutsche Welle intÃ©grÃ©</span>
        <span className="corner-feature">PrÃ©paration TestDaF / Goethe</span>
        <span className="corner-feature">Allemand professionnel</span>
        <span className="corner-feature">100 modules A1 â†’ C2</span>
      </div>
      <span className="corner-bg-text">DE</span>
    </div>

    <div className="corner-card corner-fr">
      <span className="corner-flag">ðŸ‡«ðŸ‡·</span>
      <div className="corner-name">Espace Francophone</div>
      <span className="corner-tag">Francophonie mondiale</span>
      <p className="corner-desc">RFI, littÃ©rature africaine, culture francophone mondiale. Perfectionnez votre franÃ§ais Ã©crit et oral pour les concours, les examens et le monde professionnel.</p>
      <div className="corner-features">
        <span className="corner-feature">RFI Savoirs & culture africaine</span>
        <span className="corner-feature">PrÃ©paration DELF / DALF</span>
        <span className="corner-feature">FranÃ§ais des affaires</span>
        <span className="corner-feature">100 modules A1 â†’ C2</span>
      </div>
      <span className="corner-bg-text">FR</span>
    </div>
  </div>
</section>


<div id="assistant" className="ia-section fade-in">
  <div className="ia-grid">
    <div className="ia-content">
      <span className="section-label">Intelligence Artificielle</span>
      <h2 className="section-title" style={{fontSize: '2.5rem'}}>Votre coach<br /><em>personnel</em> 24h/24.</h2>
      <p style={{color: 'var(--muted)', fontSize: '0.88rem', lineHeight: 1.8, marginBottom: '1.5rem'}}>
        PropulsÃ© par Claude Sonnet & Opus d'Anthropic, votre assistant corrige vos erreurs, reformule naturellement et vous fait progresser conversation aprÃ¨s conversation.
      </p>

      <div className="ia-modes">
        <div className="ia-mode">
          <span className="ia-mode-icon">ðŸ—£ï¸</span>
          <div>
            <div className="ia-mode-name">Free Talk</div>
            <div className="ia-mode-desc">Conversation libre sur tous les sujets</div>
          </div>
          <span className="ia-mode-badge badge-std">STANDARD</span>
        </div>
        <div className="ia-mode">
          <span className="ia-mode-icon">ðŸ’¼</span>
          <div>
            <div className="ia-mode-name">Business Mode</div>
            <div className="ia-mode-desc">RÃ©unions, emails, prÃ©sentations pro</div>
          </div>
          <span className="ia-mode-badge badge-std">STANDARD</span>
        </div>
        <div className="ia-mode">
          <span className="ia-mode-icon">ðŸŽ­</span>
          <div>
            <div className="ia-mode-name">Role Play</div>
            <div className="ia-mode-desc">Jeux de rÃ´le immersifs et scÃ©narios</div>
          </div>
          <span className="ia-mode-badge badge-prm">PREMIUM</span>
        </div>
        <div className="ia-mode">
          <span className="ia-mode-icon">ðŸŽ¯</span>
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
        <div className="ia-avatar">ðŸ¤–</div>
        <div>
          <div className="ia-name">Lingua AI Coach Â· English Corner</div>
          <div className="ia-status">â— En ligne Â· Niveau B1 dÃ©tectÃ©</div>
        </div>
      </div>

      <div className="chat-bubble bubble-ai">
        Hello! I'm your English Coach. What would you like to practice today? We can do a free conversation, or maybe prepare for a job interview? ðŸ˜Š
      </div>

      <div className="chat-bubble bubble-user">
        I want to practice for a interview. I'm a little nervous about speak english in front of people.
      </div>

      <div className="chat-bubble bubble-correction">
        âœï¸ <strong>Quick correction:</strong> "â€¦nervous about <em>speaking</em> Englishâ€¦" â€” use the gerund after prepositions. Great initiative though!
      </div>

      <div className="chat-bubble bubble-ai">
        That's completely normal! Let's do a mock interview together. I'll be the interviewer. Ready? <br /><br />
        <em>"Tell me about yourself and why you applied for this position."</em>
      </div>
    </div>
  </div>
</div>


<section className="modules-section fade-in" id="modules">
  <span className="section-label">Parcours structurÃ©</span>
  <h2 className="section-title">100 modules.<br /><em>6 niveaux</em> CEFR.</h2>
  <p style={{color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.8, maxWidth: '500px'}}>
    Chaque langue dispose de 100 modules progressifs, de l'alphabet jusqu'Ã  la maÃ®trise avancÃ©e. Un test de niveau automatique vous place dÃ¨s l'inscription.
  </p>

  <div className="cefr-track">
    <div className="cefr-level">
      <span className="cefr-code">A1</span>
      <span className="cefr-name">DÃ©couverte</span>
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
      <span className="cefr-name">AvancÃ©</span>
      <span className="cefr-count">~20 modules</span>
    </div>
    <div className="cefr-level">
      <span className="cefr-code">C1</span>
      <span className="cefr-name">Autonome</span>
      <span className="cefr-count">~15 modules</span>
    </div>
    <div className="cefr-level">
      <span className="cefr-code">C2</span>
      <span className="cefr-name">MaÃ®trise</span>
      <span className="cefr-count">~12 modules</span>
    </div>
  </div>
</section>


<section className="pricing-section fade-in" id="pricing">
  <div style={{textAlign: 'center'}}>
    <span className="section-label" style={{justifyContent: 'center'}}>Tarifs & Abonnements</span>
    <h2 className="section-title" style={{fontSize: 'clamp(2rem, 5vw, 3rem)'}}>Simple. <em>Transparent.</em> Accessible.</h2>
    <p style={{color: 'var(--muted)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1rem', lineHeight: 1.8}}>
      Aucun engagement Ã  long terme. RÃ©siliez quand vous voulez. Paiement par Mobile Money, Wave ou carte bancaire.
    </p>
  </div>

  <div className="pricing-grid">


    <div className="pricing-card">
      <span className="plan-icon">ðŸŸ¡</span>
      <div className="plan-name">Forfait</div>
      <div className="plan-title">LINGUA UNI</div>
      <div className="plan-price">
        <span className="price-amount">10 000</span>
        <span className="price-currency">FCFA</span>
      </div>
      <div className="plan-period">par mois Â· 1 langue au choix</div>

      <div className="plan-lang-chips">
        <span className="lang-chip">ðŸ‡¬ðŸ‡§ EN</span>
        <span className="lang-chip">ðŸ‡ªðŸ‡¸ ES</span>
        <span className="lang-chip">ðŸ‡©ðŸ‡ª DE</span>
        <span className="lang-chip">ðŸ‡«ðŸ‡· FR</span>
      </div>

      <div className="plan-divider"></div>

      <ul className="plan-features">
        <li className="plan-feature">
          <span className="feature-check">âœ¦</span>
          <span>1 Corner au choix parmi les 4 langues</span>
        </li>
        <li className="plan-feature">
          <span className="feature-check">âœ¦</span>
          <span>100 modules A1 â†’ C2 (langue choisie)</span>
        </li>
        <li className="plan-feature">
          <span className="feature-check">âœ¦</span>
          <span>Flux audio/vidÃ©o + quiz IA automatiques</span>
        </li>
        <li className="plan-feature">
          <span className="feature-check">âœ¦</span>
          <span>Assistant IA Speaking & Listening â€” Claude Sonnet</span>
        </li>
        <li className="plan-feature">
          <span className="feature-check">âœ¦</span>
          <span>30 sessions IA par mois</span>
        </li>
        <li className="plan-feature">
          <span className="feature-check">âœ¦</span>
          <span>Test de niveau automatique Ã  l'inscription</span>
        </li>
        <li className="plan-feature">
          <span className="feature-check">âœ¦</span>
          <span>Rapport de progression hebdomadaire</span>
        </li>
      </ul>

      <Link to="/signup?plan=uni" className="plan-cta cta-outline">Commencer avec UNI</Link>
    </div>


    <div className="pricing-card featured">
      <span className="plan-icon">ðŸ”µ</span>
      <div className="plan-name">Forfait</div>
      <div className="plan-title">LINGUA ALL ACCESS</div>
      <div className="plan-price">
        <span className="price-amount">15 000</span>
        <span className="price-currency">FCFA</span>
      </div>
      <div className="plan-period">par mois Â· Les 4 langues incluses</div>

      <div className="plan-lang-chips">
        <span className="lang-chip">ðŸ‡¬ðŸ‡§ EN</span>
        <span className="lang-chip">ðŸ‡ªðŸ‡¸ ES</span>
        <span className="lang-chip">ðŸ‡©ðŸ‡ª DE</span>
        <span className="lang-chip">ðŸ‡«ðŸ‡· FR</span>
      </div>

      <div className="plan-divider"></div>

      <ul className="plan-features">
        <li className="plan-feature">
          <span className="feature-check">âœ¦</span>
          <span><strong>Les 4 Corners</strong> â€” English, EspaÃ±ol, Deutsch, FranÃ§ais</span>
        </li>
        <li className="plan-feature">
          <span className="feature-check">âœ¦</span>
          <span>400 modules A1 â†’ C2 (toutes langues)</span>
        </li>
        <li className="plan-feature">
          <span className="feature-check">âœ¦</span>
          <span>Flux audio/vidÃ©o illimitÃ© + quiz IA</span>
        </li>
        <li className="plan-feature">
          <span className="feature-check">âœ¦</span>
          <span>Assistant IA premium â€” <strong>Claude Opus</strong></span>
        </li>
        <li className="plan-feature">
          <span className="feature-check">âœ¦</span>
          <span><strong>Sessions IA illimitÃ©es</strong></span>
        </li>
        <li className="plan-feature">
          <span className="feature-check">âœ¦</span>
          <span>Role Play & Exam Prep (IELTS, DELF, DELE, Goethe)</span>
        </li>
        <li className="plan-feature">
          <span className="feature-check">âœ¦</span>
          <span>Progression simultanÃ©e sur 4 langues</span>
        </li>
        <li className="plan-feature">
          <span className="feature-check">âœ¦</span>
          <span>Rapport dÃ©taillÃ© + leaderboard mensuel</span>
        </li>
      </ul>

      <Link to="/signup?plan=all-access" className="plan-cta cta-gold">Commencer avec ALL ACCESS</Link>
    </div>
  </div>

  <div className="pricing-note">
    ðŸ”’ Paiement 100% sÃ©curisÃ© Â·
    Sans engagement Â·
    RÃ©siliation en 1 clic
  </div>
  <div className="payment-methods">
    <span className="pay-badge">ðŸŸ  Orange Money</span>
    <span className="pay-badge">ðŸ”µ Wave</span>
    <span className="pay-badge">ðŸŸ¡ MTN MoMo</span>
    <span className="pay-badge">ðŸ’³ Carte bancaire</span>
    <span className="pay-badge">ðŸŒ Flutterwave</span>
  </div>
</section>


<div className="install-section fade-in">
  <div className="install-content">
    <div className="install-icon">ðŸ“±</div>
    <span className="section-label" style={{justifyContent: 'center', marginBottom: '1rem'}}>Application mobile</span>
    <h3 className="section-title" style={{fontSize: '2rem', textAlign: 'center'}}>Installez LINGUA SPACE<br />sur votre <em>tÃ©lÃ©phone.</em></h3>
    <p style={{color: 'var(--muted)', fontSize: '0.88rem', lineHeight: 1.8, marginBottom: '2rem'}}>
      Disponible comme application installable (PWA) sur Android et iOS. Aucun tÃ©lÃ©chargement depuis un store. Ouvrez le site et appuyez sur "Ajouter Ã  l'Ã©cran d'accueil".
    </p>
    <div style={{display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap'}}>
      <a href="#" className="btn-primary">ðŸ“² Installer sur Android</a>
      <a href="#" className="btn-ghost">ðŸŽ Installer sur iOS</a>
    </div>
  </div>
</div>


<footer>
  <div className="footer-logo">LINGUA SPACE</div>
  <ul className="footer-links">
    <li><a href="#">Ã€ propos</a></li>
    <li><a href="#">Conditions</a></li>
    <li><a href="#">Contact</a></li>
    <li><a href="https://africaglobaltraining.com">AGTM Academy</a></li>
  </ul>
  <span className="footer-copy">Â© 2025 LINGUA SPACE Â· lingua.africaglobaltraining.com</span>
</footer>


    </>
  );
};

export default Landing;
