import { useEffect, useState } from 'react'

/**
 * Formulario reutilizable para editar perfil.
 * modo='comprador' → campos: nombre (requerido), foto (URL opcional)
 * modo='vendedor'  → campos: nombreTienda (requerido), descripcion (opcional), foto (URL opcional)
 *
 * Props:
 *   modo          'comprador' | 'vendedor'
 *   initialValues Objeto con los valores iniciales de los campos
 *   onSubmit      (datos) => void — callback al enviar
 *   loading       bool — deshabilita el botón mientras se guarda
 *   error         string|null — mensaje de error a mostrar
 */
export default function PerfilForm({
  modo = 'comprador',
  initialValues = {},
  onSubmit,
  loading = false,
  error = null,
}) {
  const [nombre, setNombre] = useState(initialValues.nombre ?? '')
  const [nombreTienda, setNombreTienda] = useState(initialValues.nombreTienda ?? '')
  const [descripcion, setDescripcion] = useState(initialValues.descripcion ?? '')
  const [foto, setFoto] = useState(initialValues.foto ?? '')

  // Sincronizar cuando llegan los valores iniciales desde Firestore (post-carga)
  useEffect(() => {
    setNombre(initialValues.nombre ?? '')
    setNombreTienda(initialValues.nombreTienda ?? '')
    setDescripcion(initialValues.descripcion ?? '')
    setFoto(initialValues.foto ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues.nombre, initialValues.nombreTienda, initialValues.descripcion, initialValues.foto])

  const esValido =
    modo === 'comprador'
      ? nombre.trim().length > 0
      : nombreTienda.trim().length > 0

  const accent = modo === 'comprador' ? 'purple' : 'orange'

  const inputClass = `w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
    focus:outline-none focus:ring-2 focus:ring-${accent}-300`

  function handleSubmit(e) {
    e.preventDefault()
    if (!esValido || loading) return

    if (modo === 'comprador') {
      onSubmit({
        nombre: nombre.trim(),
        foto: foto.trim() || null,
      })
    } else {
      onSubmit({
        nombreTienda: nombreTienda.trim(),
        descripcion: descripcion.trim() || null,
        foto: foto.trim() || null,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {modo === 'comprador' ? (
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">
            Nombre *
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
      ) : (
        <>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">
              Nombre de tienda *
            </label>
            <input
              type="text"
              value={nombreTienda}
              onChange={(e) => setNombreTienda(e.target.value)}
              placeholder="Nombre de tu tienda"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción de tu tienda (opcional)"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
            />
          </div>
        </>
      )}

      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">
          Foto (URL, opcional)
        </label>
        <input
          type="text"
          value={foto}
          onChange={(e) => setFoto(e.target.value)}
          placeholder="https://ejemplo.com/foto.jpg"
          className={
            modo === 'comprador'
              ? 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300'
              : 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300'
          }
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={!esValido || loading}
        className={
          esValido && !loading
            ? modo === 'comprador'
              ? 'w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors'
              : 'w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors'
            : 'w-full py-2.5 rounded-xl bg-gray-100 text-gray-400 text-sm font-semibold cursor-not-allowed'
        }
      >
        {loading ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </form>
  )
}
