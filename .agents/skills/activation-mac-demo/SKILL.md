---
name: activation-mac-demo
description: Uygulama ilk açılışında aktivasyon/demo ekranı, TV MAC adresi tabanlı cihaz tanımlama, 7 günlük deneme süresi ve web sitesi üzerinden liste yükleme akışıyla ilgili her görevde kullanılır.
---
# Aktivasyon & Demo Sistemi Skill

## Akış
1. Uygulama ilk açıldığında: webOS'un sistem servisinden TV'nin MAC
   adresini al (network bilgisi API'si üzerinden — LSHelpers/Luna
   servisleriyle, tarayıcı JS'inde doğrudan MAC okunamaz, bu native bir
   webOS API çağrısı gerektirir, araştırılıp doğru servis adı teyit
   edilmeli).
2. MAC adresini ekranda büyük ve okunaklı göster (kullanıcı bunu
   web sitesine girecek).
3. Kullanıcı web sitesinden MAC + (varsa) kod girip listesini yükler.
4. Backend bu MAC için demo kaydı oluşturur: aktivasyon_zamani,
   bitis_zamani (aktivasyon + 7 gün), durum (aktif/süresi_dolmuş).
5. TV tarafı periyodik olarak (uygulama açılışında ve arka planda
   belirli aralıklarla) backend'e "bu MAC aktif mi" diye sorar.
6. 7 gün dolduğunda backend durumu "süresi_dolmuş" yapar; TV bir
   sonraki kontrolde SADECE giriş/aktivasyon ekranını gösterir,
   önceki playlist/player state'e erişim tamamen kapanır.

## Kritik güvenlik/durabilite kuralları
- Demo durumu ASLA sadece cihaz üzerinde (localStorage vb.) tutulmaz —
  tek doğruluk kaynağı (source of truth) HER ZAMAN backend'dir. Aksi
  halde uygulama silinip yeniden yüklendiğinde demo sıfırlanır, ki bu
  istenmeyen davranıştır.
- "Uygulama kaldırılıp tekrar yüklendiğinde farklı MAC vermemeli"
  gereksinimi zaten MAC donanımsal bir kimlik olduğu için (yazılım
  yeniden yüklenince değişmez) doğal olarak sağlanır — asıl risk
  MAC'in doğru ve tutarlı şekilde her seferinde aynı native API'den
  okunmasıdır, farklı API/yöntem karışıklığı olursa tutarsız değer
  dönebilir. Tek bir okuma yöntemi standardize edilmeli.
- MAC bilgisini backend'e gönderirken düz metin yerine hashlenmiş
  şekilde saklamayı değerlendir (kullanıcı gizliliği ve olası spoofing
  girişimlerine karşı ek doğrulama parametreleri — örn. cihaz modeli,
  webOS sürümü gibi ikincil kimlik verisiyle çapraz kontrol).
- Süresi dolmuş/aktif olmayan durumda: player, liste, EPG gibi hiçbir
  ekrana route edilmemeli, tek yönlendirme hedefi aktivasyon ekranı
  olmalı.
- Ağ bağlantısı yoksa (backend'e ulaşılamıyorsa) davranışı net tanımla:
  son bilinen duruma göre kısa süreli tolerans mı, yoksa doğrudan
  bağlantı hatası ekranı mı — bu bir ürün kararı, varsayım yapmadan
  kullanıcıya sor.

## MAC adresi okuma — KESİNLEŞMİŞ (2 farklı metod, karıştırılmamalı)
- getStatus  → wired/wifi bağlantı durumunu verir, macAddress İÇERMEZ.
- getInfo    → wiredInfo.macAddress / wifiInfo.macAddress verir, MAC
  bilgisi SADECE bu metoddan gelir.
- getInfo deprecated olsa da eski cihazlarda (webOS 3.x gibi) hâlâ
  tam destekli — bizim minimum hedef cihazımız için güvenle kullanılır.
- Pratik akış: getInfo çağır, wiredInfo.macAddress doluysa onu kullan,
  boşsa wifiInfo.macAddress'e düş.