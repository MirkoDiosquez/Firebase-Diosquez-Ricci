import { useState } from 'react'

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Formulario de registro de UsuarioComprador.
 * Props:
 *   onSubmit({ nombre, email, password }) → async function
 *   loading: boolean
 */
export default function RegisterForm({ onSubmit, loading }) {
  const [campos, setCampos] = useState({ nombre: '', email: '', password: '' })
  const [errores, setErrores] = useState({})

  function validar(nombre, valor) {
    if (nombre === 'nombre') {
      return valor.trim() === '' ? 'El nombre es obligatorio' : ''
    }
    if (nombre === 'email') {
      if (valor.trim() === '') return 'El email es obligatorio'
      if (!validarEmail(valor)) return 'El email no es válido'
      return ''
    }
    if (nombre === 'password') {
      if (valor === '') return 'La contraseña es obligatoria'
      if (valor.length < 6) return 'Mínimo 6 caracteres'
      return ''
    }
    return ''
  }

  function handleChange(e) {
    const { name, value } = e.target
    setCampos((prev) => ({ ...prev, [name]: value }))
    setErrores((prev) => ({ ...prev, [name]: validar(name, value) }))
  }

  function handleBlur(e) {
    const { name, value } = e.target
    setErrores((prev) => ({ ...prev, [name]: validar(name, value) }))
  }

  function hayErrores() {
    return (
      Object.values(errores).some((e) => e !== '') ||
      campos.nombre.trim() === '' ||
      campos.email.trim() === '' ||
      campos.password === ''
    )
  }

  function handleSubmit(e) {
    e.preventDefault()
    const nuevosErrores = {
      nombre: validar('nombre', campos.nombre),
      email: validar('email', campos.email),
      password: validar('password', campos.password),
    }
    setErrores(nuevosErrores)
    if (Object.values(nuevosErrores).some((e) => e !== '')) return
    onSubmit(campos)
  }

  const inputBase = 'w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:ring-2 transition-all'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {/* Nombre */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="reg-nombre">
          Nombre completo
        </label>
        <input
          id="reg-nombre"
          name="nombre"
          type="text"
          autoComplete="name"
          value={campos.nombre}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`${inputBase} ${errores.nombre ? 'border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-orange-400 focus:ring-orange-100'}`}
          placeholder="Juan Pérez"
        />
        {errores.nombre && (
          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
            <span>⚠</span> {errores.nombre}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="reg-email">
          Email
        </label>
        <input
          id="reg-email"
          name="email"
          type="email"
          autoComplete="email"
          value={campos.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`${inputBase} ${errores.email ? 'border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-orange-400 focus:ring-orange-100'}`}
          placeholder="juan@ejemplo.com"
        />
        {errores.email && (
          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
            <span>⚠</span> {errores.email}
          </p>
        )}
      </div>

      {/* Contraseña */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="reg-password">
          Contraseña
        </label>
        <input
          id="reg-password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={campos.password}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`${inputBase} ${errores.password ? 'border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-orange-400 focus:ring-orange-100'}`}
          placeholder="Mínimo 6 caracteres"
        />
        {errores.password && (
          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
            <span>⚠</span> {errores.password}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={hayErrores() || loading}
        className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-sm text-sm"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Creando cuenta…
          </span>
        ) : (
          'Crear cuenta gratis'
        )}
      </button>
    </form>
  )
}

