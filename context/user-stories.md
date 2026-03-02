# Kullanıcı Hikayeleri - User Stories (LÖSEV İnci Portalı)

Bu belge, LÖSEV İnci Portalı gönüllülük takip platformu için tanımlanan kullanıcı hikayelerini içerir.

## Hikaye Formatı

```
[US-XXX] Başlık
Bir {kullanıcı rolü} olarak,
{hedef/istek} istiyorum,
böylece {fayda/değer} elde edeyim.

Kabul Kriterleri:
- [ ] Kriter 1
- [ ] Kriter 2
```

## Öncelik ve Durum Tanımları

**Öncelik**: P0 (MVP zorunlu) | P1 (Önemli) | P2 (Arzu edilen) | P3 (Gelecek)
**Durum**: Backlog | Planlanmış | Geliştiriliyor | İnceleniyor | Tamamlandı

---

## Kimlik Doğrulama (Authentication)

### [US-001] Gönüllü Kaydı
Bir yeni gönüllü olarak,
email ve şifre ile hesap oluşturmak istiyorum,
böylece LÖSEV İnci Portalı'na katılabileyim.

**Öncelik**: P0 | **Durum**: Tamamlandı | **Sprint**: 1

**Kabul Kriterleri:**
- [x] Email, şifre, ad, soyad ve okul (opsiyonel) alanları mevcut
- [x] Email format doğrulaması yapılır
- [x] Şifre en az 8 karakter, büyük/küçük harf, rakam
- [x] Aynı email ile birden fazla kayıt yapılamaz
- [x] Başarılı kayıt sonrası access ve refresh token döndürülür
- [x] Hata durumlarında kullanıcıya anlaşılır mesaj gösterilir

**Teknik Notlar:**
- Endpoint: `POST /api/v1/auth/register`
- Şifre bcrypt ile hashlenir (12 salt rounds)
- Varsayılan rol: VOLUNTEER

---

### [US-002] Gönüllü Girişi
Bir kayıtlı gönüllü olarak,
email ve şifre ile giriş yapmak istiyorum,
böylece portalıma erişip gönüllülük takibimi yapabileyim.

**Öncelik**: P0 | **Durum**: Tamamlandı | **Sprint**: 1

**Kabul Kriterleri:**
- [x] Email ve şifre alanları mevcut
- [x] Başarılı giriş sonrası access ve refresh token döndürülür
- [x] Yanlış şifre girildiğinde genel hata mesajı gösterilir
- [x] 5 başarısız denemeden sonra hesap 30 dakika kilitlenir
- [x] Giriş sonrası Dashboard ekranına yönlendirilir

**Teknik Notlar:**
- Endpoint: `POST /api/v1/auth/login`
- Token süreleri: access 1 saat, refresh 14 gün

---

### [US-003] Token Yenileme
Bir giriş yapmış gönüllü olarak,
oturumum otomatik olarak yenilenmesini istiyorum,
böylece saat loglarken sürekli tekrar giriş yapmak zorunda kalmayayım.

**Öncelik**: P0 | **Durum**: Tamamlandı | **Sprint**: 1

**Kabul Kriterleri:**
- [x] Access token süresi dolmadan önce otomatik yenilenir
- [x] Refresh token geçerliyse yeni access token alınır
- [x] Refresh token geçersizse login ekranına yönlendirilir

**Teknik Notlar:**
- Endpoint: `POST /api/v1/auth/refresh`
- Axios interceptor ile otomatik yenileme

---

### [US-004] Çıkış Yapma
Bir giriş yapmış gönüllü olarak,
güvenli bir şekilde çıkış yapmak istiyorum,
böylece hesabım güvenli kalsın.

**Öncelik**: P0 | **Durum**: Tamamlandı | **Sprint**: 1

**Kabul Kriterleri:**
- [x] Çıkış butonu Settings ekranında mevcut
- [x] Çıkış yapıldığında tüm tokenlar geçersiz kılınır
- [x] Login ekranına yönlendirilir
- [x] Onay dialog gösterilir

**Teknik Notlar:**
- Endpoint: `POST /api/v1/auth/logout`

---

## Dashboard

### [US-010] Dashboard Görüntüleme
Bir gönüllü olarak,
uygulamayı açtığımda özet bilgilerimi görmek istiyorum,
böylece ilerleme durumumu hızlıca takip edebileyim.

**Öncelik**: P0 | **Durum**: Tamamlandı | **Sprint**: 2

