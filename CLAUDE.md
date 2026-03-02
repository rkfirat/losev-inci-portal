# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ Agent Kullanımı (Zorunlu — Proje Yöneticisi Kuralı)

**Tüm işlemlerde (kod yazımı, düzeltme, genişletme, dokümantasyon) `agents/` rol dosyaları kullanılmalıdır.** Proje yöneticisi (Team Lead) perspektifiyle çalışırken sadece "işi bitirmek" yetmez; ajan protokollerine uyum ve kalite kontrolü zorunludur.

### Cursor kullanıyorsanız

Proje kuralları **Cursor'a özel** olarak `.cursor/rules/` içinde tanımlıdır. Cursor bu kuralları bağlamda kullanır; böylece her oturumda ajan zorunluluğu uygulanır.

- **Her zaman yüklü**: `agent-usage-mandate.mdc` (ajan kullanımı zorunlu), `project-overview.mdc` (proje özeti)
- **Backend dosyalarında**: `backend.mdc` — `agents/backend/role.md` kurallarına uy
- **Mobile dosyalarında**: `frontend.mdc` — `agents/frontend/role.md` ve `agents/designer/role.md` kurallarına uy

Cursor'da yeni bir sohbet veya komut açtığınızda bu kurallar otomatik devreye girer. Detaylı süreç için `operations/hub/agent-usage-mandate.md` ve ilgili `agents/*/role.md` dosyalarını kullanın.

### Genel adımlar (tüm editörler / referans)

1. **Başlamadan önce**
   - `agents/team_lead/role.md` — Handoff kriterleri, Definition of Done, Kalite Kontrol Checklist
   - İşin türüne göre ilgili ajanı oku:
     - **API, veritabanı, endpoint**: `agents/backend/role.md`
     - **UI/UX, ekran, komponent, stil**: `agents/frontend/role.md` ve `agents/designer/role.md`
     - **Yeni özellik / büyük değişiklik**: Tüm ilgili ajanlar + `operations/workflows/feature-development.md`

2. **İş yaparken**
   - Backend değişikliği → Backend role.md'deki API tasarımı, hata kodları, RBAC, validation kurallarına uy
   - Frontend değişikliği → Frontend role.md'deki komponent yapısı, platform/responsive, API katmanı, rol bazlı UI kurallarına uy
   - Tasarım kararı → Designer role.md'deki breakpoint, erişilebilirlik, token, animasyon standartlarına uy

3. **Bitirdikten sonra (Team Lead kalite kontrolü)**
   - `agents/team_lead/role.md` içindeki **Kalite Kontrol Checklist** ile kontrol et (Genel, Frontend Özel, Backend Özel)
   - El değişimi yapıldıysa **Ajan El Değişimi (Handoff) Kriterleri** ve **Definition of Done** ile doğrula
   - Gerekirse `operations/hub/task-board.md`, `operations/hub/agent-status.md`, `operations/tracking/sprint-log.md` güncelle

### Kısa referans

| Yapılan iş                               | Okunacak agent                                       | Sonrasında Team Lead checklist |
| ---------------------------------------- | ---------------------------------------------------- | ------------------------------ |
| Yeni/mevcut API, migration, RBAC         | `agents/backend/role.md`                             | Backend Özel + Genel           |
| Yeni/mevcut ekran, komponent, navigasyon | `agents/frontend/role.md`, `agents/designer/role.md` | Frontend Özel + Genel          |
| Tasarım token, wireframe, a11y           | `agents/designer/role.md`                            | Designer → Frontend handoff    |
| Koordinasyon, öncelik, risk              | `agents/team_lead/role.md`                           | Tüm checklist + günlük özet    |

Bu kural atlanmamalı; "işlemler bitti" dense bile kalite ve handoff kontrolü için agents kullanılır.

**Cursor kullanıcıları**: Yukarıdaki adımlar `.cursor/rules/` içindeki `.mdc` dosyaları ile Cursor tarafından otomatik uygulanır; ek olarak `agents/*/role.md` dosyalarını açarak detaylı kurallara bakabilirsiniz.

---

## Project Overview

**LÖSEV İnci Portalı** — 42 İstanbul Freelance Kulübü × LÖSEV iş birliği kapsamında geliştirilen, öğrencilerin gönüllülük saatlerini, rozetlerini ve etkinlik katılımlarını takip eden 42-intra benzeri bir platform. **Platformlar:** mobil (iOS, Android) ve web — tek kod tabanı (React Native + React Native Web). AI-driven development with 4 specialized agents (Team Lead, Designer, Frontend, Backend). Documentation is primarily in Turkish.

**Current state:** Agent roles are defined and adapted for LÖSEV İnci Portalı. Backend scaffolding (Express + Prisma) and mobile/web scaffolding (React Native Web) exist from initial development.

## Repository Structure

