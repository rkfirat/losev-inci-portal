# Veritabani Tasarim Standartlari

Bu belge, projede kullanilacak veritabani tasarim ve yonetim standartlarini tanimlar.

## Teknoloji Secimi

### Ana Veritabani: PostgreSQL

| Ozellik | Aciklama |
|---------|----------|
| Tip | Iliskisel (RDBMS) |
| Versiyon | 15+ |
| ACID | Tam uyumlu |
| JSON Destegi | JSONB ile native |

### Secim Gerekceleri
```
1. Guclu iliskisel ozellikler
2. JSONB ile esnek veri yapilari
3. Full-text search destegi
4. Olceklenebilirlik
5. Genis topluluk ve dokumantasyon
6. Production-proven guvenilirlik
```

### Cache Layer: Redis

| Kullanim | Aciklama |
|----------|----------|
| Session Store | Kullanici oturumlari |
| Cache | API response cache |
| Rate Limiting | Istek limitleme |
| Queue | Background job'lar |

## ORM: Prisma

### Secim Gerekceleri
```
1. Type-safe database client
2. Otomatik migration
3. Visual database browser (Prisma Studio)
4. Kolay iliski yonetimi
5. Performans optimizasyonlari
```

### Prisma Schema Yapisi

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Ornek model tanimlari asagida
```

## Tablo Isimlendirme Kurallari

### Genel Kurallar

| Kural | Ornek |
|-------|-------|
| snake_case kullan | user_profiles |
| Cogul isim kullan | users, volunteer_hours |
| Kisa ve anlamli | volunteer_badges (not: vlntr_bdgs) |
| Prefix kullanma | users (not: tbl_users) |

### Sutun Isimlendirme

| Kural | Ornek |
|-------|-------|
| snake_case kullan | first_name, created_at |
| Primary key | id |
| Foreign key | user_id, badge_id |
| Boolean | is_active, has_permission |
| Timestamp | created_at, updated_at, deleted_at |

## Standart Model Yapisi

### Temel Alanlar

Her tabloda bulunmasi gereken alanlar:

```prisma
model BaseFields {
  id         String   @id @default(uuid())
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@map("base_fields")
}
```

### Soft Delete

```prisma
model SoftDeleteFields {
  deletedAt  DateTime? @map("deleted_at")
  isDeleted  Boolean   @default(false) @map("is_deleted")
}
```

## Ornek Schema Tanimlari

### User Model

```prisma
model User {
  id             String    @id @default(uuid())
  email          String    @unique
  passwordHash   String    @map("password_hash")
  firstName      String?   @map("first_name")
  lastName       String?   @map("last_name")
  avatarUrl      String?   @map("avatar_url")
  phone          String?
  role           UserRole  @default(VOLUNTEER)
  school         String?   // 42 okul bilgisi
  intraLogin     String?   @unique @map("intra_login")
  isActive       Boolean   @default(true) @map("is_active")
  emailVerified  Boolean   @default(false) @map("email_verified")
  lastLoginAt    DateTime? @map("last_login_at")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")
  deletedAt      DateTime? @map("deleted_at")

  // Relations
  profile        UserProfile?
  volunteerHours VolunteerHour[]
  volunteerBadges VolunteerBadge[]
  sessions       Session[]

  @@map("users")
}

enum UserRole {
  VOLUNTEER
  COORDINATOR
  ADMIN
}
```

### UserProfile Model

```prisma
model UserProfile {
  id          String   @id @default(uuid())
  userId      String   @unique @map("user_id")
  phone       String?
  address     String?
  city        String?
  country     String?
  bio         String?
  dateOfBirth DateTime? @map("date_of_birth")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_profiles")
}
```

### VolunteerHour Model

```prisma
model VolunteerHour {
  id          String     @id @default(uuid())
  userId      String     @map("user_id")
  projectName String     @map("project_name")
  description String?
  hours       Decimal    @db.Decimal(5, 2)
  date        DateTime
  status      HourStatus @default(PENDING)
  approvedBy  String?    @map("approved_by")
  rejectedReason String? @map("rejected_reason")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")

  // Relations
  user        User       @relation(fields: [userId], references: [id])

  // Indexes
  @@index([userId])
  @@index([status])
  @@index([date])
  @@map("volunteer_hours")
}

enum HourStatus {
  PENDING
  APPROVED
  REJECTED
}
```

### Badge Model

```prisma
model Badge {
  id          String   @id @default(uuid())
  name        String
  description String
  iconUrl     String   @map("icon_url")
  category    String   // "hours", "events", "special"
  criteria    Json     // Kazanim kriterleri
  sortOrder   Int      @default(0) @map("sort_order")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  volunteerBadges VolunteerBadge[]

  @@index([category])
  @@index([isActive])
  @@map("badges")
}

model VolunteerBadge {
  id       String   @id @default(uuid())
  userId   String   @map("user_id")
  badgeId  String   @map("badge_id")
  earnedAt DateTime @default(now()) @map("earned_at")

  // Relations
  user  User  @relation(fields: [userId], references: [id])
  badge Badge @relation(fields: [badgeId], references: [id])

  @@unique([userId, badgeId])
  @@map("volunteer_badges")
}
```

### Event Model

```prisma
model Event {
  id          String   @id @default(uuid())
  title       String
  description String?
  location    String?
  startDate   DateTime @map("start_date")
  endDate     DateTime @map("end_date")
  capacity    Int?
  imageUrl    String?  @map("image_url")
  isActive    Boolean  @default(true) @map("is_active")
  createdBy   String   @map("created_by")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  participants EventParticipant[]

  @@index([startDate])
  @@index([isActive])
  @@map("events")
}

