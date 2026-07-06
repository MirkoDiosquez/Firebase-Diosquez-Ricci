# Data Model: Auth & Gestión de Usuarios

**Feature**: `001-auth-gestion-usuarios`
**Date**: 2026-07-06

---

## Colección: `usuarios`

**Ruta**: `/usuarios/{uid}`
**Descripción**: Documento de perfil de cada usuario del sistema. El `uid`
coincide con el UID de Firebase Authentication.

| Campo | Tipo | Obligatorio | Inmutable | Descripción |
|---|---|:---:|:---:|---|
| `uid` | `string` | ✓ | ✓ | UID de Firebase Auth (mismo que el ID del documento) |
| `email` | `string` | ✓ | ✓ | Email de autenticación. No editable post-creación |
| `nombre` | `string` | ✓ | ✗ | Nombre completo o nombre de usuario |
| `rol` | `string` | ✓ | ✓ | Enum: `'admin'` \| `'comprador'` \| `'vendedor'` |
| `foto` | `string` | ✗ | ✗ | URL de foto de perfil (texto, no binario) |
| `fechaRegistro` | `timestamp` | ✓ | ✓ | Timestamp de creación. Escrito en la creación, nunca modificado |

**Restricciones**:
- `rol` NUNCA puede ser modificado por el propio usuario (Firestore Rule).
- `email` solo es de lectura en Firestore; los cambios de email (no soportados
  en esta versión) requerirían operaciones en Firebase Auth.
- Solo existe un documento por usuario; relación 1:1 con Firebase Auth.
- El campo `rol` usa valores en minúscula (`'admin'`, `'comprador'`,
  `'vendedor'`) para consistencia con las Security Rules.

**Ejemplo — UsuarioComprador**:
```json
{
  "uid": "abc123",
  "email": "juan@email.com",
  "nombre": "Juan Pérez",
  "rol": "comprador",
  "foto": "https://example.com/fotos/juan.jpg",
  "fechaRegistro": "2026-07-06T10:00:00Z"
}
```

**Ejemplo — UsuarioVendedor**:
```json
{
  "uid": "xyz789",
  "email": "pizzeria@foodapp.com",
  "nombre": "Pizzería Don Carlos",
  "rol": "vendedor",
  "foto": null,
  "fechaRegistro": "2026-07-06T11:00:00Z"
}
```

**Ejemplo — Admin**:
```json
{
  "uid": "adminUID",
  "email": "admin@foodapp.com",
  "nombre": "Admin",
  "rol": "admin",
  "foto": null,
  "fechaRegistro": "2026-07-06T09:00:00Z"
}
```

---

## Colección: `tiendas`

**Ruta**: `/tiendas/{tiendaId}`
**Descripción**: Perfil extendido de cada UsuarioVendedor. Relación 1:1 con
un documento de `usuarios` cuyo `rol == 'vendedor'`. El ID del documento
puede ser autogenerado por Firestore o puede coincidir con el `uid` del
vendedor (recomendado para simplificar queries).

| Campo | Tipo | Obligatorio | Inmutable | Descripción |
|---|---|:---:|:---:|---|
| `id` | `string` | ✓ | ✓ | ID del documento (= `uidVendedor` recomendado) |
| `uidVendedor` | `string` | ✓ | ✓ | UID del UsuarioVendedor propietario. Referencia a `usuarios/{uid}` |
| `nombreTienda` | `string` | ✓ | ✗ | Nombre público de la tienda |
| `descripcion` | `string` | ✗ | ✗ | Descripción de la tienda |
| `foto` | `string` | ✗ | ✗ | URL de foto/logo de la tienda |
| `activo` | `boolean` | ✓ | ✗ | `true` cuando la tienda está activa. El Admin puede desactivarla |
| `fechaCreacion` | `timestamp` | ✓ | ✓ | Timestamp de creación de la tienda |

**Restricciones**:
- Solo el Admin puede crear, editar `(nombreTienda, descripcion, foto)` y
  eliminar documentos de `tiendas` (Firestore Rule).
- El UsuarioVendedor puede editar `nombreTienda`, `descripcion` y `foto`
  de su propia tienda (donde `uidVendedor == request.auth.uid`).
- `uidVendedor` es inmutable post-creación.
- El campo `email` del vendedor NO está en `tiendas`; se lee desde
  `usuarios/{uidVendedor}`.

