/**
 * Errores propios de la aplicación.
 *
 * Distinguir el tipo de error permite al controlador y a la vista reaccionar
 * distinto: un dato inválido se muestra en el formulario, mientras que una
 * regla de negocio rechazada ya la anuncia el Notificador.
 */

/** Dato inválido o recurso inexistente (título vacío, tarea que no existe…). */
export class DomainError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DomainError';
  }
}

/** Una política de negocio (Strategy) rechazó un movimiento. */
export class PolicyViolationError extends DomainError {
  /**
   * @param {string} message    Motivo del rechazo.
   * @param {string} policyName Nombre de la política que lo rechazó.
   */
  constructor(message, policyName) {
    super(message);
    this.name = 'PolicyViolationError';
    this.policyName = policyName;
  }
}
