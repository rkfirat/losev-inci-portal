# Kilometre Taşı Takibi - Milestone Tracker (LÖSEV İnci Portalı)

Bu belge, LÖSEV İnci Portalı projesinin üst düzey kilometre taşlarını ve ilerleme durumunu gösterir.

---

## Kilometre Taşları

### M0: Proje Altyapı Kurulumu & Dönüşüm
**Durum**: ✅ Tamamlandı
**Tamamlanma Tarihi**: 2026-02-28

**Kapsam:**
- [x] Proje iskeleti oluşturma (backend + mobile scaffolding)
- [x] Team Lead ajan kurulumu
- [x] Designer ajan kurulumu
- [x] Frontend ajan kurulumu ve standartları
- [x] Backend ajan kurulumu ve standartları
- [x] Tasarım tokenleri ve standartları
- [x] API ve veritabanı standartları
- [x] Auth stratejisi
- [x] Operasyon merkezi kurulumu
- [x] Proje dönüşümü: Stilora → LÖSEV İnci Portalı
- [x] PRD ve kullanıcı hikayeleri (gönüllülük domain)
- [x] Tüm ajan rolleri LÖSEV İnci Portalı'na uyumlandı

---

### M1: Authentication Sistemi
**Durum**: ⏳ Planlanmış
**Hedef Tarih**: -

**Kapsam:**
- [ ] Auth ekranları tasarımı (Login, Register)
- [ ] Auth API endpoint'leri (register, login, logout, refresh)
- [ ] User veritabanı modeli (VOLUNTEER, COORDINATOR, ADMIN rolleri)
- [ ] JWT middleware ve token yönetimi
- [ ] Auth ekranları frontend implementasyonu
- [ ] Auth state yönetimi (Zustand + AsyncStorage persist)

**Bağımlılıklar**: M0 (Tamamlandı)
**İlgili Hikayeler**: US-001, US-002, US-003, US-004

---

### M2: Dashboard & Gönüllülük Saatleri
**Durum**: ⏳ Planlanmış
**Hedef Tarih**: -

**Kapsam:**
- [ ] Dashboard ekranı tasarımı
- [ ] VolunteerHour veritabanı modeli
- [ ] Gönüllülük saat API'leri (log, list, update)
- [ ] Dashboard API (aggregated data)
- [ ] Dashboard frontend implementasyonu
- [ ] Saat loglama formu
- [ ] Saat geçmişi listesi

**Bağımlılıklar**: M1
**İlgili Hikayeler**: US-010, US-020, US-021

---

### M3: Rozet Sistemi
**Durum**: ⏳ Planlanmış
**Hedef Tarih**: -

**Kapsam:**
- [ ] Rozet vitrini tasarımı
- [ ] Badge ve VolunteerBadge veritabanı modelleri
- [ ] Rozet API'leri (list, my badges, detail)
- [ ] Otomatik rozet kazanım engine'i
- [ ] Rozet vitrini frontend implementasyonu
- [ ] Rozet detay ekranı
- [ ] Kazanım kutlama animasyonu

**Bağımlılıklar**: M2
**İlgili Hikayeler**: US-030, US-031, US-032

---

### M4: Etkinlik Yönetimi
**Durum**: ⏳ Planlanmış
**Hedef Tarih**: -

**Kapsam:**
- [ ] Etkinlik kartı ve liste tasarımı
- [ ] Event ve EventParticipant veritabanı modelleri
- [ ] Etkinlik API'leri (list, detail, participate, cancel)
- [ ] Etkinlik listesi frontend implementasyonu
- [ ] Etkinlik detay ve katılım ekranı

**Bağımlılıklar**: M2
**İlgili Hikayeler**: US-040, US-041

---

### M5: Leaderboard & Profil
**Durum**: ⏳ Planlanmış
**Hedef Tarih**: -

**Kapsam:**
- [ ] Leaderboard tasarımı (podium + liste)
- [ ] Leaderboard API (sıralama algoritması, period filtre)
- [ ] Leaderboard frontend implementasyonu
- [ ] Profil ekranı (istatistikler, rozetler)
- [ ] Profil düzenleme ekranı
- [ ] Settings ekranı (dark mode, çıkış)

**Bağımlılıklar**: M3, M4
**İlgili Hikayeler**: US-050, US-060, US-061, US-070

---

### M-Release: LÖSEV İnci Portalı MVP Release (v1.0.0)
**Durum**: ⏳ Planlanmış
**Hedef Tarih**: -

**Ön Koşullar:**
- [ ] M1 tamamlandı (Auth)
- [ ] M2 tamamlandı (Dashboard & Hours)
- [ ] M3 tamamlandı (Badges)
- [ ] M4 tamamlandı (Events)
- [ ] M5 tamamlandı (Leaderboard & Profile)
- [ ] Tüm kalite kapıları geçildi
- [ ] Full regression test
- [ ] LÖSEV ekibi onayı

---

## Durum İkonları

| İkon | Anlamı |
|------|--------|
| ✅ | Tamamlandı |
| 🔄 | Devam Ediyor |
| ⏳ | Planlanmış |
| ⚠️ | Risk Altında |
| ❌ | İptal Edildi |

## İlerleme Özeti

| Kilometre Taşı | Durum | İlerleme |
|----------------|-------|----------|
| M0: Altyapı + Dönüşüm | ✅ Tamamlandı | %100 |
| M1: Auth | ⏳ Planlanmış | %0 |
| M2: Dashboard & Hours | ⏳ Planlanmış | %0 |
| M3: Badges | ⏳ Planlanmış | %0 |
| M4: Events | ⏳ Planlanmış | %0 |
| M5: Leaderboard & Profile | ⏳ Planlanmış | %0 |
| MVP Release (v1.0.0) | ⏳ Planlanmış | %0 |

---

*Bu belge, her kilometre taşı tamamlandığında veya durumu değiştiğinde güncellenir.*
