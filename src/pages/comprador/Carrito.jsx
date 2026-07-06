import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useNavigate, Link } from 'react-router-dom'
import { db } from '../../services/firebase'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'
import NavComprador from '../../components/ui/NavComprador'

export default function Carrito() {
  const { user } = useAuth()
  const { cart, removeItem, updateQuantity, clearCart, total } = useCart()
  const navigate = useNavigate()
  const [confirmando, setConfirmando] = useState(false)
  const [error, setError] = useState(null)

  async function handleConfirmar() {
    if (cart.items.length === 0) return
    setConfirmando(true)
    setError(null)
    try {
      const ref = await addDoc(collection(db, 'pedidos'), {
        uidComprador: user.uid,
        uidVendedor: cart.uidTienda,
        nombreTienda: cart.nombreTienda,
        items: cart.items.map((i) => ({
          productoId: i.productoId,
          nombre: i.nombre,
          precio: i.precio,
          cantidad: i.cantidad,
          subtotal: i.precio * i.cantidad,
        })),
        total,
        estado: 'pendiente',
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
      })
      clearCart()
      navigate('/mis-pedidos')
    } catch {
      setError('No se pudo crear el pedido. Intentá de nuevo.')
      setConfirmando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComprador />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Tu carrito</h1>

        {cart.items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🛒</p>
            <p className="text-gray-400 text-sm mb-4">El carrito está vacío.</p>
            <Link to="/tiendas" className="text-sm text-purple-600 hover:underline">
              Explorar tiendas →
            </Link>
          </div>
        ) : (
          <>
            {/* Nombre de tienda */}
            <p className="text-sm text-gray-400 mb-3">
              Pedido a{' '}
              <span className="font-semibold text-gray-700">{cart.nombreTienda}</span>
            </p>

            {/* Ítems */}
            <div className="space-y-3 mb-6">
              {cart.items.map((item) => (
                <div
                  key={item.productoId}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4"
                >
                  {item.foto ? (
                    <img
                      src={item.foto}
                      alt={item.nombre}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                      🍴
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{item.nombre}</p>
                    <p className="text-xs text-purple-700 font-bold">
                      ${item.precio.toLocaleString('es-AR')}
                    </p>
                  </div>

                  {/* Controles de cantidad */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productoId, item.cantidad - 1)}
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-base flex items-center justify-center transition-colors"
                    >
                      −
                    </button>
                    <span className="text-sm font-semibold text-gray-800 w-4 text-center">
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productoId, item.cantidad + 1)}
                      className="w-7 h-7 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold text-base flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-800">
                      ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                    </p>
                    <button
                      onClick={() => removeItem(item.productoId)}
                      className="text-xs text-red-400 hover:text-red-600 mt-0.5 transition-colors"
                    >
                      quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total + confirmar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500">Total</span>
                <span className="text-xl font-bold text-gray-800">
                  ${total.toLocaleString('es-AR')}
                </span>
              </div>

              {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

              <button
                onClick={handleConfirmar}
                disabled={confirmando}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {confirmando ? 'Enviando pedido…' : 'Confirmar pedido'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
