# Feature Specification: Autenticación y Gestión de Usuarios (3 Roles)

**Feature Branch**: `001-auth-gestion-usuarios`

**Created**: 2026-07-06

**Status**: Draft

**Input**: Sistema de autenticación y gestión de usuarios con 3 roles (Admin,
UsuarioComprador, UsuarioVendedor). Registro libre para compradores, sesión
para todos los roles, gestión de vendedores solo por Admin, y aislamiento
estricto de datos entre usuarios.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registro e inicio de sesión como UsuarioComprador (Priority: P1)

Un visitante sin cuenta accede a la aplicación y desea registrarse para poder
realizar pedidos. Completa un formulario con sus datos básicos, obtiene su
cuenta y queda autenticado. En visitas posteriores inicia sesión con email y
contraseña, y puede cerrar sesión cuando lo desee.

**Why this priority**: Es el flujo de entrada de todos los compradores. Sin
esta historia, ningún comprador puede usar la aplicación. Es el MVP mínimo
del módulo de autenticación.

**Independent Test**: Se puede verificar de forma aislada registrando un
usuario nuevo, comprobando que aparece en el sistema y que puede iniciar y
cerrar sesión correctamente, sin necesidad de ningún otro rol ni funcionalidad.

**Acceptance Scenarios**:

1. **Given** un visitante no autenticado está en la página de registro,
   **When** completa nombre, email válido y contraseña (mín. 6 caracteres) y
   envía el formulario,
   **Then** se crea su cuenta con rol `UsuarioComprador`, queda autenticado y
   es redirigido a su panel de comprador.

2. **Given** un visitante intenta registrarse con un email ya existente,
   **When** envía el formulario de registro,
   **Then** se muestra un mensaje de error indicando que el email ya está en uso
   y no se crea una cuenta duplicada.

3. **Given** un UsuarioComprador registrado accede a la página de inicio de
   sesión,
   **When** ingresa su email y contraseña correctos,
   **Then** queda autenticado y es redirigido a su panel de comprador.

4. **Given** alguien ingresa credenciales incorrectas,
   **When** intenta iniciar sesión,
   **Then** se muestra un mensaje de error genérico (no se revela si el email
   o la contraseña son incorrectos) y no se otorga acceso.

5. **Given** un UsuarioComprador autenticado,
   **When** presiona "Cerrar sesión",
   **Then** su sesión termina y es redirigido a la página pública de inicio.

---

### User Story 2 - Edición del perfil propio (UsuarioComprador y UsuarioVendedor) (Priority: P2)

Un usuario autenticado (comprador o vendedor) puede consultar y editar los
datos de su propio perfil (nombre, foto de perfil, descripción en el caso del
vendedor, etc.). No puede acceder ni modificar datos de ningún otro usuario.

**Why this priority**: Necesario para que los usuarios mantengan su información
actualizada. Aplica a dos roles y establece el principio de aislamiento de datos
que es central en la constitución del proyecto.

**Independent Test**: Se puede verificar autenticando un comprador, editando
su nombre y comprobando que los cambios persisten. Adicionalmente verificar que
al intentar acceder a la ruta de perfil de otro usuario es redirigido o recibe
error de acceso denegado.

**Acceptance Scenarios**:

1. **Given** un UsuarioComprador autenticado en su sección de perfil,
   **When** modifica su nombre o foto y guarda,
   **Then** los datos actualizados se persisten y se muestran inmediatamente.

2. **Given** un UsuarioComprador autenticado,
   **When** intenta acceder a la ruta de perfil de otro usuario (por URL
   directa),
   **Then** es redirigido a su propio perfil o a una página de acceso
   denegado; nunca ve datos ajenos.

3. **Given** un UsuarioVendedor autenticado en su panel,
   **When** edita el nombre, foto o descripción de su tienda,
   **Then** los cambios se reflejan en su perfil de tienda.

4. **Given** un UsuarioVendedor autenticado,
   **When** intenta acceder al perfil de otra tienda o de un comprador,
   **Then** recibe acceso denegado y no se le muestran datos ajenos.

---

### User Story 3 - Inicio de sesión del Admin y gestión de usuarios (Priority: P3)

El Admin accede a la aplicación con credenciales predefinidas (no se registra
desde la app). Una vez dentro, puede ver la lista completa de usuarios
(compradores y vendedores), ver el detalle de cada perfil, eliminar
UsuariosCompradores, y crear / editar / eliminar cuentas de UsuarioVendedor
(tiendas).

