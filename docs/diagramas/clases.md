# Diagrama de clases

```mermaid
classDiagram
    direction LR

    class Board {
        +columns: Column[]
        +policies: MovePolicy[]
        +events: EventBus
        +createTask(data) Task
        +updateTask(taskId, data) Task
        +deleteTask(taskId) Task
        +moveTask(taskId, columnId) Task
        +shiftTask(taskId, step) Task
        +toggleChecklistItem(taskId, type, itemId)
        +setWipLimit(columnId, limit) Column
        +addPolicy(policy)
        +removePolicy(PolicyClass)
        -enforcePolicies(context)
        -announceIfFull(column)
    }

    class Column {
        +id: string
        +name: string
        +wipLimit: number
        +tasks: Task[]
        +hasWipLimit: boolean
        +hasCapacity() boolean
        +add(task)
        +remove(taskId) Task
    }

    class Task {
        +id: number
        +title: string
        +description: string
        +assignee: string
        +priority: string
        +checklists: object
        +update(data)
        +toggleChecklistItem(type, itemId)
        +pendingChecklistItems(type)
        +isChecklistComplete(type) boolean
    }

    class EventBus {
        +subscribe(eventName, handler) Function
        +unsubscribe(eventName, handler)
        +publish(eventName, payload)
    }

    class MovePolicy {
        <<interface>>
        +name: string
        +validate(context) string
    }
    class AdjacentColumnPolicy
    class WipLimitPolicy
    class ChecklistPolicy
    class DefinitionOfReadyPolicy
    class DefinitionOfDonePolicy

    class BoardController {
        +createTask(formData)
        +updateTask(taskId, formData)
        +deleteTask(taskId)
        +moveTask(taskId, step)
        +toggleChecklistItem(taskId, type, itemId)
        +setWipLimit(columnId, rawValue)
    }

    class BoardView {
        +render()
    }
    class TaskForm {
        +edit(task)
        +reset()
    }
    class NotificationPanel {
        +push(type, text)
    }

    class DomainError
    class PolicyViolationError {
        +policyName: string
    }

    Board "1" *-- "4" Column
    Column "1" o-- "0..*" Task
    Board o-- "0..*" MovePolicy
    Board --> EventBus : publica
    MovePolicy <|-- AdjacentColumnPolicy
    MovePolicy <|-- WipLimitPolicy
    MovePolicy <|-- ChecklistPolicy
    ChecklistPolicy <|-- DefinitionOfReadyPolicy
    ChecklistPolicy <|-- DefinitionOfDonePolicy
    BoardController --> Board
    BoardView --> BoardController
    TaskForm --> BoardController
    BoardView ..> EventBus : observa
    NotificationPanel ..> EventBus : observa
    DomainError <|-- PolicyViolationError
    Board ..> PolicyViolationError : lanza
```
