const CACHE_NAME = 'card-dice-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/game.html',
  '/style.css',
  '/css/game.css',
  '/js/game.js',
  '/js/player.js',
  '/js/enemy.js',
  '/js/cards.js',
  '/js/economia.js',
  '/js/sonidos.js',
  '/menu.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
});
