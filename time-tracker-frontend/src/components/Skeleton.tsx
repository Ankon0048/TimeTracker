export function CardSkeleton() {
  return (
    <div className="card flex-col gap-2">
      <div className="skeleton" style={{ height: "1.25rem", width: "40%" }} />
      <div className="skeleton" style={{ height: "0.875rem", width: "90%" }} />
      <div className="skeleton" style={{ height: "0.875rem", width: "70%" }} />
    </div>
  );
}

export function CardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
