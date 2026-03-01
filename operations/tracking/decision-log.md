# Karar Kaydı İndeksi - Decision Log (ADR Index)

Bu belge, LÖSEV İnci Portalı projesinde alınan tüm mimari ve teknik kararların indeksini tutar.

## Karar Şablon Kullanımı

Yeni karar eklemek için: `../communication/decision-log-template.md` şablonunu kullanın.

---

## Karar Listesi

| ADR # | Başlık | Tarih | Durum | Karar Veren |
|-------|--------|-------|-------|-------------|
| ADR-001 | Frontend framework seçimi: React Native | - | Kabul Edildi | Team Lead |
| ADR-002 | Auth stratejisi: JWT (RS256) | - | Kabul Edildi | Team Lead |
| ADR-003 | State yönetimi: Zustand + React Query | - | Kabul Edildi | Team Lead |
| ADR-007 | Proje dönüşümü: LÖSEV İnci Portalı | 2026-02-28 | Kabul Edildi | Team Lead + İnsan Geliştirici |
| ADR-008 | Platform konsepti: 42-intra benzeri gönüllülük portalı | 2026-02-28 | Kabul Edildi | Team Lead + İnsan Geliştirici |
| ADR-009 | RBAC: VOLUNTEER / COORDINATOR / ADMIN | 2026-02-28 | Kabul Edildi | Team Lead |

---

## ADR-001: Frontend Framework Seçimi

**Tarih**: Proje başlangıcı
**Durum**: Kabul Edildi
**Karar Veren**: Team Lead

### Karar
Frontend geliştirme için **React Native** kullanılacak.

### Gerekçe
- JavaScript/TypeScript ekosistemi ile backend uyumu
- Geniş topluluk ve kütüphane desteği
- Tek kod tabanı ile iOS ve Android desteği
- Hot reload ile hızlı geliştirme deneyimi

---

## ADR-002: Authentication Stratejisi

**Tarih**: Proje başlangıcı
**Durum**: Kabul Edildi
**Karar Veren**: Team Lead

### Karar
Kimlik doğrulama için **JWT (RS256)** tabanlı token sistemi kullanılacak. Access token 1 saat, refresh token 14 gün geçerli.

### Gerekçe
- Stateless yapısı load balancing ile uyumlu
- Mobil uygulamalar için cookie gerektirmez
- RS256 ile güvenli imzalama

---

## ADR-003: State Yönetimi Stratejisi

**Tarih**: Proje başlangıcı
**Durum**: Kabul Edildi
**Karar Veren**: Team Lead

### Karar
- **Global client state**: Zustand (AsyncStorage persist ile)
- **Server/async state**: React Query / TanStack Query
- **Form state**: React Hook Form
- **UI state**: useState

---

## ADR-007: Proje Dönüşümü

**Tarih**: 2026-02-28
**Durum**: Kabul Edildi
**Karar Veren**: Team Lead + İnsan Geliştirici
**İlgili Ajanlar**: Tüm ajanlar

### Karar
Proje **Stilora** (moda e-ticaret) konseptinden **LÖSEV İnci Portalı** (gönüllülük takip platformu) konseptine dönüştürülmüştür. 42 İstanbul Freelance Kulübü × LÖSEV iş birliği kapsamında, binlerce öğrencinin kullanacağı kurumsal bir ürün olarak geliştirilecektir.

### Gerekçe
- LÖSEV İnci Projesi koordinatör yardımcısı Nesrin Çoban ve ekibiyle yapılan toplantı sonucu
- 42 intra sisteminden ilham alan gönüllülük takip platformu ihtiyacı
- Sosyal etki + güçlü CV referansı
- Kurumsal düzeyde bir ürün geliştirme fırsatı

---

## ADR-008: Platform Konsepti

**Tarih**: 2026-02-28
**Durum**: Kabul Edildi
**Karar Veren**: Team Lead + İnsan Geliştirici

### Karar
42-intra benzeri bir **gönüllülük takip platformu** olarak tasarlanacak. Temel modüller: gönüllülük saatleri, rozet sistemi (gamification), etkinlik yönetimi ve leaderboard.

### Gerekçe
- 42 intra sistemi başarılı bir öğrenci portalı referansı
- Gamification elementleri (rozetler, leaderboard) motivasyonu artırır
- Gönüllülük saati takibi LÖSEV'in operasyonel ihtiyacını karşılar
- Etkinlik yönetimi organizasyonu kolaylaştırır

---

## ADR-009: Yetkilendirme Modeli (RBAC)

**Tarih**: 2026-02-28
**Durum**: Kabul Edildi
**Karar Veren**: Team Lead

### Karar
Üç seviyeli rol tabanlı erişim kontrolü (RBAC):
- **VOLUNTEER**: Gönüllü öğrenci — saat loglama, rozet görüntüleme, etkinlik katılımı
- **COORDINATOR**: LÖSEV koordinatörü — saat onaylama, etkinlik oluşturma, raporlama
- **ADMIN**: Sistem yöneticisi — tüm yetkiler, rozet tanımlama, kullanıcı yönetimi

### Gerekçe
- Saat onaylama workflow'u koordinatör rolünü gerektiriyor
- Admin paneli ile sistem yönetimi
- Basit ama esnek yetkilendirme yapısı

---

## Yeni Karar Ekleme

1. `../communication/decision-log-template.md` şablonunu kullanarak ADR yazın
2. ADR numarası atayın
3. Bu dosyaya indeks girişini ekleyin
4. Team Lead onayı ile durumu "Kabul Edildi" yapın

---

*Bu indeks, tüm mimari kararlar için tek referans noktasıdır.*
