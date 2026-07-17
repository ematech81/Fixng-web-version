export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-4" style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' }}>
      <div className="h-48 rounded-xl mb-4 skeleton" />
      <div className="h-6 w-3/4 mb-2 rounded skeleton" />
      <div className="h-4 w-1/2 mb-6 rounded skeleton" />
      <div className="h-10 w-full rounded-xl skeleton" />
    </div>
  );
}
