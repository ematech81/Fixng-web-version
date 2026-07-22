import ReviewsContent from '@/components/shared/ReviewsContent';

export const metadata = { title: 'My Reviews — FixNG' };

export default function CustomerReviewsPage() {
  return (
    <div>
      <div className="px-4 md:px-8 pt-8 pb-4 border-b border-outline-variant/30">
        <h1 className="text-[24px] font-black text-on-surface">My Reviews</h1>
        <p className="text-[14px] text-on-surface-variant mt-1">Reviews you&apos;ve given to artisans after completed jobs</p>
      </div>
      <ReviewsContent role="customer" />
    </div>
  );
}
