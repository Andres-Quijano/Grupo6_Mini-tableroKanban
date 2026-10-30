# Descripción técnica del proyecto — KanbanFlow

Documento de la **primera aproximación técnica** de la solución (Entrega 1).

---

## 1. Descripción general de la solución

KanbanFlow es una aplicación web que se ejecuta en el navegador y representa un mini-tablero Kanban de cuatro
columnas: **Por hacer**, **En curso**, **Revisión** y **Hecho**. Cada tarea tiene título, descripción, responsable
y prioridad, y avanza por las columnas a medida que el equipo trabaja en ella.

La solución aplica reglas de Kanban y Scrum:

- **Límite WIP** (*Work In Progress*): cada columna admite un número máximo de tareas; si se alcanza, el
  movimiento se bloquea.
- **Definición de Listo (DoR)**: checklist que debe cumplirse antes de iniciar una tarea.
- **Definición de Hecho (DoD)**: checklist que debe cumplirse antes de darla por terminada.

El estado vive en memoria (no hay base de datos) y la aplicación está pensada para un solo equipo.

**Entrada → Procesamiento → Salida**

| Entradas | Proceso | Salidas |
|---|---|---|
| Datos de la tarea, acciones del usuario y límites configurados | Ejecución de acciones y validación de políticas | Tablero actualizado, alertas e historial |

## 2. Módulos o componentes principales

Arquitectura por capas. Las flechas indican quién usa a quién:

```
Usuario ──acción──▶ Vista web (UI) ──▶ Controlador ──ejecuta──▶ Núcleo del dominio ◀──valida── Políticas de negocio
                        ▲                                              │
                        └──────── actualiza ──── Notificador ◀── publica eventos
```

| Componente | Carpeta | Patrón previsto |
|---|---|---|
| Vista web (UI) | `src/ui/` | — |
| Controlador | `src/controller/` | — |
| Núcleo del dominio | `src/domain/` | — |
| Notificador | `src/notifier/` | **Observer** |
| Políticas de negocio | `src/policies/` | **Strategy** |

## 3. Responsabilidades de cada componente

### Vista web (UI) — `src/ui/BoardView.js`
- Dibujar el tablero, las columnas y las tarjetas de tareas.
- Mostrar el formulario para crear tareas y el panel de alertas.
- Capturar las acciones del usuario y entregarlas al controlador. **No contiene reglas de negocio.**

### Controlador — `src/controller/BoardController.js`
- Recibir las acciones de la vista (crear, mover, eliminar tarea).
- Invocar al dominio y devolver a la vista un resultado (éxito o mensaje de error).

### Núcleo del dominio — `src/domain/`
- `Task`: representa una tarea y valida sus datos (título obligatorio, prioridad válida).
- `Column`: agrupa tareas de un estado y conoce su límite WIP.
- `Board`: contiene las columnas, crea tareas y aplica las reglas del flujo (orden de columnas y límite WIP).
- En la entrega 2 publicará eventos (tarea movida, WIP excedido) hacia el notificador.

### Notificador — `src/notifier/` *(entrega 2)*
- Mantener la lista de suscriptores (la vista y el panel de alertas).
- Avisar cuando una tarea cambia de estado o se rebasa un límite WIP.

### Políticas de negocio — `src/policies/` *(entrega 2/3)*
- Validar límite WIP, DoR y DoD como estrategias intercambiables, de modo que se puedan agregar reglas nuevas
  sin modificar el tablero.

## 4. Tecnologías y herramientas

| Herramienta | Uso |
|---|---|
| HTML5, CSS3 | Estructura y estilos de la interfaz |
| JavaScript ES6+ (módulos ES) | Toda la lógica de la aplicación, sin frameworks |
| Node.js | Servidor local (`scripts/server.js`) y ejecución de pruebas |
| Jest | Pruebas unitarias del núcleo del dominio |
| Git + GitHub | Control de versiones, historial de commits y entregas |
| VS Code | Editor |
| UML | Diagramas de clases y de secuencia de los patrones |

Se eligió JavaScript puro para que los patrones de diseño sean visibles en el código, sin que un framework los
oculte, y para que la aplicación se ejecute en cualquier navegador.

## 5. Organización del desarrollo

**Metodología:** Scrum + Kanban, con sprints cortos alineados con las entregas de la asignatura.

| Entrega | Alcance |
|---|---|
| **1 — Base del proyecto** | Repositorio, estructura, documentación, dominio básico (crear y mover tareas, límite WIP), vista mínima y pruebas. |
| **2 — Patrón Observer** | Notificador con eventos en tiempo real y primera política (límite WIP) con Strategy. |
| **3 — Políticas y cierre** | Strategy (WIP, DoR, DoD intercambiables), checklists DoR/DoD, diagramas UML y pruebas completas. |

**Control de versiones:**

- Rama `main`: siempre contiene una versión que funciona.
- Ramas de trabajo por funcionalidad: `feature/<nombre>` (por ejemplo `feature/observer-notificador`), integradas con
  *pull request*.
- Mensajes de commit con prefijo según el tipo de cambio: `feat:`, `fix:`, `docs:`, `test:`, `chore:`.

**Calidad:**

- Toda regla del dominio debe tener al menos una prueba unitaria en `tests/`.
- La vista no contiene reglas de negocio, para poder probar el dominio sin navegador.

## 6. Fuera del alcance

- Base de datos o persistencia permanente.
- Inicio de sesión, roles o trabajo multiusuario.
- Despliegue en la nube o aplicación móvil nativa.
- Integración con Jira, Trello o correo electrónico.
- Métricas avanzadas (burndown, lead time).
