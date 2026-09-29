// 앱 파일을 폰에 캐시해서 오프라인에서도 열리게 합니다.
// plan.js나 화면을 고쳐서 다시 올릴 때는 아래 버전 숫자를 올리세요.
const CACHE = "itp-v10";
const ASSETS = ["./", "index.html", "app.js", "plan.js", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png",
  "fonts/fonts.css", "fonts/jua/Jua-Regular.woff2", "fonts/pretendard/Pretendard-Medium.subset.woff2", "fonts/pretendard/Pretendard-SemiBold.subset.woff2", "fonts/pretendard/Pretendard-Bold.subset.woff2"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 글꼴은 바뀌지 않으니 캐시 먼저, 나머지(화면·계획)는 온라인이면 새 파일 먼저 → 업데이트가 바로 보이고, 오프라인이면 캐시로.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const isFont = url.pathname.indexOf("/fonts/") >= 0;
  e.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(req, { ignoreSearch: true }).then((hit) => {
        if (isFont && hit) return hit;
        return fetch(req)
          .then((res) => {
            if (res && res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => hit || Response.error());
      })
    )
  );
});