**Kabul Kriterleri:**
- [x] Toplam gönüllülük saati gösterilir
- [x] Bu ayki saat gösterilir (grafik ile)
- [x] Son kazanılan rozetler gösterilir (max 3)
- [x] Yaklaşan etkinlikler listesi gösterilir (max 3)
- [x] Leaderboard'daki sıralama pozisyonu gösterilir
- [x] Hızlı "Saat Ekle" butonu mevcut
- [x] Pull-to-refresh ile içerik yenilenebilir
- [x] Skeleton loader ile yükleme durumu gösterilir

**Teknik Notlar:**
- Endpoint: `GET /api/v1/dashboard` (aggregated data)
- React Query ile cache (5 dk stale time)

---

## Gönüllülük Saatleri (Volunteer Hours)

### [US-020] Gönüllülük Saati Loglama
Bir gönüllü olarak,
gönüllülük saatlerimi sisteme girmek istiyorum,
böylece çalışmalarım kayıt altına alınsın.

**Öncelik**: P0 | **Durum**: Tamamlandı | **Sprint**: 2

**Kabul Kriterleri:**
- [x] Saat ekleme formu: proje adı, tarih, süre (saat), açıklama
- [x] Proje adı seçim listesinden veya serbest metin olarak girilebilir
- [x] Tarih seçici (bugün veya geçmiş tarih)
- [x] Süre minimum 0.5 saat, maksimum 12 saat
- [x] Açıklama alanı opsiyonel
- [x] Başarılı kayıt sonrası onay mesajı gösterilir
- [x] Kaydedilen saat "PENDING" durumunda başlar
- [x] Form validasyonu yapılır

**Teknik Notlar:**
- Endpoint: `POST /api/v1/volunteers/hours`
- Zustand ile optimistic update

---

### [US-021] Saat Geçmişi Görüntüleme
Bir gönüllü olarak,
geçmiş gönüllülük saatlerimi listelemek istiyorum,
böylece ne kadar çalıştığımı takip edebileyim.

**Öncelik**: P0 | **Durum**: Tamamlandı | **Sprint**: 2

**Kabul Kriterleri:**
- [x] Saat logları kronolojik sırada listelenir
- [x] Her kayıtta: proje adı, tarih, süre, durum (Beklemede/Onaylandı/Reddedildi)
- [x] Durum badge'leri renkli gösterilir (sarı/yeşil/kırmızı)
- [x] Infinite scroll ile sayfalama
- [x] Toplam onaylanan saat üstte gösterilir

**Teknik Notlar:**
- Endpoint: `GET /api/v1/volunteers/hours?page={n}&limit=20`
- React Query ile infinite query

---

## Rozet Sistemi (Badges)

### [US-030] Rozet Vitrini Görüntüleme
Bir gönüllü olarak,
tüm rozetleri ve kazanım durumlarını görmek istiyorum,
böylece bir sonraki hedefimi belirleyebileyim.

**Öncelik**: P0 | **Durum**: Tamamlandı | **Sprint**: 3

**Kabul Kriterleri:**
- [x] Rozetler grid layout'da gösterilir
- [x] Kazanılmış rozetler renkli, kilitli olanlar gri gösterilir
- [x] Her rozet kartında: ikon, isim, kazanım durumu
- [x] Rozete tıklayınca detay sayfasına gidilir
- [x] Toplam kazanılan / toplam rozet sayısı gösterilir

**Teknik Notlar:**
- Endpoint: `GET /api/v1/badges`
- Endpoint: `GET /api/v1/badges/my` (kullanıcının rozet durumu)

---

### [US-031] Rozet Detay Görüntüleme
Bir gönüllü olarak,
bir rozetin detayını görmek istiyorum,
böylece ne yaparak kazanabileceğimi anlayabileyim.

**Öncelik**: P0 | **Durum**: Tamamlandı | **Sprint**: 3

**Kabul Kriterleri:**
- [x] Rozet ikonu büyük gösterilir
- [x] Rozet adı ve açıklaması gösterilir
- [x] Kazanım kriteri açıkça yazılır (ör: "50 saat gönüllülük yap")
- [x] Kazanılmışsa tarih gösterilir
- [x] Kazanılmamışsa ilerleme gösterilir (ör: "35/50 saat")

**Teknik Notlar:**
- Endpoint: `GET /api/v1/badges/{badgeId}`

---

### [US-032] Otomatik Rozet Kazanımı
Bir gönüllü olarak,
belirli kriterleri karşıladığımda otomatik rozet kazanmak istiyorum,
böylece başarılarım anında ödüllendirilsin.

