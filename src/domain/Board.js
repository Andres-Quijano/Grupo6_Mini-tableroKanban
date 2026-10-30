/**
 * Board — el tablero Kanban (núcleo del dominio).
 *
 * Responsabilidad: contener las columnas y aplicar las reglas del flujo:
 *   - las tareas nuevas entran en la primera columna;
 *   - una tarea solo avanza o retrocede una columna a la vez;
 *   - no se puede mover una tarea a una columna que alcanzó su límite WIP.
 *
 * El estado vive en memoria. En la entrega 2 este módulo publicará eventos
 * (tarea movida, WIP excedido) para el Notificador (patrón Observer).
 */
import { Task } from './Task.js';
import { Column } from './Column.js';

/** Columnas por defecto del flujo con su límite WIP inicial. */
export const DEFAULT_COLUMNS = [
  { id: 'todo', name: 'Por hacer', wipLimit: Infinity },
  { id: 'doing', name: 'En curso', wipLimit: 3 },
  { id: 'review', name: 'Revisión', wipLimit: 2 },
  { id: 'done', name: 'Hecho', wipLimit: Infinity },
];

export class Board {
  constructor(columns = DEFAULT_COLUMNS) {
    this.columns = columns.map((c) => new Column(c.id, c.name, c.wipLimit));
  }

  getColumn(columnId) {
    const column = this.columns.find((c) => c.id === columnId);
    if (!column) throw new Error(`No existe la columna "${columnId}".`);
    return column;
  }

  /** Devuelve la columna que contiene la tarea, o lanza error si no existe. */
  findColumnOf(taskId) {
    const column = this.columns.find((c) => c.has(taskId));
    if (!column) throw new Error(`No existe la tarea #${taskId}.`);
    return column;
  }

  findTask(taskId) {
    return this.findColumnOf(taskId).tasks.find((t) => t.id === taskId);
  }

  /** Crea una tarea y la coloca en la primera columna ("Por hacer"). */
  createTask(data) {
    const first = this.columns[0];
    if (!first.hasCapacity()) {
      throw new Error(`"${first.name}" alcanzó su límite WIP (${first.wipLimit}).`);
    }
    const task = new Task(data);
    first.add(task);
    return task;
  }

  deleteTask(taskId) {
    return this.findColumnOf(taskId).remove(taskId);
  }

  /**
   * Mueve una tarea a la columna indicada.
   * Solo se permite moverla a la columna vecina (anterior o siguiente).
   */
  moveTask(taskId, targetColumnId) {
    const from = this.findColumnOf(taskId);
    const to = this.getColumn(targetColumnId);
    if (from === to) return this.findTask(taskId);

    const distance = Math.abs(this.columns.indexOf(to) - this.columns.indexOf(from));
    if (distance !== 1) {
      throw new Error(`Solo se puede mover a una columna vecina de "${from.name}".`);
    }
    if (!to.hasCapacity()) {
      throw new Error(`"${to.name}" alcanzó su límite WIP (${to.wipLimit}).`);
    }

    const task = from.remove(taskId);
    to.add(task);
    return task;
  }

  /** Avanza (+1) o retrocede (-1) una tarea una columna. */
  shiftTask(taskId, step) {
    const index = this.columns.indexOf(this.findColumnOf(taskId)) + step;
    if (index < 0 || index >= this.columns.length) {
      throw new Error('La tarea no puede moverse más en esa dirección.');
    }
    return this.moveTask(taskId, this.columns[index].id);
  }

  setWipLimit(columnId, limit) {
    if (!(limit > 0)) throw new Error('El límite WIP debe ser mayor que cero.');
    this.getColumn(columnId).wipLimit = limit;
  }
}
