const staticCacheName = "site-static-v1";

const assets = [
	"index.html",
	"js/pixi.min.js",
	"js/pixi-timer.js",
	"js/box2d.min.js",
	"js/gsap.min.js",

	"assets/images/boost.png",
	"assets/images/coin.png",
	"assets/images/day_night_disk.png",
	"assets/images/game_over_screen_restart_button.png",
	"assets/images/hills.png",
	"assets/images/player.png",
	"assets/images/screen_02_pause_button.png",
	"assets/images/screen_02_play_button.png"
];

self.addEventListener("install", evt => {
	evt.waitUntil(
		caches.open(staticCacheName).then((cache) => {
			console.log("caching shell assets");
			cache.addAll(assets);
		})
	);
});
self.addEventListener("activate", evt => {
	evt.waitUntil(
		caches.keys().then(keys => {
			return Promise.all(keys
				.filter(key => key !== staticCacheName)
				.map(key => caches.delete(key))
			);
		})
	);
});
self.addEventListener("fetch", evt => {
	evt.respondWith(
		caches.match(evt.request).then(cacheRes => {
			return cacheRes || fetch(evt.request);
		})
	);
});