import { NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/vendedor/productos', label: 'Productos', icon: '🍴' },
  { to: '/vendedor/pedidos',   label: 'Pedidos',   icon: '📦' },
  { to: '/vendedor/perfil',    label: 'Mi tienda', icon: '🏪' },
]

export default function NavVendedor() {
  return (
    <>
      {/* Desktop nav — top */}
      <nav className="hidden sm:block bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">🍔</span>
            <span className="font-bold text-gray-800 text-base">FoodApp</span>
            <span className="ml-1 text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full">
              Vendedor
            </span>
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
        </div>
      </nav>

      <div className="sm:hidden h-16" />
    </>
  )
}

