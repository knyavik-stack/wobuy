export default function SearchLoading() {
  return (
    <main className="min-h-screen bg-[#0D0F14] px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-7xl animate-pulse space-y-6">
        <div className="h-8 w-56 rounded bg-white/10" />
        <div className="h-12 w-full rounded-2xl bg-white/5" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-32 rounded-2xl bg-white/5" />
          <div className="h-32 rounded-2xl bg-white/5" />
          <div className="h-32 rounded-2xl bg-white/5" />
        </div>
        <div className="h-64 rounded-2xl bg-white/5" />
      </div>
    </main>
  );
}
