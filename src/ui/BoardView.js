/**
 * BoardView — vista web del tablero.
 *
 * Responsabilidad: dibujar columnas y tarjetas, leer el formulario y mostrar alertas.
 * No contiene reglas de negocio: todo lo delega en el controlador.
 *
 * Hoy la vista se redibuja manualmente después de cada acción; en la entrega 2
 * se suscribirá al Notificador y se actualizará sola (patrón Observer).
 */
export class BoardView {
  constructor(root, board, controller) {
    this.root = root;
    this.board = board;
    this.controller = controller;
    this.boardEl = root.querySelector('#board');
    this.alertsEl = root.querySelector('#alerts');
    this.form = root.querySelector('#task-form');

    this.form.addEventListener('submit', (e) => this.#onSubmit(e));
    this.boardEl.addEventListener('click', (e) => this.#onBoardClick(e));
  }

  render() {
    this.boardEl.innerHTML = this.board.columns.map((column) => this.#columnHtml(column)).join('');
  }

  showAlert({ ok, message }) {
    const item = document.createElement('li');
    item.className = ok ? 'alert alert--ok' : 'alert alert--error';
    item.textContent = message;
    this.alertsEl.prepend(item);
    while (this.alertsEl.children.length > 5) this.alertsEl.lastChild.remove();
  }

  #onSubmit(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(this.form));
    const result = this.controller.createTask(data);
    this.showAlert(result);
    if (result.ok) this.form.reset();
    this.render();
  }

  #onBoardClick(event) {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const taskId = Number(button.dataset.task);
    const action = button.dataset.action;

    const result =
      action === 'delete'
        ? this.controller.deleteTask(taskId)
        : this.controller.moveTask(taskId, action === 'next' ? 1 : -1);
    this.showAlert(result);
    this.render();
  }

  #columnHtml(column) {
    const limit = column.wipLimit === Infinity ? '∞' : column.wipLimit;
    const full = !column.hasCapacity();
    return `
      <section class="column ${full ? 'column--full' : ''}" data-column="${column.id}">
        <header class="column__header">
          <h2>${column.name}</h2>
          <span class="wip" title="Tareas / límite WIP">${column.tasks.length} / ${limit}</span>
        </header>
        <ul class="column__tasks">
          ${column.tasks.map((task) => this.#taskHtml(task)).join('') || '<li class="empty">Sin tareas</li>'}
        </ul>
      </section>`;
  }

  #taskHtml(task) {
    return `
      <li class="card card--${task.priority}">
        <div class="card__title">#${task.id} ${escapeHtml(task.title)}</div>
        ${task.description ? `<p class="card__desc">${escapeHtml(task.description)}</p>` : ''}
        <div class="card__meta">
          <span>${escapeHtml(task.assignee)}</span>
          <span class="badge">${task.priority}</span>
        </div>
        <div class="card__actions">
          <button data-action="prev" data-task="${task.id}" title="Mover a la columna anterior">←</button>
          <button data-action="delete" data-task="${task.id}" title="Eliminar">✕</button>
          <button data-action="next" data-task="${task.id}" title="Mover a la columna siguiente">→</button>
        </div>
      </li>`;
  }
}

/** Evita que el texto escrito por el usuario se interprete como HTML. */
function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
}
