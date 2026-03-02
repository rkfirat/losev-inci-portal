import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding process started...');

  // 1. Seed Coalitions
  console.log('Seeding coalitions...');
  const coalitions = [
    {
      name: "İnci",
      description: "LÖSEV'in saflığını ve değerini temsil eden ekip.",
      color: "#FFFFFF",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2965/2965879.png",
    },
    {
      name: "Damla",
      description: "Her damla bir hayat, her gönüllü bir umut.",
      color: "#007BFF",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/414/414974.png",
    },
    {
      name: "Yıldız",
      description: "LÖSEV çocuklarının yolunu aydınlatan parlak yıldızlar.",
      color: "#FFD700",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/1828/1828884.png",
    },
    {
      name: "Güneş",
      description: "Sıcaklığı ve enerjisiyle her kalbe dokunan ekip.",
      color: "#FF8C00",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/869/869869.png",
    },
  ];

  for (const coalition of coalitions) {
    await prisma.coalition.upsert({
      where: { name: coalition.name },
      update: coalition,
      create: coalition,
    });
  }
  console.log('Coalitions seeded.');

  // 2. Seed Badges
  console.log('Seeding badges...');
  const badges = [
    {
      name: 'İlk Adım',
      description: 'LÖSEV İnci Portalı\'na ilk adımınızı attınız ve 1 saat gönüllülük yaptınız!',
      iconUrl: 'badge_1_hour',
      category: 'hours',
      criteria: { type: 'hours', threshold: 1 },
      sortOrder: 1,
    },
    {
      name: 'Gönüllü Yıldız',
      description: '10 saatlik gönüllülük çalışması ile bir yıldız gibi parlıyorsunuz.',
      iconUrl: 'badge_10_hours',
      category: 'hours',
      criteria: { type: 'hours', threshold: 10 },
      sortOrder: 2,
    },
    {
      name: 'Kahraman Gönüllü',
      description: '50 saatlik çalışma! LÖSEV çocukları için gerçek bir kahramansınız.',
      iconUrl: 'badge_50_hours',
      category: 'hours',
      criteria: { type: 'hours', threshold: 50 },
      sortOrder: 3,
    },
    {
      name: 'İnci Elçisi',
      description: '100 saatlik muazzam emek. Siz artık bir İnci Elçisisiniz.',
      iconUrl: 'badge_100_hours',
      category: 'hours',
      criteria: { type: 'hours', threshold: 100 },
      sortOrder: 4,
    },
  ];

  for (const badgeData of badges) {
    const existingBadge = await prisma.badge.findFirst({
      where: { name: badgeData.name }
    });

    if (existingBadge) {
      await prisma.badge.update({
        where: { id: existingBadge.id },
        data: badgeData,
      });
    } else {
      await prisma.badge.create({
        data: badgeData,
      });
    }
  }
  console.log('Badges seeded.');

  // 3. Seed Admin User
  console.log('Seeding admin user...');
  const adminEmail = 'admin@losev.org.tr';
  const adminPassword = 'Admin123!';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
    create: {
      email: adminEmail,
      passwordHash,
      firstName: 'Admin',
      lastName: 'LÖSEV',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('Admin user seeded.');

  console.log('Seeding process completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
