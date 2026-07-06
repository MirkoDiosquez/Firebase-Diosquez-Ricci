import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { useAuth } from '../../hooks/useAuth'
import NavComprador from '../../components/ui/NavComprador'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const ESTADO_BADGE = {
  pendiente:  'bg-yellow-50 text-yellow-700',
  confirmado: 'bg-blue-50 text-blue-700',
  en_camino:  'bg-indigo-50 text-indigo-700',
  entregado:  'bg-green-50 text-green-700',
  cancelado:  'bg-red-50 text-red-500',
}

const ESTADO_LABEL = {
  pendiente:  'Pendiente',
  confirmado: 'Confirmado',
  en_camino:  'En camino',
  entregado:  'Entregado',
  cancelado:  'Cancelado',
}

export default function MisPedidos() {
  const { user } = useAuth()
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'pedidos'),
      where('uidComprador', '==', user.uid),
      orderBy('fechaCreacion', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setPedidos(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setCargando(false)
    })
    return unsub
  }, [user])

  if (cargando) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComprador />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Mis pedidos</h1>

        {pedidos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">📋</p>
            <p className="text-gray-400 text-sm">Todavía no realizaste ningún pedido.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4"
              >
                {/* Header del pedido */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{p.nombreTienda}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {p.fechaCreacion?.toDate
                        ? p.fechaCreacion.toDate().toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      ESTADO_BADGE[p.estado] ?? 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {ESTADO_LABEL[p.estado] ?? p.estado}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-1 mb-3">
                  {p.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs text-gray-600">
                      <span>
                        {item.cantidad}× {item.nombre}
                      </span>
                      <span>${item.subtotal?.toLocaleString('es-AR') ?? '—'}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                  <span className="text-xs text-gray-400">Total</span>
                  <span className="font-bold text-gray-800 text-sm">
                    ${p.total?.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
