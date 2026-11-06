/**
 * Plantillas HTML del tablero.
 *
 * Funciones puras: reciben datos y devuelven texto HTML. Separarlas de BoardView
 * deja a la vista solo con la lógica de eventos y facilita leer cada pieza.
 */
import { CHECKLISTS, CHECKLIST_TYPES } from '../domain/checklists.js';
import { escapeHtml } from '../utils/escapeHtml.js';

/**
 * @param {import('../domain/Column.js').Column} column
 * @param {object} state  { isFirst, isLast, openTaskIds:Set<number> }
 */
export function columnTemplate(column, { isFirst, isLast, openTaskIds }) {
  const full = column.hasWipLimit && !column.hasCapacity();
  const tasks = column.tasks
    .map((task) => taskTemplate(task, { isFirst, isLast, open: openTaskIds.has(task.id) }))
    .join('');

  return `
    <section class="column ${full ? 'column--full' : ''}" data-column="${column.id}">
      <header class="column__header">
        <h2>${escapeHtml(column.name)}</h2>
        <label class="wip" title="Tareas / límite WIP (vacío = sin límite)">
          ${column.tasks.length} /
          <input class="wip__input" type="number" min="1" step="1" inputmode="numeric"
                 data-wip="${column.id}" value="${column.hasWipLimit ? column.wipLimit : ''}"
                 placeholder="∞" aria-label="Límite WIP de ${escapeHtml(column.name)}" />
        </label>
      </header>
      <ul class="column__tasks">
        ${tasks || '<li class="empty">Sin tareas</li>'}
      </ul>
    </section>`;
}

function taskTemplate(task, { isFirst, isLast, open }) {
  return `
    <li class="card card--${task.priority}" data-task="${task.id}">
      <div class="card__title">#${task.id} ${escapeHtml(task.title)}</div>
      ${task.description ? `<p class="card__desc">${escapeHtml(task.description)}</p>` : ''}
      <div class="card__meta">
        <span>${escapeHtml(task.assignee)}</span>
        <span class="badge">${task.priority}</span>
      </div>
      <details class="checklists" data-task="${task.id}" ${open ? 'open' : ''}>
        <summary>${CHECKLIST_TYPES.map((type) => progressTemplate(task, type)).join(' · ')}</summary>
        ${CHECKLIST_TYPES.map((type) => checklistTemplate(task, type)).join('')}
      </details>
      <div class="card__actions">
        <button type="button" data-action="prev" data-task="${task.id}" ${isFirst ? 'disabled' : ''}
                title="Mover a la columna anterior" aria-label="Mover a la columna anterior">←</button>
        <button type="button" data-action="edit" data-task="${task.id}" title="Editar" aria-label="Editar">✎</button>
        <button type="button" data-action="delete" data-task="${task.id}" title="Eliminar" aria-label="Eliminar">✕</button>
        <button type="button" data-action="next" data-task="${task.id}" ${isLast ? 'disabled' : ''}
                title="Mover a la columna siguiente" aria-label="Mover a la columna siguiente">→</button>
      </div>
    </li>`;
}

function progressTemplate(task, type) {
  const total = task.checklists[type].length;
  const done = total - task.pendingChecklistItems(type).length;
  return `<span class="${done === total ? 'progress--complete' : ''}">${CHECKLISTS[type].short} ${done}/${total}</span>`;
}

function checklistTemplate(task, type) {
  const items = task.checklists[type]
    .map(
      (item) => `
        <li>
          <label>
            <input type="checkbox" data-action="toggle" data-task="${task.id}"
                   data-type="${type}" data-item="${item.id}" ${item.done ? 'checked' : ''} />
            ${escapeHtml(item.label)}
          </label>
        </li>`,
    )
    .join('');
  return `
    <div class="checklist">
      <strong>${CHECKLISTS[type].title} (${CHECKLISTS[type].short})</strong>
      <ul>${items}</ul>
    </div>`;
}
