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

**Öncelik**: P0 | **Durum**: Backlog | **Sprint**: -

**Kabul Kriterleri:**
- [ ] Email, şifre, ad, soyad ve okul (opsiyonel) alanları mevcut
- [ ] Email format doğrulaması yapılır
- [ ] Şifre en az 8 karakter, büyük/küçük harf, rakam
- [ ] Aynı email ile birden fazla kayıt yapılamaz
- [ ] Başarılı kayıt sonrası access ve refresh token döndürülür
- [ ] Hata durumlarında kullanıcıya anlaşılır mesaj gösterilir

**Teknik Notlar:**
- Endpoint: `POST /api/v1/auth/register`
- Şifre bcrypt ile hashlenir (12 salt rounds)
- Varsayılan rol: VOLUNTEER

---

### [US-002] Gönüllü Girişi
Bir kayıtlı gönüllü olarak,
email ve şifre ile giriş yapmak istiyorum,
böylece portalıma erişip gönüllülük takibimi yapabileyim.

**Öncelik**: P0 | **Durum**: Backlog | **Sprint**: -

**Kabul Kriterleri:**
- [ ] Email ve şifre alanları mevcut
- [ ] Başarılı giriş sonrası access ve refresh token döndürülür
- [ ] Yanlış şifre girildiğinde genel hata mesajı gösterilir
- [ ] 5 başarısız denemeden sonra hesap 30 dakika kilitlenir
- [ ] Giriş sonrası Dashboard ekranına yönlendirilir

**Teknik Notlar:**
- Endpoint: `POST /api/v1/auth/login`
- Token süreleri: access 1 saat, refresh 14 gün

---

### [US-003] Token Yenileme
Bir giriş yapmış gönüllü olarak,
oturumum otomatik olarak yenilenmesini istiyorum,
böylece saat loglarken sürekli tekrar giriş yapmak zorunda kalmayayım.

**Öncelik**: P0 | **Durum**: Backlog | **Sprint**: -

**Kabul Kriterleri:**
- [ ] Access token süresi dolmadan önce otomatik yenilenir
- [ ] Refresh token geçerliyse yeni access token alınır
- [ ] Refresh token geçersizse login ekranına yönlendirilir

**Teknik Notlar:**
- Endpoint: `POST /api/v1/auth/refresh`
- Axios interceptor ile otomatik yenileme

---

### [US-004] Çıkış Yapma
Bir giriş yapmış gönüllü olarak,
güvenli bir şekilde çıkış yapmak istiyorum,
böylece hesabım güvenli kalsın.

**Öncelik**: P0 | **Durum**: Backlog | **Sprint**: -

**Kabul Kriterleri:**
- [ ] Çıkış butonu Settings ekranında mevcut
- [ ] Çıkış yapıldığında tüm tokenlar geçersiz kılınır
- [ ] Login ekranına yönlendirilir
- [ ] Onay dialog gösterilir

**Teknik Notlar:**
- Endpoint: `POST /api/v1/auth/logout`

---

## Dashboard

### [US-010] Dashboard Görüntüleme
Bir gönüllü olarak,
uygulamayı açtığımda özet bilgilerimi görmek istiyorum,
böylece ilerleme durumumu hızlıca takip edebileyim.

**Öncelik**: P0 | **Durum**: Backlog | **Sprint**: -

**Kabul Kriterleri:**
- [ ] Toplam gönüllülük saati gösterilir
- [ ] Bu ayki saat gösterilir (grafik ile)
- [ ] Son kazanılan rozetler gösterilir (max 3)
- [ ] Yaklaşan etkinlikler listesi gösterilir (max 3)
- [ ] Leaderboard'daki sıralama pozisyonu gösterilir
- [ ] Hızlı "Saat Ekle" butonu mevcut
- [ ] Pull-to-refresh ile içerik yenilenebilir
- [ ] Skeleton loader ile yükleme durumu gösterilir

