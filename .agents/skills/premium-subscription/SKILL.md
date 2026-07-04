---
name: premium-subscription
description: Demo süresi bitiminde veya Üyelik sayfasından premium paket (3/6/12 ay) satın alma akışı, paket kartları tasarımı ve backend abonelik durumu yönetimi ile ilgili görevlerde kullanılır.
---
# Premium Subscription Skill

## Ödeme mimarisi (kesinleşmiş)
- LG'nin kendi uygulama-içi satın alma (IAP) servisi artık sunulmuyor.
  Ödeme TV üzerinde YAPILMAZ — TV sadece paket seçtirir, QR/URL ile
  web sitesine yönlendirir. Ödeme tamamen web sitesinde gerçekleşir.
- Bu, mevcut MAC/QR aktivasyon modeliyle birebir aynı desen: TV kimlik
  gösterir + yönlendirir, web sitesi işlemi tamamlar, backend durumu
  günceller, TV polling ile öğrenir.

## Paket veri modeli (backend)
- paket_tipi: "demo" | "3ay" | "6ay" | "12ay"
- baslangic_zamani, bitis_zamani
- durum: "aktif" | "grace" | "süresi_dolmuş"
- grace_bitis_zamani: bitis_zamani + 1 gün (sadece "grace" durumunda dolu)
- Demo'dan premium'a geçişte eski demo kaydı geçmiş olarak tutulur,
  yeni paket kaydı ayrı satır/obje olarak eklenir (denetlenebilirlik için).

## TV tarafı kurallar
- Fiyat TV'de GÖSTERİLMEZ, sadece süre (3/6/12 Ay) gösterilir.
  "Fiyat ve kampanyalar için web sitesini ziyaret edin" notu yeterli.
- Paket kartları HER ZAMAN erişilebilir olmalı: hem "süresi doldu"
  ekranında hem de Üyelik sayfasında (kullanıcı süre bitmeden de
  yenileyebilir).
- Kart seçildiğinde üretilen QR/URL, seçilen paket bilgisini query
  param olarak taşımalı (örn. ?mac=XX:XX&plan=6ay) — kullanıcı web
  sitesinde tekrar seçim yapmak zorunda kalmasın.
- Grace period (1 gün): "süresi_dolmuş" değil "grace" durumundaysa
  kullanıcı içeriğe erişmeye devam eder ama üstte kalıcı bir uyarı
  şeridi gösterilir ("Üyeliğinizin süresi doldu, X saat içinde
  yenilemezseniz erişiminiz kısıtlanacak"). Grace de bitince tam
  kilitlenmeye geçilir (activation-mac-demo skill'indeki "expired"
  davranışıyla aynı: sadece giriş/paket ekranı).
- Üç paket kartı arasında öne çıkan/önerilen paket (12 ay) görsel
  olarak vurgulanmalı (rozet: "En Avantajlı" gibi) ama diğer ikisi de
  eşit derecede kolay seçilebilir olmalı — karar kullanıcının.

## Grace period kısıtlama mantığı (kesinleşmiş)
- Grace durumunda (1 gün): SADECE Canlı TV erişilebilir kalır.
- Filmler ve Diziler menüleri KİLİTLİ: SideMenu'de görünür kalır
  (kaybolmaz, kullanıcı kafası karışmasın) ama kilit ikonuyla işaretlenir.
  Tıklandığında içeriğe girmez, doğrudan PackageGrid içeren bir
  "kısıtlı erişim" bilgi ekranına yönlendirir.
- EPG: sadece Canlı TV kanalları için EPG çalışmaya devam eder,
  Filmler/Diziler'in meta verisine (poster, açıklama vb.) erişim de
  kapalıdır.
- Üstte kalıcı, kapatılamaz bir uyarı şeridi (StatusBanner) durur:
  "Üyeliğiniz sona erdi · X saat içinde yenileyin · Filmler ve Diziler
  kısıtlandı".
- Grace de bitince (tam "süresi_dolmuş" durumu): Canlı TV dahil HİÇBİR
  içerik ekranına route edilmez, tek yönlendirme hedefi paket seçim
  ekranıdır (activation-mac-demo skill'indeki expired davranışıyla
  tutarlı).