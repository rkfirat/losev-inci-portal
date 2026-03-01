# State Yönetimi Stratejisi

Bu belge, LÖSEV İnci Portalı projesinde kullanılacak state yönetimi yaklaşımını ve standartlarını tanımlar.

## State Türleri

### 1. Local State (Yerel Durum)
Sadece bir komponente özgü durum.

```typescript
// Örnek: Form input değeri
const [email, setEmail] = useState('');

// Örnek: Modal açık/kapalı
const [isModalVisible, setIsModalVisible] = useState(false);
```

**Kullanım Alanı:**
- Form inputları
- UI toggle'ları
- Geçici animasyon durumları

### 2. Global State (Genel Durum)
Birden fazla komponentin eriştiği paylaşılan durum.

```typescript
// Örnek: Kullanıcı bilgisi
// Örnek: Tema tercihi
// Örnek: Gönüllülük saat verileri
```

**Kullanım Alanı:**
- Authentication durumu
- Kullanıcı profili
- Uygulama ayarları
- Gönüllülük verileri (saat toplamı, rozetler)

### 3. Server State (Sunucu Durumu)
API'den gelen ve cache'lenen veriler.

```typescript
// Örnek: Gönüllülük saat geçmişi
// Örnek: Etkinlik listesi
// Örnek: Leaderboard verileri
```

**Kullanım Alanı:**
- API'den gelen tüm veriler
- Paginasyon durumu
- Arama sonuçları

## Teknoloji Seçimi

### Global State: Zustand

```
Seçim Gerekçeleri:
- Minimal API, kolay öğrenme
- TypeScript ile mükemmel uyum
- Boilerplate yok
- DevTools desteği
- Persist middleware
```

### Server State: React Query (TanStack Query)

```
Seçim Gerekçeleri:
- Otomatik caching
- Background refetching
- Optimistic updates
- Retry mekanizması
- Devtools
```

## Zustand Kullanımı

### Store Yapısı

```
store/
├── index.ts                  # Store birleşimi
├── useAuthStore.ts           # Authentication store
├── useVolunteerStore.ts      # Gönüllülük verileri store
├── useBadgeStore.ts          # Rozet store
├── useSettingsStore.ts       # Settings store
└── types/
    └── store.types.ts        # Store tipleri
```

### Store Şablonu

```typescript
// useAuthStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  // State
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setToken: (token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      setToken: (token) => set({
        token,
        isAuthenticated: true
      }),

      logout: () => set({
        token: null,
        isAuthenticated: false
      }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ token: state.token }),
    }
  )
);
```

### Selector Kullanımı

```typescript
// DOĞRU: Sadece gerekli state'i seç
const token = useAuthStore((state) => state.token);
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

// YANLIŞ: Tüm store'u seç (gereksiz re-render)
const authStore = useAuthStore();
```

### Derived State

```typescript
// useVolunteerStore.ts
import { create } from 'zustand';

interface VolunteerHourEntry {
  id: string;
  projectName: string;
  hours: number;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface VolunteerState {
  hourEntries: VolunteerHourEntry[];
  addEntry: (entry: VolunteerHourEntry) => void;
  removeEntry: (id: string) => void;
  clearEntries: () => void;
}

export const useVolunteerStore = create<VolunteerState>((set) => ({
  hourEntries: [],

  addEntry: (entry) => set((state) => ({
    hourEntries: [...state.hourEntries, entry]
  })),

  removeEntry: (id) => set((state) => ({
    hourEntries: state.hourEntries.filter((entry) => entry.id !== id)
  })),

  clearEntries: () => set({ hourEntries: [] }),
}));

// Derived selectors
export const useTotalApprovedHours = () =>
  useVolunteerStore((state) =>
    state.hourEntries
      .filter((entry) => entry.status === 'APPROVED')
      .reduce((total, entry) => total + entry.hours, 0)
  );

export const usePendingCount = () =>
  useVolunteerStore((state) =>
    state.hourEntries.filter((entry) => entry.status === 'PENDING').length
  );
```

## React Query Kullanımı

### Query Hook Yapısı

```typescript
// hooks/queries/useVolunteerHours.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { volunteerService } from '@/services/volunteerService';
import type { VolunteerHour, CreateHourDTO } from '@/types/volunteer';

// Query Keys
export const volunteerKeys = {
  all: ['volunteerHours'] as const,
  lists: () => [...volunteerKeys.all, 'list'] as const,
  list: (filters: string) => [...volunteerKeys.lists(), { filters }] as const,
  details: () => [...volunteerKeys.all, 'detail'] as const,
  detail: (id: string) => [...volunteerKeys.details(), id] as const,
};

// Hooks
export const useVolunteerHours = (filters?: string) => {
  return useQuery({
    queryKey: volunteerKeys.list(filters || ''),
    queryFn: () => volunteerService.getHours(filters),
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
};

export const useLogHours = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHourDTO) => volunteerService.logHours(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: volunteerKeys.lists() });
    },
  });
};
```

### Optimistic Update

```typescript
export const useUpdateHourEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VolunteerHour> }) =>
      volunteerService.updateEntry(id, data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: volunteerKeys.detail(id) });
      const previousEntry = queryClient.getQueryData(volunteerKeys.detail(id));

      queryClient.setQueryData(volunteerKeys.detail(id), (old: VolunteerHour) => ({
        ...old,
        ...data,
      }));

      return { previousEntry };
    },

    onError: (err, { id }, context) => {
      queryClient.setQueryData(
        volunteerKeys.detail(id),
        context?.previousEntry
      );
    },

    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: volunteerKeys.detail(id) });
    },
  });
};
```

## State Yönetimi Kararları

### Hangi State Nerede?

```
+------------------+-------------------+-----------------------------+
| Durum Türü       | Çözüm             | Örnek                       |
+------------------+-------------------+-----------------------------+
| UI State         | useState          | Modal açık/kapalı           |
| Form State       | React Hook Form   | Saat loglama formu          |
| Auth State       | Zustand + Persist | Token, user                 |
| App Settings     | Zustand + Persist | Tema, bildirimler           |
| Volunteer Data   | Zustand + Persist | Taslak saat logları         |
| Server Data      | React Query       | Saat geçmişi, rozetler      |
| Navigation State | React Navigation  | Aktif ekran                 |
+------------------+-------------------+-----------------------------+
```

### State Akış Diyagramı

```
+-------------+     +-------------+     +-------------+
|   Server    | <-> | React Query | <-> | Components  |
+-------------+     +-------------+     +-------------+
                          |
                          v
+-------------+     +-------------+     +-------------+
| AsyncStorage| <-> |   Zustand   | <-> | Components  |
+-------------+     +-------------+     +-------------+
```

## Checklist

Her state kararı için:

- [ ] State türü belirlendi (local/global/server)
- [ ] Doğru çözüm seçildi
- [ ] Persist gereksinimi değerlendirildi
- [ ] Selector'lar optimize edildi
- [ ] TypeScript tipleri tanımlandı
- [ ] DevTools entegrasyonu yapıldı

---

*Bu strateji tüm state yönetimi kararlarında referans olarak kullanılır.*
