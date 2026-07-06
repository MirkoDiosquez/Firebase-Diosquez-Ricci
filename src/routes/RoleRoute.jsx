import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const panelPorRol = {
  comprador: '/tiendas',
  vendedor: '/vendedor/productos',
  admin: '/admin/usuarios',
}

/**
 * Guard que permite acceso solo a los roles indicados en `allowedRoles`.
 * - Cargando → spinner
 * - No autenticado → /login
 * - Rol no permitido → panel propio del usuario
 * - Rol permitido → renderiza las rutas hijas (<Outlet />)
 */
export default function RoleRoute({ allowedRoles }) {
  const { user, rol, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(rol)) {
    return <Navigate to={panelPorRol[rol] ?? '/login'} replace />
  }

  return <Outlet />
}
