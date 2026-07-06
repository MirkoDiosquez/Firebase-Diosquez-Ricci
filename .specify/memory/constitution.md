<!--
SYNC IMPACT REPORT
==================
Version change: (none) → 1.0.0 (initial constitution — created from template)

Modified principles: N/A (first ratification)

Added sections:
  - Core Principles (I–V)
  - Nomenclatura y Calidad de Código
  - Flujo de Trabajo y Deploy
  - Governance

Removed sections: N/A

Templates reviewed:
  - .specify/templates/plan-template.md   ✅ compatible (generic, no changes needed)
  - .specify/templates/spec-template.md   ✅ compatible (generic, no changes needed)
  - .specify/templates/tasks-template.md  ✅ compatible (generic, no changes needed)

Deferred TODOs: none
-->

# FoodApp Constitution

## Core Principles

### I. Stack Tecnológico (NON-NEGOTIABLE)

El proyecto DEBE utilizar exclusivamente el siguiente stack:

- **Frontend**: React con Vite. Cualquier nueva página o componente de UI se
  implementa como componente React funcional.
- **Autenticación**: Firebase Authentication. No se permite ningún otro
  mecanismo de autenticación de usuarios.
- **Base de datos**: Cloud Firestore. No se utilizarán otras bases de datos
  relacionales ni NoSQL externas.
- **Hosting**: Firebase Hosting. El deploy del frontend apunta siempre a
  Firebase Hosting.
- **CI/CD**: GitHub Actions. El pipeline de deploy se dispara automáticamente
  al hacer push a la rama `main`.

No se introducirán dependencias de backend adicionales (servidores Node,
Express, etc.) salvo que se justifique explícitamente en una enmienda a esta
constitución.

### II. Roles de Usuario y Control de Acceso (NON-NEGOTIABLE)

Existen exactamente **tres roles**, mutuamente excluyentes. Un usuario JAMÁS
puede pertenecer a más de un rol simultáneamente.

| Rol                  | Registro         | Puede comprar | Puede vender | Gestiona usuarios/tiendas |
|----------------------|------------------|:-------------:|:------------:|:-------------------------:|
| **Admin**            | Manual / seed    | ✗             | ✗            | ✓                         |
| **UsuarioComprador** | Libre (auto)     | ✓             | ✗            | ✗                         |
| **UsuarioVendedor**  | Solo el Admin    | ✗             | ✓            | ✗                         |

Reglas de acceso obligatorias:

- Cada usuario SOLO puede leer y modificar su propia información. Ningún
  UsuarioComprador o UsuarioVendedor puede acceder a datos de otro usuario.
- El Admin PUEDE leer los perfiles de todos los usuarios (compradores y
  vendedores), pero NO puede realizar pedidos.
- El UsuarioVendedor es creado exclusivamente por el Admin; no existe flujo
  de auto-registro para este rol.
- El UsuarioComprador PUEDE agregar y eliminar sus propias direcciones de
  entrega; nadie más puede modificarlas.

La separación de roles DEBE reflejarse tanto en rutas protegidas del frontend
(según rol autenticado) como en las Firestore Security Rules. No basta con
proteger solo la UI.

### III. Reglas de Negocio (NON-NEGOTIABLE)

Las siguientes reglas son invariantes del dominio y no pueden omitirse en
ninguna implementación:

**Pedidos y estados:**

- El flujo de estados de un pedido es estrictamente secuencial y sin saltos:
  `Pendiente → En Preparación → En Camino → Entregado`.
- Un pedido SOLO puede cancelarse si su estado actual es `Pendiente` o
  `En Preparación`. Una vez en `En Camino` o `Entregado`, la cancelación
  está bloqueada.

**Stock:**

- El stock de un producto se descuenta automáticamente ÚNICAMENTE cuando el
  pedido asociado transita al estado `Entregado`. No se descuenta antes.
- El UsuarioVendedor PUEDE incrementar el stock de sus productos manualmente
  en cualquier momento.

**Carrito y cantidades:**

- El límite máximo de unidades de un mismo producto por pedido es **10**.
- Al alcanzar la cantidad máxima (10 unidades), se aplica un descuento
  automático al precio de ese ítem.

