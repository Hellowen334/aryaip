---
name: remote-focus-nav
description: LG uzaktan kumanda ile yön tuşu navigasyonu ve fokus yönetimi gerektiren her ekran/component tasarımında kullanılır. Kanal listesi, menü, ayarlar ekranı gibi yerlerde tetiklenir.
---
# Remote Focus Navigation Skill

## Kurallar
- Her interaktif eleman data-focusable="true" taşımalı.
- Yön tuşu (37/38/39/40 key code) ile spatial navigation uygula;
  webOS'un kendi key code'ları standart tarayıcıdan farklı olabilir,
  varsayım yapma, resmi webOS dokümantasyonundaki tabloyu referans al.
- Geri tuşu (backspace/key 461 gibi webOS'a özgü olabilir) her zaman
  bir önceki ekrana dönmeli, uygulamayı kapatmamalı (kök ekran hariç).
- Fokuslu eleman her zaman görsel olarak belirgin olmalı (outline/scale).
- Büyük listelerde (100+ öğe) sadece görünen + buffer kadar öğeyi
  render et (virtualization).

## SideMenu davranışı (kesinleşmiş — Netflix/YouTube TV tarzı)
- Varsayılan durum: daraltılmış (collapsed), sadece ikonlar görünür,
  genişlik ~72px.
- Kullanıcı Sol tuşla SideMenu bölgesine odaklanınca (focusZone = 'menu'
  olunca): menü genişler (~220px'e animasyonla, 200ms ease), her
  ikonun yanında etiket (Anasayfa, Canlı TV, Filmler, Diziler, Ayarlar,
  Üyelik) belirir.
- Kullanıcı Sağ tuşla içerik alanına geçince (focusZone = 'content'):
  menü tekrar daralır, sadece ikonlar kalır.
- Aktif/fokuslu öğe: dairesel #F4821F arka plan (referans görseldeki
  gibi), ikon beyaza döner.
- Kilitli öğe (grace/expired durumunda Filmler/Diziler): ikonun sağ
  alt köşesinde küçük kilit rozeti — hem daralmış hem genişlemiş
  halde görünür kalmalı.
- Genişleme/daralma İÇERİK ALANININ layout'unu KAYDIRMAMALI — menü
  içeriğin üzerine overlay olarak açılır (position: absolute/fixed),
  content alanı sabit kalır. Aksi halde her fokus geçişinde grid'ler
  yeniden hizalanır, bu hem performans hem görsel kararlılık sorunu
  yaratır.