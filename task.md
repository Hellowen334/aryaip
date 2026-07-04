# Premium Subscription — Görev Listesi

## Faz 1: Hook Genişletme
- [x] src/hooks/useActivationStatus.js — plan + graceHoursLeft + grace state ekleme
- [x] src/hooks/useNavigationStack.js — push/pop/replace, back tuşu (461) entegrasyonu

## Faz 2: Global Layout + CSS
- [x] src/styles/app.css — sidebar + content layout, banner offset

## Faz 3: Ortak Bileşenler
- [x] src/components/StatusBanner/StatusBanner.css
- [x] src/components/StatusBanner/StatusBanner.jsx
- [x] src/components/PackageCard/PackageCard.css
- [x] src/components/PackageCard/PackageCard.jsx
- [x] src/components/PackageGrid/PackageGrid.jsx
- [x] src/components/SideMenu/SideMenu.css
- [x] src/components/SideMenu/MenuItem.jsx
- [x] src/components/SideMenu/SideMenu.jsx

## Faz 4: App Kök + Ekranlar
- [x] src/App.jsx — routing logic, expired → no SideMenu
- [x] src/screens/RestrictedAccessScreen/index.jsx
- [x] src/screens/ExpiredScreen/expired.css
- [x] src/screens/ExpiredScreen/index.jsx
- [x] src/screens/MembershipScreen/membership.css
- [x] src/screens/MembershipScreen/CurrentPlanCard.jsx
- [x] src/screens/MembershipScreen/ActivationInfo.jsx
- [x] src/screens/MembershipScreen/index.jsx

## Faz 5: Güncelleme
- [x] src/screens/ActivationScreen/QrCodeBox.jsx — plan prop ekleme
