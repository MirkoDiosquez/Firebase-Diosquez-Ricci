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
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <p className="text-gray-400">Tienda no encontrada.</p>
        <Link to="/tiendas" className="text-sm text-purple-600 hover:underline">
          ← Volver
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComprador />

      {/* Header de tienda */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-5 flex items-center gap-4">
          <Link to="/tiendas" className="text-gray-400 hover:text-gray-600 text-sm mr-1">
            ←
          </Link>
          {tienda.foto ? (
            <img
              src={tienda.foto}
              alt={tienda.nombreTienda}
              className="w-12 h-12 rounded-xl object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
              {tienda.nombreTienda?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div>
            <h1 className="font-bold text-gray-800 text-lg">{tienda.nombreTienda}</h1>
            {tienda.descripcion && (
              <p className="text-xs text-gray-400">{tienda.descripcion}</p>
            )}
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {productos.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="text-sm">Esta tienda no tiene productos disponibles aún.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {productos.map((p) => {
              const enCarrito = cantidadEnCarrito(p.id)
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4"
                >
                  {p.foto ? (
                    <img
                      src={p.foto}
                      alt={p.nombre}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-2xl flex-shrink-0">
                      🍴
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{p.nombre}</p>
                    {p.descripcion && (
                      <p className="text-xs text-gray-400 truncate">{p.descripcion}</p>
                    )}
                    <p className="text-purple-700 font-bold text-sm mt-1">
                      ${p.precio.toLocaleString('es-AR')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {enCarrito > 0 && (
                      <span className="text-xs text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-full">
                        ×{enCarrito}
                      </span>
                    )}
                    <button
                      onClick={() => handleAgregar(p)}
                      className={`w-9 h-9 rounded-full text-lg font-bold transition-all flex items-center justify-center ${
                        agregados[p.id]
                          ? 'bg-green-500 text-white scale-95'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
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
