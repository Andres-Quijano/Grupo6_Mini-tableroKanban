/**
 * BoardView — vista web del tablero (observador del EventBus).
 *
 * Responsabilidad: dibujar columnas y tarjetas y traducir los clics del usuario
 * en llamadas al controlador. No contiene reglas de negocio.
 *
 * No se redibuja "a mano" después de cada acción: se suscribe a todos los
 * eventos del tablero y se actualiza cuando el dominio anuncia un cambio.
 */
import { ANY_EVENT } from '../notifier/EventBus.js';
import { EVENTS } from '../notifier/events.js';
import { columnTemplate } from './templates.js';

export class BoardView {
  /** Tarjetas con los checklists desplegados, para mantenerlas abiertas al redibujar. */
  #openTaskIds = new Set();

  /**
   * @param {HTMLElement} element  Contenedor del tablero.
   * @param {object} deps
   * @param {import('../domain/Board.js').Board} deps.board
   * @param {import('../controller/BoardController.js').BoardController} deps.controller
   * @param {import('../notifier/EventBus.js').EventBus} deps.events
   * @param {(task) => void} deps.onEditTask    Se llama al pulsar ✎.
   * @param {(message: string) => void} deps.onError  Errores que no anunció el Notificador.
   */
  constructor(element, { board, controller, events, onEditTask, onError }) {
    this.element = element;
    this.board = board;
    this.controller = controller;
    this.onEditTask = onEditTask;
    this.onError = onError;

    events.subscribe(ANY_EVENT, (event) => {
      if (event.name !== EVENTS.MOVE_REJECTED) this.render();
    });

    element.addEventListener('click', (e) => this.#onClick(e));
    element.addEventListener('change', (e) => this.#onChange(e));
    // "toggle" no burbujea; se escucha en fase de captura.
    element.addEventListener('toggle', (e) => this.#onDetailsToggle(e), true);
  }

  render() {
    const last = this.board.columns.length - 1;
    this.element.innerHTML = this.board.columns
      .map((column, index) =>
        columnTemplate(column, { isFirst: index === 0, isLast: index === last, openTaskIds: this.#openTaskIds }),
      )
      .join('');
  }

  #onClick(event) {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const taskId = Number(button.dataset.task);

    switch (button.dataset.action) {
      case 'next':
        return this.#handle(this.controller.moveTask(taskId, 1));
      case 'prev':
        return this.#handle(this.controller.moveTask(taskId, -1));
      case 'delete':
        if (confirm(`¿Eliminar la tarea #${taskId}?`)) this.#handle(this.controller.deleteTask(taskId));
        return;
      case 'edit':
        return this.onEditTask(this.board.findTask(taskId));
    }
  }

  #onChange(event) {
    const input = event.target;
    if (input.dataset.action === 'toggle') {
      const { task, type, item } = input.dataset;
      this.#handle(this.controller.toggleChecklistItem(Number(task), type, item));
    } else if (input.dataset.wip) {
      const result = this.controller.setWipLimit(input.dataset.wip, input.value);
      // Si el límite no es válido, se vuelve a dibujar para restaurar el valor anterior.
      if (!result.ok) this.render();
      this.#handle(result);
    }
  }

  #onDetailsToggle(event) {
    const details = event.target;
    if (!details.matches?.('details[data-task]')) return;
    const taskId = Number(details.dataset.task);
    if (details.open) this.#openTaskIds.add(taskId);
    else this.#openTaskIds.delete(taskId);
  }

  #handle(result) {
    if (!result.ok && !result.notified) this.onError(result.message);
  }
}
