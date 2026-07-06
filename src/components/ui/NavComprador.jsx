import { NavLink } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'

export default function NavComprador() {
  const { count } = useCart()

  const base = 'px-3 py-3 text-sm font-medium transition-colors border-b-2'
  const active = `${base} text-purple-700 border-purple-600`
  const inactive = `${base} text-gray-500 border-transparent hover:text-gray-700`

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-2xl mx-auto px-4 flex gap-1">
        {[
          ['/tiendas', 'Tiendas'],
          ['/mis-pedidos', 'Mis pedidos'],
          ['/perfil', 'Perfil'],
        ].map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => (isActive ? active : inactive)}
          >
            {label}
          </NavLink>
        ))}

        <NavLink
          to="/carrito"
          className={({ isActive }) => (isActive ? active : inactive)}
        >
          Carrito
          {count > 0 && (
            <span className="ml-1.5 bg-purple-600 text-white text-xs rounded-full w-5 h-5 inline-flex items-center justify-center">
              {count}
            </span>
          )}
        </NavLink>
      </div>
    </nav>
  )
}
