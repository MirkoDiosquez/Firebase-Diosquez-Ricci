import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { Link } from 'react-router-dom'
import { db } from '../../services/firebase'
import NavComprador from '../../components/ui/NavComprador'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function ListaTiendas() {
  const [tiendas, setTiendas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'tiendas'), where('activo', '==', true))
    const unsub = onSnapshot(q, (snap) => {
      setTiendas(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setCargando(false)
    })
    return unsub
  }, [])

  if (cargando) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComprador />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Tiendas</h1>

        {tiendas.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">🏪</p>
            <p className="text-sm">No hay tiendas disponibles por el momento.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tiendas.map((t) => (
              <Link
                key={t.id}
                to={`/tiendas/${t.id}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:border-purple-100 transition-all"
              >
                {t.foto ? (
                  <img
                    src={t.foto}
                    alt={t.nombreTienda}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 text-2xl font-bold flex-shrink-0">
                    {t.nombreTienda?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 text-base">{t.nombreTienda}</p>
                  {t.descripcion && (
                    <p className="text-sm text-gray-400 truncate mt-0.5">{t.descripcion}</p>
                  )}
                </div>
                <span className="ml-auto text-gray-300 text-lg">›</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
