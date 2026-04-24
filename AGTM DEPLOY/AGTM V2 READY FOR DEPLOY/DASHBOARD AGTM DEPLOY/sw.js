// ============================================================
//  AGTM Digital Academy — Service Worker v1
//  PWA : Cache intelligent, offline support, background sync
//  © 2026 AGTM Academy — Issa Bamba
// ============================================================

const CACHE_VERSION   = 'v2'
const CACHE_STATIC    = `agtm-static-${CACHE_VERSION}`
const CACHE_PAGES     = `agtm-pages-${CACHE_VERSION}`
const CACHE_CDN       = `agtm-cdn-${CACHE_VERSION}`

// ── Pages et ressources à pré-charger au premier install ────
const PRECACHE_PAGES = [
  '/dashboard.html',
  '/index.html',
  '/login.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-maskable.svg',
]

// ── Ressources CDN à mettre en cache (Cache First) ──────────
const CDN_ORIGINS = [
  'cdn.tailwindcss.com',
  'cdn.jsdelivr.net',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'html2canvas.hertzen.com',
]

// ── URLs jamais mises en cache (données dynamiques / auth) ──
const NEVER_CACHE = [
  '.supabase.co',
  'api.supabase.com',
  '/.netlify/functions/',
  '/auth/',
  'api.anthropic.com',
  'api.search.brave.com',
  'wikipedia.org/w/api.php',
]

// ── Helpers ──────────────────────────────────────────────────
function shouldNeverCache(url) {
  return NEVER_CACHE.some(pattern => url.includes(pattern))
}

function isCDN(url) {
  return CDN_ORIGINS.some(origin => url.includes(origin))
}

function isLocalPage(url, origin) {
  if (!url.startsWith(origin)) return false
  const path = url.replace(origin, '')
  return path.endsWith('.html') || path === '/' || path === ''
}

// ─────────────────────────────────────────────────────────────
//  INSTALL — Pré-charger les assets essentiels
// ─────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Install', CACHE_VERSION)
  event.waitUntil(
    caches.open(CACHE_PAGES)
      .then(cache => cache.addAll(PRECACHE_PAGES).catch(err => {
        console.warn('[SW] Precache partial failure:', err)
      }))
      .then(() => self.skipWaiting())
  )
})

// ─────────────────────────────────────────────────────────────
//  ACTIVATE — Nettoyer les anciens caches
// ─────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activate', CACHE_VERSION)
  const validCaches = [CACHE_STATIC, CACHE_PAGES, CACHE_CDN]
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => !validCaches.includes(key))
          .map(key => {
            console.log('[SW] Deleting old cache:', key)
            return caches.delete(key)
          })
      ))
      .then(() => self.clients.claim())
  )
})

// ─────────────────────────────────────────────────────────────
//  FETCH — Stratégies de cache intelligentes
// ─────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event
  const url = request.url

  // Ignorer les méthodes non-GET
  if (request.method !== 'GET') return

  // 1. Jamais mettre en cache : Supabase, Netlify Functions, Auth, AI APIs
  if (shouldNeverCache(url)) return

  // 2. Ressources CDN — Cache First (ne changent pas souvent)
  if (isCDN(url)) {
    event.respondWith(cacheFirst(request, CACHE_CDN))
    return
  }

  // 3. Pages HTML locales — Network First (données fraîches), fallback cache
  if (isLocalPage(url, self.location.origin)) {
    event.respondWith(networkFirstWithOfflineFallback(request))
    return
  }

  // 4. Ressources statiques locales (icons, manifest, etc.) — Cache First
  if (url.startsWith(self.location.origin)) {
    event.respondWith(cacheFirst(request, CACHE_STATIC))
    return
  }
})

// ─────────────────────────────────────────────────────────────
//  Stratégie : Cache First
//  → Sert depuis le cache, fetch si absent, met en cache
// ─────────────────────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cache    = await caches.open(cacheName)
  const cached   = await cache.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone()).catch(() => {})
    }
    return response
  } catch {
    // Retourner une réponse vide si hors ligne et pas en cache
    return new Response('', { status: 408, statusText: 'Offline' })
  }
}

// ─────────────────────────────────────────────────────────────
//  Stratégie : Network First avec fallback offline
//  → Essaie le réseau, fallback cache, sinon page offline
// ─────────────────────────────────────────────────────────────
async function networkFirstWithOfflineFallback(request) {
  const cache = await caches.open(CACHE_PAGES)

  try {
    const response = await fetch(request)
    if (response.ok) {
      // Mettre à jour le cache avec la version fraîche
      cache.put(request, response.clone()).catch(() => {})
    }
    return response
  } catch {
    // Hors ligne : essayer le cache
    const cached = await cache.match(request)
    if (cached) {
      // Notifier les clients qu'on est en mode hors ligne
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'OFFLINE_MODE', url: request.url }))
      })
      return cached
    }

    // Dernière option : page offline
    const offlinePage = await cache.match('/offline.html')
    return offlinePage || new Response(
      '<html><body style="background:#0D1B2A;color:#C8D8E8;font-family:sans-serif;text-align:center;padding:60px"><h1>Hors ligne</h1><p>AGTM Digital Academy n\'est pas disponible sans connexion.</p><button onclick="location.reload()" style="margin-top:20px;padding:10px 24px;background:#C8960C;border:none;border-radius:8px;color:#0D1B2A;font-weight:700;cursor:pointer">Réessayer</button></body></html>',
      { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 503 }
    )
  }
}

// ─────────────────────────────────────────────────────────────
//  MESSAGE — Gestion des messages depuis les pages
// ─────────────────────────────────────────────────────────────
self.addEventListener('message', event => {
  const { type } = event.data || {}

  // Forcer la mise à jour immédiate (utilisé après déconnexion/reconnexion)
  if (type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  // Vider le cache des pages HTML (après déploiement)
  if (type === 'CLEAR_PAGES_CACHE') {
    caches.delete(CACHE_PAGES).then(() => {
      console.log('[SW] Pages cache cleared')
      event.source?.postMessage({ type: 'CACHE_CLEARED' })
    })
  }

  // Invalider tout les caches
  if (type === 'CLEAR_ALL_CACHE') {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).then(() => {
      console.log('[SW] All caches cleared')
      event.source?.postMessage({ type: 'CACHE_CLEARED' })
    })
  }
})

// ─────────────────────────────────────────────────────────────
//  PUSH — Notifications push (préparation future)
// ─────────────────────────────────────────────────────────────
self.addEventListener('push', event => {
  if (!event.data) return
  let data = {}
  try { data = event.data.json() } catch { data = { title: 'AGTM Academy', body: event.data.text() } }

  const options = {
    body:    data.body    || 'Vous avez une nouvelle notification',
    icon:    '/icons/icon.svg',
    badge:   '/icons/icon.svg',
    tag:     data.tag     || 'agtm-notif',
    data:    { url: data.url || '/dashboard.html' },
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open',   title: '📲 Ouvrir',  icon: '/icons/icon.svg' },
      { action: 'close',  title: '✕ Fermer' }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'AGTM Digital Academy', options)
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  if (event.action === 'close') return

  const url = event.notification.data?.url || '/dashboard.html'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(c => c.url.includes(self.location.origin))
      if (existing) { existing.focus(); existing.navigate(url) }
      else self.clients.openWindow(url)
    })
  )
})
