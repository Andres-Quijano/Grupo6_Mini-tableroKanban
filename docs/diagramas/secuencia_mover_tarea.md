# Diagrama de secuencia — Mover una tarea

Muestra cómo colaboran los dos patrones cuando el usuario pulsa → en una tarjeta:
Strategy decide si el movimiento se permite y Observer avisa a la interfaz del resultado.

```mermaid
sequenceDiagram
    actor U as Usuario
    participant V as BoardView
    participant C as BoardController
    participant B as Board
    participant P as Políticas (MovePolicy[])
    participant E as EventBus
    participant N as NotificationPanel

    U->>V: clic en "→"
    V->>C: moveTask(id, +1)
    C->>B: shiftTask(id, +1)
    B->>B: moveTask(id, columnaSiguiente)

    loop por cada política
        B->>P: validate({task, from, to, board})
        P-->>B: null (permitido) o motivo
    end

    alt todas permiten
        B->>B: from.remove(task) / to.add(task)
        B->>E: publish("task:moved")
        E-->>V: notifica → render()
        E-->>N: notifica → "#id pasó de A a B"
        opt la columna destino quedó llena
            B->>E: publish("wip:reached")
            E-->>N: notifica → advertencia
        end
        B-->>C: task
        C-->>V: { ok: true }
    else una política rechaza
        B->>E: publish("move:rejected", {policy, reason})
        E-->>N: notifica → "Bloqueado [política]: motivo"
        B-->>C: lanza PolicyViolationError
        C-->>V: { ok: false, notified: true }
    end
```
