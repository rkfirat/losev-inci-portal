// Simple i18n system for LÖSEV İnci Portal
// Supports Turkish (tr) and English (en)

export type Language = 'tr' | 'en';

type TranslationKey = keyof typeof translations.tr;

const translations = {
    tr: {
        // Common
        cancel: 'İptal',
        confirm: 'Onayla',
        save: 'Kaydet',
        delete: 'Sil',
        edit: 'Düzenle',
        loading: 'Yükleniyor...',
        error: 'Hata',
        success: 'Başarılı',
        retry: 'Tekrar Dene',

        // Auth
        login: 'Giriş Yap',
        register: 'Kayıt Ol',
        logout: 'Çıkış Yap',
        email: 'E-posta',
        password: 'Şifre',
        forgotPassword: 'Şifremi Unuttum',
        firstName: 'Ad',
        lastName: 'Soyad',

        // Dashboard
        welcomeGreeting: 'Merhaba',
        totalHours: 'Toplam Saat',
        thisMonth: 'Bu Ay',
        ranking: 'Sıralama',
        pending: 'Bekleyen',
        badges: 'Rozetler',
        myGoal: 'Hedefim',
        monthlyVolunteerHours: 'Aylık Gönüllülük Saatleri',
        recentBadges: 'Son Rozetler',
        upcomingEvents: 'Yaklaşan Etkinlikler',

        // Hours
        myHours: 'Saatlerim',
        pendingApproval: 'Onay Bekleyen',
        allHours: 'Tüm Saatler',
        addHour: 'Saat Ekle',
        projectName: 'Proje/Etkinlik Adı',
        duration: 'Süre (Saat)',
        date: 'Tarih',
        description: 'Açıklama',
        submit: 'Gönder',
        hourSubmitted: 'Gönüllülük saatiniz onaya gönderildi.',
        approve: 'Onayla',
        reject: 'Reddet',
        approved: 'Onaylandı',
        rejected: 'Reddedildi',
        waitingApproval: 'Bekliyor',

        // Events
        events: 'Etkinlikler',
        createEvent: 'Etkinlik Oluştur',
        eventTitle: 'Etkinlik Adı',
        location: 'Konum',
        capacity: 'Kapasite',
        joinEvent: 'Katıl',
        leaveEvent: 'Ayrıl',
        participating: 'Katılıyorsun',
        full: 'Dolu',
        participants: 'katılımcı',

        // Leaderboard
        leaderboard: 'Sıralama',
        weekly: 'Haftalık',
        monthly: 'Aylık',
        yearly: 'Yıllık',
        allTime: 'Tüm Zamanlar',
        yourRank: 'Sıralamanız',
        hours: 'saat',

        // Profile
        profile: 'Profil',
        editProfile: 'Profili Düzenle',
        settings: 'Ayarlar',
        theme: 'Tema',
        lightMode: 'Açık',
        darkMode: 'Koyu',
        systemMode: 'Sistem',
        notifications: 'Bildirimler',
        account: 'Hesap',
        userManagement: 'Kullanıcı Yönetimi',

        // Roles
        student: 'Öğrenci',
        teacher: 'Koordinatör',
        admin: 'Yönetici',

        // Activity types
        seminar: 'Seminer',
        stand: 'Stant',
        donation: 'Bağış',
        fair: 'Kermes',
        awareness: 'Farkındalık Etkinliği',
        socialMedia: 'Sosyal Medya Çalışması',
        other: 'Diğer',

        // Photo
        addPhoto: 'Fotoğraf Ekle',
        camera: 'Kamera',
        gallery: 'Galeri',
        permissionRequired: 'İzin Gerekli',
    },
    en: {
        // Common
        cancel: 'Cancel',
        confirm: 'Confirm',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        retry: 'Retry',

        // Auth
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        email: 'Email',
        password: 'Password',
        forgotPassword: 'Forgot Password',
        firstName: 'First Name',
        lastName: 'Last Name',

        // Dashboard
        welcomeGreeting: 'Hello',
        totalHours: 'Total Hours',
        thisMonth: 'This Month',
        ranking: 'Ranking',
        pending: 'Pending',
        badges: 'Badges',
        myGoal: 'My Goal',
        monthlyVolunteerHours: 'Monthly Volunteer Hours',
        recentBadges: 'Recent Badges',
        upcomingEvents: 'Upcoming Events',

        // Hours
        myHours: 'My Hours',
        pendingApproval: 'Pending Approval',
        allHours: 'All Hours',
        addHour: 'Add Hour',
        projectName: 'Project/Event Name',
        duration: 'Duration (Hours)',
        date: 'Date',
        description: 'Description',
        submit: 'Submit',
        hourSubmitted: 'Your volunteer hours have been submitted for approval.',
        approve: 'Approve',
        reject: 'Reject',
        approved: 'Approved',
        rejected: 'Rejected',
        waitingApproval: 'Pending',

        // Events
        events: 'Events',
        createEvent: 'Create Event',
        eventTitle: 'Event Title',
        location: 'Location',
        capacity: 'Capacity',
        joinEvent: 'Join',
        leaveEvent: 'Leave',
        participating: 'Participating',
        full: 'Full',
        participants: 'participants',

        // Leaderboard
        leaderboard: 'Leaderboard',
        weekly: 'Weekly',
        monthly: 'Monthly',
        yearly: 'Yearly',
        allTime: 'All Time',
        yourRank: 'Your Rank',
        hours: 'hours',

        // Profile
        profile: 'Profile',
        editProfile: 'Edit Profile',
        settings: 'Settings',
        theme: 'Theme',
        lightMode: 'Light',
        darkMode: 'Dark',
        systemMode: 'System',
        notifications: 'Notifications',
        account: 'Account',
        userManagement: 'User Management',

        // Roles
        student: 'Student',
        teacher: 'Teacher',
        admin: 'Admin',

        // Activity types
        seminar: 'Seminar',
        stand: 'Stand',
        donation: 'Donation',
        fair: 'Fair',
        awareness: 'Awareness Event',
        socialMedia: 'Social Media',
        other: 'Other',

        // Photo
        addPhoto: 'Add Photo',
        camera: 'Camera',
        gallery: 'Gallery',
        permissionRequired: 'Permission Required',
    },
} as const;

let currentLanguage: Language = 'tr';

export const i18n = {
    setLanguage(lang: Language) {
        currentLanguage = lang;
    },

    getLanguage(): Language {
        return currentLanguage;
    },

    t(key: TranslationKey): string {
        return translations[currentLanguage][key] ?? translations.tr[key] ?? key;
    },
};

export { translations };
