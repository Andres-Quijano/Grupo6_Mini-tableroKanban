import { MovePolicy } from './MovePolicy.js';

/**
 * Estrategia: la columna destino no puede superar su límite WIP.
 * Aplica tanto a tareas nuevas como a tareas que se mueven.
 */
export class WipLimitPolicy extends MovePolicy {
  get name() {
    return 'Límite WIP';
  }

  validate({ to }) {
    if (to.hasCapacity()) return null;
    return `"${to.name}" alcanzó su límite WIP (${to.wipLimit}).`;
  }
}
