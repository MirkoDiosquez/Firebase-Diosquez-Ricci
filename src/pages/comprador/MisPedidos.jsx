import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { useAuth } from '../../hooks/useAuth'
import NavComprador from '../../components/ui/NavComprador'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const ESTADO_BADGE = {
  pendiente:  'bg-yellow-50 text-yellow-700 border border-yellow-200',
  confirmado: 'bg-blue-50 text-blue-700 border border-blue-200',
  en_camino:  'bg-indigo-50 text-indigo-700 border border-indigo-200',
  entregado:  'bg-green-50 text-green-700 border border-green-200',
  cancelado:  'bg-red-50 text-red-500 border border-red-200',
}

const ESTADO_EMOJI = {
  pendiente:  '⏳',
  confirmado: '✅',
  en_camino:  '🚴',
  entregado:  '🎉',
  cancelado:  '❌',
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
    <div className="min-h-screen bg-gray-50 pb-4">
      <NavComprador />

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-extrabold tracking-tight">Mis pedidos 📋</h1>
          <p className="text-orange-100 text-sm mt-1">
            {pedidos.length > 0
              ? `${pedidos.length} pedido${pedidos.length > 1 ? 's' : ''} registrado${pedidos.length > 1 ? 's' : ''}`
              : 'Historial de tus compras'}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {pedidos.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-600 font-semibold mb-1">Sin pedidos aún</p>
            <p className="text-gray-400 text-sm">Realizá tu primer pedido y aparecerá acá.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pedidos.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Franja de color según estado */}
                <div
                  className={`h-1 w-full ${
                    p.estado === 'pendiente' ? 'bg-yellow-400' :
                    p.estado === 'confirmado' ? 'bg-blue-400' :
                    p.estado === 'en_camino' ? 'bg-indigo-500' :
                    p.estado === 'entregado' ? 'bg-green-500' :
                    'bg-red-400'
                  }`}
                />
                <div className="px-4 py-4">
                  {/* Header del pedido */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{p.nombreTienda}</p>
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
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                        ESTADO_BADGE[p.estado] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {ESTADO_EMOJI[p.estado] ?? ''} {ESTADO_LABEL[p.estado] ?? p.estado}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-1 mb-3">
                    {p.items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs text-gray-600">
                        <span className="text-gray-500">
                          <span className="font-semibold text-gray-700">{item.cantidad}×</span>{' '}
                          {item.nombre}
                        </span>
                        <span className="font-semibold text-gray-700">
                          ${item.subtotal?.toLocaleString('es-AR') ?? '—'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">Total</span>
                    <span className="font-extrabold text-gray-800 text-base">
                      ${p.total?.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
