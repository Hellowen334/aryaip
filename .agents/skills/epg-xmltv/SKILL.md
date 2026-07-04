---
name: epg-xmltv
description: EPG (elektronik program rehberi) verisinin XMLTV formatından işlenmesi, gzip açma, kanal-program eşleştirme ve zaman dilimi normalizasyonu gerektiren görevlerde kullanılır.
---
# EPG / XMLTV Skill

## Kurallar
- XMLTV genelde .xml.gz olarak gelir; decompress İŞLEMİ BACKEND'DE
  yapılır, TV'ye asla ham gzip gönderilmez.
- Her <programme> etiketindeki channel attribute'u, kanal listesindeki
  tvg-id (M3U #EXTINF içindeki) ile eşleştirilir — eşleşmeyen kanallar
  için "EPG yok" durumunu net göster, sessizce atlama.
- start/stop zamanları genelde "+0300" gibi ofset içerir; TV'nin
  sistem saat dilimine göre normalize et, ham string gösterme.
- EPG verisi büyük olabilir (binlerce kanal x 7 gün); TV'ye sadece
  görüntülenen zaman aralığındaki program verisini gönder, tamamını
  yükleme.
- EPG kaynağı sağlanmazsa (M3U'da EPG URL yoksa) kullanıcıya manuel
  EPG URL ekleme seçeneği sun, uygulamayı EPG'siz de çalıştır.