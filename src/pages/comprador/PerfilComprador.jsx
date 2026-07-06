import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { useAuth } from '../../hooks/useAuth'
import { logoutUser } from '../../services/auth'
import { updateUsuario } from '../../services/usuarios'
import { db } from '../../services/firebase'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import PerfilForm from '../../components/forms/PerfilForm'
import NavComprador from '../../components/ui/NavComprador'

export default function PerfilComprador() {
  const { user } = useAuth()
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorGuardar, setErrorGuardar] = useState(null)

  useEffect(() => {
    if (!user) return
    const unsub = onSnapshot(doc(db, 'usuarios', user.uid), (snap) => {
      setPerfil(snap.exists() ? snap.data() : null)
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
      // updateUsuario elimina rol/email/fechaRegistro del payload internamente (FR-025)
      await updateUsuario(user.uid, datos)
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
      <NavComprador />

      {/* Hero */}
      <div className="bg-gradient-to-r from-orange-500 to-rose-500 px-4 pt-6 pb-14">
        <div className="max-w-md mx-auto flex items-center gap-4">
          {perfil?.foto ? (
            <img
              src={perfil.foto}
              alt="Foto de perfil"
              className="w-16 h-16 rounded-full object-cover border-2 border-white/40 shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl font-extrabold shadow-md">
              {perfil?.nombre?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div className="text-white">
            <h1 className="text-xl font-extrabold">
              {perfil?.nombre ?? 'Mi perfil'}
            </h1>
            <span className="text-xs bg-white/20 text-white/90 px-2 py-0.5 rounded-full font-medium">
              Comprador
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          {editando ? (
            <>
              <h2 className="text-sm font-bold text-gray-700 mb-4">Editar perfil</h2>
              <PerfilForm
                modo="comprador"
                initialValues={{ nombre: perfil?.nombre ?? '', foto: perfil?.foto ?? '' }}
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
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Nombre</p>
                  <p className="text-sm font-medium text-gray-700">{perfil?.nombre ?? '—'}</p>
                </div>
              </div>

              <button
                onClick={() => setEditando(true)}
                className="w-full mb-3 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white text-sm font-bold hover:opacity-90 transition-opacity"
              >
                Editar perfil
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

