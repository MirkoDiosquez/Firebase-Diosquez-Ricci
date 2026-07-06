import { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../../services/firebase'
import { useAuth } from '../../hooks/useAuth'
import NavVendedor from '../../components/ui/NavVendedor'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const FORM_VACIO = { nombre: '', descripcion: '', precio: '', foto: '' }

export default function GestionProductos() {
  const { user } = useAuth()
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)

  const [formAbierto, setFormAbierto] = useState(false)
  const [form, setForm] = useState(FORM_VACIO)
  const [guardando, setGuardando] = useState(false)
  const [errForm, setErrForm] = useState(null)

  const [editandoId, setEditandoId] = useState(null)
  const [editData, setEditData] = useState({})
  const [guardandoEdit, setGuardandoEdit] = useState(false)

  const [eliminandoId, setEliminandoId] = useState(null)

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'productos'), where('uidTienda', '==', user.uid))
    const unsub = onSnapshot(q, (snap) => {
      setProductos(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setCargando(false)
    })
    return unsub
  }, [user])

  async function handleCrear(e) {
    e.preventDefault()
    const precio = parseFloat(form.precio)
    if (!form.nombre.trim() || isNaN(precio) || precio <= 0) {
      setErrForm('Nombre y precio son requeridos.')
      return
    }
    setGuardando(true)
    setErrForm(null)
    try {
      const ref = await addDoc(collection(db, 'productos'), {
        uid: '',
        uidTienda: user.uid,
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
        precio,
        foto: form.foto.trim() || null,
        disponible: true,
        fechaCreacion: serverTimestamp(),
      })
      // actualizar uid con el ID del doc
      await updateDoc(ref, { uid: ref.id })
      setForm(FORM_VACIO)
      setFormAbierto(false)
    } catch {
      setErrForm('No se pudo guardar. Intentá de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  async function handleGuardarEdit(p) {
    setGuardandoEdit(true)
    try {
      const precio = parseFloat(editData.precio)
      await updateDoc(doc(db, 'productos', p.id), {
        nombre:      editData.nombre?.trim() || p.nombre,
        descripcion: editData.descripcion?.trim() || null,
        precio:      isNaN(precio) ? p.precio : precio,
        foto:        editData.foto?.trim() || null,
      })
      setEditandoId(null)
    } catch {
      alert('No se pudo guardar.')
    } finally {
      setGuardandoEdit(false)
    }
  }

  async function handleToggleDisponible(p) {
    await updateDoc(doc(db, 'productos', p.id), { disponible: !p.disponible })
  }

  async function handleEliminar(p) {
    if (!confirm(`¿Eliminar "${p.nombre}"?`)) return
    setEliminandoId(p.id)
    try {
      await deleteDoc(doc(db, 'productos', p.id))
    } catch {
      alert('No se pudo eliminar.')
    } finally {
      setEliminandoId(null)
    }
  }

  if (cargando) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      <NavVendedor />

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-4 py-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Mis productos</h1>
            <p className="text-orange-100 text-sm mt-1">
              {productos.length > 0
                ? `${productos.length} producto${productos.length > 1 ? 's' : ''}`
                : 'Agregá tu primer producto'}
            </p>
          </div>
          <button
            onClick={() => { setFormAbierto(true); setErrForm(null) }}
            className="bg-white text-orange-500 font-bold text-sm px-4 py-2 rounded-xl hover:bg-orange-50 transition-colors shadow-sm"
          >
            + Agregar
          </button>
        </div>
      </div>

      {/* Modal nuevo producto */}
      {formAbierto && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 px-0 sm:px-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-md p-6">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden" />
            <h2 className="text-lg font-extrabold text-gray-800 mb-4">Nuevo producto</h2>
            <form onSubmit={handleCrear} className="space-y-3">
              {[
                ['Nombre *', 'nombre', 'text'],
                ['Descripción', 'descripcion', 'text'],
                ['Precio *', 'precio', 'number'],
                ['Foto (URL)', 'foto', 'text'],
              ].map(([label, field, type]) => (
                <div key={field}>
                  <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1 font-medium">
                    {label}
                  </label>
                  <input
                    type={type}
                    min={type === 'number' ? 0 : undefined}
                    step={type === 'number' ? 'any' : undefined}
                    value={form[field]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
                    required={label.includes('*')}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 focus:bg-white transition-all"
                  />
                </div>
              ))}
              {errForm && (
                <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">⚠ {errForm}</p>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {guardando ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Guardando…
                    </>
                  ) : 'Guardar producto'}
                </button>
                <button
                  type="button"
                  onClick={() => { setFormAbierto(false); setErrForm(null); setForm(FORM_VACIO) }}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de productos */}
      <div className="max-w-2xl mx-auto px-4 py-5">
        {productos.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-5xl mb-3">🍴</div>
            <p className="text-gray-600 font-semibold mb-1">Sin productos aún</p>
            <p className="text-gray-400 text-sm">Tocá "+ Agregar" para crear el primero.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {productos.map((p) =>
              editandoId === p.id ? (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-orange-200 shadow-sm px-4 py-4 space-y-3"
                >
                  <h3 className="text-sm font-bold text-gray-700">Editando producto</h3>
                  {[
                    ['Nombre', 'nombre', 'text'],
                    ['Descripción', 'descripcion', 'text'],
                    ['Precio', 'precio', 'number'],
                    ['Foto (URL)', 'foto', 'text'],
                  ].map(([label, field, type]) => (
                    <div key={field}>
                      <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">
                        {label}
                      </label>
                      <input
                        type={type}
                        min={type === 'number' ? 0 : undefined}
                        step={type === 'number' ? 'any' : undefined}
                        value={editData[field] ?? ''}
                        onChange={(e) =>
                          setEditData((prev) => ({ ...prev, [field]: e.target.value }))
                        }
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 focus:bg-white transition-all"
                      />
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleGuardarEdit(p)}
                      disabled={guardandoEdit}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white text-sm font-bold hover:opacity-90 disabled:opacity-40"
                    >
                      {guardandoEdit ? 'Guardando…' : 'Guardar'}
                    </button>
                    <button
                      onClick={() => setEditandoId(null)}
                      className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm hover:bg-gray-200"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  key={p.id}
                  className={`bg-white rounded-2xl border shadow-sm px-4 py-3 flex items-center gap-3 transition-all ${
                    p.disponible ? 'border-gray-100' : 'border-gray-100 opacity-55'
                  }`}
                >
                  {p.foto ? (
                    <img src={p.foto} alt={p.nombre} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center text-2xl flex-shrink-0">🍴</div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800">{p.nombre}</p>
                    {p.descripcion && (
                      <p className="text-xs text-gray-400 truncate">{p.descripcion}</p>
                    )}
                    <p className="text-orange-500 font-extrabold text-sm mt-0.5">
                      ${p.precio?.toLocaleString('es-AR')}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleToggleDisponible(p)}
                      className={`text-xs px-2.5 py-1 rounded-full font-bold transition-colors ${
                        p.disponible
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}
                    >
                      {p.disponible ? '● Activo' : '○ Inactivo'}
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditandoId(p.id)
                          setEditData({
                            nombre: p.nombre ?? '',
                            descripcion: p.descripcion ?? '',
                            precio: p.precio ?? '',
                            foto: p.foto ?? '',
                          })
                        }}
                        className="text-xs text-orange-500 hover:text-orange-700 font-semibold"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(p)}
                        disabled={eliminandoId === p.id}
                        className="text-xs text-red-400 hover:text-red-600 font-semibold disabled:opacity-40"
                      >
                        {eliminandoId === p.id ? '…' : 'Eliminar'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}
