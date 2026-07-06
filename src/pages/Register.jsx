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
      // registerUser crea el doc en Firestore con rol 'comprador'
      // AuthContext detecta onAuthStateChanged → redirige a /perfil automáticamente
    } catch (err) {
      setError(mensajeError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Crear cuenta</h1>
        <p className="text-sm text-gray-500 mb-6">Registrate como comprador en FoodApp</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <RegisterForm onSubmit={handleRegister} loading={loading} />

        <p className="text-sm text-gray-500 text-center mt-6">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-purple-600 hover:underline font-medium">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  )
}

