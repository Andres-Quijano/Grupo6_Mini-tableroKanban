/**
 * Tareas de ejemplo para que el tablero no arranque vacío.
 * El estado vive en memoria, así que se vuelven a cargar al recargar la página.
 *
 * Cada tarea indica en qué columna debe quedar y qué ítems de checklist
 * tiene cumplidos; se usa la API normal del tablero, de modo que las tareas
 * de ejemplo también pasan por las políticas.
 */
const SAMPLE_TASKS = [
  {
    data: { title: 'Configurar repositorio en GitHub', assignee: 'usuario_01', priority: 'alta' },
    column: 'review',
    checked: { dor: ['description', 'assignee', 'criteria'], dod: ['review'] },
  },
  {
    data: { title: 'Diseñar diagrama de clases', description: 'Incluir Observer y Strategy.', assignee: 'usuario_02' },
    column: 'doing',
    checked: { dor: ['description', 'assignee', 'criteria'], dod: [] },
  },
  {
    data: { title: 'Definir checklist DoD', assignee: 'usuario_03', priority: 'baja' },
    column: 'todo',
    checked: { dor: ['assignee'], dod: [] },
  },
];

export function loadSampleTasks(board) {
  for (const { data, column, checked } of SAMPLE_TASKS) {
    const task = board.createTask(data);
    for (const [type, itemIds] of Object.entries(checked)) {
      itemIds.forEach((itemId) => task.toggleChecklistItem(type, itemId));
    }
    while (board.findColumnOf(task.id).id !== column) board.shiftTask(task.id, 1);
  }
}
