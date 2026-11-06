/**
 * NotificationPanel — panel de notificaciones en tiempo real (observador).
 *
 * Responsabilidad: escuchar los eventos del tablero y mostrarlos como mensajes
 * para el equipo. Cada evento tiene su formateador en MESSAGES; para notificar
 * un evento nuevo basta con agregar una entrada, sin tocar el tablero.
 */
import { EVENTS } from '../notifier/events.js';
import { CHECKLISTS } from '../domain/checklists.js';

const MAX_VISIBLE = 6;

/** Evento → { tipo de alerta, texto }. */
const MESSAGES = {
  [EVENTS.TASK_CREATED]: ({ task, column }) => ['success', `Tarea #${task.id} creada en "${column.name}".`],
  [EVENTS.TASK_UPDATED]: ({ task }) => ['info', `Tarea #${task.id} actualizada.`],
  [EVENTS.TASK_DELETED]: ({ task }) => ['info', `Tarea #${task.id} eliminada.`],
  [EVENTS.TASK_MOVED]: ({ task, from, to }) => ['success', `#${task.id} pasó de "${from.name}" a "${to.name}".`],
  [EVENTS.CHECKLIST_TOGGLED]: ({ task, type, item }) => [
    'info',
    `#${task.id} · ${CHECKLISTS[type].short}: "${item.label}" ${item.done ? 'cumplido' : 'pendiente'}.`,
  ],
  [EVENTS.MOVE_REJECTED]: ({ policy, reason }) => ['error', `Bloqueado [${policy}]: ${reason}`],
  [EVENTS.WIP_LIMIT_CHANGED]: ({ column }) => [
    'info',
    `Límite WIP de "${column.name}": ${column.hasWipLimit ? column.wipLimit : 'sin límite'}.`,
  ],
  [EVENTS.WIP_LIMIT_REACHED]: ({ column }) => [
    'warning',
    `"${column.name}" llegó a su límite WIP (${column.wipLimit}). Terminen tareas antes de iniciar otras.`,
  ],
};

export class NotificationPanel {
  /**
   * @param {HTMLUListElement} list
   * @param {import('../notifier/EventBus.js').EventBus} events
   */
  constructor(list, events) {
    this.list = list;
    for (const [eventName, format] of Object.entries(MESSAGES)) {
      events.subscribe(eventName, ({ payload, timestamp }) => {
        const [type, text] = format(payload);
        this.push(type, text, timestamp);
      });
    }
  }

  /** Muestra un mensaje; también lo usan otros componentes para errores de validación. */
  push(type, text, timestamp = new Date()) {
    const item = document.createElement('li');
    item.className = `alert alert--${type}`;
    const time = document.createElement('time');
    time.textContent = timestamp.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    item.append(time, ' ', text);

    this.list.prepend(item);
    while (this.list.children.length > MAX_VISIBLE) this.list.lastElementChild.remove();
  }
}