**Teknik Notlar:**
- Endpoint: `GET /api/v1/dashboard` (aggregated data)
- React Query ile cache (5 dk stale time)

---

## Gönüllülük Saatleri (Volunteer Hours)

### [US-020] Gönüllülük Saati Loglama
Bir gönüllü olarak,
gönüllülük saatlerimi sisteme girmek istiyorum,
böylece çalışmalarım kayıt altına alınsın.

**Öncelik**: P0 | **Durum**: Backlog | **Sprint**: -

**Kabul Kriterleri:**
- [ ] Saat ekleme formu: proje adı, tarih, süre (saat), açıklama
- [ ] Proje adı seçim listesinden veya serbest metin olarak girilebilir
- [ ] Tarih seçici (bugün veya geçmiş tarih)
- [ ] Süre minimum 0.5 saat, maksimum 12 saat
- [ ] Açıklama alanı opsiyonel
- [ ] Başarılı kayıt sonrası onay mesajı gösterilir
- [ ] Kaydedilen saat "PENDING" durumunda başlar
- [ ] Form validasyonu yapılır

**Teknik Notlar:**
- Endpoint: `POST /api/v1/volunteers/hours`
- Zustand ile optimistic update

---

### [US-021] Saat Geçmişi Görüntüleme
Bir gönüllü olarak,
geçmiş gönüllülük saatlerimi listelemek istiyorum,
böylece ne kadar çalıştığımı takip edebileyim.

**Öncelik**: P0 | **Durum**: Backlog | **Sprint**: -

**Kabul Kriterleri:**
- [ ] Saat logları kronolojik sırada listelenir
- [ ] Her kayıtta: proje adı, tarih, süre, durum (Beklemede/Onaylandı/Reddedildi)
- [ ] Durum badge'leri renkli gösterilir (sarı/yeşil/kırmızı)
- [ ] Infinite scroll ile sayfalama
- [ ] Toplam onaylanan saat üstte gösterilir

**Teknik Notlar:**
- Endpoint: `GET /api/v1/volunteers/hours?page={n}&limit=20`
- React Query ile infinite query

---

## Rozet Sistemi (Badges)

### [US-030] Rozet Vitrini Görüntüleme
Bir gönüllü olarak,
tüm rozetleri ve kazanım durumlarını görmek istiyorum,
böylece bir sonraki hedefimi belirleyebileyim.

**Öncelik**: P0 | **Durum**: Backlog | **Sprint**: -

**Kabul Kriterleri:**
- [ ] Rozetler grid layout'da gösterilir
- [ ] Kazanılmış rozetler renkli, kilitli olanlar gri gösterilir
- [ ] Her rozet kartında: ikon, isim, kazanım durumu
- [ ] Rozete tıklayınca detay sayfasına gidilir
- [ ] Toplam kazanılan / toplam rozet sayısı gösterilir

**Teknik Notlar:**
- Endpoint: `GET /api/v1/badges`
- Endpoint: `GET /api/v1/badges/my` (kullanıcının rozet durumu)

---

### [US-031] Rozet Detay Görüntüleme
Bir gönüllü olarak,
bir rozetin detayını görmek istiyorum,
böylece ne yaparak kazanabileceğimi anlayabileyim.

**Öncelik**: P0 | **Durum**: Backlog | **Sprint**: -

**Kabul Kriterleri:**
- [ ] Rozet ikonu büyük gösterilir
- [ ] Rozet adı ve açıklaması gösterilir
- [ ] Kazanım kriteri açıkça yazılır (ör: "50 saat gönüllülük yap")
- [ ] Kazanılmışsa tarih gösterilir
- [ ] Kazanılmamışsa ilerleme gösterilir (ör: "35/50 saat")

**Teknik Notlar:**
- Endpoint: `GET /api/v1/badges/{badgeId}`

---