**Cupones de descuento:**

- Los cupones SOLO pueden ser creados por el Admin, con un porcentaje de
  descuento definido en el momento de su creación.
- Los usuarios (compradores) aplican cupones antes de confirmar el pago.
  No se permite aplicar cupones a pedidos ya confirmados.

**Medios de pago:**

- Los únicos medios de pago soportados son: `tarjeta` y `efectivo`.
  No se integrarán pasarelas de pago externas en este proyecto.

### IV. Seguridad y Arquitectura

- Las Firestore Security Rules son la única fuente de verdad para el control
  de acceso a datos. La validación del frontend es complementaria, nunca
  suficiente. MUST implementarse rules que reflejen los tres roles.
- El rol del usuario autenticado se almacena en su documento de Firestore
  (colección `usuarios`) y se verifica desde Security Rules usando
  `get()` cuando sea necesario.
- Las rutas del frontend DEBEN estar protegidas por guards de autenticación
  y rol. Un usuario sin el rol correcto DEBE ser redirigido.
- Nunca almacenar información sensible (contraseñas, tokens) en Firestore
  ni en el estado del cliente más allá de lo que provee Firebase Auth SDK.

### V. Simplicidad y Mantenibilidad

- Se prioriza código simple y legible por sobre abstracciones prematuras.
  Este es un proyecto académico/portfolio: la claridad del código tiene
  mayor valor que la sofisticación arquitectónica.
- Los componentes de React DEBEN ser reutilizables y, cuando el proyecto lo
  permita, tipados con PropTypes o equivalente.
- Se evitan patrones como Redux, Context API compleja o capas de repositorio
  a menos que la complejidad real del proyecto lo justifique.
- Cada módulo/componente tiene una responsabilidad única y clara.

## Nomenclatura y Calidad de Código

- **Idioma de colecciones y campos en Firestore**: español en todo el
  proyecto. Ejemplos canónicos:
  - Colecciones: `usuarios`, `tiendas`, `productos`, `pedidos`, `cupones`
  - Campos: `nombre`, `precio`, `cantidad`, `estado`, `rol`, `stock`,
    `medioDePago`, `descuento`, `direcciones`, `fechaCreacion`
- Los nombres de variables, funciones y componentes en el código fuente
  pueden estar en inglés (convención React/JS estándar), pero los
  identificadores de datos de Firestore DEBEN estar en español.
- Los nombres de componentes React siguen PascalCase.
- Los nombres de archivos de componentes siguen PascalCase (ej:
  `ProductCard.jsx`). Los archivos de servicios/utilidades siguen camelCase
  (ej: `authService.js`).
- No se DEBE dejar código comentado ni `console.log` de depuración en
  commits a `main`.

## Flujo de Trabajo y Deploy

- La rama principal es `main`. El deploy a Firebase Hosting se realiza
  automáticamente vía GitHub Actions al hacer merge/push a `main`.
- Las nuevas funcionalidades se desarrollan en ramas con el formato
  `feature/descripcion-corta`.
- Las Firestore Security Rules se versionan junto al código en el archivo
  `firestore.rules` y se despliegan junto con la aplicación.
- Los índices de Firestore se declaran en `firestore.indexes.json` y
  también se versionan en el repositorio.

## Governance

- Esta constitución es la fuente de verdad para todas las decisiones de
  diseño y arquitectura del proyecto FoodApp.
- Cualquier desviación de los principios I, II y III (marcados como
  NON-NEGOTIABLE) requiere una enmienda explícita a este documento con
  justificación documentada.
- Enmiendas menores (aclaraciones, nuevos campos de Firestore, nuevas
  rutas) incrementan la versión PATCH.
- Adición de nuevas secciones o principios incrementa la versión MINOR.
- Cambios que redefinan roles, flujos de estado de pedidos o el stack
  tecnológico núcleo incrementan la versión MAJOR.
- Todo PR que modifique lógica de negocio, roles o security rules DEBE
  referenciar el principio de esta constitución que lo respalda.

**Version**: 1.0.0 | **Ratified**: 2026-07-06 | **Last Amended**: 2026-07-06
