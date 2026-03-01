# Wireframe ve Mockup Standartları

Bu belge, LÖSEV İnci Portalı mobil uygulaması için wireframe ve mockup oluşturma standartlarını tanımlar.

## Wireframe Formatı

ASCII art kullanarak wireframe'ler oluşturulur. Bu format, hızlı iterasyona ve metin tabanlı dokümantasyona uygundur.

### Temel Semboller

```
+--+  Çerçeve/Container
|  |  Dikey kenar
----  Yatay kenar
[  ]  Buton
(  )  Yuvarlak buton/ikon
<  >  Navigasyon okları
===   Ayırıcı çizgi
...   Metin kısaltması
###   Görsel/Resim placeholder
[x]   Checkbox (seçili)
[ ]   Checkbox (boş)
(o)   Radio button (seçili)
( )   Radio button (boş)
[___] Input alanı
```

### Mobil Ekran Şablonu

```
+-----------------------------+
|  [<]    Sayfa Başlığı   [=] |  <- Header (44px)
+=============================+
|                             |
|                             |
|     İÇERİK ALANI           |  <- Content
|                             |
|                             |
+-----------------------------+
| [Home] [Events] [Profile]   |  <- Tab Bar (50px)
+-----------------------------+
```

## Örnek Wireframe'ler

### Giriş Ekranı (Login)
```
+-----------------------------+
|                             |
|       [LÖSEV LOGO]          |
|       İnci Portalı          |
|                             |
|  Email                      |
|  [_________________________]|
|                             |
|  Şifre                      |
|  [_________________________]|
|                             |
|  [      GİRİŞ YAP         ] |
|                             |
|  -------- veya --------     |
|                             |
|  (42) 42 ile giriş yap     |
|                             |
|  Hesabın yok mu? Kayıt Ol   |
+-----------------------------+
```

### Dashboard Ekranı
```
+-----------------------------+
|  (=)   Dashboard       (🔔) |
+=============================+
|                             |
|  Toplam Gönüllülük          |
|  +-------------------------+|
|  |  127.5 saat   🏅 8     ||
|  |  Bu ay: 22 saat         ||
|  +-------------------------+|
|                             |
|  [ + SAAT EKLE ]            |
|                             |
|  Son Rozetler               |
|  (🥇)(🎯)(⭐)              |
|                             |
|  Yaklaşan Etkinlikler       |
|  +-------------------------+|
|  | 📅 LÖSEV Gönüllü Günü  ||
|  |    3 Mart - İstanbul    ||
|  +-------------------------+|
|  +-------------------------+|
|  | 📅 Kan Bağışı Kampanyası||
|  |    10 Mart - Ankara     ||
|  +-------------------------+|
|                             |
|  Leaderboard Sıran: #12    |
+-----------------------------+
| [Dash] [Events] [Profile]   |
+-----------------------------+
```

### Rozet Vitrini Ekranı
```
+-----------------------------+
|  [<]    Rozetlerim     [?]  |
+=============================+
|  8 / 15 rozet kazanıldı     |
|                             |
|  +------+ +------+ +------+|
|  | 🥇   | | 🎯   | | ⭐   ||
|  | İlk  | |10Saat| |50Saat||
|  | Adım | |      | |      ||
|  +------+ +------+ +------+|
|                             |
|  +------+ +------+ +------+|
|  | 🏆   | | 📅   | | 🔒   ||
|  |100   | |Etkin | |      ||
|  |Saat  | |Sever | |KİLİT ||
|  +------+ +------+ +------+|
|                             |
|  +------+ +------+ +------+|
|  | 🔒   | | 🔒   | | 🔒   ||
|  |      | |      | |      ||
|  |KİLİT | |KİLİT | |KİLİT ||
|  +------+ +------+ +------+|
+-----------------------------+
| [Dash] [Events] [Profile]   |
+-----------------------------+
```

### Leaderboard Ekranı
```
+-----------------------------+
|  [<]   Leaderboard     [⚙] |
+=============================+
|  [Haftalık][Aylık][Tümü]    |
|                             |
|       🥇                    |
|     Ali K.                  |
|    320 saat                 |
|   🥈       🥉              |
|  Elif A.  Mehmet B.         |
|  285 saat 240 saat          |
|                             |
+-----------------------------+
| #  Avatar  Ad     Saat  🏅 |
+-----------------------------+
| 4  (##)  Zeynep   198  12  |
| 5  (##)  Can      185  10  |
| 6  (##)  Selin    170   9  |
|...                          |
|*12 (##)  Sen      127   8* |
+-----------------------------+
| [Dash] [Events] [Profile]   |
+-----------------------------+
```

## Dokümantasyon Formatı

Her wireframe aşağıdaki bilgilerle dokümante edilir:

```markdown
## Ekran: [Ekran Adı]

### Amaç
[Bu ekranın ne işe yaradığı]

### Kullanıcı Hikayesi
"Bir gönüllü olarak, [hedef] için [eylem] yapmak istiyorum"

### Wireframe
[ASCII wireframe]

### Elementler
| Element | Tip | Aksiyon |
|---------|-----|---------|
| [Ad] | [Tip] | [Ne yapar] |

### Navigasyon
- Önceki: [Hangi ekrandan gelir]
- Sonraki: [Hangi ekranlara gider]
```

## Ekran Akış Diyagramı

```
+----------+     +----------+     +----------+
|  Splash  | --> |  Login   | --> | Dashboard|
+----------+     +----------+     +----------+
                      |                |
                      v           +---------+--------+--------+
                 +----------+     |         |        |        |
                 | Register |   Hours    Badges   Events  Leaderboard
                 +----------+     |         |        |        |
                              AddHours  Detail   Detail   Filters
```

## Kalite Kontrol Listesi

Her wireframe için:

- [ ] Tüm dokunma hedefleri minimum 44x44px
- [ ] Header yüksekliği tutarlı (44-56px)
- [ ] Tab bar yüksekliği tutarlı (50px)
- [ ] İçerik padding'i tutarlı (16px)
- [ ] Navigasyon açık ve anlaşılır
- [ ] Tüm durumlar tanımlı (boş, yükleniyor, hata)
- [ ] Erişilebilirlik düşünülmüş

---

*Bu standartlar tüm tasarım çalışmasında referans olarak kullanılır.*
