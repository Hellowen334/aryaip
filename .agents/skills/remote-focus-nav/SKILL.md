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