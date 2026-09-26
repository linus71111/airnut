// Service Worker: Die App funktioniert nach dem ersten Öffnen auch ohne Internet.
// Strategie: zuerst aus dem Netz laden (damit Updates sofort ankommen), sonst aus dem Zwischenspeicher.
const CACHE = 'fallbeispiel-v1';
const BASIS = new URL(self.registration.scope).pathname;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const anfrage = e.request;
  if (anfrage.method !== 'GET' || new URL(anfrage.url).origin !== self.location.origin) return;
  e.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      try {
        const antwort = await fetch(anfrage);
        if (antwort.ok) cache.put(anfrage, antwort.clone());
        return antwort;
      } catch (fehler) {
        const gespeichert = await cache.match(anfrage);
        if (gespeichert) return gespeichert;
        // Unterseiten (z.B. /fall/...) offline: die Startseite liefern, die App übernimmt das Routing
        if (anfrage.mode === 'navigate') {
          const start = await cache.match(BASIS);
          if (start) return start;
        }
        throw fehler;
      }
    })(),
  );
});
