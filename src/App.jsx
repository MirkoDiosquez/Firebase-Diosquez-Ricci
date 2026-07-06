import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

// Guards
import GuestRoute from './routes/GuestRoute'
import RoleRoute from './routes/RoleRoute'
import RootRedirect from './routes/RootRedirect'

// Páginas públicas
import Login from './pages/Login'
import Register from './pages/Register'

// Páginas comprador
import PerfilComprador from './pages/comprador/PerfilComprador'

// Páginas vendedor
import PerfilVendedor from './pages/vendedor/PerfilVendedor'

// Páginas admin
import ListaUsuarios from './pages/admin/ListaUsuarios'
import DetalleUsuario from './pages/admin/DetalleUsuario'
import GestionTiendas from './pages/admin/GestionTiendas'

function ProximamentePage() {
  return (
    <div className="flex items-center justify-center min-h-screen text-gray-500">
      Próximamente…
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Rutas públicas ── */}
          <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

          {/* ── Rutas de UsuarioComprador ── */}
          <Route element={<RoleRoute allowedRoles={['comprador']} />}>
            <Route path="/perfil"      element={<PerfilComprador />} />
            <Route path="/tiendas"     element={<ProximamentePage />} />
            <Route path="/carrito"     element={<ProximamentePage />} />
            <Route path="/mis-pedidos" element={<ProximamentePage />} />
          </Route>

          {/* ── Rutas de UsuarioVendedor ── */}
          <Route element={<RoleRoute allowedRoles={['vendedor']} />}>
            <Route path="/vendedor/perfil"    element={<PerfilVendedor />} />
            <Route path="/vendedor/productos" element={<ProximamentePage />} />
          </Route>

          {/* ── Rutas de Admin ── */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/admin/usuarios"      element={<ListaUsuarios />} />
            <Route path="/admin/usuarios/:uid" element={<DetalleUsuario />} />
            <Route path="/admin/tiendas"       element={<GestionTiendas />} />
          </Route>

          {/* ── Raíz: redirige según rol ── */}
          <Route path="/" element={<RootRedirect />} />

          {/* ── 404 ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
