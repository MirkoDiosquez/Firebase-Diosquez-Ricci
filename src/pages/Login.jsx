import { useState } from 'react'
import { Link } from 'react-router-dom'
import LoginForm from '../components/forms/LoginForm'
import { loginUser } from '../services/auth'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleLogin({ email, password }) {
    setLoading(true)
    setError(null)
    try {
      await loginUser(email, password)
      // AuthContext detecta onAuthStateChanged → redirige automáticamente según rol
    } catch {
      // FR-006: mensaje genérico — no revelar si falla email o contraseña
      setError('Credenciales inválidas. Verificá tu email y contraseña.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Iniciar sesión</h1>
        <p className="text-sm text-gray-500 mb-6">FoodApp</p>

        <LoginForm onSubmit={handleLogin} loading={loading} error={error} />

        <p className="text-sm text-gray-500 text-center mt-6">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="text-purple-600 hover:underline font-medium">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  )
}

