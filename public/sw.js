// Basic no-op service worker to silence 404 requests
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  // Claim clients immediately
  self.clients.claim();
});

self.addEventListener('fetch', () => {
  // This SW currently does no caching; placeholder only.
});
