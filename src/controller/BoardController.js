/**
 * BoardController — intermediario entre la vista y el dominio.
 *
 * Responsabilidad: recibir las acciones del usuario, convertir los datos del
 * formulario al formato del dominio, ejecutarlas sobre el tablero y devolver
 * un resultado simple para la vista:
 *
 *   { ok: true,  value }                       la acción se realizó
 *   { ok: false, message, notified }            la acción falló
 *
 * notified = true indica que el error ya lo anunció el Notificador (una política
 * rechazó el movimiento), así la vista no lo muestra dos veces.
 */
import { DomainError, PolicyViolationError } from '../utils/errors.js';

export class BoardController {
  constructor(board) {
    this.board = board;
  }

  createTask(formData) {
    return this.#run(() => this.board.createTask(formData));
  }

  updateTask(taskId, formData) {
    return this.#run(() => this.board.updateTask(taskId, formData));
  }

  deleteTask(taskId) {
    return this.#run(() => this.board.deleteTask(taskId));
  }

  /** @param {number} step +1 avanza, -1 retrocede. */
  moveTask(taskId, step) {
    return this.#run(() => this.board.shiftTask(taskId, step));
  }

  toggleChecklistItem(taskId, type, itemId) {
    return this.#run(() => this.board.toggleChecklistItem(taskId, type, itemId));
  }

  /** @param {string} rawValue Valor del campo; vacío significa "sin límite". */
  setWipLimit(columnId, rawValue) {
    return this.#run(() => {
      const text = String(rawValue).trim();
      const limit = text === '' ? Infinity : Number(text);
      return this.board.setWipLimit(columnId, limit);
    });
  }

  /**
   * Ejecuta la acción y traduce las excepciones del dominio a un resultado.
   * Los errores inesperados (fallos de programación) no se ocultan.
   */
  #run(action) {
    try {
      return { ok: true, value: action() };
    } catch (error) {
      if (!(error instanceof DomainError)) throw error;
      return { ok: false, message: error.message, notified: error instanceof PolicyViolationError };
    }
  }
}
