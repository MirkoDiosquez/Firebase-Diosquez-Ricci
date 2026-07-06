# Quality Checklist: Autenticación y Gestión de Usuarios (3 Roles)

**Purpose**: Validar la calidad, claridad, completitud y consistencia de los
requisitos de la feature antes de avanzar a `/speckit.plan`. Cada ítem es un
"unit test del inglés": evalúa si los *requisitos están bien escritos*, no si
la implementación funcionará.
**Created**: 2026-07-06
**Feature**: [spec.md](../spec.md)
**Audience**: Auto-revisión del autor (pre-plan)
**Focus**: Cobertura completa — seguridad, completitud, claridad, escenarios,
aprovisionamiento Admin, consistencia y dependencias.

---

## Seguridad & Control de Acceso

- [ ] CHK001 - ¿FR-025 enumera explícitamente qué campos del documento de usuario SÍ son editables por el propietario, en lugar de solo declarar que `rol` NO lo es? [Clarity, Spec §FR-025]
- [ ] CHK002 - ¿Están especificados los requisitos de control de acceso a nivel de base de datos para las operaciones de *escritura* del Admin sobre documentos de otros usuarios (no solo lectura)? [Completeness, Gap, Spec §FR-024]
- [ ] CHK003 - ¿FR-026 (desconexión instantánea) define el comportamiento esperado si el mecanismo de desconexión en tiempo real falla o tiene latencia? [Edge Case, Gap, Spec §FR-026]
- [ ] CHK004 - ¿Los requisitos de aislamiento de datos (FR-014, FR-023) son consistentes con los permisos de lectura del Admin (FR-024), sin generar contradicción lógica entre ambas reglas? [Consistency, Spec §FR-014, §FR-023, §FR-024]
- [ ] CHK005 - ¿La spec define el comportamiento del sistema cuando un token de sesión expira *naturalmente* (distinto del caso de eliminación activa de cuenta cubierto en FR-026)? [Coverage, Gap]
- [ ] CHK006 - ¿El término "instantáneamente" en FR-026 está cuantificado con un umbral de tiempo máximo aceptable (ej: "en menos de X segundos")? [Ambiguity, Spec §FR-026]

---

## Completitud de Requisitos

- [ ] CHK007 - ¿La spec define los requisitos para el estado de carga (loading / pending) de los formularios de registro y login mientras se procesa la solicitud? [Gap, Completeness]
- [ ] CHK008 - ¿Las reglas de validación de contraseña del flujo de creación de UsuarioVendedor por el Admin (FR-018) están especificadas con el mismo nivel de detalle que FR-002? [Completeness, Spec §FR-018, §FR-002]
- [ ] CHK009 - ¿FR-018 especifica todos los campos obligatorios y opcionales que el Admin puede completar al crear un UsuarioVendedor, más allá de nombre, email y contraseña? [Clarity, Spec §FR-018]
- [ ] CHK010 - ¿La spec define qué ocurre con la sesión activa de un usuario si el Admin *edita* (no elimina) su perfil mientras ese usuario está navegando? [Coverage, Gap]
- [ ] CHK011 - ¿La entidad Tienda especifica si existen campos adicionales relevantes para el catálogo (ej: categoría, horarios) o el alcance está explícitamente acotado a nombre, descripción, foto y estado? [Completeness, Spec §Key Entities]
- [ ] CHK012 - ¿Están definidos los requisitos para el zero-state de la lista de usuarios en el panel Admin (cuando no hay UsuariosCompradores ni UsuariosVendedores registrados aún)? [Coverage, Edge Case]
- [ ] CHK013 - ¿La spec cubre el requisito de paginación o límite de resultados para la lista de usuarios del Admin (FR-015), o está explícitamente declarado como fuera de alcance? [Completeness, Gap, Spec §FR-015]

---

## Claridad & Medibilidad de Criterios de Aceptación

- [ ] CHK014 - ¿El criterio SC-001 ("menos de 2 minutos") aplica bajo condiciones de red definidas, o el umbral es independiente de la conectividad del usuario? [Measurability, Spec §SC-001]
- [ ] CHK015 - ¿El criterio SC-003 ("100% de intentos bloqueados") es verificable sin conocer los detalles de implementación de los guards de rutas? [Measurability, Spec §SC-003]
- [ ] CHK016 - ¿SC-006 ("menos de 3 segundos") especifica las condiciones de red o carga bajo las que ese umbral es válido? [Clarity, Spec §SC-006]
- [ ] CHK017 - ¿Los escenarios de aceptación de US3 definen criterios para determinar qué constituye "toda la información del perfil" visible por el Admin? [Clarity, Spec §US3 Scenario 3]
- [ ] CHK018 - ¿Puede el criterio SC-004 ("100% rechazados a nivel de base de datos") verificarse de forma tecnológicamente agnóstica, sin requerir acceso directo a las reglas de seguridad? [Measurability, Spec §SC-004]