**Öncelik**: P0 | **Durum**: Tamamlandı | **Sprint**: 3

**Kabul Kriterleri:**
- [x] Saat onaylandığında rozet kriterleri otomatik kontrol edilir
- [x] Yeni rozet kazanıldığında kutlama animasyonu gösterilir
- [x] Push bildirim gönderilir (opsiyonel, v1.1)
- [x] Dashboard'da "Son Kazanılan" bölümü güncellenir

**Teknik Notlar:**
- Backend'de saat onayı sonrası otomatik rozet kontrolü
- Badge rules engine (criteria JSON)

---

## Etkinlik Yönetimi (Events)

### [US-040] Etkinlik Listesi Görüntüleme
Bir gönüllü olarak,
yaklaşan LÖSEV etkinliklerini görmek istiyorum,
böylece katılmak istediklerimi seçebileyim.

**Öncelik**: P0 | **Durum**: Tamamlandı | **Sprint**: 4

**Kabul Kriterleri:**
- [x] Etkinlikler kronolojik sırada listelenir
- [x] Her etkinlik kartında: başlık, tarih, lokasyon, kalan kontenjan
- [x] Geçmiş etkinlikler ayrı bölümde gösterilir
- [x] Katıldığım etkinlikler işaretli gösterilir

**Teknik Notlar:**
- Endpoint: `GET /api/v1/events?status=upcoming`

---

### [US-041] Etkinlik Detay ve Katılım
Bir gönüllü olarak,
bir etkinliğin detayını görüp katılmak istiyorum,
böylece LÖSEV faaliyetlerine aktif olarak katkıda bulunabileyim.

**Öncelik**: P0 | **Durum**: Tamamlandı | **Sprint**: 4

**Kabul Kriterleri:**
- [x] Etkinlik başlığı, açıklaması, tarihi, saati, lokasyonu gösterilir
- [x] Mevcut/toplam kontenjan gösterilir
- [x] "Katıl" butonu ile kayıt yapılır
- [x] Kayıtlıysa "İptal Et" butonu gösterilir
- [x] Kontenjan doluysa buton devre dışı olur
- [x] Başarılı kayıt/iptal sonrası onay mesajı

**Teknik Notlar:**
- Endpoint: `POST /api/v1/events/{eventId}/participate`
- Endpoint: `DELETE /api/v1/events/{eventId}/participate`

---

## Leaderboard (Sıralama)

### [US-050] Leaderboard Görüntüleme
Bir gönüllü olarak,
gönüllülerin sıralamasını görmek istiyorum,
böylece motivasyonumu artırabileyim.

**Öncelik**: P0 | **Durum**: Tamamlandı | **Sprint**: 5

**Kabul Kriterleri:**
- [x] Top 3 gönüllü özel görsel ile gösterilir (podium)
- [x] Sıralama listesi: sıra, avatar, ad, toplam saat, rozet sayısı
- [x] Filtre seçenekleri: haftalık, aylık, tüm zamanlar
- [x] Kullanıcının kendi pozisyonu vurgulu gösterilir
- [x] Pull-to-refresh ile güncelleme

**Teknik Notlar:**
- Endpoint: `GET /api/v1/leaderboard?period=monthly`
- Redis cache ile hızlı erişim

---

## Profil Yönetimi

### [US-060] Profil Görüntüleme
Bir gönüllü olarak,
profil bilgilerimi ve istatistiklerimi görmek istiyorum,
böylece genel durumumu kontrol edebileyim.

**Öncelik**: P0 | **Durum**: Tamamlandı | **Sprint**: 6

**Kabul Kriterleri:**
- [x] Profil kartında ad, soyad, email, avatar gösterilir
- [x] İstatistikler: toplam saat, rozet sayısı, leaderboard sırası, etkinlik katılımı
- [x] Son kazanılan rozetler gösterilir
- [x] "Profili Düzenle" butonu mevcut
- [x] "Ayarlar" linki mevcut

**Teknik Notlar:**
- Endpoint: `GET /api/v1/auth/me`

---

### [US-061] Profil Düzenleme
Bir gönüllü olarak,
profil bilgilerimi güncellemek istiyorum,
böylece bilgilerim güncel kalsın.

**Öncelik**: P0 | **Durum**: Tamamlandı | **Sprint**: 6

**Kabul Kriterleri:**
- [x] Ad, soyad, telefon, okul alanları düzenlenebilir
- [x] Avatar yükleme/değiştirme mümkün
- [x] Değişiklikler kaydedildiğinde başarı mesajı gösterilir
- [x] Form doğrulaması yapılır

