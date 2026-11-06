import { MovePolicy } from './MovePolicy.js';

/**
 * Estrategia: una tarea solo avanza o retrocede a la columna vecina,
 * así no se salta etapas del flujo (por ejemplo, de "Por hacer" a "Hecho").
 */
export class AdjacentColumnPolicy extends MovePolicy {
  get name() {
    return 'Columnas vecinas';
  }

  validate({ from, to, board }) {
    if (!from) return null; // tarea nueva: no viene de ninguna columna
    const distance = Math.abs(board.columns.indexOf(to) - board.columns.indexOf(from));
    if (distance === 1) return null;
    return `Solo se puede mover a una columna vecina de "${from.name}".`;
  }
}
