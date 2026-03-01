import { AxiosError } from 'axios';

interface ApiErrorResponse {
  error?: {
    message?: string;
  };
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data as ApiErrorResponse | undefined;

    if (status === 503) {
      const msg =
        (typeof data === 'object' && data?.error?.message) ||
        'Backend API tüneli kapalı. Uygulamayı start:tunnel ile açıyorsanız bu yeterli değil; API\'yi dışarı açmak için ayrı bir terminalde "npm run tunnel" çalıştırın (proje kökünden veya cd backend).';
      console.error('API Error Response (503):', error.response?.data ?? error.message);
      return msg;
    }

    if (data?.error?.message) {
      console.error('API Error Response:', JSON.stringify(error.response?.data, null, 2));
      return data.error.message;
    }
    if (status && status >= 400) {
      console.error('API Error Response:', JSON.stringify(error.response?.data, null, 2));
    }
  } else {
    console.error('API Error Raw:', error);
  }
  return fallback;
}
