/**
 * Plantillas HTML del tablero.
 *
 * Funciones puras: reciben datos y devuelven texto HTML. Separarlas de BoardView
 * deja a la vista solo con la lógica de eventos y facilita leer cada pieza.
 */
import { CHECKLISTS, CHECKLIST_TYPES } from '../domain/checklists.js';
import { escapeHtml } from '../utils/escapeHtml.js';

/** Kanji decorativo de cada etapa (看板, "kanban", significa "letrero" en japonés). */
const STAGE_MARKS = { todo: '未', doing: '進', review: '査', done: '済' };

/** Con límites mayores, los casilleros ocuparían demasiado; se muestra solo el número. */
const MAX_SLOTS = 8;

/**
 * @param {import('../domain/Column.js').Column} column
 * @param {object} state  { isFirst, isLast, openTaskIds:Set<number>, highlightId:number|null }
 */
export function columnTemplate(column, { isFirst, isLast, openTaskIds, highlightId }) {
  const full = column.hasWipLimit && !column.hasCapacity();
  const count = column.tasks.length;
  const tasks = column.tasks
    .map((task) =>
      taskTemplate(task, { isFirst, isLast, open: openTaskIds.has(task.id), fresh: task.id === highlightId }),
    )
    .join('');

  return `
    <section class="column ${full ? 'column--full' : ''}" data-column="${column.id}" aria-label="${escapeHtml(column.name)}">
      <header class="column__head">
        <span class="column__mark" aria-hidden="true">${STAGE_MARKS[column.id] ?? ''}</span>
        <div class="column__title">
          <h3>${escapeHtml(column.name)}</h3>
          <span class="column__count">${count} ${count === 1 ? 'tarea' : 'tareas'}${full ? ', llena' : ''}</span>
        </div>
      </header>
      <div class="wip">
        ${capacityTemplate(column)}
        <label class="wip__field">
          <span>Límite</span>
          <input class="wip__input" type="number" min="1" step="1" inputmode="numeric"
                 data-wip="${column.id}" value="${column.hasWipLimit ? column.wipLimit : ''}" placeholder="∞"
                 aria-label="Límite WIP de ${escapeHtml(column.name)} (vacío = sin límite)" />
        </label>
      </div>
      <ul class="column__tasks">
        ${tasks || `<li class="empty">${isFirst ? 'Crea una tarea con el formulario.' : 'Sin tareas en esta etapa.'}</li>`}
      </ul>
    </section>`;
}

/** Casilleros ocupados/libres del límite WIP, o un texto si no hay límite. */
function capacityTemplate(column) {
  const used = column.tasks.length;
  if (!column.hasWipLimit) return '<span class="wip__text">Sin límite</span>';
  if (column.wipLimit > MAX_SLOTS) return `<span class="wip__text">${used} de ${column.wipLimit}</span>`;

  const slots = Array.from({ length: column.wipLimit }, (_, i) => `<i class="${i < used ? 'is-used' : ''}"></i>`).join('');
  return `<span class="wip__slots" role="img" aria-label="${used} de ${column.wipLimit} lugares ocupados">${slots}</span>`;
}

function taskTemplate(task, { isFirst, isLast, open, fresh }) {
  return `
    <li class="card card--${task.priority} ${isLast ? 'card--done' : ''} ${fresh ? 'card--fresh' : ''}" data-task="${task.id}">
      <div class="card__top">
        <span class="card__id">#${String(task.id).padStart(2, '0')}</span>
        <span class="card__priority">${task.priority}</span>
      </div>
      <p class="card__title">${escapeHtml(task.title)}</p>
      ${task.description ? `<p class="card__desc">${escapeHtml(task.description)}</p>` : ''}
      <p class="card__assignee"><i class="ph ph-user" aria-hidden="true"></i>${escapeHtml(task.assignee)}</p>
      <details class="checks" data-task="${task.id}" ${open ? 'open' : ''}>
        <summary>${CHECKLIST_TYPES.map((type) => progressTemplate(task, type)).join('')}</summary>
        ${CHECKLIST_TYPES.map((type) => checklistTemplate(task, type)).join('')}
      </details>
      <div class="card__actions">
        ${iconButton('prev', task.id, 'arrow-left', 'Mover a la columna anterior', isFirst)}
        ${iconButton('edit', task.id, 'pencil-simple', 'Editar tarea')}
        ${iconButton('delete', task.id, 'x', 'Eliminar tarea')}
        ${iconButton('next', task.id, 'arrow-right', 'Mover a la columna siguiente', isLast)}
      </div>
      ${isLast ? '<span class="seal" aria-hidden="true">済</span><span class="visually-hidden">Terminada</span>' : ''}
    </li>`;
}

function iconButton(action, taskId, icon, label, disabled = false) {
  return `<button type="button" class="icon-btn" data-action="${action}" data-task="${taskId}"
            title="${label}" aria-label="${label}" ${disabled ? 'disabled' : ''}><i class="ph ph-${icon}" aria-hidden="true"></i></button>`;
}

function progressTemplate(task, type) {
  const total = task.checklists[type].length;
  const done = total - task.pendingChecklistItems(type).length;
  const ticks = Array.from({ length: total }, (_, i) => `<i class="${i < done ? 'is-done' : ''}"></i>`).join('');
  return `
    <span class="progress ${done === total ? 'is-complete' : ''}" aria-label="${CHECKLISTS[type].short} ${done} de ${total}">
      <span class="progress__label">${CHECKLISTS[type].short}</span>
      <span class="progress__ticks" aria-hidden="true">${ticks}</span>
    </span>`;
}

function checklistTemplate(task, type) {
  const items = task.checklists[type]
    .map(
      (item) => `
        <li>
          <label>
            <input type="checkbox" data-action="toggle" data-task="${task.id}"
                   data-type="${type}" data-item="${item.id}" ${item.done ? 'checked' : ''} />
            <span>${escapeHtml(item.label)}</span>
          </label>
        </li>`,
    )
    .join('');
  return `
    <div class="checklist">
      <p class="checklist__title">${CHECKLISTS[type].title}</p>
      <ul>${items}</ul>
    </div>`;
}
