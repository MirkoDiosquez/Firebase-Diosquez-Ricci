import { useState } from 'react'
import { Link } from 'react-router-dom'
import RegisterForm from '../components/forms/RegisterForm'
import { registerUser } from '../services/auth'

function mensajeError(codigo) {
  const mensajes = {
    'auth/email-already-in-use': 'El email ya está registrado.',
    'auth/invalid-email': 'El email no tiene un formato válido.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  }
  return mensajes[codigo] ?? 'Error al crear la cuenta. Intentá de nuevo.'
}

export default function Register() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleRegister({ nombre, email, password }) {
    setLoading(true)
    setError(null)
    try {
      await registerUser(nombre, email, password)
    } catch (err) {
      setError(mensajeError(err.code))
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
          Registrate y empezá a pedir en segundos
        </p>
        <div className="mt-10 grid grid-cols-1 gap-3 text-sm text-orange-100">
          <div className="flex items-center gap-2">
            <span className="text-lg">✅</span> Gratis, sin cargos ocultos
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🛒</span> Pedís y seguís tu orden en tiempo real
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🏪</span> Accedé a todas las tiendas
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="lg:w-1/2 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Crear cuenta</h2>
          <p className="text-sm text-gray-500 mb-8">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="text-orange-500 font-semibold hover:underline">
              Iniciá sesión
            </Link>
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <RegisterForm onSubmit={handleRegister} loading={loading} />
        </div>
      </div>
    </div>
  )
}


