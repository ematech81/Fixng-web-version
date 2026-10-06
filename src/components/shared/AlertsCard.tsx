'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { enablePush, isIos, isStandalone, pushSupported, syncPushIfGranted } from '@/lib/webPush';

const DISMISS_DAYS = 7;
const PUSH_KEY    = 'fixng_push_prompt_dismissed_at';
const INSTALL_KEY = 'fixng_install_prompt_dismissed_at';

// Chrome's install prompt event (not in the standard DOM typings)
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const recentlyDismissed = (key: string) => {
  try {
    const t = Number(localStorage.getItem(key) || 0);
    return t > 0 && Date.now() - t < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch { return false; }
};
const remember = (key: string) => { try { localStorage.setItem(key, String(Date.now())); } catch { /* private mode */ } };

/**
 * Dashboard prompts that keep users reachable while there is no mobile app:
 *   1. artisans without an email → add one (job alerts are emailed)
 *   2. turn on browser notifications (push) on this device
 *   3. add FixNG to the home screen (so the link isn't lost)
 * Each prompt hides itself once done, and "Not now" snoozes it for 7 days.
 */
export default function AlertsCard({ role }: { role: 'artisan' | 'customer' }) {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');
  const [pushSnoozed, setPushSnoozed] = useState(true);
  const [installSnoozed, setInstallSnoozed] = useState(true);
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(true);
  const [ios, setIos] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    setStandalone(isStandalone());
    setIos(isIos());
    setPushSnoozed(recentlyDismissed(PUSH_KEY));
    setInstallSnoozed(recentlyDismissed(INSTALL_KEY));
    if (pushSupported()) {
      setPermission(Notification.permission);
      syncPushIfGranted();            // user already said yes: keep this device registered, silently
    }

    const onBeforeInstall = (e: Event) => { e.preventDefault(); setInstallEvent(e as InstallPromptEvent); };
    const onInstalled = () => { setInstallEvent(null); setStandalone(true); };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!user) return null;

  const needsEmail   = role === 'artisan' && !user.email;
  const showPush     = permission === 'default' && !pushSnoozed;
  const showIosHint  = ios && !standalone && !pushSnoozed && permission === 'unsupported';
  const showInstall  = !!installEvent && !standalone && !installSnoozed;

  const turnOn = async () => {
    setBusy(true);
    setNote(null);
    const result = await enablePush();
    setBusy(false);
    if (result === 'granted') { setPermission('granted'); setNote('Alerts are on for this device.'); }
    else if (result === 'denied') { setPermission('denied'); setNote('Notifications are blocked. You can allow them in your browser settings.'); }
    else if (result === 'unavailable') setNote('Device alerts are not available right now. Please try again later.');
    else setNote('Could not turn on alerts. Please try again.');
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice.catch(() => null);
    setInstallEvent(null);
  };

  if (!needsEmail && !showPush && !showIosHint && !showInstall && !note) return null;

  const card = 'flex items-start gap-3 rounded-2xl border px-4 py-3';

  return (
    <div className="mb-6 space-y-2">
      {needsEmail && (
        <div className={card} style={{ background: '#FFF7ED', borderColor: '#F59E0B' }}>
          <span className="material-symbols-outlined mt-0.5" style={{ color: '#D97706', fontVariationSettings: "'FILL' 1" }}>mail</span>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold" style={{ color: '#92400E' }}>Add your email to get job alerts</p>
            <p className="text-[12px]" style={{ color: '#78350F' }}>
              We email you when a customer books you or messages you. Without an email you could miss jobs.
            </p>
          </div>
          <Link href="/artisan/profile" className="flex-shrink-0 text-[12px] font-bold px-3 py-1.5 rounded-lg text-white" style={{ background: '#D97706' }}>
            Add email
          </Link>
        </div>
      )}

      {showPush && (
        <div className={`${card} bg-white border-outline-variant/30 shadow-sm`}>
          <span className="material-symbols-outlined text-primary mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-on-surface">Get alerts on this device</p>
            <p className="text-[12px] text-on-surface-variant">
              {role === 'artisan' ? 'Know instantly when a customer books or messages you.' : 'Know instantly when an artisan replies or accepts your job.'}
            </p>
            <div className="flex gap-2 mt-2">
              <button onClick={turnOn} disabled={busy} className="text-[12px] font-bold px-3 py-1.5 rounded-lg bg-primary text-on-primary disabled:opacity-60">
                {busy ? 'Turning on…' : 'Turn on'}
              </button>
              <button onClick={() => { remember(PUSH_KEY); setPushSnoozed(true); }} className="text-[12px] font-semibold px-3 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container">
                Not now
              </button>
            </div>
          </div>
        </div>
      )}

      {showIosHint && (
        <div className={`${card} bg-white border-outline-variant/30 shadow-sm`}>
          <span className="material-symbols-outlined text-primary mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>ios_share</span>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-on-surface">Get alerts on your iPhone</p>
            <p className="text-[12px] text-on-surface-variant">
              Tap the Share button, choose <strong>Add to Home Screen</strong>, then open FixNG from your home screen and turn on alerts.
            </p>
          </div>
          <button onClick={() => { remember(PUSH_KEY); setPushSnoozed(true); }} aria-label="Dismiss" className="w-7 h-7 flex items-center justify-center rounded-full text-outline hover:bg-surface-container flex-shrink-0">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>
      )}

      {showInstall && (
        <div className={`${card} bg-white border-outline-variant/30 shadow-sm`}>
          <span className="material-symbols-outlined text-primary mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>install_mobile</span>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-on-surface">Add FixNG to your home screen</p>
            <p className="text-[12px] text-on-surface-variant">Open it in one tap, like an app — no need to keep the link.</p>
            <div className="flex gap-2 mt-2">
              <button onClick={install} className="text-[12px] font-bold px-3 py-1.5 rounded-lg bg-primary text-on-primary">Add</button>
              <button onClick={() => { remember(INSTALL_KEY); setInstallSnoozed(true); }} className="text-[12px] font-semibold px-3 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container">
                Not now
              </button>
            </div>
          </div>
        </div>
      )}

      {note && <p className="text-[12px] font-semibold text-on-surface-variant px-1">{note}</p>}
    </div>
  );
}
