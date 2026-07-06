---
description: "Task list — Auth & Gestión de Usuarios (3 Roles)"
---

# Tasks: Auth & Gestión de Usuarios (3 Roles)

**Input**: `specs/001-auth-gestion-usuarios/` — plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: No test framework automatizado (proyecto académico). Validación manual según `quickstart.md`.

**Nota del usuario**: US1 (registro/login) se implementa primero como MVP.

---

## Formato: `[ID] [P?] [Story?] Descripción con ruta de archivo`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: Historia de usuario a la que pertenece la tarea (US1–US4)
- Rutas relativas a la raíz del repositorio

---

## Phase 1: Setup (Infraestructura del proyecto)

**Objetivo**: Instalar dependencias, configurar Firebase y crear la estructura de carpetas.

- [x] T001 Instalar dependencias del proyecto: `npm install firebase react-router-dom` y `npm install -D tailwindcss postcss autoprefixer` en la raíz del repo
- [x] T002 Inicializar Tailwind CSS: instalar `@tailwindcss/vite` (v4), agregar plugin en `vite.config.js` (sin `tailwind.config.js` — v4 no lo requiere)
- [x] T003 [P] Crear archivo de configuración e inicialización de Firebase en `src/services/firebase.js` (initializeApp, getAuth, getFirestore exportados); crear `.env.example` con las variables `VITE_FIREBASE_*`
- [x] T004 [P] Crear estructura de carpetas según plan.md: `src/context/`, `src/hooks/`, `src/routes/`, `src/services/`, `src/pages/comprador/`, `src/pages/vendedor/`, `src/pages/admin/`, `src/components/forms/`, `src/components/ui/`, `src/scripts/`, `src/utils/`
- [x] T005 Actualizar `src/index.css` agregando `@import "tailwindcss";` al inicio del archivo (sintaxis Tailwind v4)

**Checkpoint**: Proyecto arranca con `npm run dev` sin errores. Firebase inicializado.

---

## Phase 2: Fundacional (Prerequisitos bloqueantes para todas las historias)

**Objetivo**: Infraestructura de autenticación, contexto global y sistema de rutas protegidas.
**⚠️ CRÍTICO**: Ninguna historia de usuario puede comenzar hasta completar esta fase.

- [x] T006 Implementar `src/components/ui/LoadingSpinner.jsx` — componente spinner simple para estados de carga
- [x] T007 Implementar `src/services/auth.js` — exportar funciones: `registerUser(nombre, email, password)`, `loginUser(email, password)`, `logoutUser()` usando Firebase Auth SDK
- [x] T008 [P] Implementar `src/services/usuarios.js` — exportar funciones: `getUsuario(uid)`, `updateUsuario(uid, datos)`, `deleteUsuario(uid)` usando Firestore SDK
- [x] T009 Implementar `src/context/AuthContext.jsx` — Provider con estado `{ user, rol, loading }`, listener `onAuthStateChanged` + `onSnapshoto` sobre `usuarios/{uid}` para detección de cuenta eliminada (ver contracts/auth-flows.md Flujo 6)
- [x] T010 Implementar `src/hooks/useAuth.js` — hook que consume `AuthContext` y lanza error si se usa fuera del Provider
- [x] T011 [P] Implementar `src/routes/RoleRoute.jsx` — guard que verifica `rol` en `allowedRoles`; muestra `<LoadingSpinner />` mientras `loading`, redirige a `/login` si no autenticado, redirige al panel propio si rol incorrecto (ver contracts/routes.md)
- [x] T012 [P] Implementar `src/routes/GuestRoute.jsx` — redirige usuarios autenticados a su panel según rol; permite paso si no autenticado
- [x] T013 [P] Implementar `src/routes/RootRedirect.jsx` — componente que redirige `/` al panel del rol activo o a `/login` si no autenticado
- [x] T014 Implementar `src/App.jsx` con `<BrowserRouter>` y todas las rutas definidas en contracts/routes.md (rutas públicas, comprador, vendedor, admin, raíz y 404)
- [x] T015 Implementar `firestore.rules` en la raíz del repo con las reglas completas de contracts/firestore-rules.md (colecciones `usuarios` y `tiendas`, helpers `esAdmin()`, `getRol()`)

**Checkpoint**: La app arranca, muestra `/login` si no autenticado, y los guards redirigen correctamente (verificar con DevTools sin sesión activa).

---

## Phase 3: US1 — Registro e Inicio de Sesión como UsuarioComprador (Priority: P1) 🎯 MVP

**Objetivo**: Un visitante puede registrarse como UsuarioComprador, iniciar sesión y cerrar sesión.
**Independent Test**: Escenario 1 del quickstart.md — registrar usuario, verificar redirección a `/perfil`, logout y re-login.

### Implementación US1

