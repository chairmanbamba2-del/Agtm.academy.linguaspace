# 📊 RECOMMANDATIONS DE MONITORING ET ROTATION DES CLÉS API
**Date :** 23/04/2026  
**Auditeur :** Cline (Architecte Logiciel IA)  
**Statut :** ✅ IMPLÉMENTÉES DANS L'AUDIT

---

## 🔍 MONITORING DES FONCTIONS IA

### 1. Configuration des logs structurés
**Objectif :** Centraliser et structurer les logs pour faciliter le débogage

**Implémentation recommandée :**
```javascript
// Configuration Winston (déjà ajoutée dans package.json)
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/ia-errors.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/ia-combined.log' })
  ]
});

// Utilisation dans les fonctions
logger.info('Appel API Groq réussi', { model: 'llama-3.3-70b', duration: '2.1s' });
logger.error('Timeout Claude API', { timeout: '15s', endpoint: '/v1/messages' });
```

### 2. Métriques de performance à surveiller
**Métriques critiques :**
- **Temps de réponse moyen** : < 5s pour Groq, < 8s pour Claude
- **Taux d'erreur** : < 5% pour chaque fournisseur IA
- **Utilisation des quotas** : Anthropic, Groq, DeepSeek
- **Latence Supabase** : < 2s pour les requêtes

**Configuration Netlify Analytics :**
```toml
# Dans netlify.toml (à ajouter)
[analytics]
  enabled = true
  [analytics.custom]
    # Métriques personnalisées
    ia_response_time = "histogram"
    ia_error_rate = "gauge"
    api_quota_usage = "counter"
```

### 3. Alertes temps réel
**Seuils d'alerte recommandés :**
- ⚠️ **Warning** : Taux d'erreur > 10% pendant 5 minutes
- 🔴 **Critical** : Taux d'erreur > 30% pendant 2 minutes
- ⚠️ **Warning** : Temps de réponse > 10s
- 🔴 **Critical** : Service complètement indisponible

**Outils recommandés :**
- **Netlify Functions Dashboard** : Monitoring natif
- **Better Stack (Logtail)** : Logs structurés
- **UptimeRobot** : Monitoring d'endpoints
- **Discord/Telegram Webhooks** : Alertes en temps réel

---

## 🔑 ROTATION AUTOMATIQUE DES CLÉS API

### 1. Stratégie de rotation
**Fréquence recommandée :**
- **Clés critiques (Anthropic, Groq)** : Rotation mensuelle
- **Clés secondaires (Twilio, Supabase)** : Rotation trimestrielle
- **Clés de recherche (Brave, Tavily)** : Rotation tous les 6 mois

### 2. Implémentation avec variables d'environnement
**Structure recommandée :**
```toml
# Dans netlify.toml
[build.environment]
  # Clés primaires (actives)
  ANTHROPIC_API_KEY_PRIMARY = "sk-ant-api03-..."
  GROQ_API_KEY_PRIMARY = "gsk_..."
  
  # Clés secondaires (backup)
  ANTHROPIC_API_KEY_SECONDARY = "sk-ant-api03-backup..."
  GROQ_API_KEY_SECONDARY = "gsk_backup..."
  
  # Date d'expiration
  API_KEYS_EXPIRATION_DATE = "2026-05-23"
```

### 3. Script de rotation automatique
**Script Python pour rotation :**
```python
#!/usr/bin/env python3
# rotate_api_keys.py

import os
import requests
from datetime import datetime, timedelta
import json

class APIRotationManager:
    def __init__(self):
        self.netlify_token = os.getenv('NETLIFY_TOKEN')
        self.site_id = os.getenv('NETLIFY_SITE_ID')
        
    def rotate_key(self, key_name, new_value):
        """Met à jour une clé API dans Netlify"""
        url = f"https://api.netlify.com/api/v1/sites/{self.site_id}/env"
        
        headers = {
            'Authorization': f'Bearer {self.netlify_token}',
            'Content-Type': 'application/json'
        }
        
        # Récupérer les variables actuelles
        response = requests.get(url, headers=headers)
        env_vars = response.json()
        
        # Mettre à jour la variable
        for var in env_vars:
            if var['key'] == key_name:
                var['values'][0]['value'] = new_value
                break
        else:
            # Variable non trouvée, l'ajouter
            env_vars.append({
                'key': key_name,
                'values': [{'value': new_value}]
            })
        
        # Appliquer les changements
        update_response = requests.put(url, headers=headers, json=env_vars)
        return update_response.status_code == 200
    
    def schedule_rotation(self):
        """Planifier la prochaine rotation"""
        next_rotation = datetime.now() + timedelta(days=30)
        
        # Mettre à jour la date d'expiration
        self.rotate_key(
            'API_KEYS_EXPIRATION_DATE',
            next_rotation.strftime('%Y-%m-%d')
        )
        
        # Notifier l'équipe
        self.send_notification(
            f"Rotation des clés API planifiée pour {next_rotation.strftime('%Y-%m-%d')}"
        )
```

