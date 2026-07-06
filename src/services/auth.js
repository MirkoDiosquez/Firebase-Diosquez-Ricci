import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase'

/**
 * Registra un nuevo UsuarioComprador.
 * Crea la cuenta en Firebase Auth y el documento en Firestore.
 */
export async function registerUser(nombre, email, password) {
  const credencial = await createUserWithEmailAndPassword(auth, email, password)
  const { uid } = credencial.user

  await setDoc(doc(db, 'usuarios', uid), {
    uid,
    email,
    nombre,
    rol: 'comprador',
    foto: null,
    fechaRegistro: serverTimestamp(),
  })

  return credencial.user
}

/**
 * Inicia sesión con email y contraseña.
 */
export async function loginUser(email, password) {
  const credencial = await signInWithEmailAndPassword(auth, email, password)
  return credencial.user
}

/**
 * Cierra la sesión del usuario actual.
 */
export async function logoutUser() {
  await signOut(auth)
}
