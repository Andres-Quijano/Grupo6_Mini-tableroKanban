/**
 * MovePolicy — interfaz común de las estrategias (patrón Strategy).
 *
 * Cada política concreta encapsula UNA regla que decide si una tarea puede
 * entrar a una columna. El tablero no conoce las reglas: solo recorre la lista
 * de políticas y pregunta a cada una con validate().
 *
 * Para agregar una regla nueva basta con crear otra subclase y registrarla;
 * el tablero no se modifica (principio abierto/cerrado).
 */
export class MovePolicy {
  /** Nombre corto para identificar la política en mensajes y eventos. */
  get name() {
    return this.constructor.name;
  }

  /**
   * @param {object}  context
   * @param {import('../domain/Task.js').Task}     context.task
   * @param {import('../domain/Column.js').Column|null} context.from  null si la tarea es nueva.
   * @param {import('../domain/Column.js').Column} context.to
   * @param {import('../domain/Board.js').Board}   context.board
   * @returns {string|null} motivo del rechazo, o null si el movimiento se permite.
   */
  // eslint-disable-next-line no-unused-vars
  validate(context) {
    throw new Error(`${this.name} debe implementar validate().`);
  }
}
