---
name: webos-packaging
description: Uygulamanın appinfo.json dosyasını oluşturma/düzenleme, ares-cli ile paketleme (ipk), TV'ye yükleme ve webOS sürüm uyumluluğu ile ilgili her görevde kullanılır.
---
# webOS Packaging Skill

## appinfo.json kuralları
- Zorunlu alanlar: id (ters domain formatı, örn. com.senin.iptvplayer),
  version (major.minor.patch), vendor, type: "web", main: "index.html",
  title, icon (80x80), largeIcon (130x130).
- id değişirse TV üzerinde AYRI bir uygulama olarak kurulur, eski
  sürümle çakışmaz — güncellemelerde id'yi asla değiştirme.
- resolution alanını "1920x1080" olarak sabitle, TV otomatik ölçekler.

## Paketleme adımları (ares-cli)
1. `ares-package ./src -o ./dist` → .ipk üretir.
2. `ares-setup-device` ile geliştirici modundaki TV'yi tanımla
   (IP adresi + Developer Mode ekranındaki passphrase gerekir).
3. `ares-install -d <device-name> ./dist/xxx.ipk` ile TV'ye yükle.
4. `ares-launch -d <device-name> <app-id>` ile başlat.
5. Hata ayıklama için `ares-inspect -d <device-name> <app-id>` ile
   Chromium DevTools'a bağlan (TV'nin webOS sürümüne uygun Chromium
   sürümüyle debug et, aksi halde DevTools bozuk render edebilir).

## Çoklu webOS sürümü stratejisi
- TEK codebase, ES5-safe yaz (bkz. project-context.md).
- Simulator DRM ve bazı native API'leri desteklemez; DRM/aktivasyon
  akışlarını SADECE gerçek cihazda test edilmiş say.
- Her yeni özellik sonrası en az bir eski (webOS 3.x/4.x) ve bir yeni
  (webOS 22+) cihazda/simülatörde manuel doğrulama öner.

## Store gönderimi öncesi self-check
- Boşta bellek < 150MB
- Her ekranda fokus yönetimi çalışıyor mu
- Magic Remote pointer modu destekleniyor mu
- UX senaryosu ve self-checklist dökümanı LG Seller Lounge için hazır mı

## Servis izinleri
- connectionmanager gibi Luna servislerine erişim için appinfo.json'da
  ilgili izin/servis tanımı gerekir — kod yazılmadan önce güncel resmi
  dokümandan (webostv.developer.lge.com) tam izin adı teyit edilmeli,
  varsayılan bir izin adı uydurulmaz.

## Back tuşu davranışı
- keyCode 461, webOS.platformBack() ile kullanılırsa webOS 6.0+'da
  onay popup'ı, 5.0 ve altında Home launcher tetikler. Custom exit
  davranışı isteniyorsa platformBack() KULLANILMAZ, kendi popup +
  window.close() mantığı kurulur.

## requiredPermissions doğru değerler (ACG)
- İzin değerleri serbest metin DEĞİL, resmi ACG (Access Control Group)
  değerleridir — her Luna servis metodunun dokümantasyon sayfasında
  "ACG:" etiketiyle belirtilir.
- MAC/ağ durumu okuma (connectionmanager/getinfo, getStatus):
  networkconnection.query
- Yanlış/uydurma bir izin adı (örn. "networking") sessizce yok sayılır,
  hata fırlatmaz — çağrı sadece "permission denied" ile başarısız olur.
  Her yeni Luna servisi eklenirken ilgili resmi API sayfasındaki ACG
  değeri teyit edilmeden requiredPermissions'a rastgele bir isim
  yazılmaz.