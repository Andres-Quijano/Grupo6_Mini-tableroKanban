/**
 * main.js — punto de entrada de KanbanFlow.
 *
 * Arma las capas de la aplicación:
 *   Board (dominio) → BoardController (controlador) → BoardView (vista)
 * y carga unas tareas de ejemplo para que el tablero no arranque vacío.
 */
import { Board } from './domain/Board.js';
import { BoardController } from './controller/BoardController.js';
import { BoardView } from './ui/BoardView.js';

const board = new Board();
const controller = new BoardController(board);
const view = new BoardView(document.body, board, controller);

// Datos de ejemplo (el estado vive en memoria; se pierde al recargar).
const t1 = board.createTask({ title: 'Configurar repositorio en GitHub', assignee: 'usuario_01', priority: 'alta' });
const t2 = board.createTask({ title: 'Diseñar diagrama de clases', assignee: 'usuario_02', priority: 'media' });
board.createTask({ title: 'Definir checklist DoD', assignee: 'usuario_01', priority: 'baja' });
board.shiftTask(t1.id, 1);
board.shiftTask(t1.id, 1);
board.shiftTask(t2.id, 1);

view.render();
