import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { Link } from 'react-router-dom'
import { db } from '../../services/firebase'
import { useAuth } from '../../hooks/useAuth'
import NavComprador from '../../components/ui/NavComprador'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function ListaTiendas() {
  const { user } = useAuth()
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

  const nombre = user?.displayName || 'bienvenido'

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      <NavComprador />

      {/* Hero banner */}
      <div className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <p className="text-orange-100 text-sm font-medium mb-1">Hola 👋</p>
          <h1 className="text-2xl font-extrabold tracking-tight mb-1">
            ¿Qué querés comer hoy?
          </h1>
          <p className="text-orange-100 text-sm">
            {tiendas.length > 0
              ? `${tiendas.length} tienda${tiendas.length > 1 ? 's' : ''} disponible${tiendas.length > 1 ? 's' : ''}`
              : 'Explorá nuestras tiendas'}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {tiendas.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏪</div>
            <p className="text-gray-500 font-semibold mb-1">Sin tiendas disponibles</p>
            <p className="text-gray-400 text-sm">Volvé más tarde, pronto habrá novedades.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {tiendas.map((t) => (
              <Link
                key={t.id}
                to={`/tiendas/${t.id}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md hover:border-orange-100 active:scale-[0.98] transition-all"
              >
                {t.foto ? (
                  <img
                    src={t.foto}
                    alt={t.nombreTienda}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-sm">
                    {t.nombreTienda?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-800 text-base">{t.nombreTienda}</p>
                  {t.descripcion ? (
                    <p className="text-sm text-gray-400 truncate mt-0.5">{t.descripcion}</p>
                  ) : (
                    <p className="text-xs text-orange-400 font-medium mt-0.5">Ver menú →</p>
                  )}
                </div>
                <span className="text-gray-300 text-xl flex-shrink-0">›</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

