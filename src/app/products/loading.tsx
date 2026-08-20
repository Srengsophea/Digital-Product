export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-white/5" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-white/5">
            <div className="aspect-[16/10] animate-pulse bg-white/5" />
            <div className="space-y-3 p-5">
              <div className="h-4 w-3/4 animate-pulse rounded bg-white/5" />
              <div className="h-3 w-full animate-pulse rounded bg-white/5" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
