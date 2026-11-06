# Descripción técnica del proyecto — Mini-tableroKanban

Documento técnico de la solución. Actualizado en la **Entrega 2**.

---

## 1. Descripción general de la solución

Mini-tableroKanban es una aplicación web que se ejecuta en el navegador y representa un mini-tablero Kanban de cuatro
columnas: **Por hacer**, **En curso**, **Revisión** y **Hecho**. Cada tarea tiene título, descripción, responsable,
prioridad y dos listas de chequeo, y avanza por las columnas a medida que el equipo trabaja en ella.

La solución aplica reglas de Kanban y Scrum:

- **Límite WIP** (*Work In Progress*): cada columna admite un número máximo de tareas, configurable desde el tablero.
- **Definición de Listo (DoR)**: checklist que debe cumplirse antes de pasar una tarea a "En curso".
- **Definición de Hecho (DoD)**: checklist que debe cumplirse antes de pasar una tarea a "Hecho".
- **Flujo ordenado**: una tarea solo se mueve a la columna vecina.

El estado vive en memoria (no hay base de datos) y la aplicación está pensada para un solo equipo.

**Entrada → Procesamiento → Salida**

| Entradas | Proceso | Salidas |
|---|---|---|
| Datos de la tarea, acciones del usuario y límites configurados | Validación con políticas (Strategy) y publicación de eventos (Observer) | Tablero actualizado y notificaciones en tiempo real |

## 2. Módulos o componentes principales

Ver el diagrama completo en [`diagramas/arquitectura.md`](diagramas/arquitectura.md).

```
Usuario ──acción──▶ Vista web (UI) ──▶ Controlador ──ejecuta──▶ Núcleo del dominio ──valida──▶ Políticas (Strategy)
                        ▲                                              │
                        └──── notifica ──── EventBus (Observer) ◀── publica eventos
```

| Componente | Carpeta | Patrón |
|---|---|---|
| Vista web (UI) | `src/ui/` | Observadores del EventBus |
| Controlador | `src/controller/` | — |
| Núcleo del dominio | `src/domain/` | Contexto de Strategy y publicador de Observer |
| Notificador | `src/notifier/` | **Observer** |
| Políticas de negocio | `src/policies/` | **Strategy** |
| Utilidades | `src/utils/` | — |
| Datos de ejemplo | `src/data/` | — |

## 3. Responsabilidades de cada componente

### Vista web (UI) — `src/ui/`
- `BoardView`: dibuja columnas y tarjetas, y traduce los clics en llamadas al controlador. Se redibuja sola al
  recibir eventos.
- `TaskForm`: crea y edita tareas, y muestra errores de validación junto al formulario.
- `NotificationPanel`: convierte cada evento del tablero en un mensaje para el equipo.
- `templates.js`: funciones que generan el HTML de columnas, tarjetas y checklists.
- **No contiene reglas de negocio.**

### Controlador — `src/controller/BoardController.js`
- Recibe las acciones de la vista y convierte los datos del formulario (por ejemplo, el límite WIP escrito como texto).
- Invoca al dominio y devuelve `{ ok, value }` o `{ ok: false, message, notified }`.
- Distingue errores de datos (`DomainError`) de rechazos de política (`PolicyViolationError`) y no oculta los
  errores de programación.

### Núcleo del dominio — `src/domain/`
- `Task`: datos de la tarea, validación y checklists DoR/DoD.
- `Column`: agrupa tareas de un estado y conoce su límite WIP.
- `Board`: coordina las operaciones; pide permiso a las políticas y publica un evento por cada cambio.
- `checklists.js`: definición de los ítems de DoR y DoD.

### Notificador — `src/notifier/` (Observer)
- `EventBus`: registra suscriptores y les notifica los eventos; aísla los errores de cada suscriptor.
- `events.js`: catálogo de nombres de eventos.
- Detalle en [`patrones/observer.md`](patrones/observer.md).

### Políticas de negocio — `src/policies/` (Strategy)
- `MovePolicy`: interfaz común `validate(context)`.
- `AdjacentColumnPolicy`, `WipLimitPolicy`, `DefinitionOfReadyPolicy`, `DefinitionOfDonePolicy`: una regla cada una.
- Detalle en [`patrones/strategy.md`](patrones/strategy.md).

## 4. Tecnologías y herramientas

| Herramienta | Uso |
|---|---|
| HTML5, CSS3 | Estructura y estilos de la interfaz |
| JavaScript ES6+ (módulos ES, campos privados `#`) | Toda la lógica de la aplicación, sin frameworks |
| Node.js | Servidor local (`scripts/server.js`) y ejecución de pruebas |
| Jest | Pruebas unitarias y de integración, con reporte de cobertura |
| Mermaid | Diagramas de arquitectura, clases y secuencia (GitHub los dibuja) |
| Git + GitHub | Control de versiones, historial de commits y entregas |
| VS Code | Editor |

Se eligió JavaScript puro para que los patrones de diseño sean visibles en el código, sin que un framework los
oculte, y para que la aplicación se ejecute en cualquier navegador.

## 5. Organización del desarrollo

**Metodología:** Scrum + Kanban, con sprints cortos alineados con las entregas de la asignatura.

| Entrega | Alcance | Estado |
|---|---|---|
| **1 — Base del proyecto** | Repositorio, estructura, documentación, dominio básico (crear y mover tareas, límite WIP), vista mínima y pruebas. | ✅ |
| **2 — Patrones Observer y Strategy** | EventBus y notificaciones en tiempo real; políticas WIP, DoR, DoD y columnas vecinas; checklists; edición de tareas; límite WIP configurable; diagramas y 60 pruebas. | ✅ |
| **3 — Cierre** | Ver *Próximos avances* en el README. | Pendiente |

**Control de versiones:**

- Rama `main`: siempre contiene una versión que funciona.
- Ramas de trabajo por funcionalidad: `feature/<nombre>` (por ejemplo `feature/observer-notificador`), integradas con
  *pull request*.
- Mensajes de commit con prefijo según el tipo de cambio: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`.

**Calidad:**

- Toda regla del dominio tiene al menos una prueba unitaria en `tests/`.
- La vista no contiene reglas de negocio, para poder probar el dominio sin navegador.
- `npm run test:coverage` muestra la cobertura de la lógica (dominio, políticas, notificador, controlador).

## 6. Fuera del alcance

- Base de datos o persistencia permanente.
- Inicio de sesión, roles o trabajo multiusuario.
- Despliegue en la nube o aplicación móvil nativa.
- Integración con Jira, Trello o correo electrónico.
- Métricas avanzadas (burndown, lead time).
