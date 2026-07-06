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
    <div className="min-h-screen bg-gray-50 pb-4">
      <NavComprador />

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-extrabold tracking-tight">Tu carrito 🛒</h1>
          {cart.items.length > 0 && (
            <p className="text-orange-100 text-sm mt-1">
              Pedido a <span className="font-bold text-white">{cart.nombreTienda}</span>
            </p>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {cart.items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-600 font-semibold mb-1">Tu carrito está vacío</p>
            <p className="text-gray-400 text-sm mb-5">Agregá productos desde una tienda.</p>
            <Link
              to="/tiendas"
              className="inline-block bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Explorar tiendas →
            </Link>
          </div>
        ) : (
          <>
            {/* Ítems */}
            <div className="space-y-3 mb-4">
              {cart.items.map((item) => (
                <div
                  key={item.productoId}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3"
                >
                  {item.foto ? (
                    <img
                      src={item.foto}
                      alt={item.nombre}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-xl flex-shrink-0">
                      🍴
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm">{item.nombre}</p>
                    <p className="text-xs text-orange-500 font-semibold">
                      ${item.precio.toLocaleString('es-AR')} c/u
                    </p>
                  </div>

                  {/* Controles de cantidad */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQuantity(item.productoId, item.cantidad - 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-base flex items-center justify-center transition-colors"
                    >
                      −
                    </button>
                    <span className="text-sm font-bold text-gray-800 w-5 text-center">
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productoId, item.cantidad + 1)}
                      className="w-8 h-8 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 font-bold text-base flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right flex-shrink-0 ml-1">
                    <p className="text-sm font-extrabold text-gray-800">
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
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-500 text-sm">
                  {cart.items.reduce((s, i) => s + i.cantidad, 0)} ítems
                </span>
                <span className="text-2xl font-extrabold text-gray-800">
                  ${total.toLocaleString('es-AR')}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-4">Total del pedido</p>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2 mb-3">
                  ⚠ {error}
                </p>
              )}

              <button
                onClick={handleConfirmar}
                disabled={confirmando}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {confirmando ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Enviando pedido…
                  </>
                ) : (
                  'Confirmar pedido 🚀'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
