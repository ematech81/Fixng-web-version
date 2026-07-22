'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

const DIMENSIONS = [
  { key: 'quality',       label: 'Quality of Work',  icon: 'construction',   desc: 'How well was the job done?' },
  { key: 'timeliness',    label: 'Timeliness',        icon: 'schedule',       desc: 'Did they show up and finish on time?' },
  { key: 'communication', label: 'Communication',     icon: 'chat_bubble',    desc: 'Were they responsive and clear?' },
] as const;

type DimKey = 'quality' | 'timeliness' | 'communication';
const HINTS = ['', 'Very poor', 'Poor', 'Good', 'Very good', 'Excellent'];

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '36px',
              color: s <= active ? '#F59E0B' : '#D1D5DB',
              fontVariationSettings: s <= active ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            star
          </span>
        </button>
      ))}
    </div>
  );
}

export default function RateJobPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [jobTitle,   setJobTitle]   = useState<string>('');
  const [jobLoading, setJobLoading] = useState(true);
  const [alreadyRated, setAlreadyRated] = useState(false);

  const [ratings, setRatings] = useState<Record<DimKey, number>>({ quality: 0, timeliness: 0, communication: 0 });
  const [comment,      setComment]      = useState('');
  const [artisanCode,  setArtisanCode]  = useState('');
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [success,      setSuccess]      = useState(false);

  // Verify job is completed & not already rated
  useEffect(() => {
    if (!id) return;
    api.get(`/api/jobs/${id}`)
      .then((r) => {
        const job = r.data.data ?? r.data.job ?? r.data;
        setJobTitle(job.title ?? job.category ?? 'Job');
        if (job.status !== 'completed') router.replace(`/customer/jobs/${id}`);
        if (job.rating?.score) setAlreadyRated(true);
      })
      .catch(() => router.replace('/customer/jobs'))
      .finally(() => setJobLoading(false));
  }, [id, router]);

  const overallScore = ratings.quality && ratings.timeliness && ratings.communication
    ? ((ratings.quality + ratings.timeliness + ratings.communication) / 3)
    : null;

  const handleSubmit = async () => {
    if (!ratings.quality || !ratings.timeliness || !ratings.communication) {
      setError('Please rate all three areas before submitting.');
      return;
    }
    const trimmedCode = artisanCode.trim().toUpperCase();
    if (trimmedCode && !/^FNG-[A-Z0-9]{5}$/.test(trimmedCode)) {
      setError('Artisan ID must be in the format FNG-XXXXX (e.g. FNG-AB23K).');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await api.post(`/api/jobs/${id}/rate`, {
        quality:      ratings.quality,
        timeliness:   ratings.timeliness,
        communication: ratings.communication,
        comment:      comment.trim() || undefined,
        artisanCode:  trimmedCode || undefined,
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (jobLoading) return (
    <div className="py-8 px-4 md:px-8 max-w-2xl space-y-4">
      <div className="h-6 w-32 rounded skeleton" />
      <div className="h-48 rounded-2xl skeleton" />
      <div className="h-48 rounded-2xl skeleton" />
    </div>
  );

  if (alreadyRated) return (
    <div className="py-16 px-4 flex flex-col items-center text-center gap-4 max-w-md mx-auto">
      <span className="material-symbols-outlined text-[64px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
      <h2 className="text-[22px] font-bold text-on-surface">Already reviewed</h2>
      <p className="text-[15px] text-on-surface-variant">You have already submitted a review for this job.</p>
      <Link href={`/customer/jobs/${id}`} className="mt-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:scale-95 transition-transform">
        Back to Job
      </Link>
    </div>
  );

  if (success) return (
    <div className="py-16 px-4 flex flex-col items-center text-center gap-4 max-w-md mx-auto">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
        <span className="material-symbols-outlined text-green-600" style={{ fontSize: '44px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
      </div>
      <h2 className="text-[24px] font-bold text-on-surface">Review Submitted!</h2>
      <p className="text-[15px] text-on-surface-variant leading-relaxed">
        Thank you for rating your artisan. Your review helps build trust on FixNG.
      </p>
      {overallScore && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-6 py-3">
          <span className="material-symbols-outlined text-amber-400" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>star</span>
          <span className="text-[20px] font-black text-amber-700">{overallScore.toFixed(1)} / 5</span>
        </div>
      )}
      <div className="flex gap-3 mt-2">
        <Link href={`/customer/jobs/${id}`} className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:scale-95 transition-transform">
          Back to Job
        </Link>
        <Link href="/customer/reviews" className="border border-outline-variant text-on-surface-variant px-6 py-3 rounded-xl font-bold hover:text-primary hover:border-primary transition-colors">
          My Reviews
        </Link>
      </div>
    </div>
  );

  return (
    <div className="py-8 px-4 md:px-8 max-w-2xl">

      <Link href={`/customer/jobs/${id}`} className="inline-flex items-center gap-1 text-primary text-[14px] font-medium hover:underline mb-6">
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
        Back to Job
      </Link>

      <h1 className="text-[24px] font-black text-on-surface mb-1">Rate Your Artisan</h1>
      <p className="text-[14px] text-on-surface-variant mb-8">
        {jobTitle} · Help future customers by sharing your honest experience.
      </p>

      {/* Star dimensions */}
      <div className="flex flex-col gap-4 mb-6">
        {DIMENSIONS.map((dim) => (
          <div key={dim.key} className="bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>{dim.icon}</span>
              </div>
              <div>
                <p className="text-[15px] font-bold text-on-surface">{dim.label}</p>
                <p className="text-[12px] text-on-surface-variant">{dim.desc}</p>
              </div>
            </div>
            <StarPicker value={ratings[dim.key]} onChange={(v) => setRatings((r) => ({ ...r, [dim.key]: v }))} />
            {ratings[dim.key] > 0 && (
              <p className="text-[12px] text-on-surface-variant mt-2 italic">{HINTS[ratings[dim.key]]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Overall score preview */}
      {overallScore !== null && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-6">
          <span className="text-[14px] font-bold text-amber-700">Overall Score</span>
          <span className="flex items-center gap-1 text-[20px] font-black text-amber-700">
            <span className="material-symbols-outlined text-amber-400" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>star</span>
            {overallScore.toFixed(1)} / 5
          </span>
        </div>
      )}

      {/* Comment */}
      <div className="mb-5">
        <label className="block text-[13px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
          Comment <span className="font-normal normal-case">(optional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="Share more about your experience..."
          className="w-full border border-outline-variant rounded-xl px-4 py-3 text-[14px] text-on-surface bg-white resize-none focus:outline-none focus:border-primary transition-colors"
        />
        <p className="text-[11px] text-outline text-right mt-1">{comment.length}/500</p>
      </div>

      {/* Artisan code */}
      <div className="mb-8">
        <label className="block text-[13px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
          Artisan ID <span className="font-normal normal-case">(optional)</span>
        </label>
        <input
          type="text"
          value={artisanCode}
          onChange={(e) => setArtisanCode(e.target.value.toUpperCase())}
          maxLength={9}
          placeholder="FNG-XXXXX"
          className="w-full border border-outline-variant rounded-xl px-4 py-3 text-[15px] font-mono tracking-widest text-on-surface bg-white focus:outline-none focus:border-primary transition-colors"
        />
        <p className="text-[11px] text-outline mt-1">Confirm the artisan who served you. Copy from the job detail screen.</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-error-container text-on-error-container rounded-xl px-4 py-3 text-[13px] font-medium flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-on-primary py-4 rounded-xl font-bold text-[15px] hover:brightness-110 active:scale-95 transition-all disabled:opacity-60"
        >
          {submitting
            ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>star</span>
          }
          {submitting ? 'Submitting…' : 'Submit Review'}
        </button>
        <Link
          href={`/customer/jobs/${id}`}
          className="flex-1 flex items-center justify-center py-4 rounded-xl font-bold text-[15px] text-on-surface-variant border border-outline-variant hover:text-primary hover:border-primary transition-colors text-center"
        >
          Skip for Now
        </Link>
      </div>

    </div>
  );
}
