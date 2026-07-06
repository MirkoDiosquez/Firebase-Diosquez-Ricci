import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const panelPorRol = {
  comprador: '/tiendas',
  vendedor: '/vendedor/productos',
  admin: '/admin/usuarios',
}

/**
 * Redirige la ruta raíz "/" al panel correspondiente al rol del usuario.
 * Si no está autenticado, redirige a /login.
 */
export default function RootRedirect() {
  const { user, rol, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />

  return <Navigate to={panelPorRol[rol] ?? '/login'} replace />
}
