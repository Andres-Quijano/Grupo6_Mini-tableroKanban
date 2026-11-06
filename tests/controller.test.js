import { Board } from '../src/domain/Board.js';
import { BoardController } from '../src/controller/BoardController.js';
import { createReadyTask } from './helpers.js';

describe('BoardController', () => {
  let board;
  let controller;
  beforeEach(() => {
    board = new Board();
    controller = new BoardController(board);
  });

  test('devuelve ok=true y el valor cuando la acción tiene éxito', () => {
    const result = controller.createTask({ title: 'Tarea 1' });
    expect(result.ok).toBe(true);
    expect(result.value.title).toBe('Tarea 1');
  });

  test('un dato inválido se devuelve como mensaje no notificado', () => {
    expect(controller.createTask({ title: '' })).toEqual({
      ok: false,
      message: 'La tarea debe tener un título.',
      notified: false,
    });
  });

  test('un rechazo de política se marca como ya notificado', () => {
    const task = board.createTask({ title: 'Sin DoR' });
    const result = controller.moveTask(task.id, 1);
    expect(result.ok).toBe(false);
    expect(result.notified).toBe(true);
  });

  test('setWipLimit convierte el texto del campo; vacío = sin límite', () => {
    expect(controller.setWipLimit('doing', ' 4 ').ok).toBe(true);
    expect(board.getColumn('doing').wipLimit).toBe(4);
    expect(controller.setWipLimit('doing', '').ok).toBe(true);
    expect(board.getColumn('doing').wipLimit).toBe(Infinity);
    expect(controller.setWipLimit('doing', 'abc').ok).toBe(false);
  });

  test('updateTask, toggleChecklistItem y deleteTask delegan en el tablero', () => {
    const task = createReadyTask(board);
    expect(controller.updateTask(task.id, { title: 'Editada' }).value.title).toBe('Editada');
    expect(controller.toggleChecklistItem(task.id, 'dod', 'docs').value.done).toBe(true);
    expect(controller.deleteTask(task.id).ok).toBe(true);
    expect(controller.deleteTask(task.id)).toMatchObject({ ok: false, message: expect.stringContaining('No existe') });
  });

  test('los errores de programación no se ocultan', () => {
    const broken = new BoardController({
      createTask: () => {
        throw new TypeError('fallo inesperado');
      },
    });
    expect(() => broken.createTask({})).toThrow(TypeError);
  });
});
