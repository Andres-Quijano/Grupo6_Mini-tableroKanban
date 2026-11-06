/** Utilidades compartidas por las pruebas. */
import { CHECKLISTS } from '../src/domain/checklists.js';

/** Marca como cumplidos todos los ítems de un checklist de la tarea. */
export function completeChecklist(task, type) {
  for (const { id } of CHECKLISTS[type].items) {
    if (task.pendingChecklistItems(type).some((item) => item.id === id)) task.toggleChecklistItem(type, id);
  }
  return task;
}

/** Crea una tarea con la DoR completa, lista para pasar a "En curso". */
export function createReadyTask(board, title = 'Tarea lista') {
  return completeChecklist(board.createTask({ title }), 'dor');
}

/** EventBus de prueba: guarda los nombres de los eventos publicados. */
export function recordEvents(events) {
  const names = [];
  events.subscribe('*', (event) => names.push(event.name));
  return names;
}
