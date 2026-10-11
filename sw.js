const CACHE='gorut-outbreak-ai-final-v88';
const ASSETS=[
  './',
  './index.html',
  './app.js',
  './backend-config.js',
  './manifest.webmanifest',
  './mobile.html',
  './mobile-manifest.json',
  './public_survey.html',
  './logo-gorontalo-utara-official.png',
  './logo-surveilans-epidemiologi-official.png'
];
self.addEventListener('install',event=>event.waitUntil(
  caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())
));
self.addEventListener('activate',event=>event.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('gorut-outbreak-ai-')&&k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim())
));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  // Cache only same-origin static site resources. Never cache Supabase/API/CDN responses,
  // which may contain confidential surveillance or patient data.
  if(url.origin!==self.location.origin)return;
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    if(response.ok){
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(event.request,copy));
    }
    return response;
  }).catch(()=>cached)));
});