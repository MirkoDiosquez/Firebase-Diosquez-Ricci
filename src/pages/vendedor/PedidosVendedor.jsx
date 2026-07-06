import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { useAuth } from '../../hooks/useAuth'
import NavVendedor from '../../components/ui/NavVendedor'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const ESTADOS = ['pendiente', 'confirmado', 'en_camino', 'entregado', 'cancelado']

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
    <div className="min-h-screen bg-gray-50">
      <NavVendedor />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Pedidos recibidos</h1>

        {pedidos.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-sm">No tenés pedidos aún.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        ESTADO_BADGE[p.estado] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {ESTADO_LABEL[p.estado] ?? p.estado}
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
                  <span className="font-bold text-gray-800 text-sm">
                    ${p.total?.toLocaleString('es-AR')}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-1 mb-4">
                  {p.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs text-gray-600">
                      <span>
                        {item.cantidad}× {item.nombre}
                      </span>
                      <span>${item.subtotal?.toLocaleString('es-AR') ?? '—'}</span>
                    </div>
                  ))}
                </div>

                {/* Actualizar estado */}
                {p.estado !== 'entregado' && p.estado !== 'cancelado' && (
                  <div className="flex gap-2 flex-wrap pt-3 border-t border-gray-50">
                    {ESTADOS.filter((e) => e !== p.estado).map((estado) => (
                      <button
                        key={estado}
                        onClick={() => handleEstado(p.id, estado)}
                        disabled={actualizandoId === p.id}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-40 ${
                          estado === 'cancelado'
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                        }`}
                      >
                        {actualizandoId === p.id ? '…' : `→ ${ESTADO_LABEL[estado]}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
