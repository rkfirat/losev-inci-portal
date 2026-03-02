# Teknik Kısıtlamalar ve Kararlar

Bu belge, LÖSEV İnci Portalı projesinde alınan teknik kararları ve uyulması gereken kısıtlamaları içerir. Tüm ajanlar bu belgeye uyum sağlar.

## Teknoloji Stack Kararları

### Frontend

| Karar          | Seçim                          | Gerekçe                                                   |
| -------------- | ------------------------------ | --------------------------------------------------------- |
| Framework      | React Native                   | Tek kod tabanıyla iOS + Android + Web, TypeScript desteği |
| Dil            | TypeScript (strict mode)       | Tip güvenliği, daha az runtime hatası                     |
| State (global) | Zustand + AsyncStorage persist | Hafif, basit API, persist desteği                         |
| State (server) | React Query / TanStack Query   | Cache, pagination, background refetch                     |
| Form           | React Hook Form                | Performanslı, uncontrolled form yönetimi                  |
| HTTP Client    | Axios                          | Interceptor desteği, hata yönetimi                        |
| Navigation     | React Navigation               | React Native için standart çözüm                          |
| Styling        | Nativewind + StyleSheet        | Utility-first + native performans                         |
| Test           | Jest + Detox                   | Unit + E2E test                                           |
| Charts         | react-native-chart-kit         | Gönüllülük saat grafikleri                                |

### Backend

| Karar      | Seçim            | Gerekçe                                   |
| ---------- | ---------------- | ----------------------------------------- |
| Runtime    | Node.js          | Frontend ile aynı ekosistem               |
| Framework  | Express.js       | Hızlı geliştirme, geniş ekosistem         |
| Veritabanı | PostgreSQL 15+   | ACID, JSONB, full-text search             |
| ORM        | Prisma           | Type-safe, otomatik migration             |
| Auth       | JWT (RS256)      | Stateless, mobile-friendly                |
| Validation | Zod              | Runtime tip doğrulaması                   |
| Cache      | Redis            | Leaderboard cache, session, rate limiting |
| Logging    | Winston          | Structured logging                        |
| Docs       | Swagger/OpenAPI  | API dokümantasyonu                        |
| Test       | Jest + Supertest | Unit + integration test                   |

## Mimari Kısıtlamalar

### API Tasarımı

- **Versiyon**: URL tabanlı (`/api/v1/...`)
- **Format**: JSON, UTF-8
- **Auth Header**: `Authorization: Bearer <token>`
- **Response yapısı**: Standart `{ success, data, meta, error }` formatı
- **Hata kodları**: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `RATE_LIMIT_EXCEEDED`

### Veritabanı

- **Primary key**: UUID (`@default(uuid())`)
- **Soft delete**: `deleted_at` kolonu ile
- **Zorunlu alanlar**: Her tabloda `created_at`, `updated_at`
- **Foreign key**: `{entity}_id` formatı
- **Boolean prefix**: `is_` veya `has_`
- **Tablo isimleri**: snake_case, çoğul (`users`, `volunteer_hours`, `volunteer_badges`)
- **Kolon isimleri**: snake_case (`first_name`, `created_at`)

### Authentication & Authorization

- **Access Token süresi**: 1 saat
- **Refresh Token süresi**: 14 gün
- **Password hashing**: bcrypt, 12 salt rounds
- **Şifre gereksinimleri**: Min 8 karakter, büyük/küçük harf, rakam
- **RBAC Rolleri**: VOLUNTEER, COORDINATOR, ADMIN
- **42 OAuth**: Opsiyonel (Post-MVP v1.1)

## Performans Kısıtlamaları

### Frontend

| Metrik              | Hedef      | Ölçüm                            |
| ------------------- | ---------- | -------------------------------- |
| Animasyon FPS       | >= 60 FPS  | React Native Performance Monitor |
| Time to Interactive | < 3 saniye | Cold start ölçümü                |
| Bundle boyutu       | < 10 MB    | Metro bundler analizi            |
| Test coverage       | > %70      | Jest coverage raporu             |

### Backend

| Metrik              | Hedef   | Ölçüm                   |
| ------------------- | ------- | ----------------------- |
| API response (p95)  | < 200ms | Winston + APM           |
| DB query (ortalama) | < 50ms  | Prisma query logging    |
| Uptime              | > %99.9 | Health check monitoring |
| Error rate          | < %0.1  | Error tracking          |
| Test coverage       | > %70   | Jest: `npm run test:coverage` |

### Erişebilirlik

| Metrik                  | Hedef           |
| ----------------------- | --------------- |
| WCAG uyumu              | AA seviyesi     |
| Touch target            | Minimum 44x44px |
| Renk kontrastı          | Minimum 4.5:1   |
| Form elemanı yüksekliği | Minimum 48px    |

## İsimlendirme Kuralları

| Öğe                  | Konvansiyon            | Örnek                                 |
| -------------------- | ---------------------- | ------------------------------------- |
| Komponentler         | PascalCase             | `VolunteerCard.tsx`                   |
| Fonksiyonlar         | camelCase              | `getVolunteerHours`                   |
| Sabitler             | UPPER_SNAKE_CASE       | `API_BASE_URL`                        |
| Dosyalar (komponent) | PascalCase             | `BadgeGrid.tsx`                       |
| Klasörler            | kebab-case             | `volunteer-hours/`                    |
| DB tablolar          | snake_case, çoğul      | `volunteer_hours`, `volunteer_badges` |
| DB kolonlar          | snake_case             | `created_at`, `is_active`             |
| API URL'leri         | kebab-case, versiyonlu | `/api/v1/volunteers/hours`            |

## Çalışma Süreci Kısıtlamaları

1. Her iterasyonda tek bir ajan, tek bir alan üzerinde çalışır
2. Her faz sonunda insan geliştirici onayı zorunludur
3. Team Lead tüm çıktıları inceler
4. Tüm kararlar dokümante edilir (`operations/tracking/decision-log.md`)
5. Kalite kapıları geçilmeden bir sonraki faza geçilemez

## Referanslar

- Frontend standartları: `templates/frontend/`
- Backend standartları: `templates/backend/`
- Tasarım standartları: `templates/design/`
- Ajan rolleri: `agents/`

---

_Bu kısıtlamalar proje boyunca tüm ajanlar tarafından uygulanır. Değişiklik için Team Lead onayı ve karar kaydı (ADR) gereklidir._
