# Contract: Firestore Security Rules

**Feature**: `001-auth-gestion-usuarios`
**Date**: 2026-07-06
**File de producción**: `firestore.rules` (raíz del repositorio)

---

## Contrato de Security Rules

Las siguientes reglas implementan el control de acceso descrito en la
spec (FR-023 a FR-025) y el data-model. Son la **fuente de verdad** del
sistema de permisos (Principio IV de la constitución).

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ─── Helpers ────────────────────────────────────────────────────────────

    // Devuelve el rol del usuario autenticado leyendo su documento
    function getRol() {
      return get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol;
    }

    function esAdmin() {
      return getRol() == 'admin';
    }

    function esVendedor() {
      return getRol() == 'vendedor';
    }

    // ─── Colección: usuarios ─────────────────────────────────────────────────

    match /usuarios/{uid} {

      // Lectura: propio usuario O Admin
      allow read: if request.auth != null
        && (request.auth.uid == uid || esAdmin());

      // Creación: solo durante el registro (el usuario crea su propio doc)
      // El campo rol debe ser 'comprador' (los vendedores los crea el Admin
      // directamente desde su sesión de Admin)
      allow create: if request.auth != null
        && request.auth.uid == uid
        && request.resource.data.rol == 'comprador'
        && request.resource.data.keys().hasAll(['uid', 'email', 'nombre', 'rol', 'fechaRegistro']);

      // Actualización: propio usuario, pero rol/email/fechaRegistro son inmutables
      allow update: if request.auth != null
        && request.auth.uid == uid
        && request.resource.data.rol == resource.data.rol
        && request.resource.data.email == resource.data.email
        && request.resource.data.fechaRegistro == resource.data.fechaRegistro;

      // Eliminación: solo Admin, y no puede eliminarse a sí mismo
      allow delete: if request.auth != null
        && esAdmin()
        && request.auth.uid != uid;
    }

    // ─── Colección: tiendas ──────────────────────────────────────────────────

    match /tiendas/{tiendaId} {

      // Lectura: Admin O UsuarioVendedor propietario
      allow read: if request.auth != null
        && (esAdmin() || resource.data.uidVendedor == request.auth.uid);

      // Creación: solo Admin
      allow create: if request.auth != null
        && esAdmin()
        && request.resource.data.keys().hasAll(['uidVendedor', 'nombreTienda', 'activo', 'fechaCreacion']);

      // Actualización: Admin puede editar todo;
      // Vendedor propietario puede editar solo nombreTienda/descripcion/foto
      allow update: if request.auth != null
        && (
          esAdmin()
          || (
            resource.data.uidVendedor == request.auth.uid
            && request.resource.data.uidVendedor == resource.data.uidVendedor
            && request.resource.data.fechaCreacion == resource.data.fechaCreacion
          )
        );

      // Eliminación: solo Admin
      allow delete: if request.auth != null && esAdmin();
    }

    // ─── Colecciones futuras (placeholder para otras features) ───────────────

    // productos, pedidos, cupones → definidos en sus respectivos planes
  }
}
```

---

## Notas de implementación

1. **`getRol()` hace un `get()` a Firestore en cada evaluación de regla**. Esto
   implica una lectura adicional por operación. Para un proyecto académico esto
   es aceptable. En producción de escala mayor se usarían Custom Claims.

2. **Regla de creación de `usuarios`**: solo permite crear documentos con
   `rol == 'comprador'`. El Admin crea vendedores directamente (con sesión de
   Admin), por lo que la creación de un doc de vendedor desde el Admin no
   dispara esta regla de registro libre — el Admin tiene permisos de escritura
   implícitos por `esAdmin()`. Se necesita una regla `create` separada para
   el Admin:

   ```
   allow create: if request.auth != null
     && (
       // Auto-registro como comprador
       (request.auth.uid == uid && request.resource.data.rol == 'comprador')
       // Admin crea vendedor
       || (esAdmin() && request.resource.data.rol == 'vendedor')
     )
     && request.resource.data.keys().hasAll(['uid', 'email', 'nombre', 'rol', 'fechaRegistro']);
   ```

3. **Eliminación de cuenta**: al eliminar el documento `usuarios/{uid}`, el
   cliente con sesión activa tiene un listener `onSnapshot` que detecta la
   ausencia del documento y fuerza el logout (ver research.md Decisión 2).
   La eliminación de la cuenta en Firebase Auth debe hacerse desde el cliente
   del Admin usando la Firebase Admin SDK o el flujo de re-autenticación
   descrito en research.md Decisión 3.
