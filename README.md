# LÖSEV İnci Portalı — AI Agent Team Mobile App

## Proje Vizyonu

**LÖSEV İnci Portalı**, 42 İstanbul Freelance Kulübü ve LÖSEV iş birliği kapsamında geliştirilen, 42-intra benzeri bir gönüllülük takip platformudur. Öğrencilerin gönüllülük saatlerini, rozetlerini ve etkinlik katılımlarını takip eder. Yapay zeka destekli bir yazılım geliştirme takımı tarafından yönetilen profesyonel bir mobil uygulama geliştirme sürecidir.

## Takım Yapısı

| Ajan | Rol | Durum |
|------|-----|-------|
| Team Lead | Proje yönetimi, koordinasyon, kalite kontrol | Aktif |
| Designer | UI/UX tasarım, wireframe, mockup | Aktif |
| Frontend | Mobil arayüz geliştirme (React Native) | Aktif |
| Backend | API ve veritabanı geliştirme (Node.js + PostgreSQL) | Aktif |

## Temel Özellikler

| Modül | Açıklama |
|-------|----------|
| 🕐 Gönüllülük Saatleri | Saat loglama, onay workflow'u, geçmiş takibi |
| 🏅 Rozet Sistemi | Gamification, otomatik rozet kazanımı, vitrin |
| 📅 Etkinlik Yönetimi | LÖSEV etkinlikleri, katılım takibi, takvim |
| 🏆 Leaderboard | Gönüllü sıralama tablosu (haftalık/aylık/tüm zamanlar) |
| 👤 Profil & Dashboard | Kişisel istatistikler, ilerleme göstergesi |

## Klasör Yapısı

```
ai-agent-team-mobile-app/
├── agents/              # AI ajan rol tanımları ve talimatları
│   ├── team_lead/       # Takım lideri ajanı
│   ├── designer/        # Tasarımcı ajanı
│   ├── frontend/        # Frontend ajanı
│   └── backend/         # Backend ajanı
├── backend/             # Node.js + Express backend kaynak kodu
│   ├── prisma/          # Veritabanı şeması ve migration'lar
│   └── src/             # Backend kaynak dosyaları
├── mobile/              # React Native mobil uygulama kaynak kodu
│   └── src/             # Frontend kaynak dosyaları
├── context/             # Proje bağlamı ve gereksinimler
│   ├── project-requirements.md   # Ürün gereksinimleri (LÖSEV İnci Portalı)
│   ├── user-stories.md           # Kullanıcı hikayesi backlog
│   ├── feature-specs/            # Özellik bazlı spesifikasyonlar
│   ├── technical-constraints.md  # Teknik kısıtlamalar ve kararlar
│   └── glossary.md               # Türkçe↔İngilizce terimler sözlüğü
├── operations/          # Operasyon merkezi - koordinasyon altyapısı
│   ├── hub/             # Günlük koordinasyon
│   ├── workflows/       # Süreç tanımları
│   ├── communication/   # Ajan iletişim protokolleri
│   ├── quality/         # Kalite kapıları
│   └── tracking/        # İlerleme takibi
├── templates/           # Kod ve döküman şablonları
│   ├── design/          # Tasarım şablonları ve standartları
│   ├── frontend/        # Frontend şablonları ve standartları
│   └── backend/         # Backend şablonları ve standartları
├── data/                # Veri dosyaları ve seed data
├── deliverables/        # Tamamlanan çıktılar
├── tests/               # Test dosyaları
├── docker-compose.yml   # PostgreSQL + Redis
└── README.md            # Bu dosya
```

## Kullanıcı Rolleri

| Rol | Yetkiler |
|-----|----------|
| **Gönüllü (VOLUNTEER)** | Saat loglama, rozet görüntüleme, etkinlik katılımı |
| **Koordinatör (COORDINATOR)** | Saat onaylama, etkinlik oluşturma, raporları görme |
| **Admin (ADMIN)** | Tüm yetkiler, rozet tanımlama, kullanıcı yönetimi |

## Çalışma Prensibi

1. **İteratif Geliştirme**: Her gün tek bir ajan ve tek bir bölüm üzerinde çalışılır
2. **Onay Mekanizması**: Her aşamanın sonunda insan geliştiriciden onay alınır
3. **Dokümantasyon**: Tüm kararlar ve ilerlemeler dokümante edilir
4. **Kalite Kontrol**: Team Lead tüm çıktıları denetler

## İş Birliği

- **42 İstanbul Freelance Kulübü**: Geliştirme ekibi
- **LÖSEV**: İnci Projesi koordinatör yardımcısı Nesrin Çoban ve ekibi
- **Hedef**: Binlerce öğrencinin kullanacağı kurumsal bir gönüllülük takip platformu

## Canlıya Alma (Expo + localtunnel)

Uygulamayı internette erişilebilir hale getirmek için Expo tunnel ve backend için **localtunnel** kullanılır. Token veya hesap gerekmez; fiziksel cihazdan veya paylaşılan link ile erişim mümkün olur.

### Gereksinimler

