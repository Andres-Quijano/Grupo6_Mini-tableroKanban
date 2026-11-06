/**
 * Catálogo de eventos que publica el tablero.
 * Usar estas constantes en lugar de cadenas sueltas evita errores de escritura.
 */
export const EVENTS = Object.freeze({
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_MOVED: 'task:moved',
  TASK_DELETED: 'task:deleted',
  CHECKLIST_TOGGLED: 'checklist:toggled',
  MOVE_REJECTED: 'move:rejected',
  WIP_LIMIT_CHANGED: 'wip:changed',
  WIP_LIMIT_REACHED: 'wip:reached',
});
