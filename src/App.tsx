export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 font-bold text-xl border border-indigo-500/20">
          FE
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Frontend Dashboard</h1>
        <p className="text-sm text-slate-400">
          Setup React + TypeScript + Vite + Tailwind CSS berhasil disiapkan.
        </p>
        <div className="pt-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Ready for Development
          </span>
        </div>
      </div>
    </div>
  )
}
