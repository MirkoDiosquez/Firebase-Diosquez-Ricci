import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../services/firebase'
import { logoutUser } from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [rol, setRol] = useState(null)
  const [loading, setLoading] = useState(true)

  // Referencia al unsubscribe del listener de Firestore para limpiarlo
  const unsubscribeFirestoreRef = useRef(null)

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // Limpiar listener anterior de Firestore si existe
      if (unsubscribeFirestoreRef.current) {
        unsubscribeFirestoreRef.current()
        unsubscribeFirestoreRef.current = null
      }

      if (firebaseUser) {
        setLoading(true)

        // Listener en tiempo real sobre el documento del usuario
        // Si el Admin elimina el doc, detectamos la ausencia y forzamos logout
        const unsubFirestore = onSnapshot(
          doc(db, 'usuarios', firebaseUser.uid),
          (snap) => {
            if (snap.exists()) {
              setUser(firebaseUser)
              setRol(snap.data().rol)
            } else {
              // Documento eliminado por el Admin → forzar logout
              logoutUser()
              setUser(null)
              setRol(null)
            }
            setLoading(false)
          },
          () => {
            // Error de permisos (ej: reglas bloquearon la lectura) → logout
            logoutUser()
            setUser(null)
            setRol(null)
            setLoading(false)
          }
        )

        unsubscribeFirestoreRef.current = unsubFirestore
      } else {
        setUser(null)
        setRol(null)
        setLoading(false)
      }
    })

    return () => {
      unsubscribeAuth()
      if (unsubscribeFirestoreRef.current) {
        unsubscribeFirestoreRef.current()
      }
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, rol, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext)
}
