seconst CACHE_NAME = "CACHE_V2";
lf.addEventListener('install', e => {
  e.waitUntil(caches.open('inv-v2').then(c => c.addAll([
    './','./index.html','./styles.css','./app.js',
    './data/investors.json','./manifest.webmanifest','./assets/icon-512.png'
  ])));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
