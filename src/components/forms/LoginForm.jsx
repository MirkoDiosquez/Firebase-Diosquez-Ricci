import { useState } from 'react'

/**
 * Formulario de inicio de sesión (todos los roles).
 * Props:
 *   onSubmit({ email, password }) → async function
 *   loading: boolean
 *   error: string | null  — mensaje de error externo (ej: "Credenciales inválidas")
 */
export default function LoginForm({ onSubmit, loading, error }) {
  const [campos, setCampos] = useState({ email: '', password: '' })

  function handleChange(e) {
    const { name, value } = e.target
    setCampos((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!campos.email || !campos.password) return
    onSubmit(campos)
  }

  const deshabilitado = loading || !campos.email || !campos.password

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {/* Mensaje de error genérico — FR-006 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="login-email">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          value={campos.email}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="tu@email.com"
        />
      </div>

      {/* Contraseña */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="login-password">
          Contraseña
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={campos.password}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="Tu contraseña"
        />
      </div>

      <button
        type="submit"
        disabled={deshabilitado}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
      >
        {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
      </button>
    </form>
  )
}