**Why this priority**: La gestión de vendedores es un requisito de negocio
(los vendedores no pueden autoregistrarse), pero el sistema funciona como MVP
de compras sin que el Admin haya creado aún ningún vendedor. Por eso es P3
respecto al flujo de comprador.

**Independent Test**: Se puede verificar accediendo con la cuenta Admin,
listando usuarios (la lista puede estar vacía inicialmente), creando un
UsuarioVendedor nuevo, verificando que puede iniciar sesión con esas
credenciales, y luego eliminarlo desde el panel Admin.

**Acceptance Scenarios**:

1. **Given** el Admin accede a la página de inicio de sesión,
   **When** ingresa las credenciales de Admin predefinidas,
   **Then** queda autenticado y es redirigido al panel de administración,
   con acceso a la lista de todos los usuarios.

2. **Given** el Admin en el panel de usuarios,
   **When** consulta la lista,
   **Then** ve todos los UsuariosCompradores y UsuariosVendedores existentes,
   con nombre, email y rol de cada uno. No ve a otros Admins.

3. **Given** el Admin visualiza el detalle de un perfil,
   **When** abre el perfil de cualquier comprador o vendedor,
   **Then** ve toda la información de ese perfil sin poder realizar pedidos
   ni acceder a funciones de compra.

4. **Given** el Admin selecciona un UsuarioComprador para eliminar,
   **When** confirma la eliminación,
   **Then** la cuenta y todos los datos asociados son eliminados del sistema
   y el usuario ya no puede iniciar sesión.

5. **Given** el Admin en el panel de gestión de tiendas,
   **When** completa el formulario de nueva tienda (nombre, email,
   contraseña, descripción) y confirma,
   **Then** se crea una cuenta UsuarioVendedor con esos datos y la tienda
   queda disponible en el sistema.

6. **Given** el Admin edita los datos de una tienda existente,
   **When** modifica nombre, descripción u otros campos y guarda,
   **Then** los cambios se persisten y el UsuarioVendedor los ve en su panel.

7. **Given** el Admin elimina una tienda (UsuarioVendedor),
   **When** confirma la eliminación,
   **Then** la cuenta del vendedor y los datos de su tienda son eliminados;
   el vendedor ya no puede iniciar sesión.

---

### User Story 4 - Inicio de sesión del UsuarioVendedor (Priority: P2)

Un UsuarioVendedor cuya cuenta fue creada por el Admin inicia sesión con las
credenciales provistas. Una vez dentro, solo puede ver y editar el perfil de
su propia tienda.

**Why this priority**: Necesario para que los vendedores gestionen su catálogo.
Comparte prioridad P2 con la edición de perfil porque ambos establecen el
principio de aislamiento de roles.

**Independent Test**: Se puede verificar creando un vendedor desde el Admin,
iniciando sesión con esas credenciales, comprobando que es redirigido al panel
de vendedor (no al de comprador ni al de Admin), y que solo ve los datos de su
propia tienda.

**Acceptance Scenarios**:

1. **Given** un UsuarioVendedor con cuenta creada por el Admin,
   **When** inicia sesión con su email y contraseña,
   **Then** queda autenticado, es redirigido al panel de vendedor y solo ve
   los datos de su propia tienda.

2. **Given** un UsuarioVendedor autenticado,
   **When** intenta navegar a rutas del panel de Admin o del panel de comprador,
   **Then** es redirigido a su propio panel; no puede acceder a esas secciones.

---

### Edge Cases

- ¿Qué sucede si el Admin intenta crear un UsuarioVendedor con un email que
  ya está registrado? → Se muestra error indicando que el email ya existe;
  no se crea la cuenta duplicada.
- ¿Qué sucede si un usuario autenticado intenta acceder a una ruta de otro
  rol (ej: un comprador intenta ir al panel de Admin)? → Es redirigido a su
  propio panel; recibe mensaje de acceso denegado.
- ¿Qué sucede si el formulario de registro se envía con campos vacíos o email
  inválido? → Se muestran errores de validación por campo; no se procesa el
  registro.
- ¿Qué sucede si la sesión del usuario expira mientras navega la app? → Es
  redirigido automáticamente a la página de inicio de sesión.
- ¿Puede el Admin eliminarse a sí mismo? → No; la opción de eliminación no
  está disponible para la cuenta Admin.
- ¿Qué pasa si el Admin intenta iniciar sesión con credenciales incorrectas?
  → Se muestra el mismo mensaje de error genérico que para cualquier usuario.
- ¿Qué experimenta un usuario con sesión activa cuando el Admin elimina su cuenta? → El usuario es desconectado instantáneamente y redirigido a login en tiempo real.
- ¿Puede el Admin cambiar el email de un UsuarioVendedor ya creado? → No; el email es el identificador de autenticación y es inmutable una vez creada la cuenta.

