import { initializeApp } from 'firebase/app'
import {
  initializeAuth,
  inMemoryPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore'

// Leer variables de entorno (cargadas por --env-file=.env.local)
const firebaseConfig = {
  apiKey:            process.env.VITE_FIREBASE_API_KEY,
  authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.VITE_FIREBASE_APP_ID,
}

const adminEmail    = process.env.VITE_ADMIN_EMAIL
const adminPassword = process.env.VITE_ADMIN_PASSWORD

if (!adminEmail || !adminPassword) {
  console.error('❌  Faltan VITE_ADMIN_EMAIL o VITE_ADMIN_PASSWORD en .env.local')
  process.exit(1)
}

const app  = initializeApp(firebaseConfig, 'seed')
const auth = initializeAuth(app, { persistence: inMemoryPersistence })
const db   = getFirestore(app)

async function seed() {
  let uid

  // Intentar crear la cuenta; si ya existe, hacer login para obtener el UID
  try {
    console.log(`⏳  Creando cuenta admin para ${adminEmail}…`)
    const { user } = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword)
    uid = user.uid
    console.log(`   Cuenta Auth creada. UID: ${uid}`)
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      console.log(`ℹ️  La cuenta Auth ya existe. Verificando documento Firestore…`)
      const { user } = await signInWithEmailAndPassword(auth, adminEmail, adminPassword)
      uid = user.uid
    } else {
      throw err
    }
  }

  // Crear o verificar el documento Firestore
  const ref  = doc(db, 'usuarios', uid)
  const snap = await getDoc(ref)

  if (snap.exists()) {
    console.log(`✅  El documento Firestore ya existe. Nada que hacer.`)
    console.log(`   UID: ${uid} | rol: ${snap.data().rol}`)
  } else {
    console.log(`⏳  Creando documento Firestore para el Admin…`)
    await setDoc(ref, {
      uid,
      email:         adminEmail,
      nombre:        'Admin',
      rol:           'admin',
      foto:          null,
      fechaRegistro: Timestamp.now(),
    })
    console.log(`✅  Admin creado correctamente.`)
    console.log(`   UID: ${uid}`)
    console.log(`   Email: ${adminEmail}`)
  }

  await signOut(auth)
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌  Error:', err.message)
  process.exit(1)
})
