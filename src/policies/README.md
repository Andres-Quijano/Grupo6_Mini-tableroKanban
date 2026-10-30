# Políticas de negocio — patrón Strategy 

Módulo reservado. Aquí se implementarán las políticas intercambiables:

- `WipLimitPolicy`: impide superar el límite WIP de la columna destino (hoy está en `Column.hasCapacity()`).
- `DefinitionOfReadyPolicy`: exige el checklist DoR antes de pasar a "En curso".
- `DefinitionOfDonePolicy`: exige el checklist DoD antes de pasar a "Hecho".

Todas compartirán la interfaz `validate(task, from, to)`, de modo que se puedan agregar reglas nuevas sin modificar
el tablero.
