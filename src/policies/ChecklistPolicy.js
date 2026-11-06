import { MovePolicy } from './MovePolicy.js';
import { CHECKLISTS } from '../domain/checklists.js';

/**
 * Estrategia base para las reglas de checklist: exige que una lista de chequeo
 * de la tarea esté completa antes de entrar a cierta columna.
 *
 * DoR y DoD solo cambian qué checklist revisan y en qué columna aplican,
 * por eso comparten esta clase en lugar de duplicar la lógica.
 */
export class ChecklistPolicy extends MovePolicy {
  /**
   * @param {string} checklistType  'dor' | 'dod'
   * @param {string} targetColumnId Columna donde se exige el checklist.
   */
  constructor(checklistType, targetColumnId) {
    super();
    this.checklistType = checklistType;
    this.targetColumnId = targetColumnId;
  }

  get name() {
    return CHECKLISTS[this.checklistType].title;
  }

  validate({ task, from, to, board }) {
    if (to.id !== this.targetColumnId || !this.#isForwardMove(from, to, board)) return null;

    const pending = task.pendingChecklistItems(this.checklistType);
    if (pending.length === 0) return null;
    const missing = pending.map((item) => item.label.toLowerCase()).join(', ');
    return `"${task.title}" no cumple la ${CHECKLISTS[this.checklistType].short}; falta: ${missing}.`;
  }

  /** Solo se exige al avanzar; devolver una tarea a una columna anterior no lo requiere. */
  #isForwardMove(from, to, board) {
    return !from || board.columns.indexOf(to) > board.columns.indexOf(from);
  }
}

/** Definición de Listo: checklist DoR completo para empezar ("En curso"). */
export class DefinitionOfReadyPolicy extends ChecklistPolicy {
  constructor(targetColumnId = 'doing') {
    super('dor', targetColumnId);
  }
}

/** Definición de Hecho: checklist DoD completo para terminar ("Hecho"). */
export class DefinitionOfDonePolicy extends ChecklistPolicy {
  constructor(targetColumnId = 'done') {
    super('dod', targetColumnId);
  }
}
