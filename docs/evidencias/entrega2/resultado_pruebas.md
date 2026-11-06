# Resultado de las pruebas — Entrega 2

Generado con `npm run test:coverage -- --verbose` el 2026-11-06 (Node.js v24.19.0, Jest 29).

**Resumen:** 6 suites, 60 pruebas, todas aprobadas.

La cobertura se mide sobre la lógica (`src/` sin `src/ui/` ni `main.js`, que dependen del navegador y se verificaron manualmente; ver `verificacion_manual.md`).

```text
PASS tests/eventBus.test.js
  EventBus (patrón Observer)
    √ notifica a los suscriptores del evento con nombre, datos y fecha (30 ms)
    √ no notifica a suscriptores de otros eventos (1 ms)
    √ varios observadores reciben el mismo evento (1 ms)
    √ un suscriptor a ANY_EVENT recibe todos los eventos (1 ms)
    √ la función devuelta por subscribe cancela la suscripción (1 ms)
    √ si un suscriptor falla, los demás siguen recibiendo el evento (2 ms)
    √ rechaza suscriptores que no son funciones (27 ms)

PASS tests/task.test.js
  Task
    √ crea una tarea con valores por defecto (27 ms)
    √ rechaza una tarea sin título con un DomainError (33 ms)
    √ rechaza títulos de más de 80 caracteres (1 ms)
    √ rechaza una prioridad inválida (2 ms)
    √ update cambia solo los campos enviados (2 ms)
    √ update no deja la tarea a medio cambiar si un dato es inválido (2 ms)
  Task · checklists DoR y DoD
    √ una tarea nueva tiene ambos checklists sin marcar (2 ms)
    √ marcar y desmarcar un ítem (1 ms)
    √ cada tarea tiene su propia copia del checklist (2 ms)
    √ rechaza checklists o ítems desconocidos (3 ms)

PASS tests/utils.test.js
  escapeHtml
    √ neutraliza etiquetas y comillas (26 ms)
    √ convierte valores que no son texto (1 ms)
  loadSampleTasks
    √ carga los datos de ejemplo respetando todas las políticas (6 ms)

PASS tests/controller.test.js
  BoardController
    √ devuelve ok=true y el valor cuando la acción tiene éxito (23 ms)
    √ un dato inválido se devuelve como mensaje no notificado (2 ms)
    √ un rechazo de política se marca como ya notificado (2 ms)
    √ setWipLimit convierte el texto del campo; vacío = sin límite (2 ms)
    √ updateTask, toggleChecklistItem y deleteTask delegan en el tablero (5 ms)
    √ los errores de programación no se ocultan (36 ms)

PASS tests/policies.test.js
  Políticas de movimiento (patrón Strategy)
    √ todas las estrategias comparten la interfaz validate() (29 ms)
    √ MovePolicy sin implementar validate() avisa del error (37 ms)
    √ se puede crear una política nueva sin modificar el tablero (11 ms)
    AdjacentColumnPolicy
      √ permite mover a la columna vecina (4 ms)
      √ rechaza saltar columnas (1 ms)
      √ no aplica a tareas nuevas (1 ms)
    WipLimitPolicy
      √ permite entrar si hay capacidad (1 ms)
      √ rechaza si la columna destino está llena
    DefinitionOfReadyPolicy
      √ rechaza empezar una tarea con la DoR incompleta y dice qué falta (1 ms)
      √ permite empezar cuando la DoR está completa
      √ no se exige al devolver una tarea a "En curso" (2 ms)
      √ no aplica a otras columnas (1 ms)
    DefinitionOfDonePolicy
      √ rechaza cerrar una tarea con la DoD incompleta
      √ permite cerrar cuando la DoD está completa

PASS tests/board.test.js
  Board
    √ tiene las cuatro columnas del flujo en orden (26 ms)
    √ las tareas nuevas entran en "Por hacer" (4 ms)
    √ una tarea con la DoR completa avanza y puede regresar (6 ms)
    √ flujo completo: Por hacer → Hecho cumpliendo DoR y DoD (51 ms)
    √ no permite saltar columnas (3 ms)
    √ no permite salir de los extremos del tablero (1 ms)
    √ bloquea el movimiento cuando la columna destino alcanzó su límite WIP (2 ms)
    √ actualiza y elimina tareas (1 ms)
    límite WIP configurable
      √ acepta enteros positivos o Infinity
      √ rechaza el valor 0 (3 ms)
      √ rechaza el valor -1 (1 ms)
      √ rechaza el valor 1.5
      √ rechaza el valor NaN (1 ms)
      √ no permite un límite menor que las tareas actuales (1 ms)
    políticas intercambiables (Strategy)
      √ al quitar la política DoR se puede empezar sin checklist (1 ms)
      √ un tablero sin políticas no aplica restricciones
    eventos publicados (Observer)
      √ cada operación anuncia su evento (1 ms)
      √ un movimiento rechazado publica MOVE_REJECTED con la política y el motivo (1 ms)
      √ al llenar una columna se publica WIP_LIMIT_REACHED (1 ms)
      √ un movimiento rechazado no publica TASK_MOVED (1 ms)

--------------------------|---------|----------|---------|---------|-------------------
File                      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------------------|---------|----------|---------|---------|-------------------
All files                 |   96.84 |    91.95 |    97.5 |   98.89 |                   
 controller               |     100 |      100 |     100 |     100 |                   
  BoardController.js      |     100 |      100 |     100 |     100 |                   
 data                     |     100 |      100 |     100 |     100 |                   
  sampleTasks.js          |     100 |      100 |     100 |     100 |                   
 domain                   |   95.55 |    87.93 |   97.56 |   99.09 |                   
  Board.js                |   95.83 |    92.85 |      95 |   98.41 | 67                
  Column.js               |   92.85 |    33.33 |     100 |     100 | 13-36             
  Task.js                 |   95.55 |    88.88 |     100 |     100 | 39-40,84          
  checklists.js           |     100 |      100 |     100 |     100 |                   
 notifier                 |   95.45 |      100 |   85.71 |      95 |                   
  EventBus.js             |   95.23 |      100 |   85.71 |   94.73 | 24                
  events.js               |     100 |      100 |     100 |     100 |                   
 policies                 |     100 |      100 |     100 |     100 |                   
  AdjacentColumnPolicy.js |     100 |      100 |     100 |     100 |                   
  ChecklistPolicy.js      |     100 |      100 |     100 |     100 |                   
  MovePolicy.js           |     100 |      100 |     100 |     100 |                   
  WipLimitPolicy.js       |     100 |      100 |     100 |     100 |                   
  index.js                |     100 |      100 |     100 |     100 |                   
 utils                    |     100 |      100 |     100 |     100 |                   
  errors.js               |     100 |      100 |     100 |     100 |                   
  escapeHtml.js           |     100 |      100 |     100 |     100 |                   
--------------------------|---------|----------|---------|---------|-------------------
Test Suites: 6 passed, 6 total
Tests:       60 passed, 60 total
Snapshots:   0 total
Time:        3.085 s
Ran all test suites.
```
