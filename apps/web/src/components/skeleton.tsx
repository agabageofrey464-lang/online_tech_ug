// Shimmering placeholders shown while content loads. Pure CSS (.skeleton in
// globals.css), so it works in both server and client components.

export function Skeleton({ className = "" }: { className?: string }) {
  return <span className={`skeleton block ${className}`} aria-hidden="true" />;
}

/** A product-card-shaped placeholder grid for loading product lists. */
export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg bg-white p-2.5 shadow-sm">
          <Skeleton className="aspect-square w-full rounded-md" />
          <Skeleton className="mt-2 h-3 w-11/12 rounded" />
          <Skeleton className="mt-1.5 h-3 w-2/3 rounded" />
          <Skeleton className="mt-2 h-4 w-1/2 rounded" />
        </div>
      ))}
    </div>
  );
}