model EventParticipant {
  id       String              @id @default(uuid())
  eventId  String              @map("event_id")
  userId   String              @map("user_id")
  status   ParticipationStatus @default(REGISTERED)
  joinedAt DateTime            @default(now()) @map("joined_at")

  // Relations
  event Event @relation(fields: [eventId], references: [id])

  @@unique([eventId, userId])
  @@map("event_participants")
}

enum ParticipationStatus {
  REGISTERED
  ATTENDED
  CANCELLED
}
```

## Iliski Tanimlari

### One-to-One
```prisma
model User {
  profile UserProfile?
}

model UserProfile {
  userId String @unique
  user   User   @relation(fields: [userId], references: [id])
}
```

### One-to-Many
```prisma
model User {
  volunteerHours VolunteerHour[]
}

model VolunteerHour {
  userId String
  user   User   @relation(fields: [userId], references: [id])
}
```

### Many-to-Many
```prisma
model Badge {
  volunteerBadges VolunteerBadge[]
}

model User {
  volunteerBadges VolunteerBadge[]
}

model VolunteerBadge {
  userId  String
  badgeId String
  user    User  @relation(fields: [userId], references: [id])
  badge   Badge @relation(fields: [badgeId], references: [id])

  @@unique([userId, badgeId])
}
```

## Index Stratejisi

### Ne Zaman Index Kullanilir

| Durum | Index Tipi |
|-------|------------|
| Primary key | Otomatik (BTREE) |
| Foreign key | BTREE |
| Unique constraint | UNIQUE |
| Sik sorgulanan alanlar | BTREE |
| Full-text search | GIN |
| JSON alanlar | GIN |

### Index Ornekleri

```prisma
model VolunteerHour {
  // Tek alan index
  @@index([userId])

  // Composite index
  @@index([userId, status])

  // Unique index
  @@unique([userId, date])
}
```

## Migration Yonetimi

### Migration Olusturma
```bash
# Development
npx prisma migrate dev --name add_users_table

# Production
npx prisma migrate deploy
```

### Migration Dosya Yapisi
```
prisma/
├── schema.prisma
└── migrations/
    ├── 20240101000000_init/
    │   └── migration.sql
    ├── 20240102000000_add_users/
    │   └── migration.sql
    └── migration_lock.toml
```

### Migration Best Practices

1. **Atomik Degisiklikler**: Her migration tek bir degisiklik icermeli
2. **Geri Alinabilir**: Rollback stratejisi olmali
3. **Test Edilmis**: Staging ortaminda test edilmeli
4. **Dokumante Edilmis**: Degisiklik aciklamasi olmali

## Query Optimizasyonu

### Select Optimization
```typescript
// YANLIS: Tum alanlari cek
const users = await prisma.user.findMany();

// DOGRU: Sadece gerekli alanlari cek
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    firstName: true,
  },
});
```

### Relation Loading
```typescript
// YANLIS: N+1 problemi
const users = await prisma.user.findMany();
for (const user of users) {
  const hours = await prisma.volunteerHour.findMany({
    where: { userId: user.id },
  });
}

// DOGRU: Include ile tek sorguda
const users = await prisma.user.findMany({
  include: {
    volunteerHours: true,
  },
});
```

### Pagination
```typescript
const users = await prisma.user.findMany({
  skip: (page - 1) * limit,
  take: limit,
  orderBy: {
    createdAt: 'desc',
  },
});
```

## Veri Tipleri

### PostgreSQL - Prisma Mapping

| PostgreSQL | Prisma | Kullanim |
|------------|--------|----------|
| UUID | String @default(uuid()) | Primary keys |
| VARCHAR | String | Text |
| TEXT | String | Long text |
| INTEGER | Int | Sayilar |
| BIGINT | BigInt | Buyuk sayilar |
| DECIMAL | Decimal | Para birimleri |
| BOOLEAN | Boolean | True/False |
| TIMESTAMP | DateTime | Tarih/saat |
| JSONB | Json | Flexible data |

## Guvenlik

### SQL Injection Korunmasi
```typescript
// Prisma otomatik olarak parametreleri escape eder
const user = await prisma.user.findFirst({
  where: {
    email: userInput, // Guvenli
  },
});
```

### Sensitive Data
```typescript
// Password hash'i response'da dondurme
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    // passwordHash: true, // DAHIL ETME!
  },
});
```

## Checklist

Her tablo icin:

- [ ] Isimlendirme kurallarina uygun
- [ ] Primary key (UUID) tanimli
- [ ] created_at, updated_at alanlari var
- [ ] Soft delete gerekli mi degerlendirildi
- [ ] Foreign key'ler tanimli
- [ ] Gerekli indexler eklendi
- [ ] Iliskiler dogru tanimlanmis
- [ ] Migration olusturulmus ve test edilmis

---

*Bu standartlar tum veritabani tasarim surecinde uygulanir.*
