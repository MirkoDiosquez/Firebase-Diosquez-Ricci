import { createContext, useState, useEffect } from 'react'

export const CartContext = createContext(null)

const LS_KEY = 'foodapp_cart'

const CART_VACIO = { uidTienda: null, nombreTienda: null, items: [] }

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem(LS_KEY)
      return stored ? JSON.parse(stored) : CART_VACIO
    } catch {
      return CART_VACIO
    }
  })

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(cart))
  }, [cart])

  function addItem(producto, tienda) {
    setCart((prev) => {
      // Producto de otra tienda → preguntar si vaciar
      if (prev.uidTienda && prev.uidTienda !== tienda.uid && prev.items.length > 0) {
        const ok = window.confirm(
          `Tu carrito tiene productos de "${prev.nombreTienda}".\n¿Querés vaciarlo y agregar de "${tienda.nombreTienda}"?`
        )
        if (!ok) return prev
        return {
          uidTienda: tienda.uid,
          nombreTienda: tienda.nombreTienda,
          items: [{ ...producto, cantidad: 1 }],
        }
      }

      const existing = prev.items.find((i) => i.productoId === producto.productoId)
      const items = existing
        ? prev.items.map((i) =>
            i.productoId === producto.productoId
              ? { ...i, cantidad: i.cantidad + 1 }
              : i
          )
        : [...prev.items, { ...producto, cantidad: 1 }]

      return { uidTienda: tienda.uid, nombreTienda: tienda.nombreTienda, items }
    })
  }

  function removeItem(productoId) {
    setCart((prev) => {
      const items = prev.items.filter((i) => i.productoId !== productoId)
      return items.length === 0 ? CART_VACIO : { ...prev, items }
    })
  }

  function updateQuantity(productoId, cantidad) {
    if (cantidad <= 0) {
      removeItem(productoId)
      return
    }
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.productoId === productoId ? { ...i, cantidad } : i
      ),
    }))
  }

  function clearCart() {
    setCart(CART_VACIO)
  }

  const total = cart.items.reduce((sum, i) => sum + i.precio * i.cantidad, 0)
  const count = cart.items.reduce((sum, i) => sum + i.cantidad, 0)

  return (
    <CartContext.Provider
      value={{ cart, addItem, removeItem, updateQuantity, clearCart, total, count }}
    >
      {children}
    </CartContext.Provider>
  )
}
