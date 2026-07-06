import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { useCart } from '../../hooks/useCart'
import NavComprador from '../../components/ui/NavComprador'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function DetalleTienda() {
  const { uid } = useParams()
  const { addItem, cart } = useCart()

  const [tienda, setTienda] = useState(null)
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [agregados, setAgregados] = useState({})

  useEffect(() => {
    let tiendaCargada = false
    let productosCargados = false

    const checkDone = () => {
      if (tiendaCargada && productosCargados) setCargando(false)
    }

    const unsubTienda = onSnapshot(doc(db, 'tiendas', uid), (snap) => {
      setTienda(snap.exists() ? { id: snap.id, ...snap.data() } : null)
      tiendaCargada = true
      checkDone()
    })

    const q = query(
      collection(db, 'productos'),
      where('uidTienda', '==', uid),
      where('disponible', '==', true)
    )
    const unsubProductos = onSnapshot(q, (snap) => {
      setProductos(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      productosCargados = true
      checkDone()
    })

    return () => {
      unsubTienda()
      unsubProductos()
    }
  }, [uid])

  function handleAgregar(producto) {
    if (!tienda) return
    addItem(
      {
        productoId: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        foto: producto.foto ?? null,
      },
      { uid: tienda.id, nombreTienda: tienda.nombreTienda }
    )
    setAgregados((prev) => ({ ...prev, [producto.id]: true }))
    setTimeout(() => setAgregados((prev) => ({ ...prev, [producto.id]: false })), 800)
  }

  const cantidadEnCarrito = (productoId) =>
    cart.items.find((i) => i.productoId === productoId)?.cantidad ?? 0

  if (cargando) return <LoadingSpinner />

  if (!tienda) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 bg-gray-50">
        <div className="text-5xl">🏪</div>
        <p className="text-gray-500 font-semibold">Tienda no encontrada.</p>
        <Link to="/tiendas" className="text-sm text-orange-500 hover:underline font-medium">
          ← Volver a tiendas
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      <NavComprador />

      {/* Header de tienda */}
      <div className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-4 pt-5 pb-8">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link to="/tiendas" className="text-orange-100 hover:text-white text-lg mr-1">
            ←
          </Link>
          {tienda.foto ? (
            <img
              src={tienda.foto}
              alt={tienda.nombreTienda}
              className="w-14 h-14 rounded-xl object-cover shadow-md border-2 border-white/30"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white font-extrabold text-2xl shadow-md">
              {tienda.nombreTienda?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div>
            <h1 className="font-extrabold text-xl tracking-tight">{tienda.nombreTienda}</h1>
            {tienda.descripcion ? (
              <p className="text-orange-100 text-sm">{tienda.descripcion}</p>
            ) : (
              <p className="text-orange-200 text-xs">{productos.length} productos disponibles</p>
            )}
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className="max-w-2xl mx-auto px-4 -mt-4">
        {productos.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="text-5xl mb-3">🍽️</div>
            <p className="text-gray-500 font-semibold">Sin productos disponibles</p>
            <p className="text-gray-400 text-sm mt-1">Esta tienda aún no tiene productos.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {productos.map((p) => {
              const enCarrito = cantidadEnCarrito(p.id)
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-4 hover:shadow-md transition-shadow"
                >
                  {p.foto ? (
                    <img
                      src={p.foto}
                      alt={p.nombre}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center text-3xl flex-shrink-0">
                      🍴
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm">{p.nombre}</p>
                    {p.descripcion && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">{p.descripcion}</p>
                    )}
                    <p className="text-orange-500 font-extrabold text-base mt-1">
                      ${p.precio.toLocaleString('es-AR')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {enCarrito > 0 && (
                      <span className="text-xs text-orange-600 font-bold bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                        ×{enCarrito}
                      </span>
                    )}
                    <button
                      onClick={() => handleAgregar(p)}
                      className={`w-10 h-10 rounded-full text-lg font-bold transition-all flex items-center justify-center shadow-sm ${
                        agregados[p.id]
                          ? 'bg-green-500 text-white scale-95'
                          : 'bg-gradient-to-br from-orange-500 to-rose-500 hover:opacity-90 text-white'
                      }`}
                    >
                      {agregados[p.id] ? '✓' : '+'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
