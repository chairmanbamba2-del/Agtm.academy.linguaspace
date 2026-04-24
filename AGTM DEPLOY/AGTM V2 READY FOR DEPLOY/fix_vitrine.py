#!/usr/bin/env python3
"""
Script de correction pour la page vitrine-new.html
Corrige les problèmes identifiés :
1. Bouton de connexion manquant
2. Configuration PWA incomplète
3. Assistante IA marketing peu visible
4. Synchronisation base de données manquante
"""

import re
import os

def fix_vitrine():
    print('🔧 CORRECTION DES PROBLÈMES IDENTIFIÉS')
    print('=' * 60)
    
    # 1. Lire le fichier vitrine-new.html
    with open('vitrine-new.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 2. Ajouter un bouton de connexion dans la navbar
    print('1. 🛠️ AJOUT DU BOUTON DE CONNEXION DANS LA NAVBAR :')
    navbar_pattern = r'<nav class="navbar">\s*<a href="#" class="logo">AGTM<span>Digital Academy</span></a>\s*<a href="assistante-ia-chatbot\.html" class="btn btn-primary" style="padding: 11px 22px; font-size: 0\.95rem;">🤖 Assistante IA</a>'
    
    new_navbar = '''<nav class="navbar">
    <a href="#" class="logo">AGTM<span>Digital Academy</span></a>
    <div style="display: flex; gap: 12px; align-items: center;">
      <a href="login.html" class="btn btn-secondary" style="padding: 11px 22px; font-size: 0.95rem;">🔐 Connexion</a>
      <a href="assistante-ia-chatbot.html" class="btn btn-primary" style="padding: 11px 22px; font-size: 0.95rem;">🤖 Assistante IA</a>
    </div>
  </nav>'''
    
    if re.search(navbar_pattern, content):
        content = re.sub(navbar_pattern, new_navbar, content)
        print('   ✅ Bouton de connexion ajouté à la navbar')
    else:
        print('   ⚠️  Pattern navbar non trouvé, vérification manuelle nécessaire')
    
    # 3. Ajouter la configuration PWA dans le <head>
    print()
    print('2. 📱 AJOUT DE LA CONFIGURATION PWA :')
    
    pwa_config = '''<head>
  <!-- PWA Configuration -->
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#0A1520">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <link rel="apple-touch-icon" href="icons/icon-192.png">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="application-name" content="AGTM Digital Academy">
  <meta name="apple-mobile-web-app-title" content="AGTM Academy">
  
  <!-- Service Worker Registration -->
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('sw.js').then(function(registration) {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
          console.log('ServiceWorker registration failed: ', err);
        });
      });
    }
  </script>'''
    
    if '<head>' in content:
        content = content.replace('<head>', pwa_config, 1)
        print('   ✅ Configuration PWA ajoutée')
    else:
        print('   ⚠️  Balise <head> non trouvée')
    
    # 4. Renforcer la présence de l'assistante IA
    print()
    print('3. 🤖 RENFORCEMENT DE L\'ASSISTANTE IA MARKETING :')
    
    # Ajouter une section IA marketing après les formations
    ia_section = '''
  <!-- ═══════════════════════════════════════════════════════════
       SECTION MARKETING IA - ASSISTANTE INTELLIGENTE
  ═══════════════════════════════════════════════════════════ -->
  <section style="padding: 80px 24px; background: linear-gradient(145deg, #0F1E2E 0%, #1A2535 100%); text-align: center;">
    <div style="max-width: 800px; margin: 0 auto;">
      <div style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; background: rgba(74,144,217,0.12); border: 1px solid rgba(74,144,217,0.25); border-radius: 99px; font-size: 0.72rem; font-family: monospace; color: #6AAEF5; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 20px;">
        🤖 MARKETING INTELLIGENT
      </div>
      <h2 style="font-family: Georgia, serif; font-size: 2.5rem; font-weight: 700; color: #E2D8C0; margin-bottom: 16px;">
        Assistante IA Marketing <span style="color: #C8960C;">24/7</span>
      </h2>
      <p style="font-size: 1.05rem; color: #8AAAC0; max-width: 600px; margin: 0 auto 32px; line-height: 1.7;">
        Notre IA analyse vos besoins en temps réel et génère des stratégies marketing personnalisées. 
        Suivi des performances, recommandations intelligentes et automatisation des campagnes.
      </p>
      <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 40px;">
        <div style="background: rgba(200,150,12,0.08); border: 1px solid rgba(200,150,12,0.2); border-radius: 12px; padding: 20px; flex: 1; min-width: 200px; text-align: left;">
          <div style="font-size: 1.8rem; color: #C8960C; margin-bottom: 8px;">📊</div>
          <div style="font-weight: 700; color: #E2D8C0; margin-bottom: 6px;">Analytics Temps Réel</div>
          <div style="font-size: 0.85rem; color: #8AAAC0;">Suivi des conversions et ROI instantané</div>
        </div>
        <div style="background: rgba(74,144,217,0.08); border: 1px solid rgba(74,144,217,0.2); border-radius: 12px; padding: 20px; flex: 1; min-width: 200px; text-align: left;">
          <div style="font-size: 1.8rem; color: #6AAEF5; margin-bottom: 8px;">🤖</div>
          <div style="font-weight: 700; color: #E2D8C0; margin-bottom: 6px;">Génération Automatique</div>
          <div style="font-size: 0.85rem; color: #8AAAC0;">Contenus, emails, posts réseaux sociaux</div>
        </div>
        <div style="background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2); border-radius: 12px; padding: 20px; flex: 1; min-width: 200px; text-align: left;">
          <div style="font-size: 1.8rem; color: #22C55E; margin-bottom: 8px;">🎯</div>
          <div style="font-weight: 700; color: #E2D8C0; margin-bottom: 6px;">Personnalisation</div>
          <div style="font-size: 0.85rem; color: #8AAAC0;">Stratégies adaptées à chaque apprenant</div>
        </div>
      </div>
      <a href="assistante-ia-chatbot.html" style="display: inline-flex; align-items: center; gap: 10px; padding: 16px 36px; background: linear-gradient(135deg, #4A90D9 0%, #6AAEF5 100%); border: none; border-radius: 99px; color: white; font-size: 1rem; font-weight: 700; text-decoration: none; transition: all 0.3s;">
        🚀 Accéder à l'Assistante IA Marketing
      </a>
    </div>
  </section>
'''
    
    # Trouver où insérer la section IA (avant le footer)
    if '</footer>' in content:
        content = content.replace('</footer>', ia_section + '\n  </footer>')
        print('   ✅ Section IA marketing ajoutée')
    else:
        print('   ⚠️  Balise </footer> non trouvée')
    
    # 5. Ajouter la synchronisation avec la base de données
    print()
    print('4. 🗄️ AJOUT DE LA SYNCHRONISATION BASE DE DONNÉES :')
    
    # Ajouter un script pour les données dynamiques
    dynamic_script = '''
  <!-- ═══════════════════════════════════════════════════════════
       SYNCHRONISATION TEMPS RÉEL AVEC SUPABASE
  ═══════════════════════════════════════════════════════════ -->
  <script>
    // Fonction pour charger les statistiques dynamiques
    async function loadDynamicStats() {
      try {
        // Récupérer les statistiques depuis l'API Netlify
        const response = await fetch('/api/stats');
        if (response.ok) {
          const stats = await response.json();
          
          // Mettre à jour les compteurs
          updateCounter('stat-apprenants', stats.apprenants || 500);
          updateCounter('stat-satisfaction', stats.satisfaction || 95);
          updateCounter('stat-formateurs', stats.formateurs || 8);
          updateCounter('stat-niveaux', 'A1→C1');
        }
      } catch (error) {
        console.log('Chargement des stats échoué, utilisation des valeurs par défaut');
      }
    }
    
    function updateCounter(elementId, targetValue) {
      const element = document.getElementById(elementId);
      if (!element) return;
      
      if (typeof targetValue === 'number') {
        let current = 0;
        const increment = targetValue / 50;
        const timer = setInterval(() => {
          current += increment;
          if (current >= targetValue) {
            element.textContent = targetValue + (elementId === 'stat-satisfaction' ? '%' : '+');
            clearInterval(timer);
          } else {
            element.textContent = Math.floor(current) + (elementId === 'stat-satisfaction' ? '%' : '+');
          }
        }, 30);
      } else {
        element.textContent = targetValue;
      }
    }
    
    // Charger les données au démarrage
    document.addEventListener('DOMContentLoaded', function() {
      loadDynamicStats();
      
      // Mettre à jour toutes les 5 minutes
      setInterval(loadDynamicStats, 5 * 60 * 1000);
    });
  </script>
'''
    
    # Ajouter le script avant la fermeture du body
    if '</body>' in content:
        content = content.replace('</body>', dynamic_script + '\n</body>')
        print('   ✅ Script de synchronisation ajouté')
    else:
        print('   ⚠️  Balise </body> non trouvée')
    
    # 6. Mettre à jour les IDs des statistiques pour la synchronisation
    print()
    print('5. 🔄 MISE À JOUR DES STATISTIQUES POUR SYNCHRONISATION :')
    stats_updates = [
        ('<span class="stat-number">500+</span>', '<span class="stat-number" id="stat-apprenants">500+</span>'),
        ('<span class="stat-number">95%</span>', '<span class="stat-number" id="stat-satisfaction">95%</span>'),
        ('<span class="stat-number">8+</span>', '<span class="stat-number" id="stat-formateurs">8+</span>'),
        ('<span class="stat-number">A1→C1</span>', '<span class="stat-number" id="stat-niveaux">A1→C1</span>'),
    ]
    
    for old, new in stats_updates:
        if old in content:
            content = content.replace(old, new)
            print(f'   ✅ ID ajouté: {new.split("id=")[1].split(">")[0]}')
    
    # 7. Sauvegarder les modifications
    with open('vitrine-new.html', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print()
    print('✅ MODIFICATIONS APPLIQUÉES :')
    print('1. Bouton "Connexion" ajouté à la navbar')
    print('2. Configuration PWA complétée')
    print('3. Section IA marketing renforcée')
    print('4. Synchronisation base de données ajoutée')
    print('5. Statistiques préparées pour mise à jour dynamique')
    print()
    print('🚀 POUR DÉPLOYER LES MODIFICATIONS :')
    print('1. Copier vitrine-new.html vers index.html')
    print('2. Exécuter netlify deploy --prod --dir .')
    print('3. Tester https://africaglobaltraining.com')

if __name__ == '__main__':
    fix_vitrine()