### [US-032] Otomatik Rozet Kazanımı
Bir gönüllü olarak,
belirli kriterleri karşıladığımda otomatik rozet kazanmak istiyorum,
böylece başarılarım anında ödüllendirilsin.

**Öncelik**: P0 | **Durum**: Backlog | **Sprint**: -

**Kabul Kriterleri:**
- [ ] Saat onaylandığında rozet kriterleri otomatik kontrol edilir
- [ ] Yeni rozet kazanıldığında kutlama animasyonu gösterilir
- [ ] Push bildirim gönderilir (opsiyonel, v1.1)
- [ ] Dashboard'da "Son Kazanılan" bölümü güncellenir

**Teknik Notlar:**
- Backend'de saat onayı sonrası otomatik rozet kontrolü
- Badge rules engine (criteria JSON)

---

## Etkinlik Yönetimi (Events)

### [US-040] Etkinlik Listesi Görüntüleme
Bir gönüllü olarak,
yaklaşan LÖSEV etkinliklerini görmek istiyorum,
böylece katılmak istediklerimi seçebileyim.

**Öncelik**: P0 | **Durum**: Backlog | **Sprint**: -

**Kabul Kriterleri:**
- [ ] Etkinlikler kronolojik sırada listelenir
- [ ] Her etkinlik kartında: başlık, tarih, lokasyon, kalan kontenjan
- [ ] Geçmiş etkinlikler ayrı bölümde gösterilir
- [ ] Katıldığım etkinlikler işaretli gösterilir

**Teknik Notlar:**
- Endpoint: `GET /api/v1/events?status=upcoming`

---

### [US-041] Etkinlik Detay ve Katılım
Bir gönüllü olarak,
bir etkinliğin detayını görüp katılmak istiyorum,
böylece LÖSEV faaliyetlerine aktif olarak katkıda bulunabileyim.

**Öncelik**: P0 | **Durum**: Backlog | **Sprint**: -

**Kabul Kriterleri:**
- [ ] Etkinlik başlığı, açıklaması, tarihi, saati, lokasyonu gösterilir
- [ ] Mevcut/toplam kontenjan gösterilir
- [ ] "Katıl" butonu ile kayıt yapılır
- [ ] Kayıtlıysa "İptal Et" butonu gösterilir
- [ ] Kontenjan doluysa buton devre dışı olur
- [ ] Başarılı kayıt/iptal sonrası onay mesajı

**Teknik Notlar:**
- Endpoint: `POST /api/v1/events/{eventId}/participate`
- Endpoint: `DELETE /api/v1/events/{eventId}/participate`

---

## Leaderboard (Sıralama)

### [US-050] Leaderboard Görüntüleme
Bir gönüllü olarak,
gönüllülerin sıralamasını görmek istiyorum,
böylece motivasyonumu artırabileyim.

**Öncelik**: P0 | **Durum**: Backlog | **Sprint**: -

**Kabul Kriterleri:**
- [ ] Top 3 gönüllü özel görsel ile gösterilir (podium)
- [ ] Sıralama listesi: sıra, avatar, ad, toplam saat, rozet sayısı
- [ ] Filtre seçenekleri: haftalık, aylık, tüm zamanlar
- [ ] Kullanıcının kendi pozisyonu vurgulu gösterilir
- [ ] Pull-to-refresh ile güncelleme

**Teknik Notlar:**
- Endpoint: `GET /api/v1/leaderboard?period=monthly`
- Redis cache ile hızlı erişim

---

## Profil Yönetimi

### [US-060] Profil Görüntüleme
Bir gönüllü olarak,
profil bilgilerimi ve istatistiklerimi görmek istiyorum,
böylece genel durumumu kontrol edebileyim.

**Öncelik**: P0 | **Durum**: Backlog | **Sprint**: -