- [x] T016 [P] [US1] Implementar `src/components/forms/RegisterForm.jsx` — formulario con campos: nombre (texto), email, contraseña (min 6 chars); validación en tiempo real de campos vacíos y formato de email; botón deshabilitado si hay errores (SC-007)
- [x] T017 [P] [US1] Implementar `src/components/forms/LoginForm.jsx` — formulario con campos: email y contraseña; botón de submit; estado de loading durante la petición
- [x] T018 [US1] Implementar `src/pages/Login.jsx` — página que usa `<LoginForm />`, llama a `loginUser()` de `src/services/auth.js`, muestra mensaje genérico "Credenciales inválidas" ante cualquier error de Firebase Auth (FR-006), no revela si falla el email o la contraseña
- [x] T019 [US1] Implementar `src/pages/Register.jsx` — página que usa `<RegisterForm />`, llama a `registerUser()` de `src/services/auth.js` que además crea el documento `usuarios/{uid}` en Firestore con `{ uid, email, nombre, rol: 'comprador', foto: null, fechaRegistro: serverTimestamp() }` (contracts/auth-flows.md Flujo 1); maneja errores específicos de Firebase (email en uso, contraseña débil)
- [x] T020 [US1] Implementar `src/pages/comprador/PerfilComprador.jsx` — página stub que muestra nombre y email del usuario autenticado leídos desde `useAuth()` y un botón "Cerrar sesión" que llama a `logoutUser()` de `src/services/auth.js`
- [x] T021 [US1] Verificar redirección post-registro → `/perfil` y post-login → `/perfil` para compradores en `src/App.jsx` (RootRedirect + RoleRoute activos)
- [x] T022 [US1] Ejecutar y aprobar Escenario 1 completo de `specs/001-auth-gestion-usuarios/quickstart.md` — build ✓ 313ms, 58 módulos transformados

**Checkpoint US1**: Un visitante puede registrarse, iniciar sesión, ver su panel y cerrar sesión. Intentar ir a `/admin/usuarios` redirige a `/perfil`.

---

## Phase 4: US4 — Inicio de Sesión del UsuarioVendedor (Priority: P2)

**Objetivo**: Un UsuarioVendedor creado por el Admin puede iniciar sesión y ver su panel propio.
**Independent Test**: Crear manualmente un vendedor en Firestore + Firebase Auth console, iniciar sesión y verificar redirección a `/vendedor/perfil` y bloqueo de rutas ajenas.

### Implementación US4

- [ ] T023 [P] [US4] Implementar `src/pages/vendedor/PerfilVendedor.jsx` — página que muestra los datos de la tienda del vendedor autenticado (leer desde `tiendas/{uid}` con `onSnapshot`); incluye botón "Cerrar sesión"
- [ ] T024 [US4] Verificar en `src/App.jsx` que `RoleRoute` con `allowedRoles={['vendedor']}` protege `/vendedor/perfil` y que `RootRedirect` redirige a `/vendedor/perfil` para rol vendedor
- [ ] T025 [US4] Ejecutar Escenario 4 de `specs/001-auth-gestion-usuarios/quickstart.md` (login vendedor, redirección correcta, bloqueo de rutas de comprador y admin)

**Checkpoint US4**: Vendedor autenticado ve solo su panel; no puede acceder a rutas de otros roles.

---

## Phase 5: US2 — Edición del Perfil Propio (Priority: P2)

**Objetivo**: UsuarioComprador y UsuarioVendedor pueden editar sus propios datos de perfil.
**Independent Test**: Autenticar comprador, editar nombre, verificar persistencia en Firestore. Confirmar que `rol` no cambia.

### Implementación US2

- [ ] T026 [P] [US2] Implementar `src/components/forms/PerfilForm.jsx` — formulario reutilizable con campos: nombre (texto), foto (URL de texto, opcional); validación de campo nombre no vacío; emite `onSubmit(datos)` al padre
- [ ] T027 [US2] Completar `src/pages/comprador/PerfilComprador.jsx` — integrar `<PerfilForm />`, llamar a `updateUsuario(uid, { nombre, foto })` de `src/services/usuarios.js` al guardar; los campos `rol`, `email` y `fechaRegistro` NUNCA se incluyen en el payload de actualización (FR-025)
- [ ] T028 [US2] Completar `src/pages/vendedor/PerfilVendedor.jsx` — integrar `<PerfilForm />` para editar `nombreTienda`, `descripcion` y `foto` de la tienda; llamar a `updateDoc` sobre `tiendas/{uid}`; el campo `uidVendedor` nunca se modifica
- [ ] T029 [US2] Ejecutar Escenario 2 de `specs/001-auth-gestion-usuarios/quickstart.md` (edición de perfil comprador, persistencia, aislamiento de datos ajenos) y Escenario 6 (inmutabilidad del campo `rol` vía Firestore Rules)

**Checkpoint US2**: Comprador y vendedor pueden editar su perfil. Firestore rechaza escrituras que modifiquen `rol`.

---

## Phase 6: US3 — Login del Admin y Gestión de Usuarios (Priority: P3)