---

## Ayarlar (Settings)

### [US-070] Tema Değiştirme (Dark Mode)
Bir gönüllü olarak,
uygulama temasını light/dark/system olarak değiştirmek istiyorum,
böylece tercih ettiğim görünümde kullanabileyim.

**Öncelik**: P0 | **Durum**: Tamamlandı | **Sprint**: 6

**Kabul Kriterleri:**
- [x] Settings ekranında tema seçeneği mevcut (Light / Dark / System)
- [x] Seçim anında tema değişir
- [x] Tercih AsyncStorage'da saklanır
- [x] Tüm ekranlar dark mode'da doğru görünür

---

## Post-MVP Hikayeleri

### [US-080] 42 OAuth ile Giriş
**Öncelik**: P1 | **Durum**: Tamamlandı | **Sprint**: 8
*42 intra OAuth entegrasyonu ile tek tıkla giriş.*

### [US-081] Koordinatör Saat Onaylama
**Öncelik**: P0 | **Durum**: Tamamlandı | **Sprint**: 7
*Koordinatörlerin gönüllü saatlerini onaylama/reddetme paneli.*

### [US-082] Etkinlik Takvimi
**Öncelik**: P1 | **Durum**: Tamamlandı | **Sprint**: 8
*Aylık/haftalık takvim görünümü ile etkinlik planlaması.*

### [US-083] Push Bildirimler
**Öncelik**: P1 | **Durum**: Tamamlandı | **Sprint**: 8
*Rozet kazanımı, etkinlik hatırlatması, saat onayı bildirimleri.*

### [US-084] Gönüllü Yönetimi (Admin)
**Öncelik**: P0 | **Durum**: Tamamlandı | **Sprint**: 7
*Adminlerin gönüllü listesini yönetmesi.*

### [US-085] Gönüllülük Sertifikası (PDF)
**Öncelik**: P1 | **Durum**: Tamamlandı | **Sprint**: 10
*Kullanıcının onaylanmış saatlerini içeren resmi PDF sertifika oluşturma ve indirme.*

### [US-086] Sosyal Medya Paylaşımı
**Öncelik**: P1 | **Durum**: Tamamlandı | **Sprint**: 10
*Rozet ve sertifikaların sosyal medyada paylaşılması.*

---

## Özet Tablosu

### MVP (P0)

| ID | Başlık | Grup | Durum |
|----|--------|------|-------|
| US-001 | Gönüllü Kaydı | Auth | Tamamlandı |
| US-002 | Gönüllü Girişi | Auth | Tamamlandı |
| US-003 | Token Yenileme | Auth | Tamamlandı |
| US-004 | Çıkış Yapma | Auth | Tamamlandı |
| US-010 | Dashboard Görüntüleme | Dashboard | Tamamlandı |
| US-020 | Gönüllülük Saati Loglama | Hours | Tamamlandı |
| US-021 | Saat Geçmişi Görüntüleme | Hours | Tamamlandı |
| US-030 | Rozet Vitrini | Badges | Tamamlandı |
| US-031 | Rozet Detay | Badges | Tamamlandı |
| US-032 | Otomatik Rozet Kazanımı | Badges | Tamamlandı |
| US-040 | Etkinlik Listesi | Events | Tamamlandı |
| US-041 | Etkinlik Detay ve Katılım | Events | Tamamlandı |
| US-050 | Leaderboard | Leaderboard | Tamamlandı |
| US-060 | Profil Görüntüleme | Profil | Tamamlandı |
| US-061 | Profil Düzenleme | Profil | Tamamlandı |
| US-070 | Tema Değiştirme | Ayarlar | Tamamlandı |
| US-080 | 42 OAuth ile Giriş | Auth | Tamamlandı |
| US-081 | Koordinatör Saat Onaylama | Admin | Tamamlandı |
| US-082 | Etkinlik Takvimi | Events | Tamamlandı |
| US-083 | Push Bildirimler | Auth | Tamamlandı |
| US-084 | Gönüllü Yönetimi | Admin | Tamamlandı |
| US-085 | Gönüllülük Sertifikası | Profil | Tamamlandı |
| US-086 | Sosyal Medya Paylaşımı | Profil | Tamamlandı |

---

*Yeni hikayeler eklendikçe özet tablosu güncellenir. Öncelik değişiklikleri için Team Lead ve LÖSEV ekibi onayı gereklidir.*
