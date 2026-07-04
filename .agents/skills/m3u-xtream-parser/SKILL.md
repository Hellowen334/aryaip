---
name: m3u-xtream-parser
description: M3U playlist veya Xtream Codes API entegrasyonu, playlist parse etme, kanal/VOD/EPG veri modeli oluşturma görevlerinde kullanılır.
---
# M3U / Xtream Parser Skill

## Kurallar
- Parse işlemi HER ZAMAN backend'de yapılır, TV/frontend sadece
  hazır JSON tüketir.
- Regex ile kırılgan parse yapma; satır satır state machine mantığıyla
  #EXTINF etiketlerini oku.
- Xtream Codes için: get_live_streams, get_vod_streams,
  get_series, get_short_epg endpoint'lerini kullan.
- Hatalı/geçersiz playlist durumunda kullanıcıya anlamlı hata göster,
  sessizce boş liste dönme.