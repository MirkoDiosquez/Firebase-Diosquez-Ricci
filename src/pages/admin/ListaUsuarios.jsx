import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { Link } from 'react-router-dom'
import { db } from '../../services/firebase'
import { logoutUser } from '../../services/auth'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'usuarios'), where('rol', '!=', 'admin'))
    const unsub = onSnapshot(q, (snap) => {
      setUsuarios(snap.docs.map((d) => d.data()))
      setCargando(false)
    })
    return unsub
  }, [])

  if (cargando) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Panel Admin</h1>
          <button
            onClick={logoutUser}
            className="text-sm text-red-500 hover:text-red-700 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Nav tabs */}
        <div className="flex gap-2 mb-6">
          <span className="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-semibold">
            Usuarios
          </span>
          <Link
            to="/admin/tiendas"
            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
          >
            Tiendas
          </Link>
        </div>

        {/* Lista */}
        {usuarios.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No hay usuarios registrados.</p>
        ) : (
          <div className="space-y-3">
            {usuarios.map((u) => (
              <div
                key={u.uid}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                      u.rol === 'vendedor'
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-purple-100 text-purple-600'
                    }`}
                  >
                    {u.nombre?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{u.nombre}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      u.rol === 'vendedor'
                        ? 'bg-orange-50 text-orange-600'
                        : 'bg-purple-50 text-purple-600'
                    }`}
                  >
                    {u.rol}
                  </span>
                  <Link
                    to={`/admin/usuarios/${u.uid}`}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    Ver →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
