# Contract: Flujos de Autenticación

**Feature**: `001-auth-gestion-usuarios`
**Date**: 2026-07-06

---

## Flujo 1: Registro de UsuarioComprador

**Actor**: Visitante no autenticado
**Entrada**: `{ nombre, email, contraseña }`
**Precondición**: Email no registrado previamente

```
1. Llamar a createUserWithEmailAndPassword(auth, email, contraseña)
   → Obtener UserCredential { user.uid }

2. Escribir documento en Firestore:
   usuarios/{user.uid} = {
     uid:           user.uid,
     email:         email,
     nombre:        nombre,
     rol:           'comprador',
     foto:          null,
     fechaRegistro: serverTimestamp()
   }

3. AuthContext detecta onAuthStateChanged → carga documento usuarios/{uid}
   → guarda { user, rol: 'comprador', loading: false } en contexto

4. Redirigir a /perfil (ruta de comprador)
```

**Errores esperados**:
| Código Firebase | Mensaje al usuario |
|---|---|
| `auth/email-already-in-use` | "El email ya está registrado" |
| `auth/invalid-email` | "Email inválido" |
| `auth/weak-password` | "La contraseña debe tener al menos 6 caracteres" |
| Error genérico | "Error al crear la cuenta. Intentá de nuevo" |

---

## Flujo 2: Inicio de sesión (todos los roles)

**Actor**: Cualquier usuario con cuenta
**Entrada**: `{ email, contraseña }`

```
1. Llamar a signInWithEmailAndPassword(auth, email, contraseña)
   → Obtener UserCredential { user.uid }

2. AuthContext detecta onAuthStateChanged → carga documento usuarios/{uid}
   → determina rol

3. Redirigir según rol:
   - 'comprador' → /perfil
   - 'vendedor'  → /vendedor/perfil
   - 'admin'     → /admin/usuarios
```

**Errores esperados**:
| Condición | Mensaje al usuario |
|---|---|
| Email o contraseña incorrectos (cualquier error de Auth) | "Credenciales inválidas" (mensaje genérico — FR-006) |
| Documento `usuarios/{uid}` no existe (cuenta sin perfil) | Hacer signOut() + mostrar "Error de cuenta. Contactá al administrador" |

---

## Flujo 3: Cierre de sesión

**Actor**: Cualquier usuario autenticado

```
1. Llamar a signOut(auth)
2. AuthContext detecta onAuthStateChanged con user = null
   → limpia { user: null, rol: null }
3. Redirigir a /login
```

---

## Flujo 4: Creación de UsuarioVendedor por el Admin

**Actor**: Admin autenticado
**Entrada**: `{ nombreTienda, email, contraseña, descripcion?, foto? }`
**Precondición**: Admin autenticado; email del vendedor no registrado

```
1. Solicitar al Admin su propia contraseña (para re-autenticación posterior)

2. Llamar a createUserWithEmailAndPassword(auth, email, contraseña)
   → La sesión activa cambia al nuevo vendedor { vendorUID }

3. Escribir documento del vendedor:
   usuarios/{vendorUID} = {
     uid:           vendorUID,
     email:         email,
     nombre:        nombreTienda,
     rol:           'vendedor',
     foto:          foto ?? null,
     fechaRegistro: serverTimestamp()
   }

4. Escribir documento de tienda:
   tiendas/{vendorUID} = {
     uidVendedor:   vendorUID,
     nombreTienda:  nombreTienda,
     descripcion:   descripcion ?? '',
     foto:          foto ?? null,
     activo:        true,
     fechaCreacion: serverTimestamp()
   }

5. Llamar a signOut(auth) para cerrar sesión del vendedor recién creado

6. Llamar a signInWithEmailAndPassword(auth, adminEmail, adminContraseña)
   → Restaurar sesión del Admin

7. AuthContext vuelve a reconocer al Admin → redirigir a /admin/tiendas
```

**Errores esperados**:
| Condición | Acción |
|---|---|
| `auth/email-already-in-use` | Mostrar error, no proceder con creación de docs |
| Error al escribir docs de Firestore | Mostrar error; la cuenta Auth ya fue creada — documentar como estado inconsistente que requiere limpieza manual |
| Error al re-autenticar al Admin | Mostrar error con instrucción de volver a iniciar sesión |

---

## Flujo 5: Eliminación de cuenta por el Admin

**Actor**: Admin autenticado
**Entrada**: `{ uid }` del usuario a eliminar
**Precondición**: `uid != Admin.uid`

```
1. Eliminar documento Firestore: usuarios/{uid}
   → Si es vendedor: también eliminar tiendas/{uid}

2. [Limitación sin backend]: La cuenta en Firebase Auth permanece activa
   técnicamente, pero el documento de perfil fue eliminado.
   El listener onSnapshot del cliente afectado detecta que su documento
   ya no existe → fuerza signOut() → redirige a /login.

   Nota: Para eliminar la cuenta de Firebase Auth del usuario eliminado
   se requeriría Firebase Admin SDK (Cloud Functions). En esta versión
   académica, la cuenta Auth queda "huérfana" pero inaccesible porque:
   - Las Security Rules rechazan lecturas/escrituras sin documento en `usuarios`
   - El flujo de login fuerza logout si no encuentra documento de perfil
```

**Resultado para el usuario eliminado**:
- Si tiene sesión activa: detecta eliminación del documento vía `onSnapshot`
  → `signOut()` → redirección a `/login`.
- Si intenta hacer login posterior: Auth permite el login pero el flujo
  detecta que no existe documento `usuarios/{uid}` → fuerza logout + mensaje.

---

## Flujo 6: Carga del rol en AuthContext (bootstrap)

```
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    setLoading(true);
    // Montar listener en tiempo real sobre el documento del usuario
    const unsubscribe = onSnapshot(
      doc(db, 'usuarios', firebaseUser.uid),
      (snap) => {
        if (snap.exists()) {
          setUser(firebaseUser);
          setRol(snap.data().rol);
        } else {
          // Documento eliminado → forzar logout
          signOut(auth);
          setUser(null);
          setRol(null);
        }
        setLoading(false);
      }
    );
    return unsubscribe; // cleanup
  } else {
    setUser(null);
    setRol(null);
    setLoading(false);
  }
});
```
