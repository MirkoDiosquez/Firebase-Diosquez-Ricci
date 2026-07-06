import { NavLink } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'

const LINKS = [
  { to: '/tiendas',     label: 'Tiendas',    icon: '🏪' },
  { to: '/mis-pedidos', label: 'Mis pedidos', icon: '📋' },
  { to: '/perfil',      label: 'Perfil',      icon: '👤' },
]

export default function NavComprador() {
  const { count } = useCart()

  return (
    <>
      {/* Desktop nav — top */}
      <nav className="hidden sm:block bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">🍔</span>
            <span className="font-bold text-gray-800 text-base">FoodApp</span>
          </div>

          <div className="flex gap-1">
            {LINKS.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                <span>{icon}</span> {label}
              </NavLink>
            ))}

            <NavLink
              to="/carrito"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
                  isActive
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              🛒
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {count > 9 ? '9+' : count}
                </span>
              )}
              <span>Carrito</span>
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Mobile nav — bottom */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
        <div className="flex">
          {LINKS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
                  isActive ? 'text-orange-500' : 'text-gray-400'
                }`
              }
            >
              <span className="text-xl">{icon}</span>
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          ))}

          <NavLink
            to="/carrito"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors relative ${
                isActive ? 'text-orange-500' : 'text-gray-400'
              }`
            }
          >
            <span className="text-xl relative">
              🛒
              {count > 0 && (
                <span className="absolute -top-1 -right-2 bg-orange-500 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </span>
            <span className="text-[10px] font-medium">Carrito</span>
          </NavLink>
        </div>
        {/* iOS safe area */}
        <div className="h-safe-area-inset-bottom" />
      </nav>

      {/* Spacer para evitar que el contenido quede debajo del nav móvil */}
      <div className="sm:hidden h-16" />
    </>
  )
}