- **Node.js 20+** (Expo ve backend için; `nvm use 20` veya `.nvmrc` ile)
- Docker ve Docker Compose (PostgreSQL + Redis için)
- [Expo Go](https://expo.dev/go) uygulaması (telefonda)

### Adımlar

**1. Altyapıyı ve Backend'i başlat**

```bash
docker-compose up -d --build
```
*(Bu komut PostgreSQL, Redis ve Node.js Backend API sunucusunu aynı anda çalıştırır)*

**2. Backend’i çalıştır**

```bash
cd backend
cp .env.example .env   # İlk seferde
npm install
npx prisma migrate dev  # İlk seferde
npm run dev
```

Backend `http://localhost:3000` üzerinde çalışacak.

**3. Backend’i localtunnel ile dışarı aç**

Yeni bir terminalde **önce backend’in çalıştığından emin olun** (`npm run dev`), sonra:

```bash
cd backend
npm run tunnel
```

**Bu adım zorunludur.** Mobil uygulama API’ye `losev-backend-2026.loca.lt` üzerinden erişir; tünel kapalıysa **503 Tunnel Unavailable** hatası alırsınız. Backend ve tüneli aynı anda açık tutun.

Çıktıdaki URL (örn. `https://losev-backend-2026.loca.lt`) backend’in dışarı açılmış adresidir. Mobil uygulama varsayılan olarak `https://losev-backend-2026.loca.lt/api/v1` kullandığı için **EXPO_PUBLIC_API_BASE_URL vermeniz gerekmez**; subdomain aynı kaldığı sürece çalışır. Farklı subdomain kullanırsanız: `LT_SUBDOMAIN=xxx npm run tunnel` ve mobilde `EXPO_PUBLIC_API_BASE_URL=https://xxx.loca.lt/api/v1` verin.

**4. Mobil uygulamayı başlat (Tunnel / Local)**

```bash
cd mobile
nvm use 20      # Node 20 kullanmak zorunludur!
npm install
npm run start:tunnel
```

(Varsayılan API adresi zaten localtunnel; ekstra ortam değişkeni gerekmez.)

**5. Cihazda aç**

- Terminalde çıkan **QR kodu** Expo Go ile tarayın veya
- Çıkan **tunnel URL**’sini paylaşarak başka cihazlarda da açın.

**Expo Go — QR kod termalde görünmüyorsa / Aynı ağda değilseniz (tünel)**

- **Tünel (farklı ağ):** `npm run start:tunnel` kullanın. Birkaç saniye içinde ekranda **tünel bağlantı kutusu** çıkacak; içindeki `exp://....exp.direct` adresini kopyalayıp Expo Go’da **“URL ile bağlan”**a yapıştırın. Aynı Wi‑Fi’de olmanız gerekmez.
- **Aynı ağ (LAN):** `npm run start` kullanın. Komut başında çıkan kutudaki `exp://192.168.x.x:8081` adresini Expo Go’da “URL ile bağlan”a yazın.
- Komutu **kendi terminalinizde** (IDE’nin arka planında değil) çalıştırın; QR’ın görünme ihtimali artar.
- Gerekirse: `CI=false npm run start` (Linux/macOS) veya `set CI= && npm run start` (Windows).

### Notlar

- **localtunnel** token veya hesap gerektirmez; `npm run tunnel` yeterlidir.
- Subdomain dolu/meşgulse farklı bir subdomain deneyin: `LT_SUBDOMAIN=baska-ad npm run tunnel`; mobilde bu adresi `EXPO_PUBLIC_API_BASE_URL` ile verin.
- `EXPO_PUBLIC_API_BASE_URL` verilmezse mobil uygulama `mobile/src/config/api.ts` içindeki varsayılan adresi kullanır (`losev-backend-2026.loca.lt`).
- Backend’de CORS ayarlarının kullandığınız origin’e uygun olduğundan emin olun.

**"Unexpected token '?'" hatası:** Node sürümü eski. Şunları deneyin:

1. **NVM ile:** Terminalde `unset npm_config_prefix` sonra `nvm use 20` çalıştırıp `npm run start:tunnel` tekrar deneyin.
2. **Kabuk script ile:** `cd mobile` → `bash scripts/run-tunnel.sh` (bu script NVM’i yükleyip Node 20 kullanır).
3. Proje kökü ve `mobile/` içinde `.nvmrc` var; NVM kuruluysa dizine girince `nvm use` ile Node 20 seçilir.

**"503 - Tunnel Unavailable" hatası:** Backend API tüneli kapalı veya localtunnel yanıt vermiyor.

1. **Backend çalışıyor mu?** Bir terminalde `cd backend` → `npm run dev` (port 3000).
2. **Backend tüneli açık mı?** Başka bir terminalde `cd backend` → `npm run tunnel`; çıktıda `https://losev-backend-2026.loca.lt` görünmeli.
3. İkisini de açık tuttuktan sonra uygulamayı yeniden açın. Localtunnel bazen düşebilir; tüneli yeniden başlatıp (Ctrl+C sonra `npm run tunnel`) tekrar deneyin.
4. Sorun sürerse farklı subdomain deneyin: `LT_SUBDOMAIN=test123 npm run tunnel` ve mobilde `EXPO_PUBLIC_API_BASE_URL=https://test123.loca.lt/api/v1` ile başlatın.

## Operasyon Merkezi

Proje koordinasyonu, iş akışları ve kalite kontrol süreçleri `operations/` dizininde tanımlanmıştır. Detaylı navigasyon için: `operations/README.md`

---

*Bu proje, 42 İstanbul Freelance Kulübü × LÖSEV iş birliği kapsamında, AI-insan iş birliği ile geliştirilmektedir.*
