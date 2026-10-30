import { Board } from '../src/domain/Board.js';
import { Task } from '../src/domain/Task.js';
import { BoardController } from '../src/controller/BoardController.js';

describe('Task', () => {
  test('crea una tarea con valores por defecto', () => {
    const task = new Task({ title: '  Revisar backlog  ' });
    expect(task.title).toBe('Revisar backlog');
    expect(task.priority).toBe('media');
    expect(task.assignee).toBe('sin asignar');
  });

  test('rechaza una tarea sin título', () => {
    expect(() => new Task({ title: '   ' })).toThrow('título');
  });

  test('rechaza una prioridad inválida', () => {
    expect(() => new Task({ title: 'X', priority: 'urgente' })).toThrow('Prioridad inválida');
  });
});

describe('Board', () => {
  let board;
  beforeEach(() => {
    board = new Board();
  });

  test('tiene las cuatro columnas del flujo en orden', () => {
    expect(board.columns.map((c) => c.name)).toEqual(['Por hacer', 'En curso', 'Revisión', 'Hecho']);
  });

  test('las tareas nuevas entran en "Por hacer"', () => {
    const task = board.createTask({ title: 'Tarea 1' });
    expect(board.findColumnOf(task.id).id).toBe('todo');
  });

  test('mueve una tarea a la columna siguiente y la regresa', () => {
    const task = board.createTask({ title: 'Tarea 1' });
    board.shiftTask(task.id, 1);
    expect(board.findColumnOf(task.id).id).toBe('doing');
    board.shiftTask(task.id, -1);
    expect(board.findColumnOf(task.id).id).toBe('todo');
  });

  test('no permite saltar columnas', () => {
    const task = board.createTask({ title: 'Tarea 1' });
    expect(() => board.moveTask(task.id, 'done')).toThrow('columna vecina');
  });

  test('no permite salir de los extremos del tablero', () => {
    const task = board.createTask({ title: 'Tarea 1' });
    expect(() => board.shiftTask(task.id, -1)).toThrow('no puede moverse');
  });

  test('bloquea el movimiento cuando la columna destino alcanzó su límite WIP', () => {
    board.setWipLimit('doing', 2);
    const tasks = [1, 2, 3].map((n) => board.createTask({ title: `Tarea ${n}` }));
    board.shiftTask(tasks[0].id, 1);
    board.shiftTask(tasks[1].id, 1);

    expect(() => board.shiftTask(tasks[2].id, 1)).toThrow('límite WIP');
    expect(board.getColumn('doing').tasks).toHaveLength(2);
    expect(board.findColumnOf(tasks[2].id).id).toBe('todo');
  });

  test('elimina una tarea', () => {
    const task = board.createTask({ title: 'Tarea 1' });
    board.deleteTask(task.id);
    expect(() => board.findTask(task.id)).toThrow('No existe la tarea');
  });

  test('rechaza un límite WIP no positivo', () => {
    expect(() => board.setWipLimit('doing', 0)).toThrow('mayor que cero');
  });
});

describe('BoardController', () => {
  test('devuelve ok=true cuando la acción tiene éxito', () => {
    const controller = new BoardController(new Board());
    const result = controller.createTask({ title: 'Tarea 1' });
    expect(result.ok).toBe(true);
    expect(result.message).toContain('creada');
  });

  test('convierte los errores del dominio en mensajes', () => {
    const controller = new BoardController(new Board());
    const result = controller.createTask({ title: '' });
    expect(result).toEqual({ ok: false, message: 'La tarea debe tener un título.' });
  });
});
