# Notificador — patrón Observer

Módulo reservado. Aquí se implementará:

- `EventBus` / `Subject`: registra suscriptores y publica eventos.
- Eventos previstos: `task:created`, `task:moved`, `task:deleted`, `wip:exceeded`.
- Suscriptores: la vista del tablero y el panel de alertas.

Objetivo: que el dominio (`Board`) avise de los cambios sin conocer a la vista.