### 4. Validation des clés avant rotation
**Vérifications à effectuer :**
1. **Test de connexion** : Vérifier que la nouvelle clé fonctionne
2. **Test de quota** : S'assurer que la clé a des crédits suffisants
3. **Test de performance** : Valider les temps de réponse
4. **Rollback automatique** : Revenir à l'ancienne clé en cas d'échec

---

## 🛡️ SÉCURITÉ CORS IMPLÉMENTÉE

### 1. Configuration actuelle
**Domains autorisés :**
- `https://agtm-digital-academy.netlify.app` (production)
- `https://agtm-academy.com` (domaine principal)
- `http://localhost:3000` (développement local)

**Implémentation dans `vitrine-chat.js` :**
```javascript
// Configuration CORS sécurisée
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? 
  process.env.ALLOWED_ORIGINS.split(',') : ['*']

function getCorsHeaders(origin) {
  const allowedOrigin = ALLOWED_ORIGINS.includes('*') ? '*' : 
                       (origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0])
  
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin'
  }
}
```

### 2. Recommandations supplémentaires
**Pour la production :**
1. **Supprimer `*`** : Remplacer par la liste exacte des domaines
2. **Ajouter HSTS** : `Strict-Transport-Security: max-age=31536000`
3. **Configurer CSP** : Headers Content-Security-Policy
4. **Limiter les méthodes** : Seulement POST et OPTIONS

**Configuration Netlify headers :**
```toml
[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "https://agtm-academy.com"
    Access-Control-Allow-Methods = "POST, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type"
    Access-Control-Max-Age = "86400"
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
```

---

## 📈 DASHBOARD DE SURVEILLANCE

### 1. Métriques à afficher
**Tableau de bord recommandé :**
```
┌─────────────────────────────────────────────────────┐
│ AGTM IA MONITORING DASHBOARD                        │
├─────────────────────────────────────────────────────┤
│ ✅ Statut : TOUS LES SYSTÈMES OPÉRATIONNELS         │
│ 📊 Uptime : 99.8% (30 derniers jours)               │
│ ⚡ Latence moyenne : 3.2s                            │
│ 🔄 Quotas utilisés : Anthropic 42%, Groq 18%        │
│ 👥 Prospects capturés : 127 (7 derniers jours)      │
└─────────────────────────────────────────────────────┘
```

### 2. Outils de dashboard
**Recommandations :**
- **Netlify Analytics** : Métriques natives des fonctions
- **Grafana Cloud** : Dashboard personnalisé gratuit
- **Datadog** : Monitoring avancé (payant)
- **Custom Dashboard** : Interface interne Supabase

### 3. Alertes automatiques
**Configurer via webhooks :**
```javascript
// Exemple d'alerte Discord
async function sendDiscordAlert(level, message, details) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  const embed = {
    title: `🚨 ${level.toUpperCase()} - AGTM IA`,
    description: message,
    color: level === 'critical' ? 0xff0000 : 0xffa500,
    fields: [
      { name: 'Service', value: 'Assistant IA', inline: true },
      { name: 'Timestamp', value: new Date().toISOString(), inline: true },
      { name: 'Détails', value: details || 'Aucun détail supplémentaire' }
    ]
  };
  
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [embed] })
  });
}
```

---

## 🔧 PROCÉDURES D'URGENCE

### 1. En cas de fuite de clé API
**Actions immédiates :**
1. **Révoquer la clé** : Sur le portail du fournisseur
2. **Rotation d'urgence** : Utiliser le script de rotation
3. **Audit des logs** : Vérifier les accès non autorisés
4. **Notification** : Informer l'équipe technique

### 2. En cas de panne IA
**Plan de secours :**
1. **Activer le fallback statique** : FAQ pré-définie
2. **Basculer sur un fournisseur alternatif** : Groq → Claude → DeepSeek
3. **Mode maintenance** : Message d'excuse temporaire
4. **Notification aux utilisateurs** : Communication transparente

### 3. En cas de dépassement de quota
**Actions correctives :**
1. **Basculer sur clé secondaire** : Rotation automatique
2. **Limiter le débit** : Rate limiting temporaire
3. **Prioriser les fonctionnalités** : Chatbot vitrine > Assistant admin
4. **Acheter des crédits supplémentaires** : Si nécessaire

---

## 📋 CHECKLIST DE MAINTENANCE MENSUELLE

### ✅ À vérifier chaque mois
- [ ] Quotas API utilisés vs disponibles
- [ ] Performance des endpoints (latence < 5s)
- [ ] Logs d'erreurs analysés
- [ ] Sécurité CORS à jour
- [ ] Backups des configurations
- [ ] Tests de fallback fonctionnels
- [ ] Documentation mise à jour
- [ ] Rotation des clés planifiée

### 📅 Calendrier de maintenance
- **1er du mois** : Revue des quotas et performance
- **15 du mois** : Rotation des clés critiques
- **Dernier jour** : Backup et audit de sécurité

---

**Signature :** Cline - Architecte Logiciel IA  
**Date :** 23/04/2026  
**Statut :** ✅ RECOMMANDATIONS APPLICABLES IMMÉDIATEMENT