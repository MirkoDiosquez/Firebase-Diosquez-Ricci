# Contract: Rutas Protegidas

**Feature**: `001-auth-gestion-usuarios`
**Date**: 2026-07-06

---

## Mapa de Rutas

| Ruta | Tipo | Rol requerido | Componente página |
|---|---|---|---|
| `/login` | Pública | — | `Login.jsx` |
| `/register` | Pública | — | `Register.jsx` |
| `/perfil` | Protegida | `comprador` | `PerfilComprador.jsx` |
| `/tiendas` | Protegida | `comprador` | `CatalogoTiendas.jsx` *(feature futura)* |
| `/carrito` | Protegida | `comprador` | `CarritoCompras.jsx` *(feature futura)* |
| `/mis-pedidos` | Protegida | `comprador` | `MisPedidos.jsx` *(feature futura)* |
| `/vendedor/perfil` | Protegida | `vendedor` | `PerfilVendedor.jsx` |
| `/vendedor/productos` | Protegida | `vendedor` | `GestionProductos.jsx` *(feature futura)* |
| `/admin/usuarios` | Protegida | `admin` | `ListaUsuarios.jsx` |
| `/admin/usuarios/:uid` | Protegida | `admin` | `DetalleUsuario.jsx` |
| `/admin/tiendas` | Protegida | `admin` | `GestionTiendas.jsx` |
| `/` | Redirect | — | Redirige según rol (ver lógica de redirect) |

---

## Comportamientos de Redirección

| Estado del usuario | Intenta acceder a | Resultado |
|---|---|---|
| No autenticado | Ruta protegida (cualquiera) | → `/login` |
| No autenticado | `/login` o `/register` | Acceso permitido |
| `comprador` | Ruta de `vendedor` o `admin` | → `/perfil` |
| `vendedor` | Ruta de `comprador` o `admin` | → `/vendedor/perfil` |
| `admin` | Ruta de `comprador` o `vendedor` | → `/admin/usuarios` |
| Cualquier rol | `/` (raíz) | Redirige al panel propio |
| Autenticado | `/login` o `/register` | Redirige al panel propio |
| `loading: true` | Cualquier ruta protegida | Muestra `<LoadingSpinner />` |

---

## Estructura de Router (React Router v6)

```jsx
// App.jsx
<BrowserRouter>
  <Routes>
    {/* Rutas públicas */}
    <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
    <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

    {/* Rutas de UsuarioComprador */}
    <Route element={<RoleRoute allowedRoles={['comprador']} redirectTo="/perfil" />}>
      <Route path="/perfil"      element={<PerfilComprador />} />
      <Route path="/tiendas"     element={<CatalogoTiendas />} />
      <Route path="/carrito"     element={<CarritoCompras />} />
      <Route path="/mis-pedidos" element={<MisPedidos />} />
    </Route>

    {/* Rutas de UsuarioVendedor */}
    <Route element={<RoleRoute allowedRoles={['vendedor']} redirectTo="/vendedor/perfil" />}>
      <Route path="/vendedor/perfil"    element={<PerfilVendedor />} />
      <Route path="/vendedor/productos" element={<GestionProductos />} />
    </Route>

    {/* Rutas de Admin */}
    <Route element={<RoleRoute allowedRoles={['admin']} redirectTo="/admin/usuarios" />}>
      <Route path="/admin/usuarios"     element={<ListaUsuarios />} />
      <Route path="/admin/usuarios/:uid" element={<DetalleUsuario />} />
      <Route path="/admin/tiendas"      element={<GestionTiendas />} />
    </Route>

    {/* Raíz: redirige según rol */}
    <Route path="/" element={<RootRedirect />} />

    {/* 404 */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
</BrowserRouter>
```

---

## Contratos de Componentes Guard

### `RoleRoute.jsx`

**Props**:
| Prop | Tipo | Descripción |
|---|---|---|
| `allowedRoles` | `string[]` | Lista de roles con acceso permitido |
| `redirectTo` | `string` | Ruta destino del propio rol (no la ruta denegada) |

**Comportamiento**:
- `loading == true` → renderiza `<LoadingSpinner />`
- `user == null` → `<Navigate to="/login" replace />`
- `rol` no está en `allowedRoles` → `<Navigate to={panelPorRol[rol]} replace />`
- `rol` está en `allowedRoles` → `<Outlet />`

### `GuestRoute.jsx`

**Props**: envuelve `children`

**Comportamiento**:
- `loading == true` → `<LoadingSpinner />`
- `user != null` → `<Navigate to={panelPorRol[rol]} replace />`
- `user == null` → renderiza `children`

### `RootRedirect.jsx`

**Comportamiento**:
- `loading == true` → `<LoadingSpinner />`
- `user == null` → `<Navigate to="/login" replace />`
- `rol == 'comprador'` → `<Navigate to="/perfil" replace />`
- `rol == 'vendedor'` → `<Navigate to="/vendedor/perfil" replace />`
- `rol == 'admin'` → `<Navigate to="/admin/usuarios" replace />`
