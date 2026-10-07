export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function formatTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatCurrency(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('234')) return `+${cleaned}`;
  if (cleaned.startsWith('0'))   return `+234${cleaned.slice(1)}`;
  return `+234${cleaned}`;
}

/** "Under 1 km", "4.2 km", "35 km" — or null when the distance is unknown. */
export function formatDistance(km: number | null | undefined): string | null {
  if (km == null || !Number.isFinite(km)) return null;
  if (km < 1) return 'Under 1 km';
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function clsx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