---

## Cobertura de Escenarios

- [ ] CHK019 - ¿La spec cubre el escenario de inicio de sesión de un usuario cuya cuenta fue eliminada *mientras tenía sesión cerrada* (intento de login posterior a la eliminación)? [Coverage, Exception Flow]
- [ ] CHK020 - ¿Están definidos los requisitos de comportamiento cuando el Admin intenta crear un UsuarioVendedor y ocurre un error inesperado durante el proceso? [Exception Flow, Gap]
- [ ] CHK021 - ¿Están especificados los requisitos para el escenario en que el UsuarioComprador intenta guardar cambios de perfil con nombre vacío o compuesto solo de espacios? [Edge Case, Completeness]
- [ ] CHK022 - ¿La spec cubre el escenario de registro con una contraseña que cumple exactamente el mínimo de 6 caracteres (límite exacto del boundary)? [Coverage, Edge Case, Spec §FR-002]
- [ ] CHK023 - ¿La spec define los requisitos para el flujo de navegación cuando un usuario no autenticado intenta acceder directamente a una ruta protegida (no solo cuando ya está autenticado con otro rol)? [Coverage, Gap]

---

## Aprovisionamiento de la Cuenta Admin

- [ ] CHK024 - ¿La spec documenta los datos mínimos requeridos para el aprovisionamiento inicial de la cuenta Admin (email, contraseña, campos de perfil necesarios en la base de datos)? [Completeness, Gap, Spec §Assumptions]
- [ ] CHK025 - ¿El proceso de seed/aprovisionamiento del Admin está explícitamente declarado como dentro o fuera del alcance de esta feature? [Clarity, Spec §Assumptions]
- [ ] CHK026 - ¿La spec define qué sucede si la cuenta Admin no existe en el sistema en el momento del primer deploy (ej: la app queda inaccesible para administración)? [Edge Case, Gap]
- [ ] CHK027 - ¿Los requisitos especifican si puede existir más de una cuenta Admin simultáneamente, o si el sistema está diseñado para exactamente una? [Ambiguity, Gap]

---

## Supuestos & Dependencias

- [ ] CHK028 - ¿El supuesto de "foto almacenada como URL de texto" está alineado con los requisitos de edición de perfil (FR-012, FR-013) en cuanto al formato y validación esperada del campo? [Consistency, Spec §Assumptions, §FR-012, §FR-013]
- [ ] CHK029 - ¿La restricción de contraseña mínima de 6 caracteres (derivada del proveedor de autenticación) está documentada como restricción explícita en los requisitos funcionales, no solo en Assumptions? [Traceability, Spec §FR-002]
- [ ] CHK030 - ¿La spec documenta el comportamiento esperado si el proveedor de autenticación externo no está disponible durante el registro o login? [Dependency, Gap]

---

## Consistencia entre Secciones

- [ ] CHK031 - ¿Los campos editables del UsuarioVendedor son consistentes entre FR-013 (nombre de tienda, foto, descripción), FR-019 (nombre de tienda, descripción, foto) y la definición de la entidad Tienda? [Consistency, Spec §FR-013, §FR-019, §Key Entities]
- [ ] CHK032 - ¿El escenario de aceptación US3.4 ("la cuenta y todos los datos asociados son eliminados del sistema") es consistente con FR-017 que específicamente aclara que los pedidos *se conservan*? [Conflict, Spec §US3 Scenario 4, §FR-017] ⚠️ Posible contradicción
- [ ] CHK033 - ¿Los requisitos de redirección post-login (FR-009) son consistentes con los "Then" de los escenarios de aceptación de US1 (comprador), US3 (Admin) y US4 (vendedor)? [Consistency, Spec §FR-009]
- [ ] CHK034 - ¿El campo `estado activo` de la entidad Tienda tiene requisitos de comportamiento asociados en la spec (cuándo se activa, cuándo se desactiva, qué ocurre cuando está inactivo)? [Completeness, Gap, Spec §Key Entities]

---

## Notes

- **CHK032** señala una posible contradicción entre US3 Scenario 4 y FR-017: el
  escenario dice "todos los datos asociados son eliminados" pero el requisito
  aclara que los pedidos se conservan. Se recomienda actualizar el texto del
  escenario para que sea consistente con FR-017 antes de avanzar a plan.
- Items marcados con `[Gap]` indican áreas no cubiertas en la spec actual que
  pueden requerir una decisión explícita (incluir en scope o declarar fuera).
- Items marcados con `[Ambiguity]` requieren cuantificación o aclaración antes
  de que un desarrollador pueda implementarlos sin hacer suposiciones propias.
- Este checklist fue generado con foco en auto-revisión pre-`/speckit.plan`.
  Para revisión por pares, considerar agregar referencias cruzadas a la
  constitución del proyecto.
