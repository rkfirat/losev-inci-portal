# Proje Gereksinimleri - Product Requirements Document (PRD)

Bu belge, LÖSEV İnci Portalı mobil uygulamasının ürün gereksinimlerini tanımlar.

## Proje Bilgileri

| Alan | Değer |
|------|-------|
| **Proje Adı** | LÖSEV İnci Portalı |
| **Tanım** | 42-intra benzeri gönüllülük takip ve rozet yönetim platformu |
| **İş Birliği** | 42 İstanbul Freelance Kulübü × LÖSEV |
| **Kategori** | Gönüllülük / Sosyal Etki / Gamification |
| **Platform** | iOS, Android (React Native) |
| **Hedef Kitle** | 42 İstanbul öğrencileri, LÖSEV gönüllüleri |
| **Arayüz Dili** | Türkçe |
| **Proje Türü** | Kurumsal proje / Sosyal etki |
| **Başlangıç Tarihi** | 2026-02-28 |

## Vizyon ve Hedefler

### Vizyon
LÖSEV İnci Portalı, öğrencilerin LÖSEV gönüllülük faaliyetlerine katılımını teşvik eden, saatlerini takip eden, başarılarını rozetlerle ödüllendiren ve topluluk ruhunu güçlendiren bir platform olacak. 42 intra sisteminden ilham alınarak, gamification elementleriyle zenginleştirilmiş bir deneyim sunulacak.

### Temel Hedefler
1. Gönüllülük saatlerinin kolay ve güvenilir takibi
2. Rozet sistemiyle motivasyon ve bağlılık artırma
3. LÖSEV etkinliklerine katılımı organize etme
4. Leaderboard ile sağlıklı rekabet ortamı oluşturma
5. Binlerce öğrencinin kullanacağı kurumsal bir ürün geliştirme

### Başarı Metrikleri
| Metrik | Hedef | Ölçüm Yöntemi |
|--------|-------|---------------|
| Uygulama başlatma süresi | < 3 saniye | Cold start ölçümü |
| Saat loglama süresi | < 30 saniye | Kullanıcı akış analizi |
| Test coverage | > %70 | Jest coverage raporu |
| Aktif gönüllü oranı | > %50 | Aylık aktif kullanıcı |

## Kullanıcı Profilleri (Personas)

### Persona 1: Elif - Hevesli Gönüllü (42 Öğrencisi)
- **Yaş**: 20-28
- **Meslek**: 42 İstanbul öğrencisi
- **Teknoloji Becerisi**: Yüksek
- **Motivasyonu**: Sosyal etki yaratmak, CV'sine güçlü referans eklemek
- **Sıkıntı Noktaları**: Gönüllülük saatlerini takip edememe, başarılarını gösterememe

### Persona 2: Nesrin - LÖSEV Koordinatörü
- **Yaş**: 30-45
- **Meslek**: LÖSEV İnci Projesi koordinatör yardımcısı
- **Teknoloji Becerisi**: Orta
- **Motivasyonu**: Gönüllüleri organize etmek, etkinlikleri planlamak
- **Sıkıntı Noktaları**: Manuel takip zorluğu, raporlama eksikliği

## Özellik Grupları

### MVP (Minimum Viable Product)

| # | Özellik | Öncelik | Durum |
|---|---------|---------|-------|
| F-001 | Kullanıcı kayıt ve giriş (email/şifre) | P0 | Planlanmış |
| F-002 | Dashboard (saat özeti, rozetler, etkinlikler, sıralama) | P0 | Planlanmış |
| F-003 | Gönüllülük saati loglama | P0 | Planlanmış |
| F-004 | Gönüllülük saat geçmişi ve durum takibi | P0 | Planlanmış |
| F-005 | Rozet vitrini (kazanılmış & kilitli) | P0 | Planlanmış |
| F-006 | Otomatik rozet kazanım sistemi | P0 | Planlanmış |
| F-007 | Etkinlik listesi ve detay sayfası | P0 | Planlanmış |
| F-008 | Etkinliğe katılım (kayıt/iptal) | P0 | Planlanmış |
| F-009 | Leaderboard (haftalık/aylık/tüm zamanlar) | P0 | Planlanmış |
| F-010 | Profil kartı ve istatistikler | P0 | Planlanmış |
| F-011 | Dark mode desteği | P0 | Planlanmış |

