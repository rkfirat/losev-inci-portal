# LÖSEV İnci Portalı — Agents & Otonom Çalışma Kuralları

Bu klasör (`.agents/`), LÖSEV İnci Portalı'nın yapay zeka ajanları tarafından geliştirilmesi için gerekli rol, sorumluluk ve süreç tanımlarını içerir.

Cursor IDE kullananlar için `.cursor/rules/` altındaki kurallar da bu klasördeki prensipleri temel alır.

## Genel Kurallar ve Ajan Kullanımı

- **Tüm işlemlerde** (kod, düzeltme, genişletme, dokümantasyon) bu klasördeki rol dosyaları kullanılır. İşlemler bitse bile bu kural uygulanır.
- Başlamadan önce daima ilgili ajan dosyalarını (ör. `backend/role.md`, `frontend/role.md`, `designer/role.md`) okuyun.
- Geliştirme sürecinin orkestrasyonu **Team Lead** (`team_lead/role.md`) tarafından yapılır. Kalite kontrol ve handoff süreçleri onun sorumluluğundadır.

## Otonom Çalışma ve Sonsuz Döngü (Infinite Loop)

Projenin en temel kurallarından biri **KESİNTİSİZ ve SÜREKLİ** (otonom) çalışmaktır.
Görevler bitmeden ajanlar asla durmamalıdır.

1. **Zincirleme Görev İşleme:** Bir görev bittiğinde oturumu kapatmayın veya kullanıcıdan yeni komut beklemeyin. Derhal task board'a veya loglara bakıp sıradaki görevi tespit ederek o göreve geçin.
2. **Kullanıcıya Sorma Yasaktır:** Onay gereken (karar zorunluluğu) nadir anlar dışında "Devam edeyim mi?", "Sıradaki göreve geçelim mi?" gibi sorular sormayın. Varsa, en iyi mühendislik yaklaşımını varsayıp devam edin.
3. **Bekleme Yok:** İşleri günlere yaymayın. Açık görevler tamamlanana kadar sprint mantığıyla peş peşe tamamlayın.
4. **Kalite Kontrolü ve Operasyon:** Her bir alt iş bittiğinde logları, status'leri ve task board'u otomatik güncelleyip bir sonrakine geçin. `team_lead`'in checklist'ini kendi kendinize kontrol edip hataları düzeltin ve döngüye devam edin.
5. **Limit ve Otonom Bekleme (Sonsuz Uyku Protokolü):**
   - **Beni Asla Bekleme:** Limit dolduğunda, 429 Rate Limit hatası alındığında veya token bittiğinde kullanıcıdan onay veya model değişimi KESİNLİKLE beklenmez.
   - **Kendi Kendine Bekle (Sleep/Retry):** İşlemi durdurup oturumu kapatmak yerine, sistemde makul bir süre (ör. 5 dk veya 'retry-after' süresi kadar) uyku moduna geçilir.
   - **Döngüsel Tekrar (Exponential Backoff):** Uyku süresi bitince aynı eylem otomatik tekrar denenir. Hata sürerse bekleme süresi artırılarak (10 dk, 15 dk vb.) yeniden uyunur.
   - **Asla Pes Etme:** Limitler sıfırlanıp işlem başarılı olana kadar bu döngü kendi kendine sürdürülür. Başarılı olduğunda normal işleyişe dönülür.

## Dosya Yapısı

- `team_lead/role.md`: Koordinasyon, kalite kontrol, handoff ve otonom döngü yönetimi.
- `backend/role.md`: API, şema, RBAC, hata kodları.
- `frontend/role.md`: Komponentler, responsive yapı, API katmanı, rol bazlı UI.
- `designer/role.md`: Tasarım standartları, token, erişilebilir UI kuralları.
- `qa_tester/role.md`: Regresyon testleri, derin mantık doğrulaması, güvenlik denetimi.
