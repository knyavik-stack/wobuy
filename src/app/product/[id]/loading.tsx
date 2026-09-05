export default function ProductLoading() {
  return (
    <main className="min-h-screen bg-[#0D0F14] px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl animate-pulse space-y-6">
        <div className="h-6 w-40 rounded bg-white/10" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="min-h-[360px] rounded-3xl bg-white/5" />
          <div className="min-h-[360px] rounded-3xl bg-white/5" />
        </div>
        <div className="h-48 rounded-2xl bg-white/5" />
      </div>
    </main>
  );
}
