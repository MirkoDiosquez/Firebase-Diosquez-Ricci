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
    } catch {
      setError('Credenciales inválidas. Verificá tu email y contraseña.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Panel izquierdo — branding */}
      <div className="lg:w-1/2 bg-gradient-to-br from-orange-500 via-orange-400 to-rose-500 flex flex-col items-center justify-center px-8 py-16 text-white">
        <div className="text-7xl mb-5 drop-shadow-md">🍔</div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">FoodApp</h1>
        <p className="text-orange-100 text-lg text-center max-w-xs">
          El sabor que buscás, a un clic de distancia
        </p>
        <div className="mt-10 flex gap-6 text-sm text-orange-100 font-medium">
          <span>🚀 Entrega rápida</span>
          <span>🏪 Muchas tiendas</span>
          <span>💳 Fácil y seguro</span>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="lg:w-1/2 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Bienvenido de vuelta</h2>
          <p className="text-sm text-gray-500 mb-8">
            ¿No tenés cuenta?{' '}
            <Link to="/register" className="text-orange-500 font-semibold hover:underline">
              Registrate gratis
            </Link>
          </p>

          <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
        </div>
      </div>
    </div>
  )
}


