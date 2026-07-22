import AccountSettingsContent from '@/components/shared/AccountSettingsContent';

export const metadata = { title: 'Settings — FixNG' };

export default function CustomerSettingsPage() {
  return (
    <div>
      <div className="px-4 md:px-8 pt-8 pb-4 border-b border-outline-variant/30">
        <h1 className="text-[24px] font-black text-on-surface">Settings</h1>
        <p className="text-[14px] text-on-surface-variant mt-1">Account security, privacy, and data preferences</p>
      </div>
      <AccountSettingsContent />
    </div>
  );
}
