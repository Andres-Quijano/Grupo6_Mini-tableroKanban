import { AdjacentColumnPolicy } from './AdjacentColumnPolicy.js';
import { WipLimitPolicy } from './WipLimitPolicy.js';
import { DefinitionOfReadyPolicy, DefinitionOfDonePolicy } from './ChecklistPolicy.js';

export { MovePolicy } from './MovePolicy.js';
export { AdjacentColumnPolicy, WipLimitPolicy, DefinitionOfReadyPolicy, DefinitionOfDonePolicy };

/** Conjunto de políticas que usa el tablero si no se le indica otro. */
export function createDefaultPolicies() {
  return [
    new AdjacentColumnPolicy(),
    new WipLimitPolicy(),
    new DefinitionOfReadyPolicy(),
    new DefinitionOfDonePolicy(),
  ];
}
