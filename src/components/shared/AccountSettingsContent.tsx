'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface SettingRow {
  icon: string;
  label: string;
  sub: string;
  badge?: { text: string; color: string; bg: string };
  href?: string;
  danger?: boolean;
  info?: string;
}

const SECURITY_ROWS: SettingRow[] = [
  {
    icon: '📱',
    label: 'Phone Number',
    sub: 'Used for login & OTP verification',
    info: 'To update your phone number, please contact our support team at support@techsphereapp.com with your account details.',
  },
  {
    icon: '🔑',
    label: 'Two-Factor Authentication',
    sub: 'OTP via SMS is active on every login',
    badge: { text: 'Active', color: '#16A34A', bg: '#DCFCE7' },
    info: 'Your account is protected with SMS OTP verification on every login. This cannot be disabled for security reasons.',
  },
];

const PRIVACY_ROWS: SettingRow[] = [
  {
    icon: '👤',
    label: 'Profile Visibility',
    sub: 'Your profile is visible to all platform users',
    info: 'Your profile name and job history are visible to other FixNG users. Artisan profiles are publicly visible to customers searching for services.',
  },
  {
    icon: '📍',
    label: 'Location Sharing',
    sub: 'Used for job matching and artisan discovery',
    info: 'Your location is only shared during active job sessions and for artisan discovery. You can revoke location permissions at any time in your browser settings.',
  },
  {
    icon: '💬',
    label: 'Chat Privacy',
    sub: 'Messages are only visible to job participants',
    info: 'All chat messages are only visible to the customer and artisan involved in the job. FixNG staff may review messages to resolve disputes.',
  },
];

export default function AccountSettingsContent() {
  const { user, logout } = useAuth();

  return (
    <div className="py-8 px-4 md:px-8 max-w-2xl flex flex-col gap-8">

      {/* Hero banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-4">
        <span className="text-[32px] flex-shrink-0">🔒</span>
        <div>
          <p className="text-[15px] font-bold text-blue-700 mb-1">Your privacy matters</p>
          <p className="text-[13px] text-on-surface-variant leading-relaxed">
            FixNG protects your data in line with the Nigeria Data Protection Regulation (NDPR) 2019.
          </p>
        </div>
      </div>

      {/* Account Security */}
      <Section emoji="🔐" title="Account Security">
        <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden divide-y divide-outline-variant/20">
          {SECURITY_ROWS.map((row) => (
            <InfoRow key={row.label} row={row} />
          ))}
          {/* Phone shown */}
          <div className="px-5 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center flex-shrink-0 text-[18px]">📞</div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-on-surface">Registered Phone</p>
              <p className="text-[13px] font-mono text-on-surface-variant mt-0.5">{user?.phone ?? '—'}</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Privacy */}
      <Section emoji="👁️" title="Privacy">
        <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden divide-y divide-outline-variant/20">
          {PRIVACY_ROWS.map((row) => (
            <InfoRow key={row.label} row={row} />
          ))}
        </div>
      </Section>

      {/* Data & Account */}
      <Section emoji="🗂️" title="Data & Account">
        <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden divide-y divide-outline-variant/20">
          <a
            href="mailto:support@techsphereapp.com?subject=Data%20Request"
            className="px-5 py-4 flex items-center gap-4 hover:bg-surface-container-low transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center flex-shrink-0 text-[18px]">📦</div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-on-surface">Download My Data</p>
              <p className="text-[12px] text-on-surface-variant">Request a copy of all your data (email us)</p>
            </div>
            <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors" style={{ fontSize: '18px' }}>chevron_right</span>
          </a>
          <a
            href="mailto:support@techsphereapp.com?subject=Delete%20My%20Account"
            className="px-5 py-4 flex items-center gap-4 hover:bg-error-container/30 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-error-container flex items-center justify-center flex-shrink-0 text-[18px]">🗑️</div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-error">Delete Account</p>
              <p className="text-[12px] text-on-surface-variant">Permanently remove your account and data</p>
            </div>
            <span className="material-symbols-outlined text-error/50 group-hover:text-error transition-colors" style={{ fontSize: '18px' }}>chevron_right</span>
          </a>
        </div>
        <p className="text-[12px] text-outline mt-2 px-1">
          Data requests are processed within 30 days. Account deletion requests within 3 business days.
        </p>
      </Section>

      {/* Legal */}
      <Section emoji="⚖️" title="Legal">
        <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden divide-y divide-outline-variant/20">
          <Link href="/privacy" className="px-5 py-4 flex items-center gap-4 hover:bg-surface-container-low transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center flex-shrink-0 text-[18px]">📄</div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-on-surface">Privacy Policy</p>
              <p className="text-[12px] text-on-surface-variant">How we collect and use your data</p>
            </div>
            <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors" style={{ fontSize: '18px' }}>open_in_new</span>
          </Link>
          <Link href="/terms" className="px-5 py-4 flex items-center gap-4 hover:bg-surface-container-low transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center flex-shrink-0 text-[18px]">🛡️</div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-on-surface">Terms of Service</p>
              <p className="text-[12px] text-on-surface-variant">Rules governing your use of FixNG</p>
            </div>
            <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors" style={{ fontSize: '18px' }}>open_in_new</span>
          </Link>
          <div className="px-5 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 text-[18px]">🇳🇬</div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-on-surface">NDPR Compliance</p>
              <p className="text-[12px] text-on-surface-variant">Nigeria Data Protection Regulation 2019</p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ color: '#16A34A', background: '#DCFCE7' }}>Active</span>
          </div>
        </div>
      </Section>

      {/* Logout */}
      <div className="border border-error/20 rounded-2xl p-5">
        <p className="text-[14px] font-semibold text-on-surface mb-1">Session</p>
        <p className="text-[12px] text-on-surface-variant mb-4">You are logged in as <span className="font-bold">{user?.name}</span> · {user?.phone}</p>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-5 py-2.5 border border-error text-error rounded-xl text-[14px] font-semibold hover:bg-error-container transition-all"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
          Log Out
        </button>
      </div>

      <p className="text-[12px] text-outline text-center pb-4">FixNG v1.0 · © 2025 Spheralix Digital Labs</p>
    </div>
  );
}

function Section({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-[18px]">{emoji}</span>
        <h2 className="text-[12px] font-bold text-on-surface-variant uppercase tracking-widest">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function InfoRow({ row }: { row: SettingRow }) {
  return (
    <details className="group">
      <summary className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-surface-container-low transition-colors list-none select-none">
        <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center flex-shrink-0 text-[18px]">{row.icon}</div>
        <div className="flex-1 min-w-0">
          <p className={`text-[14px] font-semibold ${row.danger ? 'text-error' : 'text-on-surface'}`}>{row.label}</p>
          <p className="text-[12px] text-on-surface-variant">{row.sub}</p>
        </div>
        {row.badge ? (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0" style={{ color: row.badge.color, background: row.badge.bg }}>
            {row.badge.text}
          </span>
        ) : (
          <span className="material-symbols-outlined text-outline-variant group-open:rotate-90 transition-transform flex-shrink-0" style={{ fontSize: '18px' }}>chevron_right</span>
        )}
      </summary>
      {row.info && (
        <div className="px-5 pb-4 pl-[74px]">
          <p className="text-[13px] text-on-surface-variant leading-relaxed bg-surface-container-low rounded-xl px-4 py-3">{row.info}</p>
        </div>
      )}
    </details>
  );
}
