# Proje: LG webOS IPTV Player

## Hedef platform
- webOS 3.5 → webOS 25 arası TÜM sürümleri desteklemeliyiz.
- webOS 3.x-4.x cihazlarda Chromium 53-68 çalışıyor: ES5+ desteklenir ama
  async/await, optional chaining (?.), nullish coalescing (??) YASAK.
  Bunun yerine Promise chain, Babel transpile ve polyfill kullan.
- webOS 22+ cihazlarda Chromium 87+ var, modern syntax güvenli — ama
  kod TEK bir codebase'de olacağı için her zaman en düşük ortak payda
  (ES5-safe) yazılmalı.
- Simulator DRM ve bazı native API'leri desteklemez — gerçek cihaz
  testi olmadan hiçbir özelliği "tamamlandı" sayma.

## Uygulama tipi ve politika
- Bu uygulama içerik SAĞLAMAZ. Sadece kullanıcının kendi M3U/Xtream
  Codes/Stalker Portal bilgilerini girdiği bir OYNATICI'dır.
- Her ekranda ve app store açıklamasında bunu netleştiren bir
  disclaimer bulunmalı.
- LG Content Store önkoşulları: boşta bellek < 150MB, tüm ekranlarda
  klavye/remote fokus yönetimi, Magic Remote pointer desteği.

## Teknik yığın
- Backend: [Node.js/Python - kendi tercihini yaz], M3U/Xtream parse,
  EPG (XMLTV) işleme ve cache SUNUCU TARAFINDA yapılır. TV sadece
  hazır JSON tüketir (rakiplerin çoğu bunu TV üzerinde yapıp donuyor).
- Frontend: HTML/CSS/JS (Enact framework değerlendirilebilir), hls.js
  ile HLS oynatma.
- Paketleme: ares-cli / webOS Studio üzerinden ipk üretimi (Antigravity
  bunu bilmiyor, adım adım talimat vereceğim).

## Yasaklar
- Herhangi bir ekranda fare/dokunmatik varsayımı YOK — sadece yön
  tuşu + OK + geri tuşu ile gezinme tasarlanacak.
- localStorage/sessionStorage kullanma (webOS'ta bazı eski
  cihazlarda sorunlu) — webOS'un kendi depolama API'sini kullan.
- Kanal listelerinde sanal olmayan (virtualization'sız) uzun DOM
  render'a izin verme, TV donanımı zayıf.


## UI / Menü yapısı
- Sol tarafta sabit SideMenu: Anasayfa, Canlı TV, Filmler, Diziler,
  Ayarlar, Üyelik.
- Canlı TV: SADECE live kategoriler/kanallar. Filmler/Diziler asla
  buraya karışmaz.
- Filmler: kategori bazlı grid, sadece VOD/film içerik.
- Diziler: Netflix tarzı premium görünüm — büyük kapak görselleri,
  öne çıkan içerik banner'ı, dizi kartına girince sezon/bölüm toplu
  gösterim.
- Grid yapısı ve fokus davranışı UI'ın en kritik parçası — her grid
  bileşeni remote-focus-nav skill'ine uymalı.
- Tasarım dili: modern ama performans öncelikli — ağır blur/gölge/
  animasyon efektlerinden kaçın, TV donanımı zayıf olabilir.

## Player gereksinimleri
- Altyazı (subtitle) track seçimi zorunlu.
- Ses parçası (audio track) seçimi zorunlu (çoklu dil desteği olan
  kaynaklar için).
- hls.js üzerinden gelen subtitle/audio track listesini oynatıcı
  kontrol panelinde göster, TV remote ile seçilebilir olmalı.

## Aktivasyon / Demo sistemi
- İlk açılışta: MAC adresi gösterimi + aktivasyon ekranı (bkz.
  activation-mac-demo skill).
- Demo süresi 7 gün, doğruluk kaynağı backend.
- Süre dolunca sadece giriş ekranı gösterilir, başka hiçbir ekrana
  erişim yok.

## Kod stili
- useState her zaman `const [x, setX] = useState(...)` destructuring
  formatında yazılır, array index erişimi (`x[0]`) kullanılmaz.