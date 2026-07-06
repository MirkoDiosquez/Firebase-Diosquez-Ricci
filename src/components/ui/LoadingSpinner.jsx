export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4">
      <div className="text-4xl animate-bounce">🍔</div>
      <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-400 font-medium">Cargando…</p>
    </div>
  )
}