### Post-MVP (v1.1)

| # | Özellik | Öncelik | Hedef Sürüm |
|---|---------|---------|-------------|
| F-020 | 42 OAuth ile giriş | P1 | v1.1 |
| F-021 | Push bildirimler (etkinlik hatırlatma, rozet kazanımı) | P1 | v1.1 |
| F-022 | Saat onaylama workflow'u (koordinatör paneli) | P1 | v1.1 |
| F-023 | Etkinlik takvimi görünümü | P1 | v1.1 |
| F-024 | Gönüllülük raporu dışa aktarma (PDF) | P1 | v1.1 |

### Post-MVP (v1.2+)

| # | Özellik | Öncelik | Hedef Sürüm |
|---|---------|---------|-------------|
| F-030 | Coalition sistemi (takım bazlı gönüllülük) | P2 | v1.2 |
| F-031 | Gönüllülük sertifikası oluşturma | P2 | v1.2 |
| F-032 | Sosyal medya paylaşımı (rozet/başarı) | P2 | v1.2 |
| F-033 | Admin paneli (web) | P2 | v2.0 |

## MVP Ekran Listesi

| # | Ekran | Açıklama |
|---|-------|----------|
| S-001 | Splash / Onboarding | Uygulama açılış ve LÖSEV tanıtım ekranı |
| S-002 | Login | Email/şifre ile giriş |
| S-003 | Register | Gönüllü kayıt formu (ad, soyad, email, okul) |
| S-004 | Dashboard | Saat özeti, son rozetler, yaklaşan etkinlikler, sıralama |
| S-005 | Volunteer Hours | Gönüllülük saat geçmişi listesi |
| S-006 | Add Hours | Saat ekleme formu (proje, tarih, süre, açıklama) |
| S-007 | Badges | Rozet vitrini (kazanılmış & kilitli) |
| S-008 | Badge Detail | Rozet detay (açıklama, kriter, kazanım tarihi) |
| S-009 | Events | Etkinlik listesi |
| S-010 | Event Detail | Etkinlik detay (açıklama, tarih, lokasyon, katılım) |
| S-011 | Leaderboard | Gönüllü sıralama tablosu |
| S-012 | Profile | Profil kartı, istatistikler, rozetler |
| S-013 | Settings | Tema (dark mode), bildirimler, çıkış |

## Tasarım Yönelimi

- **Stil**: Modern, gamification-odaklı, LÖSEV kurumsal kimliğiyle uyumlu
- **Odak**: İlerleme göstergeleri, rozet vitrini, motivasyonel UI
- **Renk**: LÖSEV kurumsal renkler + gamification aksan renkleri
- **Tipografi**: Inter (UI) - temiz ve okunaklı
- **Dark Mode**: Tam destek (light/dark/system)
- **Animasyonlar**: Rozet kazanım kutlaması, saat ekleme onayı, leaderboard güncellemesi

## Fonksiyonel Olmayan Gereksinimler

### Performans
- API response süresi (p95): < 200ms
- Uygulama başlatma süresi: < 3 saniye
- Bundle boyutu: < 10 MB
- Animasyonlar: >= 60 FPS

### Güvenlik
- JWT tabanlı kimlik doğrulama
- HTTPS zorunlu
- Hassas veri şifreleme
- RBAC (VOLUNTEER / COORDINATOR / ADMIN)

### Erişebilirlik
- WCAG AA uyumu
- Touch target: min 44x44px
- Renk kontrastı: min 4.5:1
- Screen reader desteği

## İlgili Belgeler

- Kullanıcı hikayeleri: `user-stories.md`
- Özellik detayları: `feature-specs/`
- Teknik kısıtlamalar: `technical-constraints.md`
- Terimler sözlüğü: `glossary.md`

---

*Bu belge, proje boyunca güncellenir. Değişiklikler için insan geliştirici ve LÖSEV ekibi onayı gereklidir.*
