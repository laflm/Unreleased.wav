const CACHE = 'unreleasedwav-shell-v2'; // Keep this cache name stable across GitHub Pages commits.
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  // Never delete caches on upgrade. App data and auth storage are separate from the SW cache.
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) { const copy=response.clone(); caches.open(CACHE).then(cache=>cache.put('./index.html',copy)).catch(()=>{}); }
      return response;
    }).catch(async()=> (await caches.match(request)) || (await caches.match('./index.html')) || Response.error()));
    return;
  }
  event.respondWith(caches.match(request).then(cached => {
    const network=fetch(request).then(response=>{if(response.ok)caches.open(CACHE).then(cache=>cache.put(request,response.clone())).catch(()=>{});return response;});
    return cached || network.catch(()=>Response.error());
  }));
});
