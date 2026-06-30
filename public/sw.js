const SOLINT_CACHE = "solint-seguros-v1";

const CORE_ASSETS = [
  "/",
  "/login",
  "/dashboard",
  "/acumulados",
  "/comparador",
  "/configuracion",
  "/historial",
  "/reportes",
  "/usuarios",
  "/manifest.webmanifest",
  "/images/solint-business-systems.png",
  "/images/solint-business-systems-c.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SOLINT_CACHE).then((cache) => cache.addAll(CORE_ASSETS))
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== SOLINT_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseClone = response.clone();

        caches.open(SOLINT_CACHE).then((cache) => {
          cache.put(request, responseClone);
        });

        return response;
      })
      .catch(() =>
        caches.match(request).then((cachedResponse) => {
          return cachedResponse || caches.match("/login");
        })
      )
  );
});
