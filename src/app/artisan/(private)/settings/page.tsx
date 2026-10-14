import Link from 'next/link';
import AccountSettingsContent from '@/components/shared/AccountSettingsContent';
import { VerifyAccountBanner } from '@/components/artisan/AccountPrompts';

export const metadata = { title: 'Settings — FixNG' };

export default function ArtisanSettingsPage() {
  return (
    <div>
      <div className="px-4 md:px-8 pt-8 pb-4 border-b border-outline-variant/30">
        <h1 className="text-[24px] font-black text-on-surface">Settings</h1>
        <p className="text-[14px] text-on-surface-variant mt-1">Account security, privacy, and data preferences</p>
      </div>
      <div className="px-4 md:px-8 pt-6 max-w-2xl">
        <VerifyAccountBanner className="" />
        <Link href="/artisan/verify" className="flex items-center gap-3 bg-white border border-outline-variant/30 rounded-2xl p-4 hover:border-primary/40 transition-colors">
          <span className="material-symbols-outlined text-primary">badge</span>
          <span className="flex-1 text-[14px] font-semibold text-on-surface">ID verification</span>
          <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
        </Link>
      </div>
      <AccountSettingsContent />
    </div>
  );
}
