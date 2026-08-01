export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-3 py-6 sm:px-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando...</span>

      <div className="mb-4 flex gap-2">
        <div className="h-9 w-24 rounded-full bg-ink-light" />
        <div className="h-9 w-24 rounded-full bg-ink-light" />
      </div>

      <div className="mb-4 h-8 w-56 rounded-full bg-ink-light" />

      <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="h-10 w-10 rounded-lg bg-ink-light" />
        <div className="h-10 w-10 rounded-lg bg-ink-light" />
        <div className="h-10 w-16 rounded-lg bg-ink-light" />
        <div className="ml-auto h-10 w-40 rounded-lg bg-ink-light" />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-ink-light" />
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-ink-light" />
        ))}
      </div>
    </div>
  );
}
