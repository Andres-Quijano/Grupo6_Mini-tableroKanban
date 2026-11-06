/**
 * EventBus — sujeto del patrón Observer.
 *
 * Responsabilidad: llevar la lista de suscriptores (observadores) de cada evento
 * y avisarles cuando ese evento se publica. Quien publica (el tablero) no sabe
 * quién escucha, y quien escucha (vista, panel de notificaciones) no sabe quién
 * publicó: ambos solo conocen el EventBus.
 *
 * Cada suscriptor recibe un objeto { name, payload, timestamp }.
 * Suscribirse a ANY_EVENT ('*') permite escuchar todos los eventos.
 */
export const ANY_EVENT = '*';

export class EventBus {
  /** @type {Map<string, Set<Function>>} */
  #subscribers = new Map();
  #onError;

  /**
   * @param {object}   [options]
   * @param {Function} [options.onError] Qué hacer si un suscriptor falla.
   *                                     Por defecto se registra en consola.
   */
  constructor({ onError = (error, event) => console.error(`Error en un suscriptor de "${event.name}":`, error) } = {}) {
    this.#onError = onError;
  }

  /**
   * Registra un observador.
   * @returns {Function} función que cancela la suscripción.
   */
  subscribe(eventName, handler) {
    if (typeof handler !== 'function') {
      throw new TypeError('El suscriptor debe ser una función.');
    }
    if (!this.#subscribers.has(eventName)) this.#subscribers.set(eventName, new Set());
    this.#subscribers.get(eventName).add(handler);
    return () => this.unsubscribe(eventName, handler);
  }

  unsubscribe(eventName, handler) {
    this.#subscribers.get(eventName)?.delete(handler);
  }

  /** Notifica a los suscriptores del evento y a los de ANY_EVENT. */
  publish(eventName, payload = {}) {
    const event = { name: eventName, payload, timestamp: new Date() };
    const handlers = [...this.#handlersOf(eventName), ...this.#handlersOf(ANY_EVENT)];

    for (const handler of handlers) {
      // Un suscriptor que falla no debe impedir que los demás reciban el evento.
      try {
        handler(event);
      } catch (error) {
        this.#onError(error, event);
      }
    }
    return event;
  }

  subscriberCount(eventName) {
    return this.#handlersOf(eventName).length;
  }

  #handlersOf(eventName) {
    return [...(this.#subscribers.get(eventName) ?? [])];
  }
}
