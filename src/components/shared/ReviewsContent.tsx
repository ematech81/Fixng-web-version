'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface ReviewRatings {
  quality:       number;
  timeliness:    number;
  communication: number;
}

interface Review {
  id:           string;
  customerName: string;
  artisanName:  string;
  jobCategory:  string;
  overallScore: number;
  ratings:      ReviewRatings;
  comment?:     string;
  createdAt:    string;
}

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60)      return 'just now';
  if (diff < 3600)    return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)   return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function StarRow({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className="material-symbols-outlined"
          style={{ fontSize: '16px', color: '#F59E0B', fontVariationSettings: n <= Math.round(score) ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
      ))}
    </div>
  );
}

function RatingPill({ label, value }: { label: string; value: number }) {
  return (
    <span className="flex items-center gap-1.5 bg-surface-container-low border border-outline-variant/30 rounded-full px-3 py-1">
      <span className="text-[11px] font-semibold text-on-surface-variant">{label}</span>
      <span className="text-[11px] font-black text-on-surface">{value}/5</span>
    </span>
  );
}

interface Props {
  role: 'artisan' | 'customer';
}

export default function ReviewsContent({ role }: Props) {
  const isArtisan = role === 'artisan';

  const [reviews,     setReviews]     = useState<Review[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(true);

  const loadPage = useCallback(async (p: number, append: boolean) => {
    try {
      const r    = await api.get('/api/reviews/mine', { params: { page: p, limit: 15 } });
      const data: Review[] = r.data.data ?? [];
      setReviews((prev) => append ? [...prev, ...data] : data);
      setPage(p);
      setHasMore(data.length === 15);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadPage(1, false).finally(() => setLoading(false));
  }, [loadPage]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await loadPage(page + 1, true);
    setLoadingMore(false);
  };

  if (loading) return (
    <div className="flex flex-col gap-4 py-6 px-4 md:px-8 max-w-3xl">
      {[1, 2, 3].map((i) => <div key={i} className="h-40 rounded-2xl skeleton" />)}
    </div>
  );

  if (reviews.length === 0) return (
    <div className="py-24 flex flex-col items-center text-center gap-4 px-4">
      <span className="text-[56px]">{isArtisan ? '⭐' : '📝'}</span>
      <h2 className="text-[22px] font-bold text-on-surface">
        {isArtisan ? 'No reviews yet' : 'No reviews given yet'}
      </h2>
      <p className="text-[15px] text-on-surface-variant max-w-sm leading-relaxed">
        {isArtisan
          ? 'When customers rate your completed jobs, their reviews will appear here.'
          : 'After completing a job, you can rate the artisan. Your reviews will appear here.'}
      </p>
    </div>
  );

  return (
    <div className="py-6 px-4 md:px-8 max-w-3xl flex flex-col gap-4">
      {reviews.map((item) => {
        const personName = isArtisan ? item.customerName : item.artisanName;
        const initials   = personName?.[0]?.toUpperCase() ?? '?';

        return (
          <div key={item.id} className="bg-white rounded-2xl p-5 border border-outline-variant/20 shadow-sm flex flex-col gap-3">

            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-primary-container/30 flex items-center justify-center flex-shrink-0">
                <span className="text-[18px] font-black text-primary">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-on-surface truncate">{personName}</p>
                <p className="text-[12px] text-on-surface-variant capitalize">{item.jobCategory}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1">
                  <span className="text-[14px] font-black text-amber-700">{item.overallScore.toFixed(1)}</span>
                  <span className="material-symbols-outlined text-amber-400" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <span className="text-[11px] text-outline">{timeAgo(item.createdAt)}</span>
              </div>
            </div>

            {/* Stars */}
            <StarRow score={item.overallScore} />

            {/* Dimension pills */}
            <div className="flex flex-wrap gap-2">
              <RatingPill label="Quality"       value={item.ratings?.quality} />
              <RatingPill label="Timeliness"    value={item.ratings?.timeliness} />
              <RatingPill label="Communication" value={item.ratings?.communication} />
            </div>

            {/* Comment */}
            {item.comment && (
              <div className="bg-surface-container-low rounded-xl px-4 py-3 border-l-4 border-primary/30">
                <p className="text-[13px] text-on-surface-variant leading-relaxed italic">&ldquo;{item.comment}&rdquo;</p>
              </div>
            )}
          </div>
        );
      })}

      {/* Load more */}
      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="mx-auto flex items-center gap-2 px-6 py-2.5 border border-outline-variant rounded-xl text-[13px] font-semibold text-on-surface-variant hover:text-primary hover:border-primary transition-colors disabled:opacity-50"
        >
          {loadingMore
            ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            : <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>expand_more</span>
          }
          {loadingMore ? 'Loading…' : 'Load More'}
        </button>
      )}
    </div>
  );
}
