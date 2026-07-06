import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const panelPorRol = {
  comprador: '/perfil',
  vendedor: '/vendedor/perfil',
  admin: '/admin/usuarios',
}

/**
 * Guard para rutas públicas (/login, /register).
 * Si el usuario ya está autenticado, lo redirige a su panel.
 */
export default function GuestRoute({ children }) {
  const { user, rol, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (user) return <Navigate to={panelPorRol[rol] ?? '/'} replace />

  return children
}
