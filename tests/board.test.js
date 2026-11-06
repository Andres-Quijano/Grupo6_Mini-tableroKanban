import { Board } from '../src/domain/Board.js';
import { EventBus } from '../src/notifier/EventBus.js';
import { EVENTS } from '../src/notifier/events.js';
import { DefinitionOfReadyPolicy } from '../src/policies/index.js';
import { PolicyViolationError, DomainError } from '../src/utils/errors.js';
import { completeChecklist, createReadyTask, recordEvents } from './helpers.js';

describe('Board', () => {
  let events;
  let board;
  beforeEach(() => {
    events = new EventBus();
    board = new Board({ events });
  });

  test('tiene las cuatro columnas del flujo en orden', () => {
    expect(board.columns.map((c) => c.name)).toEqual(['Por hacer', 'En curso', 'Revisión', 'Hecho']);
  });

  test('las tareas nuevas entran en "Por hacer"', () => {
    const task = board.createTask({ title: 'Tarea 1' });
    expect(board.findColumnOf(task.id).id).toBe('todo');
  });

  test('una tarea con la DoR completa avanza y puede regresar', () => {
    const task = createReadyTask(board);
    board.shiftTask(task.id, 1);
    expect(board.findColumnOf(task.id).id).toBe('doing');
    board.shiftTask(task.id, -1);
    expect(board.findColumnOf(task.id).id).toBe('todo');
  });

  test('flujo completo: Por hacer → Hecho cumpliendo DoR y DoD', () => {
    const task = createReadyTask(board);
    board.shiftTask(task.id, 1);
    board.shiftTask(task.id, 1);
    expect(() => board.shiftTask(task.id, 1)).toThrow('DoD');
    completeChecklist(task, 'dod');
    board.shiftTask(task.id, 1);
    expect(board.findColumnOf(task.id).id).toBe('done');
  });

  test('no permite saltar columnas', () => {
    const task = createReadyTask(board);
    expect(() => board.moveTask(task.id, 'review')).toThrow(PolicyViolationError);
  });

  test('no permite salir de los extremos del tablero', () => {
    const task = board.createTask({ title: 'Tarea 1' });
    expect(() => board.shiftTask(task.id, -1)).toThrow('no puede moverse');
  });

  test('bloquea el movimiento cuando la columna destino alcanzó su límite WIP', () => {
    board.setWipLimit('doing', 2);
    const tasks = [1, 2, 3].map((n) => createReadyTask(board, `Tarea ${n}`));
    board.shiftTask(tasks[0].id, 1);
    board.shiftTask(tasks[1].id, 1);

    expect(() => board.shiftTask(tasks[2].id, 1)).toThrow('límite WIP');
    expect(board.getColumn('doing').tasks).toHaveLength(2);
    expect(board.findColumnOf(tasks[2].id).id).toBe('todo');
  });

  test('actualiza y elimina tareas', () => {
    const task = board.createTask({ title: 'Tarea 1' });
    board.updateTask(task.id, { title: 'Tarea editada' });
    expect(board.findTask(task.id).title).toBe('Tarea editada');
    board.deleteTask(task.id);
    expect(() => board.findTask(task.id)).toThrow('No existe la tarea');
  });

  describe('límite WIP configurable', () => {
    test('acepta enteros positivos o Infinity', () => {
      board.setWipLimit('doing', 5);
      expect(board.getColumn('doing').wipLimit).toBe(5);
      board.setWipLimit('doing', Infinity);
      expect(board.getColumn('doing').hasWipLimit).toBe(false);
    });

    test.each([0, -1, 1.5, NaN])('rechaza el valor %p', (value) => {
      expect(() => board.setWipLimit('doing', value)).toThrow(DomainError);
    });

    test('no permite un límite menor que las tareas actuales', () => {
      createReadyTask(board);
      createReadyTask(board);
      board.tasks.forEach((t) => board.shiftTask(t.id, 1));
      expect(() => board.setWipLimit('doing', 1)).toThrow('no puede ser menor');
    });
  });

  describe('políticas intercambiables (Strategy)', () => {
    test('al quitar la política DoR se puede empezar sin checklist', () => {
      const task = board.createTask({ title: 'Sin DoR' });
      expect(() => board.shiftTask(task.id, 1)).toThrow('DoR');

      board.removePolicy(DefinitionOfReadyPolicy);
      board.shiftTask(task.id, 1);
      expect(board.findColumnOf(task.id).id).toBe('doing');
    });

    test('un tablero sin políticas no aplica restricciones', () => {
      const free = new Board({ policies: [] });
      const task = free.createTask({ title: 'Libre' });
      free.moveTask(task.id, 'done');
      expect(free.findColumnOf(task.id).id).toBe('done');
    });
  });

  describe('eventos publicados (Observer)', () => {
    test('cada operación anuncia su evento', () => {
      const published = recordEvents(events);
      const task = createReadyTask(board);
      board.updateTask(task.id, { priority: 'alta' });
      board.toggleChecklistItem(task.id, 'dod', 'tests');
      board.shiftTask(task.id, 1);
      board.setWipLimit('review', 4);
      board.deleteTask(task.id);

      expect(published).toEqual([
        EVENTS.TASK_CREATED,
        EVENTS.TASK_UPDATED,
        EVENTS.CHECKLIST_TOGGLED,
        EVENTS.TASK_MOVED,
        EVENTS.WIP_LIMIT_CHANGED,
        EVENTS.TASK_DELETED,
      ]);
    });

    test('un movimiento rechazado publica MOVE_REJECTED con la política y el motivo', () => {
      const rejections = [];
      events.subscribe(EVENTS.MOVE_REJECTED, ({ payload }) => rejections.push(payload));
      const task = board.createTask({ title: 'Sin DoR' });

      expect(() => board.shiftTask(task.id, 1)).toThrow();
      expect(rejections).toHaveLength(1);
      expect(rejections[0]).toMatchObject({ task, policy: 'Definición de Listo' });
      expect(rejections[0].reason).toMatch('DoR');
    });

    test('al llenar una columna se publica WIP_LIMIT_REACHED', () => {
      const published = recordEvents(events);
      board.setWipLimit('doing', 1);
      board.shiftTask(createReadyTask(board).id, 1);
      expect(published).toContain(EVENTS.WIP_LIMIT_REACHED);
    });

    test('un movimiento rechazado no publica TASK_MOVED', () => {
      const published = recordEvents(events);
      const task = board.createTask({ title: 'Sin DoR' });
      expect(() => board.shiftTask(task.id, 1)).toThrow();
      expect(published).not.toContain(EVENTS.TASK_MOVED);
    });
  });
});
