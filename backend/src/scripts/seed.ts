import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.eventParticipant.deleteMany();
  await prisma.volunteerBadge.deleteMany();
  await prisma.volunteerHour.deleteMany();
  await prisma.event.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const passwordHash = await hashPassword('Admin123!');

  const admin = await prisma.user.create({
    data: {
      email: 'admin@losev.org.tr',
      passwordHash,
      firstName: 'Ayşe',
      lastName: 'Yılmaz',
      role: 'ADMIN',
      city: 'Ankara',
      district: 'Çankaya',
      emailVerified: true,
    },
  });
  console.log(`  ✅ Admin: ${admin.email}`);

  const teacher = await prisma.user.create({
    data: {
      email: 'koordinator@losev.org.tr',
      passwordHash,
      firstName: 'Mehmet',
      lastName: 'Öztürk',
      role: 'TEACHER',
      school: 'Atatürk Lisesi',
      city: 'İstanbul',
      district: 'Kadıköy',
      emailVerified: true,
    },
  });
  console.log(`  ✅ Koordinatör: ${teacher.email}`);

  const student1 = await prisma.user.create({
    data: {
      email: 'inci1@losev.org.tr',
      passwordHash,
      firstName: 'Zeynep',
      lastName: 'Kara',
      role: 'STUDENT',
      school: 'Atatürk Lisesi',
      city: 'İstanbul',
      district: 'Kadıköy',
      grade: '10',
      coordinatorName: 'Mehmet Öztürk',
      emailVerified: true,
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'inci2@losev.org.tr',
      passwordHash,
      firstName: 'Can',
      lastName: 'Demir',
      role: 'STUDENT',
      school: 'Atatürk Lisesi',
      city: 'İstanbul',
      district: 'Kadıköy',
      grade: '11',
      coordinatorName: 'Mehmet Öztürk',
      emailVerified: true,
    },
  });

  const student3 = await prisma.user.create({
    data: {
      email: 'inci3@losev.org.tr',
      passwordHash,
      firstName: 'Elif',
      lastName: 'Arslan',
      role: 'STUDENT',
      school: 'Kurtuluş Ortaokulu',
      city: 'Ankara',
      district: 'Keçiören',
      grade: '8',
      coordinatorName: 'Fatma Çelik',
      emailVerified: true,
    },
  });
  console.log(`  ✅ 3 öğrenci oluşturuldu`);

  // Create PRD-specific badges
  const badges = await Promise.all([
    prisma.badge.create({
      data: {
        name: 'Bronz İnci',
        description: '25 saat gönüllülük çalışması tamamlayan öğrencilere verilir.',
        criteria: { type: 'hours_approved', threshold: 25 },
        sortOrder: 1,
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Gümüş İnci',
        description: '50 saat gönüllülük çalışması tamamlayan öğrencilere verilir.',
        criteria: { type: 'hours_approved', threshold: 50 },
        sortOrder: 2,
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Altın İnci',
        description: '100 saat gönüllülük çalışması tamamlayan öğrencilere verilir.',
        criteria: { type: 'hours_approved', threshold: 100 },
        sortOrder: 3,
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Platin İnci Lideri',
        description: '200+ saat gönüllülük çalışması tamamlayan öğrencilere verilir.',
        criteria: { type: 'hours_approved', threshold: 200 },
        sortOrder: 4,
      },
    }),
    prisma.badge.create({
      data: {
        name: 'İlk Adım',
        description: 'İlk gönüllülük faaliyetini sisteme giren öğrencilere verilir.',
        criteria: { type: 'hours_logged', threshold: 1 },
        sortOrder: 0,
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Etkinlik Gönüllüsü',
        description: 'En az 3 etkinliğe katılan öğrencilere verilir.',
        criteria: { type: 'events_participated', threshold: 3 },
        sortOrder: 5,
      },
    }),
  ]);
  console.log(`  ✅ ${badges.length} rozet oluşturuldu (Bronz/Gümüş/Altın/Platin İnci)`);

  // Create sample events
  const now = new Date();
  await prisma.event.createMany({
    data: [
      {
        title: 'LÖSEV Farkındalık Semineri',
        description: 'Lösemili çocuklar hakkında farkındalık semineri. Tüm İnci öğrencileri davetlidir.',
        date: new Date(now.getFullYear(), now.getMonth() + 1, 15, 10, 0),
        location: 'Atatürk Lisesi Konferans Salonu, İstanbul',
        capacity: 100,
        createdBy: teacher.id,
      },
      {
        title: 'Kermes Organizasyonu',
        description: 'LÖSEV yararına okul kermesi. Tüm gelir LÖSEV\'e bağışlanacaktır.',
        date: new Date(now.getFullYear(), now.getMonth() + 1, 22, 9, 0),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 22, 17, 0),
        location: 'Atatürk Lisesi Bahçesi, İstanbul',
        capacity: 50,
        createdBy: teacher.id,
      },
      {
        title: 'Sosyal Medya Kampanyası Toplantısı',
        description: '#BenDeİnciyim kampanyası planlama toplantısı.',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 14, 0),
        location: 'Online — Zoom',
        createdBy: admin.id,
      },
    ],
  });
  console.log(`  ✅ 3 etkinlik oluşturuldu`);

  // Create sample volunteer hours for student1
  await prisma.volunteerHour.createMany({
    data: [
      {
        userId: student1.id,
        activityType: 'SEMINAR',
        projectName: 'Okul Semineri',
        date: new Date(now.getFullYear(), now.getMonth(), 5),
        hours: 3,
        description: 'Sınıf arkadaşlarına LÖSEV hakkında bilgilendirme semineri verdim.',
        status: 'APPROVED',
        reviewedBy: teacher.id,
        reviewedAt: new Date(),
      },
      {
        userId: student1.id,
        activityType: 'FAIR',
        projectName: 'Okul Kermesi',
        date: new Date(now.getFullYear(), now.getMonth(), 12),
        hours: 5,
        description: 'LÖSEV standında yardım ettim.',
        status: 'APPROVED',
        reviewedBy: teacher.id,
        reviewedAt: new Date(),
      },
      {
        userId: student1.id,
        activityType: 'SOCIAL_MEDIA',
        projectName: '#BenDeİnciyim Paylaşımı',
        date: new Date(now.getFullYear(), now.getMonth(), 18),
        hours: 2,
        description: 'Sosyal medyada farkındalık paylaşımları yaptım.',
        status: 'PENDING',
      },
      {
        userId: student2.id,
        activityType: 'STAND',
        projectName: 'AVM Stant Çalışması',
        date: new Date(now.getFullYear(), now.getMonth(), 10),
        hours: 4,
        description: 'AVM\'de LÖSEV tanıtım standında gönüllü oldum.',
        status: 'APPROVED',
        reviewedBy: teacher.id,
        reviewedAt: new Date(),
      },
    ],
  });
  console.log(`  ✅ Örnek gönüllülük saatleri oluşturuldu`);

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
