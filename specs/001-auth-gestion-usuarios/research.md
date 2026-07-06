# Research: Auth & Gestión de Usuarios

**Feature**: `001-auth-gestion-usuarios`
**Date**: 2026-07-06
**Input**: Technical context from plan.md + spec.md

---

## Decisión 1: Persistencia del rol en Firestore vs Custom Claims

**Decision**: Leer el rol desde el documento del usuario en la colección
`usuarios` de Firestore (campo `rol`), no desde Firebase Custom Claims.

**Rationale**:
- Custom Claims requieren una Cloud Function para escribirlos, lo que
  implica un backend adicional (violación del Principio I de la
  constitución).
- El SDK cliente de Firebase no puede escribir Custom Claims directamente.
- Leer desde Firestore es más simple: tras el login, se hace un
  `getDoc(doc(db, 'usuarios', uid))` y se guarda el rol en `AuthContext`.
- Firestore Security Rules pueden validar el rol leyendo el documento del
  usuario con `get()` antes de permitir operaciones.

**Alternatives considered**:
- Custom Claims: descartado por requerir Cloud Functions.
- localStorage: descartado por no ser la fuente de verdad y ser vulnerable
  a manipulación del cliente.

---

## Decisión 2: Desconexión instantánea al eliminar cuenta (FR-026)

**Decision**: Usar `onAuthStateChanged` en `AuthContext` combinado con
una verificación de existencia del documento `usuarios/{uid}` en Firestore.
Al eliminar la cuenta desde el Admin, se elimina el documento en `usuarios`;
el listener de Firestore en el cliente activo detecta la eliminación y
fuerza el logout + redirección.

**Rationale**:
- Firebase Auth no tiene un mecanismo nativo para revocar sesiones activas
  del cliente en tiempo real desde otro cliente (requeriría Functions).
- La alternativa viable sin backend es: al eliminar el documento
  `usuarios/{uid}`, el listener `onSnapshot` del perfil del usuario activo
  detecta que el documento ya no existe, lo que dispara el logout forzado.
- `onAuthStateChanged` solo detecta cambios de auth (login/logout propios),
  no la eliminación de cuenta iniciada desde otro cliente.

**Implementation pattern**:
```
AuthContext monta un listener onSnapshot sobre usuarios/{uid}.
Si el documento deja de existir → llamar a signOut() → redirigir a /login.
```

**Alternatives considered**:
- Firebase Auth `revokeRefreshTokens`: requiere Admin SDK (backend).
- Polling periódico: más costoso, con latencia. Descartado.

---

## Decisión 3: Creación de UsuarioVendedor por el Admin (sin Cloud Functions)

**Decision**: El Admin crea la cuenta del vendedor usando
`createUserWithEmailAndPassword` del SDK cliente, **luego restaura su
propia sesión** re-autenticándose. El documento del vendedor en `usuarios`
y en `tiendas` se crea inmediatamente después.

**Rationale**:
- Sin Cloud Functions, la única forma de crear usuarios desde Firebase Auth
  en el cliente es usando `createUserWithEmailAndPassword`, que tiene el
  efecto secundario de cambiar la sesión activa al nuevo usuario.
- El flujo es: (1) guardar credenciales del Admin, (2) crear cuenta
  vendedor, (3) crear documentos en Firestore, (4) hacer `signOut()`,
  (5) hacer `signInWithEmailAndPassword` con las credenciales del Admin.
- Este approach es aceptable para un proyecto académico con un único Admin.

**Alternatives considered**:
- Firebase Admin SDK desde Cloud Functions: más robusto pero fuera del
  stack definido en la constitución.
- Firebase Auth REST API directamente: viable pero más complejo que el SDK.

**Implication**: El Admin debe tener su contraseña disponible durante el
flujo de creación de vendedor (se le solicita confirmación de su propia
contraseña antes de iniciar el proceso).

---

## Decisión 4: Protección de rutas por rol (React Router v6)

**Decision**: Usar componentes `<PrivateRoute>` y `<RoleRoute>` que
envuelven `<Outlet>` de React Router v6. El rol se lee desde `AuthContext`.

**Rationale**:
- React Router v6 usa el patrón `<Outlet>` para rutas anidadas, lo que
  permite guards declarativos limpios.
- `AuthContext` expone `{ user, rol, loading }`. Mientras `loading` es
  `true` (pendiente de leer el documento de Firestore), se muestra un
  spinner en lugar de redirigir.
- Evita flickering de redirección prematura antes de conocer el rol.

**Pattern**:
```jsx
// RoleRoute.jsx
const RoleRoute = ({ allowedRoles }) => {
  const { user, rol, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(rol)) return <Navigate to="/" />;
  return <Outlet />;
};
```

---

## Decisión 5: Seed de la cuenta Admin

**Decision**: La cuenta Admin se crea una única vez mediante un script
de seed manual ejecutado desde la consola de Firebase o localmente con
las variables de entorno configuradas. El script crea:
1. La cuenta en Firebase Auth (`admin@foodapp.com` o similar).
2. El documento `usuarios/{uid}` con `{ rol: 'admin', nombre: 'Admin', ... }`.

**Rationale**:
- No existe flujo de registro para Admin en la app (FR-011).
- El seed se ejecuta una sola vez antes del primer deploy.
- El email/contraseña del Admin se define en variables de entorno del
  proyecto, no se hardcodea en el repositorio.

**Script location**: `src/scripts/seedAdmin.js` (excluido de producción,
solo para setup inicial).

---

## Decisión 6: Inmutabilidad del campo `rol` en Firestore Rules

**Decision**: La regla de escritura en `usuarios/{uid}` valida que el
campo `rol` no cambie en ninguna actualización del cliente:

```
allow update: if request.auth.uid == uid
  && request.resource.data.rol == resource.data.rol;
```

**Rationale**:
- Sin esta regla, un usuario podría hacer una escritura directa al SDK
  y cambiar su propio rol (escalada de privilegios).
- La validación en frontend es complementaria pero no suficiente
  (Principio IV de la constitución).
- Esta regla es simple, testeable y no requiere llamadas adicionales
  a Firestore desde las Rules.
