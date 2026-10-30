/**
 * Task — una tarea del tablero Kanban.
 *
 * Responsabilidad: guardar los datos de la tarea y validar que sean correctos.
 * No sabe en qué columna está; eso lo controla el tablero (Board).
 */

export const PRIORITIES = ['baja', 'media', 'alta'];

let nextId = 1;

export class Task {
  /**
   * @param {object} data
   * @param {string} data.title        Título (obligatorio).
   * @param {string} [data.description]
   * @param {string} [data.assignee]   Responsable de la tarea.
   * @param {string} [data.priority]   'baja' | 'media' | 'alta'.
   */
  constructor({ title, description = '', assignee = 'sin asignar', priority = 'media' }) {
    if (!title || !title.trim()) {
      throw new Error('La tarea debe tener un título.');
    }
    if (!PRIORITIES.includes(priority)) {
      throw new Error(`Prioridad inválida: "${priority}". Use: ${PRIORITIES.join(', ')}.`);
    }

    this.id = nextId++;
    this.title = title.trim();
    this.description = description.trim();
    this.assignee = assignee.trim() || 'sin asignar';
    this.priority = priority;
    this.createdAt = new Date();
  }

  /** Actualiza los campos editables, validando igual que el constructor. */
  update({ title, description, assignee, priority }) {
    if (title !== undefined) {
      if (!title.trim()) throw new Error('La tarea debe tener un título.');
      this.title = title.trim();
    }
    if (description !== undefined) this.description = description.trim();
    if (assignee !== undefined) this.assignee = assignee.trim() || 'sin asignar';
    if (priority !== undefined) {
      if (!PRIORITIES.includes(priority)) throw new Error(`Prioridad inválida: "${priority}".`);
      this.priority = priority;
    }
  }
}
