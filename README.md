# MIni-tableroKanban

Sistema web de gestión de tareas ágiles basado en un mini-tablero Kanban y patrones de diseño.


**Grupo 6** · Proyecto académico de la asignatura **Patrones de Diseño / Construcción de Software** — Universidad Manuela Beltrán, Ingeniería de Software.

---

## 1. Descripción

KanbanFlow es una aplicación web sencilla que representa un mini-tablero Kanban de cuatro columnas
(**Por hacer → En curso → Revisión → Hecho**). Permite a un equipo ágil pequeño visualizar su flujo de trabajo,
controlar el trabajo en progreso mediante **límites WIP** y, en entregas posteriores, garantizar la calidad con
**Definición de Listo (DoR)** y **Definición de Hecho (DoD)**.

## 2. Objetivo

Desarrollar una aplicación web de mini-tablero Kanban que permita gestionar el ciclo de vida de las tareas de un
equipo ágil, aplicando las reglas de Kanban y Scrum (límites WIP, DoR y DoD) mediante los patrones
**Observer**, **Command** y **Strategy**, para obtener un código mantenible, extensible y fácil de probar.

## 3. Problema que busca resolver

Los equipos pequeños que trabajan con metodologías ágiles suelen:

- Perder **visibilidad** del estado real de sus tareas.
- **Sobrecargarse** iniciando más trabajo del que pueden terminar.
- Dar por terminadas tareas **incompletas**, sin criterios de calidad acordados.

KanbanFlow ataca estos problemas mostrando el flujo en un tablero, bloqueando movimientos que superen el límite WIP
y (en próximas entregas) exigiendo checklists de DoR/DoD antes de iniciar o cerrar una tarea.

## 4. Integrantes del equipo

| Integrante | Rol | Usuario GitHub |
|---|---|---|
| Andrés Felipe Quijano Niño | Desarrollador · Scrum Master | [@Andres-Quijano](https://github.com/Andres-Quijano) |

> Si el equipo tiene más integrantes, agréguelos en esta tabla.

## 5. Tecnologías seleccionadas

| Tecnología | Uso |
|---|---|
| HTML5 + CSS3 | Interfaz del tablero |
| JavaScript (ES6+, módulos ES) | Lógica de dominio, controlador y vista |
| Node.js (≥ 18) | Servidor local de desarrollo y ejecución de pruebas |
| Jest | Pruebas unitarias del núcleo del dominio |
| Git + GitHub | Control de versiones y trabajo colaborativo |
| VS Code | Editor de código |
| UML | Diagramas de diseño (siguientes entregas) |

## 6. Estructura del repositorio

```
KanbanFlow/
│
├── docs/
│   ├── descripcion_proyecto.md   # Aproximación técnica: módulos, responsabilidades, organización
│   └── evidencias/               # Capturas de pantalla de la entrega
│
├── src/
│   ├── index.html                # Página principal del tablero
│   ├── main.js                   # Punto de entrada de la aplicación
│   ├── styles.css                # Estilos del tablero
│   ├── domain/                   # Núcleo del dominio (Tarea, Columna, Tablero)
│   ├── controller/               # Controlador: recibe acciones de la vista
│   ├── ui/                       # Vista web: dibuja el tablero
│   ├── notifier/                 # Notificador (Observer) — entrega 2
│   └── policies/                 # Políticas de negocio (Strategy) — entrega 2
│
├── tests/
│   ├── README.md                 # Cómo se organizan y ejecutan las pruebas
│   └── board.test.js             # Pruebas unitarias del dominio
│
├── scripts/
│   └── server.js                 # Servidor estático local (sin dependencias)
│
├── package.json
├── README.md
└── .gitignore
```

## 7. Instrucciones para ejecutar el proyecto

**Requisitos:** [Node.js](https://nodejs.org/) 18 o superior y Git.

```bash
git clone https://github.com/Andres-Quijano/Grupo6_Mini-tableroKanban.git
cd Grupo6_Mini-tableroKanban
npm install
```

**Ejecutar la aplicación:**

```bash
npm start
```

Abrir `http://localhost:3000` en el navegador. Se carga un tablero con tareas de ejemplo; se pueden crear tareas
nuevas y moverlas entre columnas con los botones `←` y `→`. Si una columna alcanza su límite WIP, el movimiento se
bloquea y aparece una alerta.

**Ejecutar las pruebas unitarias:**

```bash
npm test
```

## 8. Estado actual (Entrega 1)

- [x] Repositorio, estructura de carpetas y documentación inicial.
- [x] Modelo de dominio: `Task`, `Column`, `Board`.
- [x] Funcionalidad básica: crear tareas, moverlas entre columnas y validar el límite WIP.
- [x] Vista web mínima y pruebas unitarias del núcleo.
- [ ] Patrón **Command** (acciones + deshacer/rehacer) — entrega 2.
- [ ] Patrón **Observer** (notificaciones en tiempo real) — entrega 2.
- [ ] Patrón **Strategy** (políticas WIP, DoR y DoD intercambiables) — entrega 2/3.

Más detalle técnico en [`docs/descripcion_proyecto.md`](docs/descripcion_proyecto.md).
