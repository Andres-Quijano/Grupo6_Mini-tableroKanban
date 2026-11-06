import { jest } from '@jest/globals';
import { EventBus, ANY_EVENT } from '../src/notifier/EventBus.js';

describe('EventBus (patrón Observer)', () => {
  test('notifica a los suscriptores del evento con nombre, datos y fecha', () => {
    const bus = new EventBus();
    const observer = jest.fn();
    bus.subscribe('task:moved', observer);

    bus.publish('task:moved', { id: 1 });

    expect(observer).toHaveBeenCalledTimes(1);
    expect(observer.mock.calls[0][0]).toMatchObject({ name: 'task:moved', payload: { id: 1 } });
    expect(observer.mock.calls[0][0].timestamp).toBeInstanceOf(Date);
  });

  test('no notifica a suscriptores de otros eventos', () => {
    const bus = new EventBus();
    const observer = jest.fn();
    bus.subscribe('task:created', observer);
    bus.publish('task:deleted');
    expect(observer).not.toHaveBeenCalled();
  });

  test('varios observadores reciben el mismo evento', () => {
    const bus = new EventBus();
    const a = jest.fn();
    const b = jest.fn();
    bus.subscribe('x', a);
    bus.subscribe('x', b);
    bus.publish('x');
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  test('un suscriptor a ANY_EVENT recibe todos los eventos', () => {
    const bus = new EventBus();
    const all = jest.fn();
    bus.subscribe(ANY_EVENT, all);
    bus.publish('a');
    bus.publish('b');
    expect(all.mock.calls.map(([e]) => e.name)).toEqual(['a', 'b']);
  });

  test('la función devuelta por subscribe cancela la suscripción', () => {
    const bus = new EventBus();
    const observer = jest.fn();
    const unsubscribe = bus.subscribe('x', observer);
    unsubscribe();
    bus.publish('x');
    expect(observer).not.toHaveBeenCalled();
    expect(bus.subscriberCount('x')).toBe(0);
  });

  test('si un suscriptor falla, los demás siguen recibiendo el evento', () => {
    const onError = jest.fn();
    const bus = new EventBus({ onError });
    const healthy = jest.fn();
    bus.subscribe('x', () => {
      throw new Error('falla');
    });
    bus.subscribe('x', healthy);

    bus.publish('x');

    expect(healthy).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.objectContaining({ name: 'x' }));
  });

  test('rechaza suscriptores que no son funciones', () => {
    expect(() => new EventBus().subscribe('x', 'no-funcion')).toThrow(TypeError);
  });
});
