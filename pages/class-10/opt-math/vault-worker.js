/**
 * Vault Worker — Service Worker Network Proxy
 * 
 * Intercepts fetch requests to the /assets/secure-pdfs/ directory
 * and validates that the request includes the X-Secure-Stream-Token
 * header. Direct browser navigation or DevTools requests will be
 * blocked with a 403 Forbidden response.
 */
const VAULT_PREFIX = 'assets/secure-pdfs/';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only intercept requests targeting the secure PDF vault
  if (url.pathname.includes(VAULT_PREFIX)) {
    const hasSecureToken = event.request.headers.get('X-Secure-Stream-Token') === 'true';
    const isLocalRequest = url.origin === self.location.origin;

    if (!hasSecureToken || !isLocalRequest) {
      event.respondWith(
        new Response(
          JSON.stringify({ error: 'Access Denied: Direct stream access is prohibited.' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      );
      return;
    }
  }

  // Pass through all other requests
  event.respondWith(fetch(event.request));
});
