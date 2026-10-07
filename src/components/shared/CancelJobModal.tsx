'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface Policy {
  allowed: boolean;
  message: string;
  isLate?: boolean;
  graceMinutesLeft?: number;
  canDispute?: boolean;
  reasons: { code: string; label: string }[];
}

/**
 * Cancel-a-job dialog for both customers and artisans. The rules (who can cancel, when it is
 * free, which reasons are offered) come from the server, so they are always current.
 * Asks for a reason first; "Other" needs a short note.
 */
export default function CancelJobModal({
  jobId, role, onClose, onCancelled,
}: {
  jobId: string;
  role: 'customer' | 'artisan';
  onClose: () => void;
  onCancelled: () => void;
}) {
  const [policy, setPolicy]   = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [code, setCode]       = useState('');
  const [note, setNote]       = useState('');
  const [busy, setBusy]       = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    api.get(`/api/jobs/${jobId}/cancel-policy`)
      .then((r) => setPolicy(r.data.data))
      .catch((e) => setLoadErr(e?.response?.data?.message ?? 'Could not load the cancellation rules. Please try again.'))
      .finally(() => setLoading(false));
  }, [jobId]);

  const noteRequired = code === 'other';
  const canSubmit = !!code && (!noteRequired || note.trim().length >= 5) && !busy;

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await api.post(`/api/jobs/${jobId}/cancel`, { reasonCode: code, note: note.trim() || undefined });
      onCancelled();
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Could not cancel the job. Please try again.');
      setBusy(false);
    }
  };

  const tone = policy?.isLate
    ? { bg: '#FFF7ED', border: '#F59E0B', text: '#92400E', icon: 'warning' }
    : { bg: '#F0FDF4', border: '#86EFAC', text: '#166534', icon: 'check_circle' };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={busy ? undefined : onClose}>
      <div
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Cancel job"
      >
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-[20px] font-black text-on-surface">Cancel this job?</h2>
          <button onClick={onClose} disabled={busy} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded-full text-outline hover:bg-surface-container">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {loading && <div className="h-32 rounded-2xl skeleton" />}

        {!loading && loadErr && (
          <p className="text-[14px] text-error bg-error-container rounded-xl px-4 py-3">{loadErr}</p>
        )}

        {!loading && policy && !policy.allowed && (
          <>
            <div className="rounded-xl px-4 py-3 mb-4 text-[14px]" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B' }}>
              {policy.message}
            </div>
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-outline-variant text-[14px] font-bold text-on-surface-variant">Close</button>
              {policy.canDispute && (
                <Link href={`/${role}/jobs/${jobId}`} onClick={onClose} className="flex-1 py-3 rounded-xl bg-primary text-on-primary text-[14px] font-bold text-center">
                  Raise a dispute
                </Link>
              )}
            </div>
          </>
        )}

        {!loading && policy?.allowed && (
          <>
            <div className="rounded-xl px-4 py-3 mb-4 flex items-start gap-2 text-[13px] leading-snug" style={{ background: tone.bg, border: `1px solid ${tone.border}`, color: tone.text }}>
              <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>{tone.icon}</span>
              <span>{policy.message}</span>
            </div>

            <p className="text-[13px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Why are you cancelling?</p>
            <div className="space-y-2 mb-3">
              {policy.reasons.map((r) => (
                <label
                  key={r.code}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer text-[14px] transition-colors ${
                    code === r.code ? 'border-primary bg-primary-container/20 font-semibold text-on-surface' : 'border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  <input type="radio" name="cancel-reason" value={r.code} checked={code === r.code} onChange={() => setCode(r.code)} className="accent-[#2563EB]" />
                  {r.label}
                </label>
              ))}
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={300}
              rows={2}
              placeholder={noteRequired ? 'Please tell us the reason (required)' : 'Add a note (optional)'}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-primary/20 resize-none mb-3"
            />

            {error && <p className="text-[13px] text-error bg-error-container rounded-xl px-4 py-2.5 mb-3">{error}</p>}

            <div className="flex gap-2">
              <button onClick={onClose} disabled={busy} className="flex-1 py-3 rounded-xl border border-outline-variant text-[14px] font-bold text-on-surface-variant disabled:opacity-50">
                Keep job
              </button>
              <button
                onClick={submit}
                disabled={!canSubmit}
                className="flex-[1.4] py-3 rounded-xl text-[14px] font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {busy && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Cancel job
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
