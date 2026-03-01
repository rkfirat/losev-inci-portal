export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatHours(hours: number): string {
  if (hours === 1) return '1 saat';
  return `${hours} saat`;
}

const HOUR_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Bekliyor',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
};

export function getHourStatusLabel(status: string): string {
  return HOUR_STATUS_LABELS[status] ?? status;
}