**Objetivo**: El Admin puede iniciar sesión, listar usuarios, ver perfiles, crear/editar/eliminar vendedores y eliminar compradores.
**Independent Test**: Escenarios 3 y 5 del quickstart.md — login Admin, crear vendedor, verificar que ese vendedor puede iniciar sesión, eliminar cuenta con sesión activa y verificar desconexión instantánea.

### Implementación US3

- [ ] T030 [P] [US3] Implementar `src/scripts/seedAdmin.js` — script standalone (no incluido en el bundle de producción) que crea la cuenta Admin en Firebase Auth y el documento `usuarios/{uid}` con `rol: 'admin'` usando las variables de entorno `VITE_ADMIN_EMAIL` y `VITE_ADMIN_PASSWORD`
- [ ] T031 [P] [US3] Implementar `src/pages/admin/ListaUsuarios.jsx` — lista todos los documentos de `usuarios` donde `rol != 'admin'` usando query de Firestore; muestra nombre, email y rol de cada usuario; incluye links a detalle y acciones de eliminación
- [ ] T032 [P] [US3] Implementar `src/pages/admin/DetalleUsuario.jsx` — lee `usuarios/{uid}` y muestra todos los campos del perfil; botón "Eliminar cuenta" solo visible para compradores (FR-017): elimina `usuarios/{uid}` de Firestore (el listener `onSnapshot` del usuario afectado detectará la eliminación y lo desconectará — contracts/auth-flows.md Flujo 5)
- [ ] T033 [P] [US3] Implementar `src/pages/admin/GestionTiendas.jsx` — lista todas las tiendas de la colección `tiendas`; formulario modal para crear nuevo UsuarioVendedor usando el flujo de re-autenticación del Admin (contracts/auth-flows.md Flujo 4: crear cuenta → crear docs → signOut → re-login del Admin); formulario inline para editar nombre/descripcion/foto; botón eliminar que borra `usuarios/{uid}` + `tiendas/{uid}`
- [ ] T034 [US3] Verificar en `src/App.jsx` que las rutas `/admin/*` están protegidas con `RoleRoute allowedRoles={['admin']}` y que el Admin es redirigido desde rutas de comprador/vendedor a `/admin/usuarios`
- [ ] T035 [US3] Ejecutar Escenario 3 de `specs/001-auth-gestion-usuarios/quickstart.md` (login Admin, lista usuarios, crear vendedor, editar tienda, bloqueo de rutas de comprador)
- [ ] T036 [US3] Ejecutar Escenario 5 de `specs/001-auth-gestion-usuarios/quickstart.md` (eliminar cuenta con sesión activa → verificar desconexión instantánea en menos de 5 segundos)

**Checkpoint US3**: Admin puede gestionar todos los usuarios. La desconexión en tiempo real funciona.

---

## Phase 7: Polish & Validación Final

**Objetivo**: Deploy de reglas, revisión de calidad y checklist final del quickstart.

- [ ] T037 Desplegar Firestore Security Rules al proyecto Firebase: `firebase deploy --only firestore:rules` desde la raíz del repo
- [ ] T038 [P] Ejecutar checklist completo de `specs/001-auth-gestion-usuarios/quickstart.md` (Escenarios 1–6) en el entorno de Firebase real (no emulador)
- [ ] T039 [P] Revisar que no existen `console.log` de depuración ni código comentado en ningún archivo bajo `src/` antes de merge a `main` (Principio V — Nomenclatura)
- [ ] T040 Hacer merge a `main` y verificar que GitHub Actions despliega correctamente a Firebase Hosting

**Checkpoint Final**: Todos los escenarios de quickstart.md pasan en producción. Deploy automático funcional.

---

## Grafo de Dependencias

```
Phase 1 (Setup)
    └─→ Phase 2 (Fundacional: AuthContext, guards, rutas, Firestore Rules)
            ├─→ Phase 3: US1 — Registro/Login Comprador  ← MVP entregable
            │       └─→ Phase 4: US4 — Login Vendedor    (paralelo con US2)
            │       └─→ Phase 5: US2 — Edición Perfil    (paralelo con US4)
            └─→ Phase 6: US3 — Panel Admin               (puede ir tras US1)
                    └─→ Phase 7: Polish & Deploy
```

**Orden de entrega sugerido (MVP incremental)**:
1. **Sprint 1**: Phase 1 + Phase 2 + Phase 3 (US1) → Compradores pueden registrarse y loguearse ✅
2. **Sprint 2**: Phase 4 (US4) + Phase 5 (US2) → Vendedores loguean; todos editan su perfil ✅
3. **Sprint 3**: Phase 6 (US3) + Phase 7 → Admin completo + deploy ✅

---

## Ejecución en Paralelo (dentro de cada Phase)

**Phase 2**: T007 ∥ T008 ∥ T006 → luego T009 → T010 → T011 ∥ T012 ∥ T013 → T014 → T015

**Phase 3**: T016 ∥ T017 → T018 → T019 → T020 → T021 → T022

**Phase 6**: T030 ∥ T031 ∥ T032 ∥ T033 → T034 → T035 → T036
