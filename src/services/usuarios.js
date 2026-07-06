import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'
import { db } from './firebase'

/**
 * Obtiene el documento de perfil de un usuario por UID.
 */
export async function getUsuario(uid) {
  const snap = await getDoc(doc(db, 'usuarios', uid))
  if (!snap.exists()) return null
  return snap.data()
}

/**
 * Actualiza los campos editables del perfil del usuario.
 * NUNCA incluir rol, email ni fechaRegistro en `datos`.
 */
export async function updateUsuario(uid, datos) {
  // Elimina campos inmutables por si el llamador los incluyó por error
  const { rol, email, fechaRegistro, ...camposEditables } = datos
  await updateDoc(doc(db, 'usuarios', uid), camposEditables)
}

/**
 * Elimina el documento de perfil de un usuario (lo usa el Admin).
 * La cuenta en Firebase Auth queda pendiente de limpieza manual.
 */
export async function deleteUsuario(uid) {
  await deleteDoc(doc(db, 'usuarios', uid))
}
