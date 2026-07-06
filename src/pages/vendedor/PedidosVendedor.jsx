import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { useAuth } from '../../hooks/useAuth'
import NavVendedor from '../../components/ui/NavVendedor'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const ESTADOS = ['pendiente', 'confirmado', 'en_camino', 'entregado', 'cancelado']

const ESTADO_BADGE = {
  pendiente:  'bg-yellow-50 text-yellow-700 border border-yellow-200',
  confirmado: 'bg-blue-50 text-blue-700 border border-blue-200',
  en_camino:  'bg-indigo-50 text-indigo-700 border border-indigo-200',
  entregado:  'bg-green-50 text-green-700 border border-green-200',
  cancelado:  'bg-red-50 text-red-500 border border-red-200',
}

const ESTADO_COLOR = {
  pendiente:  'bg-yellow-400',
  confirmado: 'bg-blue-400',
  en_camino:  'bg-indigo-500',
  entregado:  'bg-green-500',
  cancelado:  'bg-red-400',
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

export default function PedidosVendedor() {
  const { user } = useAuth()
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [actualizandoId, setActualizandoId] = useState(null)

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'pedidos'),
      where('uidVendedor', '==', user.uid),
      orderBy('fechaCreacion', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setPedidos(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setCargando(false)
    })
    return unsub
  }, [user])

  async function handleEstado(pedidoId, nuevoEstado) {
    setActualizandoId(pedidoId)
    try {
      await updateDoc(doc(db, 'pedidos', pedidoId), {
        estado: nuevoEstado,
        fechaActualizacion: serverTimestamp(),
      })
    } catch {
      alert('No se pudo actualizar el estado.')
    } finally {
      setActualizandoId(null)
    }
  }

  if (cargando) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      <NavVendedor />

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-extrabold tracking-tight">Pedidos recibidos 📦</h1>
          <p className="text-orange-100 text-sm mt-1">
            {pedidos.length > 0
              ? `${pedidos.length} pedido${pedidos.length > 1 ? 's' : ''}`
              : 'Aún no recibiste pedidos'}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {pedidos.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-5xl mb-3">📦</div>
            <p className="text-gray-600 font-semibold mb-1">Sin pedidos aún</p>
            <p className="text-gray-400 text-sm">Cuando lleguen, aparecerán acá.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pedidos.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Franja de color */}
                <div className={`h-1 w-full ${ESTADO_COLOR[p.estado] ?? 'bg-gray-300'}`} />
                <div className="px-4 py-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${
                          ESTADO_BADGE[p.estado] ?? 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {ESTADO_EMOJI[p.estado] ?? ''} {ESTADO_LABEL[p.estado] ?? p.estado}
                      </span>
                      <p className="text-xs text-gray-400 mt-1.5">
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
                    <span className="font-extrabold text-gray-800 text-lg">
                      ${p.total?.toLocaleString('es-AR')}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-1 mb-3 bg-gray-50 rounded-xl px-3 py-2">
                    {p.items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs text-gray-600">
                        <span>
                          <span className="font-semibold text-gray-700">{item.cantidad}×</span>{' '}
                          {item.nombre}
                        </span>
                        <span className="font-semibold text-gray-700">
                          ${item.subtotal?.toLocaleString('es-AR') ?? '—'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Botones de estado */}
                  {p.estado !== 'entregado' && p.estado !== 'cancelado' && (
                    <div className="flex gap-2 flex-wrap pt-3 border-t border-gray-100">
                      {ESTADOS.filter((e) => e !== p.estado).map((estado) => (
                        <button
                          key={estado}
                          onClick={() => handleEstado(p.id, estado)}
                          disabled={actualizandoId === p.id}
                          className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors disabled:opacity-40 ${
                            estado === 'cancelado'
                              ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                              : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
                          }`}
                        >
                          {actualizandoId === p.id ? '…' : `→ ${ESTADO_LABEL[estado]}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
