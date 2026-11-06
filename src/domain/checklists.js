/**
 * Listas de chequeo que acompañan a cada tarea.
 *  - DoR (Definition of Ready): condiciones para poder empezar la tarea.
 *  - DoD (Definition of Done):  condiciones para darla por terminada.
 */
export const CHECKLISTS = Object.freeze({
  dor: {
    title: 'Definición de Listo',
    short: 'DoR',
    items: [
      { id: 'description', label: 'Descripción clara' },
      { id: 'assignee', label: 'Responsable asignado' },
      { id: 'criteria', label: 'Criterios de aceptación definidos' },
    ],
  },
  dod: {
    title: 'Definición de Hecho',
    short: 'DoD',
    items: [
      { id: 'review', label: 'Código revisado' },
      { id: 'tests', label: 'Pruebas aprobadas' },
      { id: 'docs', label: 'Documentación actualizada' },
    ],
  },
});

export const CHECKLIST_TYPES = Object.keys(CHECKLISTS);

/** Crea una copia nueva (sin marcar) de los ítems de un checklist. */
export function createChecklist(type) {
  return CHECKLISTS[type].items.map((item) => ({ ...item, done: false }));
}
