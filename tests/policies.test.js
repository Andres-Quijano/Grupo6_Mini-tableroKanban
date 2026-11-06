import { Board } from '../src/domain/Board.js';
import {
  MovePolicy,
  AdjacentColumnPolicy,
  WipLimitPolicy,
  DefinitionOfReadyPolicy,
  DefinitionOfDonePolicy,
  createDefaultPolicies,
} from '../src/policies/index.js';
import { completeChecklist } from './helpers.js';

/** Construye el contexto que recibe validate() a partir de ids de columna. */
function contextFor(board, task, fromId, toId) {
  return { task, from: fromId ? board.getColumn(fromId) : null, to: board.getColumn(toId), board };
}

describe('Políticas de movimiento (patrón Strategy)', () => {
  let board;
  let task;
  beforeEach(() => {
    board = new Board({ policies: [] }); // sin políticas: se prueban una por una
    task = board.createTask({ title: 'Tarea' });
  });

  test('todas las estrategias comparten la interfaz validate()', () => {
    for (const policy of createDefaultPolicies()) {
      expect(policy).toBeInstanceOf(MovePolicy);
      expect(typeof policy.validate).toBe('function');
      expect(policy.name).toEqual(expect.any(String));
    }
  });

  test('MovePolicy sin implementar validate() avisa del error', () => {
    expect(() => new MovePolicy().validate({})).toThrow('debe implementar validate()');
  });

  describe('AdjacentColumnPolicy', () => {
    const policy = new AdjacentColumnPolicy();

    test('permite mover a la columna vecina', () => {
      expect(policy.validate(contextFor(board, task, 'todo', 'doing'))).toBeNull();
    });

    test('rechaza saltar columnas', () => {
      expect(policy.validate(contextFor(board, task, 'todo', 'done'))).toMatch('columna vecina');
    });

    test('no aplica a tareas nuevas', () => {
      expect(policy.validate(contextFor(board, task, null, 'todo'))).toBeNull();
    });
  });

  describe('WipLimitPolicy', () => {
    const policy = new WipLimitPolicy();

    test('permite entrar si hay capacidad', () => {
      expect(policy.validate(contextFor(board, task, 'todo', 'doing'))).toBeNull();
    });

    test('rechaza si la columna destino está llena', () => {
      board.getColumn('doing').wipLimit = 0;
      expect(policy.validate(contextFor(board, task, 'todo', 'doing'))).toMatch('límite WIP');
    });
  });

  describe('DefinitionOfReadyPolicy', () => {
    const policy = new DefinitionOfReadyPolicy();

    test('rechaza empezar una tarea con la DoR incompleta y dice qué falta', () => {
      task.toggleChecklistItem('dor', 'assignee');
      const reason = policy.validate(contextFor(board, task, 'todo', 'doing'));
      expect(reason).toMatch('DoR');
      expect(reason).toMatch('descripción clara');
      expect(reason).not.toMatch('responsable asignado');
    });

    test('permite empezar cuando la DoR está completa', () => {
      completeChecklist(task, 'dor');
      expect(policy.validate(contextFor(board, task, 'todo', 'doing'))).toBeNull();
    });

    test('no se exige al devolver una tarea a "En curso"', () => {
      expect(policy.validate(contextFor(board, task, 'review', 'doing'))).toBeNull();
    });

    test('no aplica a otras columnas', () => {
      expect(policy.validate(contextFor(board, task, 'doing', 'review'))).toBeNull();
    });
  });

  describe('DefinitionOfDonePolicy', () => {
    const policy = new DefinitionOfDonePolicy();

    test('rechaza cerrar una tarea con la DoD incompleta', () => {
      expect(policy.validate(contextFor(board, task, 'review', 'done'))).toMatch('DoD');
    });

    test('permite cerrar cuando la DoD está completa', () => {
      completeChecklist(task, 'dod');
      expect(policy.validate(contextFor(board, task, 'review', 'done'))).toBeNull();
    });
  });

  test('se puede crear una política nueva sin modificar el tablero', () => {
    class HighPriorityFirstPolicy extends MovePolicy {
      validate({ task: t, to }) {
        return to.id === 'doing' && t.priority !== 'alta' ? 'Solo se inician tareas de prioridad alta.' : null;
      }
    }
    const strictBoard = new Board({ policies: [new HighPriorityFirstPolicy()] });
    const low = strictBoard.createTask({ title: 'Baja', priority: 'baja' });
    const high = strictBoard.createTask({ title: 'Alta', priority: 'alta' });

    expect(() => strictBoard.shiftTask(low.id, 1)).toThrow('prioridad alta');
    expect(strictBoard.shiftTask(high.id, 1)).toBe(high);
  });
});
