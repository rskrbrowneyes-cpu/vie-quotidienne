const CACHE = "vq-v1";
const MAX_ENTRIES = 80;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(["./"]))
      .then(() => self.skipWaiting())
  );
});

const trimCache = async () => {
  const cache = await caches.open(CACHE);
  const requests = await cache.keys();
  if (requests.length <= MAX_ENTRIES) {
    return;
  }
  const dated = await Promise.all(
    requests.map(async (request) => {
      const response = await cache.match(request);
      const header = response?.headers.get("date");
      return { request, time: header ? new Date(header).getTime() : 0 };
    })
  );
  dated.sort((a, b) => a.time - b.time);
  const doomed = dated.slice(0, dated.length - MAX_ENTRIES);
  await Promise.all(doomed.map(({ request }) => cache.delete(request)));
};

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(trimCache)
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin || url.pathname.endsWith("/sw.js")) {
    return;
  }

  const navigates = request.mode === "navigate";
  const manifest = url.pathname.endsWith("/manifest.webmanifest");

  if (navigates || manifest) {
    const cacheKey = navigates ? "./" : request;
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(cacheKey, copy));
          return response;
        })
        .catch(() =>
          caches.match(cacheKey).then((cached) => cached ?? Response.error())
        )
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ??
        fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
    )
  );
});
