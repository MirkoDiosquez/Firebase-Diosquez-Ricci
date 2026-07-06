import { useEffect, useState } from 'react'
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { Link } from 'react-router-dom'
import { db, firebaseConfig } from '../../services/firebase'
import { logoutUser } from '../../services/auth'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const FORM_VACIO = {
  email: '',
  password: '',
  nombreTienda: '',
  descripcion: '',
  foto: '',
}

export default function GestionTiendas() {
  const [tiendas, setTiendas] = useState([])
  const [cargando, setCargando] = useState(true)

  // Estado modal "crear vendedor"
  const [modalAbierto, setModalAbierto] = useState(false)
  const [form, setForm] = useState(FORM_VACIO)
  const [creando, setCreando] = useState(false)
  const [errCrear, setErrCrear] = useState(null)

  // Estado edición inline
  const [editandoId, setEditandoId] = useState(null)
  const [editData, setEditData] = useState({})
  const [guardandoEdit, setGuardandoEdit] = useState(false)

  // Estado eliminación
  const [eliminandoId, setEliminandoId] = useState(null)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'tiendas'), (snap) => {
      setTiendas(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setCargando(false)
    })
    return unsub
  }, [])

  // ── Crear vendedor (Flujo 4 — app secundaria para no interrumpir la sesión del Admin) ──
  async function handleCrearVendedor(e) {
    e.preventDefault()
    setCreando(true)
    setErrCrear(null)

    const seedApp = initializeApp(firebaseConfig, `seed-${Date.now()}`)
    const seedAuth = getAuth(seedApp)

    try {
      const { email, password, nombreTienda, descripcion, foto } = form

      // Crear cuenta del vendedor en app secundaria (no cambia la sesión del Admin)
      const { user: vendorUser } = await createUserWithEmailAndPassword(
        seedAuth,
        email,
        password
      )
      const vendorUID = vendorUser.uid

      // Escribir documentos Firestore (autenticados con la sesión Admin del db principal)
      await setDoc(doc(db, 'usuarios', vendorUID), {
        uid:           vendorUID,
        email,
        nombre:        nombreTienda,
        rol:           'vendedor',
        foto:          foto.trim() || null,
        fechaRegistro: serverTimestamp(),
      })

      await setDoc(doc(db, 'tiendas', vendorUID), {
        uidVendedor:   vendorUID,
        nombreTienda,
        descripcion:   descripcion.trim() || null,
        foto:          foto.trim() || null,
        activo:        true,
        fechaCreacion: serverTimestamp(),
      })

      setModalAbierto(false)
      setForm(FORM_VACIO)
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setErrCrear('El email ya está registrado.')
      } else if (err.code === 'auth/weak-password') {
        setErrCrear('La contraseña debe tener al menos 6 caracteres.')
      } else {
        setErrCrear('Error al crear el vendedor. Intentá de nuevo.')
      }
    } finally {
      await deleteApp(seedApp)
      setCreando(false)
    }
  }

  // ── Guardar edición inline ──
  async function handleGuardarEdit(tienda) {
    setGuardandoEdit(true)
    try {
      await updateDoc(doc(db, 'tiendas', tienda.id), {
        nombreTienda: editData.nombreTienda?.trim() || tienda.nombreTienda,
        descripcion:  editData.descripcion?.trim()  || null,
        foto:         editData.foto?.trim()          || null,
      })
      setEditandoId(null)
    } catch {
      alert('No se pudo guardar. Verificá los permisos.')
    } finally {
      setGuardandoEdit(false)
    }
  }

  // ── Eliminar vendedor (borra usuarios/{uid} + tiendas/{uid}) ──
  async function handleEliminar(tienda) {
    if (
      !confirm(
        `¿Eliminar la tienda "${tienda.nombreTienda}" y la cuenta de su vendedor? Esta acción no se puede deshacer.`
      )
    )
      return
    setEliminandoId(tienda.id)
    try {
      await deleteDoc(doc(db, 'usuarios', tienda.id))
      await deleteDoc(doc(db, 'tiendas', tienda.id))
    } catch {
      alert('No se pudo eliminar. Verificá los permisos.')
    } finally {
      setEliminandoId(null)
    }
  }

  if (cargando) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Panel Admin</h1>
          <button
            onClick={logoutUser}
            className="text-sm text-red-500 hover:text-red-700 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Nav tabs */}
        <div className="flex gap-2 mb-6">
          <Link
            to="/admin/usuarios"
            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
          >
            Usuarios
          </Link>
          <span className="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-semibold">
            Tiendas
          </span>
        </div>

        {/* Barra de acciones */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => { setModalAbierto(true); setErrCrear(null) }}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
          >
            + Nuevo vendedor
          </button>
        </div>

        {/* Lista de tiendas */}
        {tiendas.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No hay tiendas registradas.</p>
        ) : (
          <div className="space-y-3">
            {tiendas.map((t) =>
              editandoId === t.id ? (
                /* ── Modo edición inline ── */
                <div
                  key={t.id}
                  className="bg-white rounded-xl border border-indigo-200 shadow-sm px-5 py-4 space-y-3"
                >
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Editando tienda
                  </p>
                  {[
                    ['Nombre de tienda', 'nombreTienda'],
                    ['Descripción', 'descripcion'],
                    ['Foto (URL)', 'foto'],
                  ].map(([label, field]) => (
                    <div key={field}>
                      <label className="text-xs text-gray-400 uppercase tracking-wide block mb-0.5">
                        {label}
                      </label>
                      <input
                        type="text"
                        value={editData[field] ?? ''}
                        onChange={(e) =>
                          setEditData((prev) => ({ ...prev, [field]: e.target.value }))
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>
                  ))}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleGuardarEdit(t)}
                      disabled={guardandoEdit}
                      className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-40"
                    >
                      {guardandoEdit ? 'Guardando…' : 'Guardar'}
                    </button>
                    <button
                      onClick={() => setEditandoId(null)}
                      className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Modo vista ── */
                <div
                  key={t.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {t.foto ? (
                      <img
                        src={t.foto}
                        alt="Logo"
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-sm font-bold">
                        {t.nombreTienda?.[0]?.toUpperCase() ?? '?'}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{t.nombreTienda}</p>
                      {t.descripcion && (
                        <p className="text-xs text-gray-400 truncate max-w-xs">{t.descripcion}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditandoId(t.id)
                        setEditData({
                          nombreTienda: t.nombreTienda ?? '',
                          descripcion:  t.descripcion  ?? '',
                          foto:         t.foto          ?? '',
                        })
                      }}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(t)}
                      disabled={eliminandoId === t.id}
                      className="text-xs text-red-500 hover:underline disabled:opacity-40"
                    >
                      {eliminandoId === t.id ? '…' : 'Eliminar'}
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* ── Modal: crear vendedor ── */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
            <h2 className="text-lg font-bold text-gray-800 mb-1">Nuevo vendedor</h2>
            <p className="text-xs text-gray-400 mb-5">
              Se creará la cuenta y la tienda en Firebase.
            </p>

            <form onSubmit={handleCrearVendedor} className="space-y-3">
              {[
                ['Email del vendedor *', 'email', 'email'],
                ['Contraseña (mín. 6 caracteres) *', 'password', 'password'],
                ['Nombre de tienda *', 'nombreTienda', 'text'],
                ['Descripción', 'descripcion', 'text'],
                ['Foto (URL)', 'foto', 'text'],
              ].map(([label, field, type]) => (
                <div key={field}>
                  <label className="text-xs text-gray-400 uppercase tracking-wide block mb-0.5">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={form[field]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
                    required={label.includes('*')}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              ))}

              {errCrear && <p className="text-sm text-red-500">{errCrear}</p>}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={
                    creando ||
                    !form.email ||
                    !form.password ||
                    !form.nombreTienda
                  }
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {creando ? 'Creando…' : 'Crear vendedor'}
                </button>
                <button
                  type="button"
                  onClick={() => { setModalAbierto(false); setErrCrear(null); setForm(FORM_VACIO) }}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
