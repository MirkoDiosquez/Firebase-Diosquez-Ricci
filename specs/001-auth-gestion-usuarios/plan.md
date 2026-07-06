# Implementation Plan: Auth & Gestión de Usuarios (3 Roles)

**Branch**: `001-auth-gestion-usuarios` | **Date**: 2026-07-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-auth-gestion-usuarios/spec.md`

---

## Summary

Implementar el sistema completo de autenticación y gestión de usuarios para
FoodApp con tres roles mutuamente excluyentes (Admin, UsuarioComprador,
UsuarioVendedor). La solución usa Firebase Authentication para identidad,
Cloud Firestore para persistir perfiles y roles, React Router con guards
basados en rol para proteger rutas del frontend, y Firestore Security Rules
como única fuente de verdad para el control de acceso a datos.

El Admin existe como cuenta predefinida (seed). Los compradores se registran
libremente. Los vendedores solo pueden ser creados por el Admin. El campo
`rol` es inmutable una vez asignado. La desconexión de cuentas eliminadas
se gestiona mediante un listener de `onAuthStateChanged` que detecta la
invalidación del token en tiempo real.

---

## Technical Context

**Language/Version**: JavaScript ES2022 / React 18

**Primary Dependencies**:
- `react-router-dom` v6 — ruteo declarativo con `<Outlet>` y guards
- `firebase` v10 SDK — Auth, Firestore
- `tailwindcss` v3 — estilos
- `vite` v5 — bundler y dev server

**Storage**: Cloud Firestore (colecciones: `usuarios`, `tiendas`)

**Testing**: Manual / smoke testing via quickstart.md (no test framework
automatizado en esta iteración, proyecto académico)

**Target Platform**: Web (SPA), Firebase Hosting

**Project Type**: Web application (SPA React + Firebase BaaS)

**Performance Goals**:
- Login/registro completado en < 30 s (SC-002)
- Cambios de perfil reflejados en < 3 s (SC-006)

**Constraints**:
- Contraseña mínima 6 caracteres (restricción Firebase Auth)
- Sin backend propio: toda lógica de negocio en cliente + Firestore Rules
- Sin recuperación de contraseña por email en esta versión (FR-007)
- El campo `rol` es inmutable post-creación (FR-025, Clarification 2026-07-06)
- Email del UsuarioVendedor inmutable una vez creado (FR-019)

**Scale/Scope**: Proyecto académico/portfolio — decenas de usuarios simultáneos

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principio | Validación | Estado |
|-----------|------------|--------|
| I. Stack Tecnológico | React + Vite ✓, Firebase Auth ✓, Firestore ✓, Hosting ✓, GitHub Actions ✓ | ✅ PASS |
| II. Roles & Control de Acceso | 3 roles excluyentes ✓, Admin no compra ✓, Vendedor solo creado por Admin ✓, aislamiento de datos ✓ | ✅ PASS |
| III. Reglas de Negocio | Esta feature no toca pedidos/stock/cupones — fuera de alcance aquí | ✅ N/A |
| IV. Seguridad (Firestore Rules) | Security Rules son fuente de verdad ✓, guards en frontend ✓, `rol` inmutable vía rules ✓ | ✅ PASS |
| V. Simplicidad | Context API (no Redux) ✓, sin capas de repositorio ✓, componentes funcionales ✓ | ✅ PASS |
| Nomenclatura | Colecciones en español: `usuarios`, `tiendas` ✓ | ✅ PASS |

**Resultado**: ✅ Todos los gates pasan. Sin violaciones. Avanzar a Phase 0.

---

## Project Structure

### Documentación (esta feature)

```text
specs/001-auth-gestion-usuarios/
├── plan.md              ← este archivo
├── research.md          ← decisiones técnicas Phase 0
├── data-model.md        ← modelo de datos Firestore
├── quickstart.md        ← guía de validación manual
├── contracts/
│   ├── firestore-rules.md     ← contrato de Security Rules
│   ├── auth-flows.md          ← flujos de autenticación
│   └── routes.md              ← contrato de rutas protegidas
└── tasks.md             ← generado por /speckit.tasks (aún no creado)
```

### Código fuente (raíz del repositorio)

```text
src/
├── main.jsx                        ← entry point, Firebase init
├── App.jsx                         ← router raíz
├── context/
│   └── AuthContext.jsx             ← usuario autenticado + rol, onAuthStateChanged
├── hooks/
│   └── useAuth.js                  ← consumidor de AuthContext
├── routes/
│   ├── PrivateRoute.jsx            ← guard genérico (requiere autenticación)
│   └── RoleRoute.jsx               ← guard por rol (redirige si rol no coincide)
├── services/
│   ├── auth.js                     ← register, login, logout (Firebase Auth)
│   └── usuarios.js                 ← getUsuario, updateUsuario (Firestore)
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── comprador/
│   │   └── PerfilComprador.jsx
│   ├── vendedor/
│   │   └── PerfilVendedor.jsx
│   └── admin/
│       ├── PanelAdmin.jsx
│       ├── ListaUsuarios.jsx
│       ├── DetalleUsuario.jsx
│       └── GestionTiendas.jsx
└── components/
    ├── forms/
    │   ├── LoginForm.jsx
    │   ├── RegisterForm.jsx
    │   └── PerfilForm.jsx
    └── ui/
        └── LoadingSpinner.jsx

firestore.rules                     ← security rules (raíz del repo)
```

**Structure Decision**: SPA única (Option 1 adaptado para web app). No hay
backend separado; toda la lógica de acceso a datos pasa por el SDK de
Firebase en el cliente, protegida por Firestore Security Rules.

---

## Complexity Tracking

> Sin violaciones de constitución en esta feature. Tabla no aplicable.