---

### User Story 5 - Catálogo de Tiendas (UsuarioComprador, Priority: P1)

Un UsuarioComprador autenticado puede explorar la lista de tiendas activas y
acceder al detalle de cada una para ver sus productos.

**Acceptance Scenarios**:

1. **Given** un UsuarioComprador autenticado, **When** navega a `/tiendas`,
   **Then** ve la lista de tiendas activas con nombre, descripción y logo.

2. **Given** un UsuarioComprador en la lista de tiendas, **When** hace clic
   en una tienda, **Then** es redirigido al detalle de esa tienda con sus
   productos disponibles, nombre, precio y foto.

---

### User Story 6 - Carrito y Pedido (UsuarioComprador, Priority: P1)

Un UsuarioComprador puede agregar productos al carrito y confirmar un pedido.

**Acceptance Scenarios**:

1. **Given** un UsuarioComprador en el detalle de una tienda, **When** hace
   clic en "Agregar" en un producto disponible, **Then** el producto se
   agrega al carrito (el contador del carrito se actualiza).

2. **Given** un UsuarioComprador intenta agregar productos de otra tienda,
   **When** confirma vaciar el carrito anterior, **Then** el carrito se
   reinicia con los nuevos productos.

3. **Given** un UsuarioComprador en `/carrito` con al menos un producto,
   **When** hace clic en "Confirmar pedido", **Then** se crea un documento
   en `pedidos` con estado `pendiente`, se vacía el carrito y es redirigido
   a `/mis-pedidos`.

4. **Given** un UsuarioComprador en `/mis-pedidos`, **When** visualiza la
   pantalla, **Then** ve sus pedidos ordenados del más reciente al más
   antiguo con estado, nombre de tienda, items y total.

---

### User Story 7 - Gestión de Productos (UsuarioVendedor, Priority: P1)

Un UsuarioVendedor puede agregar, editar, deshabilitar y eliminar los
productos de su tienda.

**Acceptance Scenarios**:

1. **Given** un UsuarioVendedor en `/vendedor/productos`, **When** completa
   el formulario de nuevo producto (nombre, precio), **Then** el producto se
   agrega a su tienda y aparece en el catálogo para compradores.

2. **Given** un UsuarioVendedor, **When** edita un producto existente o
   cambia su disponibilidad, **Then** los cambios se reflejan de inmediato
   en el catálogo.

3. **Given** un UsuarioVendedor, **When** elimina un producto, **Then** ese
   producto deja de aparecer para los compradores.

---

### User Story 8 - Gestión de Pedidos (UsuarioVendedor, Priority: P1)

Un UsuarioVendedor puede ver los pedidos entrantes y actualizar su estado.

**Acceptance Scenarios**:

1. **Given** un UsuarioVendedor en `/vendedor/pedidos`, **When** ve la lista,
   **Then** ve todos los pedidos de su tienda ordenados por fecha, con items
   y total.

2. **Given** un UsuarioVendedor con un pedido en estado `pendiente`, **When**
   actualiza el estado, **Then** el cambio se refleja en tiempo real para el
   comprador.

---

## Requirements *(mandatory)*

### Functional Requirements

**Registro y autenticación:**

- **FR-001**: El sistema DEBE permitir a visitantes no autenticados registrarse
  como UsuarioComprador proporcionando nombre completo, email y contraseña.
- **FR-002**: El sistema DEBE validar que el email tenga formato válido y que
  la contraseña tenga al menos 6 caracteres antes de crear la cuenta.
- **FR-003**: El sistema DEBE rechazar el registro si el email ya está en uso
  y mostrar un mensaje de error claro.
- **FR-004**: El sistema DEBE permitir a cualquier usuario (Comprador, Vendedor,
  Admin) iniciar sesión con email y contraseña.
- **FR-005**: El sistema DEBE permitir a cualquier usuario autenticado cerrar
  sesión.
- **FR-006**: El sistema NO DEBE mostrar si el error de login se debe al email
  o a la contraseña (mensaje genérico de credenciales inválidas).
- **FR-007**: El sistema NO DEBE proveer flujo de recuperación de contraseña
  por email en esta versión.

**Control de acceso por rol:**

- **FR-008**: Al registrarse, el sistema DEBE asignar automáticamente el rol
  `UsuarioComprador` a la nueva cuenta.
- **FR-009**: El sistema DEBE redirigir a cada usuario autenticado al panel
  correspondiente a su rol tras el inicio de sesión.
