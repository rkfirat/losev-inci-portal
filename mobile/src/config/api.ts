export const API_CONFIG = {
  BASE_URL: __DEV__
    ? 'https://a431f3518ab92157-176-236-233-220.serveousercontent.com/api/v1'
    : 'https://api.inci-portal.losev.org.tr/api/v1',
  TIMEOUT: 15000,
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
} as const;
