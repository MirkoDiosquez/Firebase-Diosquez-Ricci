import { useAuthContext } from '../context/AuthContext'

/**
 * Hook para consumir el contexto de autenticación.
 * Lanza error si se usa fuera de <AuthProvider>.
 */
export function useAuth() {
  const context = useAuthContext()
  if (context === null) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return context
}