- **FR-010**: El sistema DEBE bloquear el acceso a rutas de otros roles y
  redirigir al panel propio si un usuario intenta acceder a una sección no
  autorizada.
- **FR-011**: La cuenta Admin DEBE existir como cuenta predefinida en el sistema;
  no existe formulario de registro para Admins.

**Gestión de perfil propio:**

- **FR-012**: Un UsuarioComprador DEBE poder ver y editar sus propios datos de
  perfil (nombre, foto de perfil).
- **FR-013**: Un UsuarioVendedor DEBE poder ver y editar los datos de su propia
  tienda (nombre de tienda, foto, descripción).
- **FR-014**: Un usuario (Comprador o Vendedor) NO DEBE poder ver ni modificar
  datos del perfil de otro usuario.

**Gestión de usuarios por el Admin:**

- **FR-015**: El Admin DEBE poder ver la lista de todos los UsuariosCompradores
  y UsuariosVendedores registrados (nombre, email, rol).
- **FR-016**: El Admin DEBE poder ver el detalle completo del perfil de cualquier
  UsuarioComprador o UsuarioVendedor.
- **FR-017**: El Admin DEBE poder eliminar cuentas de UsuarioComprador.
  Al eliminar, se elimina la cuenta de autenticación y el documento de perfil
  del usuario; los pedidos asociados se conservan en el sistema.
- **FR-018**: El Admin DEBE poder crear cuentas de UsuarioVendedor proporcionando
  nombre de tienda, email y contraseña inicial.
- **FR-019**: El Admin DEBE poder editar los datos de una cuenta UsuarioVendedor
  existente (nombre de tienda, descripción, foto). El email del UsuarioVendedor
  es inmutable una vez creada la cuenta y NO puede ser modificado por el Admin.
- **FR-020**: El Admin DEBE poder eliminar cuentas de UsuarioVendedor.
  Al eliminar, se elimina la cuenta de autenticación y el documento de perfil
  de la tienda; los pedidos asociados a esa tienda se conservan en el sistema.
- **FR-021**: El Admin NO DEBE poder realizar pedidos ni acceder a las
  funcionalidades de compra.
- **FR-022**: El sistema DEBE impedir que el Admin elimine su propia cuenta.
- **FR-026**: Cuando el Admin elimina la cuenta de un usuario que tiene una
  sesión activa en ese momento, el sistema DEBE desconectar a ese usuario
  instantáneamente y redirigirlo a la página de inicio de sesión en tiempo
  real, sin esperar a que su próxima acción falle.

**Seguridad:**

- **FR-023**: El sistema DEBE reforzar el control de acceso a nivel de base
  de datos (no solo en la UI), de modo que un usuario autenticado solo pueda
  leer y escribir sus propios datos de perfil.
- **FR-024**: El Admin DEBE poder leer los perfiles de todos los usuarios a
  nivel de base de datos.
- **FR-025**: El campo `rol` en el documento de un usuario DEBE ser inmutable
  para el propio usuario propietario del documento. Las reglas de seguridad
  de base de datos DEBEN rechazar cualquier operación de escritura que
  intente modificar el valor del campo `rol` en el documento propio, incluso
  si el resto de los campos de perfil son editables por el usuario.

**Catálogo y carrito:**

- **FR-027**: Un UsuarioComprador DEBE poder ver la lista de todas las tiendas
  con `activo: true`.
- **FR-028**: Un UsuarioComprador DEBE poder ver los productos `disponible: true`
  de una tienda y agregarlos al carrito.
- **FR-029**: El carrito solo puede contener productos de una misma tienda.
  Si el comprador agrega un producto de otra tienda, el sistema DEBE preguntarle
  si desea vaciar el carrito y reemplazarlo.
- **FR-030**: El carrito DEBE persistir en `localStorage` para sobrevivir
  recargas de página.
- **FR-031**: Un UsuarioComprador DEBE poder confirmar el carrito y crear un
  pedido con estado `pendiente` en Firestore. Al confirmar, el carrito se vacía.
- **FR-032**: Un UsuarioComprador DEBE poder ver su historial de pedidos
  ordenado por fecha descendente.

**Gestión de productos (Vendedor):**

- **FR-033**: Un UsuarioVendedor DEBE poder crear productos en su tienda
  (nombre requerido, precio requerido, descripción y foto opcionales).
- **FR-034**: Un UsuarioVendedor DEBE poder editar y eliminar sus propios
  productos.
- **FR-035**: Un UsuarioVendedor DEBE poder cambiar la disponibilidad
  (`disponible: true/false`) de un producto sin eliminarlo.

