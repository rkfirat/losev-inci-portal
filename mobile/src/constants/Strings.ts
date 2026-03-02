export const Strings = {
  tr: {
    common: {
      loading: 'Yükleniyor...',
      error: 'Bir hata oluştu',
      retry: 'Tekrar Dene',
      save: 'Kaydet',
      cancel: 'İptal',
      back: 'Geri',
    },
    auth: {
      login: 'Giriş Yap',
      register: 'Kayıt Ol',
      email: 'E-posta',
      password: 'Şifre',
      logout: 'Çıkış Yap',
    },
    dashboard: {
      title: 'Dashboard',
      greeting: 'Merhaba',
      totalHours: 'Toplam Saat',
      badges: 'Rozet',
      rank: 'Sıralama',
      weeklyProgress: 'Haftalık İlerleme',
      recentBadges: 'Son Rozetler',
      upcomingEvents: 'Yaklaşan Etkinlikler',
    },
    events: {
      title: 'Etkinlikler',
      participate: 'Etkinliğe Katıl',
      cancelRSVP: 'Katılımı İptal Et',
      capacity: 'Kontenjan',
      location: 'Lokasyon',
      attending: 'kişi katılıyor',
    },
    leaderboard: {
      title: 'Sıralama',
      myRank: 'Senin Sıralaman',
    }
  },
  // Future en: { ... }
};

export type Language = 'tr';
export const defaultLanguage: Language = 'tr';

export const t = (path: string) => {
  const keys = path.split('.');
  const forbiddenKeys = ['__proto__', 'constructor', 'prototype'];
  let result: any = (Strings as any)[defaultLanguage];
  
  for (const key of keys) {
    if (forbiddenKeys.includes(key)) {
      return path;
    }
    
    if (result && typeof result === 'object' && Object.prototype.hasOwnProperty.call(result, key)) {
      // nosemgrep: javascript.lang.security.audit.prototype-pollution.prototype-pollution-loop.prototype-pollution-loop
      result = result[key];
    } else {
      return path; // Fallback to path if not found
    }
  }
  
  return typeof result === 'string' ? result : path;
};
