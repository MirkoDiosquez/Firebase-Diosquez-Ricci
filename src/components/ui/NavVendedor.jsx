import { NavLink } from 'react-router-dom'

export default function NavVendedor() {
  const base = 'px-3 py-3 text-sm font-medium transition-colors border-b-2'
  const active = `${base} text-orange-700 border-orange-600`
  const inactive = `${base} text-gray-500 border-transparent hover:text-gray-700`

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-2xl mx-auto px-4 flex gap-1">
        {[
          ['/vendedor/productos', 'Productos'],
          ['/vendedor/pedidos', 'Pedidos'],
          ['/vendedor/perfil', 'Mi tienda'],
        ].map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => (isActive ? active : inactive)}
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