**Gestión de pedidos (Vendedor):**

- **FR-036**: Un UsuarioVendedor DEBE poder ver todos los pedidos recibidos
  en su tienda ordenados por fecha descendente.
- **FR-037**: Un UsuarioVendedor DEBE poder actualizar el estado de un pedido
  (`pendiente` → `confirmado` → `en_camino` → `entregado` | `cancelado`).

### Key Entities

- **Usuario**: Representa a toda cuenta del sistema. Atributos: identificador
  único, email, nombre completo, rol (`Admin` | `UsuarioComprador` |
  `UsuarioVendedor`), fecha de creación, foto de perfil (opcional).
- **Tienda**: Perfil extendido de un UsuarioVendedor. Atributos: referencia
  al usuario vendedor, nombre de tienda, descripción, foto, estado activo.
  Relación 1:1 con un Usuario de rol UsuarioVendedor.
- **Sesión**: Representa el estado de autenticación activo de un usuario.
  No se persiste explícitamente; la gestiona el proveedor de autenticación.
- **Producto**: Ítem del catálogo de una tienda. Atributos: uid, uidTienda,
  nombre, descripción, precio, foto, disponible, fechaCreacion.
- **Pedido**: Orden de compra creada por un UsuarioComprador. Atributos:
  uid, uidComprador, uidVendedor, nombreTienda, items (array), total, estado,
  fechaCreacion, fechaActualizacion. Estados: `pendiente` | `confirmado` |
  `en_camino` | `entregado` | `cancelado`.
- **Carrito**: Estado temporal del lado del cliente. Se persiste en
  `localStorage`. Contiene uidTienda, nombreTienda y array de ítems.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un visitante puede completar el registro como UsuarioComprador
  en menos de 2 minutos desde que accede a la página de registro.
- **SC-002**: Un usuario puede iniciar sesión exitosamente en menos de 30
  segundos desde que accede a la página de login.
- **SC-003**: El 100% de los intentos de acceso a rutas de otro rol son
  bloqueados y redirigidos al panel propio del usuario autenticado.
- **SC-004**: El 100% de los intentos de lectura o escritura de datos de otro
  usuario son rechazados a nivel de base de datos, independientemente de la UI.
- **SC-005**: El Admin puede crear una cuenta UsuarioVendedor operativa (capaz
  de iniciar sesión) en menos de 3 minutos.
- **SC-006**: Los cambios en el perfil propio de un usuario se reflejan en la
  interfaz en menos de 3 segundos tras guardar.
- **SC-007**: Ningún formulario del sistema permite enviar datos con campos
  obligatorios vacíos (validación en tiempo real antes del envío).

---

## Clarifications

### Session 2026-07-06

- Q: ¿Cómo debe estar protegido el campo `rol` contra escritura por parte del propio usuario propietario del documento? → A: El campo `rol` es inmutable para el usuario propietario; las Security Rules bloquean cualquier escritura que modifique el campo `rol` del propio documento (opción A).
- Q: ¿Qué debe ocurrir con los pedidos existentes de un usuario al momento de eliminar su cuenta? → A: Los pedidos se conservan; solo se elimina la cuenta de autenticación y el documento de perfil del usuario (opción A).
- Q: ¿Qué experimenta un usuario con sesión activa cuando el Admin elimina su cuenta? → A: El usuario es desconectado instantáneamente y redirigido a login en tiempo real (opción B).
- Q: ¿Puede el Admin cambiar el email de un UsuarioVendedor ya creado? → A: No; el email es inmutable una vez creada la cuenta; solo se editan nombre, descripción y foto (opción B).

---

## Assumptions

- La cuenta Admin se crea manualmente una sola vez (por seed/script o
  consola de Firebase) antes del primer deploy. No se provisiona desde la app.
- No se implementa recuperación de contraseña por email en esta versión.
- No se implementa autenticación con proveedores externos (Google, Facebook, etc.)
  en esta versión; solo email/contraseña.
- La foto de perfil se almacena como URL (puede ser externa o subida a Firebase
  Storage en una iteración futura); en esta versión se acepta URL de texto.
- Los datos mínimos obligatorios para el registro son: nombre completo, email
  y contraseña. Datos adicionales (dirección, teléfono) son gestionados por
  otras features.
- Un UsuarioVendedor tiene exactamente una tienda asociada (relación 1:1).
- El sistema opera sobre una única base de datos compartida; no hay
  multi-tenancy.
- El formato de contraseña mínima es 6 caracteres (restricción del proveedor
  de autenticación utilizado).
