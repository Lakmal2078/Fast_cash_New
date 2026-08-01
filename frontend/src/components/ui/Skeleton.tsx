export function SkeletonLine({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-white/5 ${className}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card-dark p-4 space-y-3 animate-pulse">
      <SkeletonLine className="h-4 w-2/3" />
      <SkeletonLine className="h-8 w-1/2" />
      <SkeletonLine className="h-3 w-1/3" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse p-3 rounded-lg bg-white/3">
          <SkeletonLine className="h-4 flex-1" />
          <SkeletonLine className="h-4 flex-1" />
          <SkeletonLine className="h-4 flex-1" />
          <SkeletonLine className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
