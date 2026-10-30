/**
 * BoardController — intermediario entre la vista y el dominio.
 *
 * Responsabilidad: recibir las acciones del usuario, ejecutarlas sobre el tablero
 * y devolver un resultado simple { ok, message } para que la vista lo muestre.
 */
export class BoardController {
  constructor(board) {
    this.board = board;
  }

  createTask(data) {
    return this.#run(() => {
      const task = this.board.createTask(data);
      return `Tarea #${task.id} creada en "${this.board.columns[0].name}".`;
    });
  }

  moveTask(taskId, step) {
    return this.#run(() => {
      const task = this.board.shiftTask(taskId, step);
      return `Tarea #${task.id} movida a "${this.board.findColumnOf(task.id).name}".`;
    });
  }

  deleteTask(taskId) {
    return this.#run(() => {
      this.board.deleteTask(taskId);
      return `Tarea #${taskId} eliminada.`;
    });
  }

  /** Ejecuta la acción y convierte las excepciones del dominio en mensajes. */
  #run(action) {
    try {
      return { ok: true, message: action() };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }
}
