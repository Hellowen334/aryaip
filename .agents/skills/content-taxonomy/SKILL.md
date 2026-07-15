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

## Dizi kategorileştirme — 3 seviyeli hiyerarşi (kesinleşmiş)
Seviye 1 — Kategori (sağlayıcı/tür): "HBO", "Netflix Originals" vb.
  - Xtream: get_series_categories → category_id, category_name
  - M3U: group-title birebir kategori adı olarak kullanılır

Seviye 2 — Dizi listesi (kategori içinde): "Game of Thrones" vb.
  - Xtream: get_series(category_id) → series_id, name, cover
  - M3U: aynı group-title altındaki bölüm satırları, başlıktan
    regex ile dizi adı çıkarılıp gruplanır (örn. "Game of Thrones
    S01E01" → dizi adı "Game of Thrones")

Seviye 3 — Sezon/Bölüm detayı: dizi kartına girildiğinde
  - Xtream: get_series_info(series_id) → seasons nesnesi zaten
    sezon numarasına göre gruplu gelir, episode'lar sezon içinde
    bölüm numarasına göre sıralı
  - M3U: aynı regex çıktısından (S01E01 gibi) sezon numarası alınıp
    manuel gruplanır, artan sırada sıralanır (sezon asc, bölüm asc)
  - UI: Netflix tarzı — üstte banner/kapak görseli, altında sezon
    seçici (yatay tab/dropdown), sezon seçilince o sezonun bölümleri
    dikey liste (thumbnail + bölüm no + başlık + süre)

## Component akışı
<SeriesCategoryGrid>  → kategori kartları (HBO, Netflix Originals...)
  → <SeriesGrid>       → o kategorideki dizi posterleri
    → <SeriesDetailScreen>
        ├── <SeriesBanner>       kapak + açıklama
        ├── <SeasonSelector>     yatay sezon sekmeleri (odaklanabilir)
        └── <EpisodeList>        seçili sezonun bölümleri (dikey liste)

## Diziler — ek performans ve navigasyon kuralları
- SeriesGrid ve SeriesCategoryGrid: sadece görünen + buffer kadar
  poster render edilir (virtualization), görsel yükleme lazy (viewport'a
  girmeden fetch başlamaz).
- Poster görselleri native <img loading="lazy"> veya IntersectionObserver
  ile tetiklenir — hepsi mount anında aynı anda istek atmaz.

## Focus zone geçişi (SeriesDetailScreen)
- Üç ayrı zone: 'seasons' (yatay, SeasonSelector) ve 'episodes'
  (dikey, EpisodeList).
- Varsayılan focus: 'seasons' zone, ilk sezon seçili.
- Aşağı tuşu: 'seasons' zone'dan 'episodes' zone'a geçer (ilk bölüme
  focus).
- Yukarı tuşu: 'episodes' zone'da ilk bölümdeyken tekrar 'seasons'
  zone'a döner.
- Her handler'ın başında isActive={currentZone === 'kendi_zone_adı'}
  guard'ı olmalı (PackageGrid'deki isActive deseniyle birebir aynı,
  yeni bir mantık icat edilmiyor).