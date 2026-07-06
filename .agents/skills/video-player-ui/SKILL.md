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