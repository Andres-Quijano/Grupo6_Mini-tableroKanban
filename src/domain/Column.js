/**
 * Column — una columna del tablero (un estado del flujo).
 *
 * Responsabilidad: agrupar las tareas que están en ese estado y conocer su
 * límite WIP. La decisión de bloquear un movimiento la toma WipLimitPolicy.
 */
export class Column {
  /**
   * @param {string} id         Identificador interno (ej. 'todo').
   * @param {string} name       Nombre visible (ej. 'Por hacer').
   * @param {number} [wipLimit] Máximo de tareas; Infinity = sin límite.
   */
  constructor(id, name, wipLimit = Infinity) {
    this.id = id;
    this.name = name;
    this.wipLimit = wipLimit;
    this.tasks = [];
  }

  get hasWipLimit() {
    return this.wipLimit !== Infinity;
  }

  /** true si la columna todavía admite otra tarea. */
  hasCapacity() {
    return this.tasks.length < this.wipLimit;
  }

  add(task) {
    this.tasks.push(task);
  }

  /** Quita la tarea de la columna y la devuelve (o null si no estaba). */
  remove(taskId) {
    const index = this.tasks.findIndex((t) => t.id === taskId);
    if (index === -1) return null;
    return this.tasks.splice(index, 1)[0];
  }

  has(taskId) {
    return this.tasks.some((t) => t.id === taskId);
  }
}
