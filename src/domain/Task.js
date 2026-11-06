/**
 * Task — una tarea del tablero Kanban.
 *
 * Responsabilidad: guardar los datos de la tarea, validarlos y llevar sus
 * listas de chequeo DoR y DoD. No sabe en qué columna está; eso lo controla
 * el tablero (Board).
 */
import { DomainError } from '../utils/errors.js';
import { CHECKLIST_TYPES, createChecklist } from './checklists.js';

export const PRIORITIES = ['baja', 'media', 'alta'];
const UNASSIGNED = 'sin asignar';

let nextId = 1;

export class Task {
  /**
   * @param {object} data
   * @param {string} data.title        Título (obligatorio).
   * @param {string} [data.description]
   * @param {string} [data.assignee]   Responsable de la tarea.
   * @param {string} [data.priority]   'baja' | 'media' | 'alta'.
   */
  constructor({ title, description = '', assignee = '', priority = 'media' }) {
    this.title = validateTitle(title);
    this.description = String(description).trim();
    this.assignee = normalizeAssignee(assignee);
    this.priority = validatePriority(priority);
    this.checklists = Object.fromEntries(CHECKLIST_TYPES.map((type) => [type, createChecklist(type)]));
    this.id = nextId++;
    this.createdAt = new Date();
  }

  /** Actualiza solo los campos enviados, con las mismas validaciones del constructor. */
  update({ title, description, assignee, priority }) {
    // Se valida todo antes de asignar, para no dejar la tarea a medio cambiar.
    const changes = {};
    if (title !== undefined) changes.title = validateTitle(title);
    if (description !== undefined) changes.description = String(description).trim();
    if (assignee !== undefined) changes.assignee = normalizeAssignee(assignee);
    if (priority !== undefined) changes.priority = validatePriority(priority);
    Object.assign(this, changes);
    return changes;
  }

  /** Marca o desmarca un ítem de un checklist y lo devuelve. */
  toggleChecklistItem(type, itemId) {
    const item = this.#checklist(type).find((i) => i.id === itemId);
    if (!item) throw new DomainError(`El ítem "${itemId}" no existe en el checklist ${type}.`);
    item.done = !item.done;
    return item;
  }

  pendingChecklistItems(type) {
    return this.#checklist(type).filter((item) => !item.done);
  }

  isChecklistComplete(type) {
    return this.pendingChecklistItems(type).length === 0;
  }

  #checklist(type) {
    const checklist = this.checklists[type];
    if (!checklist) throw new DomainError(`Checklist desconocido: "${type}".`);
    return checklist;
  }
}

function validateTitle(title) {
  const clean = String(title ?? '').trim();
  if (!clean) throw new DomainError('La tarea debe tener un título.');
  if (clean.length > 80) throw new DomainError('El título no puede superar 80 caracteres.');
  return clean;
}

function validatePriority(priority) {
  if (!PRIORITIES.includes(priority)) {
    throw new DomainError(`Prioridad inválida: "${priority}". Use: ${PRIORITIES.join(', ')}.`);
  }
  return priority;
}

function normalizeAssignee(assignee) {
  return String(assignee ?? '').trim() || UNASSIGNED;
}
