/**
 * BoardController — intermediario entre la vista y el dominio.
 *
 * Responsabilidad: recibir las acciones del usuario, ejecutarlas sobre el tablero
 * y devolver un resultado simple { ok, message } para que la vista lo muestre.
 *
 * En la entrega 2 cada acción (crear, mover, eliminar) se convertirá en un objeto
 * comando con execute()/undo() y se guardará un historial (patrón Command).
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
