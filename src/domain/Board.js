/**
 * Board — el tablero Kanban (núcleo del dominio).
 *
 * Responsabilidad: contener las columnas y las tareas, y coordinar los cambios.
 *  - Las reglas de movimiento NO están aquí: se delegan a la lista de políticas
 *    (patrón Strategy, ver src/policies/).
 *  - Cada cambio se anuncia en el EventBus (patrón Observer, ver src/notifier/),
 *    sin que el tablero sepa quién lo escucha.
 *
 * Ambas dependencias se reciben en el constructor, lo que permite probar el
 * tablero con otras políticas o con un EventBus de prueba.
 */
import { Task } from './Task.js';
import { Column } from './Column.js';
import { EventBus } from '../notifier/EventBus.js';
import { EVENTS } from '../notifier/events.js';
import { createDefaultPolicies } from '../policies/index.js';
import { DomainError, PolicyViolationError } from '../utils/errors.js';

/** Columnas por defecto del flujo con su límite WIP inicial. */
export const DEFAULT_COLUMNS = [
  { id: 'todo', name: 'Por hacer', wipLimit: Infinity },
  { id: 'doing', name: 'En curso', wipLimit: 3 },
  { id: 'review', name: 'Revisión', wipLimit: 2 },
  { id: 'done', name: 'Hecho', wipLimit: Infinity },
];

export class Board {
  /**
   * @param {object}   [options]
   * @param {object[]} [options.columns]  Definición de columnas { id, name, wipLimit }.
   * @param {import('../policies/MovePolicy.js').MovePolicy[]} [options.policies]
   * @param {EventBus} [options.events]
   */
  constructor({ columns = DEFAULT_COLUMNS, policies = createDefaultPolicies(), events = new EventBus() } = {}) {
    this.columns = columns.map((c) => new Column(c.id, c.name, c.wipLimit));
    this.policies = [...policies];
    this.events = events;
  }

  // ---------- Consultas ----------

  getColumn(columnId) {
    const column = this.columns.find((c) => c.id === columnId);
    if (!column) throw new DomainError(`No existe la columna "${columnId}".`);
    return column;
  }

  /** Devuelve la columna que contiene la tarea, o lanza error si no existe. */
  findColumnOf(taskId) {
    const column = this.columns.find((c) => c.has(taskId));
    if (!column) throw new DomainError(`No existe la tarea #${taskId}.`);
    return column;
  }

  findTask(taskId) {
    return this.findColumnOf(taskId).tasks.find((t) => t.id === taskId);
  }

  get tasks() {
    return this.columns.flatMap((c) => c.tasks);
  }

  // ---------- Políticas (Strategy) ----------

  addPolicy(policy) {
    this.policies.push(policy);
  }

  /** Quita las políticas de la clase indicada (por ejemplo, desactivar DoD). */
  removePolicy(PolicyClass) {
    this.policies = this.policies.filter((p) => !(p instanceof PolicyClass));
  }

  // ---------- Operaciones sobre tareas ----------

  /** Crea una tarea y la coloca en la primera columna ("Por hacer"). */
  createTask(data) {
    const task = new Task(data);
    const column = this.columns[0];
    this.#enforcePolicies({ task, from: null, to: column });

    column.add(task);
    this.events.publish(EVENTS.TASK_CREATED, { task, column });
    this.#announceIfFull(column);
    return task;
  }

  updateTask(taskId, data) {
    const task = this.findTask(taskId);
    const changes = task.update(data);
    this.events.publish(EVENTS.TASK_UPDATED, { task, changes });
    return task;
  }

  deleteTask(taskId) {
    const column = this.findColumnOf(taskId);
    const task = column.remove(taskId);
    this.events.publish(EVENTS.TASK_DELETED, { task, column });
    return task;
  }

  /** Mueve una tarea a la columna indicada si todas las políticas lo permiten. */
  moveTask(taskId, targetColumnId) {
    const from = this.findColumnOf(taskId);
    const to = this.getColumn(targetColumnId);
    const task = this.findTask(taskId);
    if (from === to) return task;

    this.#enforcePolicies({ task, from, to });

    from.remove(taskId);
    to.add(task);
    this.events.publish(EVENTS.TASK_MOVED, { task, from, to });
    this.#announceIfFull(to);
    return task;
  }

  /** Avanza (+1) o retrocede (-1) una tarea una columna. */
  shiftTask(taskId, step) {
    const index = this.columns.indexOf(this.findColumnOf(taskId)) + step;
    if (index < 0 || index >= this.columns.length) {
      throw new DomainError('La tarea no puede moverse más en esa dirección.');
    }
    return this.moveTask(taskId, this.columns[index].id);
  }

  toggleChecklistItem(taskId, type, itemId) {
    const task = this.findTask(taskId);
    const item = task.toggleChecklistItem(type, itemId);
    this.events.publish(EVENTS.CHECKLIST_TOGGLED, { task, type, item });
    return item;
  }

  /**
   * Cambia el límite WIP de una columna.
   * @param {number} limit Entero ≥ 1, o Infinity para quitar el límite.
   */
  setWipLimit(columnId, limit) {
    const column = this.getColumn(columnId);
    if (limit !== Infinity && !(Number.isInteger(limit) && limit > 0)) {
      throw new DomainError('El límite WIP debe ser un número entero mayor que cero.');
    }
    if (limit < column.tasks.length) {
      throw new DomainError(
        `"${column.name}" ya tiene ${column.tasks.length} tareas; el límite no puede ser menor.`,
      );
    }
    column.wipLimit = limit;
    this.events.publish(EVENTS.WIP_LIMIT_CHANGED, { column });
    this.#announceIfFull(column);
    return column;
  }

  // ---------- Internos ----------

  /** Pregunta a cada política; la primera que rechace detiene la operación. */
  #enforcePolicies(context) {
    for (const policy of this.policies) {
      const reason = policy.validate({ ...context, board: this });
      if (reason) {
        this.events.publish(EVENTS.MOVE_REJECTED, { ...context, policy: policy.name, reason });
        throw new PolicyViolationError(reason, policy.name);
      }
    }
  }

  #announceIfFull(column) {
    if (column.hasWipLimit && !column.hasCapacity()) {
      this.events.publish(EVENTS.WIP_LIMIT_REACHED, { column });
    }
  }
}
