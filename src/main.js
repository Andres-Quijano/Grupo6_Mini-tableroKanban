/**
 * main.js — punto de entrada de Mini-tableroKanban.
 *
 * Crea los objetos y los conecta (composición de dependencias):
 *
 *   EventBus ─┬─▶ Board (publica eventos, valida con las políticas Strategy)
 *             ├─▶ BoardView          (observador: redibuja el tablero)
 *             └─▶ NotificationPanel  (observador: muestra alertas)
 *
 *   BoardView / TaskForm ──▶ BoardController ──▶ Board
 */
import { EventBus } from './notifier/EventBus.js';
import { Board } from './domain/Board.js';
import { createDefaultPolicies } from './policies/index.js';
import { BoardController } from './controller/BoardController.js';
import { BoardView } from './ui/BoardView.js';
import { TaskForm } from './ui/TaskForm.js';
import { NotificationPanel } from './ui/NotificationPanel.js';
import { loadSampleTasks } from './data/sampleTasks.js';

const events = new EventBus();
const board = new Board({ events, policies: createDefaultPolicies() });
const controller = new BoardController(board);

// Los datos de ejemplo se cargan antes de suscribir a los observadores,
// para no llenar el panel con notificaciones de la carga inicial.
loadSampleTasks(board);

const notifications = new NotificationPanel(document.getElementById('alerts'), events);
const form = new TaskForm(document.getElementById('task-form'), controller);
const view = new BoardView(document.getElementById('board'), {
  board,
  controller,
  events,
  onEditTask: (task) => form.edit(task),
  onError: (message) => notifications.push('error', message),
});

view.render();
notifications.push('info', 'Tablero listo. Las políticas activas son: ' + board.policies.map((p) => p.name).join(', ') + '.');
