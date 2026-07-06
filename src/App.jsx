import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

// Guards
import GuestRoute from './routes/GuestRoute'
import RoleRoute from './routes/RoleRoute'
import RootRedirect from './routes/RootRedirect'

// Páginas públicas
import Login from './pages/Login'
import Register from './pages/Register'

// Páginas comprador
import PerfilComprador from './pages/comprador/PerfilComprador'
import ListaTiendas from './pages/comprador/ListaTiendas'
import DetalleTienda from './pages/comprador/DetalleTienda'
import Carrito from './pages/comprador/Carrito'
import MisPedidos from './pages/comprador/MisPedidos'

// Páginas vendedor
import PerfilVendedor from './pages/vendedor/PerfilVendedor'
import GestionProductos from './pages/vendedor/GestionProductos'
import PedidosVendedor from './pages/vendedor/PedidosVendedor'

// Páginas admin
import ListaUsuarios from './pages/admin/ListaUsuarios'
import DetalleUsuario from './pages/admin/DetalleUsuario'
import GestionTiendas from './pages/admin/GestionTiendas'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Rutas públicas ── */}
            <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

            {/* ── Rutas de UsuarioComprador ── */}
            <Route element={<RoleRoute allowedRoles={['comprador']} />}>
              <Route path="/perfil"           element={<PerfilComprador />} />
              <Route path="/tiendas"          element={<ListaTiendas />} />
              <Route path="/tiendas/:uid"     element={<DetalleTienda />} />
              <Route path="/carrito"          element={<Carrito />} />
              <Route path="/mis-pedidos"      element={<MisPedidos />} />
            </Route>

            {/* ── Rutas de UsuarioVendedor ── */}
            <Route element={<RoleRoute allowedRoles={['vendedor']} />}>
              <Route path="/vendedor/perfil"    element={<PerfilVendedor />} />
              <Route path="/vendedor/productos" element={<GestionProductos />} />
              <Route path="/vendedor/pedidos"   element={<PedidosVendedor />} />
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
      </CartProvider>
    </AuthProvider>
  )
}
