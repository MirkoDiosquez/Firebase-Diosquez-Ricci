# Quickstart: Validación Manual — Auth & Gestión de Usuarios

**Feature**: `001-auth-gestion-usuarios`
**Date**: 2026-07-06

Esta guía describe los escenarios de validación manual end-to-end para
confirmar que la feature funciona correctamente una vez implementada.
No es un test automatizado; es una guía de smoke testing paso a paso.

---

## Prerequisitos

1. El proyecto tiene las variables de entorno de Firebase configuradas en
   `.env.local` (VITE_FIREBASE_API_KEY, etc.).
2. El emulador local de Firebase está corriendo **O** se usa el proyecto
   Firebase real de desarrollo.
3. La cuenta Admin fue creada con el script de seed:
   ```
   node src/scripts/seedAdmin.js
   ```
   Email del Admin: definido en `.env.local` como `VITE_ADMIN_EMAIL`.
4. La app está corriendo: `npm run dev` → `http://localhost:5173`

---

## Escenario 1 — Registro e inicio de sesión de UsuarioComprador

**Referencia**: US1 / FR-001 a FR-009

| Paso | Acción | Resultado esperado |
|---|---|---|
| 1 | Ir a `http://localhost:5173/register` | Formulario de registro visible |
| 2 | Completar nombre, email nuevo, contraseña de 6+ caracteres y enviar | Redirige a `/perfil`; usuario autenticado como comprador |
| 3 | Recargar la página | Sesión persiste; sigue en `/perfil` |
| 4 | Ir manualmente a `/admin/usuarios` | Redirige a `/perfil` (acceso denegado) |
| 5 | Cerrar sesión | Redirige a `/login` |
| 6 | Intentar acceder a `/perfil` sin sesión | Redirige a `/login` |
| 7 | Iniciar sesión con las credenciales registradas | Redirige a `/perfil` |

**Validaciones adicionales**:
- Intentar registrarse con el mismo email → muestra error "email ya registrado"
- Intentar con contraseña de 5 caracteres → muestra error de validación
- Intentar con email inválido → muestra error de formato

---

## Escenario 2 — Edición de perfil propio (UsuarioComprador)

**Referencia**: US2 / FR-012, FR-014

| Paso | Acción | Resultado esperado |
|---|---|---|
| 1 | Autenticarse como comprador, ir a `/perfil` | Datos del perfil visibles |
| 2 | Editar el nombre y guardar | Los cambios persisten; se muestran inmediatamente |
| 3 | Recargar → verificar en Firestore console | El documento `usuarios/{uid}` tiene el nombre actualizado |
| 4 | Verificar en Firestore que el campo `rol` no cambió | `rol` sigue siendo `'comprador'` |

---

## Escenario 3 — Login del Admin y gestión de usuarios

**Referencia**: US3 / FR-011, FR-015 a FR-022

| Paso | Acción | Resultado esperado |
|---|---|---|
| 1 | Ir a `/login` y autenticarse con credenciales de Admin | Redirige a `/admin/usuarios` |
| 2 | Verificar lista de usuarios | Muestra compradores y vendedores existentes |
| 3 | Crear un UsuarioVendedor nuevo (nombre, email, contraseña, descripción) | Vendedor aparece en la lista; tienda visible en `/admin/tiendas` |
| 4 | Editar datos de la tienda creada (nombre o descripción) | Cambios reflejados en la lista |
| 5 | Ir a `/perfil` o `/carrito` como Admin | Redirige a `/admin/usuarios` (acceso denegado) |
| 6 | Eliminar al UsuarioComprador creado en Escenario 1 | El comprador ya no aparece en la lista |

---

## Escenario 4 — Login del UsuarioVendedor

**Referencia**: US4 / FR-009, FR-010, FR-013

| Paso | Acción | Resultado esperado |
|---|---|---|
| 1 | Cerrar sesión de Admin; iniciar sesión con el vendedor creado en Escenario 3 | Redirige a `/vendedor/perfil` |
| 2 | Ver los datos de su propia tienda | Nombre, descripción y foto visibles |
| 3 | Editar nombre de tienda y guardar | Cambios persistidos y visibles |
| 4 | Ir manualmente a `/admin/usuarios` | Redirige a `/vendedor/perfil` |
| 5 | Ir manualmente a `/perfil` (ruta de comprador) | Redirige a `/vendedor/perfil` |

---

## Escenario 5 — Desconexión en tiempo real al eliminar cuenta (FR-026)

**Referencia**: FR-026 / research.md Decisión 2

| Paso | Acción | Resultado esperado |
|---|---|---|
| 1 | Autenticar un UsuarioComprador en una pestaña del navegador | Sesión activa visible en `/perfil` |
| 2 | En otra pestaña (o navegador), autenticar como Admin | Sesión de Admin activa |
| 3 | Desde el Admin, eliminar la cuenta del comprador activo | — |
| 4 | Volver a la pestaña del comprador | En menos de 5 segundos, la app redirige a `/login` |
| 5 | Intentar iniciar sesión nuevamente con las credenciales del comprador eliminado | Login falla o el flujo detecta que no hay documento de perfil y fuerza logout |

---

## Escenario 6 — Inmutabilidad del campo `rol`

**Referencia**: FR-025 / contracts/firestore-rules.md

| Paso | Acción | Resultado esperado |
|---|---|---|
| 1 | Autenticar como comprador | Sesión activa |
| 2 | Desde la consola del navegador, intentar escribir directamente a Firestore: `updateDoc(doc(db, 'usuarios', uid), { rol: 'admin' })` | La operación falla con error de permisos (PERMISSION_DENIED) |
| 3 | Verificar en Firestore console que el campo `rol` no cambió | `rol` sigue siendo `'comprador'` |

---

## Checklist de Validación Post-Deploy

- [ ] Todos los escenarios 1–6 pasan en el entorno de desarrollo local
- [ ] Todos los escenarios 1–6 pasan con el emulador de Firebase
- [ ] Las Security Rules están desplegadas (`firebase deploy --only firestore:rules`)
- [ ] La cuenta Admin fue creada con el script de seed antes del primer acceso
- [ ] Ninguna ruta protegida es accesible sin autenticación (verificar con
      DevTools → Application → Clear Storage → navegar a rutas protegidas)
