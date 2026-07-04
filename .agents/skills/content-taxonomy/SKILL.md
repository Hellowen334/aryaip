---
name: content-taxonomy
description: Canlı TV, filmler ve diziler arasında kesin kategori ayrımı yapma, IPTV sağlayıcısının kategori/group-title bilgisini doğru işleme ve dizi bölümlerini gruplama görevlerinde kullanılır.
---
# İçerik Taksonomisi Skill

## Kaynak veri
- M3U'da her kanal/içerik #EXTINF satırında group-title attribute'u
  taşır (örn. group-title="US| MOVIES", group-title="TR| DIZILER").
  Xtream Codes'ta ise get_live_categories / get_vod_categories /
  get_series_categories AYRI endpoint'ler olarak zaten gelir.

## Kesin ayrım kuralı
- Xtream kullanılıyorsa üç kategori zaten sağlayıcı tarafından ayrık
  gelir — bunları ASLA tek bir listede birleştirme, live/vod/series
  farklı veri modelleri ve farklı ekranlarda tutulur.
- M3U kullanılıyorsa group-title içindeki anahtar kelimelerle
  (dizi/series, film/movie, canlı/live gibi çok dilli varyasyonlarla)
  sınıflandırma yapılmalı; ama bu yöntem hataya açıktır — sağlayıcı
  tutarsız isimlendirme yaparsa yanlış kovaya düşebilir. Bu riski
  kullanıcıya/loglara yansıt, sessizce yanlış sınıflandırma yapma.
- Sınıflandırılamayan içerik "Diğer/Sınıflandırılamadı" adında ayrı bir
  kovaya düşmeli, asla varsayılan olarak Filmler'e veya Diziler'e
  eklenmemeli.

## Dizi (series) özel mantığı
- Bir dizinin tüm sezon/bölümleri TEK bir dizi kartı altında
  toplanmalı; kullanıcı karta girince sezon seçici, sonra bölüm listesi
  gösterilir (Netflix modeli).
- Xtream'de get_series_info(series_id) çağrısı sezon/bölüm yapısını
  zaten verir — bunu kullan, kendi gruplama mantığını uydurmaya
  çalışma.
- M3U'da bölümler ayrı satırlar halinde gelir; dizi adı + sezon/bölüm
  numarasını başlıktan regex ile ayrıştırmak gerekir (örn.
  "Dizi Adı S01E05" formatı) — format sağlayıcıya göre değişebilir,
  esnek ama denetlenebilir bir parser kur, sessiz hata yutma.