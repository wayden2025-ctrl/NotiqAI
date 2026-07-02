// Notiq AI service worker — minimal on purpose.
// It makes the site installable as an app; it does NOT cache pages,
// so users always get the newest deploy.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  e.respondWith(fetch(e.request).catch(() => new Response("You're offline — reconnect to use Notiq AI.", {
    status: 503,
    headers: { "Content-Type": "text/plain" },
  })));
});