**Kabul Kriterleri:**
- [ ] Profil kartında ad, soyad, email, avatar gösterilir
- [ ] İstatistikler: toplam saat, rozet sayısı, leaderboard sırası, etkinlik katılımı
- [ ] Son kazanılan rozetler gösterilir
- [ ] "Profili Düzenle" butonu mevcut
- [ ] "Ayarlar" linki mevcut

**Teknik Notlar:**
- Endpoint: `GET /api/v1/auth/me`

---

### [US-061] Profil Düzenleme
Bir gönüllü olarak,
profil bilgilerimi güncellemek istiyorum,
böylece bilgilerim güncel kalsın.

**Öncelik**: P0 | **Durum**: Backlog | **Sprint**: -

**Kabul Kriterleri:**
- [ ] Ad, soyad, telefon, okul alanları düzenlenebilir
- [ ] Avatar yükleme/değiştirme mümkün
- [ ] Değişiklikler kaydedildiğinde başarı mesajı gösterilir
- [ ] Form doğrulaması yapılır

---

## Ayarlar (Settings)

### [US-070] Tema Değiştirme (Dark Mode)
Bir gönüllü olarak,
uygulama temasını light/dark/system olarak değiştirmek istiyorum,
böylece tercih ettiğim görünümde kullanabileyim.

**Öncelik**: P0 | **Durum**: Backlog | **Sprint**: -

**Kabul Kriterleri:**
- [ ] Settings ekranında tema seçeneği mevcut (Light / Dark / System)
- [ ] Seçim anında tema değişir
- [ ] Tercih AsyncStorage'da saklanır
- [ ] Tüm ekranlar dark mode'da doğru görünür

---

## Post-MVP Hikayeleri

### [US-080] 42 OAuth ile Giriş
**Öncelik**: P1 | **Durum**: Backlog
*42 intra OAuth entegrasyonu ile tek tıkla giriş.*

### [US-081] Koordinatör Saat Onaylama
**Öncelik**: P1 | **Durum**: Backlog
*Koordinatörlerin gönüllü saatlerini onaylama/reddetme paneli.*

### [US-082] Etkinlik Takvimi
**Öncelik**: P1 | **Durum**: Backlog
*Aylık/haftalık takvim görünümü ile etkinlik planlaması.*

### [US-083] Push Bildirimler
**Öncelik**: P1 | **Durum**: Backlog
*Rozet kazanımı, etkinlik hatırlatması, saat onayı bildirimleri.*

### [US-084] Coalition Sistemi
**Öncelik**: P2 | **Durum**: Backlog
*Takım bazlı gönüllülük yarışması.*

---

## Özet Tablosu

### MVP (P0)

| ID | Başlık | Grup | Durum |
|----|--------|------|-------|
| US-001 | Gönüllü Kaydı | Auth | Backlog |
| US-002 | Gönüllü Girişi | Auth | Backlog |
| US-003 | Token Yenileme | Auth | Backlog |
| US-004 | Çıkış Yapma | Auth | Backlog |
| US-010 | Dashboard Görüntüleme | Dashboard | Backlog |
| US-020 | Gönüllülük Saati Loglama | Hours | Backlog |
| US-021 | Saat Geçmişi Görüntüleme | Hours | Backlog |
| US-030 | Rozet Vitrini | Badges | Backlog |
| US-031 | Rozet Detay | Badges | Backlog |
| US-032 | Otomatik Rozet Kazanımı | Badges | Backlog |
| US-040 | Etkinlik Listesi | Events | Backlog |
| US-041 | Etkinlik Detay ve Katılım | Events | Backlog |
| US-050 | Leaderboard | Leaderboard | Backlog |
| US-060 | Profil Görüntüleme | Profil | Backlog |
| US-061 | Profil Düzenleme | Profil | Backlog |
| US-070 | Tema Değiştirme | Ayarlar | Backlog |

---

*Yeni hikayeler eklendikçe özet tablosu güncellenir. Öncelik değişiklikleri için Team Lead ve LÖSEV ekibi onayı gereklidir.*
