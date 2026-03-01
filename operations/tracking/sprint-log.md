# Sprint Kaydı — LÖSEV İnci Portalı

## Sprint 1 — Auth Domain Transformation (2026-02-28)

**Hedef**: E-ticaret kodunu kaldırma, gönüllü portal domain dönüşümü, auth sistemi güncelleme

**Tamamlanan Görevler**: T-042, T-043, T-044, T-045

**Özet**:
- Prisma schema: 9 e-ticaret modeli kaldırıldı, 5 gönüllü modeli eklendi
- RBAC: VOLUNTEER/COORDINATOR/ADMIN
- Auth'ta okul alanı eklendi, şifre kuralları güncellendi
- Login/Register/ForgotPassword ekranları Türkçeye çevrildi
- ~28 e-ticaret dosyası silindi (backend + mobile)

---

## Sprint 2 — Backend API'ler (2026-02-28)

**Hedef**: Tüm backend API endpoint'lerinin implementasyonu

**Tamamlanan Görevler**: T-050 ~ T-057

**Özet**:
- 5 servis, 5 controller, 5 route dosyası, 2 validator oluşturuldu
- Volunteer Hours: CRUD + coordinator review
- Badges: Liste + detay + ilerleme hesaplama
- Badge Engine: hours_logged, hours_approved, events_participated kriterleri
- Events: CRUD + katılım/iptal + kapasite kontrolü
- Leaderboard: Haftalık/aylık/tüm zamanlar
- Dashboard: İstatistik, son rozetler, yaklaşan etkinlikler

---

## Sprint 3 — Mobil Ekranlar (2026-02-28)

**Hedef**: Tüm mobil ekranların implementasyonu

**Tamamlanan Görevler**: T-058 ~ T-064

**Özet**:
- 5 yeni ekran: Dashboard, Saatler, Rozetler, Etkinlikler, Leaderboard
- Portal types ve service layer oluşturuldu
- TabNavigator gerçek ekranlarla güncellendi
- ProfileEditScreen'e okul alanı eklendi
- app.json LÖSEV İnci Portalı olarak güncellendi
- format.ts e-ticaret yardımcıları kaldırıldı, portal yardımcıları eklendi

---

*Son güncelleme: 2026-02-28*
