import { useEffect, useState } from 'react'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { useAuth } from '../../hooks/useAuth'
import { logoutUser } from '../../services/auth'
import { db } from '../../services/firebase'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import PerfilForm from '../../components/forms/PerfilForm'
import NavVendedor from '../../components/ui/NavVendedor'

export default function PerfilVendedor() {
  const { user } = useAuth()
  const [tienda, setTienda] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorGuardar, setErrorGuardar] = useState(null)

  useEffect(() => {
    if (!user) return
    const unsub = onSnapshot(doc(db, 'tiendas', user.uid), (snap) => {
      setTienda(snap.exists() ? snap.data() : null)
      setCargando(false)
    })
    return unsub
  }, [user])

  async function handleLogout() {
    await logoutUser()
  }

  async function handleGuardar(datos) {
    setGuardando(true)
    setErrorGuardar(null)
    try {
      // datos: { nombreTienda, descripcion, foto } — uidVendedor NUNCA se modifica
      await updateDoc(doc(db, 'tiendas', user.uid), datos)
      setEditando(false)
    } catch {
      setErrorGuardar('No se pudo guardar. Intentá de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      <NavVendedor />

      {/* Hero */}
      <div className="bg-gradient-to-r from-orange-500 to-rose-500 px-4 pt-6 pb-14">
        <div className="max-w-md mx-auto flex items-center gap-4">
          {tienda?.foto ? (
            <img
              src={tienda.foto}
              alt="Logo tienda"
              className="w-16 h-16 rounded-xl object-cover border-2 border-white/40 shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl font-extrabold shadow-md">
              {tienda?.nombreTienda?.[0]?.toUpperCase() ?? '🏪'}
            </div>
          )}
          <div className="text-white">
            <h1 className="text-xl font-extrabold">
              {tienda?.nombreTienda ?? 'Mi Tienda'}
            </h1>
            <span className="text-xs bg-white/20 text-white/90 px-2 py-0.5 rounded-full font-medium">
              Vendedor
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          {editando ? (
            <>
              <h2 className="text-sm font-bold text-gray-700 mb-4">Editar tienda</h2>
              <PerfilForm
                modo="vendedor"
                initialValues={{
                  nombreTienda: tienda?.nombreTienda ?? '',
                  descripcion: tienda?.descripcion ?? '',
                  foto: tienda?.foto ?? '',
                }}
                onSubmit={handleGuardar}
                loading={guardando}
                error={errorGuardar}
              />
              <button
                onClick={() => { setEditando(false); setErrorGuardar(null) }}
                className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              {/* Datos de solo lectura */}
              <div className="space-y-4 mb-5">
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Email</p>
                  <p className="text-sm font-medium text-gray-700">{user?.email ?? '—'}</p>
                </div>
                {tienda?.descripcion ? (
                  <div className="bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Descripción</p>
                    <p className="text-sm font-medium text-gray-700">{tienda.descripcion}</p>
                  </div>
                ) : tienda === null ? (
                  <p className="text-sm text-gray-400 italic text-center py-2">
                    Aún no tenés una tienda registrada.
                  </p>
                ) : null}
              </div>

              <button
                onClick={() => setEditando(true)}
                disabled={tienda === null}
                className="w-full mb-3 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Editar tienda
              </button>
              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl bg-gray-50 text-gray-500 text-sm font-semibold hover:bg-gray-100 transition-colors border border-gray-200"
              >
                Cerrar sesión
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
