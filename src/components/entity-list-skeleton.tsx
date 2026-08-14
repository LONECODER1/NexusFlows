export function EntityListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-[76px] animate-pulse rounded-xl border border-border/60 bg-muted/30"
        />
      ))}
    </div>
  );
}
