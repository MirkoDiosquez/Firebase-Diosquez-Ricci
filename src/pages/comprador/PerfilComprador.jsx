import { useAuth } from '../../hooks/useAuth'
import { logoutUser } from '../../services/auth'

export default function PerfilComprador() {
  const { user } = useAuth()

  async function handleLogout() {
    await logoutUser()
    // AuthContext detecta onAuthStateChanged con user=null → redirige a /login
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xl font-bold">
            {user?.displayName?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Mi perfil</h1>
            <p className="text-sm text-purple-600 font-medium">Comprador</p>
          </div>
        </div>

        {/* Datos */}
        <div className="space-y-3 mb-8">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Email</p>
            <p className="text-sm text-gray-700">{user?.email ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">UID</p>
            <p className="text-xs text-gray-400 font-mono break-all">{user?.uid ?? '—'}</p>
          </div>
        </div>

        {/* Acciones */}
        <button
          onClick={handleLogout}
          className="w-full border border-red-300 text-red-500 hover:bg-red-50 font-medium py-2 rounded-lg transition-colors text-sm"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

