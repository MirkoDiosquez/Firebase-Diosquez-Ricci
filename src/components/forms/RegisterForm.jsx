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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="reg-nombre">
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
          className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-400 ${errores.nombre ? 'border-red-400' : 'border-gray-300'}`}
          placeholder="Juan Pérez"
        />
        {errores.nombre && <p className="text-red-500 text-xs mt-1">{errores.nombre}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="reg-email">
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
          className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-400 ${errores.email ? 'border-red-400' : 'border-gray-300'}`}
          placeholder="juan@ejemplo.com"
        />
        {errores.email && <p className="text-red-500 text-xs mt-1">{errores.email}</p>}
      </div>

      {/* Contraseña */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="reg-password">
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
          className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-400 ${errores.password ? 'border-red-400' : 'border-gray-300'}`}
          placeholder="Mínimo 6 caracteres"
        />
        {errores.password && <p className="text-red-500 text-xs mt-1">{errores.password}</p>}
      </div>

      <button
        type="submit"
        disabled={hayErrores() || loading}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
      >
        {loading ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>
    </form>
  )
}
