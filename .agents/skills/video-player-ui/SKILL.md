---
name: video-player-ui
description: Video oynatıcı arayüzü (kontrol çubuğu, altyazı/ses parçası seçimi, ses/parlaklık kontrolü) tasarımı ve hls.js entegrasyonu ile ilgili görevlerde kullanılır.
---
# Video Player UI Skill

## Layout (referans: Smart Live TV)
- Üst bar: geri butonu (sol) + kanal/içerik adı (orta) + saat (sağ)
  - Kontroller belirli süre etkileşimsiz kalınca otomatik gizlenir,
    remote'ta herhangi bir tuşla tekrar görünür.
- Sol kenar: dikey ses seviyesi çubuğu (fokuslanabilir, yukarı/aşağı
  ses ayarı)
- Alt bar (soldan sağa): play/pause, önceki, geri sar, ileri sar,
  sonraki, tekrar (repeat), ALTYAZI butonu (ayrı, zorunlu), SES PARÇASI
  / kalite ayarı butonu (dişli ikonu), tam ekran, PiP (opsiyonel)

## Altyazı ve ses parçası seçimi (ZORUNLU — proje gereksinimi)
- Altyazı butonu: hls.js'den gelen subtitle track listesini bir
  focusable liste olarak açar (dil + "Kapalı" seçeneği dahil)
- Ayarlar/ses parçası butonu: hls.js audio track listesini benzer
  şekilde açar, ayrıca kalite (bitrate) seçimi de aynı menüde olabilir
- Her iki menü de remote-focus-nav kurallarına tabi: yukarı/aşağı ile
  seçenekler arası gezinme, OK ile seçim, Back ile menüyü kapatma

## Etkileşim davranışı
- Kontrol çubuğu boşta 4-5 saniye sonra fade-out olur, tam ekran video
  görünümü kalır
- Herhangi bir yön tuşuna basınca kontroller tekrar belirir ve süre
  sıfırlanır

## Canlı TV önizleme (preview panel) — kritik performans kuralları
- Fokus bir kanalda 400ms'den UZUN kalırsa preview başlatılır
  (debounce). Kullanıcı hızlıca listede geziniyorsa hiçbir stream
  açılmaz, sadece son durduğu kanalda preview yüklenir.
- Yeni preview başlamadan önce ÖNCEKİ hls.js instance'ı TAM olarak
  dispose edilir (hls.destroy() + video.src kaldırılır) — eski
  instance'lar temizlenmeden yenisi açılırsa eski webOS cihazlarda
  bellek hızla dolar.
- Preview her zaman muted + kontrolsüz (autoplay, sessiz) oynar.
- Preview stream'i yüklenemezse (kanal offline/hatalı URL) sessizce
  statik thumbnail'e döner, otomatik retry YAPILMAZ (kullanıcı başka
  kanala geçtiğinde zaten yeni bir deneme tetiklenir).
- Aynı anda en fazla 1 aktif preview instance'ı olabilir — asıl player
  ekranına geçildiğinde preview instance'ı önce destroy edilip sonra
  ana player başlatılır, ikisi asla eş zamanlı çalışmaz.

## Ses/Altyazı parçası — GERÇEK mekanizma (önceki notu düzeltiyor)
- Standart HTML5 `video.audioTracks` / `video.textTracks` API'lerine
  GÜVENİLMEZ — forumda doğrulanmış şekilde webOS'ta parça değiştirmeyi
  tetiklemiyor.
- Doğru yol: webOS'un native medya pipeline'ının yaydığı `sourceInfo`
  event'i dinlenir (medya yüklendiğinde tetiklenir), bu event
  audioTrackInfo[]/subtitleTrackInfo[] listelerini içerir. Parça
  değişimi de yine bu native mekanizma üzerinden (webOS'un kendi
  track seçim çağrısıyla) yapılır — implementasyon detayı kodlama
  aşamasında resmi webOS TV SDK dokümanından (webostv.developer.lge.com,
  webosose değil — ikisi hafif farklı olabilir) teyit edilecek,
  tahmin edilmeyecek.
- Bu mekanizma container/dosya tipine göre çalışıyor (MKV/MP4'te
  net kanıtlı), YAYIN PROTOKOLÜNDEN (HLS/progressive) bağımsız gibi
  görünüyor — yani hem Film/Dizi (genelde MP4/MKV) hem de Canlı TV'de
  MKV/TS tabanlı yayınlarda çalışması beklenir.
- HLS'e özgü tek gerçek kısıt: `EXT-X-MEDIA` ile tanımlı ALTERNATİF
  RENDITION'LARIN (sağlayıcının m3u8'de ayrı ses/altyazı grubu olarak
  sunduğu senaryo) webOS 3.5 öncesinde okunamaması — ama pratikte çoğu
  sağlayıcı ses/altyazıyı zaten TEK stream içine mux ediyor (MKV/TS
  container mantığıyla), bu durumda sourceInfo mekanizması sorunsuz
  çalışır. Yani ilk analizimdeki kısıt gerçek ama nadir karşılaşılan
  bir senaryo (ayrı EXT-X-MEDIA rendition'ları), ana senaryo değil.

## Uygulama stratejisi (güncellenmiş)
- TÜM ekranlarda (Canlı TV + Film/Dizi) native sourceInfo mekanizması
  denenir, buton varsayılan olarak enabled.
- Sadece gerçekten sourceInfo hiç gelmezse veya track listesi boşsa
  (nadir senaryo: sağlayıcı ayrı EXT-X-MEDIA rendition kullanıyorsa)
  buton disabled'a döner — bu artık webOS SÜRÜMÜNE göre değil, GELEN
  VERİYE göre karar veriliyor. Daha önceki "3.5 öncesi devre dışı"
  kuralı çok katıydı, gerçek veriye göre dinamik karara çeviriyoruz.

# video-player-ui skill'i — DÜZELTME (önceki sourceInfo notu yanlıştı)
- sourceInfo/selectTrack DOM'da erişilebilir bir API DEĞİL, com.webos.media
  Luna servisinin düşük seviyeli payload'u — 3. parti app'ler için LG
  tarafından KULLANILMASI ÖNERİLMİYOR, bu projede KULLANILMAYACAK.
- Altyazı: sidecar WebVTT <track> + video.textTracks (format bağımsız,
  güvenilir).
- Ses parçası (HLS/Canlı TV): hls.js audioTracks API (sadece hls.js
  fallback modundayken anlamlı, native oynatımda bu özellik yok sayılır).
- Ses parçası (MP4/MKV/Film-Dizi VOD): video.audioTracks DENENİR ama
  GARANTİ EDİLMEZ — gerçek cihazda test harness ile doğrulanmadan
  UI'da "her zaman çalışır" varsayılmaz. Test sonucu negatifse buton
  o içerik tipinde disabled olur.