import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { useAuth } from '../../hooks/useAuth'
import { logoutUser } from '../../services/auth'
import { db } from '../../services/firebase'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function PerfilVendedor() {
  const { user } = useAuth()
  const [tienda, setTienda] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsub = onSnapshot(doc(db, 'tiendas', user.uid), (snap) => {
      setTienda(snap.exists() ? snap.data() : null)
      setCargando(false)
    })
    return unsub
  }, [user])

  async function handleLogout() {
    await logoutUser()
  }

  if (cargando) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-4 mb-6">
          {tienda?.foto ? (
            <img
              src={tienda.foto}
              alt="Logo tienda"
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xl font-bold">
              {tienda?.nombreTienda?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {tienda?.nombreTienda ?? 'Mi Tienda'}
            </h1>
            <p className="text-sm text-orange-600 font-medium">Vendedor</p>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Email</p>
            <p className="text-sm text-gray-700">{user?.email ?? '—'}</p>
          </div>
          {tienda?.descripcion && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Descripción</p>
              <p className="text-sm text-gray-700">{tienda.descripcion}</p>
            </div>
          )}
          {tienda === null && (
            <p className="text-sm text-gray-400 italic">
              Aún no tenés una tienda registrada.
            </p>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