**Ejemplo**:
```json
{
  "id": "xyz789",
  "uidVendedor": "xyz789",
  "nombreTienda": "Pizzería Don Carlos",
  "descripcion": "Las mejores pizzas artesanales de la ciudad",
  "foto": "https://example.com/tiendas/doncarlos.jpg",
  "activo": true,
  "fechaCreacion": "2026-07-06T11:00:00Z"
}
```

---

## Relaciones entre Colecciones (scope de esta feature)

```
Firebase Auth
    │
    │ uid (clave de identidad)
    ▼
usuarios/{uid}
    │ rol == 'vendedor'
    │ uid == uidVendedor
    ▼
tiendas/{tiendaId}
    │ tiendaId (referencia)
    ▼
productos/{productoId}     ← colección de productos por tienda
    │
pedidos/{pedidoId}         ← ordenes creadas por compradores
```

---

## Transiciones de Estado Relevantes

### Ciclo de vida de un Usuario

```
[no existe]
    │  register() / Admin crea vendedor
    ▼
[activo — doc en usuarios + cuenta en Auth]
    │  Admin elimina cuenta
    ▼
[eliminado — doc borrado + cuenta Auth borrada]
    │  (sesión activa invalidada por listener onSnapshot)
    ▼
[desconectado — redirigido a /login]
```

### Ciclo de vida de una Tienda

```
[no existe]
    │  Admin crea tienda
    ▼
[activa  (activo: true)]
    │  Admin cambia activo a false
    ▼
[inactiva (activo: false)]
    │  Admin elimina tienda
    ▼
[eliminada — documento borrado, cuenta vendedor borrada]
```

---

## Validaciones de Escritura (resumen para Security Rules)

| Colección | Operación | Actor permitido | Condición adicional |
|---|---|---|---|
| `usuarios` | `create` | Sistema (Auth trigger / seed) | `rol` válido, todos los campos obligatorios |
| `usuarios` | `read` | Propio usuario ó Admin | `uid == request.auth.uid` ó `rol == 'admin'` |
| `usuarios` | `update` | Propio usuario | `rol` no cambia, `email` no cambia, `fechaRegistro` no cambia |
| `usuarios` | `delete` | Solo Admin | `rol != 'admin'` (no puede eliminarse a sí mismo) |
| `tiendas` | `create` | Solo Admin | — |
| `tiendas` | `read` | Admin ó UsuarioVendedor propietario | `uidVendedor == request.auth.uid` ó `rol == 'admin'` |
| `tiendas` | `update` | Admin ó UsuarioVendedor propietario | `uidVendedor` inmutable |
| `tiendas` | `delete` | Solo Admin | — |

---

## Colección: `productos`

**Ruta**: `/productos/{productoId}`
**Descripción**: Ítems del catálogo de una tienda. ID autogenerado por Firestore.

| Campo | Tipo | Obligatorio | Inmutable | Descripción |
|---|---|:---:|:---:|---|
| `uid` | `string` | ✓ | ✓ | ID del documento (autogenerado) |
| `uidTienda` | `string` | ✓ | ✓ | UID del vendedor propietario |
| `nombre` | `string` | ✓ | ✗ | Nombre del producto |
| `descripcion` | `string` | ✗ | ✗ | Descripción del producto |
| `precio` | `number` | ✓ | ✗ | Precio en pesos |
| `foto` | `string` | ✗ | ✗ | URL de imagen |
| `disponible` | `boolean` | ✓ | ✗ | `true` = visible para compradores |
| `fechaCreacion` | `timestamp` | ✓ | ✓ | Timestamp de creación |

---

## Colección: `pedidos`

**Ruta**: `/pedidos/{pedidoId}`
**Descripción**: Órdenes de compra creadas por compradores. ID autogenerado.

| Campo | Tipo | Obligatorio | Inmutable | Descripción |
|---|---|:---:|:---:|---|
| `uid` | `string` | ✓ | ✓ | ID del documento |
| `uidComprador` | `string` | ✓ | ✓ | UID del comprador |
| `uidVendedor` | `string` | ✓ | ✓ | UID del vendedor (= uidTienda) |
| `nombreTienda` | `string` | ✓ | ✓ | Denormalizado para display |
| `items` | `array` | ✓ | ✓ | Array de `{productoId, nombre, precio, cantidad, subtotal}` |
| `total` | `number` | ✓ | ✓ | Suma total del pedido |
| `estado` | `string` | ✓ | ✗ | `pendiente` \| `confirmado` \| `en_camino` \| `entregado` \| `cancelado` |
| `fechaCreacion` | `timestamp` | ✓ | ✓ | Timestamp de creación |
| `fechaActualizacion` | `timestamp` | ✓ | ✗ | Última modificación de estado |
