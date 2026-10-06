// Browser push (Web Push) helpers. Everything here is best-effort and never throws:
// push is an enhancement, the site must work without it.

import api from '@/lib/api';

export type EnablePushResult = 'granted' | 'denied' | 'unsupported' | 'unavailable' | 'error';

export function pushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/** iPhone/iPad browsers only allow web push once the site is added to the home screen. */
export function isIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/** True when running as an installed app (home-screen icon), not in a browser tab. */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function getRegistration(): Promise<ServiceWorkerRegistration> {
  await navigator.serviceWorker.register('/sw.js');
  return navigator.serviceWorker.ready;
}

/**
 * Ask permission (must be called from a click), subscribe this browser and save the
 * subscription for the signed-in user. Safe to call again — it re-saves the same one.
 */
export async function enablePush(): Promise<EnablePushResult> {
  if (!pushSupported()) return 'unsupported';
  try {
    const { data } = await api.get('/api/notifications/web-push/key');
    if (!data?.enabled || !data?.publicKey) return 'unavailable';

    const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if (permission !== 'granted') return 'denied';

    const reg = await getRegistration();
    const sub =
      (await reg.pushManager.getSubscription()) ??
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey) as BufferSource,
      }));

    await api.post('/api/notifications/web-push/subscribe', { subscription: sub.toJSON() });
    return 'granted';
  } catch {
    return 'error';
  }
}

/** Re-save the subscription for users who already allowed notifications (no prompt shown). */
export async function syncPushIfGranted(): Promise<void> {
  if (pushSupported() && Notification.permission === 'granted') await enablePush();
}

/** Called on logout so this device stops receiving the previous user's alerts. */
export async function disablePushForThisDevice(): Promise<void> {
  if (!pushSupported()) return;
  try {
    const reg = await navigator.serviceWorker.getRegistration('/sw.js');
    const sub = await reg?.pushManager.getSubscription();
    if (!sub) return;
    await api.post('/api/notifications/web-push/unsubscribe', { endpoint: sub.endpoint });
    await sub.unsubscribe();
  } catch {
    /* best effort */
  }
}