- `agents/` - AI agent role definitions (team_lead, designer, frontend, backend). Each has a `role.md` describing responsibilities and protocols for LÖSEV İnci Portalı.
- **`.cursor/rules/`** - **Cursor IDE** proje kuralları (`.mdc`). Ajan kullanım zorunluluğu ve proje özeti burada; Cursor bu dosyaları otomatik bağlama ekler.
- `templates/` - Development standards and architectural guidelines:
  - `design/` - Design tokens, wireframe standards, component design templates
  - `frontend/` - React Native component standards, state management patterns
  - `backend/` - API standards, database schema conventions, auth strategy
- `operations/` - Operations center for team coordination:
  - `hub/` - Daily coordination (task board, sprint planning, agent status, daily workflow)
  - `workflows/` - Process definitions (feature development, bug fix, code review, deployment, release)
  - `communication/` - Agent interaction protocols (handoff specs, escalation paths, ADR template)
  - `quality/` - Phase gate checklists (design, frontend, backend, integration, release readiness)
  - `tracking/` - Progress tracking (sprint log, milestone tracker, decision log)
- `context/` - Project requirements and specifications:
  - `project-requirements.md` - Product requirements for LÖSEV İnci Portalı
  - `user-stories.md` - User story backlog (volunteer hours, badges, events, leaderboard)
  - `feature-specs/` - Per-feature specification templates
  - `technical-constraints.md` - Tech decisions and constraints
  - `glossary.md` - Turkish↔English term glossary
- `backend/` - Node.js + Express backend source code
- `mobile/` - React Native (iOS, Android + Web) uygulaması kaynak kodu — tek kod tabanı
- `deliverables/` - Completed outputs
- `tests/` - Test files
- `data/` - Data files and seed data

## Target Technology Stack

### Frontend (Mobile & Web)

- **React Native (Web destekli)** with TypeScript strict mode — tek kod tabanı: iOS, Android, Web
- **Zustand** for global state (auth, volunteer, badges, settings) with AsyncStorage persistence
- **React Query/TanStack Query** for server state (API data, pagination)
- **React Hook Form** for forms (hour logging, profile edit)
- **Axios** for HTTP
- **React Navigation** for routing
- **Nativewind** + StyleSheet for styling
- **Jest** + **Detox** (mobil E2E); web için gerekirse ek E2E (örn. Playwright)

### Backend

- **Node.js + Express.js**
- **PostgreSQL 15+** with **Prisma** ORM
- **JWT** auth (RS256) - access token 1hr, refresh token 14 days
- **Zod** for validation
- **Redis** for caching (leaderboard, session)
- **Winston** for logging
- **Swagger/OpenAPI** for docs

## Key Domain Concepts

| Concept         | Description                                        |
| --------------- | -------------------------------------------------- |
| Volunteer Hours | Gönüllülük saati loglama ve onay sistemi           |
| Badges          | Rozet kazanım sistemi (gamification)               |
| Events          | LÖSEV etkinlik yönetimi ve katılım takibi          |
| Leaderboard     | Gönüllü sıralama tablosu                           |
| Dashboard       | Ana portal ekranı (istatistikler, son aktiviteler) |

## Key Conventions

### Naming

| Element    | Convention            | Example                               |
| ---------- | --------------------- | ------------------------------------- |
| Components | PascalCase            | `VolunteerCard.tsx`                   |
| Functions  | camelCase             | `getVolunteerHours`                   |
| Constants  | UPPER_SNAKE_CASE      | `API_BASE_URL`                        |
| Files      | PascalCase            | `BadgeGrid.tsx`                       |
| Folders    | kebab-case            | `volunteer-hours/`                    |
| DB tables  | snake_case, plural    | `volunteer_hours`, `volunteer_badges` |
| DB columns | snake_case            | `created_at`, `is_active`             |
| API URLs   | kebab-case, versioned | `/api/v1/volunteers/hours`            |

### API Response Format

All endpoints follow this structure:

```json
{
  "success": true,
  "data": {},
  "meta": { "pagination": { "page": 1, "limit": 10, "total": 100 } }
}
```

Errors use standard codes: `VALIDATION_ERROR` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `RATE_LIMIT_EXCEEDED` (429), `INTERNAL_ERROR` (500). See `agents/backend/role.md` for full list.

### Database

- Primary keys: UUID (`@default(uuid())`)
- Soft deletes via `deleted_at` column
- All models include `created_at`, `updated_at`
- Foreign keys named `{entity}_id`
- Booleans prefixed with `is_` or `has_`

## User Roles (RBAC)

| Role        | Permissions                                               |
| ----------- | --------------------------------------------------------- |
| VOLUNTEER   | Log own hours, view badges, join events, view leaderboard |
| COORDINATOR | Approve/reject hours, create events, view reports         |
| ADMIN       | All permissions, manage badges, manage users              |

