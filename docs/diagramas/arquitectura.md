# Diagrama de arquitectura

Arquitectura por capas. Las flechas continuas son llamadas directas; las punteadas, eventos del patrón Observer.

```mermaid
flowchart LR
    U([Usuario])

    subgraph UI["Vista web — src/ui/"]
        F[TaskForm]
        V[BoardView]
        N[NotificationPanel]
    end

    subgraph C["Controlador — src/controller/"]
        BC[BoardController]
    end

    subgraph D["Dominio — src/domain/"]
        B[Board]
        T[Task]
        COL[Column]
    end

    subgraph P["Políticas — src/policies/ (Strategy)"]
        MP{{MovePolicy}}
        A[AdjacentColumnPolicy]
        W[WipLimitPolicy]
        R[DefinitionOfReadyPolicy]
        DN[DefinitionOfDonePolicy]
    end

    subgraph O["Notificador — src/notifier/ (Observer)"]
        EB[(EventBus)]
    end

    U -->|clic / formulario| F & V
    F & V -->|acción| BC
    BC -->|ejecuta| B
    B --- T & COL
    B -->|valida| MP
    MP --- A & W & R & DN
    B -->|publica| EB
    EB -.->|notifica| V
    EB -.->|notifica| N
```

| Capa | Depende de | No depende de |
|---|---|---|
| Vista | Controlador, EventBus | Políticas |
| Controlador | Dominio | Vista |
| Dominio | Políticas, EventBus | Vista, Controlador |
| Políticas | Dominio (solo lectura) | Vista, EventBus |
