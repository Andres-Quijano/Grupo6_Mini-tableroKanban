import { Task } from '../src/domain/Task.js';
import { DomainError } from '../src/utils/errors.js';

describe('Task', () => {
  test('crea una tarea con valores por defecto', () => {
    const task = new Task({ title: '  Revisar backlog  ' });
    expect(task.title).toBe('Revisar backlog');
    expect(task.priority).toBe('media');
    expect(task.assignee).toBe('sin asignar');
  });

  test('rechaza una tarea sin título con un DomainError', () => {
    expect(() => new Task({ title: '   ' })).toThrow(DomainError);
    expect(() => new Task({})).toThrow('título');
  });

  test('rechaza títulos de más de 80 caracteres', () => {
    expect(() => new Task({ title: 'x'.repeat(81) })).toThrow('80 caracteres');
  });

  test('rechaza una prioridad inválida', () => {
    expect(() => new Task({ title: 'X', priority: 'urgente' })).toThrow('Prioridad inválida');
  });

  test('update cambia solo los campos enviados', () => {
    const task = new Task({ title: 'Original', assignee: 'usuario_01' });
    task.update({ title: 'Nuevo', priority: 'alta' });
    expect(task).toMatchObject({ title: 'Nuevo', priority: 'alta', assignee: 'usuario_01' });
  });

  test('update no deja la tarea a medio cambiar si un dato es inválido', () => {
    const task = new Task({ title: 'Original' });
    expect(() => task.update({ title: 'Nuevo', priority: 'urgente' })).toThrow();
    expect(task.title).toBe('Original');
  });
});

describe('Task · checklists DoR y DoD', () => {
  test('una tarea nueva tiene ambos checklists sin marcar', () => {
    const task = new Task({ title: 'X' });
    expect(task.isChecklistComplete('dor')).toBe(false);
    expect(task.pendingChecklistItems('dod')).toHaveLength(3);
  });

  test('marcar y desmarcar un ítem', () => {
    const task = new Task({ title: 'X' });
    expect(task.toggleChecklistItem('dor', 'assignee').done).toBe(true);
    expect(task.pendingChecklistItems('dor')).toHaveLength(2);
    expect(task.toggleChecklistItem('dor', 'assignee').done).toBe(false);
  });

  test('cada tarea tiene su propia copia del checklist', () => {
    const a = new Task({ title: 'A' });
    const b = new Task({ title: 'B' });
    a.toggleChecklistItem('dod', 'tests');
    expect(b.isChecklistComplete('dod')).toBe(false);
    expect(b.pendingChecklistItems('dod')).toHaveLength(3);
  });

  test('rechaza checklists o ítems desconocidos', () => {
    const task = new Task({ title: 'X' });
    expect(() => task.toggleChecklistItem('qa', 'x')).toThrow('Checklist desconocido');
    expect(() => task.toggleChecklistItem('dor', 'nope')).toThrow('no existe');
  });
});