## Key Screens

| Screen          | Description                                                        |
| --------------- | ------------------------------------------------------------------ |
| Dashboard       | Saat özeti, son rozetler, yaklaşan etkinlikler, sıralama           |
| Volunteer Hours | Saat loglama formu ve geçmiş listesi                               |
| Badges          | Rozet vitrini (kazanılmış & kilitli)                               |
| Events          | Etkinlik listesi/takvimi ve katılım                                |
| Leaderboard     | Gönüllü sıralama tablosu                                           |
| Profile         | Profil kartı, istatistikler                                        |
| Coordinator     | Koordinatör/Admin: onay bekleyen gönüllülük saatleri (mobil + web) |

## Performance Targets

- **Frontend (mobil):** 60 FPS animations, <3s TTI, <10MB bundle, >70% test coverage
- **Frontend (web):** Aynı TTI hedefi; Core Web Vitals (LCP, FID, CLS) uyumu
- **Backend:** <200ms API response (p95), <50ms DB queries (avg), >99.9% uptime
- **Accessibility:** WCAG compliant, 44x44px minimum touch/click targets, 4.5:1 color contrast

## Development Workflow

1. One agent focuses on one area per iteration
2. Human developer approves each phase before proceeding
3. Team Lead agent reviews all outputs from other agents
4. All decisions must be documented
5. Quality gates must pass before phase transitions (see `operations/quality/`)
6. Feature development follows: Design → Backend → Frontend → Integration
7. Agent handoffs follow standardized protocols (see `operations/communication/`)
8. Task progress tracked on Kanban board (see `operations/hub/task-board.md`)

### Phase order (detay)

- **Design**: Wireframes/mockups (mobil + web breakpoints), design tokens, asset list → Team Lead onayı
- **Backend**: Endpoints, schema/migrations, Swagger, RBAC → Team Lead onayı
- **Frontend**: Ekranlar, komponentler, API entegrasyonu, rol bazlı UI → Team Lead kalite checklist
- **Integration**: E2E/smoke test, mobil + web manuel test, dokümantasyon güncellemesi

### Ortam ve Konfigürasyon

- **Backend**: `backend/.env` — `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGINS`
- **Mobile/Web**: `mobile/src/config/api.ts` — `BASE_URL` (dev/prod), timeout; web build için `BASE_URL` production API'yi işaret etmeli
- Terimler ve kısaltmalar: `context/glossary.md`

### Hangi işte nereye bakılır

- **Yeni ekran/akış**: `agents/designer/role.md` (breakpoint, erişilebilirlik), `agents/frontend/role.md` (komponent, API katmanı, rol bazlı UI)
- **Yeni API / endpoint**: `agents/backend/role.md` (URL yapısı, hata kodları, pagination, RBAC), `CLAUDE.md` (API response format)
- **Rol/izin**: Backend'de `requireRole`, Frontend'de TabNavigator ve koşullu sekme; `CLAUDE.md` User Roles tablosu
- **Tasarım tutarlılığı**: `agents/designer/role.md` (tasarım prensipleri, token'lar, animasyon), `templates/design/`

### Dosya Konumları (Hızlı Referans)

- **Auth (backend)**: `backend/src/middlewares/auth.ts`, `backend/src/controllers/auth.controller.ts`, `backend/src/routes/auth*.ts`
- **Auth (frontend)**: `mobile/src/store/authStore.ts`, `mobile/src/services/auth.ts`
- **API route kayıt**: `backend/src/routes/index.ts` (tüm router'lar burada mount edilir)
- **Coordinator**: `backend/src/routes/coordinator.routes.ts`, `backend/src/services/coordinator.service.ts`; `mobile/src/screens/Coordinator/`, `mobile/src/components/coordinator/`
- **Tab / rol bazlı menü**: `mobile/src/navigation/TabNavigator.tsx` (role göre Coordinator, AdminUsers sekmesi)
- **API base URL**: `mobile/src/config/api.ts`

### Sık Karşılaşılan Tuzaklar

- **CORS**: Web'den API çağrısı 403 ise backend `CORS_ORIGINS` ve preflight; mobil uygulama için origin farklı olabilir
- **401 sonrası**: Frontend'de refresh token akışı ve başarısızsa logout + login ekranına yönlendirme
- **Rol değişince UI**: TabNavigator `useAuthStore` ile role göre sekme render ediyor; token'daki role güncel mi kontrol et
- **VolunteerHour alanları**: Backend'de `activityType` kullanılıyorsa Prisma şeması ve Frontend PendingHourCard prop'u ile uyumlu olmalı

### Kalite Kapıları (Dosya Referansları)

- `operations/quality/` — Phase gate checklists (design, frontend, backend, integration, release readiness)
- `operations/communication/` — Handoff specs, escalation paths
- `operations/hub/task-board.md` — Görev takibi
