/**
 * TaskForm — formulario para crear y editar tareas.
 *
 * Responsabilidad: leer los campos, enviarlos al controlador y mostrar los
 * errores de validación junto al formulario. Tiene dos modos: crear (por
 * defecto) y editar (después de pulsar ✎ en una tarjeta).
 */
export class TaskForm {
  #editingId = null;

  /**
   * @param {HTMLFormElement} form
   * @param {import('../controller/BoardController.js').BoardController} controller
   */
  constructor(form, controller) {
    this.form = form;
    this.controller = controller;
    this.titleEl = form.querySelector('[data-role="title"]');
    this.submitEl = form.querySelector('[type="submit"]');
    this.cancelEl = form.querySelector('[data-role="cancel"]');
    this.errorEl = form.querySelector('[data-role="error"]');

    form.addEventListener('submit', (e) => this.#onSubmit(e));
    this.cancelEl.addEventListener('click', () => this.reset());
  }

  /** Carga una tarea en el formulario y pasa a modo edición. */
  edit(task) {
    this.#editingId = task.id;
    for (const field of ['title', 'description', 'assignee', 'priority']) {
      this.form.elements[field].value = task[field] === 'sin asignar' ? '' : task[field];
    }
    this.#setMode(`Editar tarea #${task.id}`, 'Guardar cambios', true);
    this.form.elements.title.focus();
  }

  reset() {
    this.#editingId = null;
    this.form.reset();
    this.#setMode('Nueva tarea', 'Crear tarea', false);
  }

  #onSubmit(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(this.form));
    const result =
      this.#editingId === null
        ? this.controller.createTask(data)
        : this.controller.updateTask(this.#editingId, data);

    if (result.ok) {
      this.reset();
    } else if (!result.notified) {
      this.#showError(result.message);
    }
  }

  #setMode(title, submitText, editing) {
    this.titleEl.textContent = title;
    this.submitEl.textContent = submitText;
    this.cancelEl.hidden = !editing;
    this.#showError('');
  }

  #showError(message) {
    this.errorEl.textContent = message;
    this.errorEl.hidden = !message;
  }
}
