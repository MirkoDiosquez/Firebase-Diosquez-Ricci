import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { doc, onSnapshot, deleteDoc } from 'firebase/firestore'
import { db } from '../../services/firebase'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function DetalleUsuario() {
  const { uid } = useParams()
  const navigate = useNavigate()
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [eliminando, setEliminando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'usuarios', uid), (snap) => {
      setPerfil(snap.exists() ? snap.data() : null)
      setCargando(false)
    })
    return unsub
  }, [uid])

  async function handleEliminar() {
    if (!confirm(`¿Eliminar la cuenta de "${perfil?.nombre}"? Esta acción no se puede deshacer.`)) return
    setEliminando(true)
    setError(null)
    try {
      await deleteDoc(doc(db, 'usuarios', uid))
      navigate('/admin/usuarios')
    } catch {
      setError('No se pudo eliminar. Verificá los permisos en Firestore.')
      setEliminando(false)
    }
  }

  if (cargando) return <LoadingSpinner />

  if (!perfil) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-gray-500 text-sm">Usuario no encontrado.</p>
        <Link to="/admin/usuarios" className="text-sm text-indigo-600 hover:underline">
          ← Volver a lista
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <Link to="/admin/usuarios" className="text-sm text-indigo-600 hover:underline block mb-6">
          ← Volver a lista
        </Link>

        {/* Avatar + header */}
        <div className="flex items-center gap-4 mb-6">
          {perfil.foto ? (
            <img src={perfil.foto} alt="Foto" className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold ${
                perfil.rol === 'vendedor'
                  ? 'bg-orange-100 text-orange-600'
                  : 'bg-purple-100 text-purple-600'
              }`}
            >
              {perfil.nombre?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-800">{perfil.nombre}</h1>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                perfil.rol === 'vendedor'
                  ? 'bg-orange-50 text-orange-600'
                  : 'bg-purple-50 text-purple-600'
              }`}
            >
              {perfil.rol}
            </span>
          </div>
        </div>

        {/* Campos */}
        <div className="space-y-3 mb-8">
          {[
            ['Email', perfil.email, false],
            ['Nombre', perfil.nombre, false],
            ['UID', perfil.uid, true],
            ['Rol', perfil.rol, false],
          ].map(([label, value, mono]) => (
            <div key={label}>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
              <p className={`text-sm text-gray-700 ${mono ? 'font-mono text-xs break-all' : ''}`}>
                {value ?? '—'}
              </p>
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        {/* FR-017: botón eliminar solo visible para compradores */}
        {perfil.rol === 'comprador' && (
          <button
            onClick={handleEliminar}
            disabled={eliminando}
            className="w-full py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {eliminando ? 'Eliminando…' : 'Eliminar cuenta'}
          </button>
        )}

        {perfil.rol === 'vendedor' && (
          <p className="text-xs text-gray-400 italic text-center">
            Para eliminar un vendedor usá la sección{' '}
            <Link to="/admin/tiendas" className="text-indigo-500 hover:underline">Tiendas</Link>.
          </p>
        )}
      </div>
    </div>
  )
}
