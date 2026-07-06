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
    <div className="min-h-screen bg-gray-50">
      <NavComprador />
      <div className="px-4 py-10">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {/* Avatar + header */}
        <div className="flex items-center gap-4 mb-6">
          {perfil?.foto ? (
            <img
              src={perfil.foto}
              alt="Foto de perfil"
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xl font-bold">
              {perfil?.nombre?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {perfil?.nombre ?? 'Mi perfil'}
            </h1>
            <p className="text-sm text-purple-600 font-medium">Comprador</p>
          </div>
        </div>

        {editando ? (
          <>
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
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Email</p>
                <p className="text-sm text-gray-700">{user?.email ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Nombre</p>
                <p className="text-sm text-gray-700">{perfil?.nombre ?? '—'}</p>
              </div>
            </div>

            <button
              onClick={() => setEditando(true)}
              className="w-full mb-3 py-2.5 rounded-xl bg-purple-50 text-purple-700 text-sm font-semibold hover:bg-purple-100 transition-colors"
            >
              Editar perfil
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors"
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

