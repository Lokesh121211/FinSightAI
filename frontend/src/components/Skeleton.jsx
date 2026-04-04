export function SkeletonCard() {
  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-slate-700 rounded w-24"></div>
        <div className="w-9 h-9 bg-slate-700 rounded-lg"></div>
      </div>
      <div className="h-8 bg-slate-700 rounded w-32 mb-2"></div>
      <div className="h-3 bg-slate-700 rounded w-20"></div>
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-slate-700">
        <div className="h-4 bg-slate-700 rounded w-48"></div>
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-700">
          <div className="h-4 bg-slate-700 rounded w-24"></div>
          <div className="h-4 bg-slate-700 rounded flex-1"></div>
          <div className="h-4 bg-slate-700 rounded w-20"></div>
          <div className="h-4 bg-slate-700 rounded w-16"></div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 animate-pulse">
      <div className="h-5 bg-slate-700 rounded w-40 mb-6"></div>
      <div className="h-64 bg-slate-700 rounded"></div>
    </div>
  )
}